// Postmodern Office growables share the existing lot and render lifecycle.
const pcVaultTypes=['A','B','C'];
const pcVaultDefinitions=pcVaultTypes.map((archetype,i)=>({
  id:'original-vaults-'+archetype.toLowerCase(),version:'0.1.0',key:'template:original-vaults-'+archetype.toLowerCase()+'@0.1.0',
  archetype,name:['Symmetrical Vault Tower','Twin Vault Tower','Asymmetric Atrium Tower'][i],
  model:{format:'lightweight-vault'},dimensions:{windowBays:0}
}));
let pcVaultRuntime=null;
const pcVaultBatches=new Set,pcVaultFits=new WeakMap;
function pcVaultReady(){
  if(pcVaultRuntime)return pcVaultRuntime;
  const engine={...pcOhneeEngine(),Vector2:Ft,Shape:As,ExtrudeGeometry:Oh};
  const module=pcVaultPackage(engine),shared=pcBmoRuntime?.module||pcBmoPackage(engine),generator=new module.VaultGenerator();
  const system=shared.createTemplateSystem({definition:module.definition,generator,polygon:{Te,je,sn,Bo,cS,facing:pcGrowableFacing}});
  return pcVaultRuntime={module:{...module,OptimizedFamilyRenderer:shared.OptimizedFamilyRenderer},generator,system,
    foundationMaterials:{stone:generator.materials.stone,trim:generator.materials.trim},materials:{apply:model=>model}};
}
function pcVaultControl(c){return c.pcVaultControl||{enabled:true,type:'mix'};}
function pcVaultSetControl(c,value){
  const type=value.type??'mix';
  if(type!=='mix'&&!pcVaultTypes.includes(type))throw Error('Unknown vault type');
  c.network.remember();c.pcVaultControl={enabled:!!value.enabled,type};c.pcVaultRefresh?.();
}
function pcVaultHistory(c){return {control:{...pcVaultControl(c),catalogue:true},assignments:[...(c.pcVaultAssignments||new Map)].map(([id,r])=>[id,structuredClone(r)])};}
function pcVaultRestore(c,snapshot){
  const before=JSON.stringify(pcVaultHistory(c)),next=new Map,control=snapshot?.control;
  const type=(control?.catalogue||control?.enabled)?(control.type??'mix'):'mix';
  if(type!=='mix'&&!pcVaultTypes.includes(type))throw Error('Unknown vault type');
  for(const [id,r] of snapshot?.assignments||[]){
    pcVaultReady().system.validateRecord(r);
    if(id!==r.lotId||next.has(id))throw Error('Invalid vault assignment');
    const record=structuredClone(r);
    // Refresh the derived roof and threshold geometry for earlier prototypes.
    if(!record.grid?.equipment)record.grid=pcVaultReady().system.definition.layout(record.parameters);
    next.set(id,record);
  }
  c.pcVaultAssignments=next;c.pcVaultControl={enabled:control?.catalogue?!!control.enabled:true,type};c.pcVaultRefresh?.();
  return before!==JSON.stringify(pcVaultHistory(c));
}
function pcVaultFit(p,archetype,storeys,form){
  if(!pcVaultTypes.includes(archetype))throw Error('Unknown vault type');
  let cache=pcVaultFits.get(p);if(!cache){cache=new Map;pcVaultFits.set(p,cache);}
  const key=[archetype,storeys,String(form)].join(':');if(cache.has(key))return cache.get(key);
  const min=Math.max(20,p.officeProfile?.minFloors||20),max=Math.min(40,p.officeProfile?.maxFloors||40),hash=pcOfficeHash(p.id+':vault:'+archetype);
  let fit;
  if(p.zone!=='offices'||!p.towardRoad||max<min||storeys>max||storeys<min)fit={ok:false,reason:'Incompatible Office profile'};
  else{
    const height=storeys??min+hash%(max-min+1);
    fit=pcVaultReady().system.fit(p,{seed:String(hash),capacity:max,parameters:{archetype,storeys:height,auto:storeys===undefined,palette:hash%3,form:form===undefined?(hash>>>8)%3:form}});
    if(fit.ok&&fit.record.parameters.storeys<min)fit={ok:false,reason:'Inadequate floor area for the Office profile'};
  }
  cache.set(key,fit);return fit;
}
function pcVaultAsset(r){
  const s=r.parameters,d=pcVaultDefinitions.find(d=>d.archetype===s.archetype);
  return {...d,record:r,dimensions:{floors:s.storeys,floorHeight:s.floorHeight,height:r.grid.roofTop,windowBays:Math.round((s.width+s.depth)*2/2.4)*s.storeys}};
}
function pcVaultChoose(c,p,forPaint,mixed=false){
  if(forPaint&&c.pcCatalogueChoice)return null;
  const assigned=c.pcCatalogueAssignments?.get(p.id),prior=pcVaultDefinitions.find(d=>d.key===assigned),control=pcVaultControl(c);
  if(prior){
    const record=c.pcVaultAssignments?.get(p.id);
    if(record?.parameters.archetype!==prior.archetype||sn(je(Te(record.footprint),Te(p.footprint)))>=.0001)return null;
    return pcVaultAsset(record);
  }
  if(!forPaint||!control.enabled||c.pcCatalogueChoice||assigned!==undefined)return null;
  const hash=pcOfficeHash(p.id+':original-vaults');
  if(control.type==='mix'){
    if(!mixed||(hash>>>9)%8!==3)return null;
    const priority=[pcBmoControl(c),pcLindControl(c),pcVonControl(c),pcBrickControl(c),pcAlderwickControl(c),pcDecoControl(c),pcCurvedControl(c)];
    if(priority.some(v=>v.enabled&&v.favour))return null;
  }else if(mixed)return null;
  const start=hash%3;
  const types=control.type==='mix'?pcVaultTypes.map((_,i)=>pcVaultTypes[(start+i)%3]):[control.type];
  for(const type of types){const fit=pcVaultFit(p,type);if(fit.ok)return pcVaultAsset(fit.record);}
  return null;
}
function pcVaultRemember(c,p,asset){
  if(asset?.model.format==='lightweight-vault'){
    if(!c.pcVaultAssignments)c.pcVaultAssignments=new Map;
    c.pcVaultAssignments.set(p.id,structuredClone(asset.record));
  }else c.pcVaultAssignments?.delete(p.id);
}
const pcVaultAdapter={ready:pcVaultReady,batches:pcVaultBatches,name:'Vault Office growables',record:b=>b.office.lightweightVault};
function pcVaultInfo(){return pcBmoInfo(pcVaultBatches,pcVaultRuntime);}
function pcVaultInitControls(c){
  const panel=document.querySelector('#bmo-development');if(!panel)return;
  const row=document.createElement('p');
  row.innerHTML='<label><input type="checkbox"> Vault Office growables</label> <select aria-label="Vault Office design"><option value="mix">Mix A / B / C</option>'+pcVaultDefinitions.map(d=>'<option value="'+d.archetype+'">'+d.name+'</option>').join('')+'</select>';
  const enabled=row.querySelector('input'),type=row.querySelector('select');panel.append(row);
  c.pcVaultRefresh=()=>{const state=pcVaultControl(c);enabled.checked=state.enabled;type.value=state.type;};
  enabled.onchange=type.onchange=()=>pcVaultSetControl(c,{enabled:enabled.checked,type:type.value});
  c.pcVaultRefresh();
}
