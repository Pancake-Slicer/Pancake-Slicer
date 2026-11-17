
import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {normalizeSpecification,massing} from './spec.mjs';
export function createVonMaterials(){
 // Repeating storey tile; fixed physical bay width and opaque glazing.
 const pixels=new Uint8Array(64*128*4);for(let y=0;y<128;y++)for(let x=0;x<64;x++){const glass=x>3&&x<60&&y>18&&y<118,rail=x===31||x===32||y===64,v=glass&&!rail?100+(118-y)*.13+Math.cos(x/64*Math.PI)*3:53;pixels.set([v-12,v+1,v+10,255],(y*64+x)*4);}
 const bay=new T.DataTexture(pixels,64,128);bay.colorSpace=T.SRGBColorSpace;bay.wrapS=bay.wrapT=T.RepeatWrapping;bay.generateMipmaps=true;bay.minFilter=T.LinearMipmapLinearFilter;bay.magFilter=T.LinearFilter;bay.needsUpdate=true;
 const grain=new Uint8Array(32*32*4);for(let i=0;i<1024;i++){const v=220+((i*37)%11-5);grain.set([v,v+1,v+2,255],i*4);}const stone=new T.DataTexture(grain,32,32);stone.colorSpace=T.SRGBColorSpace;stone.wrapS=stone.wrapT=T.RepeatWrapping;stone.needsUpdate=true;
 const mat=(name,color,roughness,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness,...extra});m.name=name;return m;};
 return {stone:mat('stone',0x555e65,.94,{map:stone}),trim:mat('trim',0x858e94,.87,{map:stone}),bay:mat('bay',0xffffff,.34,{map:bay,metalness:.08}),glass:mat('glass',0x617c8b,.29,{metalness:.26}),roof:mat('roof',0x646e76,.97),metal:mat('metal',0x343e45,.58,{metalness:.42}),plant:mat('plant',0x778187,.83,{metalness:.12})};
}
export function buildVon(input,materials){
 const s=normalizeSpecification(input),plan=massing(s),b=new ArchitectureBatch;
 for(const v of plan.volumes){const w=v.width,d=v.depth,y0=v.start*s.floorHeight,top=v.end*s.floorHeight,h=top-y0;
  const sides=[{n:[0,1],u:[1,0],length:w,offset:d/2,g:v.front},{n:[1,0],u:[0,-1],length:d,offset:w/2,g:v.side},{n:[0,-1],u:[-1,0],length:w,offset:d/2,g:v.front},{n:[-1,0],u:[0,1],length:d,offset:w/2,g:v.side}];
  for(const {n,u,length,offset,g}of sides){const p=(t,y,o=0)=>[u[0]*t+n[0]*(offset+o),y,u[1]*t+n[1]*(offset+o)],strip=(key,t,y,w,h,o,d)=>b.box(key,...p(t,y,o),n[0]?d:w,h,n[0]?w:d);
   b.quad('stone',[p(-length/2,y0,-.04),p(length/2,y0,-.04),p(length/2,top,-.04),p(-length/2,top,-.04)],[0,0,length/1.5,0,length/1.5,h/3.6,0,h/3.6]);
   for(let i=0;i<g.count;i++){const t=-g.clear/2+(i+.5)*g.pitch,ww=g.windowWidth;b.quad('bay',[p(t-ww/2,y0,.025),p(t+ww/2,y0,.025),p(t+ww/2,top,.025),p(t-ww/2,top,.025)],[0,0,1,0,1,v.end-v.start,0,v.end-v.start]);b.windowBays+=v.end-v.start;}
   for(let i=0;i<=g.count;i++)strip('trim',-g.clear/2+i*g.pitch,y0+h/2,.62,h,.21,.5);
   strip('trim',0,top-.15,length,.3,.08,.25);
  }
  // Four exposed terrace panels avoid a roof slab through the tower.
  if(v.name==='podium'){const dx=(w-s.width)/2,dz=(d-s.depth)/2;for(const sign of [-1,1]){b.box('roof',0,top-.06,sign*(s.depth/2+dz/2),w,.12,dz);b.box('roof',sign*(s.width/2+dx/2),top-.06,0,dx,.12,s.depth);}}
 }
 const roof=s.storeys*s.floorHeight;b.box('roof',0,roof-.06,0,s.width,.12,s.depth);
 for(const sign of [-1,1]){b.box('trim',sign*(s.width/2-.12),roof+.3,0,.24,.6,s.depth);b.box('trim',0,roof+.3,sign*(s.depth/2-.12),s.width-.48,.6,.24);}
 b.box('plant',0,roof+1.55,-s.depth*.12,s.width*.32,3.1,s.depth*.3);b.box('roof',0,roof+3.2,-s.depth*.12,s.width*.32+.15,.2,s.depth*.3+.15);
 for(const sign of [-1,1]){b.box('plant',sign*s.width*.27,roof+.65,s.depth*.20,2.4,1.3,2.2);for(let j=0;j<4;j++)b.box('metal',sign*s.width*.27,roof+.3+j*.23,s.depth*.20+1.12,2.1,.06,.05);}
 const z=(s.podium?.depth||s.depth)/2;b.box('glass',0,2.2,z+.08,4.2,4.4,.1);for(const x of [-2.3,0,2.3])b.box('metal',x,2.3,z+.17,.12,4.6,.15);b.box('trim',0,4.7,z+.28,5.1,.3,.7);
 const model=b.finish(materials,s.name),bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3);model.userData={...model.userData,specification:s,metadata:{dimensions:{width:size.x,depth:size.z,height:size.y},bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},grids:plan.volumes,performance:{triangles:model.children.reduce((n,m)=>n+m.geometry.index.count/3,0),materialBatches:model.children.length}}};return model;
}
export class VonGenerator{
 constructor(materials=createVonMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;this.disposed=false;}
 generate(input){if(this.disposed)throw Error('Generator disposed');const spec=normalizeSpecification(input),{id,name,seed,...shape}=spec,key=JSON.stringify(shape);let e=this.cache.get(key);if(!e){e={model:buildVon(spec,this.materials),users:0};this.cache.set(key,e);}const model=e.model.clone(true);model.name=spec.name;model.userData.specification=spec;model.userData.metadata.id=id;e.users++;this.leases.set(model,key);return model;}
 release(model){if(!this.leases.has(model))return false;this.cache.get(this.leases.get(model)).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
 dispose(){if(this.disposed)return false;if(this.leases.size)throw Error('Release buildings before disposal');this.prune();const textures=new Set;for(const m of Object.values(this.materials)){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();this.disposed=true;return true;}
}
