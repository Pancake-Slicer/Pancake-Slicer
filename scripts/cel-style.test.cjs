const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const context=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={NS,Ji,$w,Ne,pcRebuiltMaterials,pcRebuiltDesigns};',context);
const a=context.api;
test('actual office shader hooks band sunlight while retaining shadow evaluation and facade maps',()=>{
 for(const d of a.pcRebuiltDesigns.entries){
  const m=a.pcRebuiltMaterials(d).facade,map=m.map,bump=m.bumpMap,rough=m.roughnessMap;
  const shader={fragmentShader:'#include <lights_physical_pars_fragment>\n#include <lights_fragment_begin>\n#include <lights_fragment_end>'};
  m.onBeforeCompile(shader);
  assert.ok(shader.fragmentShader.includes('float pcSun = dot( geometryNormal, directLight.direction )'));
  assert.ok(!shader.fragmentShader.includes('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );'));
  assert.ok(shader.fragmentShader.includes('#include <lights_fragment_begin>'),'Keep the engine shadow/light evaluation');
  assert.ok(shader.fragmentShader.includes('pcSun <= 0.0 ? 0.0'),'Back faces must not receive direct sunlight');
  assert.equal(m.map,map);assert.equal(m.bumpMap,bump);assert.equal(m.roughnessMap,rough);assert.equal(m.transparent,false);
 }
});
test('comic finishing stays inside the existing FXAA pass and ink uses screen pixels',()=>{
 assert.ok(a.NS.fragmentShader.includes('pcComicFinish(pcAA.rgb,vUv,tDiffuse,resolution.xy)'));
 assert.ok(a.NS.fragmentShader.includes('ApplyFXAA(tDiffuse,resolution.xy,vUv)'));
 assert.ok(!a.NS.fragmentShader.includes('time'),'No camera/time-dependent noise or temporal blending');
 const ink=a.$w(),shader={uniforms:{},vertexShader:'#include <project_vertex>'};ink.onBeforeCompile(shader);
 assert.equal(shader.uniforms.inkWidth.value,1.9);assert.ok(shader.vertexShader.includes('/inkViewport*gl_Position.w'));
 const toon=a.Ji();assert.deepEqual(Array.from(toon.gradientMap.image.data),[31,112,255]);
});
