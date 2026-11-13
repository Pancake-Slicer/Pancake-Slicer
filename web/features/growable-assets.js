// Shared static building-asset interface. Placement never scales the model.
const pcGrowableByKey=new Map(pcGrowableDefinitions.map(d=>[d.key,d]));
// Keep archived versions for save/history keys, but grow only the newest version.
const pcGrowableCurrentDefinitions=[...pcGrowableDefinitions.reduce((map,d)=>{const old=map.get(d.id),a=d.version.split('.').map(Number),b=old?.version.split('.').map(Number);if(!old||a[0]>b[0]||a[0]===b[0]&&(a[1]>b[1]||a[1]===b[1]&&a[2]>b[2]))map.set(d.id,d);return map;},new Map).values()];
const pcGrowableResources=new Map,pcGrowableFactories=new Map,pcGrowablePlacements=new WeakMap;
function pcRegisterGrowableFactory(key,factory){if(!pcGrowableByKey.has(key)||typeof factory!=='function')throw Error('Invalid growable factory');pcGrowableFactories.set(key,factory);}
function pcGrowableFind(key){return pcGrowableByKey.get(key)||pcGrowableCurrentDefinitions.find(d=>d.id===key)||null;}
function pcAssetBytes(text){
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',bytes=new Uint8Array(Math.floor(text.length*3/4)-(text.endsWith('==')?2:text.endsWith('=')?1:0));let bits=0,value=0,j=0;
 for(const c of text){if(c==='=')break;value=(value<<6)|alphabet.indexOf(c);bits+=6;if(bits>=8){bits-=8;bytes[j++]=(value>>>bits)&255;}}return bytes.buffer;
}
function pcAssetArray(a){const bytes=pcAssetBytes(a.array);return a.type==='Uint32Array'?new Uint32Array(bytes):a.type==='Uint16Array'?new Uint16Array(bytes):new Float32Array(bytes);}
function pcGrowableResource(asset){
 if(pcGrowableResources.has(asset.key))return pcGrowableResources.get(asset.key);
 if(asset.model.format==='procedural'){
  const factory=pcGrowableFactories.get(asset.key);if(!factory)throw Error('Missing growable factory '+asset.key);
  const resource=factory({BufferGeometry:Ce,Float32BufferAttribute:pe,MeshStandardMaterial:Re,CanvasTexture:vr,BoxGeometry:mn});pcGrowableResources.set(asset.key,resource);return resource;
 }
 const maps=new Map,images=[];
 const materials=asset.payload.materials.map(m=>{
  let map=null;
  if(m.image){
   const key=m.image+JSON.stringify(m.sampler);map=maps.get(key);
   if(!map){map=new vr(document.createElement('canvas'));map.flipY=false;map.colorSpace=hn;map.anisotropy=8;
    const wrap=(v=10497)=>v===10497?1000:v===33648?1002:1001,filter=v=>({9728:1003,9729:1006,9984:1004,9985:1007,9986:1005,9987:1008})[v];
    map.wrapS=wrap(m.sampler.wrapS);map.wrapT=wrap(m.sampler.wrapT);if(m.sampler.magFilter)map.magFilter=filter(m.sampler.magFilter);if(m.sampler.minFilter)map.minFilter=filter(m.sampler.minFilter);
    maps.set(key,map);images.push({map,uri:m.image});
   }
  }
  const material=new Re({color:new Me().setRGB(...m.color),emissive:new Me().setRGB(...m.emissive),metalness:m.metalness,roughness:m.roughness,side:m.side,map});material.name=asset.name;return material;
 });
 const parts=asset.payload.parts.map(p=>{
  const geometry=new Ce;geometry.setAttribute('position',new pe(pcAssetArray(p.position),3));
  if(p.normal)geometry.setAttribute('normal',new pe(pcAssetArray(p.normal),3));if(p.uv)geometry.setAttribute('uv',new pe(pcAssetArray(p.uv),2));if(p.index)geometry.setIndex(new dn(pcAssetArray(p.index),1));if(!p.normal)geometry.computeVertexNormals();geometry.applyMatrix4(new ke().fromArray(p.matrix));geometry.computeBoundingBox();geometry.computeBoundingSphere();
  // Manifest bounds must contain every vertex; a bad export fails visibly.
  for(let axis=0;axis<3;axis++){const key=['x','y','z'][axis];if(geometry.boundingBox.min[key]<asset.bounds.min[axis]-.001||geometry.boundingBox.max[key]>asset.bounds.max[axis]+.001)throw Error('Asset exceeds declared bounds: '+asset.id);}
  return {geometry,material:materials[p.material]};
 });
 const resource={parts,materials,images};pcGrowableResources.set(asset.key,resource);return resource;
}
async function pcGrowablesReady(loadImage=async uri=>{const image=new Image;image.src=uri;await image.decode();return image;}){
 for(const asset of pcGrowableDefinitions){const resource=pcGrowableResource(asset);for(const {map,uri} of resource.images||[]){map.image=await loadImage(uri);map.needsUpdate=true;}}
}
// Follow the lot's actual axes. towardRoad points at a sampled road position,
// which can be slightly off-centre and must not rotate a rigid building.
function pcGrowableFacing(property){
 const target=property.towardRoad;let base=property.rotation;
 if(!Number.isFinite(base)){let edge,length=0;for(let i=0;i<property.footprint.length;i++){const a=property.footprint[i],b=property.footprint[(i+1)%property.footprint.length],d=Math.hypot(b.x-a.x,b.z-a.z);if(d>length){length=d;edge={x:b.x-a.x,z:b.z-a.z};}}base=Math.atan2(-edge.z,edge.x);}
 let best,score=-Infinity;for(let i=0;i<4;i++){const angle=base+i*Math.PI/2,x=Math.sin(angle),z=Math.cos(angle),dot=x*target.x+z*target.z;if(dot>score){score=dot;best={x,z,angle};}}return best;
}
function pcGrowablePlacement(property,asset){
 let cache=pcGrowablePlacements.get(property);if(!cache){cache=new Map;pcGrowablePlacements.set(property,cache);}if(cache.has(asset.key))return cache.get(asset.key);
 const e=asset.eligibility,area=property.area;
 const capacity=Math.min(property.officeProfile?.maxFloors||80,area<1200?24:area<1800?40:area<2500?60:80);
 let result=null;
 if(property.zone===e.zone&&area>=e.minLotArea&&capacity>=e.capacityMinFloors&&property.towardRoad){
  const dir=pcGrowableFacing(property),length=Math.hypot(dir.x,dir.z),angle=dir.angle,cos=Math.cos(angle),sin=Math.sin(angle),center=cS(property.footprint)||property;
  if(length>.999&&length<1.001){
   const projected=property.footprint.map(p=>({x:(p.x-center.x)*cos-(p.z-center.z)*sin,z:(p.x-center.x)*sin+(p.z-center.z)*cos})),bounds=En(projected);
   if(bounds.maxX-bounds.minX>=e.minLotWidth&&bounds.maxZ-bounds.minZ>=e.minLotDepth){
    const cx=(asset.bounds.min[0]+asset.bounds.max[0])/2,cz=(asset.bounds.min[2]+asset.bounds.max[2])/2;
    const origin={x:center.x-cx*cos-cz*sin,z:center.z+cx*sin-cz*cos};
    const clearance=xn(Bo(Te(asset.footprint.map(([x,z])=>({x,z}))),e.setback));
    const shift=Math.max(0,((property.entrance.x-center.x)*dir.x+(property.entrance.z-center.z)*dir.z)-(asset.bounds.max[2]-cz)-e.setback);
    for(const offset of [shift,0]){
     const x=origin.x+dir.x*offset,z=origin.z+dir.z*offset,point=([px,pz])=>({x:x+px*cos+pz*sin,z:z-px*sin+pz*cos});
     const safe=clearance.flatMap(p=>Te(p.outer.map(v=>point([v.x,v.z]))));
     if(safe.length&&sn(je(safe,Te(property.footprint)))<.001){result={x,z,angle,scale:1,footprint:asset.footprint.map(point),entrance:{...point([asset.orientation.entrance[0],asset.orientation.entrance[2]]),y:property.y+asset.orientation.entrance[1]}};break;}
    }
   }
  }
 }
 cache.set(asset.key,result);return result;
}
function pcGrowableChoose(collection,property,forPaint=false){
 // Explicit legacy catalogue selection retains the original behaviour.
 if(forPaint&&collection.pcCatalogueChoice)return null;
 const assigned=collection.pcCatalogueAssignments?.get(property.id);
 if(assigned!==undefined){const asset=pcGrowableFind(assigned);return asset&&pcGrowablePlacement(property,asset)?asset:null;}
 if(collection.pcCatalogueChoice)return null;
 const candidates=pcGrowableCurrentDefinitions.filter(d=>pcGrowablePlacement(property,d));
 const total=16+candidates.reduce((n,d)=>n+d.selectionWeight,0);let ticket=pcOfficeHash(property.id+':authored-growable')/4294967296*total;
 for(const asset of candidates){ticket-=asset.selectionWeight;if(ticket<0)return asset;}return null;
}
function pcGrowableSpec(collection,property,spec){
 const asset=pcGrowableChoose(collection,property);if(!asset)return null;
 return {...spec,assetId:asset.id,assetVersion:asset.version,assetKey:asset.key,catalogueName:asset.name,floors:asset.dimensions.floors,floorHeight:asset.dimensions.floorHeight,sourceHeight:asset.dimensions.height,assetPlacement:pcGrowablePlacement(property,asset)};
}
function pcQueueGrowable(building,queue,B,stats){
 const asset=pcGrowableFind(building.office?.assetKey);if(!asset)return false;
 const placement=building.office.assetPlacement; if(!placement||placement.scale!==1)throw Error('Invalid growable placement');
 if(!queue.has(asset.key))queue.set(asset.key,{asset,buildings:[]});queue.get(asset.key).buildings.push(building);
 // Terrain support is a separate game foundation, not a change to model mesh.
 B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18),pcRebuiltSolid('foundation','#9a9a8d',.97),building.id);
 stats.windows+=asset.dimensions.windowBays||0;return true;
}
function pcFlushGrowables(queue,group){
 for(const {asset,buildings} of queue.values()){
  const resource=pcGrowableResource(asset),matrix=new ke,rotation=new Ii,up=new q(0,1,0);
  for(const part of resource.parts){
   const mesh=new Kn(part.geometry,part.material,buildings.length);mesh.name=asset.name;mesh.userData.pcSharedAssetGeometry=true;mesh.userData.assetKey=asset.key;mesh.userData.buildingIds=buildings.map(b=>b.id);mesh.castShadow=mesh.receiveShadow=true;
   buildings.forEach((b,index)=>{const p=b.office.assetPlacement;rotation.setFromAxisAngle(up,p.angle);matrix.compose(new q(p.x,b.y,p.z),rotation,new q(1,1,1));mesh.setMatrixAt(index,matrix);});mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
  }
 }
}
