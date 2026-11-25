const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'),crypto=require('node:crypto'),root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function api(){
  const c=vm.createContext({console,performance,structuredClone,atob,URL,
    document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
  vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.a={zb,qb,Se,pS,Pw,Te,je,sn,pcGrowableFind,pcTraditionalControl,pcTraditionalSetControl,pcTraditionalReady,pcTraditionalFit,pcTraditionalHistory,pcTraditionalInfo,pcOfficeParcels,pcFacadeSites,pcFacadeAttach,pcFacadeRelease,get runtime(){return pcTraditionalRuntime;}};',c);
  return c.a;
}
function city(a){
  const n=new a.zb,roads=[];
  n.terrain=a.Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
  for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
  n.addBatch(roads);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');return {n,z};
}
function lot(type,w,d,angle=0){
  const sin=Math.sin(angle),cos=Math.cos(angle);
  return {id:type,zone:'offices',area:w*d,towardRoad:{x:sin,z:cos},footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]
    .map(([x,z])=>({x:x*cos+z*sin,z:-x*sin+z*cos}))};
}
test('three fixed native shapes fit rotated parcels and keep supported terraces, opaque materials and decorated bounds',()=>{
  const a=api(),rt=a.pcTraditionalReady(),data=[];
  for(const [i,type] of ['A','B','C'].entries()){
    const site=lot(type,58,48,.4+i*.27),fit=a.pcTraditionalFit(site,type);
    assert.ok(fit.ok,fit.reason);const r=fit.record,s=r.parameters,g=r.grid;
    assert.deepEqual(plain(a.pcTraditionalFit({...site},type).record),plain(r));
    assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(site.footprint)))<.001);
    assert.equal(s.revision,2);
    assert.equal(r.placement.scale,1);assert.ok(Math.abs(r.placement.angle-(.4+i*.27))<.001);
    assert.equal(a.pcTraditionalFit(lot(type+'-small',s.width,s.depth),type).ok,false);
    assert.equal(a.pcTraditionalFit({...site,officeProfile:{maxFloors:12}},type).ok,false);
    const poly=ring=>a.Te(ring.map(([x,z])=>({x,z})));
    const rings=[g.groundRing,...g.tiers.map(t=>t.ring)];
    for(let j=1;j<rings.length;j++)assert.ok(a.sn(a.je(poly(rings[j]),poly(rings[j-1])))<.001);
    assert.equal(g.groundRing.length,type==='B'?6:12);
    assert.equal(g.entries.length,type==='B'?2:1);
    assert.equal(g.tiers.length,type==='B'?3:2);
    const model=rt.generator.generate(s),copy=rt.generator.generate(s);
    assert.ok(model.children.length<=11&&model.userData.triangles<24000);
    for(const [j,mesh] of model.children.entries()){
      assert.equal(mesh.material.transparent,false);assert.equal(mesh.geometry,copy.children[j].geometry);
      const p=mesh.geometry.attributes.position;
      for(let k=0;k<p.count;k++){
        assert.ok(Math.abs(p.getX(k))<=s.width/2+1.751,type+' x envelope');
        assert.ok(Math.abs(p.getZ(k))<=s.depth/2+1.751,type+' z envelope');
        assert.ok(p.getY(k)>=-.001&&p.getY(k)<=g.roofTop+.001,type+' roof envelope');
      }
    }
    const peak=g.tiers.at(-1),parts=label=>model.userData.partRanges.filter(r=>r.label===label);
    const vertices=range=>{
      const p=model.getObjectByName(range.material).geometry.attributes.position;
      return Array.from({length:range.end-range.start},(_,j)=>[p.getX(range.start+j),p.getY(range.start+j),p.getZ(range.start+j)]);
    };
    const cornice=vertices(parts('projecting cornice').filter(r=>r.material==='trim').at(-1));
    const right=Math.max(...peak.ring.map(([x])=>x));
    assert.ok(Math.abs(Math.max(...cornice.map(([x])=>x))-right-1.63)<.001);
    const tower=parts('rooftop water tower').flatMap(vertices);
    assert.ok(Math.abs(Math.min(...tower.map(([,y])=>y))-peak.end)<.001);
    assert.ok(Math.abs(Math.max(...tower.map(([,y])=>y))-g.roofTop)<.001);
    const minX=Math.min(...tower.map(p=>p[0])),maxX=Math.max(...tower.map(p=>p[0]));
    const minZ=Math.min(...tower.map(p=>p[2])),maxZ=Math.max(...tower.map(p=>p[2]));
    assert.ok(a.sn(a.je(poly([[minX,minZ],[maxX,minZ],[maxX,maxZ],[minX,maxZ]]),poly(peak.ring)))<.001);
    if(type==='C'){
      assert.equal(s.width,46);assert.equal(s.depth,40);assert.equal(2*right,36);
    }
    data.push([type,s.storeys,model.userData.triangles,model.children.length]);
    rt.generator.release(model);rt.generator.release(copy);
  }
  rt.generator.prune();assert.equal(rt.generator.cache.size,0);console.log('Traditional Offices [design,storeys,triangles,materials]',JSON.stringify(data));
});
test('default-off catalogue stays lazy and mixed Office zoning grows all three when opted in',()=>{
  const a=api(),{n,z}=city(a);
  assert.equal(a.pcTraditionalControl(z).enabled,false);
  const empty=plain(n.captureState().participants.zoning);
  z.applyProperties(z.properties.slice(0,8),'offices');
  assert.ok(z.buildings.length>0&&z.buildings.every(b=>!b.office.lightweightTraditional));
  assert.equal(a.runtime,null);
  n.historyParticipants.get('zoning').restore(empty);z.rebuild();
  a.pcTraditionalSetControl(z,{enabled:true,type:'mix'});
  const lots=z.properties.filter(p=>['A','B','C'].some(type=>a.pcTraditionalFit(p,type).ok));
  z.applyProperties(lots,'offices');
  const towers=z.buildings.filter(b=>b.office.lightweightTraditional);
  assert.deepEqual([...new Set(towers.map(b=>b.office.lightweightTraditional.parameters.archetype))].sort(),['A','B','C']);
  assert.ok(towers.length<z.buildings.length);
  assert.ok(!source.includes('function traditionalHighRise('));
  const benchmark=fs.readFileSync(path.join(root,'architecture/traditional-high-rise-reference/model.js'));
  assert.equal(crypto.createHash('sha256').update(benchmark).digest('hex'),"5e3c6bf5204ea3c51e40d35bc3e77df5d58ec180f759cf013eea0567a1e96358");
});
test('explicit zoning selection retains foundations, picking, undo, cold restoration and deterministic redevelopment',()=>{
  const a=api(),{n,z}=city(a);
  a.pcTraditionalSetControl(z,{enabled:true,type:'B'});
  const target=z.properties.find(p=>a.pcTraditionalFit(p,'B').ok);
  assert.ok(target);z.applyProperties([target],'offices');
  let b=z.buildings.find(b=>b.propertyIds.includes(target.id));assert.equal(b.office.lightweightTraditional.parameters.archetype,'B');
  const old=plain(b.office.lightweightTraditional),saved=plain(n.captureState().participants.zoning);
  let site=a.pcFacadeSites.get(b);assert.equal(site.front,old.grid.entrance.z);assert.equal(site.doorX,old.grid.entrance.x);assert.equal(site.rings[0].length,6);
  const scene=new a.Se,renderer=a.pS(scene);renderer.render(z);
  assert.equal(a.pcTraditionalInfo().activeBuildings,1);assert.equal(renderer.render(z),false);
  let picked=false;scene.traverse(m=>{if(m.userData.pcBmoBuildings?.some(v=>v.id===b.id)){
    const p=b.office.assetPlacement;assert.equal(renderer.at({object:m,point:{x:p.x,y:b.y+2,z:p.z+5}}),b.id);picked=true;
  }});assert.ok(picked);
  assert.equal(z.demolish(b.id),true);assert.equal(n.undo(),true);z.rebuild();
  b=z.buildings.find(b=>b.propertyIds.includes(target.id));assert.deepEqual(plain(b.office.lightweightTraditional),old);
  assert.equal(n.redo(),true);z.rebuild();assert.ok(!z.buildings.some(b=>b.propertyIds.includes(target.id)));
  z.applyProperties([target],'offices');assert.deepEqual(plain(z.buildings.find(b=>b.propertyIds.includes(target.id)).office.lightweightTraditional),old);
  const other=city(api());other.n.historyParticipants.get('zoning').restore(saved);other.z.rebuild();
  assert.deepEqual(plain(other.z.buildings.find(b=>b.propertyIds.includes(target.id)).office.lightweightTraditional),old);
  const terrain={heightAt:(x,z)=>22+x*.022-z*.016,revision:1};
  const key='template:original-traditional-offices-b@0.1.0',c={network:{terrain},pcCatalogueAssignments:new Map([[target.id,key]]),pcTraditionalAssignments:new Map([[target.id,old]])};
  const [sloped]=a.pcOfficeParcels([target],c);site=a.pcFacadeSites.get(sloped);
  assert.ok(sloped.y>site.ground(site.doorX,site.front));
  const rt=a.pcTraditionalReady(),r={...old,placement:{...old.placement,y:sloped.y}};
  const supported=a.pcFacadeAttach(sloped,rt.system.generate(r),rt,r);
  assert.ok(supported.children.some(mesh=>mesh.userData.pcFacadeOwned));
  a.pcFacadeRelease(supported);rt.system.release(supported);
});

