// Family adapter only. Shared BMO polygon fit, placement/history contract,
// chunk renderer, cleanup and picking remain authoritative.
const pcLindKey='template:lind-stepped-lightweight@1.0.0';
const pcLindDefinition={id:'lind-stepped-lightweight',version:'1.0.0',key:pcLindKey,name:'Lightweight Lind Art Deco',model:{format:'lightweight-lind'},dimensions:{windowBays:0}};
let pcLindRuntime=null;const pcLindBatches=new Set,pcLindFits=new WeakMap;
function pcLightweightDefaults(){return !!document.documentElement?.hasAttribute?.('data-lightweight-growables');}
function pcLindMaterialLibrary(base){
 // Restrained warm limestone tones; current catalogue shader/metal/roof finish.
 const tones=[['#c3bdad','#cec8b9'],['#beb9ac','#c9c4b6'],['#b6b4ab','#c2c0b5']],owned=new Set(Object.values(base));
 base.bay.color.set('#cbd0ce');base.glass.color.set('#52656b');base.roof.color.set('#697c75');base.dark.color.set('#767a78');
 const sets=tones.map(([stone,trim],i)=>{const a=i?base.stone.clone():base.stone,b=i?base.trim.clone():base.trim;for(const m of [a,b]){pcRebuiltLighting(m);owned.add(m);}a.name='Lind limestone '+i;b.name='Lind piers '+i;a.color.set(stone);b.color.set(trim);return {...base,stone:a,trim:b};});
 return {sets,owned,apply(model,record){if(record.visual?.version!=='1.0.0'||!Number.isInteger(record.visual.tone)||record.visual.tone<0||record.visual.tone>2)throw Error('Unsupported Lind material record');const materials=sets[record.visual.tone];for(const mesh of model.children){if(!materials[mesh.name])throw Error('Unknown Lind material slot');mesh.material=materials[mesh.name];}return model;}};
}
function pcLindReady(){
 if(!pcLindRuntime){const engine=pcOhneeEngine(),module=pcLindPackage(engine),shared=pcBmoRuntime?.module||pcBmoPackage(engine),map=key=>{const r=pcLindTexturePayload[key],m=new engine.DataTexture(new Uint8Array(pcAssetBytes(r.pixels)),r.width,r.height);m.colorSpace=engine.SRGBColorSpace;m.flipY=false;m.generateMipmaps=true;m.minFilter=engine.LinearMipmapLinearFilter;m.magFilter=engine.LinearFilter;m.needsUpdate=true;return m;},base=module.createLindMaterials({bayMap:map('bay'),stoneMap:map('stone'),finish:pcRebuiltLighting}),materials=pcLindMaterialLibrary(base),generator=new module.LindGenerator(base),system=shared.createTemplateSystem({definition:module.lindTemplate,generator,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}});pcLindRuntime={module:{...module,OptimizedFamilyRenderer:shared.OptimizedFamilyRenderer},generator,system,materials};}
 return pcLindRuntime;
}
function pcLindControl(collection){return collection.pcLindControl||{enabled:pcLightweightDefaults(),favour:false};}
function pcLindSetControl(collection,value){collection.network.remember();collection.pcLindControl={enabled:!!value.enabled,favour:!!value.favour};if(value.enabled)pcLindReady();collection.pcLindRefresh?.();}
function pcLindHistory(collection){return {control:{...pcLindControl(collection)},assignments:[...(collection.pcLindAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};}
function pcLindValidate(record){pcLindReady().system.validateRecord(record);if(record.visual?.version!=='1.0.0'||!Number.isInteger(record.visual.tone)||record.visual.tone<0||record.visual.tone>2)throw Error('Invalid Lind material history');return record;}
function pcLindRestore(collection,snapshot){const before=JSON.stringify(pcLindHistory(collection)),records=new Map;for(const [id,r]of snapshot?.assignments||[]){pcLindValidate(r);if(id!==r.lotId||records.has(id))throw Error('Invalid duplicate/mismatched Lind history');records.set(id,structuredClone(r));}collection.pcLindAssignments=records;collection.pcLindControl={enabled:!!snapshot?.control?.enabled,favour:!!snapshot?.control?.favour};collection.pcLindRefresh?.();return before!==JSON.stringify(pcLindHistory(collection));}
function pcLindFit(property){
 if(pcLindFits.has(property))return pcLindFits.get(property);
 const h=pcOfficeHash(property.id+':lightweight-lind'),capacity=Math.min(52,property.officeProfile?.maxFloors||80,property.area<1200?24:property.area<1800?40:property.area<2500?60:80);let fit;
 if(property.zone!=='offices'||!property.towardRoad||property.area<600||capacity<18)fit={ok:false,reason:'Lind requires an Office lot with at least18-floor capacity and600m²'};
 else{const minimum=Math.min(capacity,Math.max(18,property.officeProfile?.minFloors||18)),storeys=minimum+((h>>>2)%Math.max(1,capacity-minimum+1)),parameters={id:'lind:'+property.id,name:'Lind-inspired Art Deco office',seed:String(h),storeys,floorHeight:[3.6,3.7,3.8][h%3],targetBay:[3.5,3.7,3.9][(h>>>4)%3]},runtime=pcLindReady();if(property.area>1400&&storeys>=24&&h%3===0)fit=runtime.system.fit(property,{parameters:{...parameters,podium:{storeys:3+(h%3)}},seed:String(h),capacity});if(!fit?.ok)fit=runtime.system.fit(property,{parameters,seed:String(h),capacity});if(fit.ok)fit.record.visual={version:'1.0.0',tone:pcOfficeHash(property.id+':lind-tone')%3};}
 pcLindFits.set(property,fit);return fit;
}
function pcLindAsset(record){const s=record.parameters,volumes=record.grid.volumes,windowBays=volumes.filter(v=>v.kind!=='louvred').reduce((n,v)=>n+2*(v.front.count+v.side.count)*(v.end-v.start),0);return {...pcLindDefinition,record,dimensions:{floors:s.storeys,floorHeight:s.floorHeight,height:record.grid.crown.peak+.05,windowBays,occupiedFloors:volumes.at(-1).start}};}
function pcLindChoose(collection,property,forPaint=false){
 if(forPaint&&collection.pcCatalogueChoice)return null;const assigned=collection.pcCatalogueAssignments?.get(property.id),control=pcLindControl(collection);
 if(assigned===pcLindKey){if(forPaint&&!control.enabled)return null;const r=collection.pcLindAssignments?.get(property.id);if(!r)return null;pcLindValidate(r);return sn(je(Te(r.footprint),Te(property.footprint)))<.0001?pcLindAsset(r):null;}
 if(assigned!==undefined||collection.pcCatalogueChoice||!control.enabled)return null;
 const bmo=pcBmoControl(collection);if(bmo.enabled&&bmo.favour&&(!control.favour||(pcOfficeHash(property.id+':favoured-family')>>>12)%2===0))return null;
 if(!control.favour&&(pcOfficeHash(property.id+':lind-selection')>>>12)%4!==1)return null;const fit=pcLindFit(property);return fit.ok?pcLindAsset(fit.record):null;
}
function pcLindPlacement(property,asset){const r=asset.record,p=r.placement,s=r.parameters,z=s.podium?s.podium.depth/2:s.depth*.25;return {...p,footprint:r.footprint,entrance:{x:p.x+Math.sin(p.angle)*z,y:property.y,z:p.z+Math.cos(p.angle)*z}};}
function pcLindRemember(collection,property,asset){if(!collection.pcLindAssignments)collection.pcLindAssignments=new Map;if(asset?.model.format==='lightweight-lind')collection.pcLindAssignments.set(property.id,structuredClone(asset.record));else collection.pcLindAssignments.delete(property.id);}
const pcLindAdapter={ready:pcLindReady,batches:pcLindBatches,name:'Lightweight Lind chunk',record:building=>{if(!building.office.lightweightLind)throw Error('Missing fitted Lind record');return building.office.lightweightLind;}};
function pcLindInfo(){return pcBmoInfo(pcLindBatches,pcLindRuntime);}
function pcLindInitControls(collection){
 const panel=document.querySelector('#bmo-development');if(!panel)return;panel.querySelector('summary').textContent='Development · Lightweight offices';const row=document.createElement('div');row.innerHTML='<p><label><input id="lind-enabled" type="checkbox"> Lightweight Lind Growables: ON / OFF</label></p><p><label><input id="lind-favour" type="checkbox"> Favour Lind during testing</label></p><p id="lind-state"></p><pre id="lind-performance"></pre>';panel.append(row);
 const enabled=row.querySelector('#lind-enabled'),favour=row.querySelector('#lind-favour'),state=row.querySelector('#lind-state'),perf=row.querySelector('#lind-performance');collection.pcLindRefresh=()=>{const c=pcLindControl(collection);enabled.checked=c.enabled;favour.checked=c.favour;state.textContent=(c.enabled?'Lind ON. ':'Lind OFF. ')+(c.favour?'Favour Lind on suitable new Office lots. ':'Mix with BMO and the existing catalogue. ')+'Existing buildings stay. Use Mix all98; native lot fit still applies.';};enabled.onchange=favour.onchange=()=>{try{pcLindSetControl(collection,{enabled:enabled.checked,favour:favour.checked});}catch(e){state.textContent=e.message;}};collection.pcLindRefresh();const previous=pcBmoPerfHook;let last=0;pcBmoPerfHook=time=>{previous?.(time);if(!panel.open||time-last<500)return;last=time;const info=pcLindInfo();perf.textContent=`${info.activeBuildings} Lind · ${info.batches} chunk batches\n${info.materials} opaque materials / ${info.textures} maps\n${pcLindRuntime?'Shared native template ready.':'Lazy: no Lind geometry allocated.'}`;};
}
