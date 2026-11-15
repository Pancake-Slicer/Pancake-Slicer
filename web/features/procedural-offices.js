// Controlled host adapter. Architectural formulas/materials live in the shared
// hash-pinned package; this file owns only eligibility, persistence and chunks.
const pcOhneeDefinitions=pcOhneeCatalogue.candidates.map(c=>({
 id:c.id,version:c.generatorVersion,key:'asset:'+c.id+'@'+c.generatorVersion,name:'Experimental Ohneeohnee · '+c.specification.name,
 model:{format:'ohneeohnee-family'},dimensions:{...c.dimensions,floors:c.storeys,floorHeight:c.specification.floorHeight,windowBays:0},bounds:c.bounds,footprint:c.footprint,orientation:c.orientation,
 eligibility:{zone:'offices',developmentStage:'immediate',minLotArea:c.minimumLot.width*c.minimumLot.depth,minLotWidth:c.minimumLot.width,minLotDepth:c.minimumLot.depth,capacityMinFloors:c.storeys,setback:c.minimumLot.setback},
 selectionWeight:12,facadeSubfamily:c.facadeSubfamily,seed:c.seed,specification:c.specification,geometrySignature:c.geometrySignature
}));
let pcOhneeRuntime=null,pcOhneeFailure=null;const pcOhneeLiveBatches=new Set;
function pcOhneeEngine(){return {REVISION:'180',Group:Se,Mesh:ae,MeshStandardMaterial:Re,MeshPhysicalMaterial:hy,BufferGeometry:Ce,BufferAttribute:dn,Float32BufferAttribute:pe,BoxGeometry:mn,Box3:di,Vector3:q,Matrix3:Oe,Matrix4:ke,InstancedMesh:Kn,Texture:ui,CanvasTexture:vr,DataTexture:il,Color:Me,SRGBColorSpace:hn,RGBAFormat:1023,EquirectangularReflectionMapping:303,RepeatWrapping:1000,ClampToEdgeWrapping:1001,MirroredRepeatWrapping:1002,NearestFilter:1003,NearestMipmapNearestFilter:1004,NearestMipmapLinearFilter:1005,LinearFilter:1006,LinearMipmapNearestFilter:1007,LinearMipmapLinearFilter:1008};}
async function pcOhneeReady(){
 if(pcOhneeRuntime)return pcOhneeRuntime;
 try{pcOhneeRuntime=await pcOhneePackage(pcOhneeEngine()).createOhneeohneeRuntime({payload:pcOhneePayload});return pcOhneeRuntime;}
 catch(error){pcOhneeFailure=String(error.message||error);console.error('Experimental Ohneeohnee unavailable:',pcOhneeFailure);return null;}
}
function pcOhneeEnabled(collection,asset){
 const control=collection.pcOhneeControl;
 return !!pcOhneeRuntime&&!!control?.enabled&&(control.style==='all'||control.style===asset.facadeSubfamily);
}
function pcOhneeSpec(asset){return {candidateId:asset.id,generatorVersion:asset.version,seed:asset.seed,specification:structuredClone(asset.specification)};}
function pcOhneeHistory(collection){return {control:structuredClone(collection.pcOhneeControl||{enabled:false,style:'all'}),assignments:[...(collection.pcOhneeAssignments||new Map)]};}
function pcOhneeRestore(collection,snapshot){
 const before=JSON.stringify(pcOhneeHistory(collection));collection.pcOhneeControl={enabled:!!snapshot?.control?.enabled,style:['all','vertical','horizontal','grid'].includes(snapshot?.control?.style)?snapshot.control.style:'all'};
 collection.pcOhneeAssignments=new Map(snapshot?.assignments||[]);collection.pcOhneeRefresh?.();return before!==JSON.stringify(pcOhneeHistory(collection));
}
function pcOhneeRemember(collection,property,asset){
 if(!collection.pcOhneeAssignments)collection.pcOhneeAssignments=new Map;
 if(asset?.model.format==='ohneeohnee-family')collection.pcOhneeAssignments.set(property.id,pcOhneeSpec(asset));else collection.pcOhneeAssignments.delete(property.id);
}
function pcOhneeValidateAssignment(collection,property,asset){
 const saved=collection.pcOhneeAssignments?.get(property.id);if(!saved)return true;
 return JSON.stringify(saved)===JSON.stringify(pcOhneeSpec(asset));
}
function pcOhneeFlush(buildings,group){
 if(!buildings.length)return;
 if(!pcOhneeRuntime)throw Error('Experimental family resources unavailable');
 const models=[];let batch;
 try{
  for(const b of buildings){const asset=pcGrowableFind(b.office.assetKey),model=pcOhneeRuntime.generate(asset.specification),p=b.office.assetPlacement;model.position.set(p.x,b.y,p.z);model.rotation.y=p.angle;models.push(model);}
  batch=pcOhneeRuntime.createBatch(models,{chunkSize:256});batch.root.name='Experimental Ohneeohnee chunk';
  for(const mesh of batch.root.children){mesh.userData.pcSharedAssetGeometry=true;mesh.userData.pcOhneeBuildings=mesh.userData.sourceBuildings.map(i=>buildings[i]);}
  const record={batch,models};pcOhneeLiveBatches.add(record);
  batch.root.userData.pcOhneeCleanup=()=>{pcOhneeLiveBatches.delete(record);batch.dispose();for(const model of models)pcOhneeRuntime.release(model);};group.add(batch.root);
 }catch(error){batch?.dispose();for(const model of models)pcOhneeRuntime.release(model);pcOhneeRuntime.trim();throw error;}
}
function pcOhneeClearChunk(group){for(const child of [...group.children])child.userData.pcOhneeCleanup?.();}
function pcOhneeInfo(){
 const geometry=new Set,materials=new Set,textures=new Set;let renderObjects=0,mergedBytes=0,instanceBytes=0;
 for(const {batch,models}of pcOhneeLiveBatches){renderObjects+=batch.stats.outputMeshes;mergedBytes+=batch.stats.ownedGeometryBytes;instanceBytes+=batch.stats.instanceMatrixBytes;for(const model of models)model.traverse(m=>{if(!m.geometry)return;geometry.add(m.geometry);materials.add(m.material);for(const v of Object.values(m.material))if(v?.isTexture)textures.add(v);});}
 const bytes=g=>Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+(g.index?.array.byteLength||0);
 return {...pcOhneeRuntime?.stats,sourceGeometries:geometry.size,sourceGeometryBytes:[...geometry].reduce((n,g)=>n+bytes(g),0),usedMaterials:materials.size,usedTextures:textures.size,renderObjects,mergedBytes,instanceBytes};
}
function pcOhneePick(hit){
 const candidates=hit.object.userData.pcOhneeBuildings;if(!candidates)return undefined;
 const p={x:hit.point.x,z:hit.point.z};
 for(const b of candidates){const ring=b.office.assetPlacement.footprint,bounds=En(ring);if(p.x>=bounds.minX-.02&&p.x<=bounds.maxX+.02&&p.z>=bounds.minZ-.02&&p.z<=bounds.maxZ+.02&&(Kr(p,ring)||ring.some((a,i)=>{const c=ring[(i+1)%ring.length],dx=c.x-a.x,dz=c.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)<.02;})))return b.id;}
 return undefined;
}
// Controls affect future growth only. Existing assignments survive style/off
// changes and load/history, just like the existing authored building choices.
function pcOhneeSetControl(collection,value){
 if(!['all','vertical','horizontal','grid'].includes(value.style))throw Error('Unknown experimental facade filter');
 collection.network.remember();collection.pcOhneeControl={enabled:!!value.enabled,style:value.style};
}
function pcOhneeInitControls(collection){
 if(!new URLSearchParams(location.search).has('experimental-offices')&&!document.documentElement.hasAttribute('data-experimental-offices'))return null;
 const panel=document.createElement('details');panel.id='ohneeohnee-development';panel.style.cssText='position:fixed;right:12px;bottom:44px;z-index:30;background:#202b30;color:#eff4f6;padding:10px;border:1px solid #66767e;border-radius:6px;max-width:310px;font:12px system-ui;max-height:45vh;overflow:auto';
 const summary=document.createElement('summary');summary.textContent='Development · experimental offices';panel.append(summary);
 const label=document.createElement('label'),enabled=document.createElement('input');enabled.type='checkbox';enabled.setAttribute('aria-label','Enable experimental Ohneeohnee growables');label.append(enabled,' Enable Ohneeohnee growables');panel.append(label,document.createElement('br'));
 const style=document.createElement('select');style.setAttribute('aria-label','Experimental facade subfamily');for(const [value,text]of [['all','All three subfamilies'],['vertical','Vertical'],['horizontal','Horizontal'],['grid','Balanced grid']]){const option=document.createElement('option');option.value=value;option.textContent=text;style.append(option);}panel.append(style);
 const help=document.createElement('p');help.textContent='Future Office growth only. Existing buildings stay. Use Mix all 98, then paint unzoned Office lots. Demolish and repaint to regrow.';panel.append(help);
 const status=document.createElement('p'),list=document.createElement('ul');panel.append(status,list);document.body.append(panel);
 function refresh(){const c=collection.pcOhneeControl||{enabled:false,style:'all'};enabled.checked=c.enabled;style.value=c.style;enabled.disabled=!!pcOhneeFailure;status.textContent=pcOhneeFailure?'Unavailable: '+pcOhneeFailure:(c.enabled?'Experimental growth enabled.':'Disabled: normal catalogue growth.')+' Native fit and floor capacity still apply.';list.replaceChildren(...pcOhneeDefinitions.filter(d=>c.style==='all'||d.facadeSubfamily===c.style).map(d=>{const li=document.createElement('li');li.textContent=d.specification.name+' · '+d.dimensions.floors+' floors · '+d.dimensions.width.toFixed(1)+' × '+d.dimensions.depth.toFixed(1)+' m';return li;}));}
 const update=()=>{pcOhneeSetControl(collection,{enabled:enabled.checked,style:style.value});refresh();};enabled.onchange=style.onchange=update;
 collection.pcOhneeRefresh=refresh;
 refresh();return {refresh};
}
