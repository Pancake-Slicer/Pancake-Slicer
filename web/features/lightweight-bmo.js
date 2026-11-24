// Host-only integration. Architectural sources are unchanged; records contain
// full fitted specifications rather than references to five fixed models.
const pcBmoKey='template:bmo-horizontal-lightweight@1.0.0';
const pcBmoDefinition={id:'bmo-horizontal-lightweight',version:'1.0.0',key:pcBmoKey,name:'Lightweight BMO-inspired office',model:{format:'lightweight-bmo'}};
let pcBmoRuntime=null,pcBmoFrames=[],pcBmoPerfHook=null;const pcBmoBatches=new Set,pcBmoFits=new WeakMap;
function pcBmoReady(){
 if(!pcBmoRuntime){const module=pcBmoPackage(pcOhneeEngine()),generator=new module.BmoGenerator,system=module.createTemplateSystem({definition:module.bmoTemplate,generator,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}});pcBmoRuntime={module,generator,system,materials:pcBmoMaterialLibrary(generator.materials)};}
 return pcBmoRuntime;
}
function pcBmoControl(collection){return collection.pcBmoControl||{enabled:false,favour:false};}
function pcBmoSetControl(collection,value){collection.network.remember();collection.pcBmoControl={enabled:!!value.enabled,favour:!!value.favour};if(value.enabled)pcBmoReady();collection.pcBmoRefresh?.();}
function pcBmoHistory(collection){return {control:{...pcBmoControl(collection)},assignments:[...(collection.pcBmoAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};}
function pcBmoRestore(collection,snapshot){
 const before=JSON.stringify(pcBmoHistory(collection)),records=new Map;
 for(const [id,record]of snapshot?.assignments||[]){pcBmoReady().system.validateRecord(record);if(id!==record.lotId||records.has(id))throw Error('Invalid BMO history');records.set(id,structuredClone(record));}
 collection.pcBmoAssignments=records;collection.pcBmoControl={enabled:!!(snapshot?.control?.enabled??pcLightweightDefaults()),favour:!!snapshot?.control?.favour};if(collection.pcBmoControl.enabled)pcBmoReady();collection.pcBmoRefresh?.();return before!==JSON.stringify(pcBmoHistory(collection));
}
function pcBmoFit(property){
 if(pcBmoFits.has(property))return pcBmoFits.get(property);
 const h=pcOfficeHash(property.id+':lightweight-bmo'),capacity=Math.min(55,property.officeProfile?.maxFloors||80,property.area<1200?24:property.area<1800?40:property.area<2500?60:80),minimum=Math.min(capacity,Math.max(10,property.officeProfile?.minFloors||10)),storeys=minimum+((h>>>2)%Math.max(1,capacity-minimum+1)),parameters={id:'bmo:'+property.id,name:'BMO-inspired office',storeys,floorHeight:[3.5,3.65,3.8][h%3],equipmentCount:1+(h%3)};
 let fit;
 if(property.area>1600&&storeys>=20&&h%3===0)fit=pcBmoReady().system.fit(property,{parameters:{...parameters,podium:true},seed:String(h),capacity});
 if(!fit?.ok)fit=pcBmoReady().system.fit(property,{parameters,seed:String(h),capacity});
 pcBmoFits.set(property,fit);return fit;
}
function pcBmoAsset(record){
 const s=record.parameters,height=s.lobbyHeight+(s.storeys-1)*s.floorHeight+s.capHeight+s.penthouseHeight+.12;
 return {...pcBmoDefinition,record,dimensions:{floors:s.storeys,floorHeight:s.floorHeight,height,windowBays:2*(record.grid.tower.front.count+record.grid.tower.side.count)*s.storeys}};
}
function pcBmoChoose(collection,property,forPaint=false){
 if(forPaint&&collection.pcCatalogueChoice)return null;
 const assigned=collection.pcCatalogueAssignments?.get(property.id);
 if(forPaint&&assigned===pcBmoKey&&!pcBmoControl(collection).enabled)return null;
 if(assigned===pcBmoKey){const r=collection.pcBmoAssignments?.get(property.id);if(!r)return null;pcBmoReady().system.validateRecord(r);return sn(je(Te(r.footprint),Te(property.footprint)))<.0001?pcBmoAsset(r):null;}
 if(assigned!==undefined||collection.pcCatalogueChoice||!pcBmoControl(collection).enabled)return null;
 if(!pcBmoControl(collection).favour&&pcOfficeHash(property.id+':bmo-selection')%4!==0)return null;
 const fit=pcBmoFit(property);return fit.ok?pcBmoAsset(fit.record):null;
}
function pcBmoPlacement(property,asset){const r=asset.record,p=r.placement;return {...p,footprint:r.footprint,entrance:{x:p.x+Math.sin(p.angle)*(r.parameters.podium?.depth||r.parameters.depth)/2,y:property.y,z:p.z+Math.cos(p.angle)*(r.parameters.podium?.depth||r.parameters.depth)/2}};}
function pcBmoRemember(collection,property,asset){if(!collection.pcBmoAssignments)collection.pcBmoAssignments=new Map;if(asset?.record)collection.pcBmoAssignments.set(property.id,structuredClone(asset.record));else collection.pcBmoAssignments.delete(property.id);}
function pcBmoQueue(building,queue,B,statistics){
 if(building.office?.assetKey!==pcBmoKey)return false;
 if(!building.office.lightweightBmo)throw Error('Missing fitted BMO specification');
 if(!queue.has(pcBmoKey))queue.set(pcBmoKey,{asset:pcBmoDefinition,buildings:[]});queue.get(pcBmoKey).buildings.push(building);
 B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18),pcRebuiltSolid('foundation','#9a9a8d',.97),building.id);statistics.windows+=2*(building.office.lightweightBmo.grid.tower.front.count+building.office.lightweightBmo.grid.tower.side.count)*building.floors;return true;
}
function pcBmoFlush(buildings,group){
 if(!buildings.length)return;
 const runtime=pcBmoReady(),models=[],batch=new runtime.module.OptimizedFamilyRenderer({chunkSize:256});
 try{
  for(const building of buildings){const record=structuredClone(building.office.lightweightBmo);record.placement.y=building.y;models.push(runtime.materials.apply(runtime.system.generate(record),record));}
  batch.build(models);batch.root.name='Lightweight BMO chunk';
  for(const mesh of batch.root.children){mesh.userData.pcSharedAssetGeometry=true;mesh.userData.pcBmoBuildings=mesh.userData.sourceBuildings.map(i=>buildings[i]);}
  const record={batch,models};pcBmoBatches.add(record);batch.root.userData.pcBmoCleanup=()=>{pcBmoBatches.delete(record);batch.clear();models.forEach(m=>runtime.system.release(m));};group.add(batch.root);
 }catch(error){batch.clear();models.forEach(m=>runtime.system.release(m));runtime.generator.prune();throw error;}
}
function pcBmoClearChunk(group){for(const child of [...group.children])child.userData.pcBmoCleanup?.();}
function pcBmoPick(hit){
 const p={x:hit.point.x,z:hit.point.z};for(const b of hit.object.userData.pcBmoBuildings||[]){const ring=b.office.assetPlacement.footprint;if(Kr(p,ring)||ring.some((a,i)=>{const c=ring[(i+1)%ring.length],dx=c.x-a.x,dz=c.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)<.02;}))return b.id;}return undefined;
}
function pcBmoInfo(){
 const geometry=new Set,materials=new Set,textures=new Set;let count=0,batches=0,mergedBytes=0;
 for(const record of pcBmoBatches){count+=record.models.length;batches+=record.batch.stats.outputMeshes;mergedBytes+=record.batch.stats.ownedGeometryBytes;record.models.forEach(m=>m.traverse(c=>{if(!c.geometry)return;geometry.add(c.geometry);materials.add(c.material);Object.values(c.material).forEach(v=>{if(v?.isTexture)textures.add(v);});}));}
 return {activeBuildings:count,batches,mergedBytes,sourceGeometryBytes:[...geometry].reduce((n,g)=>n+Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+(g.index?.array.byteLength||0),0),materials:materials.size,textures:textures.size,cacheEntries:pcBmoRuntime?.generator.cache.size||0,leases:pcBmoRuntime?.generator.leases.size||0};
}
function pcBmoFrame(time){if(!pcBmoPerfHook)return;pcBmoFrames.push(time);if(pcBmoFrames.length>61)pcBmoFrames.shift();pcBmoPerfHook(time);}
function pcBmoInitControls(collection,graphicsInfo){
 if(!new URLSearchParams(location.search).has('lightweight-bmo')&&!document.documentElement.hasAttribute('data-bmo-development'))return;
 const panel=document.createElement('details');panel.open=true;panel.id='bmo-development';panel.style.cssText='position:fixed;right:12px;bottom:44px;z-index:30;background:#172e38;color:#eef5f5;padding:12px;border:1px solid #6b8995;border-radius:6px;width:310px;font:12px system-ui;max-height:50vh;overflow:auto';
 panel.innerHTML='<summary>Development · Lightweight BMO</summary><p><label><input id="bmo-enabled" type="checkbox"> Lightweight BMO Growables: ON / OFF</label></p><p><label><input id="bmo-favour" type="checkbox"> Favour BMO during testing</label></p><p>Future Office growth only. Choose Mix all 98 and zone new lots. Existing buildings stay when OFF.</p><pre id="bmo-performance"></pre><p id="bmo-state"></p>';document.body.append(panel);
 const enabled=panel.querySelector('#bmo-enabled'),favour=panel.querySelector('#bmo-favour'),state=panel.querySelector('#bmo-state'),perf=panel.querySelector('#bmo-performance');
 const refresh=()=>{const value=pcBmoControl(collection);enabled.checked=value.enabled;favour.checked=value.favour;state.textContent=(value.enabled?'ON: eligible new lots may grow BMO.':'OFF: new growth uses the existing catalogue.')+' Native lot fit and capacity still apply.';};
 enabled.onchange=favour.onchange=()=>{try{pcBmoSetControl(collection,{enabled:enabled.checked,favour:favour.checked});}catch(error){state.textContent='BMO unavailable: '+error.message;}};collection.pcBmoRefresh=refresh;refresh();let last=0;
 pcBmoPerfHook=time=>{if(!panel.open||time-last<500)return;last=time;const values=pcBmoFrames.slice(1).map((t,i)=>t-pcBmoFrames[i]).filter(t=>t>0&&t<1000),ms=values.length?values.reduce((a,b)=>a+b,0)/values.length:0,render=graphicsInfo();perf.textContent=`${ms?(1000/ms).toFixed(1):'—'} FPS (frame loop) · ${ms?ms.toFixed(1):'—'} ms\n${render?.calls??'—'} draw calls · ${(render?.triangles||0).toLocaleString()} triangles\n${collection.buildings.filter(b=>b.office?.lightweightBmo).length} active BMO buildings\nGraphics: ${render?.gpuRenderer||'unavailable'}`;};
}
