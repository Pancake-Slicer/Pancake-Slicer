// Family adapter only. Shared BMO polygon fit, placement/history contract,
// chunk renderer, cleanup and picking remain authoritative.
const pcVonKey='template:von-badel-lightweight@1.0.0';
const pcVonDefinition={id:'von-badel-lightweight',version:'1.0.0',key:pcVonKey,name:'Lightweight Von Badel International',model:{format:'lightweight-von'},dimensions:{windowBays:0}};
let pcVonRuntime=null;const pcVonBatches=new Set,pcVonFits=new WeakMap;
function pcVonReady(){
 if(!pcVonRuntime){const engine=pcOhneeEngine(),module=pcVonPackage(engine),shared=pcBmoRuntime?.module||pcBmoPackage(engine),generator=new module.VonGenerator;for(const material of Object.values(generator.materials))pcRebuiltLighting(material);const system=shared.createTemplateSystem({definition:module.vonTemplate,generator,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}});pcVonRuntime={module:{...module,OptimizedFamilyRenderer:shared.OptimizedFamilyRenderer},generator,system,materials:{apply:model=>model}};}return pcVonRuntime;
}
function pcVonControl(collection){return collection.pcVonControl||{enabled:pcLightweightDefaults(),favour:false};}
function pcVonSetControl(collection,value){collection.network.remember();collection.pcVonControl={enabled:!!value.enabled,favour:!!value.favour};if(value.enabled)pcVonReady();collection.pcVonRefresh?.();}
function pcVonHistory(collection){return {control:{...pcVonControl(collection)},assignments:[...(collection.pcVonAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};}
function pcVonValidate(record){pcVonReady().system.validateRecord(record);return record;}
function pcVonRestore(collection,snapshot){const before=JSON.stringify(pcVonHistory(collection)),records=new Map;for(const [id,r]of snapshot?.assignments||[]){pcVonValidate(r);if(id!==r.lotId||records.has(id))throw Error('Invalid duplicate/mismatched Von history');records.set(id,structuredClone(r));}collection.pcVonAssignments=records;collection.pcVonControl={enabled:!!(snapshot?.control?.enabled??pcLightweightDefaults()),favour:!!snapshot?.control?.favour};collection.pcVonRefresh?.();return before!==JSON.stringify(pcVonHistory(collection));}
function pcVonFit(property){
 if(pcVonFits.has(property))return pcVonFits.get(property);
 const h=pcOfficeHash(property.id+':lightweight-von'),capacity=Math.min(52,property.officeProfile?.maxFloors||80,property.area<1200?24:property.area<1800?40:property.area<2500?60:80);let fit;
 if(property.zone!=='offices'||!property.towardRoad||property.area<600||capacity<12)fit={ok:false,reason:'Von requires an Office lot with at least12-floor capacity and600m²'};
 else{const minimum=Math.min(capacity,Math.max(12,property.officeProfile?.minFloors||12)),storeys=minimum+((h>>>2)%Math.max(1,capacity-minimum+1)),parameters={id:'von:'+property.id,name:'Von Badel International office',seed:String(h),storeys,floorHeight:[3.6,3.7,3.8][h%3],targetBay:[3.5,3.7,3.9][(h>>>4)%3]},runtime=pcVonReady();if(property.area>1100&&storeys>=18&&h%2===0)fit=runtime.system.fit(property,{parameters:{...parameters,podium:{storeys:Math.max(3,Math.round(storeys*.27))}},seed:String(h),capacity});if(!fit?.ok)fit=runtime.system.fit(property,{parameters,seed:String(h),capacity});}
 pcVonFits.set(property,fit);return fit;
}
function pcVonAsset(record){const s=record.parameters,windowBays=record.grid.volumes.reduce((n,v)=>n+2*(v.front.count+v.side.count)*(v.end-v.start),0);return {...pcVonDefinition,record,dimensions:{floors:s.storeys,floorHeight:s.floorHeight,height:s.storeys*s.floorHeight+3.3,windowBays}};}
function pcVonChoose(collection,property,forPaint=false){
 if(forPaint&&collection.pcCatalogueChoice)return null;const assigned=collection.pcCatalogueAssignments?.get(property.id),control=pcVonControl(collection);
 if(assigned===pcVonKey){if(forPaint&&!control.enabled)return null;const r=collection.pcVonAssignments?.get(property.id);if(!r)return null;pcVonValidate(r);return sn(je(Te(r.footprint),Te(property.footprint)))<.0001?pcVonAsset(r):null;}
 if(assigned!==undefined||collection.pcCatalogueChoice||!control.enabled)return null;
 const favoured=[pcBmoControl(collection),pcLindControl(collection)].filter(c=>c.enabled&&c.favour).length;
 if(!control.favour&&favoured)return null;
 if(control.favour&&favoured&&(pcOfficeHash(property.id+':von-favoured')>>>12)%(favoured+1)!==0)return null;
 if(!control.favour&&(pcOfficeHash(property.id+':von-selection')>>>12)%4!==2)return null;const fit=pcVonFit(property);return fit.ok?pcVonAsset(fit.record):null;
}
function pcVonPlacement(property,asset){const r=asset.record,p=r.placement,s=r.parameters,z=s.podium?s.podium.depth/2:s.depth/2;return {...p,footprint:r.footprint,entrance:{x:p.x+Math.sin(p.angle)*z,y:property.y,z:p.z+Math.cos(p.angle)*z}};}
function pcVonRemember(collection,property,asset){if(!collection.pcVonAssignments)collection.pcVonAssignments=new Map;if(asset?.model.format==='lightweight-von')collection.pcVonAssignments.set(property.id,structuredClone(asset.record));else collection.pcVonAssignments.delete(property.id);}
const pcVonAdapter={ready:pcVonReady,batches:pcVonBatches,name:'Lightweight Von chunk',record:building=>{if(!building.office.lightweightVon)throw Error('Missing fitted Von record');return building.office.lightweightVon;}};
function pcVonInfo(){return pcBmoInfo(pcVonBatches,pcVonRuntime);}
function pcVonInitControls(collection){
 const panel=document.querySelector('#bmo-development');if(!panel)return;panel.querySelector('summary').textContent='Development · Lightweight offices';const row=document.createElement('div');row.innerHTML='<p><label><input id="von-enabled" type="checkbox"> Lightweight Von Growables: ON / OFF</label></p><p><label><input id="von-favour" type="checkbox"> Favour Von during testing</label></p><p id="von-state"></p><pre id="von-performance"></pre>';panel.append(row);
 const enabled=row.querySelector('#von-enabled'),favour=row.querySelector('#von-favour'),state=row.querySelector('#von-state'),perf=row.querySelector('#von-performance');collection.pcVonRefresh=()=>{const c=pcVonControl(collection);enabled.checked=c.enabled;favour.checked=c.favour;state.textContent=(c.enabled?'Von ON. ':'Von OFF. ')+(c.favour?'Favour Von on suitable new Office lots. ':'Mix with BMO and the existing catalogue. ')+'Existing buildings stay. Use Mix all98; native lot fit still applies.';};enabled.onchange=favour.onchange=()=>{try{pcVonSetControl(collection,{enabled:enabled.checked,favour:favour.checked});}catch(e){state.textContent=e.message;}};collection.pcVonRefresh();const previous=pcBmoPerfHook;let last=0;pcBmoPerfHook=time=>{previous?.(time);if(!panel.open||time-last<500)return;last=time;const info=pcVonInfo();perf.textContent=`${info.activeBuildings} Von · ${info.batches} chunk batches\n${info.materials} opaque materials / ${info.textures} maps\n${pcVonRuntime?'Shared native template ready.':'Lazy: no Von geometry allocated.'}`;};
}
