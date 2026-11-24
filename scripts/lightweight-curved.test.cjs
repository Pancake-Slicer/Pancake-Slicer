const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
function api(){const ctx=vm.createContext({console,performance,structuredClone,atob,URL,location:{href:'http://localhost/'},document:{documentElement:{hasAttribute:()=>false},createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.a={zb,qb,Se,pS,Pw,pcCurvedReady,pcCurvedSetControl,pcCurvedFit,pcCurvedInfo,pcCurvedHistory,pcCurvedDefinitions,pcCurvedBatches,pcCurvedUpdateLOD,pcCurvedChunks,pcCatalogueInitMenu,pcBmoSetControl,pcLindSetControl,pcVonSetControl,pcBrickSetControl,pcAlderwickSetControl,pcCurvedControl,pcGrowableChoose,pcOfficeParcels,pcFacadeSites,pcFacadeAttach,pcFacadeRelease,pcOfficePave,pcGrowableFacing,pcGrowableDefinitions,Te,je,sn,ur,get runtime(){return pcCurvedRuntime;},get lind(){return pcLindRuntime;},get heavy(){return pcOhneeRuntime;}};',ctx);return ctx.a;}
function city(a,angle=0){const n=new a.zb,lines=[],p=(x,z)=>({x:x*Math.cos(angle)+z*Math.sin(angle),z:z*Math.cos(angle)-x*Math.sin(angle)});for(const v of [-180,-60,60,180])lines.push([p(v,-180),p(v,180)],[p(-180,v),p(180,v)]);n.addBatch(lines);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');return {n,z};}


test('curved family is lazy at startup, available in normal gameplay, and excludes the benchmark',()=>{const a=api(),{z}=city(a);assert.equal(a.runtime,null);assert.equal(a.pcCurvedControl(z).enabled,true);z.applyProperties(z.properties.slice(0,12),'rowhouses');assert.equal(a.runtime,null);assert.equal(a.pcCurvedDefinitions.length,3);assert.ok(!a.pcGrowableDefinitions.some(d=>d.id.includes('curved-skyscraper-fixed')));const pack=require('./lightweight-curved.cjs').curvedSource();assert.ok(!pack.includes('buildReference')&&!pack.includes('curved-reference/model'));const before=plain(z.buildings.map(b=>b.signature));a.pcCurvedSetControl(z,{enabled:true,favour:true,type:'A'});z.rebuild();assert.deepEqual(plain(z.buildings.map(b=>b.signature)),before);assert.equal(a.lind,null);assert.equal(a.heavy,null);});
test('three original plans, rooflines and smooth metric grids support20–70 storeys with pooled resources',()=>{const a=api(),rt=a.pcCurvedReady(),identities=new Set;for(const archetype of ['A','B','C'])for(const storeys of [20,45,70]){const spec={archetype,storeys,width:archetype==='B'?72:60,depth:48,palette:storeys%4},plan=rt.module.massing(spec),m=rt.generator.generate(spec),other=rt.generator.generate({...spec,id:'other',seed:'other',palette:(spec.palette+1)%4});identities.add(plan.identity);assert.equal(m.children[0].geometry,other.children[0].geometry);assert.ok(m.userData.triangles<35000);assert.ok(plan.sections.length>=3);for(const g of m.userData.architecture.grids)assert.ok(g.pitch>1.35&&g.pitch<3.5);for(const mesh of m.children){if(mesh.name==='roof'){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv;for(let i=0;i<p.count;i++)if(n.getY(i)>.5){assert.ok(Math.abs(uv.getX(i)-p.getX(i)/4)<1e-5);assert.ok(Math.abs(uv.getY(i)-p.getZ(i)/4)<1e-5);}}assert.equal(mesh.material.transparent,false);for(const key of ['position','normal','uv'])for(const v of mesh.geometry.attributes[key].array)assert.ok(Number.isFinite(v));const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){assert.ok(Math.abs(p.getX(i))<spec.width/2+1.1);assert.ok(Math.abs(p.getZ(i))<spec.depth/2+1.1);}}if(archetype==='A'){assert.ok(plan.groundRing.length>40);assert.ok(plan.sections.at(-1).topRing[0][1]<plan.sections.at(-1).ring[0][1]);assert.equal(plan.sections.length,3);}if(archetype==='B'){assert.equal(plan.entrance.z,spec.depth/2);assert.equal(plan.sections[1].name,"paired wings with recessed glazing");}if(archetype==='C')assert.equal(plan.sections.length,5);rt.generator.release(m);rt.generator.release(other);}assert.equal(identities.size,3);const maps=new Set(Object.values(rt.generator.materials).map(m=>m.map).filter(Boolean));assert.equal(maps.size,5);rt.generator.prune();assert.equal(rt.generator.leases.size,0);assert.equal(rt.generator.cache.size,0);});
test('native polygon fitting spans sizes and rotations, preserves shape and rejects slivers and hole lots',()=>{const a=api();for(const type of ['A','B','C'])for(const [w,d]of [[48,44],[62,56],[84,68]])for(const angle of [0,.37]){const p={id:type+w+d+angle,x:0,z:0,y:0,zone:'offices',area:w*d,towardRoad:{x:Math.sin(angle),z:Math.cos(angle)},footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,z])=>({x:x*Math.cos(angle)+z*Math.sin(angle),z:z*Math.cos(angle)-x*Math.sin(angle)}))},before=JSON.stringify(p),fit=a.pcCurvedFit(p,type,{storeys:24});assert.ok(fit.ok,type+': '+fit.reason);const r=fit.record;assert.equal(r.placement.scale,1);assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(p.footprint)))<.0001);assert.equal(JSON.stringify(p),before);assert.equal(a.pcCurvedFit({...p,id:'sliver',footprint:[{x:0,z:0},{x:80,z:0},{x:80,z:6},{x:0,z:6}]},type).ok,false);assert.equal(a.pcCurvedFit({...p,id:'hole',holes:[p.footprint]},type).ok,false);}});
test('opt-in growth preserves picking, stable frames, demolition, history, cold saves and cleanup',()=>{const a=api();for(const type of ['A','B','C']){const {n,z}=city(a);a.pcCurvedSetControl(z,{enabled:true,favour:true,type});z.applyProperties(z.properties.slice(0,12),'offices');const scene=new a.Se,renderer=a.pS(scene);renderer.render(z);const b=z.buildings.find(b=>b.office.lightweightCurved);assert.ok(b,type);const before=plain(z.buildings.map(b=>b.signature)),history=plain(a.pcCurvedHistory(z)),saved=plain(n.captureState().participants.zoning);assert.equal(renderer.render(z),false);assert.ok(a.pcCurvedInfo().textures<=5);let picks=0;scene.traverse(mesh=>{for(const building of mesh.userData.pcBmoBuildings||[]){if(!building.office.lightweightCurved)continue;const p=building.office.assetPlacement;assert.equal(renderer.at({object:mesh,point:{x:p.x,y:building.y+5,z:p.z},instanceId:0}),building.id);picks++;}});assert.ok(picks);assert.equal(z.demolish(b.id),true);renderer.render(z);assert.equal(n.undo(),true);z.rebuild();renderer.render(z);assert.deepEqual(plain(z.buildings.map(b=>b.signature)),before);assert.equal(n.redo(),true);z.rebuild();renderer.render(z);assert.equal(n.undo(),true);z.rebuild();renderer.render(z);const fresh=api(),other=city(fresh);other.n.historyParticipants.get('zoning').restore(saved);other.z.rebuild();assert.deepEqual(plain(fresh.pcCurvedHistory(other.z)),history);assert.deepEqual(plain(other.z.buildings.map(b=>b.signature)),before);a.pcCurvedSetControl(z,{enabled:false,favour:false});z.rebuild();assert.deepEqual(plain(z.buildings.map(b=>b.signature)),before);n.historyParticipants.get('zoning').restore({regions:{rowhouses:[],offices:[]},catalogueAssignments:[],suppressed:[]});z.rebuild();renderer.render(z);assert.equal(a.pcCurvedInfo().leases,0);assert.equal(a.pcCurvedInfo().cacheEntries,0);}});
test('curved podium perimeters use shared facade-to-grade foundations and sidewalk-level entrance on flat/sloped sites',()=>{const a=api(),rt=a.pcCurvedReady(),{z}=city(a);for(const type of ['A','B','C']){const p=z.properties.find(p=>a.pcCurvedFit(p,type).ok),r=a.pcCurvedFit(p,type).record,key=a.pcCurvedDefinitions.find(d=>d.archetype===type).key;for(const heightAt of [()=>20,(x,z)=>20+x*.025+z*.018]){const c={network:{terrain:{heightAt,revision:1}},pcCatalogueAssignments:new Map([[p.id,key]]),pcCurvedAssignments:new Map([[p.id,r]])},b=a.pcOfficeParcels([p],c)[0],record=plain(r);assert.ok(b.office.lightweightCurved);record.placement.y=b.y;const m=rt.system.generate(record);a.pcFacadeAttach(b,m,rt,r);const site=a.pcFacadeSites.get(b);assert.equal(site.rings[0].length,r.grid.groundRing.length);assert.equal(site.front,r.grid.entrance.z);assert.ok(b.y>=site.ground(r.grid.entrance.x,site.front)+a.ur+.059);assert.ok(m.children.some(m=>m.userData.pcFacadeOwned));for(const mesh of m.children.filter(m=>m.userData.pcFacadeOwned))assert.ok(mesh.material===rt.generator.materials.stone||mesh.material===rt.generator.materials.trim);let paved=0;a.pcOfficePave(b,g=>{paved++;g.dispose();});assert.ok(paved);a.pcFacadeRelease(m);rt.system.release(m);}}rt.generator.prune();});

