import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {normalizeSpecification,massing} from './spec.mjs';
import {createAlderwickMaterials} from './materials.js';
export function buildAlderwick(input,materials){
 const s=normalizeSpecification(input),plan=massing(s),w=s.width,d=s.depth,shaftTop=plan.shaftTop,shaftH=shaftTop-16,b=new ArchitectureBatch,pi=Math.PI;
 const baseOutline=plan.baseOutline;
 const shaftOutline=plan.shaftOutline;
 const rect=(w,d,z=0)=>[[-w/2,z-d/2],[w/2,z-d/2],[w/2,z+d/2],[-w/2,z+d/2]];
 function faces(outline){return outline.map((a,i)=>{const q=outline[(i+1)%outline.length],dx=q[0]-a[0],dz=q[1]-a[1],length=Math.hypot(dx,dz),normal=[dz/length,-dx/length],axis=[-dx/length,-dz/length],mid=[(a[0]+q[0])/2,(a[1]+q[1])/2];return {length,normal,axis,mid,index:i};});}
 function tools(f){const p=(t,y,o=0)=>[f.mid[0]+f.axis[0]*t+f.normal[0]*o,y,f.mid[1]+f.axis[1]*t+f.normal[1]*o],box=(key,t,y,w,h,o,d)=>b.box(key,...p(t,y,o),Math.abs(f.normal[0])>.9?d:w,h,Math.abs(f.normal[0])>.9?w:d);
 const slab=(key,t,y,w,h,o,d,caps=false)=>{const l=t-w/2,r=t+w/2,lo=y-h/2,hi=y+h/2,back=o-d/2,front=o+d/2;b.quad(key,[p(l,lo,front),p(r,lo,front),p(r,hi,front),p(l,hi,front)]);b.quad(key,[p(l,lo,back),p(l,lo,front),p(l,hi,front),p(l,hi,back)]);b.quad(key,[p(r,lo,front),p(r,lo,back),p(r,hi,back),p(r,hi,front)]);if(caps){b.quad(key,[p(l,lo,back),p(r,lo,back),p(r,lo,front),p(l,lo,front)]);b.quad(key,[p(l,hi,front),p(r,hi,front),p(r,hi,back),p(l,hi,back)]);}};
 return {p,box,slab};}
 function wall(f,key,lo,hi,offset=-.22){const {p}=tools(f);b.quad(key,[p(-f.length/2,lo,offset),p(f.length/2,lo,offset),p(f.length/2,hi,offset),p(-f.length/2,hi,offset)]);}
 function band(f,key,y,h,projection){const {slab}=tools(f);slab(key,0,y,f.length+projection*2,h,projection/2-.05,projection+.1,true);}
 function part(label,draw){const p=b.begin(label);draw();b.end(p);}
 function diamond(f,t,y,width=.8,height=.36,offset=.12){const {p}=tools(f),centre=p(t,y,offset+.09),a=p(t-width/2,y,offset),c=p(t,y+height/2,offset),d=p(t+width/2,y,offset),e=p(t,y-height/2,offset);for(const points of [[a,e,centre],[e,d,centre],[d,c,centre],[c,a,centre]])b.triangle('terracotta',points);}

 // Square-corner limestone base; the portal replaces the lower central shop bays only.
 part('four-storey limestone commercial base',()=>{for(const f of faces(baseOutline)){const {p,slab,box}=tools(f),front=f.index===2;
 if(front){wall(f,'limestone',8.4,16);b.quad('limestone',[p(-f.length/2,0,-.22),p(-5.6,0,-.22),p(-5.6,8.4,-.22),p(-f.length/2,8.4,-.22)]);b.quad('limestone',[p(5.6,0,-.22),p(f.length/2,0,-.22),p(f.length/2,8.4,-.22),p(5.6,8.4,-.22)]);}else wall(f,'limestone',0,16);
 const xs=front?plan.frontStations:Array.from({length:s.frontBays},(_,i)=>-(s.frontBays*3.3)/2+(i+.5)*3.3),zs=Array.from({length:s.depthBays},(_,i)=>.3-s.depthBays*3.3/2+(i+.5)*3.3),centres=(Math.abs(f.normal[1])>.9?xs.map(x=>(x-f.mid[0])*f.axis[0]):zs.map(z=>(z-f.mid[1])*f.axis[1])).sort((a,b)=>a-b),piers=[centres[0]-(centres[1]-centres[0])/2,...centres.slice(0,-1).map((t,i)=>(t+centres[i+1])/2),centres.at(-1)+(centres.at(-1)-centres.at(-2))/2];
 for(let i=0;i<centres.length;i++){const t=centres[i],portal=front&&Math.abs(t)<5.7,lo=portal?8.5:4.25;
 if(!portal){b.quad('shopGlass',[p(t-1.175,.35,-.14),p(t+1.175,.35,-.14),p(t+1.175,3.72,-.14),p(t-1.175,3.72,-.14)],[0,.35/8,1,.35/8,1,3.72/8,0,3.72/8]);for(const x of [-1.175,1.175])slab('bronze',t+x,2.04,.055,3.46,-.06,.12);slab('bronze',t,3.03,2.35,.06,-.055,.11);if(i%3===1)slab('bronze',t+.48,1.25,.035,1.8,-.035,.06);}
 b.quad('baseGlass',[p(t-1.1,lo,-.16),p(t+1.1,lo,-.16),p(t+1.1,15.6,-.16),p(t-1.1,15.6,-.16)],[0,(lo-4)/8,1,(lo-4)/8,1,11.6/8,0,11.6/8]);b.windowBays+=portal?2:4;
 }
 for(const t of piers){const portal=front&&Math.abs(t)<5.7,lo=portal?8.4:0;slab('limestone',t,(16+lo)/2,1.02,16-lo,.06,.6);for(const x of [-.28,0,.28])slab('limestone',t+x,(15+lo)/2,.07,15-lo,.39,.07);box('terracotta',t,15.15,1.1,.5,.18,.73);if(!portal)box('limestone',t,.3,1.22,.6,.19,.82);}
 for(const y of [4,8]){if(front){for(const sign of [-1,1])slab('limestone',sign*(w/4+2.8),y,w/2-5.6,.18,.04,.28,true);}else band(f,'limestone',y,.18,.18);}band(f,'limestone',15.45,.58,.31);band(f,'terracotta',15.90,.32,.46);band(f,'limestone',16.18,.22,.78);
 }});
 part('grand two-storey central limestone entrance',()=>{const f=faces(baseOutline)[2],{p,slab,box}=tools(f);b.quad('limestone',[p(-5.6,0,-.22),p(-5.6,0,-.88),p(-5.6,8.4,-.88),p(-5.6,8.4,-.22)]);b.quad('limestone',[p(5.6,0,-.88),p(5.6,0,-.22),p(5.6,8.4,-.22),p(5.6,8.4,-.88)]);b.quad('limestone',[p(-5.6,8.4,-.88),p(5.6,8.4,-.88),p(5.6,8.4,-.22),p(-5.6,8.4,-.22)]);b.quad('limestone',[p(-5.6,.04,-.88),p(-5.6,.04,.05),p(5.6,.04,.05),p(5.6,.04,-.88)]);b.quad('limestone',[p(-5.6,0,-.88),p(5.6,0,-.88),p(5.6,8.4,-.88),p(-5.6,8.4,-.88)]);b.quad('shopGlass',[p(-3.6,.08,-.68),p(3.6,.08,-.68),p(3.6,6.8,-.68),p(-3.6,6.8,-.68)],[0,0,1,0,1,1,0,1]);
 for(const sign of [-1,1]){slab('limestone',sign*4.5,3.9,1.18,7.8,.18,1.02,true);for(const x of [-.36,-.18,0,.18,.36])slab('limestone',sign*4.5+x,3.85,.065,6.9,.72,.065);box('limestone',sign*4.5,.24,1.44,.48,.25,1.16);box('limestone',sign*4.5,7.14,1.48,.46,.28,1.18);}
 slab('limestone',0,7.30,10.0,.80,.24,1.06,true);slab('limestone',0,7.88,10.55,.35,.35,1.26,true);slab('limestone',0,8.18,10.95,.24,.40,1.38,true);for(const x of [-3.9,-2.6,-1.3,0,1.3,2.6,3.9])box('limestone',x,7.69,.24,.26,.84,.30);
 for(const x of [-3.6,-1.8,0,1.8,3.6])slab('bronze',x,3.42,.11,6.84,-.53,.20,true);slab('bronze',0,3.62,7.3,.14,-.53,.20,true);slab('bronze',0,6.87,7.42,.17,-.50,.24,true);for(const x of [-2.7,-.9,.9,2.7])slab('bronze',x,5.24,.045,3.12,-.51,.12);for(const x of [-1.95,-1.65,1.65,1.95])slab('bronze',x,1.65,.045,.55,-.37,.11,true);
 });
 // Main street facade: two narrow side pavilions, a broad central field and a shallow central risalit.
 part('broad brick shaft and shallow side pavilions',()=>{for(const f of faces(shaftOutline)){if(f.length<1){wall(f,'umber',16,shaftTop);continue;}const {p,slab,box}=tools(f),front=f.normal[1]>.9,pavilion=front&&Math.abs(f.mid[0])>plan.pavilionInner,centre=front&&!pavilion,count=pavilion?2:Math.round((f.length-(f.length>35?2.4:f.length>25?.9:0))/3.3),clear=count*3.3,pitch=3.3;
 wall(f,'brick',16,shaftTop);for(let i=0;i<count;i++){const t=-clear/2+(i+.5)*pitch,ww=pavilion?1.96:2.32,key=pavilion?'pavilionGlass':'mainGlass';b.quad(key,[p(t-ww/2,16.15,-.14),p(t+ww/2,16.15,-.14),p(t+ww/2,shaftTop-.38,-.14),p(t-ww/2,shaftTop-.38,-.14)],[0,.15/7.2,1,.15/7.2,1,(shaftH-.38)/7.2,0,(shaftH-.38)/7.2]);b.windowBays+=s.shaftStoreys;
 // Real sill ledges on the street elevations; patterned lintels on the repeating tile.
 if(front)for(let floor=0;floor<s.shaftStoreys;floor++)slab('terracotta',t,16+floor*3.6+.49,ww+.18,.12,.06,.25,true);
 if(pavilion)for(const floor of plan.panelFloors){const y=16+(floor-5)*3.6+.24;box('terracotta',t,y,1.42,.43,-.02,.17);diamond(f,t,y,s.detailing?.92:1.06,.30,.10);}
 }
 for(let i=0;i<=count;i++){const t=-clear/2+i*pitch,major=i===0||i===count||centre&&i%4===0;slab(major?'umber':'brick',t,16+shaftH/2,major?.90:.67,shaftH,.10,major?.72:.58);if(major){for(const sign of [-1,1])slab('terracotta',t+sign*.30,16+shaftH/2,.075,shaftH-1.2,.49,.06);box('terracotta',t,shaftTop-.64,1.04,.45,.22,.83);}}
 band(f,'terracotta',16+Math.min(7,s.shaftStoreys-2)*3.6,.24,.20);band(f,'limestone',shaftTop-.50,.5,.34);band(f,'terracotta',shaftTop-.06,.33,.53);band(f,'limestone',shaftTop+.23,.25,.85);
 }});
 function terrace(outer,inner,y){const ax0=-outer.width/2,ax1=outer.width/2,az0=outer.z-outer.depth/2,az1=outer.z+outer.depth/2,bx0=-inner.width/2,bx1=inner.width/2,bz0=inner.z-inner.depth/2,bz1=inner.z+inner.depth/2;for(const [x,z,w,d]of [[0,(az0+bz0)/2,outer.width,bz0-az0],[0,(bz1+az1)/2,outer.width,az1-bz1],[(ax0+bx0)/2,inner.z,bx0-ax0,inner.depth],[(bx1+ax1)/2,inner.z,ax1-bx1,inner.depth]])b.box('roof',x,y-.05,z,w,.1,d);}
 function parapet(outline,y){for(const f of faces(outline)){const {box,slab}=tools(f);band(f,'brick',y+.52,1.04,.06);band(f,'limestone',y+1.07,.16,.20);const n=Math.max(1,Math.round(f.length/3.3));for(let i=0;i<=n;i++){const t=-f.length/2+i*f.length/n;slab('umber',t,y+.73,.42,1.46,.08,.4);box('terracotta',t,y+1.47,.58,.16,.13,.56);}}}
 part('three-stage brick setback crown and terraces',()=>{
 const stages=plan.crown;terrace({width:w,depth:d+.6,z:.3},stages[0],shaftTop);parapet(rect(w,d+.6,.3),shaftTop);
 for(const [index,stage]of stages.entries()){const outline=rect(stage.width,stage.depth,stage.z);for(const f of faces(outline)){const {p,slab,box}=tools(f),count=Math.max(1,Math.round((f.length-1.2)/3.3)),clear=count*3.3,pitch=3.3,height=stage.top-stage.bottom;wall(f,index===stages.length-1?'umber':'brick',stage.bottom,stage.top);for(let i=0;i<count;i++){const t=-clear/2+(i+.5)*pitch,ww=Math.min(2.12,pitch-.65);b.quad(index===stages.length-1?'pavilionGlass':'mainGlass',[p(t-ww/2,stage.bottom+.2,-.18),p(t+ww/2,stage.bottom+.2,-.18),p(t+ww/2,stage.top-.3,-.18),p(t-ww/2,stage.top-.3,-.18)],[0,.2/7.2,1,.2/7.2,1,(height-.3)/7.2,0,(height-.3)/7.2]);b.windowBays+=Math.round(height/3.6);if(index===1&&f.normal[1]>.9)diamond(f,t,stage.bottom+.52,1.2,.44,.10);}
 for(let i=0;i<=count;i++){const t=-clear/2+i*pitch;slab('brick',t,(stage.bottom+stage.top)/2,.70,height,.10,.65);box('terracotta',t,stage.top-.33,.94,.44,.25,.77);if(index===stages.length-1)for(const sign of [-1,1])slab('terracotta',t+sign*.21,(stage.bottom+stage.top)/2,.065,height-.5,.45,.06);}
 band(f,'limestone',stage.bottom+.12,.24,.24);band(f,'terracotta',stage.top-.34,.34,.35);band(f,'limestone',stage.top+.03,index===stages.length-1?.56:.30,index===stages.length-1?.80:.52);band(f,'terracotta',stage.top+.38,.16,index===stages.length-1?.94:.65);
 if(index===stages.length-1){const n=Math.floor(f.length/.64);for(let i=0;i<n;i++)box('terracotta',-f.length/2+(i+.5)*f.length/n,stage.top-.13,.18,.28,.62,.36);}
 }
 if(index<stages.length-1){terrace(stage,stages[index+1],stage.top);parapet(outline,stage.top);}else{b.box('roof',0,stage.top-.05,stage.z,stage.width,.1,stage.depth);parapet(outline,stage.top+.48);}
 }
 });
 part('brick lift and ventilation penthouse with period roof services',()=>{
 const roof=plan.roof,topStage=plan.crown.at(-1),rz=topStage.z+1.5,rx=s.roofArrangement?1.2:0;for(const f of faces(rect(8.4,6.6,-2.3+rz))){f.mid[0]+=rx;const {p,slab}=tools(f);wall(f,'umber',roof,(roof+3.80));band(f,'terracotta',(roof+3.48),.25,.14);band(f,'limestone',(roof+3.82),.22,.28);const count=Math.max(1,Math.round((f.length-1)/2.1));for(let i=0;i<count;i++){const t=-f.length/2+(i+.5)*f.length/count;slab('metal',t,(roof+1.85),1.36,2.05,-.04,.05);for(let j=0;j<7;j++)slab('bronze',t,(roof+1.02)+j*.25,1.32,.055,.02,.05);}}
 b.box('roof',rx,(roof+3.99),-2.3+rz,8.6,.16,6.8);b.box('metal',rx,(roof+4.22),-2.3+rz,7.8,.3,6.0);
 // Two masonry boiler flues have capped terracotta terminals; no modern condenser bank.
 for(const x of [-Math.min(7.6,topStage.width/2-1.2),Math.min(7.6,topStage.width/2-1.2)]){b.box('umber',x,(roof+1.30),topStage.z-Math.min(4.3,topStage.depth/2-1.5),.86,2.6,.92);b.box('terracotta',x,(roof+2.52),topStage.z-Math.min(4.3,topStage.depth/2-1.5),1.05,.22,1.12);b.box('metal',x,(roof+2.72),topStage.z-Math.min(4.3,topStage.depth/2-1.5),.88,.20,.95);}
 function ventilator(x,z){const y=roof,r=.42,top=y+1.45;for(let i=0;i<10;i++){const a=i*2*pi/10,c=(i+1)*2*pi/10,p=(angle,yy,rr=r)=>[x+rr*Math.cos(angle),yy,z+rr*Math.sin(angle)];b.quad('metal',[p(c,y),p(a,y),p(a,top),p(c,top)]);b.triangle('metal',[[x,top+.42,z],p(c,top,.66),p(a,top,.66)]);}b.box('bronze',x,y+.14,z,1.08,.28,1.08);}
 for(const [x,z]of [[-Math.min(6.4,topStage.width/2-1.4),topStage.z+Math.min(3.7,topStage.depth/2-1.7)],[Math.min(6.5,topStage.width/2-1.4),topStage.z+Math.min(3.6,topStage.depth/2-1.7)],[0,topStage.z+Math.min(5.5,topStage.depth/2-1.7)]])ventilator(x,z);
 b.box('metal',Math.min(6.4,topStage.width/2-1.7),(roof+0.18),topStage.z+1.1,1.32,.36,2.5);for(let i=0;i<5;i++)b.box('bronze',Math.min(6.4,topStage.width/2-1.7),(roof+0.40),topStage.z+.08+i*.5,1.42,.05,.065);
 });
 const model=b.finish(materials,s.name);for(const mesh of model.children)if(['brick','umber','limestone','roof'].includes(mesh.name)){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv,scale=['brick','umber'].includes(mesh.name)?[1.2,1.2]:mesh.name==='roof'?[5,5]:[3.2,1.8];for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale[0],(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale[1]);}
 model.userData.design={...s,baseTop:16,shaftTop,bodyHeight:plan.roof,crown:plan.crown,entrance:plan.entrance};model.userData.specification=s;model.userData.reviewOnly=false;model.userData.baseOutline=baseOutline;model.userData.shaftOutline=shaftOutline;model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);model.userData.provenance={geometry:'Approved Alderwick assemblies; native bay and tier grammar',textures:'Original code-generated pixels; no extracted or existing building maps',reused:['Three.js r180','ArchitectureBatch','OptimizedFamilyRenderer','Catalogue physical-lighting adapter']};return model;
}

export class AlderwickGenerator{
 constructor(materials=createAlderwickMaterials()){this.materials=materials;this.cache=new Map;this.leases=new Map;}
 generate(input){const spec=normalizeSpecification(input),{id,name,seed,brickTone,accentTone,glazingTone,preset,...shape}=spec,key=JSON.stringify(shape);let e=this.cache.get(key);if(!e){e={model:buildAlderwick(spec,this.materials),users:0};this.cache.set(key,e);}const model=e.model.clone(true);model.name=name;model.userData.specification=spec;model.userData.design={...model.userData.design,...spec};e.users++;this.leases.set(model,key);return model;}
 release(model){const key=this.leases.get(model);if(key===undefined)return false;this.cache.get(key).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
}
