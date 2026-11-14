import * as T from './engine.js';
// Consume the approved GLB payload, never re-crop or repaint its textures.
export async function loadApprovedReference(payload){
 const textures=new Map;
 const materials=await Promise.all(payload.materials.map(async m=>{
  let map=null;if(m.image){const key=m.image+JSON.stringify(m.sampler);if(!textures.has(key))textures.set(key,new Promise((resolve,reject)=>{const image=new Image;image.onload=()=>{const texture=new T.Texture(image),sampler=m.sampler||{},wrap=v=>v===33648?T.MirroredRepeatWrapping:v===33071?T.ClampToEdgeWrapping:T.RepeatWrapping,filter=v=>({9728:T.NearestFilter,9729:T.LinearFilter,9984:T.NearestMipmapNearestFilter,9985:T.LinearMipmapNearestFilter,9986:T.NearestMipmapLinearFilter,9987:T.LinearMipmapLinearFilter})[v];texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.wrapS=wrap(sampler.wrapS);texture.wrapT=wrap(sampler.wrapT);if(sampler.minFilter)texture.minFilter=filter(sampler.minFilter);if(sampler.magFilter)texture.magFilter=filter(sampler.magFilter);texture.needsUpdate=true;resolve(texture);};image.onerror=()=>reject(Error('Approved texture failed to decode'));image.src=m.image;}));map=await textures.get(key);}
  return new T.MeshStandardMaterial({color:new T.Color().setRGB(...m.color),roughness:m.roughness,metalness:m.metalness,emissive:new T.Color().setRGB(...m.emissive),side:m.side,map});
 }));
 const reference=new T.Group,byName={};
 for(const p of payload.parts){const array=a=>{const data=Uint8Array.from(atob(a.array),c=>c.charCodeAt(0));return a.type==='Uint32Array'?new Uint32Array(data.buffer):a.type==='Uint16Array'?new Uint16Array(data.buffer):new Float32Array(data.buffer);},g=new T.BufferGeometry;g.setAttribute('position',new T.BufferAttribute(array(p.position),3));g.setAttribute('normal',new T.BufferAttribute(array(p.normal),3));g.setAttribute('uv',new T.BufferAttribute(array(p.uv),2));g.setIndex(new T.BufferAttribute(array(p.index),1));g.applyMatrix4(new T.Matrix4().fromArray(p.matrix));g.computeBoundingBox();const mesh=new T.Mesh(g,materials[p.material]);mesh.name=p.name;mesh.castShadow=mesh.receiveShadow=true;reference.add(mesh);byName[p.name]=mesh.material;}
 return {reference,byName,textureCount:textures.size};
}
export function createMaterialLibrary(approved){
 const cache=new Map;
 return {get(palette){if(cache.has(palette))return cache.get(palette);const m={...approved};for(const key of ['glass','sideGlass','upperGlass','panel','side','frame','mullion'])m[key]=approved[key].clone();
  const colours={silver:[0xf0f3f5,0x969ba1], 'blue-grey':[0xdce8f3,0x747f8b],'warm-grey':[0xece9e2,0x95918b],graphite:[0xc6d0db,0x555f6a]}[palette];
  for(const key of ['glass','sideGlass','upperGlass'])m[key].color.set(colours[0]);for(const key of ['panel','side'])m[key].color.set(colours[1]);m.panel.metalness=.1;m.panel.roughness=.66;cache.set(palette,m);return m;},cache};
}
