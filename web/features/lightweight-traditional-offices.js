// Opt-in review catalogue. Production Office growth skips new assignments while disabled.
const pcTraditionalTypes=['A','B','C'];
const pcTraditionalNames=['Grand Courtyard Tower','Metropolitan Exchange','Heritage Commerce Tower'];
const pcTraditionalDefinitions=pcTraditionalTypes.map((archetype,i)=>{
  const id='original-traditional-offices-'+archetype.toLowerCase();
  return {id,key:'template:'+id+'@0.1.0',version:'0.1.0',archetype,name:pcTraditionalNames[i],
    model:{format:'lightweight-traditional'},dimensions:{windowBays:0}};
});
let pcTraditionalRuntime=null;
const pcTraditionalBatches=new Set,pcTraditionalFits=new WeakMap;
function pcTraditionalReady(){
  if(pcTraditionalRuntime)return pcTraditionalRuntime;
  const engine={...pcOhneeEngine(),Vector2:Ft,Shape:As,ShapeGeometry:Mr};
  const module=pcTraditionalPackage(engine),shared=pcBmoRuntime?.module||pcBmoPackage(engine);
  const generator=new module.TraditionalOfficeGenerator();
  const system=shared.createTemplateSystem({definition:module.definition,generator,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}});
  return pcTraditionalRuntime={module:{OptimizedFamilyRenderer:shared.OptimizedFamilyRenderer},generator,system,
    foundationMaterials:{stone:generator.materials.stone,trim:generator.materials.trim},materials:{apply:model=>model}};
}
function pcTraditionalControl(c){return c.pcTraditionalControl||{enabled:false,type:'mix'};}
function pcTraditionalType(type){
  if(type!=='mix'&&!pcTraditionalTypes.includes(type))throw Error('Unknown traditional Office design');
  return type;
}
function pcTraditionalSetControl(c,value){
  const type=pcTraditionalType(value.type??'mix');
  c.network.remember();c.pcTraditionalControl={enabled:!!value.enabled,type};c.pcTraditionalRefresh?.();
}
function pcTraditionalHistory(c){
  return {control:{...pcTraditionalControl(c)},assignments:[...(c.pcTraditionalAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};
}
function pcTraditionalRestore(c,snapshot){
  const before=JSON.stringify(pcTraditionalHistory(c)),next=new Map,control=snapshot?.control;
  const type=pcTraditionalType(control?.type??'mix');
  for(const [id,r] of snapshot?.assignments||[]){
    pcTraditionalReady().system.validateRecord(r);
    if(id!==r.lotId||next.has(id))throw Error('Invalid traditional Office assignment');
    next.set(id,structuredClone(r));
  }
  c.pcTraditionalAssignments=next;c.pcTraditionalControl={enabled:!!control?.enabled,type};c.pcTraditionalRefresh?.();
  return before!==JSON.stringify(pcTraditionalHistory(c));
}
function pcTraditionalFit(lot,archetype){
  let cache=pcTraditionalFits.get(lot);
  if(!cache){cache=new Map;pcTraditionalFits.set(lot,cache);}
  if(cache.has(archetype))return cache.get(archetype);
  const capacity=lot.officeProfile?.maxFloors??80,minimum=lot.officeProfile?.minFloors??1;
  let fit={ok:false,reason:'Incompatible Office profile'};
  if(lot.zone==='offices'&&lot.towardRoad){
    const system=pcTraditionalReady().system,parameters=system.definition.normalize({archetype,revision:archetype==='C'?3:2});
    if(parameters.storeys>=minimum&&parameters.storeys<=capacity)
      fit=system.fit(lot,{seed:'traditional:'+lot.id,parameters,capacity});
  }
  cache.set(archetype,fit);
  return fit;
}
function pcTraditionalAsset(r){
  const p=r.parameters,d=pcTraditionalDefinitions.find(entry=>entry.archetype===p.archetype);
  return {...d,record:r,dimensions:{floors:p.storeys,floorHeight:p.floorHeight,height:r.grid.roofTop,
    windowBays:Math.round((p.width+p.depth)*2/4.2)*p.storeys}};
}
function pcTraditionalChoose(c,lot,forPaint){
  if(forPaint&&c.pcCatalogueChoice)return null;
  const key=c.pcCatalogueAssignments?.get(lot.id),prior=pcTraditionalDefinitions.find(d=>d.key===key),control=pcTraditionalControl(c);
  if(prior){
    if(forPaint&&!control.enabled)return null;
    const record=c.pcTraditionalAssignments?.get(lot.id);
    return record?.parameters.archetype===prior.archetype&&sn(je(Te(record.footprint),Te(lot.footprint)))<.0001?pcTraditionalAsset(record):null;
  }
  if(!forPaint||!control.enabled||key!==undefined)return null;
  const hash=pcOfficeHash(lot.id+':traditional-office'),start=hash%3;
  if(control.type==='mix'&&(hash>>>10)%4!==1)return null;
  const types=control.type==='mix'?pcTraditionalTypes.map((_,i)=>pcTraditionalTypes[(i+start)%3]):[control.type];
  for(const type of types){
    const fit=pcTraditionalFit(lot,type);
    if(fit.ok)return pcTraditionalAsset(fit.record);
  }
  return null;
}
function pcTraditionalRemember(c,lot,asset){
  if(asset?.model.format==='lightweight-traditional'){
    c.pcTraditionalAssignments??=new Map;
    c.pcTraditionalAssignments.set(lot.id,structuredClone(asset.record));
  }else c.pcTraditionalAssignments?.delete(lot.id);
}
const pcTraditionalAdapter={ready:pcTraditionalReady,batches:pcTraditionalBatches,name:'Traditional Office growables',record:b=>b.office.lightweightTraditional};
function pcTraditionalInfo(){return pcBmoInfo(pcTraditionalBatches,pcTraditionalRuntime);}
function pcTraditionalInitControls(c){
  const panel=document.querySelector('#bmo-development');if(!panel)return;
  const row=document.createElement('p');
  row.innerHTML='<label><input type="checkbox"> Experimental Traditional Offices</label> <select aria-label="Traditional Office design"><option value="mix">Mix all three</option>'+
    pcTraditionalDefinitions.map(d=>'<option value="'+d.archetype+'">'+d.name+'</option>').join('')+'</select>';
  const enabled=row.querySelector('input'),type=row.querySelector('select');panel.append(row);
  c.pcTraditionalRefresh=()=>{const state=pcTraditionalControl(c);enabled.checked=state.enabled;type.value=state.type;};
  enabled.onchange=type.onchange=()=>pcTraditionalSetControl(c,{enabled:enabled.checked,type:type.value});
  c.pcTraditionalRefresh();
}
