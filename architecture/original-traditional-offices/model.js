import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';

const VERSION='0.1.0', FLOOR=3.65;
const rect=(left,right,back,front)=>[[left,front],[right,front],[right,back],[left,back]];
const insetCorners=(x,z,c)=>[[-x+c,z],[x-c,z],[x-c,z-c],[x,z-c],[x,-z+c],[x-c,-z+c],
  [x-c,-z],[-x+c,-z],[-x+c,-z+c],[-x,-z+c],[-x,z-c],[-x+c,z-c]];
const courtyard=[[-24,18],[-9,18],[-9,12],[9,12],[9,18],[24,18],[24,-18],[9,-18],[9,-12],[-9,-12],[-9,-18],[-24,-18]];
const exchange=[[-21,18],[21,18],[21,1],[4,1],[4,-18],[-21,-18]];
const heritage=insetCorners(18.5,16.5,2.25);
const entrance=(x,z,width,height,rise=0)=>({x,z,width,height,rise});
const schemes={
  A:{name:'Grand Courtyard Tower',width:48,depth:36,base:[4.6,4.6],
    entries:[entrance(0,12,9.8,7.45)],groundRing:courtyard,
    bands:[[courtyard,20],[courtyard,2]],bay:4.35},
  B:{name:'Metropolitan Exchange',width:42,depth:36,base:[4.65,4.05],
    entries:[entrance(-8,18,5.4,4.2),entrance(11,18,4.9,3.78,.42)],groundRing:exchange,
    bands:[[exchange,13],[rect(-20.1,2.85,-17,16.65),5],[rect(-18.5,-.3,-15.25,14.4),3]],bay:5.35},
  C:{name:'Heritage Commerce Tower',width:37,depth:33,base:[4.55,3.75,3.65],
    entries:[entrance(0,16.5,6.4,6.4)],groundRing:heritage,
    bands:[[insetCorners(16.1,14.4,1.45),17],[rect(-12.4,12.4,-11.1,11.1),4]],bay:3.6}
};
const steppedHeritage={
  ...schemes.C,width:46,depth:40,
  groundRing:insetCorners(23,20,2.45),entries:[entrance(0,20,6.4,6.4)],
  bands:[[insetCorners(20.5,17.8,1.7),17],[rect(-18,18,-15.2,15.2),4]]
};
const heritageBlock=rect(-23,23,-20,20);
const fullHeightHeritage={...steppedHeritage,groundRing:heritageBlock,bands:[[heritageBlock,21]]};
const waterTanks={A:[15,-13.2],B:[-6.3,6.4],C:[12.2,-8.6]};
const WATER_TANK_HEIGHT=6.68;
const heritageRevisions={2:steppedHeritage,3:fullHeightHeritage};
const scheme=({archetype,revision})=>archetype==='C'?(heritageRevisions[revision]??schemes.C):schemes[archetype];
const margin=spec=>spec.revision>=2?3.5:2.35;
export const NAMES=Object.freeze(Object.fromEntries(Object.entries(schemes).map(([key,v])=>[key,v.name])));
export function normalize(input={}){
  const archetype=input.archetype??'A',revision=input.revision??1;
  if(!Object.hasOwn(schemes,archetype)||(input.version&&input.version!==VERSION)||![1,2,3].includes(revision)||(revision===3&&archetype!=='C'))
    throw Error('Unknown traditional Office benchmark');
  const s=scheme({archetype,revision}),storeys=s.base.length+s.bands.reduce((n,[,floors])=>n+floors,0);
  return {archetype,version:VERSION,width:s.width,depth:s.depth,storeys,floorHeight:FLOOR,...(revision>=2?{revision}:{})};
}
export function layout(input){
  const spec=normalize(input),s=scheme(spec);
  const baseTop=s.base.reduce((n,h)=>n+h,0);
  let y=baseTop;
  const tiers=s.bands.map(([ring,floors])=>{
    const start=y;
    y+=floors*FLOOR;
    return {ring,floors,start,end:y};
  });
  const {archetype,revision}=spec;
  const roofTop=y+(revision>=2?WATER_TANK_HEIGHT:{A:3.35,B:2.96,C:4.55}[archetype]);
  return {groundRing:s.groundRing,entries:s.entries,entrance:s.entries[0],baseTop,tiers,roofTop};
}
export const definition=Object.freeze({
  id:'original-traditional-offices',version:VERSION,family:'office',
  maximumLot:{width:80,depth:68},envelopeMargin:2.35,ratios:()=>[1],
  normalize,layout,
  envelope(spec){
    const clearance=margin(spec);
    const w=(spec.width+clearance)/2,d=(spec.depth+clearance)/2;
    return [[-w,-d],[w,-d],[w,d],[-w,d]];
  },
  fit(input,{width,depth,setback=.3}){
    const s=normalize(input);
    const clearance=margin(s)+2*setback;
    if(width<s.width+clearance||depth<s.depth+clearance)throw Error('Too small for this fixed Office design');
    return s;
  }
});