test('earlier saved designs retain their exact geometry and native fit envelope',()=>{
  const rt=api().pcTraditionalReady(),locks={
    A:'18ba24aa17ab047ee79f72b3deaa59042e88440c1e7951f7b23bea0eb92dfd21',
    B:'3f1cadd47466166cb826e396eeba026cce5dcfb21cfacda7d4df0f9c8992ac35',
    C:'bc6f79645836665108109def2c4911ab6b37dfa7e288c595eed32b74ad136d0d'
  };
  for(const [archetype,expected] of Object.entries(locks)){
    const site=lot(archetype,58,50),parameters=rt.system.definition.normalize({archetype});
    const fit=rt.system.fit(site,{parameters});
    assert.ok(fit.ok,fit.reason);assert.equal(fit.record.parameters.revision,undefined);
    const [left,right]=fit.record.footprint;
    assert.ok(Math.abs(right.x-left.x-parameters.width-2.35)<.001);
    const model=rt.system.generate(plain(fit.record)),hash=crypto.createHash('sha256');
    for(const mesh of model.children){
      hash.update(mesh.name);
      for(const {array} of [mesh.geometry.index,...Object.values(mesh.geometry.attributes)])hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));
    }
    assert.equal(hash.digest('hex'),expected);
    rt.system.release(model);
  }
});
