const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const current = fs.readFileSync(path.join(root, 'web/assets/game.bundle.js'), 'utf8');
const original = fs.readFileSync(path.join(root, 'original/Pancake (52).html'), 'utf8');
const baseline = original.match(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/i)[1];
function load(source) {
  const context = vm.createContext({ console, performance, structuredClone, document: { createElement: () => ({ relList: { supports: () => true }, getContext: () => ({fillRect(){}}) }) } });
  const end = source.indexOf('const LP=');
  assert.ok(end > 0, 'Locate the end of runtime definitions before starting the UI');
  vm.runInContext(source.slice(0, end) + ';globalThis.geometry={kS,$i,q,Aa,nh,ds,Ql,dh,Ep,Te,xn,sn,pS,Se,zb,Wb,Od,Hb,Dd,cn};', context);
  return context.geometry;
}
const live = load(current), old = load(baseline);
const square = [{x:0,z:0},{x:20,z:0},{x:20,z:12},{x:0,z:12}];
const acuteQuad = [{x:0,z:0},{x:30,z:0},{x:12,z:8},{x:0,z:8}];
const triangle = [{x:0,z:0},{x:24,z:0},{x:5,z:16}];
test('camera rendering stays at full resolution during motion and after stopping', () => {
  const begin = current.indexOf('const v=', current.indexOf('j.updateLOD(ut)'));
  const end = current.indexOf('if((m||Jt)', begin);
  assert.ok(begin > 0 && end > begin);
  const code = current.slice(begin, end);
  for (const A of [true,false]) for (const H of [0,16,100,149,151,3000]) {
    const resizes=[];
    const context={H,x:0,A,p:1,nt:2,n:{getBoundingClientRect:()=>({width:1200,height:800})},St:{setSize:(...size)=>resizes.push(size)},xt:{uniforms:{resolution:{value:{set:()=>{}}}}},w:()=>{}};
    vm.runInNewContext(code,context);
    assert.equal(context.p,1);
    assert.equal(resizes.length,0,'Moving the camera must not reallocate and upscale its render targets');
  }
});
test('rectangular and acute quadrilateral parcels retain their exact sharp footprint', () => {
  for (const polygon of [square,acuteQuad]) for (const clockwise of [polygon,[...polygon].reverse()]) {
    const result=live.dh(live.Te(clockwise));
    assert.equal(result.length,1);
    assert.equal(result[0].outer.length,4);
    assert.equal(live.sn(live.Te(result[0].outer)),live.sn(live.Te(polygon)));
    for(const point of result[0].outer)assert.ok(polygon.some(p=>Math.hypot(p.x-point.x,p.z-point.z)<1e-8));
    const corner=live.Ep(clockwise);
    assert.equal(corner.length,1);
    assert.equal(corner[0].length,4);
    assert.equal(live.sn(live.Te(corner[0])),live.sn(live.Te(polygon)));
  }
  assert.ok(old.dh(old.Te(acuteQuad))[0].outer.length>4,'The fixture must reproduce v52 corner rounding');
});
test('a triangular building subdivision does not by itself authorize a rounded plot', () => {
  assert.equal(live.dh(live.Te(triangle))[0].outer.length,3);
  assert.equal(live.Ep(triangle)[0].length,3);
  for (const polygon of [[{x:0,z:0},{x:30,z:0},{x:30,z:1},{x:0,z:1}], [{x:0,z:0},{x:2,z:0},{x:2,z:2},{x:0,z:2}]])assert.equal(live.dh(live.Te(polygon)).length,0);
});
function faces(geometry) {
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
  const out=[];
  for(let face=0;face<p.count;face+=3)out.push({normal:n.getY(face),points:[0,1,2].map(v=>[p.getX(face+v),p.getY(face+v),p.getZ(face+v)]),uv:[0,1,2].map(v=>[uv.getX(face+v),uv.getY(face+v)])});
  return out;
}
test('stacked foundation, walls and roof contain no touching internal cap faces', () => {
  for(const polygon of [square,triangle,acuteQuad]) {
    const foundation=live.Ql(polygon,0,1,{top:false});
    const walls=live.Ql(polygon,1,10,{top:false,bottom:false});
    const roof=live.Ql(polygon,11,.16,{bottom:false});
    assert.ok(faces(foundation).every(f=>f.normal<.5));
    assert.ok(faces(walls).every(f=>Math.abs(f.normal)<.5));
    const roofFaces=faces(roof);
    assert.ok(roofFaces.every(f=>f.normal>-.5));
    assert.ok(roofFaces.some(f=>f.normal>.5));
    const caps=roofFaces.filter(f=>f.normal>.5);
    assert.ok(caps.every(f=>f.points.every(p=>Math.abs(p[1]-11.16)<1e-5)));
    for(const geometry of [foundation,walls,roof])geometry.dispose();
  }
});
test('roof UVs have area rather than collapsing into stripes; closed geometry stays closed', () => {
  const geometry=live.Ql(square,0,10);
  const all=faces(geometry);
  assert.ok(all.some(f=>f.normal>.5)&&all.some(f=>f.normal<-.5));
  for(const face of all.filter(f=>Math.abs(f.normal)>.5)) {
    const [a,b,c]=face.uv;
    assert.ok(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))>1e-6);
  }
  assert.equal(geometry.attributes.position.count,old.Ql(square,0,10).attributes.position.count);
  geometry.dispose();
});
test('the actual neighborhood renderer uses the open internal caps and retains facade detail', () => {
  const scene=new live.Se(),renderer=live.pS(scene);
  const building={id:'fixture',signature:'fixture',footprint:square,ground:0,y:1,height:10,floors:3,variation:.5,zone:'rowhouses',x:10,z:6,towardRoad:{x:0,z:-1},entrance:{x:10,z:0,y:0},rotation:0};
  assert.equal(renderer.render({buildings:[building]}),true);
  assert.equal(renderer.info().buildings,1);
  assert.ok(renderer.info().windows>0);
  const shells=[];scene.traverse(object=>{if(object.userData.buildingRanges)shells.push(object.geometry);});
  assert.equal(shells.length,2,'Facade-integrated foundations share the wall material; roof stays separate');
  for(const geometry of shells)for(const face of faces(geometry))if(Math.abs(face.normal)>.5){
    assert.ok(face.points.every(p=>p[1]<=.721||Math.abs(p[1]-10.46)<1e-5),'Only the low plinth/entry transitions and exterior roof cap should be rendered');
  }
});
function generate(api,points,{renderCache=false}={}){
  const network=new api.zb();
  assert.equal(network.addBatch(points.map((point,i)=>[point,points[(i+1)%points.length]])).ok,true);
  if(renderCache)api.Hb(network,network.roads,api.Dd(network).corridor);
  return api.Wb(network,{rowhouses:api.Od(network)});
}
test('full road-to-building pipeline produces sharp rectangular street corners, including after road rendering',()=>{
  const points=[{x:-60,z:-60},{x:60,z:-60},{x:60,z:60},{x:-60,z:60}];
  const diagonalEdges=building=>building.footprint.filter((p,i,ring)=>{
    const q=ring[(i+1)%ring.length];return Math.abs(p.x-q.x)>1e-4&&Math.abs(p.z-q.z)>1e-4;
  }).length;
  assert.ok(generate(old,points).some(b=>b.corner&&diagonalEdges(b)>0),'Reproduce inherited curved plot boundaries from v52');
  for(const renderCache of [false,true]){
    const buildings=generate(live,points,{renderCache});
    assert.ok(buildings.length>50);
    assert.ok(buildings.some(b=>b.corner));
    assert.ok(buildings.every(b=>diagonalEdges(b)===0),'Every wall on this axis-aligned rectangular block must remain axis-aligned');
  }
});
test('a genuinely triangular enclosed plot retains rounded building corners',()=>{
  const buildings=generate(live,[{x:0,z:0},{x:50,z:0},{x:25,z:50}]);
  const triangularPlot=buildings.filter(b=>b.wholeBlock);
  assert.ok(triangularPlot.length>0);
  assert.ok(triangularPlot.some(b=>b.footprint.length>3),'Triangular plots should still have corner arc segments');
});
test('camera quality stays stable without high-DPI supersampling or four-sample targets',()=>{
  const begin=current.indexOf('const tt=1,nt='),end=current.indexOf('St.addPass(new RS',begin);
  assert.ok(begin>0&&end>begin);
  for(const devicePixelRatio of [1,2,3])for(const maxSamples of [1,4])for(const A of [true,false]){
    let rendererRatio,composerRatio;
    const context={A,window:{devicePixelRatio},b:{capabilities:{maxSamples},setPixelRatio:value=>{rendererRatio=value;}},zS:class{
      constructor(){this.renderTarget1={};this.renderTarget2={};}
      setPixelRatio(value){composerRatio=value;}
    }};
    vm.runInNewContext(current.slice(begin,end).replace(/,$/,';')+'globalThis.targets=[St.renderTarget1,St.renderTarget2];',context);
    assert.equal(rendererRatio,1);
    assert.equal(composerRatio,1);
    for(const target of context.targets)assert.equal(target.samples,Math.min(2,maxSamples));
  }
});
test('camera motion bounds expensive shadow-view updates and refreshes after settling',()=>{
  const begin=current.indexOf('(_||H-x<150)?');
  const end=current.indexOf(',_&&(x=H,_=!1);',begin);
  assert.ok(begin>0&&end>begin);
  let calls=0;
  const context=vm.createContext({I:{updateView:()=>{calls++;}},ut:{},yt:{target:{}},X:[],pcShadowViewAt:-Infinity,H:0,x:0,_:true});
  const code=current.slice(begin,end);
  for(let frame=0;frame<60;frame++){context.H=frame*1000/60;context.x=context.H;vm.runInContext(code,context);}
  assert.ok(calls>=9&&calls<=10,`Expected at most ten shadow recalculations, got ${calls}`);
  context._=false;context.H=1200;vm.runInContext(code,context);
  assert.equal(context.pcShadowViewAt,1200,'The settled camera must immediately receive a fresh shadow view');
});

