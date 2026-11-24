const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'),crypto=require('node:crypto'),root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
function api(){
  const c=vm.createContext({console,performance,structuredClone,atob,URL,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
  vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,Se,pS,Pw,Te,je,sn,pcVaultControl,pcVaultReady,pcVaultFit,pcVaultSetControl,pcVaultHistory,pcVaultInfo,pcVaultDefinitions,pcOfficeParcels,pcFacadeAttach,pcFacadeRelease,pcFacadeSites,get runtime(){return pcVaultRuntime;}};',c);
  return c.api;
}
function network(a){
  const n=new a.zb,roads=[];
  for(const v of [-180,-60,60,180])roads.push([{x:v,z:-180},{x:v,z:180}],[{x:-180,z:v},{x:180,z:v}]);
  n.addBatch(roads);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');return {n,z};
}
function rectangle(archetype,angle,width=62,depth=52){
  return {id:archetype+angle,zone:'offices',area:width*depth,towardRoad:{x:Math.sin(angle),z:Math.cos(angle)},
    footprint:[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]].map(([x,z])=>({x:x*Math.cos(angle)+z*Math.sin(angle),z:z*Math.cos(angle)-x*Math.sin(angle)}))};
}
test('three designs fit native rotated parcels with contained rooftop plant and one glazing tint at 20–40 storeys',()=>{
  const a=api(),rt=a.pcVaultReady(),samples=[];
  for(const [i,type] of ['A','B','C'].entries())for(const [j,h] of [20,30,40].entries()){
    const angle=j*.48,lot=rectangle(type,angle,56+j*9,44+j*5),fit=a.pcVaultFit(lot,type,h,null);
    assert.ok(fit.ok,fit.reason);
    const r=fit.record,g=r.grid,s=r.parameters,model=rt.generator.generate(s),other=rt.generator.generate({...s,palette:(s.palette+1)%3});
    const polygon=ring=>a.Te(ring.map(([x,z])=>({x,z})));
    assert.equal(r.placement.scale,1);assert.ok(Math.abs(r.placement.angle-angle)<.000001);
    assert.equal(s.storeys,h);assert.equal(s.floorHeight,3.35);
    assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(lot.footprint)))<.0001);
    assert.equal(g.equipment.length,type==='B'?2:1);
    assert.equal(g.roofTop,h*s.floorHeight+1.65);
    for(const unit of g.equipment){
      const roof=g.slabs.find(slab=>slab.end===unit.y);
      const {x,z,width,depth}=unit, w=width/2, d=depth/2;
      const footprint=[[x-w,z-d],[x+w,z-d],[x+w,z+d],[x-w,z+d]];
      assert.ok(a.sn(a.je(polygon(footprint),polygon(roof.ring)))<.001,type+' equipment outside its roof');
    }
    assert.deepEqual(plain(g.groundRing),plain(g.slabs[0].ring));
    assert.ok(g.entrance.z>0&&g.entrance.z===Math.max(...g.groundRing.map(p=>p[1])));
    assert.equal('atrium' in g,false);assert.equal('crowns' in g,false);
    for(const slab of g.slabs.filter(v=>v.start>0)){
      const lower=g.slabs.find(v=>v.end===slab.start);
      assert.ok(a.sn(a.je(polygon(slab.ring),polygon(lower.ring)))<.001,type+' unsupported upper slab');
    }
    for(const [sample,palette] of [[model,s.palette],[other,(s.palette+1)%3]]){
      const ribbon=sample.children.find(m=>m.name==='ribbon0'),door=sample.children.find(m=>m.name==='door0');
      assert.equal(ribbon.material,rt.generator.materials["ribbon"+palette]);
      assert.equal(door.material,rt.generator.materials["door"+palette]);
      const pixel=(45*256+10)*4,rgba=ribbon.material.map.image.data,color=door.material.color.getHex();
      const rgb=[color>>16,(color>>8)&255,color&255];
      assert.equal(rgba[pixel+1]-rgba[pixel],rgb[1]-rgb[0]);
      assert.equal(rgba[pixel+2]-rgba[pixel],rgb[2]-rgb[0]);
    }
    const modelCount=model.userData.triangles;
    assert.ok(modelCount<5000&&model.children.length<=9);
    for(const [j,m] of model.children.entries()){
      assert.equal(m.geometry,other.children[j].geometry);
      assert.equal(m.material.transparent,false);
      const p=m.geometry.attributes.position;
      for(let k=0;k<p.count;k++)assert.ok(Math.abs(p.getX(k))<=s.width/2+1.1&&p.getZ(k)<=g.entrance.z+.1&&p.getY(k)<=g.roofTop+.06);
    }
    if(j===1)samples.push({type,width:s.width,depth:s.depth,storeys:h,triangles:modelCount,batches:model.children.length,utilization:a.sn(polygon(g.groundRing))/lot.area});
    rt.generator.release(model);rt.generator.release(other);
    assert.equal(a.pcVaultFit({...lot,holes:[lot.footprint]},type,h).ok,false);
    assert.equal(a.pcVaultFit(rectangle(type,0,18,65),type,h).ok,false);
  }
  rt.generator.prune();assert.equal(rt.generator.cache.size,0);
  console.log('Vault sample assets',JSON.stringify(samples));
});
test('explicit family selection preserves picking, terrain foundations and history',()=>{
  const a=api(),{n,z}=network(a);
  assert.equal(a.runtime,null);assert.equal(a.pcVaultControl(z).enabled,true);
  a.pcVaultSetControl(z,{enabled:false,type:'mix'});
  z.applyProperties(z.properties.slice(0,2),'offices');assert.ok(z.buildings.every(b=>!b.office.lightweightVault));assert.equal(a.runtime,null);
  const sites=new Set(z.buildings.flatMap(b=>b.propertyIds));
  for(const type of ['A','B','C']){
    a.pcVaultSetControl(z,{enabled:true,type});
    const lot=z.properties.find(p=>!sites.has(p.id)&&a.pcVaultFit(p,type).ok);
    assert.ok(lot,type);
    z.applyProperties([lot],'offices');sites.add(lot.id);
    const b=z.buildings.find(b=>b.propertyIds.includes(lot.id));
    assert.equal(b.office.lightweightVault.parameters.archetype,type);
  }
  a.pcVaultSetControl(z,{enabled:false,type:'mix'});
  const scene=new a.Se,renderer=a.pS(scene);renderer.render(z);
  const b=z.buildings.find(b=>b.office.lightweightVault);
  const records=plain(a.pcVaultHistory(z)),saved=plain(n.captureState().participants.zoning);
  const site=a.pcFacadeSites.get(b);assert.ok(site&&site.rings[0].length===b.office.lightweightVault.grid.groundRing.length);
  let picked=false;
  scene.traverse(m=>{if(m.userData.pcBmoBuildings?.some(item=>item.id===b.id)){const p=b.office.assetPlacement;assert.equal(renderer.at({object:m,point:{x:p.x,y:b.y+2,z:p.z}}),b.id);picked=true;}});
  assert.ok(picked);
  assert.equal(z.demolish(b.id),true);
  assert.equal(n.undo(),true);z.rebuild();
  assert.deepEqual(plain(a.pcVaultHistory(z)),records);
  assert.equal(n.redo(),true);z.rebuild();assert.ok(!z.buildings.some(item=>item.id===b.id));
  const fresh=network(api());
  for(const [,record] of saved.lightweightVault.assignments){
    delete record.grid.equipment;record.grid.roofTop=record.parameters.storeys*record.parameters.floorHeight;
    if(record.parameters.archetype==='A'){
      record.grid.atrium={y:7};record.grid.crowns=[{rise:5}];
      record.grid.roofTop+=5;record.grid.entrance.z=record.parameters.depth/2;
    }
  }
  fresh.n.historyParticipants.get('zoning').restore(saved);fresh.z.rebuild();
  assert.deepEqual(plain(a.pcVaultHistory(fresh.z)),records);
  assert.equal(fresh.z.buildings.filter(b=>b.office.lightweightVault).length,3);
  saved.lightweightVault.control={enabled:false,type:'C'};
  fresh.n.historyParticipants.get('zoning').restore(saved);
  assert.deepEqual(plain(a.pcVaultHistory(fresh.z).control),{enabled:true,type:'mix',catalogue:true});
});
test('archived crown benchmark remains unchanged and outside the assembled runtime',()=>{
  const bytes=fs.readFileSync(path.join(root,'architecture/barrel-vault-reference/model.js'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'8476cbc2b2e0ae06906234acc4941ac9ed80cbee1a9be3cf878cf666010a60c6');
  assert.ok(!source.includes('barrelVaultReference')&&!source.includes('Barrel-vault skyscraper · fixed benchmark'));
});

test('the three street thresholds and perimeter foundations meet sloped terrain',()=>{
  const a=api(),{z}=network(a),rt=a.pcVaultReady(),terrain={heightAt:(x,z)=>22+x*.022-z*.016,revision:1};
  for(const type of ['A','B','C']){
    const p=z.properties.find(p=>a.pcVaultFit(p,type,30).ok),r=a.pcVaultFit(p,type,30).record;
    const key=a.pcVaultDefinitions.find(d=>d.archetype===type).key;
    const c={network:{terrain},pcCatalogueAssignments:new Map([[p.id,key]]),pcVaultAssignments:new Map([[p.id,r]])};
    const [building]=a.pcOfficeParcels([p],c),site=a.pcFacadeSites.get(building);
    const record={...r,placement:{...r.placement,y:building.y}};
    const model=a.pcFacadeAttach(building,rt.system.generate(record),rt,record);
    assert.equal(site.front,r.grid.entrance.z);
    assert.ok(building.y>site.ground(r.grid.entrance.x,site.front));
    assert.ok(model.children.some(mesh=>mesh.userData.pcFacadeOwned));
    a.pcFacadeRelease(model);rt.system.release(model);
  }
  rt.generator.prune();
});

test('15 production forms fit rotated lots, preserve native bays and carry supported vaults and plant',()=>{
  const a=api(),rt=a.pcVaultReady(),measurements=[],polygon=ring=>a.Te(ring.map(([x,z])=>({x,z})));
  for(const type of ['A','B','C']){
    const shapes=new Set;
    for(const [i,[w,d,h]] of [[52,38,20],[57,46,25],[64,53,30],[75,62,35],[84,66,40]].entries()){
      const form=i%3,angle=.29*i,lot=rectangle(type,angle,w,d),fit=a.pcVaultFit(lot,type,h,form);
      assert.ok(fit.ok,type+' '+h+': '+fit.reason);
      const r=fit.record,g=r.grid,s=r.parameters,m=rt.generator.generate(s);
      assert.deepEqual(plain(a.pcVaultFit({...lot},type,h,form).record),plain(r));
      assert.equal(r.placement.scale,1);assert.ok(Math.abs(r.placement.angle-angle)<.00001);
      assert.equal(s.form,form);assert.equal(s.storeys,h);assert.equal(g.entrance.x,0);
      for(const value of [s.width,s.depth])assert.ok(Math.abs(value/2.4-Math.round(value/2.4))<.00001);
      assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(lot.footprint)))<.001);
      assert.ok(g.crowns.length>=1&&g.crowns.length<=2);
      assert.equal(g.equipment.length,type==='B'?2:1);
      for(const slab of g.slabs.slice(1)){
        const lower=g.slabs.find(v=>v.end===slab.start);
        assert.ok(a.sn(a.je(polygon(slab.ring),polygon(lower.ring)))<.001,type+' unsupported slab');
      }
      const placed=[];
      for(const v of [...g.crowns,...g.equipment]){
        const along=v.axis?v.length/2+.14:v.width/2,wide=v.axis?v.radius+.12:v.depth/2;
        const ring=[[-along,-wide],[along,-wide],[along,wide],[-along,wide]].map(([x,z])=>v.axis==='z'?[v.x-z,v.z+x]:[v.x+x,v.z+z]);
        const roof=g.slabs.find(slab=>slab.end===v.y),shape=polygon(ring);
        assert.ok(a.sn(a.je(shape,polygon(roof.ring)))<.001,type+' unsupported roof attachment');
        for(const p of placed.filter(p=>p.y===v.y))assert.ok(a.sn(shape)-a.sn(a.je(shape,p.shape))<.001,type+' overlapping roof attachments');
        placed.push({y:v.y,shape});
      }
      const vault=m.children.find(mesh=>mesh.name==='vault0'),door=m.children.find(mesh=>mesh.name==='door0');
      assert.equal(vault.material,rt.generator.materials['vault'+s.palette]);
      assert.equal(door.material,rt.generator.materials['door'+s.palette]);
      const data=vault.material.map.image.data,color=door.material.color.getHex(),pixel=(39*256+10)*4;
      assert.equal(data[pixel+1]-data[pixel],((color>>8)&255)-(color>>16));
      assert.equal(data[pixel+2]-data[pixel],(color&255)-(color>>16));
      const n=vault.geometry.attributes.normal;
      for(let k=0;k<n.count;k++)assert.ok(Math.abs(Math.hypot(n.getX(k),n.getY(k),n.getZ(k))-1)<.0001);
      assert.ok(m.children.every(c=>!c.material.transparent));
      assert.ok(m.userData.triangles<4400&&m.children.length<=7);
      const fixed=rt.system.definition.layout({archetype:type,height:32,width:57.6,depth:43.2,storeys:32,form});
      shapes.add(JSON.stringify([fixed.slabs,fixed.crowns]));
      measurements.push([type,form,s.width,s.depth,h,m.userData.triangles,m.children.length]);
      rt.generator.release(m);
    }
    assert.equal(shapes.size,3);
  }
  rt.generator.prune();
  assert.equal(rt.generator.leases.size,0);
  console.log('Production Vault sample [type,form,width,depth,floors,triangles,batches]',JSON.stringify(measurements));
});
test('normal mixed Office growth selects three Vault subfamilies and retains ordinary offices',()=>{
  const a=api(),n=new a.zb,roads=[];
  n.terrain=a.Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
  for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
  n.addBatch(roads);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');
  assert.equal(a.pcVaultControl(z).enabled,true);
  const lots=z.properties.filter(p=>['A','B','C'].some(t=>a.pcVaultFit(p,t).ok));
  z.applyProperties(lots,'offices');
  const towers=z.buildings.filter(b=>b.office.lightweightVault);
  assert.deepEqual([...new Set(towers.map(b=>b.office.lightweightVault.parameters.archetype))].sort(),['A','B','C']);
  assert.ok(towers.length<z.buildings.length);
  const tower=towers[0],lot=lots.find(p=>p.id===tower.propertyIds[0]),record=plain(tower.office.lightweightVault);
  assert.ok(z.demolish(tower.id));z.applyProperties([lot],'offices');
  assert.deepEqual(plain(z.buildings.find(b=>b.propertyIds.includes(lot.id)).office.lightweightVault),record);
});
test('the three approved flat-roof benchmarks retain their exact geometry buffers',()=>{
  const rt=api().pcVaultReady(),locks={
    A:'844c755a52089978aa83360dab4fc5e2452b7820bef694c53a15f9e3c3598e23',
    B:'e68397c391c3d449cc3c8945f925569b5a339925cfee821e11493b213d6dc413',
    C:'db0827c0fc8e487edba54a89e3f4b737a13ae295e2d26a0bf7252b31bd4bd153'
  };
  for(const [archetype,expected] of Object.entries(locks)){
    const model=rt.generator.generate({archetype}),hash=crypto.createHash('sha256');
    for(const mesh of model.children){
      hash.update(mesh.name);
      for(const {array} of [mesh.geometry.index,...Object.values(mesh.geometry.attributes)])hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));
    }
    assert.equal(hash.digest('hex'),expected);rt.generator.release(model);
  }
});