test('10/25/50 original towers share buffers and bounded material batches without a city-scale FPS claim',()=>{const a=api(),rt=a.pcCurvedReady(),records=[];for(const count of [10,25,50]){const start=performance.now(),models=[];for(let i=0;i<count;i++){const m=rt.generator.generate({archetype:['A','B','C'][i%3],width:60,depth:48,storeys:[40,32,62][i%3],palette:i%4});m.position.set((i%5)*70,0,Math.floor(i/5)*70);models.push(m);}const generated=performance.now()-start,renderer=new rt.module.OptimizedFamilyRenderer({chunkSize:2048}),begin=performance.now();renderer.build(models);assert.ok(renderer.stats.outputMeshes<=36);assert.equal(rt.generator.leases.size,count);records.push({count,generationCpuMs:generated,batchCpuMs:performance.now()-begin,triangles:renderer.stats.triangles,batches:renderer.stats.outputMeshes,maps:5});renderer.clear();for(const m of models)rt.generator.release(m);rt.generator.prune();assert.equal(rt.generator.cache.size,0);assert.equal(rt.generator.leases.size,0);}console.log('Curved original CPU/batch fixtures',JSON.stringify(records));});

test('the internal benchmark, approved architecture and shared infrastructure remain byte-identical',()=>{const lock=JSON.parse(fs.readFileSync(path.join(__dirname,'../architecture/lightweight/curved-source-lock.json')));for(const [file,hash]of Object.entries(lock.preserved))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file))).digest('hex'),hash,file);});

