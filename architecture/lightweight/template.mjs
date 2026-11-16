// Host-neutral fit/history contract. Polygon booleans and street axes belong to
// the existing game; a template never changes lots or registers itself.
export const CONTRACT_VERSION=1;
export function createTemplateSystem({definition,generator,polygon}){
 const {Te,je,sn,Bo,cS,facing}=polygon;
 const contains=(ring,lot)=>sn(je(Te(ring),Te(lot)))<.0001;
 const point=(p,x,z,angle)=>({x:x+p.x*Math.cos(angle)+p.z*Math.sin(angle),z:z-p.x*Math.sin(angle)+p.z*Math.cos(angle)});
 function fit(lot,input={}){
  try{
   if(lot.zone!=='offices')return {ok:false,reason:'Template requires Office zoning'};
   definition.normalize(input.parameters||{});
   if(lot.holes?.length)return {ok:false,reason:'Courtyard/hole lots require a compatible template'};
   if(!Array.isArray(lot.footprint)||lot.footprint.length<3||lot.footprint.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.z)))throw Error('Invalid lot polygon');
   const angle=facing(lot).angle;if(!Number.isFinite(angle))throw Error('Missing street orientation');
   const origin=cS(lot.footprint)||lot,cos=Math.cos(angle),sin=Math.sin(angle),local=lot.footprint.map(p=>({x:(p.x-origin.x)*cos-(p.z-origin.z)*sin,z:(p.x-origin.x)*sin+(p.z-origin.z)*cos}));
   const minX=Math.min(...local.map(p=>p.x)),maxX=Math.max(...local.map(p=>p.x)),minZ=Math.min(...local.map(p=>p.z)),maxZ=Math.max(...local.map(p=>p.z));
   const safe=Bo(Te(lot.footprint),-(input.setback??.3));if(!safe.length)return {ok:false,reason:'No buildable polygon after clearance'};
   // A bounded deterministic search. Reject rather than deform rectangular
   // architecture. Each trial reflows the bay grid through the family solver.
   const centres=[[(minX+maxX)/2,(minZ+maxZ)/2],[0,0]];
   for(const fraction of [.25,.75])for(const f of [.25,.75])centres.push([minX+(maxX-minX)*fraction,minZ+(maxZ-minZ)*f]);
   for(const ratio of [1,.95,.9,.85,.8,.7,.6,.5])for(const [cx,cz]of centres){
    let spec;try{spec=definition.fit(input.parameters||{}, {width:Math.min(maxX-minX,definition.maximumLot.width)*ratio,depth:Math.min(maxZ-minZ,definition.maximumLot.depth)*ratio,setback:input.setback??.3});}catch{continue;}
    if(input.capacity!==undefined&&spec.storeys>input.capacity)continue;
    const w=(spec.podium?.width||spec.width)+definition.envelopeMargin,d=(spec.podium?.depth||spec.depth)+definition.envelopeMargin;
    const centre=point({x:cx,z:cz},origin.x,origin.z,angle),ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,z])=>point({x,z},centre.x,centre.z,angle));
    if(sn(je(Te(ring),safe))>.0001)continue;
    const normalized=definition.normalize(spec),seed=String(input.seed??lot.id);
    const record={schemaVersion:CONTRACT_VERSION,template:{id:definition.id,version:definition.version},seed,lotId:lot.id,lot:{width:maxX-minX,depth:maxZ-minZ,footprint:structuredClone(lot.footprint)},parameters:normalized,grid:definition.layout?.(normalized)||null,placement:{x:centre.x,y:lot.y||0,z:centre.z,angle,scale:1,front:[Math.sin(angle),Math.cos(angle)]},footprint:ring};
    return {ok:true,record};
   }
   return {ok:false,reason:'No supported rectangular envelope fits this lot and capacity'};
  }catch(error){return {ok:false,reason:error.message};}
 }
 function validateRecord(record){
  if(record.schemaVersion!==CONTRACT_VERSION||record.template?.id!==definition.id||record.template?.version!==definition.version)throw Error('Unknown template contract/version');
  if(record.placement.scale!==1||![record.placement.x,record.placement.y,record.placement.z,record.placement.angle].every(Number.isFinite))throw Error('Invalid native placement');
  if(!record.lotId||typeof record.seed!=='string'||!Array.isArray(record.footprint)||record.footprint.length<3)throw Error('Incomplete history record');
  definition.normalize(record.parameters);return record;
 }
 function generate(record){
  validateRecord(record);
  const model=generator.generate(definition.normalize(record.parameters)),p=record.placement;
  model.position.set(p.x,p.y,p.z);model.rotation.y=p.angle;model.userData.lightweight=structuredClone(record);return model;
 }
 return {definition,fit,generate,validateRecord,release:model=>generator.release(model),contains};
}
// Implements the existing history-participant capture/restore shape. It is not
// attached to a live game; registration and growth remain a later milestone.
export function createTemplateAssignments(system){
 const records=new Map;
 return {records,set(record){system.validateRecord(record);records.set(record.lotId,structuredClone(record));},remove(lotId){return records.delete(lotId);},capture(){return [...records].map(([id,r])=>[id,structuredClone(r)]);},restore(saved){const next=new Map;for(const [id,record]of saved||[]){system.validateRecord(record);if(id!==record.lotId||next.has(id))throw Error('Invalid duplicate/mismatched lot history');next.set(id,structuredClone(record));}records.clear();for(const [id,record]of next)records.set(id,record);}};
}
