import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';

export const NAMES=Object.freeze({A:'Symmetrical Vault Tower',B:'Twin Vault Tower',C:'Asymmetric Atrium Tower'});
const VERSION='0.1.0', FLOOR=3.35, MODULE=2.4, EQUIPMENT_HEIGHT=1.65;
const minimum={A:38.4,B:48,C:36};

export function normalize(input={}){
  const archetype=input.archetype??'A', width=input.width??(archetype==='B'?57.6:48);
  const depth=input.depth??38.4, storeys=input.storeys??32, palette=input.palette??0;
  if(!Object.hasOwn(NAMES,archetype)||input.version&&input.version!==VERSION)throw Error('Unknown original vault version');
  if(!Number.isInteger(storeys)||storeys<20||storeys>40)throw Error('Expected 20–40 storeys');
  if(!Number.isInteger(palette)||palette<0||palette>2)throw Error('Unknown vault palette');
  if(![width,depth].every(v=>Number.isFinite(v)&&Math.abs(v/MODULE-Math.round(v/MODULE))<.000001)
    ||width<minimum[archetype]||width>76.8||depth<28.8||depth>57.6||width/depth<.83||width/depth>2.3
    ||storeys*FLOOR/Math.min(width,depth)>5)throw Error('Incompatible vault proportions');
  return {version:VERSION,archetype,width,depth,storeys,palette,floorHeight:FLOOR};
}
function chamfer(x,z,w,d,cut=2.3){
  const l=x-w/2,r=x+w/2,b=z-d/2,f=z+d/2;
  return [[l+cut,b],[r-cut,b],[r,b+cut],[r,f-cut],[r-cut,f],[l+cut,f],[l,f-cut],[l,b+cut]];
}
export function layout(input){
  const s=normalize(input),{width:w,depth:d,storeys:h,archetype}=s;
  const podiumFloors={A:2,B:3,C:4}[archetype];
  const front=d*.365, entranceX={A:0,B:-.05*w,C:-.18*w}[archetype];
  const podium=chamfer(0,(front-d*.48)/2,w*.98,front+d*.48,{A:2.25,B:3.2,C:3}[archetype]);
  const slabs=[];
  const add=(ring,start,end)=>slabs.push({ring,start:start*FLOOR,end:end*FLOOR});
  if(archetype==='A')add(podium,0,podiumFloors);
  else{
    add(podium,0,2);
    const upper=archetype==='B'?chamfer(-.012*w,-.065*d,.93*w,.80*d,2.7):chamfer(.038*w,-.057*d,.87*w,.77*d,3.2);
    add(upper,2,podiumFloors);
  }
  if(archetype==='A'){
    const base=[[-.36,-.39],[.36,-.39],[.43,-.32],[.43,.21],[.36,.29],[.18,.29],[.125,.14],[-.125,.14],[-.18,.29],[-.36,.29],[-.43,.21],[-.43,-.32]];
    const form=(scale,offset=0)=>base.map(([x,z],i)=>{
      // Hold the recess width so successive shoulders remain supported at the notch.
      const widthScale=i>=5&&i<=8?1:scale;
      return [x*w*widthScale,(z*scale+offset)*d];
    });
    add(form(1),podiumFloors,h-6);
    add(form(.88,-.022),h-6,h-3);
    add(form(.78,-.038),h-3,h);
  }else if(archetype==='B'){
    const joined=[[-.41,-.28],[-.13,-.28],[-.04,-.38],[.39,-.38],[.43,-.30],[.43,.19],[.34,.23],[.07,.23],[-.03,.30],[-.40,.30],[-.43,.24],[-.43,-.21]];
    add(joined.map(([x,z])=>[x*w,z*d]),podiumFloors,h-9);
    add(chamfer(-.205*w,.025*d,.34*w,.50*d,1.7),h-9,h-6);
    add(chamfer(.193*w,-.083*d,.35*w,.55*d,1.9),h-9,h);
  }else{
    add(chamfer(.10*w,-.04*d,.64*w,.69*d,2.1),podiumFloors,h-8);
    add(chamfer(.135*w,-.064*d,.55*w,.60*d,1.85),h-8,h-4);
    add(chamfer(.151*w,-.104*d,.45*w,.495*d,1.65),h-4,h);
  }
  const unit=(x,z,level)=>({x:x*w,z:z*d,y:level*FLOOR,width:Math.min(8,w*.17),depth:Math.min(4.8,d*.16),height:EQUIPMENT_HEIGHT});
  const equipment=archetype==='B'?[unit(-.205,.025,h-6),unit(.193,-.083,h)]:
    [archetype==='A'?unit(0,-.115,h):unit(.151,-.104,h)];
  return {groundRing:podium,slabs,volumes:[],equipment,
    entrance:{x:entranceX,z:front,width:7.5,doorWidth:6.2,height:3.25},roofTop:h*FLOOR+EQUIPMENT_HEIGHT};
}
export const definition=Object.freeze({
  id:'original-vaults',version:VERSION, family:'office',maximumLot:{width:79.6,depth:60.4},envelopeMargin:2.2,
  ratios:()=>[1,.96,.92,.86,.80,.72],
  normalize,layout,fit(input,{width,depth,setback=.3}){
    const modules=value=>Math.round(Math.floor((value-2.2-2*setback)/MODULE)*MODULE*10)/10;
    const w=modules(width),d=modules(depth);
    const storeys=input.auto?Math.min(input.storeys,Math.floor(Math.min(w,d)*5/FLOOR)):input.storeys;
    return normalize({...input,width:w,depth:d,storeys});
  }
});

