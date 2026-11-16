import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {normalizeSpecification,massing} from './spec.mjs';
import {createLindMaterials} from './materials.js';
// Subtract axis-aligned upper tiers: each exposed roof patch has one owner.
export function exposedRoof(rect,cutters){let patches=[rect];for(const c of cutters){const out=[];for(const p of patches){const x0=Math.max(p[0],c[0]),z0=Math.max(p[1],c[1]),x1=Math.min(p[2],c[2]),z1=Math.min(p[3],c[3]);if(x1<=x0||z1<=z0){out.push(p);continue;}out.push([p[0],p[1],x0,p[3]],[x1,p[1],p[2],p[3]],[x0,p[1],x1,z0],[x0,z1,x1,p[3]]);}patches=out.filter(p=>p[2]-p[0]>1e-6&&p[3]-p[1]>1e-6);}return patches;}
export function buildLind(input,materials){
 const s=normalizeSpecification(input),plan=massing(s),b=new ArchitectureBatch,roofPatches=[];
 const rect=v=>[v.x-v.width/2,v.z-v.depth/2,v.x+v.width/2,v.z+v.depth/2];
 for(const v of plan.volumes){
  const {x,z,width:w,depth:d,start,end}=v,y0=start*s.floorHeight,top=end*s.floorHeight,h=top-y0;
  const sides=[{n:[0,1],u:[1,0],length:w,offset:d/2,g:v.front},{n:[1,0],u:[0,-1],length:d,offset:w/2,g:v.side},{n:[0,-1],u:[-1,0],length:w,offset:d/2,g:v.front},{n:[-1,0],u:[0,1],length:d,offset:w/2,g:v.side}];
  for(const {n,u,length,offset,g}of sides){
   const p=(t,y,o=0)=>[x+u[0]*t+n[0]*(offset+o),y,z+u[1]*t+n[1]*(offset+o)],strip=(key,t,y,width,height,o,depth)=>b.box(key,...p(t,y,o),n[0]?depth:width,height,n[0]?width:depth);
   b.quad('stone',[p(-length/2,y0),p(length/2,y0),p(length/2,top),p(-length/2,top)],[0,0,length/1.5,0,length/1.5,h/3.7,0,h/3.7]);
   // Bay count changes with width; each window retains the same physical width.
   for(let i=0;i<g.count;i++){const t=-g.clear/2+(i+.5)*g.pitch,ww=g.windowWidth;if(v.kind!=='louvred'){b.quad('bay',[p(t-ww/2,y0,.025),p(t+ww/2,y0,.025),p(t+ww/2,top,.025),p(t-ww/2,top,.025)],[0,0,1,0,1,end-start,0,end-start]);b.windowBays+=end-start;}else{b.quad('glass',[p(t-.7,y0+.25,.03),p(t+.7,y0+.25,.03),p(t+.7,top-.7,.03),p(t-.7,top-.7,.03)]);}}
   for(let i=0;i<=g.count;i++){const t=-g.clear/2+i*g.pitch,pw=Math.min(1.22,g.pitch-2.05);b.quad('trim',[p(t-pw/2,y0,.38),p(t+pw/2,y0,.38),p(t+pw/2,top,.38),p(t-pw/2,top,.38)]);b.quad('trim',[p(t-pw/2,y0,-.04),p(t-pw/2,y0,.38),p(t-pw/2,top,.38),p(t-pw/2,top,-.04)]);b.quad('trim',[p(t+pw/2,y0,.38),p(t+pw/2,y0,-.04),p(t+pw/2,top,-.04),p(t+pw/2,top,.38)]);b.quad('trim',[p(t-pw/2,top,-.04),p(t-pw/2,top,.38),p(t+pw/2,top,.38),p(t+pw/2,top,-.04)]);if(i>0&&i<g.count&&i%2===1)strip('trim',t,top+.35,Math.min(1.15,pw),.7,.18,.46);}
   // Two real cornice/parapet rails per tier, not individual floor slabs.
   strip('trim',0,top-.25,length,.28,.10,.34);strip('trim',0,top+(v.kind==='louvred'?.45:.20),length+.35,v.kind==='louvred'?.9:.4,.12,.38);
   if(v.kind==='louvred')for(let yy=y0+.65;yy<top-.75;yy+=1.0)strip('bronze',0,yy,g.clear,.065,.09,.09);
  }
  const cutters=plan.volumes.filter(q=>q.start===end).map(rect),patches=exposedRoof(rect(v),cutters);for(const patch of patches){const [a,c,e,f]=patch;if(e-a<.001||f-c<.001)continue;b.quad('dark',[[a,top,c],[a,top,f],[e,top,f],[e,top,c]]);roofPatches.push({level:top,rect:patch,owner:v.name});}
  // Corner buttress blades emphasize the vertical hierarchy at tower setbacks.
  if(v.name.includes('central')||v.name.includes('upper')||v.kind==='louvred')for(const sx of [-1,1])for(const sz of [-1,1]){b.box('trim',x+sx*(w/2-.45),y0+h/2,z+sz*(d/2-.45),1.25,h,1.25);b.box('stone',x+sx*(w/2-.45),top+.5,z+sz*(d/2-.45),1.05,.65,1.05);}
 }
 // Lind's framed, low hipped green-grey crown. Four real roof planes, no coplanar caps.
 const c=plan.crown,half=c.width/2+.18,corners=[[-half,c.base,c.z+half],[half,c.base,c.z+half],[half,c.base,c.z-half],[-half,c.base,c.z-half]],peak=[0,c.peak,c.z];
 for(let i=0;i<4;i++){b.triangle('roof',[corners[i],corners[(i+1)%4],peak]);b.beam('bronze',corners[i],peak,.065,.065);}
 for(const sign of [-1,1]){b.box('trim',sign*(half+.03),c.base,c.z,.26,.38,2*half+.3);b.box('trim',0,c.base,c.z+sign*(half+.03),2*half-.2,.38,.26);}
 // Tall limestone portal and opaque bronze/glass doors; no hidden interiors.
 const zfront=s.podium?s.podium.depth/2:s.depth*.25,eh=Math.min(10.8,s.floorHeight*3-.25);
 for(const sign of [-1,1])b.box('trim',sign*2.8,eh/2,zfront+.35,.8,eh,.65);
 b.box('trim',0,eh+.2,zfront+.35,6.8,.6,.8);b.box('bronze',0,2.75,zfront+.04,4.6,5.5,.07);b.box('glass',0,2.75,zfront+.085,4.2,5.1,.04);b.box('bronze',0,2.75,zfront+.13,.07,5.1,.05);
 const model=b.finish(materials,s.name),bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3),triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0),bytes=model.children.reduce((n,m)=>n+Object.values(m.geometry.attributes).reduce((t,a)=>t+a.array.byteLength,0)+m.geometry.index.array.byteLength,0);
 model.userData={...model.userData,specification:s,metadata:{id:s.id,family:s.family,version:s.version,dimensions:{width:size.x,depth:size.z,height:size.y},bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},grids:plan.volumes,roofPatches,performance:{triangles,geometryBytes:bytes,materialBatches:model.children.length},orientation:{up:[0,1,0],front:[0,0,1],entrance:[0,0,zfront]},approval:'isolated-visual-review-not-registered'}};return model;
}
export class LindGenerator{
 constructor(materials=createLindMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;this.disposed=false;}
 generate(input){if(this.disposed)throw Error('Generator disposed');const spec=normalizeSpecification(input),{id,name,seed,...shape}=spec,key=JSON.stringify(shape);let e=this.cache.get(key);if(!e){e={model:buildLind(spec,this.materials),users:0};this.cache.set(key,e);}const model=e.model.clone(true);model.name=spec.name;model.userData.specification=spec;model.userData.metadata.id=id;e.users++;this.leases.set(model,key);return model;}
 release(model){if(!this.leases.has(model))return false;this.cache.get(this.leases.get(model)).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
 dispose(){if(this.disposed)return false;if(this.leases.size)throw Error('Release buildings before disposal');this.prune();const textures=new Set;for(const m of Object.values(this.materials)){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();this.disposed=true;return true;}
}
