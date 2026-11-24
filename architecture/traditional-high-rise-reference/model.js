import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';

const roofY=94.7, baseTop=8.55, shaftTop=90.45;
export const plan=Object.freeze({
  levels:24, roofY, baseTop, shaftTop, frontBays:9,
  perimeter:[[-26,26],[26,26],[26,-17.5],[14.6,-17.5],[14.6,8],[-3.5,8],[-3.5,-23],[-14.5,-23],[-14.5,-27],[-26,-27]],
  bayCounts:[9,12,3,6,4,8,2,1,2,12],
  roofSlabs:[[-26,26,8,26],[-26,-3.5,-23,8],[-26,-14.5,-27,-23],[14.6,26,-17.5,8]]
});

const noise=(x,y)=>((Math.imul(x+821,73856093)^Math.imul(y+373,19349663))>>>0)%127/126;
function texture(width,height,pixel){
  const bytes=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const pixelIndex=(y*width+x)*4,rgb=pixel(x,y);
    for(let c=0;c<3;c++)bytes[pixelIndex+c]=Math.max(0,Math.min(255,Math.round(rgb[c])));
    bytes[pixelIndex+3]=255;
  }
  const map=new T.DataTexture(bytes,width,height);
  map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
  map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;
  map.generateMipmaps=true;map.anisotropy=8;map.needsUpdate=true;
  return map;
}
export function createMaterials(){
  const glass=texture(512,64,(x,y)=>{
    const u=x%64, variant=x>>6, pane=Math.floor(u/21);
    const reflection=variant%3===pane&&y>16&&y<54?9*Math.sin((y-16)*Math.PI/38):0;
    const brightness=9*(noise(variant,pane)-.3)+5*(noise(x>>3,y>>3)-.5)+(y/63)*14+reflection;
    if(u<2||u>61||u===21||u===22||u===42||u===43||y<3||y>60)return [134,142,137];
    if(y===46||y===47)return [105,117,117];
    if(y<10)return [52,68,69];
    const colors=[[63,87,109],[74,98,116],[62,86,96],[92,98,118],[50,73,96],[65,98,101],[88,108,108],[69,85,105]];
    return colors[variant].map(c=>c+brightness);
  });
  const gravel=texture(256,256,(x,y)=>{
    const n=(noise(x,y)-.5)*68+(noise(x>>1,y>>1)-.5)*19+
      4*Math.sin(x/17)*Math.cos(y/31);
    return [133+n,124+n,123+n];
  });
  const masonry=texture(128,128,(x,y)=>{
    const n=(noise(x,y)-.5)*11+3*(noise(x>>3,y>>4)-.5);
    const joint=y%32<1?-7:0;
    return [183+n+joint,161+n+joint,141+n+joint];
  });
  const paving=texture(128,128,(x,y)=>{
    const n=(noise(x>>3,y>>3)-.5)*13+(x%32<2||y%32<2?-20:0);
    return [175+n,168+n,157+n];
  });
  const mat=(name,color,roughness,map=null)=>new T.MeshStandardMaterial({name,color,roughness,map});
  return {
    stone:mat('Warm limestone','#ffffff',.88,masonry),
    trim:mat('Cut limestone cornices','#c7b199',.81),
    serviceStone:mat('Weathered side and lightwell limestone','#aeb1bf',.88,masonry),
    serviceTrim:mat('Weathered side and lightwell cut stone','#938c97',.83),
    recess:mat('Recessed masonry spandrels','#7b726b',.89),
    glass:mat('Blue-green window atlas','#ffffff',.63,glass),
    storefront:mat('Recessed storefront glazing','#456760',.66),
    gravel:mat('Weathered roof gravel','#ffffff',.96,gravel),
    flashing:mat('Patinated roof flashing','#657e78',.75),
    steel:mat('Weathered galvanized steel','#898987',.78),
    dark:mat('Vents and shadowed equipment','#4a4748',.91),
    tank:mat('Painted rooftop water tank','#536461',.75),
    pavement:mat('Pavement','#ffffff',.97,paving),
    asphalt:mat('Asphalt','#3c3934',.97),
    paint:mat('Centerline','#a79861',.98)
  };
}
function elevation(batch,a,b,count,side){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
  const bay=length/count,pier=side===0?.68:.55,opening=(bay-pier)/2;
  const stone=side===0?'stone':'serviceStone',trim=side===0?'trim':'serviceTrim';
  const pos=(u,y,n)=>[a[0]+dx*u-dz*n,y,a[1]+dz*u+dx*n];
  const box=(material,u,y,n,w,h,d)=>{
    const [x,_,z]=pos(u,y,n);
    batch.box(material,x,y,z,dx?w:d,h,dx?d:w);
  };
  const band=(material,y,offset,depth,height)=>batch.beam(material,pos(-depth*.34,y,offset),pos(length+depth*.34,y,offset),depth,height);
  const panel=(material,lo,hi,y0,y1,setback,variation=0)=>{
    const u=(64*variation+1)/512,v=(64*variation+63)/512;
    batch.quad(material,[pos(lo,y0,setback),pos(hi,y0,setback),pos(hi,y1,setback),pos(lo,y1,setback)],[u,.01,v,.01,v,.99,u,.99]);
  };
  panel('recess',0,length,0,roofY,-.52);
  for(const [y,d,h] of [[.24,.72,.48],[4.73,.92,.31],[5.03,.71,.21],[8.0,.9,.34],[8.38,1.12,.34],
    [89.87,.92,.25],[90.21,1.12,.36],[94.52,1.12,.26],[94.84,1.34,.26]]){
    band(trim,y,.08,d,h);
  }
  for(let i=0;i<=count;i++){
    const u=i*bay;
    box(stone,u,(baseTop+shaftTop)/2,-.01,pier,shaftTop-baseTop,.60);
    box(stone,u,4.12,.01,.72,8.20,.77);
    box(trim,u,4.42,.08,.79,.26,.76);
    box(stone,u,92.35,-.03,.67,4.16,.62);
    box(trim,u,90.61,.045,.73,.34,.74);
  }
  for(let i=0;i<count;i++){
    const u=(i+.5)*bay,lo=u-opening,hi=u+opening;
    panel('storefront',lo-.055,hi+.055,.48,4.56,-.43);
    panel('glass',lo-.055,hi+.055,5.16,7.88,-.42,(side+i+4)%8);
    panel('glass',lo-.045,hi+.045,90.69,94.39,-.43,(side+i+2)%8);
    for(const off of [-.33,0,.33])box('flashing',u+off*(hi-lo),2.48,-.345,.105,3.98,.10);
    box('flashing',u,3.49,-.345,hi-lo,.13,.10);
    box('recess',u,.59,-.26,hi-lo,.37,.21);
    if(side===0&&i===4){
      for(const off of [-.89,.89]){
        box('flashing',u+off,1.38,-.23,.082,2.71,.10);
        box('steel',u+off*.35,1.48,-.19,.055,.49,.052);
      }
      box('flashing',u,2.75,-.24,1.84,.12,.10);
    }
    for(let floor=0;floor<21;floor++){
      const y=baseTop+floor*3.9,variant=(i*13+floor*5+side*11+Math.floor(noise(i+side,floor)*5))%8;
      panel('glass',lo-.07,hi+.07,y+.51,y+3.91,-.42,variant);
      panel('recess',lo-.08,hi+.08,y,y+.55,-.185);
      box(trim,u,y+.47,-.16,hi-lo+.03,.13,.40);
    }
    for(const y of [8.18,90.0])for(let detail=0;detail<5;detail++)
      box(trim,lo+(hi-lo)*(detail+.5)/5,y,.44,.20,.19,.24);
  }
  band('stone',95.18,.025,.40,.81);
  band('trim',95.61,.03,.59,.17);
  band('flashing',95.72,.03,.48,.09);
}
function roofRect(batch,material,x0,x1,z0,z1,y,tile){
  batch.quad(material,[[x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0]],
    [x0/tile,z0/tile,x0/tile,z1/tile,x1/tile,z1/tile,x1/tile,z0/tile]);
}
function cylinder(batch,key,x,z,bottom,top,r0,r1){
  for(let i=0;i<24;i++){
    const p=(j,y,r)=>[x+r*Math.cos(j*Math.PI/12),y,z+r*Math.sin(j*Math.PI/12)];
    batch.quad(key,[p(i+1,bottom,r0),p(i,bottom,r0),p(i,top,r1),p(i+1,top,r1)]);
    if(r1)batch.triangle(key,[[x,top,z],p(i+1,top,r1),p(i,top,r1)]);
  }
}
function rooftop(batch){
  const top=roofY;
  const box=(key,x,z,bottom,w,h,d)=>batch.box(key,x,top+bottom+h/2,z,w,h,d);
  const skylight=(x,z,w,d,turn)=>{
    const s=turn?[d,w]:[w,d];
    box('trim',x,z,0,s[0]+.34,.47,s[1]+.34);
    box('steel',x,z,.47,s[0]+.11,.24,s[1]+.11);
    for(const side of [-1,1]){
      const p=(u,v,y)=>turn?[x+v,top+y,z-u]:[x+u,top+y,z+v];
      const face=[p(-w/2,side*d/2,.71),p(w/2,side*d/2,.71),p(w/2,0,1.03),p(-w/2,0,1.03)];
      batch.quad('storefront',side>0?face:face.reverse());
    }
    const rib=(u,v,y)=>turn?[x+v,top+y,z-u]:[x+u,top+y,z+v];
    batch.beam('steel',rib(-w/2,0,1.07),rib(w/2,0,1.07),.09,.10);
    for(const u of [-w/2,0,w/2])for(const side of [-1,1])
      batch.beam('steel',rib(u,0,1.07),rib(u,side*d/2,.73),.08,.09);
  };
  for(const row of [[-17,19,2.4,2.8,true],[-7,20,3.9,2.0,false],[.1,20,3.7,2.0,false],
    [-16,3.3,3.4,2.05,true],[-15,-9,3.4,2.1,true]])skylight(...row);
  box('recess',-9.0,-4.4,0,5.0,2.2,4.7);
  box('steel',-9.0,-4.4,2.2,5.35,.27,5.0);
  box('dark',-9.0,-1.99,.32,1.05,1.55,.13);
  for(const [x,z,w,d] of [[-21.0,-19,2.75,3.7],[-18.5,-22.8,2.9,2.45],[-7.7,-18.4,3.5,2.9]]){
    box('recess',x,z,0,w+.38,.55,d+.37);
    box('steel',x,z,.55,w,1.18,d);
    box('dark',x,z,1.70,w*.75,.19,d*.63);
    for(let i=0;i<3;i++)box('steel',x,z+(i-1)*d*.18,1.88,w*.76,.09,.11);
  }
  for(const x of [-8.5,-7.65,-6.8]){
    batch.beam('steel',[x,top+.26,-15],[x,top+1.42,-17.0],.33,.32);
    batch.beam('steel',[x,top+.26,-13.4],[x,top+.26,-15],.33,.32);
  }
  for(const [x,z,r,h] of [[-16,-22,.71,1.00],[-12.5,-20,.82,.82],[21.9,23,.33,.42],
    [23.2,22.9,.36,.48],[7,9,.32,1.0],[9.3,9,.27,1.14],[23.0,-14.7,.25,2.3],[24.1,-14.4,.23,2.67]]){
    cylinder(batch,'steel',x,z,top,top+h,r,r);
    cylinder(batch,'trim',x,z,top+h,top+h+.17,r*1.18,r*1.13);
  }
  const tx=19.3,tz=-12.4;
  box('recess',tx,tz,0,5.8,.62,5.7);
  box('steel',tx,tz,.62,5.15,.54,5.08);
  for(const dx of [-1.58,1.58])for(const dz of [-1.58,1.58])
    box('dark',tx+dx,tz+dz,1.15,.20,2.40,.20);
  for(const off of [-1.58,1.58]){
    batch.beam('dark',[tx-1.58,top+1.44,tz+off],[tx+1.58,top+3.27,tz+off],.16,.14);
    batch.beam('dark',[tx+off,top+1.44,tz-1.58],[tx+off,top+3.27,tz+1.58],.16,.14);
  }
  cylinder(batch,'tank',tx,tz,top+3.20,top+5.87,1.97,1.96);
  for(const y of [3.41,3.99,4.59,5.18,5.77])cylinder(batch,'flashing',tx,tz,top+y,top+y+.095,2.025,2.025);
  cylinder(batch,'steel',tx,tz,top+5.84,top+6.13,2.12,1.96);
  cylinder(batch,'steel',tx,tz,top+6.13,top+6.59,1.96,1.12);
  cylinder(batch,'steel',tx,tz,top+6.59,top+6.68,1.12,.12);
  box('trim',-23.5,22.5,0,.57,.49,.57);
  cylinder(batch,'steel',-23.5,22.5,top+.49,top+15.4,.088,.069);
}
export function buildStudy(materials=createMaterials()){
  const batch=new ArchitectureBatch;
  for(const [i,a] of plan.perimeter.entries())elevation(batch,a,plan.perimeter[(i+1)%plan.perimeter.length],plan.bayCounts[i],i);
  for(const [x0,x1,z0,z1] of plan.roofSlabs)roofRect(batch,'gravel',x0,x1,z0,z1,roofY,8);
  rooftop(batch);
  const model=batch.finish(materials,'Traditional Commercial High-Rise · fixed benchmark');
  model.userData={...model.userData,reviewOnly:true,levels:plan.levels,
    triangles:model.children.reduce((n,m)=>n+m.geometry.index.count/3,0)};
  return model;
}
export function buildSite(materials){
  const batch=new ArchitectureBatch;
  roofRect(batch,'pavement',-29.4,29.4,-29.8,29.8,-.018,9.6);
  batch.box('asphalt',0,-.16,36.3,62,.18,8.1);
  for(const z of [36.17,36.48])batch.box('paint',0,-.066,z,61.8,.008,.075);
  return batch.finish(materials,'Benchmark street and paving');
}
