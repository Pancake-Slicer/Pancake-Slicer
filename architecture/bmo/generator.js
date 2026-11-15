import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {normalizeSpecification,resolveGrid,floorBase,FAMILY,VERSION} from './spec.mjs';

export function createMaterials(){
 // A physical panel-joint tile, not a stretched photograph/window texture.
 const width=256,height=64,pixels=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const n=((x*31+y*17)%7-3)*.45,v=x<1?190:233+n;pixels.set([v,v+1,v+2,255],(y*width+x)*4);}
 const panel=new T.DataTexture(pixels,width,height);panel.colorSpace=T.SRGBColorSpace;panel.wrapS=panel.wrapT=T.RepeatWrapping;panel.anisotropy=8;panel.minFilter=T.LinearMipmapLinearFilter;panel.magFilter=T.LinearFilter;panel.generateMipmaps=true;panel.needsUpdate=true;
 const reflectionPixels=new Uint8Array(128*64*4);for(let y=0;y<64;y++)for(let x=0;x<128;x++){const sky=1-y/63,h=Math.exp(-Math.pow((y/63-.49)/.13,2)),v=64+sky*43+h*23;reflectionPixels.set([v-6,v+1,v+9,255],(y*128+x)*4);}
 const reflection=new T.DataTexture(reflectionPixels,128,64);reflection.mapping=T.EquirectangularReflectionMapping;reflection.colorSpace=T.SRGBColorSpace;reflection.minFilter=reflection.magFilter=T.LinearFilter;reflection.needsUpdate=true;
 const mat=(name,color,roughness,other={})=>{const m=new T.MeshStandardMaterial({color,roughness,...other});m.name=name;return m;};
 const materials={silver:mat('Silver panel',0xd1d7db,.79,{map:panel,metalness:.12}),edge:mat('Folded silver edge',0xdce1e3,.64,{metalness:.2}),corner:mat('Dark corner framing',0x253743,.64,{metalness:.14}),metal:mat('Window mullions',0x667681,.56,{metalness:.3}),roof:mat('Roof membrane',0x434f57,.97),plant:mat('Mechanical housings',0x76848c,.86)};
 for(let i=0;i<3;i++)materials['glass'+i]=mat('Blue-grey ribbon '+i,[0x3c515e,0x405663,0x384c59][i],.3,{metalness:.22,envMap:reflection,envMapIntensity:.35});return materials;
}
export function buildBuilding(input,materials){
 const s=normalizeSpecification(input),b=new ArchitectureBatch,grids=[],box=(...a)=>b.box(...a),windowRows=[];
 function volume(width,depth,start,end,topCap=false){
  const base=floorBase(s,start),top=floorBase(s,end),grid=resolveGrid(width,depth,start===0&&s.podium?{...s,frontBays:null,sideBays:null}:s),height=top-base+(topCap?s.capHeight:0);grids.push({width,depth,start,end,...grid});
  // Sealed inner shell behind the recessed ribbons: no interiors or light leaks.
  // Keep shell tops below the separate deck; no coincident upward faces.
  const shellHeight=height-(topCap?.08:0);box('corner',0,base+shellHeight/2,0,width-.4,shellHeight,depth-.4);
  for(const sx of [-1,1])for(const sz of [-1,1])box('corner',sx*(width/2-s.cornerWidth/2),base+shellHeight/2,sz*(depth/2-s.cornerWidth/2),s.cornerWidth,shellHeight,s.cornerWidth);
  const faces=[{n:[0,1],u:[1,0],length:width,offset:depth/2,grid:grid.front},{n:[1,0],u:[0,-1],length:depth,offset:width/2,grid:grid.side},{n:[0,-1],u:[-1,0],length:width,offset:depth/2,grid:grid.front},{n:[-1,0],u:[0,1],length:depth,offset:width/2,grid:grid.side}];
  faces.forEach(({n,u,length,offset,grid:g},side)=>{
   const point=(t,y,p=0)=>[u[0]*t+n[0]*(offset+p),y,u[1]*t+n[1]*(offset+p)],strip=(key,t,y,w,h,p,d)=>box(key,...point(t,y,p),n[0]?d:w,h,n[0]?w:d);
   function panel(y,h){const bucket=b.bucket('silver'),first=bucket.p.length/3;strip('silver',0,y,g.clear,h,.045,.19);for(let i=first;i<bucket.p.length/3;i++){const t=bucket.p[i*3]*u[0]+bucket.p[i*3+2]*u[1];bucket.uv[i*2]=(t+g.clear/2)/g.pitch;bucket.uv[i*2+1]=(bucket.p[i*3+1]-(y-h/2))/h;}}
   for(let floor=start;floor<end;floor++){
    const y=floorBase(s,floor),h=floor===0?s.lobbyHeight:s.floorHeight,lobby=floor===0,glassHeight=lobby?h-.7:h*(1-s.bandRatio),bottom=y+(lobby?.25:.10),glassKey='glass'+(Math.floor(floor/5)%3);
    b.quad(glassKey,[point(-g.clear/2,bottom,-.13),point(g.clear/2,bottom,-.13),point(g.clear/2,bottom+glassHeight,-.13),point(-g.clear/2,bottom+glassHeight,-.13)]);b.windowBays+=g.count;
    const bandBottom=bottom+glassHeight+.045;panel((bandBottom+y+h)/2,y+h-bandBottom);
    strip('edge',0,bandBottom+.018,g.clear,.036,.115,.06);
    // Small corner vision slots retain the dark continuous perimeter frame.
    if(!lobby)for(const sign of [-1,1]){const t=sign*(length/2-s.cornerWidth/2),w=s.cornerWidth*.40,gh=glassHeight*.65;b.quad('glass2',[point(t-w/2,bottom+.16,.012),point(t+w/2,bottom+.16,.012),point(t+w/2,bottom+.16+gh,.012),point(t-w/2,bottom+.16+gh,.012)]);}
    windowRows.push({side,floor,pitch:g.pitch,count:g.count,glassHeight,bandHeight:y+h-bandBottom});
   }
   // Long rails are hidden by opaque horizontal bands; they appear only in
   // ribbon openings. One baked box per stack, not one mesh per window.
   for(let i=0;i<=g.count;i++){const t=-g.clear/2+i*g.pitch;strip('metal',t,base+(top-base)/2,.045,top-base,-.075,.09);if(start===0&&i%3===0)strip('silver',t,s.lobbyHeight/2,.34,s.lobbyHeight,.01,.27);}
   if(topCap){panel(top+s.capHeight/2,s.capHeight);strip('edge',0,top+s.capHeight-.04,g.clear,.08,.12,.07);}
   if(start===0&&side===0){strip('metal',0,2.0,.07,3.55,-.04,.11);strip('silver',0,3.83,3.6,.18,.08,.4);strip('edge',0,.08,3.6,.16,.15,.54);for(const x of [-.18,.18])strip('metal',x,1.5,.04,.65,-.015,.06);}
  });
 }
 const p=s.podium;if(p){volume(p.width,p.depth,0,p.storeys);volume(s.width,s.depth,p.storeys,s.storeys,true);
  // Four nonoverlapping terrace panels, never a roof slab through the tower.
  const y=floorBase(s,p.storeys)+.06,dx=(p.width-s.width)/2,dz=(p.depth-s.depth)/2;
  for(const sign of [-1,1]){box('roof',0,y,sign*(s.depth/2+dz/2),p.width,.12,dz);box('roof',sign*(s.width/2+dx/2),y,0,dx,.12,s.depth);}
 }else volume(s.width,s.depth,0,s.storeys,true);
 const roof=floorBase(s,s.storeys)+s.capHeight;box('roof',0,roof-.055,0,s.width-.12,.11,s.depth-.12);
 for(const sign of [-1,1]){box('edge',sign*(s.width/2-.12),roof+.23,0,.22,.46,s.depth-.05);box('edge',0,roof+.23,sign*(s.depth/2-.12),s.width-.44,.46,.22);}
 // Broad blank white mechanical penthouse is part of the reference identity.
 const pw=Math.max(6,Math.min(18,s.width*.44)),pd=Math.max(5,Math.min(14,s.depth*.44)),pz=-s.depth*.08;
 box('silver',0,roof+s.penthouseHeight/2,pz,pw,s.penthouseHeight,pd);box('roof',0,roof+s.penthouseHeight+.06,pz,pw+.18,.12,pd+.18);
 for(let i=0;i<5;i++)box('metal',-pw*.38+i*pw*.19,roof+1.35,pz+pd/2+.015,pw*.115,1.4,.045);
 if(s.equipmentCount){const z=s.depth*.28,front=pz+pd/2;box('plant',0,roof+.43,(z+front)/2,.55,.45,z-front+.15);for(const sign of [-1,1])if(sign<0||s.equipmentCount>1)box('plant',sign*s.width*.145,roof+.43,z,s.width*.29,.45,.55);}
 for(let i=0;i<s.equipmentCount;i++){const row=Math.floor(i/2),x=(i%2?1:-1)*s.width*.29,z=s.depth*.28-row*2.9,w=Math.min(2.8,s.width*.12),d=2.0;
  box('metal',x,roof+.16,z,w+.2,.32,d+.2);box('plant',x,roof+.8,z,w,1.05,d);box('metal',x,roof+1.36,z,w+.06,.07,d+.06);
  for(let j=0;j<12;j++){const a=j*Math.PI/6,c=(j+1)*Math.PI/6,r=.48;b.triangle('plant',[[x,roof+1.41,z],[x+Math.cos(c)*r,roof+1.41,z+Math.sin(c)*r],[x+Math.cos(a)*r,roof+1.41,z+Math.sin(a)*r]]);}
 }
 const model=b.finish(materials,s.name),bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3);const maps=new Set;model.traverse(mesh=>{if(mesh.material)for(const v of Object.values(mesh.material))if(v?.isTexture)maps.add(v);});const performance={triangles:model.children.reduce((n,m)=>n+m.geometry.index.count/3,0),geometryBytes:model.children.reduce((n,m)=>n+Object.values(m.geometry.attributes).reduce((n,a)=>n+a.array.byteLength,0)+m.geometry.index.array.byteLength,0),materialBatches:model.children.length,textureBytes:Math.round([...maps].reduce((n,t)=>n+t.image.width*t.image.height*4*4/3,0))};model.userData={...model.userData,specification:s,metadata:{family:FAMILY,version:VERSION,id:s.id,storeys:s.storeys,floorHeight:s.floorHeight,performance,dimensions:{width:size.x,depth:size.z,height:size.y},bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},footprint:[[bounds.min.x,bounds.min.z],[bounds.max.x,bounds.min.z],[bounds.max.x,bounds.max.z],[bounds.min.x,bounds.max.z]],orientation:{origin:[0,0,0],up:[0,1,0],front:[0,0,1],entrance:[0,0,(p?.depth||s.depth)/2]},grids,windowRows,approval:'visual-review-only-not-registered'}};return model;
}
export class BmoGenerator{
 constructor(){this.materials=createMaterials();this.cache=new Map;this.leases=new Map;this.disposed=false;}
 generate(input){if(this.disposed)throw Error('Generator disposed');const spec=normalizeSpecification(input),{id,name,...shape}=spec,key=JSON.stringify(shape);let entry=this.cache.get(key);if(!entry){entry={model:buildBuilding(spec,this.materials),users:0};this.cache.set(key,entry);}const model=entry.model.clone(true);model.name=spec.name;model.userData.specification=spec;model.userData.metadata.id=id;entry.users++;this.leases.set(model,key);return model;}
 release(model){if(!this.leases.has(model))return false;this.cache.get(this.leases.get(model)).users--;this.leases.delete(model);model.removeFromParent();return true;}
 prune(){for(const [key,e]of this.cache)if(!e.users){e.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);}}
 dispose(){if(this.disposed)return false;if(this.leases.size)throw Error('Release buildings before disposal');this.prune();const textures=new Set;for(const m of Object.values(this.materials)){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();this.disposed=true;return true;}
}