// Exercise the actual shared sun controller, rather than a duplicate bias formula.
function surfaceLighting(api,size=2048){const renderer={setClearColor(){},shadowMap:{}},scene=new api.Se,controller=api.kS(renderer,scene,()=>{},{shadowSize:size});return {renderer,scene,controller};}
test('surface shadow bias follows view resolution, keeps real shadows and preserves settled-camera caching',()=>{
 for(const size of [1024,2048]){const {renderer,scene,controller}=surfaceLighting(live,size),camera=new live.$i(50,1.6,.1,5000),target=new live.q;
 assert.equal(renderer.shadowMap.enabled,true);assert.equal(renderer.shadowMap.autoUpdate,false);assert.equal(controller.sun.castShadow,true);assert.equal(controller.sun.shadow.intensity,.65);assert.equal(controller.sun.shadow.radius,1.8);assert.equal(controller.sun.shadow.mapSize.x,size);assert.equal(scene.children.length,3);
 let previousOffset=0;for(const distance of [40,180,400]){camera.position.set(0,distance*.7,distance);camera.lookAt(target);assert.equal(controller.updateView(camera,target,[]),true);const info=controller.info(),offset=-controller.sun.shadow.bias*(info.far-info.near);assert.ok(offset>=info.texel*.99&&offset<=info.texel*1.01);assert.ok(offset>previousOffset);previousOffset=offset;const updates=info.updates;assert.equal(controller.updateView(camera,target,[]),false);assert.equal(controller.info().updates,updates);assert.equal(renderer.shadowMap.autoUpdate,false);}
 // Clipping depth can change with camera height; world-space bias must not.
 const last=controller.info(),world=-controller.sun.shadow.bias*(last.far-last.near);camera.position.set(0,980,1400);camera.lookAt(target);controller.updateView(camera,target,[]);const next=controller.info();assert.equal(next.texel,last.texel);assert.ok(Math.abs(-controller.sun.shadow.bias*(next.far-next.near)-world)<1e-12);
 }
});
test('coarse filtered roof and facade plane samples no longer self-shadow into diagonal bands',()=>{
 const systems=[live,old].map(api=>{const {controller}=surfaceLighting(api),camera=new api.$i(50,1.6,.1,5000),target=new api.q;camera.position.set(0,280,400);camera.lookAt(target);controller.updateView(camera,target,[]);return controller;});
 // Compare a lit plane to its own sampled depth at neighboring filter taps.
 // Both bias components come from the controller; the legacy controller is
 // required to reproduce a false shadow on the same unoccluded plane.
 for(const [normal,footprint]of [[new live.q(0,1,0),1.8],[new live.q(-1,0,0),.7],[new live.q(0,0,1),.7]]){
 const visibility=controller=>{const i=controller.info(),depth=-controller.sun.shadow.bias*(i.far-i.near),normalOffset=controller.sun.shadow.normalBias,light=normal.dot(live.ds);return Math.min(...[-1,1].flatMap(x=>[-1,1].map(y=>(normalOffset+(normal.dot(live.Aa)*x+normal.dot(live.nh)*y)*i.texel*footprint)/light+depth)));};
 assert.ok(visibility(systems[1])<0,'Legacy bias must reproduce diagonal self-shadowing');assert.ok(visibility(systems[0])>0,'Unoccluded plane must stay lit across filter taps');
 }
});
