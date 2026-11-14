import * as T from './engine.js';
import {ArchitectureBatch} from './batched-architecture.js';
import {validateSpecification,tiers,floorBase,VERSION,FAMILY} from './spec.mjs';

export function buildModernist(spec,materials){
 validateSpecification(spec);const b=new ArchitectureBatch,windows=[],volumes=[],equipment=[];
 // Maintain metre-based UV density on solid panels/roof regardless of size.
 const box=(key,x,y,z,w,h,d)=>{const bucket=b.bucket(key),start=bucket.uv.length;b.box(key,x,y,z,w,h,d);const attrs=b.unit.attributes;for(let i=0;i<attrs.position.count;i++){const nx=Math.abs(attrs.normal.getX(i)),ny=Math.abs(attrs.normal.getY(i)),scale=key==='roof'?2:1.5;bucket.uv[start+2*i]*=(nx?d:w)/scale;bucket.uv[start+2*i+1]*=(ny?d:h)/scale;}};
 function facade(tier){
  const w=tier.widthBays*spec.bay,d=tier.depthBays*spec.bay,base=floorBase(spec,tier.start),top=floorBase(spec,tier.end);
  volumes.push({base,top,width:w,depth:d});
  const faces=[{n:[0,1],u:[1,0],length:w,depth:d/2,count:tier.widthBays},{n:[1,0],u:[0,-1],length:d,depth:w/2,count:tier.depthBays},{n:[0,-1],u:[-1,0],length:w,depth:d/2,count:tier.widthBays},{n:[-1,0],u:[0,1],length:d,depth:w/2,count:tier.depthBays}];
  faces.forEach(({n,u,length,depth,count},side)=>{
   const point=(t,y,v=0)=>[u[0]*t+n[0]*(depth+v),y,u[1]*t+n[1]*(depth+v)],strip=(key,t,y,width,height,v,thickness)=>box(key,...point(t,y,v),n[0]?thickness:width,height,n[0]?width:thickness);
   // Continuous recessed backpan closes joints, behind even the recessed doors.
   strip('side',0,(base+top)/2,length,top-base,-.65,.035);
   for(let floor=tier.start;floor<tier.end;floor++){
    const y=floorBase(spec,floor),height=floor===0?spec.lobbyHeight:spec.floorHeight;
    if(floor===0){
     const doorCenter=Math.floor(count/2)-1,doorCols=[doorCenter,doorCenter+1];
     strip('panel',0,y+height-.22,length,.44,-.03,.16);
     for(let col=0;col<count;col++){
      const t=-length/2+(col+.5)*spec.bay,isDoor=side===0&&doorCols.includes(col),plane=isDoor&&spec.entrance==='recessed'?-.46:-.16,low=isDoor?0:.36,high=height-.44;
      if(!isDoor)strip('panel',t,y+.18,spec.bay,.36,-.03,.16);
      b.quad('glass',[point(t-spec.bay/2+.07,low,plane),point(t+spec.bay/2-.07,low,plane),point(t+spec.bay/2-.07,high,plane),point(t-spec.bay/2+.07,high,plane)],paneUV(col,0));b.windowBays++;
      strip('mullion',t,3.05,spec.bay-.12,.055,-.025,.12);
      if(isDoor){strip('mullion',t,1.52,.045,3.04,plane+.06,.09);for(const dx of [-.17,.17])strip('equipment',t+dx,1.4,.025,.55,plane+.12,.035);}
     }
     if(side===0){const t=-length/2+(doorCenter+1)*spec.bay;strip('frame',t,.06,spec.bay*2,.12,.12,.5);if(spec.entrance==='canopy')strip('frame',t,3.32,spec.bay*2+.28,.16,.38,.92);}
    }else{
     strip('panel',0,y+spec.spandrel/2,length,spec.spandrel,-.045,.16);
     strip('mullion',0,y+spec.spandrel+.035,length,.07,.015,.14);strip('mullion',0,y+height-.035,length,.07,.015,.14);
     for(let col=0;col<count;col++){
      const t=-length/2+(col+.5)*spec.bay,bottom=y+spec.spandrel+.1,ceiling=y+height-.1;
      b.quad(side%2?'sideGlass':'glass',[point(t-spec.bay/2+.045,bottom,-.12),point(t+spec.bay/2-.045,bottom,-.12),point(t+spec.bay/2-.045,ceiling,-.12),point(t-spec.bay/2+.045,ceiling,-.12)],paneUV(col,floor));b.windowBays++;
      if(spec.visionRail)strip('mullion',t,bottom+(ceiling-bottom)*.5,spec.bay-.09,.026,-.025,.045);
      windows.push({tier:tier.start,side,floor,col,bottom,top:ceiling,t,bay:spec.bay});
     }
    }
   }
   for(let col=0;col<=count;col++){
    const t=-length/2+col*spec.bay,accent=spec.rhythm==='paired'&&col%spec.structuralBays===0;
    strip(accent?'frame':'mullion',t,(base+top)/2,accent?.105:spec.mullion,top-base,.035,accent?.22:.12);
    if(spec.columns&&tier.start===0&&col%spec.structuralBays===0)strip('frame',t,spec.lobbyHeight/2,.19,spec.lobbyHeight,.2,.3);
   }
   for(const t of [-length/2,length/2])strip('frame',t,(base+top)/2,.19,top-base,.035,.23);
  });
  box('roof',0,top-.09,0,w,.18,d);
  // A continuous parapet belongs to each exposed terrace and top roof.
  const parapet=tier.end===spec.storeys&&spec.roof==='recessed'?.95:.66;
  for(const sign of [-1,1]){box('panel',sign*(w/2-.12),top+parapet/2,0,.24,parapet,d);box('frame',sign*(w/2-.12),top+parapet+.035,0,.3,.07,d+.04);box('panel',0,top+parapet/2,sign*(d/2-.12),w-.48,parapet,.24);box('frame',0,top+parapet+.035,sign*(d/2-.12),w-.28,.07,.3);}
 }
 function paneUV(col,floor){const c=(col+Math.floor(floor/4))%4,r=floor%3,u0=(c*128+1)/512,u1=(c*128+127)/512,v0=(512-(r*170+169))/512,v1=(512-(r*170+1))/512;return[u0,v0,u1,v0,u1,v1,u0,v1];}
 const levels=tiers(spec);levels.forEach(facade);
 const top=floorBase(spec,spec.storeys),roof=levels.at(-1),w=roof.widthBays*spec.bay,d=roof.depthBays*spec.bay;
 function housing(x,z,width,depth,height){
  box('dark',x,top+.12,z,width+.16,.24,depth+.16);box('equipment',x,top+.24+height/2,z,width,height,depth);box('dark',x,top+.24+height+.035,z,width+.1,.07,depth+.1);
  for(let y=top+.45;y<top+height+.18;y+=.2)box('mullion',x,y,z+depth/2+.015,width-.16,.035,.045);
  equipment.push({x,z,width:width+.16,depth:depth+.16,base:top,top:top+.31+height});return top+.31+height;
 }
 if(spec.roof==='penthouse'){
  const pw=Math.min(w*.42,spec.bay*5),pd=Math.min(d*.38,spec.bay*4);housing(0,-d*.12,pw,pd,spec.floorHeight);box('roof',0,top+.31+spec.floorHeight,-d*.12,pw+.25,.12,pd+.25);
  housing(-w*.27,d*.22,2.8,2.4,1.1);housing(w*.27,d*.22,2.8,2.4,1.1);
 }else if(spec.roof!=='parapet'){
  const plantHeight=spec.roof==='screened'?1.55:1.05;
  for(const x of [-w*.19,w*.19])for(const z of [-d*.15,d*.15])housing(x,z,Math.min(3.4,w*.15),Math.min(2.8,d*.15),plantHeight);
  // Ducts sit on actual low supports, inside the plant court.
  for(const x of [-w*.19,w*.19]){box('dark',x,top+.17,0,1.1,.34,d*.15);box('equipment',x,top+.55,0,.75,.42,d*.31);}
  if(spec.roof==='screened'){
   const sw=w*.64,sd=d*.6,h=2.35;for(const sign of [-1,1]){for(let y=.15;y<h;y+=.19){box('mullion',0,top+y,sign*sd/2,sw,.055,.075);box('mullion',sign*sw/2,top+y,0,.075,.055,sd);}for(let i=0;i<=Math.ceil(sw/spec.bay);i++)box('frame',-sw/2+sw*i/Math.ceil(sw/spec.bay),top+h/2,sign*sd/2,.09,h,.09);for(let i=0;i<=Math.ceil(sd/spec.bay);i++)box('frame',sign*sw/2,top+h/2,-sd/2+sd*i/Math.ceil(sd/spec.bay),.09,h,.09);}
  }
 }
 const group=b.finish(materials,spec.name),bounds=new T.Box3().setFromObject(group),size=bounds.getSize(new T.Vector3),geometryBytes=group.children.reduce((n,m)=>n+Object.values(m.geometry.attributes).reduce((a,v)=>a+v.array.byteLength,0)+m.geometry.index.array.byteLength,0),triangles=group.children.reduce((n,m)=>n+m.geometry.index.count/3,0);
 group.userData={spec,metadata:{id:spec.id,family:FAMILY,seed:spec.seed,storeys:spec.storeys,generatorVersion:VERSION,dimensions:{width:size.x,depth:size.z,height:size.y},footprint:{width:size.x,depth:size.z,min:[bounds.min.x,bounds.min.z],max:[bounds.max.x,bounds.max.z]},facade:{bay:spec.bay,widthBays:spec.widthBays,depthBays:spec.depthBays,structuralBays:spec.structuralBays,mullion:spec.mullion,spandrel:spec.spandrel,rhythm:spec.rhythm},material:{palette:spec.palette,source:'unchanged approved Ohneeohnee embedded atlas/stone/roof maps'},roof:{type:spec.roof},performance:{triangles,geometryBytes,materialBatches:group.children.length,windowBays:b.windowBays},approval:'experimental-not-approved'},windows,volumes,equipment};return group;
}

// Repeated specifications reuse geometry; variants share palette materials/maps.
export class ModernistGenerator{
 constructor(materialLibrary){this.materialLibrary=materialLibrary;this.cache=new Map;}
 generate(spec){validateSpecification(spec);const {id,seed,revision,name,archetype,...shape}=spec,key=JSON.stringify(shape);let entry=this.cache.get(key);if(!entry){entry={model:buildModernist(spec,this.materialLibrary.get(spec.palette)),users:0};this.cache.set(key,entry);}entry.users++;const group=entry.model.clone(true);group.name=spec.name;group.userData.spec=structuredClone(spec);group.userData.metadata={...group.userData.metadata,id:spec.id,seed:spec.seed};group.userData.resourceKey=key;return group;}
 release(group){const entry=this.cache.get(group.userData.resourceKey);if(entry)entry.users--;if(this.cache.size>24)for(const [key,e]of this.cache){if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);if(this.cache.size<=24)break;}}}
}
