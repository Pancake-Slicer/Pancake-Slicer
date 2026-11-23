import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {faceTools} from '../original-deco/components.js';
import {normalizeSpecification,massing,blockFaces,roofHeight} from './spec.mjs';
import {createWaterfallMaterials} from './materials.js';
export function buildWaterfall(input,materials){const s=normalizeSpecification(input),plan=massing(s),b=new ArchitectureBatch,roofs=[];
 for(const v of plan.blocks){for(const f of blockFaces(v,plan.blocks)){const {p,box,strip}=faceTools(b,{x:f.x,z:f.z},f.n,f.u,0),top=t=>roofHeight(v,f.x+f.u[0]*t,f.z+f.u[1]*t),bottom=t=>f.neighbor?roofHeight(f.neighbor,f.x+f.u[0]*t,f.z+f.u[1]*t):0,half=f.length/2;
 if(Math.max(top(-half)-bottom(-half),top(half)-bottom(half))<.02)continue;
 const door=f.lo===0&&f.n[1]===1&&Math.abs(f.z-9.36)<.01;
 b.quad('stone',[p(-half,bottom(-half),-.2),p(half,bottom(half),-.2),p(half,top(half),-.2),p(-half,top(-half),-.2)],[0,bottom(-half)/3.2,f.length/1.95,bottom(half)/3.2,f.length/1.95,top(half)/3.2,0,top(-half)/3.2]);
 for(let i=0;i<f.grid.count;i++){const t=-half+(i+.5)*f.grid.pitch,a=t-f.grid.windowWidth/2,c=t+f.grid.windowWidth/2,x=f.x+f.u[0]*t,base=door&&Math.abs(x)<3.9?6.5:0,ya=Math.max(base,bottom(a)+.06),yc=Math.max(base,bottom(c)+.06),ha=top(a)-.08,hc=top(c)-.08;if(ya>=ha||yc>=hc)continue;b.quad('bay',[p(a,ya,-.10),p(c,yc,-.10),p(c,hc,-.10),p(a,ha,-.10)],[0,ya/3.2,1,yc/3.2,1,hc/3.2,0,ha/3.2]);b.windowBays+=(Math.min(ha,hc)-Math.max(ya,yc))/3.2;}
 // Slim modern frames, projecting horizontal floor edges on the outer combs.
 for(let i=0;i<=f.grid.count;i++){const t=-half+i*f.grid.pitch,lo=Math.max(bottom(t),door&&Math.abs(f.x+f.u[0]*t)<3.9?6.4:0),hi=top(t);if(hi>lo)strip(v.zone==='wing'?'trim':'metal',t,(hi+lo)/2,v.zone==='wing'?.10:.075,hi-lo,.015,.28,true);}
 for(let floor=1;floor<50;floor++){const y=floor*3.2;if(y<=Math.max(bottom(-half),bottom(half))+.12||y>=Math.min(top(-half),top(half))-.1)continue;if(v.zone==='wing')box('trim',0,y,f.length+.16,.48,.12,.56);else box('metal',0,y,f.length,.11,-.015,.16);}
 b.beam('trim',p(-half,top(-half)+.10,.10),p(half,top(half)+.10,.10),v.zone==='wing'?.32:.14,v.zone==='wing'?.48:.18);
 if(f.lo===0&&!door)box('stone',0,.18,f.length,.36,-.01,.34);
 }
 const x0=v.x-v.width/2,x1=v.x+v.width/2,z0=v.z-v.depth/2,z1=v.z+v.depth/2,points=[[x0,roofHeight(v,x0,z0),z0],[x0,roofHeight(v,x0,z1),z1],[x1,roofHeight(v,x1,z1),z1],[x1,roofHeight(v,x1,z0),z0]];b.quad(v.drop?'dark':'metal',points,[0,0,0,v.depth/2,v.width/2,v.depth/2,v.width/2,0]);roofs.push({name:v.name,sloped:!!v.drop,points});
 if(v.drop){for(let k=1;k<Math.round(v.width/1.95);k++){const x=x0+k*1.95;b.beam('metal',[x,roofHeight(v,x,z0)+.025,z0],[x,roofHeight(v,x,z1)+.025,z1],.10,.12);}for(const x of [x0,x1])b.beam('metal',[x,roofHeight(v,x,z0)+.10,z0],[x,roofHeight(v,x,z1)+.10,z1],.20,.20);}
 else{for(const sign of [-1,1]){b.box('trim',v.x,v.height+.26,v.z+sign*(v.depth/2-.16),v.width,.32,.32);b.box('trim',v.x+sign*(v.width/2-.16),v.height+.26,v.z,.32,.32,v.depth);}}
 }
 // Low articulated mechanical court. The rejected battered cap is deliberately absent.
 b.box('metal',0,160.12,-15.08,30.5,.22,10.7);b.box('metal',-3.9,162.1,-14.3,9.75,3.8,6.5);b.box('metal',-3.9,164.15,-14.3,10.1,.30,6.85);
 for(const side of [-1,1])for(let i=0;i<9;i++)b.box('dark',-7.9+i,162.15,-14.3+side*3.28,.14,2.6,.08);
 for(const x of [4.4,7.8]){b.box('metal',x,160.8,-13,2.6,1.2,3.3);for(let i=0;i<5;i++)b.box('dark',x,161.45,-13+(i-2)*.55,2.35,.10,.28);}b.box('dark',6.1,161.05,-17.9,7.8,1.4,1.3);b.box('metal',-7.8,164.5,-16.8,.35,.6,.35);
 for(const x of [3.8,6.8]){b.box('metal',x,160.7,-9.4,2.3,.9,2.3);for(let i=0;i<12;i++){const a=i*Math.PI/6,c=(i+1)*Math.PI/6;b.triangle('dark',[[x,161.17,-9.4],[x+Math.cos(c)*.86,161.17,-9.4+Math.sin(c)*.86],[x+Math.cos(a)*.86,161.17,-9.4+Math.sin(a)*.86]]);}}
 // Conservative recessed lobby: the tiny reference does not resolve the door detail.
 for(const x of [-1.95,0,1.95]){b.box('metal',x,2.7,9.20,1.9,5.4,.13);b.box('glass',x,2.72,9.30,1.73,5.15,.08);b.box('metal',x,2.7,9.36,.055,5.2,.08);}for(const x of [-3.9,3.9])b.box('trim',x,3.2,9.39,.28,6.4,.28);b.box('metal',0,5.9,9.56,8.2,.15,.65);
 const model=b.finish(materials,s.name),bounds=new T.Box3().setFromObject(model);model.userData.specification=s;model.userData.slopedRoofs=roofs.filter(r=>r.sloped);model.userData.roofAssemblies=roofs;model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);model.userData.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};model.userData.architecture={study:true,approved:false,blocks:14,recess:[15.6,6.24],shoulderElevations:[112,121.6,131.2,140.8,150.4],centralFalls:[120,129.6,139.2],entrance:plan.entrance};return model;}
export class WaterfallGenerator{constructor(materials=createWaterfallMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;}generate(input){const s=normalizeSpecification(input);let e=this.cache.get('fixed');if(!e){e={model:buildWaterfall(s,this.materials),users:0};this.cache.set('fixed',e);}const model=e.model.clone(true);model.name=s.name;e.users++;this.leases.set(model,'fixed');return model;}release(model){if(!this.leases.has(model))return false;this.leases.delete(model);this.cache.get('fixed').users--;model.removeFromParent();return true;}prune(){const e=this.cache.get('fixed');if(e&&!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.clear();}}}
