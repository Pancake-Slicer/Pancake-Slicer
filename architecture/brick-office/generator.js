
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
 const s=normalizeSpecification(input),plan=massing(s),b=new ArchitectureBatch,fh=s.floorHeight,base=plan.baseFloors*fh,crown=plan.crownStart*fh,roof=s.storeys*fh;
 // Trace only the twelve exposed H-plan faces. No walls or slabs fill its courts.
 const faces=plan.outline.map((a,i)=>{const q=plan.outline[(i+1)%plan.outline.length],dx=q.x-a.x,dz=q.z-a.z,length=Math.hypot(dx,dz),n=[dz/length,-dx/length],u=[-dx/length,-dz/length],mid=[(a.x+q.x)/2,(a.z+q.z)/2],connector=Math.abs(mid[0])<plan.gap/2-.01&&Math.abs(dz)<.001;return {length,n,u,mid,connector,top:(s.storeys-(connector?1:0))*fh};});
 function faceTools(f){const p=(t,y,o=0)=>[f.mid[0]+f.u[0]*t+f.n[0]*o,y,f.mid[1]+f.u[1]*t+f.n[1]*o],box=(key,t,y,w,h,o,depth)=>b.box(key,...p(t,y,o),f.n[0]?depth:w,h,f.n[0]?w:depth);const pier=(key,t,y,w,h,o,d)=>{const lo=y-h/2,hi=y+h/2,l=t-w/2,r=t+w/2,back=o-d/2,front=o+d/2;b.quad(key,[p(l,lo,front),p(r,lo,front),p(r,hi,front),p(l,hi,front)]);b.quad(key,[p(l,lo,back),p(l,lo,front),p(l,hi,front),p(l,hi,back)]);b.quad(key,[p(r,lo,front),p(r,lo,back),p(r,hi,back),p(r,hi,front)]);};return {p,box,pier};}
 function course(f,key,y,height,projection){const {box}=faceTools(f);box(key,0,y,f.length+projection*2,height,projection/2-.05,projection+.1);}
 const marker=b.begin('H-plan limestone base, brick shaft and limestone crown');
 for(const f of faces){const {p,box,pier}=faceTools(f),gridCount=Math.max(1,Math.round((f.length-1.1)/s.targetBay)),clear=f.length-1.1,pitch=clear/gridCount;
  for(const [key,lo,hi]of [['stone',0,base],['brick',base,crown],['stone',crown,f.top]])b.quad(key,[p(-f.length/2,lo,-.07),p(f.length/2,lo,-.07),p(f.length/2,hi,-.07),p(-f.length/2,hi,-.07)]);
  for(let i=0;i<gridCount;i++){const t=-clear/2+(i+.5)*pitch,ww=1.65;
   b.quad('bay',[p(t-ww/2,.65,.015),p(t+ww/2,.65,.015),p(t+ww/2,base-.25,.015),p(t-ww/2,base-.25,.015)],[0,0,1,0,1,plan.baseFloors,0,plan.baseFloors]);
   b.quad('bay',[p(t-ww/2,base+.24,.015),p(t+ww/2,base+.24,.015),p(t+ww/2,crown-.16,.015),p(t-ww/2,crown-.16,.015)],[0,0,1,0,1,plan.crownStart-plan.baseFloors,0,plan.crownStart-plan.baseFloors]);
   b.quad('bay',[p(t-ww/2,crown+.34,.015),p(t+ww/2,crown+.34,.015),p(t+ww/2,f.top-.38,.015),p(t-ww/2,f.top-.38,.015)],[0,0,1,0,1,(f.top-crown)/fh,0,(f.top-crown)/fh]);b.windowBays+=Math.round(f.top/fh);
  }
  // Major masonry piers organize pairs/triples of recessed windows.
  for(let i=0;i<=gridCount;i++){const t=-clear/2+i*pitch,major=i%3===0||i===gridCount;
   pier('trim',t,base/2,major?1.02:.76,base,.19,.5);
   pier('brick',t,(base+crown)/2,major?.88:.50,crown-base,major?.22:.12,major?.6:.4);
   pier('trim',t,(crown+f.top)/2,major?.86:.54,f.top-crown,.21,.52);
   if(major){box('stone',t,base+.45,.98,.5,.27,.66);box('trim',t,crown-.4,.94,.55,.29,.7);box('trim',t,f.top+.86,.7,1.0,.12,.42);box('trim',t,f.top+1.43,.91,.2,.17,.64);}
  }
  for(const y of [base-.36,base+.08])course(f,'trim',y,.24,.35);course(f,'trim',base+.36,.28,.65);
  // Sparse continuous belt courses; the shaft remains predominantly vertical brick.
  for(const level of [Math.round((plan.baseFloors+plan.crownStart)*.5)])course(f,'stone',level*fh,.20,.18);
  course(f,'stone',crown-.25,.32,.25);course(f,'trim',crown+.12,.24,.62);
  course(f,'stone',f.top-.42,.46,.38);course(f,'trim',f.top,.50,.76);course(f,'trim',f.top+.35,.20,.94);
  // Solid parapet panels and raised pier caps articulate the top silhouette.
  course(f,'stone',f.top+.84,1.0,.08);course(f,'trim',f.top+1.36,.18,.31);
 }
 b.end(marker);
 const roofPart=b.begin('stepped H-plan roofs and mechanical penthouse');
 for(const v of plan.volumes.filter(v=>v.start===plan.crownStart))b.box('roof',v.x,v.end*fh-.055,0,v.width,.11,v.depth);
 // One-storey lower connector exposes the inner wing walls above its roof.
 for(const sign of [-1,1])b.box('stone',sign*(plan.gap/2+.08),(s.storeys-.5)*fh,0,.16,fh,plan.coreDepth);
 const connectorRoof=(s.storeys-1)*fh,pw=Math.min(plan.gap-2,plan.gap*.62),pd=plan.coreDepth*.58;
 b.box('metal',0,connectorRoof+1.4,-plan.coreDepth*.08,pw,2.8,pd);b.box('trim',0,connectorRoof+2.88,-plan.coreDepth*.08,pw+.4,.16,pd+.4);
 for(const sign of [-1,1]){const x=sign*(s.width-plan.wingWidth)/2;b.box('metal',x,roof+.64,-s.depth*.18,2.4,1.28,3);for(let j=0;j<4;j++)b.box('roof',x,roof+.3+j*.22,-s.depth*.18+1.52,2.1,.06,.06);b.box('metal',x,roof+1,s.depth*.22,.7,2,.7);b.box('trim',x,roof+2.05,s.depth*.22,1,.16,1);}
 b.end(roofPart);
 const z=plan.entrance.z;b.box('glass',0,2.4,z+.06,4.2,4.8,.12);for(const x of [-2.25,0,2.25])b.box('metal',x,2.45,z+.17,.12,4.9,.13);b.box('trim',0,5.02,z+.21,5.1,.35,.5);b.box('trim',0,5.33,z+.3,5.6,.22,.9);
 const model=b.finish(materials,s.name);
 for(const mesh of model.children)if(mesh.name==='brick'){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/2,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/2);}
 const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3);model.userData={...model.userData,specification:s,metadata:{dimensions:{width:size.x,depth:size.z,height:size.y},bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},grids:plan.volumes,architecture:{revision:2,plan:'H',wingWidth:plan.wingWidth,recess:plan.recess,baseFloors:plan.baseFloors,crownFloors:s.storeys-plan.crownStart},performance:{triangles:model.children.reduce((n,m)=>n+m.geometry.index.count/3,0),materialBatches:model.children.length}}};return model;
}
export class BrickGenerator{
 constructor(materials=createBrickMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;this.disposed=false;}
 generate(input){if(this.disposed)throw Error('Generator disposed');const spec=normalizeSpecification(input),{id,name,seed,...shape}=spec,key=JSON.stringify(shape);let e=this.cache.get(key);if(!e){e={model:buildBrick(spec,this.materials),users:0};this.cache.set(key,e);}const model=e.model.clone(true);model.name=spec.name;model.userData.specification=spec;model.userData.metadata.id=id;e.users++;this.leases.set(model,key);return model;}
 release(model){if(!this.leases.has(model))return false;this.cache.get(this.leases.get(model)).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
 dispose(){if(this.disposed)return false;if(this.leases.size)throw Error('Release buildings before disposal');this.prune();const textures=new Set;for(const m of Object.values(this.materials)){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();this.disposed=true;return true;}
}
