
import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {normalizeSpecification,massing} from './spec.mjs';
// Original procedural pixels: architectural inspiration only, no extracted SC4 art.
export function createBrickMaterials(){
 function texture(w,h,pixel){const data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)data.set([...pixel(x,y),255],(y*w+x)*4);const t=new T.DataTexture(data,w,h);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;}
 const brick=texture(128,128,(x,y)=>{const row=Math.floor(y/8),xx=(x+(row%2)*16)%32,j=Math.floor((x+(row%2)*16)/32),v=((j*19+row*31)%15)-7;return y%8===0||xx===0?[110,91,73]:[145+v,83+v,57+v];});
 const bay=texture(64,128,(x,y)=>{const pane=x>6&&x<57&&y>20&&y<114,frame=x<5||x>58||y<8||y>119,rail=Math.abs(x-32)<1||y===65;return pane&&!rail?[68+Math.round(y*.13),85+Math.round(y*.1),87+Math.round(y*.1)]:frame?[171,157,128]:[97,79,61];});
 const mat=(name,color,roughness,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness,...extra});m.name=name;return m;};
 return {brick:mat('brick',0xe1d2bc,.96,{map:brick}),stone:mat('stone',0xb8ad93,.94),trim:mat('trim',0xc8bfa8,.88),bay:mat('bay',0xe4e0d4,.42,{map:bay,metalness:.04}),glass:mat('glass',0x53666a,.3,{metalness:.15}),roof:mat('roof',0x686963,.98),metal:mat('metal',0x535b59,.7,{metalness:.22})};
}
export function buildBrick(input,materials){
 const s=normalizeSpecification(input),plan=massing(s),b=new ArchitectureBatch,fh=s.floorHeight;
 function ring(key,w,d,y,h,projection){for(const sign of [-1,1]){b.box(key,0,y,sign*(d/2+projection/2),w+2*projection,h,projection);b.box(key,sign*(w/2+projection/2),y,0,projection,h,d);}}
 for(const v of plan.volumes){const w=v.width,d=v.depth,y0=v.start*fh,top=v.end*fh,base=v.start===0,shaftStart=base?2*fh:y0;
  for(const {n,u,length,offset,g}of [{n:[0,1],u:[1,0],length:w,offset:d/2,g:v.front},{n:[1,0],u:[0,-1],length:d,offset:w/2,g:v.side},{n:[0,-1],u:[-1,0],length:w,offset:d/2,g:v.front},{n:[-1,0],u:[0,1],length:d,offset:w/2,g:v.side}]){
   const p=(t,y,o=0)=>[u[0]*t+n[0]*(offset+o),y,u[1]*t+n[1]*(offset+o)],strip=(key,t,y,ww,h,o,depth)=>b.box(key,...p(t,y,o),n[0]?depth:ww,h,n[0]?ww:depth);
   b.quad('brick',[p(-length/2,y0,-.06),p(length/2,y0,-.06),p(length/2,top,-.06),p(-length/2,top,-.06)],[0,0,length/2,0,length/2,(top-y0)/2,0,(top-y0)/2]);
   if(base)b.quad('stone',[p(-length/2,0),p(length/2,0),p(length/2,2*fh),p(-length/2,2*fh)]);
   for(let i=0;i<g.count;i++){const t=-g.clear/2+(i+.5)*g.pitch,ww=g.windowWidth;
    b.quad('bay',[p(t-ww/2,shaftStart,.015),p(t+ww/2,shaftStart,.015),p(t+ww/2,top,.015),p(t-ww/2,top,.015)],[0,0,1,0,1,(top-shaftStart)/fh,0,(top-shaftStart)/fh]);b.windowBays+=(v.end-(base?2:v.start));
    if(base){b.quad('bay',[p(t-.98,.7,.025),p(t+.98,.7,.025),p(t+.98,2*fh-.2,.025),p(t-.98,2*fh-.2,.025)],[0,0,1,0,1,2,0,2]);b.windowBays+=2;}
   }
   for(let i=0;i<=g.count;i++){const t=-g.clear/2+i*g.pitch;strip('brick',t,(shaftStart+top)/2,.76,top-shaftStart,.16,.44);if(base)strip('trim',t,fh,.82,2*fh,.16,.42);strip('trim',t,top-.34,.93,.42,.2,.5);}
   // Stone sill courses read across bays without per-window meshes.
   for(let floor=(base?3:v.start+1);floor<v.end;floor++)if(floor%4===0)strip('stone',0,floor*fh+.1,length,.17,.03,.15);
  }
  if(base){ring('trim',w,d,2*fh,.42,.36);ring('stone',w,d,2*fh-.38,.18,.20);ring('trim',w,d,6*fh,.24,.2);}
  ring('stone',w,d,top-.36,.22,.23);ring('trim',w,d,top,.36,.58);ring('trim',w,d,top+.27,.17,.72);
  if(base){const cw=s.width-1.6,cd=s.depth-1.6;for(const sign of [-1,1]){b.box('roof',0,top+.02,sign*(cd/2+.4),w,.08,.8);b.box('roof',sign*(cw/2+.4),top+.02,0,.8,.08,cd);}}
 }
 const roof=s.storeys*fh,w=s.width-1.6,d=s.depth-1.6;b.box('roof',0,roof-.05,0,w,.1,d);
 ring('brick',w-.5,d-.5,roof+.65,1.3,.25);ring('trim',w,d,roof+1.34,.2,.5);
 b.box('stone',0,roof+1.12,-d*.13,w*.29,2.24,d*.31);b.box('trim',0,roof+2.3,-d*.13,w*.29+.35,.18,d*.31+.35);
 for(const sign of [-1,1]){b.box('metal',sign*w*.29,roof+.65,d*.2,2.3,1.3,2.4);for(let j=0;j<4;j++)b.box('roof',sign*w*.29,roof+.3+j*.23,d*.2+1.22,2,.07,.05);b.box('metal',sign*w*.18,roof+1.1,-d*.3,.7,2.2,.7);}
 const z=s.depth/2;b.box('glass',0,2.4,z+.05,4.2,4.8,.12);for(const x of [-2.25,0,2.25])b.box('metal',x,2.45,z+.16,.12,4.9,.13);b.box('trim',0,5.02,z+.19,5.1,.35,.45);b.box('trim',0,5.31,z+.28,5.6,.2,.8);
 const model=b.finish(materials,s.name);for(const mesh of model.children)if(mesh.name==='brick'){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/2,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/2);}const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3);model.userData={...model.userData,specification:s,metadata:{dimensions:{width:size.x,depth:size.z,height:size.y},bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},grids:plan.volumes,performance:{triangles:model.children.reduce((n,m)=>n+m.geometry.index.count/3,0),materialBatches:model.children.length}}};return model;
}
export class BrickGenerator{
 constructor(materials=createBrickMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;this.disposed=false;}
 generate(input){if(this.disposed)throw Error('Generator disposed');const spec=normalizeSpecification(input),{id,name,seed,...shape}=spec,key=JSON.stringify(shape);let e=this.cache.get(key);if(!e){e={model:buildBrick(spec,this.materials),users:0};this.cache.set(key,e);}const model=e.model.clone(true);model.name=spec.name;model.userData.specification=spec;model.userData.metadata.id=id;e.users++;this.leases.set(model,key);return model;}
 release(model){if(!this.leases.has(model))return false;this.cache.get(this.leases.get(model)).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
 dispose(){if(this.disposed)return false;if(this.leases.size)throw Error('Release buildings before disposal');this.prune();const textures=new Set;for(const m of Object.values(this.materials)){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();this.disposed=true;return true;}
}
