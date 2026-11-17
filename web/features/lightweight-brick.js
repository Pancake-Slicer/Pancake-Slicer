// Family adapter only. Shared BMO polygon fit, placement/history contract,
// chunk renderer, cleanup and picking remain authoritative.
const pcBrickKey='template:brick-commercial-lightweight@1.0.0';
const pcBrickDefinition={id:'brick-commercial-lightweight',version:'1.0.0',key:pcBrickKey,name:'Lightweight Brick Commercial',model:{format:'lightweight-brick'},dimensions:{windowBays:0}};
let pcBrickRuntime=null;const pcBrickBatches=new Set,pcBrickFits=new WeakMap;
function pcBrickReady(){
 if(!pcBrickRuntime){const engine=pcOhneeEngine(),module=pcBrickPackage(engine),shared=pcBmoRuntime?.module||pcBmoPackage(engine),generator=new module.BrickGenerator;for(const material of Object.values(generator.materials))pcRebuiltLighting(material);const system=shared.createTemplateSystem({definition:module.brickTemplate,generator,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}});pcBrickRuntime={module:{...module,OptimizedFamilyRenderer:shared.OptimizedFamilyRenderer},generator,system,materials:{apply:model=>model}};}return pcBrickRuntime;
}
function pcBrickControl(collection){return collection.pcBrickControl||{enabled:typeof document!=='undefined'&&!!document.documentElement?.hasAttribute?.('data-brick-growables'),favour:false};}
function pcBrickSetControl(collection,value){collection.network.remember();collection.pcBrickControl={enabled:!!value.enabled,favour:!!value.favour};if(value.enabled)pcBrickReady();collection.pcBrickRefresh?.();}
function pcBrickHistory(collection){return {control:{...pcBrickControl(collection)},assignments:[...(collection.pcBrickAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};}
function pcBrickValidate(record){pcBrickReady().system.validateRecord(record);return record;}
function pcBrickRestore(collection,snapshot){const before=JSON.stringify(pcBrickHistory(collection)),records=new Map;for(const [id,r]of snapshot?.assignments||[]){pcBrickValidate(r);if(id!==r.lotId||records.has(id))throw Error('Invalid duplicate/mismatched Brick history');records.set(id,structuredClone(r));}collection.pcBrickAssignments=records;collection.pcBrickControl={enabled:!!snapshot?.control?.enabled,favour:!!snapshot?.control?.favour};collection.pcBrickRefresh?.();return before!==JSON.stringify(pcBrickHistory(collection));}
function pcBrickFit(property){
 if(pcBrickFits.has(property))return pcBrickFits.get(property);
 const h=pcOfficeHash(property.id+':lightweight-brick'),capacity=Math.min(42,property.officeProfile?.maxFloors||80,property.area<1200?24:property.area<1800?40:property.area<2500?60:80);let fit;
 if(property.zone!=='offices'||!property.towardRoad||property.area<600||capacity<12)fit={ok:false,reason:'Brick requires an Office lot with at least12-floor capacity and600m²'};
 else{const minimum=Math.min(capacity,Math.max(12,property.officeProfile?.minFloors||12)),storeys=minimum+((h>>>2)%Math.max(1,capacity-minimum+1)),parameters={id:'brick:'+property.id,name:'Brick Commercial office',seed:String(h),storeys,floorHeight:[3.6,3.65,3.7][h%3],targetBay:[3.1,3.3,3.5][(h>>>4)%3]},runtime=pcBrickReady();fit=runtime.system.fit(property,{parameters,seed:String(h),capacity});}
 pcBrickFits.set(property,fit);return fit;
}
function pcBrickAsset(record){const s=record.parameters,windowBays=record.grid.volumes.reduce((n,v)=>n+2*(v.front.count+v.side.count)*(v.end-v.start),0);return {...pcBrickDefinition,record,dimensions:{floors:s.storeys,floorHeight:s.floorHeight,height:s.storeys*s.floorHeight+3.4,windowBays}};}
function pcBrickChoose(collection,property,forPaint=false){
 if(forPaint&&collection.pcCatalogueChoice)return null;const assigned=collection.pcCatalogueAssignments?.get(property.id),control=pcBrickControl(collection);
 if(assigned===pcBrickKey){if(forPaint&&!control.enabled)return null;const r=collection.pcBrickAssignments?.get(property.id);if(!r)return null;pcBrickValidate(r);return sn(je(Te(r.footprint),Te(property.footprint)))<.0001?pcBrickAsset(r):null;}
 if(assigned!==undefined||collection.pcCatalogueChoice||!control.enabled)return null;
 const favoured=[pcBmoControl(collection),pcLindControl(collection),pcVonControl(collection)].filter(c=>c.enabled&&c.favour).length;
 if(!control.favour&&favoured)return null;
 if(control.favour&&favoured&&(pcOfficeHash(property.id+':brick-favoured')>>>12)%(favoured+1)!==0)return null;
 if(!control.favour&&(pcOfficeHash(property.id+':brick-selection')>>>12)%5!==3)return null;const fit=pcBrickFit(property);return fit.ok?pcBrickAsset(fit.record):null;
}
function pcBrickPlacement(property,asset){const r=asset.record,p=r.placement,s=r.parameters,z=s.podium?s.podium.depth/2:s.depth/2;return {...p,footprint:r.footprint,entrance:{x:p.x+Math.sin(p.angle)*z,y:property.y,z:p.z+Math.cos(p.angle)*z}};}
function pcBrickRemember(collection,property,asset){if(!collection.pcBrickAssignments)collection.pcBrickAssignments=new Map;if(asset?.model.format==='lightweight-brick')collection.pcBrickAssignments.set(property.id,structuredClone(asset.record));else collection.pcBrickAssignments.delete(property.id);}
const pcBrickAdapter={ready:pcBrickReady,batches:pcBrickBatches,name:'Lightweight Brick chunk',record:building=>{if(!building.office.lightweightBrick)throw Error('Missing fitted Brick record');return building.office.lightweightBrick;}};
function pcBrickInfo(){return pcBmoInfo(pcBrickBatches,pcBrickRuntime);}
function pcBrickInitControls(collection){
 const panel=document.querySelector('#bmo-development');if(!panel)return;panel.querySelector('summary').textContent='Development · Lightweight offices';const row=document.createElement('div');row.innerHTML='<p><label><input id="brick-enabled" type="checkbox"> Lightweight Brick Growables: ON / OFF</label></p><p><label><input id="brick-favour" type="checkbox"> Favour Brick during testing</label></p><p id="brick-state"></p><pre id="brick-performance"></pre>';panel.append(row);
 const enabled=row.querySelector('#brick-enabled'),favour=row.querySelector('#brick-favour'),state=row.querySelector('#brick-state'),perf=row.querySelector('#brick-performance');collection.pcBrickRefresh=()=>{const c=pcBrickControl(collection);enabled.checked=c.enabled;favour.checked=c.favour;state.textContent=(c.enabled?'Brick ON. ':'Brick OFF. ')+(c.favour?'Favour Brick on suitable new Office lots. ':'Mix with BMO and the existing catalogue. ')+'Existing buildings stay. Use Mix all98; native lot fit still applies.';};enabled.onchange=favour.onchange=()=>{try{pcBrickSetControl(collection,{enabled:enabled.checked,favour:favour.checked});}catch(e){state.textContent=e.message;}};collection.pcBrickRefresh();const previous=pcBmoPerfHook;let last=0;pcBmoPerfHook=time=>{previous?.(time);if(!panel.open||time-last<500)return;last=time;const info=pcBrickInfo();perf.textContent=`${info.activeBuildings} Brick · ${info.batches} chunk batches\n${info.materials} opaque materials / ${info.textures} maps\n${pcBrickRuntime?'Shared native template ready.':'Lazy: no Brick geometry allocated.'}`;};
}
