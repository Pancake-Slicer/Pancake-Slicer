import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';

export const NAMES=Object.freeze({A:'Symmetrical Vault Tower',B:'Twin Vault Tower',C:'Asymmetric Atrium Tower'});
const VERSION='0.1.0', FLOOR=3.35, MODULE=2.4;
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
  const podiumFloors={A:2,B:3,C:4}[archetype],podiumY=podiumFloors*FLOOR;
  const front=d*.365, entranceX={A:0,B:-.05*w,C:-.18*w}[archetype];
  const entryWidth=w*{A:.34,B:.51,C:.36}[archetype],right=entranceX+entryWidth/2,left=entranceX-entryWidth/2;
  const podium=chamfer(0,(front-d*.48)/2,w*.98,front+d*.48,{A:2.25,B:3.2,C:3}[archetype]);
  const groundRing=[...podium.slice(0,5),[right,front],[right,d/2],[left,d/2],[left,front],...podium.slice(5)];
  const slabs=[],crowns=[];
  const add=(ring,start,end,style='blue')=>slabs.push({ring,start:start*FLOOR,end:end*FLOOR,style});
  const roof=(x,z,length,radius,rise,storey,axis='x')=>crowns.push({x,z,length,radius,rise,y:storey*FLOOR,axis});
  if(archetype==='A')add(podium,0,podiumFloors,'podium');
  else{
    add(podium,0,2,'podium');
    const upper=archetype==='B'?chamfer(-.012*w,-.065*d,.93*w,.80*d,2.7):chamfer(.038*w,-.057*d,.87*w,.77*d,3.2);
    add(upper,2,podiumFloors,'podium');
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
    roof(0,-.10*d,.61*w,.151*d,Math.min(7.2,d*.19),h);
  }else if(archetype==='B'){
    const joined=[[-.41,-.28],[-.13,-.28],[-.04,-.38],[.39,-.38],[.43,-.30],[.43,.19],[.34,.23],[.07,.23],[-.03,.30],[-.40,.30],[-.43,.24],[-.43,-.21]];
    add(joined.map(([x,z])=>[x*w,z*d]),podiumFloors,h-9);
    add(chamfer(-.205*w,.025*d,.34*w,.50*d,1.7),h-9,h-6,'teal');
    add(chamfer(.193*w,-.083*d,.35*w,.55*d,1.9),h-9,h);
    roof(-.205*w,.025*d,.425*d,.145*w,Math.min(5.7,w*.099),h-6,'z');
    roof(.193*w,-.083*d,.30*w,.229*d,Math.min(7.1,d*.18),h);
  }else{
    add(chamfer(.10*w,-.04*d,.64*w,.69*d,2.1),podiumFloors,h-8);
    add(chamfer(.135*w,-.064*d,.55*w,.60*d,1.85),h-8,h-4,'teal');
    add(chamfer(.151*w,-.104*d,.45*w,.495*d,1.65),h-4,h);
    roof(.23*w,-.107*d,.422*d,.115*w,Math.min(6.9,w*.15),h,'z');
  }
  const atrium={x:entranceX,z:d*.404,length:entryWidth,radius:d*.096,rise:{A:2.6,B:3.9,C:5.1}[archetype],
    y:{A:3.9,B:5.2,C:7.3}[archetype],axis:'x'};
  return {groundRing,slabs,crowns,atrium,front,podiumY,volumes:[],
    entrance:{x:entranceX,z:d/2,width:7.5,doorWidth:6.2,height:3.25},
    roofTop:Math.max(...crowns.map(c=>c.y+c.rise+.15))};
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
  const jade=map(256,256,(x,y)=>{
    const v=y/255,n=variation(x>>3,y>>3)*.55+3*Math.sin(x/21+v*8);
    const reflection=64*Math.exp(-((v-.24)**4)/.0012)+29*Math.exp(-((v-.67)**4)/.0013);
    const trace=5*Math.exp(-((Math.hypot(x%64-32,y%64-32)-18)**2)/30);
    return [62+reflection*1.29+n-trace,126+reflection*1.34+n-trace,111+reflection*1.28+n-trace];
  });
  const tile=map(128,128,(x,y)=>{
    const c=154+variation(x>>4,y>>4)*.73-(x%32<2||y%32<2?12:0);
    return [c+4,c+2,c+5];
  });
  const make=(name,color,roughness,texture=null)=>new T.MeshStandardMaterial({name:'Original vaults · '+name,color,roughness,map:texture});
  return {
    blue0:make('marine ribbons','#ffffff',.66,ribbon([187,187,191],[63,94,130])),
    blue1:make('slate ribbons','#ffffff',.66,ribbon([183,188,193],[66,100,128])),
    blue2:make('midnight ribbons','#ffffff',.66,ribbon([186,183,189],[54,83,117])),
    teal:make('muted teal ribbons','#ffffff',.68,ribbon([176,181,185],[59,112,117])),
    podium:make('podium bands','#ffffff',.74,ribbon([174,174,179],[61,95,115])),
    jade:make('opaque jade glass','#ffffff',.62,jade),
    trim:make('silver frames','#dce1e1',.62),
    stone:make('silver-grey plinth','#b0afb5',.83),
    deck:make('terrace paving','#dbd6da',.90,tile),
    end:make('solid arch framing','#707b8b',.77),
    door:make('dark entry glazing','#416273',.57)
  };
}