test('Arcus revision2 continues its existing glazing grid into paired roof fins above the plant housing',()=>{const a=api(),rt=a.pcCurvedReady(),s=rt.module.normalizeSpecification({archetype:'A',revision:2}),plan=rt.module.massing(s),m=rt.generator.generate(s),parts=m.userData.partRanges.filter(p=>p.label==='continued glazing roof fins'&&p.material==='glass'+s.palette);assert.ok(parts.length);for(const part of parts){const g=m.children.find(c=>c.name===part.material).geometry,p=g.attributes.position;let max=0;for(let i=part.start;i<part.end;i++){assert.ok(p.getY(i)>=plan.roof-.001);max=Math.max(max,p.getY(i));assert.ok(Math.abs((p.getX(i)/(s.width*.35))**2+(p.getZ(i)/(s.depth*.35))**2-1)<.001);}assert.ok(Math.abs(max-plan.roof-3*s.floorHeight)<.001);}assert.ok(m.userData.bounds.max[1]>plan.roof+10);assert.equal(m.children.length,7);const legacy=rt.generator.generate({...s,revision:1});assert.ok(!legacy.userData.partRanges.some(p=>p.label==='continued glazing roof fins'));rt.generator.release(m);rt.generator.release(legacy);rt.generator.prune();});

