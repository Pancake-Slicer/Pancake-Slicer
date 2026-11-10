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
  const context = vm.createContext({ console, performance, document: { createElement: () => ({ relList: { supports: () => true }, getContext: () => ({fillRect(){}}) }) } });
  const end = source.indexOf('const LP=');
  assert.ok(end > 0, 'Locate the end of runtime definitions before starting the UI');
  vm.runInContext(source.slice(0, end) + ';globalThis.geometry={Ql,dh,Ep,Te,xn,sn,pS,Se};', context);
  return context.geometry;
}
const live = load(current), old = load(baseline);
const square = [{x:0,z:0},{x:20,z:0},{x:20,z:12},{x:0,z:12}];
const acuteQuad = [{x:0,z:0},{x:30,z:0},{x:12,z:8},{x:0,z:8}];
const triangle = [{x:0,z:0},{x:24,z:0},{x:5,z:16}];
const plain = value => JSON.parse(JSON.stringify(value));
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
test('triangular footprint rounding and narrow/sliver rejection remain available', () => {
  assert.deepEqual(plain(live.dh(live.Te(triangle))),plain(old.dh(old.Te(triangle))));
  assert.deepEqual(plain(live.Ep(triangle)),plain(old.Ep(triangle)));
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
  assert.equal(shells.length,3,'Foundation, wall and roof materials remain separate');
  for(const geometry of shells)for(const face of faces(geometry))if(Math.abs(face.normal)>.5){
    assert.ok(face.points.every(p=>Math.abs(p[1]+.18)<1e-5||Math.abs(p[1]-11.16)<1e-5),'Only the exterior bottom and top caps should be rendered');
  }
});
