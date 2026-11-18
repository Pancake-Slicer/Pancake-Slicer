
import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
// One authored reference reconstruction. No fit/seed/variation API or game registration.
export const REFERENCE=Object.freeze({name:'Reamon brick office — fixed reconstruction',width:32.4,depth:28.8,wingWidth:13.2,connectorWidth:6,connectorDepth:16.8,connectorCentreZ:-2.4,frontRecess:8.4,rearRecess:3.6,storeys:26,floorHeight:3.6,baseStoreys:3,shaftStoreys:18,crownStoreys:5,frontBaysPerWing:4,sideBays:8});
export function createReferenceMaterials(finish=m=>m){
 function texture(w,h,pixel){const data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)data.set([...pixel(x,y),255],(y*w+x)*4);const t=new T.DataTexture(data,w,h);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;}
 const brick=texture(128,128,(x,y)=>{const row=Math.floor(y/8),xx=(x+(row%2)*16)%32,j=Math.floor((x+(row%2)*16)/32),v=((j*13+row*29)%17)-8;return y%8===0||xx===0?[118,104,83]:[153+v,114+v,81+v];});
 const stone=texture(128,128,(x,y)=>{const v=(x*17+y*31)%7-3,joint=y%32===0||((x+(Math.floor(y/32)%2)*64)%128===0);return joint?[167,161,149]:[229+v,225+v,214+v];});
 function windows(kind){return texture(128,256,(x,y)=>{const yy=y%128,row=Math.floor(y/128),base=kind==='shaft'?[149,112,80]:kind==='base'?[196,188,169]:[199,192,173],pane=x>14&&x<114&&yy>26&&yy<111,frame=(x>=10&&x<=14||x>=114&&x<=118)&&yy>20||((yy>=22&&yy<=26||yy>=111&&yy<=116)&&x>13&&x<115),mullion=Math.abs(x-64)<1.6||Math.abs(yy-68)<1.5,sill=yy>=17&&yy<=21&&x>10&&x<118,lintel=yy>=116&&yy<=120&&x>12&&x<116;
 if(sill||lintel)return [201,187,154];if(frame)return [180,167,139];if(pane){if(mullion)return [145,139,121];const glow=(111-yy)*.32+(row?4:0),reflect=x<62?5:-4;return [66+glow+reflect,75+glow+reflect,91+glow+reflect];}if(kind==='shaft'){const mortar=yy%7===0||((x+Math.floor(yy/7)%2*14)%28===0),v=(x*7+yy*11)%9-4;return mortar?[117,100,78]:base.map(n=>n+v);}if(kind==='crown'&&yy>1&&yy<15&&x>23&&x<105)return [161,153,134];return base.map(n=>n+(x*5+yy*13)%5-2);});}
 const roofMap=texture(128,128,(x,y)=>{const joint=x%32===0||y%32===0,v=(x*13+y*19)%9-4;return joint?[153,149,138]:[198+v,193+v,178+v];});
 const mat=(name,color,roughness,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness,...extra});m.name=name;finish(m);return m;};
 return {brick:mat('brick',0xf0e7d9,.96,{map:brick}),stone:mat('stone',0xc2bdae,.96,{map:stone}),trim:mat('trim',0xd0c9b8,.92,{map:stone}),shaftWindow:mat('shaftWindow',0xf0e7d8,.48,{map:windows('shaft'),metalness:.03}),baseWindow:mat('baseWindow',0xeee9dc,.48,{map:windows('base'),metalness:.03}),crownWindow:mat('crownWindow',0xf1ebde,.48,{map:windows('crown'),metalness:.03}),roof:mat('roof',0xe0dbcc,.98,{map:roofMap}),metal:mat('metal',0x625f58,.72,{metalness:.18}),glass:mat('glass',0x6b7c8b,.34,{metalness:.18}),plant:mat('plant',0x66724d,.98)};
}
export function buildReference(materials){
 const b=new ArchitectureBatch,fh=3.6,base=10.8,crown=75.6,roof=93.6,w=32.4,d=28.8,gap=6,coreFront=6,coreBack=-10.8;
 const outline=[[-16.2,-14.4],[-3,-14.4],[-3,-10.8],[3,-10.8],[3,-14.4],[16.2,-14.4],[16.2,14.4],[3,14.4],[3,6],[-3,6],[-3,14.4],[-16.2,14.4]];
 const faces=outline.map((a,i)=>{const q=outline[(i+1)%12],dx=q[0]-a[0],dz=q[1]-a[1],length=Math.hypot(dx,dz),mid=[(a[0]+q[0])/2,(a[1]+q[1])/2],n=[dz/length,-dx/length],u=[-dx/length,-dz/length],count=length>25?8:length>12?4:Math.max(1,Math.round(length/2.8)),clear=length-(length>12?1.68:1),pitch=clear/count;return {i,length,mid,n,u,count,clear,pitch};});
 function tools(f){const p=(t,y,o=0)=>[f.mid[0]+f.u[0]*t+f.n[0]*o,y,f.mid[1]+f.u[1]*t+f.n[1]*o],box=(key,t,y,ww,h,o,dd)=>b.box(key,...p(t,y,o),f.n[0]?dd:ww,h,f.n[0]?ww:dd);const skin=(key,t,y,w,h,o,dd,bottom=false)=>{const lo=y-h/2,hi=y+h/2,l=t-w/2,r=t+w/2,back=o-dd/2,front=o+dd/2;b.quad(key,[p(l,lo,front),p(r,lo,front),p(r,hi,front),p(l,hi,front)]);b.quad(key,[p(l,lo,back),p(l,lo,front),p(l,hi,front),p(l,hi,back)]);b.quad(key,[p(r,lo,front),p(r,lo,back),p(r,hi,back),p(r,hi,front)]);if(bottom)b.quad(key,[p(l,lo,back),p(r,lo,back),p(r,lo,front),p(l,lo,front)]);};return {p,box,skin};}
 function band(f,key,y,h,projection){const {box}=tools(f);box(key,0,y,f.length+2*projection,h,projection/2-.05,projection+.10);}
 function region(name,callback){const r=b.begin(name);callback();b.end(r);}
 region('fixed H-plan base / shaft / crown',()=>{for(const f of faces){const {p,box,skin}=tools(f);
  for(const [key,lo,hi]of [['stone',0,base],['brick',base,crown],['stone',crown,roof]])b.quad(key,[p(-f.length/2,lo,-.18),p(f.length/2,lo,-.18),p(f.length/2,hi,-.18),p(-f.length/2,hi,-.18)]);
  for(let i=0;i<f.count;i++){const t=-f.clear/2+(i+.5)*f.pitch,ww=Math.min(2.15,f.pitch-.6);
   for(const [key,lo,hi,floors]of [['baseWindow',.32,base-.15,3],['shaftWindow',base+.1,crown-.12,18],['crownWindow',crown+.22,roof-.4,5]]){b.quad(key,[p(t-ww/2,lo,-.105),p(t+ww/2,lo,-.105),p(t+ww/2,hi,-.105),p(t-ww/2,hi,-.105)],[0,0,1,0,1,floors/2,0,floors/2]);b.windowBays+=floors;}
  }
  for(let i=0;i<=f.count;i++){const t=-f.clear/2+i*f.pitch;
   skin('stone',t,base/2,.94,base,.065,.49);box('trim',t,base-.4,1.12,.45,.17,.58);
   skin('brick',t,(base+crown)/2,.67,crown-base,.055,.47);
   for(const sign of [-1,1]){const x=t+sign*.31;b.quad('trim',[p(x-.0275,base,.322),p(x+.0275,base,.322),p(x+.0275,crown,.322),p(x-.0275,crown,.322)]);}
   skin('stone',t,(crown+roof)/2,.64,roof-crown,.07,.50);
   box('trim',t,crown+.38,.83,.34,.17,.60);box('trim',t,roof-.34,.9,.36,.16,.62);
  }
  // Heavy base entablature, restrained shaft courses and a separate crown assembly.
  band(f,'stone',base-.30,.38,.25);band(f,'trim',base,.33,.48);band(f,'trim',base+.25,.16,.65);
  band(f,'stone',base+6*fh,.13,.10);band(f,'trim',base+12*fh,.23,.21);
  band(f,'stone',crown-.30,.38,.28);band(f,'trim',crown,.30,.49);
  band(f,'stone',roof-.38,.43,.30);band(f,'trim',roof,.38,.60);band(f,'trim',roof+.27,.18,.78);
  // Small stone modillions under the upper cornice (no separate materials/meshes).
  const dentils=Math.floor(f.length/.54);for(let j=0;j<dentils;j++)skin('stone',-f.length/2+(j+.5)*f.length/dentils,roof-.23,.17,.32,.46,.31,true);
 }});
 region('articulated parapet and roof paving',()=>{
  b.box('roof',-9.6,roof-.055,0,13.2,.11,28.8);b.box('roof',9.6,roof-.055,0,13.2,.11,28.8);b.box('roof',0,roof-.055,-2.4,6,.11,16.8);
  for(const f of faces){const {box,skin}=tools(f);band(f,'stone',roof+.48,.32,.09);band(f,'trim',roof+1.08,.18,.18);
   const n=Math.max(1,Math.round(f.length/1.0));for(let j=0;j<=n;j++){const t=-f.length/2+j*f.length/n;skin('stone',t,roof+.79,.18,.55,.02,.27);}
   for(let j=0;j<=f.count;j++){const t=-f.clear/2+j*f.pitch;box('trim',t,roof+.84,.38,.68,.07,.42);box('trim',t,roof+1.23,.53,.16,.08,.55);}
  }
 });
 region('arched entrance and glazed court canopy',()=>{
  for(const sign of [-1,1]){b.box('stone',sign*2.46,1.18,14.38,.62,2.36,.66);b.box('trim',sign*2.46,.18,14.38,.82,.36,.82);b.box('trim',sign*2.46,2.32,14.38,.84,.23,.84);}
  for(let i=0;i<14;i++){const lo=i*Math.PI/14+.005,hi=(i+1)*Math.PI/14-.005,p=(r,t,z)=>[r*Math.cos(t),2.36+r*Math.sin(t),z],a=p(2.14,lo,14.76),c=p(2.14,hi,14.76),d=p(2.67,hi,14.76),e=p(2.67,lo,14.76),aa=p(2.14,lo,14.02),cc=p(2.14,hi,14.02),dd=p(2.67,hi,14.02),ee=p(2.67,lo,14.02);b.quad('stone',[a,e,d,c]);b.quad('stone',[aa,cc,dd,ee]);b.quad('stone',[a,c,cc,aa]);b.quad('stone',[e,ee,dd,d]);b.quad('trim',[e,a,aa,ee]);}
  b.box('trim',0,5.12,14.4,6.1,.26,.94);b.box('stone',0,4.86,14.42,.48,.7,.87);
  // Opaque blue-grey glazing follows the reference's sloped courtyard canopy.
  const near=13.92,far=6.08,yNear=5.48,yFar=9.95,point=(x,z)=>[x,yNear+(near-z)/(near-far)*(yFar-yNear),z];
  b.quad('glass',[point(-2.73,near),point(2.73,near),point(2.73,far),point(-2.73,far)]);
  for(const x of [-2.77,-.92,.92,2.77])b.beam('metal',point(x,near),point(x,far),.07,.07);
  for(let i=0;i<=7;i++){const z=near+(far-near)*i/7;b.beam('metal',point(-2.78,z),point(2.78,z),.075,.075);}
  b.box('glass',0,2.1,coreFront+.02,4.5,4.2,.1);for(const x of [-2.3,0,2.3])b.box('metal',x,2.15,coreFront+.13,.09,4.3,.13);
 });
 region('roof penthouse, barrel skylight, service enclosure and planting',()=>{
  // Left-wing mechanical penthouse, offset as in the supplied image.
  b.box('stone',-10.1,roof+1.45,-1.5,4.2,2.9,5.7);b.box('metal',-10.1,roof+2.97,-1.5,4.5,.18,6);
  const low=roof+3.02,high=roof+3.85;b.quad('metal',[[-12.35,low,-4.5],[-7.85,low,-4.5],[-8.3,high,-3.7],[-11.9,high,-3.7]]);b.quad('metal',[[-7.85,low,1.5],[-12.35,low,1.5],[-11.9,high,.7],[-8.3,high,.7]]);
  b.quad('metal',[[-12.35,low,1.5],[-12.35,low,-4.5],[-11.9,high,-3.7],[-11.9,high,.7]]);b.quad('metal',[[-7.85,low,-4.5],[-7.85,low,1.5],[-8.3,high,.7],[-8.3,high,-3.7]]);b.box('metal',-10.1,high,-1.5,3.6,.08,4.4);
  for(let j=0;j<5;j++)b.box('metal',-10.1,roof+.55+j*.37,1.39,3.65,.055,.06);
  // Right-wing barrel skylight: eight glazed facets, six steel ribs.
  const point=(i,z)=>{const a=-Math.PI/2+i*Math.PI/8;return [9.6+2.35*Math.sin(a),roof+.24+1.38*Math.cos(a),z];};
  for(let i=0;i<8;i++)b.quad('glass',[point(i,7.6),point(i+1,7.6),point(i+1,-1.2),point(i,-1.2)]);
  for(const z of [-1.2,7.6])for(let i=0;i<8;i++)b.triangle('glass',z>0?[[9.6,roof+.24,z],point(i+1,z),point(i,z)]:[[9.6,roof+.24,z],point(i,z),point(i+1,z)]);
  for(let j=0;j<=6;j++){const z=-1.2+8.8*j/6;for(let i=0;i<8;i++)b.beam('metal',point(i,z),point(i+1,z),.065,.065);}for(const i of [0,2,4,6,8])b.beam('metal',point(i,-1.2),point(i,7.6),.065,.065);
  // Rear service court: low walls, packed units and short shared ducts.
  for(const x of [4.5,14.7])b.box('stone',x,roof+.65,-10.2,.22,1.3,5.4);for(const z of [-12.9,-7.5])b.box('stone',9.6,roof+.65,z,10.4,1.3,.22);
  for(const [x,z,ww,dd,hh]of [[6.2,-10.6,2,2.5,1.2],[9.1,-11.1,2.1,2.1,1.5],[12.2,-10.3,2.2,3,1.2],[8.6,-8.5,2.9,1.1,.7]]){b.box('metal',x,roof+hh/2,z,ww,hh,dd);b.box('trim',x,roof+hh+.05,z,ww+.1,.1,dd+.1);const r=Math.min(ww,dd)*.3;for(let i=0;i<8;i++){const a=i*Math.PI/4,c=(i+1)*Math.PI/4;b.triangle('metal',[[x,roof+hh+.115,z],[x+r*Math.cos(c),roof+hh+.115,z+r*Math.sin(c)],[x+r*Math.cos(a),roof+hh+.115,z+r*Math.sin(a)]]);}}
  for(const [x,z]of [[-13.9,-10],[-5.3,-11.8],[-13.8,7.9],[-5.2,10.8],[5.1,10.9],[13.9,10.8],[.1,-9.8]]){b.box('stone',x,roof+.3,z,.85,.6,1.85);b.box('plant',x,roof+.66,z,.72,.24,1.7);}
  b.box('metal',-5.4,roof+.14,3.8,1.35,.28,1.9);for(let i=0;i<4;i++)b.box('trim',-5.4,roof+.3,3.1+i*.42,1.45,.05,.05);
 });
 const model=b.finish(materials,REFERENCE.name);
 // All masonry and paving details use physical repeating UVs, never stretched maps.
 for(const mesh of model.children)if(['brick','stone','trim','roof'].includes(mesh.name)){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv,scale=mesh.name==='brick'?[1.6,1.6]:mesh.name==='roof'?[4.8,4.8]:[3.2,1.8];for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale[0],(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale[1]);}
 model.userData.reference=REFERENCE;model.userData.outline=outline;model.userData.reviewOnly=true;model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);return model;
}