test('Crescent rounded corners and doubled native inset contain its upper four floors and central plant; C remains unchanged',()=>{const a=api(),rt=a.pcCurvedReady();for(const [width,depth]of [[50.4,36],[67.2,43.2],[72,48]]){const s=rt.module.normalizeSpecification({archetype:'B',revision:2,width,depth}),p=rt.module.massing(s),old=rt.module.massing({...s,revision:1}),shaft=p.sections[1],attic=p.sections[2],ring=r=>r.map(([x,z])=>({x,z}));assert.equal(attic.end-attic.start,4);assert.ok(a.sn(a.je(a.Te(ring(attic.ring)),a.Te(ring(shaft.ring))))<.0001);const minZ=r=>Math.min(...r.map(p=>p[1]));assert.ok(Math.abs((minZ(attic.ring)-minZ(shaft.ring))-.05*depth)<.001);assert.ok(Math.abs((minZ(old.sections[2].ring)-minZ(old.sections[1].ring))-.025*depth)<.001);assert.notEqual(p.groundRing.length,old.groundRing.length);const m=rt.generator.generate(s),part=m.userData.partRanges.find(p=>p.label==='original restrained roof termination'&&p.material==='dark'),g=m.children.find(c=>c.name===part.material).geometry;for(let i=part.start;i<part.end;i++)assert.ok(Math.abs(g.attributes.position.getX(i))<=width*.22+.01);rt.generator.release(m);}const one=rt.generator.generate({archetype:'C',revision:1}),two=rt.generator.generate({archetype:'C',revision:2});for(let i=0;i<one.children.length;i++){const a=one.children[i].geometry,b=two.children[i].geometry;for(const k of ['position','normal','uv'])assert.deepEqual(Array.from(a.attributes[k].array),Array.from(b.attributes[k].array));assert.deepEqual(Array.from(a.index.array),Array.from(b.index.array));}rt.generator.release(one);rt.generator.release(two);rt.generator.prune();});

test('new Arcus glazing follows the upper facade angle along both axes',()=>{
 const rt=api().pcCurvedReady();
 for(const [width,depth] of [[36,28.8],[48,40.8],[72,48]]){
  const s=rt.module.normalizeSpecification({archetype:'A',width,depth});
  const plan=rt.module.massing(s),upper=plan.sections.at(-1),m=rt.generator.generate(s);
  const range=m.userData.partRanges.find(p=>p.label==='continued glazing roof fins'&&p.material==='glass'+s.palette);
  const {position,normal}=m.children.find(c=>c.name===range.material).geometry.attributes;
  const slope=(upper.topRing[0][1]-upper.ring[0][1])/((upper.end-upper.start)*s.floorHeight);
  const ratio=1+slope*3*s.floorHeight/upper.topRing[0][1];
  assert.ok(ratio<1);
  for(let i=range.start;i<range.end;i+=8){
   for(const [lower,higher] of [[i,i+1],[i+3,i+2]]){
    assert.ok(Math.abs(position.getY(higher)-position.getY(lower)-3*s.floorHeight)<.001);
    assert.ok(Math.abs(position.getX(higher)-position.getX(lower)*ratio)<.001);
    assert.ok(Math.abs(position.getZ(higher)-position.getZ(lower)*ratio)<.001);
    const tangentDot=normal.getX(lower)*(position.getX(higher)-position.getX(lower))
      +normal.getY(lower)*(position.getY(higher)-position.getY(lower))
      +normal.getZ(lower)*(position.getZ(higher)-position.getZ(lower));
    assert.ok(Math.abs(tangentDot)<.001);
   }
  }
  rt.generator.release(m);
 }
 rt.generator.prune();
});