function map(w,h,pixel){
  const bytes=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)bytes.set([...pixel(x,y),255],(y*w+x)*4);
  const t=new T.DataTexture(bytes,w,h);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
  t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;
  return t;
}
export function createMaterials(){
  const variation=(x,y)=>((Math.imul(x+27,73856093)^Math.imul(y+9,19349663))>>>0)%13-6;
  const ribbon=(clad,glass)=>map(256,256,(x,y)=>{
    const u=x%64,v=y%64;
    const color=v<31?clad:glass,n=variation(x>>6,y>>6)*.67+(u<2?(v<31?-15:23):0)+(v<3?-12:v<34&&v>=31?21:0);
    return color.map(c=>c+n);
  });
  const tile=map(128,128,(x,y)=>{
    const c=154+variation(x>>4,y>>4)*.73-(x%32<2||y%32<2?12:0);
    return [c+4,c+2,c+5];
  });
  const make=(name,color,roughness,texture=null)=>new T.MeshStandardMaterial({name:'Original vaults · '+name,color,roughness,map:texture});
  const colors=[[63,94,130],[59,112,99],[54,83,117]];
  const materials={
    trim:make('silver frames','#dce1e1',.62),
    stone:make('silver-grey plinth','#b0afb5',.83),
    deck:make('terrace paving','#dbd6da',.90,tile),
    mechanical:make('galvanized equipment','#a8adae',.76),
    vent:make('dark vents','#454d50',.84)
  };
  for(const [palette,tint] of colors.entries()){
    materials['ribbon'+palette]=make('ribbons '+palette,'#ffffff',.66,ribbon([187,187,191],tint));
    const color=new T.Color().setRGB(...tint.map(channel=>channel/255),T.SRGBColorSpace);
    materials['door'+palette]=make('entry glazing '+palette,color,.66);
  }
  return materials;
}

