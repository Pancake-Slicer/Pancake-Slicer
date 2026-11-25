// Traditional Office growables use the shared placed-template lifecycle.
const pcTraditionalTypes=['A','B','C'];
const pcTraditionalNames=['Grand Courtyard Tower','Metropolitan Exchange','Heritage Commerce Tower'];
const pcTraditionalDefinitions=pcTraditionalTypes.map((archetype,i)=>{
  const id='original-traditional-offices-'+archetype.toLowerCase();
  return {id,key:'template:'+id+'@0.1.0',version:'0.1.0',archetype,name:pcTraditionalNames[i],
    model:{format:'lightweight-traditional'},dimensions:{windowBays:0}};
});
let pcTraditionalRuntime=null;
const pcTraditionalBatches=new Set,pcTraditionalDistantBatches=new Set,pcTraditionalChunks=new Set,pcTraditionalFits=new WeakMap;
function pcTraditionalReady(){
  if(pcTraditionalRuntime)return pcTraditionalRuntime;
  const engine={...pcOhneeEngine(),Vector2:Ft,Shape:As,ShapeGeometry:Mr};
  const module=pcTraditionalPackage(engine),shared=pcBmoRuntime?.module||pcBmoPackage(engine);
  const generator=new module.TraditionalOfficeGenerator();
  const contract={definition:module.definition,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}};
  const system=shared.createTemplateSystem({...contract,generator});
  const distantSystem=shared.createTemplateSystem({...contract,generator:{
    generate:input=>generator.generate(input,true),release:model=>generator.release(model)
  }});
  return pcTraditionalRuntime={module:{OptimizedFamilyRenderer:shared.OptimizedFamilyRenderer},generator,system,distantSystem,
    foundationMaterials:{stone:generator.materials.stone,trim:generator.materials.trim},materials:{apply:model=>model}};
}
function pcTraditionalControl(c){return c.pcTraditionalControl||{enabled:true,type:'mix'};}
function pcTraditionalType(type){
  if(type!=='mix'&&!pcTraditionalTypes.includes(type))throw Error('Unknown traditional Office design');
  return type;
}
function pcTraditionalSetControl(c,value){
  const type=pcTraditionalType(value.type??'mix');
  c.network.remember();c.pcTraditionalControl={enabled:!!value.enabled,type};c.pcTraditionalRefresh?.();
}
function pcTraditionalHistory(c){
  return {control:{...pcTraditionalControl(c),catalogue:true},assignments:[...(c.pcTraditionalAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};
}
function pcTraditionalRestore(c,snapshot){
  const before=JSON.stringify(pcTraditionalHistory(c)),next=new Map,control=snapshot?.control;
  const type=pcTraditionalType(control?.catalogue||control?.enabled?control.type??'mix':'mix');
  for(const [id,r] of snapshot?.assignments||[]){
    pcTraditionalReady().system.validateRecord(r);
    if(id!==r.lotId||next.has(id))throw Error('Invalid traditional Office assignment');
    next.set(id,structuredClone(r));
  }
  c.pcTraditionalAssignments=next;c.pcTraditionalControl={enabled:control?.catalogue?!!control.enabled:true,type};c.pcTraditionalRefresh?.();
  return before!==JSON.stringify(pcTraditionalHistory(c));
}
function pcTraditionalFit(lot,archetype,{benchmark=false,storeys,form}={}){
  let cache=pcTraditionalFits.get(lot);
  if(!cache){cache=new Map;pcTraditionalFits.set(lot,cache);}
  const key=[archetype,benchmark,storeys,form].join(':');
  if(cache.has(key))return cache.get(key);
  const minimum=Math.max(12,lot.officeProfile?.minFloors??12),capacity=Math.min(26,lot.officeProfile?.maxFloors??26);
  let fit={ok:false,reason:'Incompatible Office profile'};
  if(lot.zone==='offices'&&lot.towardRoad&&minimum<=capacity){
    const system=pcTraditionalReady().system,hash=pcOfficeHash(lot.id+':traditional:'+archetype);
    const height=storeys??minimum+(hash>>>4)%(capacity-minimum+1);
    const parameters=benchmark
      ?system.definition.normalize({archetype,revision:archetype==='C'?4:2})
      :{archetype,revision:5,storeys:height,form:form??(hash>>>12)%3,auto:storeys===undefined};
    if(parameters.storeys>=minimum&&parameters.storeys<=capacity){
      fit=system.fit(lot,{seed:String(hash),parameters,capacity});
      if(fit.ok&&fit.record.parameters.storeys<minimum)fit={ok:false,reason:'Inadequate Office height capacity'};
    }
  }
  cache.set(key,fit);
  return fit;
}
function pcTraditionalAsset(r){
  const p=r.parameters,d=pcTraditionalDefinitions.find(entry=>entry.archetype===p.archetype);
  return {...d,record:r,dimensions:{floors:p.storeys,floorHeight:p.floorHeight,height:r.grid.roofTop,
    windowBays:Math.round((p.width+p.depth)*2/4.2)*p.storeys}};
}
function pcTraditionalChoose(c,lot,forPaint,mixed=false){
  if(forPaint&&c.pcCatalogueChoice)return null;
  const key=c.pcCatalogueAssignments?.get(lot.id),prior=pcTraditionalDefinitions.find(d=>d.key===key),control=pcTraditionalControl(c);
  if(prior){
    if(forPaint&&!control.enabled)return null;
    const record=c.pcTraditionalAssignments?.get(lot.id);
    return record?.parameters.archetype===prior.archetype&&sn(je(Te(record.footprint),Te(lot.footprint)))<.0001?pcTraditionalAsset(record):null;
  }
  if(!forPaint||!control.enabled||key!==undefined)return null;
  const hash=pcOfficeHash(lot.id+':traditional-office'),start=hash%3;
  if(control.type==='mix'){
    if(!mixed||(hash>>>10)%5!==1)return null;
    const favoured=[pcBmoControl(c),pcLindControl(c),pcVonControl(c),pcBrickControl(c),pcAlderwickControl(c),pcDecoControl(c),pcCurvedControl(c)];
    if(favoured.some(value=>value.enabled&&value.favour))return null;
  }else if(mixed)return null;
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
const pcTraditionalDistantAdapter={...pcTraditionalAdapter,batches:pcTraditionalDistantBatches,name:'Distant Traditional Offices',
  ready(){const runtime=pcTraditionalReady();return {...runtime,system:runtime.distantSystem};}};
function pcTraditionalFlush(buildings,group){
  if(!buildings.some(b=>b.office.lightweightTraditional.parameters.revision===5)){
    pcBmoFlush(buildings,group,pcTraditionalAdapter);return;
  }
  const layer=new Se;
  pcBmoFlush(buildings,layer,pcTraditionalAdapter);
  const near=layer.children[0];
  try{pcBmoFlush(buildings,layer,pcTraditionalDistantAdapter);}
  catch(error){near.userData.pcBmoCleanup();pcTraditionalRuntime.generator.prune();throw error;}
  const far=layer.children[1];
  layer.remove(far);
  const xs=buildings.map(b=>b.x),zs=buildings.map(b=>b.z);
  const chunk={layer,near,far,distant:false,x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,
    y:buildings.reduce((sum,b)=>sum+b.y+b.height/2,0)/buildings.length};
  pcTraditionalChunks.add(chunk);
  // Like the Curved Offices, keep inactive detail out of the scene and the picker.
  layer.userData.pcBmoCleanup=()=>{pcTraditionalChunks.delete(chunk);near.userData.pcBmoCleanup();far.userData.pcBmoCleanup();};
  group.add(layer);
}
function pcTraditionalUpdateLOD(camera){
  let changed=false;
  for(const c of pcTraditionalChunks){
    const distant=Math.hypot(camera.x-c.x,camera.y-c.y,camera.z-c.z)>(c.distant?650:810);
    if(distant===c.distant)continue;
    c.layer.remove(distant?c.near:c.far);
    c.layer.add(distant?c.far:c.near);
    c.distant=distant;changed=true;
  }
  return changed;
}
function pcTraditionalInfo(){
  const counts=pcBmoInfo(pcTraditionalBatches,pcTraditionalRuntime);
  let visibleTriangles=[...pcTraditionalBatches].reduce((sum,r)=>sum+r.batch.stats.triangles,0),distantChunks=0;
  const triangles=group=>group.children.reduce((count,mesh)=>{
    const {index,attributes}=mesh.geometry,faces=(index?.count??attributes.position.count)/3;
    return count+faces*(mesh.isInstancedMesh?mesh.count:1);
  },0);
  for(const c of pcTraditionalChunks)if(c.distant){
    visibleTriangles+=triangles(c.far)-triangles(c.near);
    counts.batches+=c.far.children.length-c.near.children.length;
    distantChunks++;
  }
  return {...counts,visibleTriangles,distantChunks};
}
function pcTraditionalInitControls(c){
  const panel=document.querySelector('#bmo-development');if(!panel)return;
  const row=document.createElement('p');
  row.innerHTML='<label><input type="checkbox"> Traditional Office growables</label> <select aria-label="Traditional Office design"><option value="mix">Mix all three</option>'+
    pcTraditionalDefinitions.map(d=>'<option value="'+d.archetype+'">'+d.name+'</option>').join('')+'</select>';
  const enabled=row.querySelector('input'),type=row.querySelector('select');panel.append(row);
  c.pcTraditionalRefresh=()=>{const state=pcTraditionalControl(c);enabled.checked=state.enabled;type.value=state.type;};
  enabled.onchange=type.onchange=()=>pcTraditionalSetControl(c,{enabled:enabled.checked,type:type.value});
  c.pcTraditionalRefresh();
}
