const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const context=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={NS,Ji,$w,Ne,pcRebuiltMaterials,pcRebuiltDesigns,pS,Se,zb,qb};',context);
const a=context.api;
test('illustrated office shader gently groups sunlight while retaining shadows and facade maps',()=>{
 for(const d of a.pcRebuiltDesigns.entries){
  const m=a.pcRebuiltMaterials(d).facade,map=m.map,bump=m.bumpMap,rough=m.roughnessMap;
  const shader={fragmentShader:'#include <lights_physical_pars_fragment>\n#include <lights_fragment_begin>\n#include <lights_fragment_end>'};
  m.onBeforeCompile(shader);
  assert.ok(shader.fragmentShader.includes('float pcSun = dot( geometryNormal, directLight.direction )'));
  assert.ok(!shader.fragmentShader.includes('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );'));
  assert.ok(shader.fragmentShader.includes('#include <lights_fragment_begin>'),'Keep the engine shadow/light evaluation');
  assert.ok(shader.fragmentShader.includes('pcSun <= 0.0 ? 0.0'),'Back faces must not receive direct sunlight');
  assert.ok(shader.fragmentShader.includes('smoothstep(0.25,0.39,pcDay)'),'Lighting bands should have softened transitions');
  assert.equal(m.map,map);assert.equal(m.bumpMap,bump);assert.equal(m.roughnessMap,rough);assert.equal(m.transparent,false);
 }
});

test('architectural creases batch per chunk, stay cached, and do not intercept building picking',()=>{
 const n=new a.zb,points=[{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];n.addBatch(points.map((p,i)=>[p,points[(i+1)%4]]));
 const zoning=new a.qb(n,{items:[]});zoning.setPropertyZone('offices');zoning.applyProperties(zoning.properties,'offices');
 const scene=new a.Se,renderer=a.pS(scene);renderer.render(zoning);const lines=[];scene.traverse(o=>{if(o.name==='Illustrated architectural creases')lines.push(o);});
 assert.ok(lines.length>0&&lines.length<=renderer.info().totalChunks,'Use one line batch per neighborhood chunk');
 for(const line of lines){const hits=[];line.raycast(null,hits);assert.equal(hits.length,0);assert.ok(line.geometry.attributes.position.count>0);}
 renderer.updateLOD({position:{x:200,y:350,z:200}});assert.equal(renderer.render(zoning),false);
 const after=[];scene.traverse(o=>{if(o.name==='Illustrated architectural creases')after.push(o);});assert.deepEqual(after,lines);
});
test('illustrated finish retains FXAA and fine screen-pixel ink without posterisation',()=>{
 assert.ok(a.NS.fragmentShader.includes('pcComicFinish(pcAA.rgb,vUv,tDiffuse,resolution.xy)'));
 assert.ok(a.NS.fragmentShader.includes('ApplyFXAA(tDiffuse,resolution.xy,vUv)'));
 assert.ok(!a.NS.fragmentShader.includes('time'),'No camera/time-dependent noise or temporal blending');
 const ink=a.$w(),shader={uniforms:{},vertexShader:'#include <project_vertex>'};ink.onBeforeCompile(shader);
 assert.equal(shader.uniforms.inkWidth.value,.75);assert.ok(shader.vertexShader.includes('/inkViewport*gl_Position.w'));
 assert.ok(!a.NS.fragmentShader.includes('floor(clamp(light'),'Remove the rejected luminance posterisation');
 assert.ok(a.NS.fragmentShader.includes('vec3 pencil=painted*'),'Edges should retain local colour, rather than turn black');
 const toon=a.Ji();assert.deepEqual(Array.from(toon.gradientMap.image.data),[107,184,255]);
});