const noise=(x,y)=>((Math.imul(x+197,73856093)^Math.imul(y+67,19349663))>>>0)%97/96;
function texture(w,h,pixel){
  const bytes=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)bytes.set([...pixel(x,y).map(v=>Math.min(255,Math.max(0,Math.round(v)))),255],(y*w+x)*4);
  const map=new T.DataTexture(bytes,w,h);
  map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
  map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.anisotropy=8;map.needsUpdate=true;
  return map;
}
function makeMaterials(){
  const stone=texture(128,128,(x,y)=>{
    const n=(noise(x,y)-.5)*10+(noise(x>>3,y>>2)-.5)*7-(y%32<1?9:0);
    return [209+n,200+n,187+n];
  });
  const glass=texture(512,64,(x,y)=>{
    const u=x%64,pane=Math.floor(u/21),variant=x>>6;
    if(u<2||u>61||u===21||u===22||u===42||u===43||y<2||y>62||y===47)return [107,123,117];
    const n=12*(noise(variant,pane)-.45)+4*(noise(x>>2,y>>2)-.5)+.21*y+(variant%3===pane&&y<39?9:0);
    return [[57,88,101],[67,98,104],[80,103,111],[49,77,90],[79,107,104],[72,88,104],[63,98,103],[84,101,103]][variant].map(c=>c+n);
  });
  const gravel=texture(128,128,(x,y)=>{
    const n=(noise(x,y)-.5)*49+(noise(x>>2,y>>2)-.5)*16;return [118+n,115+n,108+n];
  });
  const mat=(name,color,roughness,map=null)=>new T.MeshStandardMaterial({name,color,roughness,map});
  return {
    stone:mat('Courtyard warm limestone','#f4e6d0',.86,stone),
    sand:mat('Heritage muted sandstone','#d6a981',.88,stone),
    ash:mat('Exchange grey masonry','#bfc4c5',.90,stone),
    trim:mat('Cut limestone moulding','#d6c5ae',.78),
    bronze:mat('Patinated bronze frames','#5a6255',.74),
    shadow:mat('Shadowed masonry spandrel','#777068',.89),
    shadowGrey:mat('Slate grey spandrel','#64717a',.82),
    glass:mat('Recessed blue-green glazing','#f3f9fc',.64,glass),
    roof:mat('Weathered gravel roofing','#e5e2e0',.95,gravel),
    tank:mat('Painted rooftop water tank','#536461',.75),
    steel:mat('Galvanized rooftop plant','#a7aaa6',.78),
    vent:mat('Dark fan and louvre grilles','#444b4d',.9)
  };
}
const styles={
  A:{base:'stone',pier:'stone',spandrel:'shadow',pierWidth:.70,pierDepth:.77,glassSetback:-.43,sillHeight:.17,shelf:1.02},
  B:{base:'ash',pier:'ash',spandrel:'shadowGrey',pierWidth:.40,pierDepth:.58,glassSetback:-.43,sillHeight:.39,shelf:.76},
  C:{base:'sand',pier:'trim',spandrel:'shadow',pierWidth:.70,pierDepth:.76,glassSetback:-.55,sillHeight:.14,shelf:1.05}
};
const heavierMasonry={
  A:{pierWidth:.94,pierDepth:.86,sillHeight:.26,bandHeight:.91},
  B:{pierWidth:.64,pierDepth:.66,sillHeight:.48,bandHeight:1.14},
  C:{pierWidth:1.02,pierDepth:.86,sillHeight:.25,bandHeight:.95}
};
function edge(batch,ring,index){
  const [x,z]=ring[index], [nextX,nextZ]=ring[(index+1)%ring.length];
  const length=Math.hypot(nextX-x,nextZ-z), dx=(nextX-x)/length,dz=(nextZ-z)/length;
  const point=(u,y,n)=>[x+dx*u-dz*n,y,z+dz*u+dx*n];
  const box=(material,u,y,n,w,h,d)=>{
    const [wx,wy,wz]=point(u,y,n);
    batch.box(material,wx,wy,wz,dx?w:d,h,dx?d:w);
  };
  const line=(material,lo,hi,y,n,depth,height)=>batch.beam(material,point(lo,y,n),point(hi,y,n),depth,height);
  const panel=(material,lo,hi,y0,y1,n,variant=0)=>{
    const u=(64*variant+1)/512,v=(64*variant+63)/512;
    batch.quad(material,[point(lo,y0,n),point(hi,y0,n),point(hi,y1,n),point(lo,y1,n)],[u,.015,v,.015,v,.985,u,.985]);
  };
  return {length,x,z,dx,box,line,panel};
}
function cornice(e,y,shelf,tall=false){
  const {length,line}=e;
  line('trim',-.28,length+.28,y-.41,.16,.65,.19);
  line('trim',-shelf*.55,length+shelf*.55,y-.21,.19,shelf+.20,.22);
  line('trim',-shelf*.60,length+shelf*.60,y,.25,shelf+.19,.19);
  if(tall)line('bronze',-shelf*.50,length+shelf*.50,y+.11,.29,shelf+.06,.072);
}
// The fixed reconstruction's limestone section, mitered around each perimeter.
function projectingCornice(batch,perimeter,height,scale=1){
  const normals=perimeter.map(([x,z],i)=>{
    const [nextX,nextZ]=perimeter[(i+1)%perimeter.length],length=Math.hypot(nextX-x,nextZ-z);
    return [(z-nextZ)/length,(nextX-x)/length];
  });
  const profile=[[-.32,-.28],[-.32,.43],[-.15,.62],[-.07,.83],[-.07,1.13],
    [.06,1.13],[.06,1.63],[.28,1.63],[.37,1.57],[.42,1.49],[.42,-.22]];
  const points=profile.map(([y,projection])=>perimeter.map(([x,z],i)=>{
    const previous=normals[(i+normals.length-1)%normals.length],next=normals[i],d=projection*scale;
    return [x+(previous[0]+next[0])*d,height+y,z+(previous[1]+next[1])*d];
  }));
  const part=batch.begin('projecting cornice');
  for(let step=1;step<points.length;step++){
    const lower=points[step-1],upper=points[step];
    for(let i=0;i<perimeter.length;i++){
      const j=(i+1)%perimeter.length;
      batch.quad(step===8?'bronze':'trim',[lower[i],lower[j],upper[j],upper[i]]);
    }
  }
  batch.end(part);
}
function storefront(e,y0,y1,lo,hi,stone,group,revised){
  const width=hi-lo;
  if(width<.65)return;
  const count=Math.max(1,Math.round(width/group)),bay=width/count;
  for(let i=0;i<count;i++){
    const u=lo+bay*i,space=bay>.9?.24:.08;
    const plinth=revised?.48:.38;
    e.panel('glass',u+space,u+bay-space,y0+plinth,y1-(revised?.52:.42),-.47,(i+count)%8);
    if(i>0)e.box(stone,u,(y0+y1)/2,-.04,revised?.60:.47,y1-y0,.68);
    if(bay>2.2)e.box('bronze',u+bay/2,(y0+y1)/2,-.34,.087,y1-y0-.8,.125);
    if(y0===0){
      e.box(stone,u+bay/2,plinth/2,-.24,bay-2*space,plinth,.57);
      e.box('bronze',u+bay/2,y1-.95,-.34,bay-2*space,.13,.12);
    }
  }
}
function portal(e,u,entry,type,base){
  const {width,height,rise}=entry,lo=u-width/2,hi=u+width/2,top=rise+height;
  const {box,panel}=e;
  panel('glass',lo,hi,rise,top,-.65,type==='A'?2:5);
  box('trim',u,rise+.055,-.34,width+.14,.11,.84);
  for(const pos of [lo,hi]){
    const side=pos===lo?-1:1;
    box(base,pos+side*.23,top/2,.05,.56,top,.98);
    box('trim',pos+side*.47,top/2,.14,.22,top,.95);
    box('trim',pos+side*.34,top-.21,.20,.79,.30,1.04);
  }
  box('trim',u,top+.20,.05,width+1.25,.42,type==='A'?1.37:1.10);
  if(type==='A'){
    box('trim',u,top+.55,.09,width+1.50,.25,1.37);
    box('stone',u,top+.81,.03,width+1.15,.29,1.15);
    for(let i=-5;i<=5;i++)box('trim',u+i*.89,top+.37,.73,.18,.18,.18);
    for(const sign of [-1,1]){
      const x=u+sign*(width/2+.31);
      box(base,x,.27,.13,.84,.54,1.05);
      box('trim',x,1.0,.19,.69,.20,.94);
      for(const d of [-.17,0,.17])box('trim',x+d,top*.51,.55,.075,top-1.57,.10);
      box('trim',x,top-.53,.29,.84,.20,.88);
    }
  }
  if(type==='C')for(const sign of [-1,1]){
    box('trim',u+sign*(width/2+.36),top+.46,.11,1.20,.26,.87);
    box('trim',u+sign*(width/2+.57),top+.72,.17,1.12,.22,.89);
  }
  const doorHeight=rise+2.85;
  for(const fraction of [-.50,-.25,0,.25,.50])box('bronze',u+width*fraction,(rise+top)/2,-.54,.10,height,.15);
  box('bronze',u,doorHeight,-.49,width,.17,.16);
  if(type!=='B')box('bronze',u,top-.78,-.49,width,.18,.16);
  for(const offset of [-.25,.25])box('steel',u+offset,1.33+rise,-.41,.055,.55,.095);
  if(rise){
    box('trim',u,.10,-.11,width+.20,.20,.98);
    box('trim',u,.29,-.23,width+.10,.23,.74);
  }
}
function commercial(batch,s,grid,type,style,revised){
  for(let i=0;i<s.groundRing.length;i++){
    const e=edge(batch,s.groundRing,i),{length,x,z,dx}=e;
    const openings=grid.entries.filter(d=>dx>0&&d.z===z&&d.x>x&&d.x<x+length)
      .map(d=>({lo:d.x-x-d.width/2-.48,hi:d.x-x+d.width/2+.48,entry:d})).sort((a,b)=>a.lo-b.lo);
    e.panel(style.base,0,length,0,grid.baseTop,-.71);
    const groups=[],columnEnds=[0];
    let left=0;
    for(const o of openings){
      groups.push([left,o.lo]);columnEnds.push(o.lo,o.hi);left=o.hi;
      portal(e,o.entry.x-x,o.entry,type,style.base);
    }
    groups.push([left,length]);columnEnds.push(length);
    let y=0;
    for(const height of s.base){
      const top=y+height;
      for(const [lo,hi] of groups){
        storefront(e,y,top,lo,hi,style.base,type==='B'?6.0:4.1,revised);
        if(hi-lo>.22)e.line(style.base,lo,hi,top-.17,-.1,.69,(type==='B'?.58:.35)+(revised?.14:0));
      }
      if(type==='C'&&y>0)for(const [lo,hi] of groups)if(hi-lo>.22)e.line('trim',lo,hi,y+.20,.15,.57,.16);
      y=top;
    }
    for(const u of columnEnds)e.box(style.base,u,grid.baseTop/2,.025,revised?.82:.67,grid.baseTop,.72);
    if(!revised)cornice(e,grid.baseTop-.09,style.shelf,true);
  }
}
function stories(batch,tier,type,style,baySize){
  for(let i=0;i<tier.ring.length;i++){
    const e=edge(batch,tier.ring,i),{length,box,panel,line}=e;
    if(length<1.95){
      panel(style.pier,0,length,tier.start,tier.end,-.04);continue;
    }
    const count=Math.max(1,Math.round(length/baySize)),bay=length/count;
    const pier=Math.min(style.pierWidth,bay*.26),height=tier.end-tier.start;
    panel(style.spandrel,0,length,tier.start,tier.end,style.glassSetback-.10);
    for(let j=0;j<=count;j++){
      box(style.pier,bay*j,tier.start+height/2,-.045,pier,height,style.pierDepth);
      if(type!=='B'){
        box(type==='A'?'trim':'sand',bay*j,tier.start+height/2,.34,pier*.43,height,.12);
        box('trim',bay*j,tier.end-.47,.17,pier+.16,.25,.68);
      }
    }
    for(let floor=0;floor<tier.floors;floor++){
      const y=tier.start+floor*FLOOR,spandrel=style.bandHeight??(type==='B'?.86:.58);
      for(let j=0;j<count;j++){
        const lo=bay*j+pier*.44,hi=bay*(j+1)-pier*.44;
        const variant=(i*3+floor*7+j*5+Math.floor(noise(j+i,floor)*4))%8;
        panel('glass',lo,hi,y+spandrel,y+FLOOR-.105,style.glassSetback,variant);
        panel(style.spandrel,lo,hi,y,y+spandrel,style.glassSetback+.12);
        if(type==='B'&&hi-lo>2.6){
          const head=FLOOR-.105,revised=style.bandHeight!==undefined;
          box('ash',(lo+hi)/2,y+(revised?(head+spandrel)/2:2.14),-.32,.13,revised?head-spandrel:FLOOR-1.00,.18);
        }
      }
      const material=type==='B'?'ash':'trim';
      if(floor>0)line(material,0,length,y+spandrel-.15,type==='B'?.08:-.16,type==='B'?.67:.31,style.sillHeight);
    }
  }
}
function deck(batch,{ring,end},style,type,highest,revised){
  const roof=new T.ShapeGeometry(new T.Shape(ring.map(([x,z])=>new T.Vector2(x,-z))));
  const p=roof.attributes.position,idx=roof.index,point=i=>[p.getX(i),end,-p.getY(i)];
  for(let i=0;i<(idx?.count??p.count);i+=3)batch.triangle('roof',[0,1,2].map(j=>point(idx?idx.getX(i+j):i+j)));
  roof.dispose();
  if(revised)projectingCornice(batch,ring,end,highest?1:.80);
  for(let i=0;i<ring.length;i++){
    const e=edge(batch,ring,i),{length,line,box}=e;
    if(!revised)cornice(e,end-.12,style.shelf,highest);
    const tall=highest&&type==='C'?.92:.56;
    line(style.base,-.17,length+.17,end+tall/2,-.06,.39,tall);
    line('trim',-.23,length+.23,end+tall,-.055,.48,.14);
    if(highest&&type!=='B'&&length>4){
      const count=Math.max(2,Math.round(length/3.1));
      for(let k=0;k<=count;k++){
        const y=type==='A'?.94:1.27;
        box('trim',length*k/count,end+y/2,-.03,.43,y,.48);
        if(type==='C'&&k<count)box('bronze',length*(k+.5)/count,end+.69,.169,length/count-.53,.32,.09);
      }
    }
  }
}
function waterTank(batch,archetype,top){
  const [x,z]=waterTanks[archetype];
  const part=batch.begin('rooftop water tower');
  const box=(key,cx,cz,y,w,h,d)=>batch.box(key,cx,top+y+h/2,cz,w,h,d);
  const shell=(key,bottom,upper,r0,r1,cap=false)=>{
    const point=(i,y,r)=>[x+r*Math.cos(i*Math.PI/12),top+y,z+r*Math.sin(i*Math.PI/12)];
    for(let i=0;i<24;i++){
      const a=point(i,upper,r1),b=point(i+1,upper,r1);
      batch.quad(key,[point(i+1,bottom,r0),point(i,bottom,r0),a,b]);
      if(cap)batch.triangle(key,[[x,top+upper,z],b,a]);
    }
  };
  box('shadowGrey',x,z,0,5.8,.62,5.7);
  box('steel',x,z,.62,5.15,.54,5.08);
  for(const dx of [-1.58,1.58])for(const dz of [-1.58,1.58])
    box('vent',x+dx,z+dz,1.15,.20,2.40,.20);
  for(const offset of [-1.58,1.58]){
    batch.beam('vent',[x-1.58,top+1.44,z+offset],[x+1.58,top+3.27,z+offset],.16,.14);
    batch.beam('vent',[x+offset,top+1.44,z-1.58],[x+offset,top+3.27,z+1.58],.16,.14);
  }
  shell('tank',3.20,5.87,1.97,1.96);
  for(const y of [3.41,3.99,4.59,5.18,5.77])shell('bronze',y,y+.095,2.025,2.025,true);
  shell('steel',5.84,6.13,2.12,1.96);
  shell('steel',6.13,6.59,1.96,1.12);
  shell('steel',6.59,WATER_TANK_HEIGHT,1.12,.12,true);
  batch.end(part);
}
function plant(batch,type,tiers){
  const last=tiers.at(-1).end;
  const box=(key,x,z,y,w,h,d)=>batch.box(key,x,y+h/2,z,w,h,d);
  const hvac=(x,z,y,w,d)=>{
    box('shadowGrey',x,z,y,w+.29,.20,d+.26);
    box('steel',x,z,y+.20,w,1.16,d);
    for(let i=0;i<4;i++)box('vent',x,z+d/2+.02,y+.38+i*.18,w*.78,.075,.06);
    const r=Math.min(.53,d*.20);
    for(const fx of [x-w*.22,x+w*.22])for(let i=0;i<16;i++){
      const p=j=>[fx+r*Math.cos(j*Math.PI/8),y+1.38,z+r*Math.sin(j*Math.PI/8)];
      batch.triangle('vent',[[fx,y+1.38,z],p(i+1),p(i)]);
    }
  };
  if(type==='A'){
    for(const x of [-15,15]){
      box('stone',x,-6,last,4.9,2.86,5.5);
      box('trim',x,-6,last+2.86,5.20,.27,5.8);
      for(let i=0;i<4;i++)box('vent',x,-3.20,last+.66+i*.40,3.4,.10,.12);
      hvac(x,3.2,last,3.9,3.25);
    }
  }else if(type==='B'){
    hvac(12.7,9,tiers[0].end,6.4,3.45);hvac(-10.2,-7.8,last,7.2,4.8);
    for(const x of [-13,-11.4,-9.8]){
      batch.beam('steel',[x,last+.37,-1],[x,last+1.40,-5.3],.47,.41);
      box('steel',x,-.65,last,.52,.54,.70);
    }
    for(const x of [-15.7,-14.5])box('steel',x,-11.6,last,.43,2.83,.43);
  }else{
    box('sand',0,-4,last,13.2,3.70,7.3);
    box('trim',0,-4,last+3.68,13.65,.33,7.65);
    box('bronze',0,-4,last+3.99,13.43,.21,7.42);
    for(const x of [-4,0,4])for(let i=0;i<5;i++)box('vent',x,-.31,last+.83+i*.35,2.83,.095,.12);
    hvac(7.4,-3,last,2.9,2.75);
  }
}
function buildStudy(spec,materials){
  const {archetype,revision}=spec,revised=revision>=2,s=scheme(spec);
  const style=revised?{...styles[archetype],...heavierMasonry[archetype]}:styles[archetype],grid=layout(spec),batch=new ArchitectureBatch;
  commercial(batch,s,grid,archetype,style,revised);
  deck(batch,{ring:s.groundRing,end:grid.baseTop},style,archetype,false,revised);
  for(const [index,tier] of grid.tiers.entries()){
    stories(batch,tier,archetype,style,s.bay);
    if(grid.tiers[index+1]?.ring!==tier.ring)deck(batch,tier,style,archetype,index===grid.tiers.length-1,revised);
    else if(revised)projectingCornice(batch,tier.ring,tier.end,.70);
    else for(let i=0;i<tier.ring.length;i++)cornice(edge(batch,tier.ring,i),tier.end-.05,.64);
  }
  plant(batch,archetype,grid.tiers);
  if(revised)waterTank(batch,archetype,grid.tiers.at(-1).end);
  const group=batch.finish(materials,s.name),roof=group.getObjectByName('roof').geometry.attributes;
  for(let i=0;i<roof.position.count;i++)roof.uv.setXY(i,roof.position.getX(i)/7,roof.position.getZ(i)/7);
  group.userData.triangles=group.children.reduce((n,m)=>n+m.geometry.index.count/3,0);
  return group;
}
export class TraditionalOfficeGenerator{
  constructor(){this.materials=makeMaterials();this.cache=new Map;this.leases=new Map;}
  generate(input){
    const spec=normalize(input),key=spec.archetype+':'+(spec.revision??1);
    let entry=this.cache.get(key);
    if(!entry){entry={model:buildStudy(spec,this.materials),users:0};this.cache.set(key,entry);}
    const model=entry.model.clone(true);
    entry.users++;this.leases.set(model,entry);
    return model;
  }
  release(model){const entry=this.leases.get(model);if(!entry)return false;
    entry.users--;this.leases.delete(model);model.removeFromParent();return true;
  }
  prune(){for(const [key,entry] of this.cache)if(!entry.users){
    for(const mesh of entry.model.children)mesh.geometry.dispose();
    this.cache.delete(key);
  }}
}