const point=([x,z],y)=>[x,y,z];
function facade(batch,section){
  const {ring,start,end}=section;
  let u=0;
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length],bays=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/2.4));
    const next=u+bays/4,v=(end-start)/FLOOR/4;
    batch.quad('ribbon0',[point(a,start),point(a,end),point(b,end),point(b,start)],[u,0,u,v,next,v,next,0]);
    batch.beam('trim',point(a,end-.035),point(b,end-.035),.105,.11);
    u=next;
  }
  const shape=new T.Shape(ring.map(([x,z])=>new T.Vector2(x,-z)));
  const geometry=new T.ExtrudeGeometry(shape,{depth:.02,bevelEnabled:false}),p=geometry.attributes.position,n=geometry.attributes.normal;
  for(let i=0;i<p.count;i+=3)if(n.getZ(i)>.5){
    const points=[0,1,2].map(j=>[p.getX(i+j),end,-p.getY(i+j)]);
    batch.triangle('deck',points);
  }
  geometry.dispose();
}
function entrance(batch,e){
  // Keep the standard doorway on the podium face with a narrow metal surround.
  const half=e.doorWidth/2;
  batch.box('door0',e.x,e.height/2,e.z+.015,e.doorWidth,e.height,.04);
  for(const x of [-half,-half/2,0,half/2,half])batch.box('trim',e.x+x,e.height/2,e.z+.043,.085,e.height,.055);
  batch.box('trim',e.x,e.height,e.z+.043,e.doorWidth+.09,.13,.095);
}
function roofEquipment(batch,{x,y,z,width,depth,height}){
  const part=batch.begin('roof mechanical equipment');
  batch.box('mechanical',x,y+.095,z,width,.19,depth);
  const mainX=x-width*.12;
  batch.box('mechanical',mainX,y+.78,z,width*.70,1.2,depth*.84);
  batch.box('trim',mainX,y+1.42,z,width*.72,.12,depth*.88);
  const face=z+depth*.422;
  for(let i=0;i<5;i++)batch.box('vent',mainX,y+.38+i*.18,face,width*.59,.067,.055);
  const fanRadius=Math.min(.68,depth*.16);
  for(const offset of [-.17,.17]){
    const fx=mainX+width*offset;
    for(let step=0;step<12;step++){
      const rim=i=>[fx+fanRadius*Math.sin(i*Math.PI/6),y+1.50,z+fanRadius*Math.cos(i*Math.PI/6)];
      batch.triangle('vent',[[fx,y+1.50,z],rim(step),rim(step+1)]);
    }
    for(const shift of [-.50,0,.50])batch.box('mechanical',fx+fanRadius*shift,y+height-.04,z,.045,.08,fanRadius*1.65);
  }
  batch.box('mechanical',x+width*.365,y+.56,z,width*.19,.74,depth*.58);
  batch.box('trim',x+width*.365,y+.95,z,width*.21,.10,depth*.61);
  batch.end(part);
}
export function buildVaultTower(input,materials){
  const s=normalize(input),plan=layout(s),batch=new ArchitectureBatch;
  for(const slab of plan.slabs)facade(batch,slab);
  entrance(batch,plan.entrance);
  for(const unit of plan.equipment)roofEquipment(batch,unit);
  const model=batch.finish(materials,NAMES[s.archetype]);
  const deck=model.children.find(m=>m.name==='deck').geometry;
  for(let i=0;i<deck.attributes.position.count;i++)deck.attributes.uv.setXY(i,deck.attributes.position.getX(i)/6,deck.attributes.position.getZ(i)/6);
  model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);
  return model;
}
export class VaultGenerator{
  constructor(){this.materials=createMaterials();this.cache=new Map();this.leases=new Map();}
  generate(input){
    const {palette,...shape}=normalize(input),key=JSON.stringify(shape);
    let entry=this.cache.get(key);
    if(!entry){entry={model:buildVaultTower(shape,this.materials),users:0};this.cache.set(key,entry);}
    const model=entry.model.clone(true);
    for(const mesh of model.children){
      if(mesh.name==='ribbon0')mesh.material=this.materials['ribbon'+palette];
      if(mesh.name==='door0')mesh.material=this.materials['door'+palette];
    }
    entry.users++;this.leases.set(model,key);return model;
  }
  release(model){const k=this.leases.get(model);if(k===undefined)return false;this.cache.get(k).users--;this.leases.delete(model);model.removeFromParent();return true;}
  prune(){for(const [k,e] of this.cache)if(!e.users){for(const m of e.model.children)m.geometry.dispose();this.cache.delete(k);}}
}