test('the approved Splice reference and saved Crescent revisions retain their footprint and record',()=>{
 const a=api(),rt=a.pcCurvedReady(),{z,n}=city(a);
 const lot=z.properties.find(p=>a.pcCurvedFit(p,'B',{revision:3}).ok),fresh=a.pcCurvedFit(lot,'B',{revision:3}).record;
 assert.equal(fresh.parameters.revision,3);
 assert.match(fresh.parameters.name,/Splice Tower/);
 const shaft=fresh.grid.sections[1].ring;
 const {width,depth}=fresh.parameters;
 for(const side of [-1,1]){
  assert.ok(shaft.some(([x,z])=>Math.abs(x)<width*.12&&Math.abs(z-side*depth*.33*.88)<.001));
  assert.ok(shaft.some(([x,z])=>Math.abs(x)>width*.23&&Math.abs(z-side*depth*.5*.88)<.001));
 }
 const key=a.pcCurvedDefinitions.find(d=>d.archetype==='B').key;
 for(const revision of [1,2]){
  const parameters={...fresh.parameters,revision,name:'Crescent Plaza · B'};
  const grid=rt.module.massing(parameters),record={...plain(fresh),parameters,grid:plain(grid)};
  const zoning=plain(n.captureState().participants.zoning);
  zoning.catalogueAssignments=[[lot.id,key]];
  zoning.lightweightCurved={assignments:[[lot.id,record]]};
  n.historyParticipants.get('zoning').restore(zoning);
  assert.deepEqual(plain(a.pcCurvedHistory(z).assignments),[[lot.id,record]]);
  const restored=a.pcCurvedHistory(z).assignments[0][1];
  assert.equal(rt.module.massing(restored.parameters).sections[1].name,'broad crescent shaft');
  assert.ok(grid.entrance.z<depth*.1);
 }
});

test('15 production towers reflow their forms on native lots with full-detail and distant geometry',()=>{
 const a=api(),rt=a.pcCurvedReady(),rows=[];
 for(const archetype of ['A','B','C']){
  const forms=new Set,shapes=new Set;
  for(const [i,[width,depth,storeys]] of [[48,44,20],[55,49,32],[64,54,44],[74,59,56],[84,68,70]].entries()){
   const angle=i%2?.43:0;
   const lot={id:archetype+i,x:0,z:0,y:0,zone:'offices',area:width*depth,towardRoad:{x:Math.sin(angle),z:Math.cos(angle)},
    footprint:[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]].map(([x,z])=>({x:x*Math.cos(angle)+z*Math.sin(angle),z:z*Math.cos(angle)-x*Math.sin(angle)}))};
   const fit=a.pcCurvedFit(lot,archetype,{storeys,variant:i%3});
   assert.ok(fit.ok,archetype+storeys+': '+fit.reason);
   const r=fit.record,{parameters:s,grid,placement}=r,near=rt.generator.generate(s),far=rt.generator.generate(s,{distant:true});
   assert.equal(s.revision,4);assert.equal(s.storeys,storeys);assert.equal(placement.scale,1);assert.equal(s.floorHeight,3.4);
   assert.ok(Math.abs(placement.angle-angle)<1e-6);
   assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(lot.footprint)))<.0001);
   assert.ok(grid.entrance.z>0);
   assert.ok(grid.sections.every(section=>section.end>section.start));
   assert.ok(near.userData.architecture.grids.every(g=>g.pitch>1.35&&g.pitch<3.5));
   assert.ok(near.userData.triangles<38000);
   assert.ok(far.userData.triangles<near.userData.triangles*.65);
   assert.equal(near.children.length,far.children.length);
   for(const mesh of near.children){
    assert.equal(mesh.material,far.children.find(c=>c.name===mesh.name).material);
    const p=mesh.geometry.attributes.position;
    for(let j=0;j<p.count;j++)assert.ok(Math.abs(p.getX(j))<s.width/2+1.1&&Math.abs(p.getZ(j))<s.depth/2+1.1);
   }
   for(let j=1;j<grid.sections.length;j++){
    const lower=grid.sections[j-1].topRing,upper=grid.sections[j].ring;
    const polygon=ring=>a.Te(ring.map(([x,z])=>({x,z})));
    assert.ok(a.sn(a.je(polygon(upper),polygon(lower)))<.001,archetype+' unsupported section '+j);
   }
   forms.add(s.variant);
   const unit=rt.module.massing({...s,width:60,depth:48,storeys:48});
   shapes.add(JSON.stringify(unit.sections));
   rows.push({archetype,form:s.variant,width:s.width,depth:s.depth,storeys,near:near.userData.triangles,far:far.userData.triangles});
   rt.generator.release(near);rt.generator.release(far);
  }
  assert.equal(forms.size,3);assert.equal(shapes.size,3);
 }
 rt.generator.prune();assert.equal(rt.generator.cache.size,0);
 console.log('Curved production portfolio',JSON.stringify(rows));
});

