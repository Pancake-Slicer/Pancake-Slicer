import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {normalizeSpecification,massing} from './spec.mjs';
import {createDecoMaterials} from './materials.js';
import {faceTools,roofPatches,portal,corniceRing,crownPylon} from './components.js';
export function buildDeco(input,materials){const s=normalizeSpecification(input),plan=massing(s),b=new ArchitectureBatch,patchAudit=[];const part=(label,draw)=>{const p=b.begin(label);draw();b.end(p);};
 for(const v of plan.volumes){const lo=v.start*3.6,hi=v.end*3.6,h=hi-lo,base=v.style==='base',attic=['attic','crown','lantern'].includes(v.style),faces=[{n:[0,1],u:[1,0],length:v.width,off:v.depth/2,g:v.front},{n:[1,0],u:[0,-1],length:v.depth,off:v.width/2,g:v.side},{n:[0,-1],u:[-1,0],length:v.width,off:v.depth/2,g:v.front},{n:[-1,0],u:[0,1],length:v.depth,off:v.width/2,g:v.side}];
 part(v.name,()=>{for(const f of faces){const {p,box,strip}=faceTools(b,v,f.n,f.u,f.off),front=f.n[1]===1,edge=plan.entrance,door=base&&front,topBay=attic?2.0:2.04;
 b.quad('stone',[p(-f.length/2,lo,-.25),p(f.length/2,lo,-.25),p(f.length/2,hi,-.25),p(-f.length/2,hi,-.25)],[0,lo/3.6,f.length/3.6,lo/3.6,f.length/3.6,hi/3.6,0,hi/3.6]);
 for(let i=0;i<f.g.count;i++){const t=-f.g.clear/2+(i+.5)*3.6,isDoor=door&&Math.abs(v.x+t-edge.x)<edge.width/2,by=isDoor?edge.height+.65:base?.45:lo+.12,key=v.style==='lantern'?'glass':'bay';if(by<hi-.2){b.quad(key,[p(t-topBay/2,by,-.10),p(t+topBay/2,by,-.10),p(t+topBay/2,hi-.35,-.10),p(t-topBay/2,hi-.35,-.10)],[0,by/3.6,1,by/3.6,1,(hi-.35)/3.6,0,(hi-.35)/3.6]);b.windowBays+=Math.max(0,(hi-by)/3.6);}
 if(attic&&v.style!=='lantern')box('trim',t,hi-.75,topBay+.25,.13,.13,.35);
 if(s.archetype==='C'&&v.style==='attic'){box('trim',t,hi-.32,2.4,.45,.16,.34);for(const sign of [-1,1])box('bronze',t+sign*.43,hi-.30,.075,.30,.36,.06);}
 }
 for(let i=0;i<=f.g.count;i++){const t=-f.g.clear/2+i*3.6,isDoor=door&&Math.abs(v.x+t-edge.x)<edge.width/2,from=isDoor?edge.height+.25:lo,width=base?1.38:attic?1.07:.96;if(from>=hi)continue;strip('trim',t,(from+hi)/2,width,hi-from,.15,base?.9:.67,true);
 if(!base)for(const sign of [-1,1])strip('stone',t+sign*.24,(from+hi)/2,.075,hi-from-.25,.53,.08);
 if(base&&!isDoor){box('trim',t,.28,1.58,.56,.18,1.0);if(s.archetype==='C')for(let floor=1;floor<3;floor++)box('trim',t,floor*3.6,1.44,.16,.24,.96);}
 if(attic&&i>0&&i<f.g.count)box('trim',t,hi+.54,.65,.92,.20,.72);
 }
 // Deliberate base/shaft/crown hierarchy; no floor-by-floor mesh grids.

 if(base){for(const yy of [3.6,7.2]){if(door&&yy<edge.height){const lx=-f.length/2,rx=f.length/2,a=edge.x-edge.width/2,c=edge.x+edge.width/2;if(a>lx)box('trim',(lx+a)/2,yy,a-lx,.20,.08,.60);if(c<rx)box('trim',(c+rx)/2,yy,rx-c,.20,.08,.60);}else box('trim',0,yy,f.length,.20,.08,.60);}}
 // A repeated shallow chevron tablet caps each third pier at upper setbacks.
 if(attic)for(let i=0;i<f.g.count;i+=2){const x=-f.g.clear/2+(i+.5)*3.6,y=hi-.30;for(const sign of [-1,1]){const points=[p(x,y+.22,.43),p(x+sign*.45,y-.07,.43),p(x,y+.06,.50)];b.triangle('bronze',points);}}
 }
 // Solid corner returns close the recessed backing planes at every tier.
 for(const sx of [-1,1])for(const sz of [-1,1])b.box('trim',v.x+sx*(v.width/2-.34),lo+h/2,v.z+sz*(v.depth/2-.34),.68,h,.68);
 corniceRing(b,v,hi-.32,.26,.40);corniceRing(b,v,hi+.10,base?.52:.30,base?.72:.52);
 for(const rect of roofPatches(v,plan.volumes)){const [x0,z0,x1,z1]=rect;b.quad('dark',[[x0,hi+.02,z0],[x0,hi+.02,z1],[x1,hi+.02,z1],[x1,hi+.02,z0]],[x0/5,z0/5,x0/5,z1/5,x1/5,z1/5,x1/5,z0/5]);patchAudit.push({owner:v.name,level:hi,rect});}
 });}
 part('individual entrance order',()=>portal(b,s,plan.entrance));
 part('original roof silhouette',()=>{const top=plan.volumes.filter(v=>v.end===s.storeys),y=plan.roof;for(const v of top){const c=.18;for(const sign of [-1,1]){b.box('stone',v.x+sign*(v.width/2-c),y+.64,v.z,.36,1.24,v.depth);b.box('trim',v.x+sign*(v.width/2-c),y+1.29,v.z,.58,.16,v.depth+.22);b.box('stone',v.x,y+.64,v.z+sign*(v.depth/2-c),v.width-.72,1.24,.36);b.box('trim',v.x,y+1.29,v.z+sign*(v.depth/2-c),v.width-.94,.16,.58);}
 if(s.archetype==='A'){for(const x of [-v.width*.30,0,v.width*.30])crownPylon(b,x,y,0,x===0?3.9:2.9);b.box('bronze',0,y+.35,0,v.width*.45,.7,v.depth*.4);}
 else if(s.archetype==='B'){b.box('stone',0,y+1.52,v.z,Math.max(5.2,v.width-4),2.8,Math.max(5.2,v.depth-4));b.box('trim',0,y+3.0,v.z,Math.max(5.5,v.width-3.6),.28,Math.max(5.5,v.depth-3.6));for(const x of [-2.0,0,2.0])b.box('bronze',x,y+1.8,v.z+(v.depth-4)/2+.04,.15,1.7,.12);}
 else{const count=Math.floor(v.width/3.6);for(let i=0;i<=count;i++){const x=-count*3.6/2+i*3.6;b.box('trim',x,y+1.55,v.depth/2-.16,.74,1.35,.75);b.box('bronze',x,y+2.30,v.depth/2-.16,.48,.10,.52);}b.box('stone',v.width*.22,y+.85,-v.depth*.18,5.4,1.7,4.6);b.box('trim',v.width*.22,y+1.78,-v.depth*.18,5.8,.18,5.0);}
 // Small period-compatible service housings stay within the roof parapet.
 if(s.archetype!=='A')for(const sign of [-1,1]){const x=sign*Math.min(v.width*.28,4.4);b.box('bronze',x,y+.35,v.z-v.depth*.25,1.2,.7,1.6);for(let k=0;k<3;k++)b.box('dark',x,y+.74,v.z-v.depth*.25+(k-1)*.35,1.0,.06,.12);}
 }});
 const model=b.finish(materials,s.name),bounds=new T.Box3().setFromObject(model);model.userData.specification=s;model.userData.roofPatches=patchAudit;model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);model.userData.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};model.userData.architecture={archetype:s.archetype,experimental:true,bayPitch:3.6,entrance:plan.entrance,provenance:'Original massing/entrances/crowns; generic Lind construction principles and shared material finish'};return model;
}
export class DecoGenerator{constructor(materials=createDecoMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;}
 generate(input){const s=normalizeSpecification(input),{id,name,seed,...shape}=s,key=JSON.stringify(shape);let e=this.cache.get(key);if(!e){e={model:buildDeco(s,this.materials),users:0};this.cache.set(key,e);}const model=e.model.clone(true);model.name=name;model.userData.specification=s;e.users++;this.leases.set(model,key);return model;}
 release(model){const key=this.leases.get(model);if(key===undefined)return false;this.cache.get(key).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
}