const point=([x,z],y)=>[x,y,z];
function facade(batch,section,style){
  const {ring,start,end}=section;
  let u=0;
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length],bays=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/2.4));
    const next=u+bays/4,v=(end-start)/FLOOR/4;
    batch.quad(style,[point(a,start),point(a,end),point(b,end),point(b,start)],[u,0,u,v,next,v,next,0]);
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
function buildVault(batch,v,label){
  const {length,radius,rise,axis}=v;
  const transform=(a,y,c)=>axis==='x'?[v.x+a,y,v.z+c]:[v.x-c,y,v.z+a];
  const p=(x,t,offset=0)=>transform(x,v.y+(rise+offset)*Math.sin(t),(radius+offset)*Math.cos(t));
  const half=length/2,bays=Math.max(4,Math.round(length/3.7)),part=batch.begin(label);
  for(let i=0;i<64;i++){
    const a=Math.PI*i/64,b=Math.PI*(i+1)/64;
    batch.quad('jade',[p(-half,a),p(half,a),p(half,b),p(-half,b)],[0,i/64,bays/4,i/64,bays/4,(i+1)/64,0,(i+1)/64]);
  }
  batch.end(part);
  for(let bay=0;bay<=bays;bay++){
    const x=-half+length*bay/bays,edge=bay===0||bay===bays,halfRib=edge?.19:.075;
    for(let i=0;i<32;i++){
      const a=Math.PI*i/32,b=Math.PI*(i+1)/32,lift=edge?.13:.06;
      batch.quad(edge?'end':'trim',[p(x-halfRib,a,lift),p(x+halfRib,a,lift),p(x+halfRib,b,lift),p(x-halfRib,b,lift)]);
    }
  }
  for(let i=0;i<=6;i++){
    const a=Math.PI*i/6,delta=.065/Math.hypot(radius*Math.sin(a),rise*Math.cos(a));
    batch.quad('trim',[p(-half,a-delta,.077),p(half,a-delta,.077),p(half,a+delta,.077),p(-half,a+delta,.077)]);
  }
  for(const sign of [-1,1]){
    const x=sign*half,middle=transform(x,v.y,0);
    for(let i=0;i<32;i++){
      const a=p(x,Math.PI*i/32),b=p(x,Math.PI*(i+1)/32);
      batch.triangle('end',sign>0?[middle,b,a]:[middle,a,b]);
    }
    if(label!=='entry vault')for(let i=0;i<18;i++){
      const a=.40+i*(Math.PI-.80)/18,b=.40+(i+1)*(Math.PI-.80)/18;
      const inset=(t,lift)=>transform(x+sign*.025,v.y+(rise*.71+lift)*Math.sin(t),(radius*.71+lift)*Math.cos(t));
      const strip=[inset(a,0),inset(b,0),inset(b,.15),inset(a,.15)];
      batch.quad('trim',sign<0?strip:strip.reverse());
    }
  }
}
function entrance(batch,plan){
  const v=plan.atrium,e=plan.entrance,half=v.length/2,door=3.1;
  const glass=(a,b,lo,hi)=>batch.quad('jade',[[a,lo,e.z],[b,lo,e.z],[b,hi,e.z],[a,hi,e.z]],[0,.01,(b-a)/14,.01,(b-a)/14,.11,0,.11]);
  glass(v.x-half,e.x-door,0,v.y);glass(e.x+door,v.x+half,0,v.y);
  glass(e.x-door,e.x+door,e.height,v.y);
  const bays=Math.round(v.length/2.4);
  for(let i=0;i<=bays;i++){
    const x=v.x-half+i*v.length/bays,base=Math.abs(x-e.x)<door?e.height:0;
    batch.box('trim',x,(v.y+base)/2,e.z+.018,.09,v.y-base,.09);
  }
  for(const x of [v.x-half,v.x+half])batch.box('end',x,v.y/2,(plan.front+e.z)/2,.18,v.y,e.z-plan.front);
  for(const x of [-2.31,-.77,.77,2.31]){
    batch.box('door',e.x+x,e.height/2,e.z-.04,1.48,e.height,.07);
    batch.box('trim',e.x+x-.77,e.height/2,e.z,.08,e.height,.11);
  }
  for(const x of [-door,door])batch.box('trim',e.x+x,e.height/2,e.z,.14,e.height,.16);
  batch.box('trim',e.x,e.height,e.z,6.32,.15,.19);
  if(v.y>5)batch.box('trim',e.x,4.46,e.z,v.length,.13,.14);
}
export function buildVaultTower(input,materials){
  const s=normalize(input),plan=layout(s),batch=new ArchitectureBatch;
  for(const slab of plan.slabs)facade(batch,slab,slab.style==='blue'?'blue0':slab.style);
  for(const [i,v] of plan.crowns.entries())buildVault(batch,v,'crown '+i);
  buildVault(batch,plan.atrium,'entry vault');
  entrance(batch,plan);
  const model=batch.finish(materials,NAMES[s.archetype]);
  const deck=model.children.find(m=>m.name==='deck').geometry;
  for(let i=0;i<deck.attributes.position.count;i++)deck.attributes.uv.setXY(i,deck.attributes.position.getX(i)/6,deck.attributes.position.getZ(i)/6);
  const glass=model.children.find(m=>m.name==='jade').geometry,n=glass.attributes.normal,p=glass.attributes.position;
  const direction=new T.Vector3();
  for(const [label,v] of [...plan.crowns.map((v,i)=>['crown '+i,v]),['entry vault',plan.atrium]]){
    const {start,end}=model.userData.partRanges.find(r=>r.label===label&&r.material==='jade');
    for(let i=start;i<end;i++){
      const y=(p.getY(i)-v.y)/v.rise**2,c=(v.axis==='x'?p.getZ(i)-v.z:v.x-p.getX(i))/v.radius**2;
      direction.set(v.axis==='x'?0:-c,y,v.axis==='x'?c:0).normalize();
      n.setXYZ(i,direction.x,direction.y,direction.z);
    }
  }
  n.needsUpdate=true;
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
    const glass=model.children.find(m=>m.name==='blue0');glass.material=this.materials['blue'+palette];
    entry.users++;this.leases.set(model,key);return model;
  }
  release(model){const k=this.leases.get(model);if(k===undefined)return false;this.cache.get(k).users--;this.leases.delete(model);model.removeFromParent();return true;}
  prune(){for(const [k,e] of this.cache)if(!e.users){for(const m of e.model.children)m.geometry.dispose();this.cache.delete(k);}}
}