test('normal Office paint grows all three designs and redevelopment stays deterministic through LOD and history',()=>{
 const a=api(),n=new a.zb,roads=[];
 n.terrain=a.Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
 for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
 n.addBatch(roads);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');
 const eligible=z.properties.filter(p=>['A','B','C'].some(type=>a.pcCurvedFit(p,type).ok)).filter((_,i)=>i%2===0);
 z.applyProperties(eligible,'offices');
 const towers=z.buildings.filter(b=>b.office.lightweightCurved);
 assert.deepEqual([...new Set(towers.map(b=>b.office.lightweightCurved.parameters.archetype))].sort(),['A','B','C']);
 assert.ok(towers.length<z.buildings.length);
 const b=towers[0],property=eligible.find(p=>p.id===b.propertyIds[0]),before=plain(b.office.lightweightCurved);
 assert.equal(z.demolish(b.id),true);z.applyProperties([property],'offices');
 assert.deepEqual(plain(z.buildings.find(b=>b.propertyIds.includes(property.id)).office.lightweightCurved),before);
 const scene=new a.Se,renderer=a.pS(scene);renderer.render(z);
 const near=a.pcCurvedInfo(),chunks=[...a.pcCurvedChunks],anchor=chunks[0];
 assert.ok(chunks.length&&near.nearTriangles>0);
 assert.equal(a.pcCurvedUpdateLOD({x:5000,y:5000,z:5000}),true);
 const far=a.pcCurvedInfo();
 assert.equal(far.distantChunks,chunks.length);
 assert.ok(far.visibleTriangles<near.visibleTriangles*.65);
 assert.ok(far.batches<=near.batches);
 assert.equal(anchor.layer.children.length,1);assert.equal(anchor.layer.children[0],anchor.far);
 const mesh=anchor.far.children[0],subject=mesh.userData.pcBmoBuildings[0],p=subject.office.assetPlacement;
 assert.equal(renderer.at({object:mesh,point:{x:p.x,y:subject.y+5,z:p.z}}),subject.id);
 assert.equal(a.pcCurvedUpdateLOD({x:5000,y:5000,z:5000}),false);
 assert.equal(a.pcCurvedUpdateLOD({x:anchor.x,y:anchor.y,z:anchor.z}),true);
 assert.equal(anchor.layer.children[0],anchor.near);
 n.historyParticipants.get('zoning').restore({regions:{rowhouses:[],offices:[]},catalogueAssignments:[],suppressed:[]});z.rebuild();renderer.render(z);
 assert.equal(a.pcCurvedChunks.size,0);assert.equal(a.pcCurvedInfo().leases,0);
});

test('explicit curved Office options work through the normal selector and preserve numeric choices',()=>{
 const a=api(),{z}=city(a),select={value:'',addEventListener(_event,change){this.change=change;}},help={};
 a.pcCatalogueInitMenu({querySelector:s=>s==='#commercial-catalogue'?select:help},z,()=>{});
 assert.match(select.innerHTML,/Curved offices/);
 for(const d of a.pcCurvedDefinitions){
  assert.ok(select.innerHTML.includes(d.key));
  select.value=d.key;select.change();assert.equal(z.pcCatalogueChoice,d.key);
  const property=z.properties.find(p=>a.pcCurvedFit(p,d.archetype).ok);
  z.applyProperties([property],'offices');
  assert.equal(z.buildings.find(b=>b.propertyIds.includes(property.id)).office.lightweightCurved.parameters.archetype,d.archetype);
 }
 select.value='400';select.change();assert.equal(z.pcCatalogueChoice,400);
});
