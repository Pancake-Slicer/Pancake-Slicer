
import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
// Independently authored fixed design. Generic batching only; no prior building geometry or image assets.
export const DESIGN=Object.freeze({name:'Alderwick Commercial Tower',period:'Late 1920s',storeys:26,width:42,depth:30,baseStoreys:4,baseFloorHeight:4,officeFloorHeight:3.6,baseTop:16,shaftTop:70,bodyHeight:95.2,frontStructuralPitch:3.3,frontBays:12,pavilionBays:2,pavilionProjection:.6,entrance:'Chamfered southeast corner, rectangular double-height portal',crown:Object.freeze([{floors:'20–22',width:34.8,depth:25.2,z:-.6,bottom:70,top:80.8},{floors:'23–25',width:27.6,depth:19.2,z:-1.5,bottom:80.8,top:91.6},{floors:'26',width:21,depth:14.4,z:-1.5,bottom:91.6,top:95.2}].map(Object.freeze))});
export function createHeritageMaterials(finish=m=>m){
 const tile=(width,height,pixel)=>{const data=new Uint8Array(width*height*4);for(let row=0;row<height;row++)for(let col=0;col<width;col++)data.set([...pixel(col,row),255],4*(row*width+col));const map=new T.DataTexture(data,width,height);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.generateMipmaps=true;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.needsUpdate=true;return map;};
 const masonry=tile(128,128,(x,y)=>{const course=Math.floor(y/8),xx=(x+(course%2)*16)%32,brick=Math.floor((x+(course%2)*16)/32),seed=Math.imul(brick+7,374761393)^Math.imul(course+11,668265263),mixed=Math.imul(seed^(seed>>>13),1274126177),hash=(mixed^(mixed>>>16))>>>0,shift=hash%13-6,dark=(hash>>>8)%7===0;return y%8===0||xx===0?[105,91,75]:[144+shift-(dark?13:0),89+shift-(dark?7:0),59+shift-(dark?3:0)];});
 const limestone=tile(128,128,(x,y)=>{const ashlar=y%32===0||((x+Math.floor(y/32)%2*64)%128===0),grain=(x*29+y*17)%9-4;return ashlar?[162,158,148]:[225+grain,223+grain,212+grain];});
 const ceramic=tile(64,64,(x,y)=>{const border=x<4||x>59||y<4||y>59,diamond=Math.abs(x-31.5)+Math.abs(y-31.5),line=Math.abs(diamond-22)<2||Math.abs(x-y)<1;return border?[146,119,82]:line?[200,173,128]:[181,149,103];});
 const tar=tile(128,128,(x,y)=>{const seam=x%64<2||y%32<1,v=(x*31+y*47)%11-5;return seam?[76,77,71]:[121+v,122+v,112+v];});
 function glazing(profile){return tile(128,256,(x,y)=>{const yy=y%128,upper=y>=128,shop=profile==='shop',stone=profile==='base',paired=profile==='pavilion',edge=shop?8:14,pane=x>edge&&x<128-edge&&yy>(shop?9:24)&&yy<(shop?120:111),mullion=paired?Math.abs(x-64)<1.6:Math.abs(x-43)<1.3||Math.abs(x-85)<1.3,cross=shop?Math.abs(yy-98)<1.5:Math.abs(yy-67)<1.3,frame=x>=edge-3&&x<=edge||x>=128-edge&&x<=131-edge||yy>111&&yy<117||yy>20&&yy<24;
 if(pane){if(mullion||cross)return shop?[110,105,88]:[153,144,120];const light=(118-yy)*.26+(upper?3:-3),side=x<43?3:x>85?-3:0;return [62+light+side,73+light+side,83+light+side];}if(frame)return [179,157,117];if(stone)return [196+(x*3+yy*5)%5,192+(x*3+yy*5)%5,178+(x*3+yy*5)%5];if(shop)return [103,95,77];const relief=yy<16&&Math.abs(x-64)+Math.abs(yy-8)*3<39;if(relief)return [173,139,94];const grain=(((Math.imul(x+1,73856093)^Math.imul(yy+3,19349663))>>>0)%5)-2;return [141+grain,88+grain,59+grain];});}
 const material=(name,color,roughness,extras={})=>{const m=new T.MeshStandardMaterial({color,roughness,...extras});m.name=name;finish(m);return m;};
 return {brick:material('brick',0xeee5d7,.96,{map:masonry}),umber:material('umber',0xc7b49d,.97,{map:masonry}),limestone:material('limestone',0xc5c1b3,.96,{map:limestone}),terracotta:material('terracotta',0xddd0b4,.91,{map:ceramic}),mainGlass:material('mainGlass',0xe9e6dd,.43,{map:glazing('chicago'),metalness:.06}),pavilionGlass:material('pavilionGlass',0xeae4d7,.45,{map:glazing('pavilion'),metalness:.04}),baseGlass:material('baseGlass',0xebe7db,.46,{map:glazing('base'),metalness:.04}),shopGlass:material('shopGlass',0xd4d8cf,.34,{map:glazing('shop'),metalness:.16}),roof:material('roof',0xc7c7b9,.98,{map:tar}),bronze:material('bronze',0x71664c,.65,{metalness:.28}),metal:material('metal',0x646862,.74,{metalness:.20})};
}
export function buildHeritageTower(materials){
 const b=new ArchitectureBatch,pi=Math.PI;
 const baseOutline=[[-21,-15],[21,-15],[21,11.4],[17.4,15],[-21,15]];
 const shaftOutline=[[-21,-15],[21,-15],[21,15.6],[13.2,15.6],[13.2,15],[6.6,15],[6.6,15.24],[-6.6,15.24],[-6.6,15],[-13.2,15],[-13.2,15.6],[-21,15.6]];
 const rect=(w,d,z=0)=>[[-w/2,z-d/2],[w/2,z-d/2],[w/2,z+d/2],[-w/2,z+d/2]];
 function faces(outline){return outline.map((a,i)=>{const q=outline[(i+1)%outline.length],dx=q[0]-a[0],dz=q[1]-a[1],length=Math.hypot(dx,dz),normal=[dz/length,-dx/length],axis=[-dx/length,-dz/length],mid=[(a[0]+q[0])/2,(a[1]+q[1])/2];return {length,normal,axis,mid,index:i};});}
 function tools(f){const p=(t,y,o=0)=>[f.mid[0]+f.axis[0]*t+f.normal[0]*o,y,f.mid[1]+f.axis[1]*t+f.normal[1]*o],box=(key,t,y,w,h,o,d)=>b.box(key,...p(t,y,o),Math.abs(f.normal[0])>.9?d:w,h,Math.abs(f.normal[0])>.9?w:d);
 const slab=(key,t,y,w,h,o,d,caps=false)=>{const l=t-w/2,r=t+w/2,lo=y-h/2,hi=y+h/2,back=o-d/2,front=o+d/2;b.quad(key,[p(l,lo,front),p(r,lo,front),p(r,hi,front),p(l,hi,front)]);b.quad(key,[p(l,lo,back),p(l,lo,front),p(l,hi,front),p(l,hi,back)]);b.quad(key,[p(r,lo,front),p(r,lo,back),p(r,hi,back),p(r,hi,front)]);if(caps){b.quad(key,[p(l,lo,back),p(r,lo,back),p(r,lo,front),p(l,lo,front)]);b.quad(key,[p(l,hi,front),p(r,hi,front),p(r,hi,back),p(l,hi,back)]);}};
 return {p,box,slab};}
 function wall(f,key,lo,hi,offset=-.22){const {p}=tools(f);b.quad(key,[p(-f.length/2,lo,offset),p(f.length/2,lo,offset),p(f.length/2,hi,offset),p(-f.length/2,hi,offset)]);}
 function band(f,key,y,h,projection){const {slab}=tools(f);slab(key,0,y,f.length+projection*2,h,projection/2-.05,projection+.1,true);}
 function part(label,draw){const p=b.begin(label);draw();b.end(p);}
 function diamond(f,t,y,width=.8,height=.36,offset=.12){const {p}=tools(f),centre=p(t,y,offset+.09),a=p(t-width/2,y,offset),c=p(t,y+height/2,offset),d=p(t+width/2,y,offset),e=p(t,y-height/2,offset);for(const points of [[a,e,centre],[e,d,centre],[d,c,centre],[c,a,centre]])b.triangle('terracotta',points);}
 // Four-storey limestone commercial base. The corner portal replaces a single structural bay.
 part('four-storey limestone commercial base',()=>{for(const f of faces(baseOutline)){const {p,slab,box}=tools(f),corner=f.index===2;if(corner){wall(f,'limestone',0,16,-.78);continue;}wall(f,'limestone',0,16);const xs=f.index===3?[-18.75,-15.45,-11.55,-8.25,-4.95,-1.65,1.65,4.95,8.25,11.55,15.45]:Array.from({length:12},(_,i)=>-18.15+i*3.3),zs=Array.from({length:f.index===1?8:9},(_,i)=>-12.9+i*3.3),centres=(Math.abs(f.normal[1])>.9?xs.map(x=>(x-f.mid[0])*f.axis[0]):zs.map(z=>(z-f.mid[1])*f.axis[1])).sort((a,b)=>a-b),count=centres.length,piers=[centres[0]-(centres[1]-centres[0])/2,...centres.slice(0,-1).map((t,i)=>(t+centres[i+1])/2),centres.at(-1)+(centres.at(-1)-centres.at(-2))/2];
 for(let i=0;i<count;i++){const t=centres[i],w=2.35;b.quad('shopGlass',[p(t-w/2,.35,-.14),p(t+w/2,.35,-.14),p(t+w/2,3.72,-.14),p(t-w/2,3.72,-.14)],[0,.35/8,1,.35/8,1,3.72/8,0,3.72/8]);b.quad('baseGlass',[p(t-1.10,4.25,-.16),p(t+1.10,4.25,-.16),p(t+1.10,15.6,-.16),p(t-1.10,15.6,-.16)],[0,.25/8,1,.25/8,1,11.6/8,0,11.6/8]);b.windowBays+=4;
 for(const x of [-w/2,w/2])slab('bronze',t+x,2.04,.055,3.46,-.06,.12);slab('bronze',t,3.03,w,.06,-.055,.11);if(i%3===1)slab('bronze',t+.48,1.25,.035,1.8,-.035,.06);
 }
 for(const t of piers){slab('limestone',t,8,1.02,16,.06,.60);for(const x of [-.28,0,.28])slab('limestone',t+x,7.9,.07,13.7,.39,.07);box('terracotta',t,15.15,1.1,.5,.18,.73);box('limestone',t,.3,1.22,.6,.19,.82);}
 for(const y of [4,8])band(f,'limestone',y,.18,.18);band(f,'limestone',15.45,.58,.31);band(f,'terracotta',15.90,.32,.46);band(f,'limestone',16.18,.22,.78);
 }});
 part('rectangular corner entrance and commercial portal',()=>{const f=faces(baseOutline)[2],{p,slab}=tools(f);
 b.quad('shopGlass',[p(-1.45,.1,-.48),p(1.45,.1,-.48),p(1.45,6.8,-.48),p(-1.45,6.8,-.48)],[0,0,1,0,1,1,0,1]);
 for(const sign of [-1,1]){slab('limestone',sign*1.93,3.9,.76,7.8,.11,.88,true);for(const t of [-.2,0,.2])slab('limestone',sign*1.93+t,3.85,.055,7.1,.59,.06);slab('bronze',sign*1.52,3.38,.10,6.75,-.26,.16,true);}
 slab('limestone',0,7.25,4.7,.8,.20,.92,true);slab('terracotta',0,7.75,4.95,.26,.31,1.05,true);slab('limestone',0,8.0,5.12,.20,.38,1.22,true);slab('bronze',0,3.55,3,.12,-.28,.17,true);slab('bronze',0,1.82,.08,3.6,-.28,.17,true);for(const sign of [-1,1])slab('bronze',sign*.17,1.7,.04,.5,-.15,.08,true);
 for(const t of [-1.05,-.7,-.35,0,.35,.7,1.05])slab('bronze',t,5.26,.035,2.7,-.25,.12);for(const sign of [-1,1])diamond(f,sign*1.93,6.8,.48,.82,.61);
 for(const [lo,hi]of [[8.45,11.6],[12.4,15.6]])b.quad('baseGlass',[p(-1.03,lo,-.21),p(1.03,lo,-.21),p(1.03,hi,-.21),p(-1.03,hi,-.21)],[0,lo/8,1,lo/8,1,hi/8,0,hi/8]);band(f,'limestone',15.45,.58,.31);band(f,'terracotta',15.9,.32,.46);band(f,'limestone',16.18,.22,.78);
 });
 // Main street facade: two narrow side pavilions, a broad central field and a shallow central risalit.
 part('broad brick shaft and shallow side pavilions',()=>{for(const f of faces(shaftOutline)){if(f.length<1){wall(f,'umber',16,70);continue;}const {p,slab,box}=tools(f),front=f.normal[1]>.9,pavilion=front&&Math.abs(f.mid[0])>13,centre=front&&!pavilion,count=pavilion?2:Math.round((f.length-(f.length>35?2.4:f.length>25?.9:0))/3.3),clear=count*3.3,pitch=3.3;
 wall(f,'brick',16,70);for(let i=0;i<count;i++){const t=-clear/2+(i+.5)*pitch,ww=pavilion?1.96:2.32,key=pavilion?'pavilionGlass':'mainGlass';b.quad(key,[p(t-ww/2,16.15,-.14),p(t+ww/2,16.15,-.14),p(t+ww/2,69.62,-.14),p(t-ww/2,69.62,-.14)],[0,.15/7.2,1,.15/7.2,1,53.62/7.2,0,53.62/7.2]);b.windowBays+=15;
 // Real sill ledges on the street elevations; patterned lintels on the repeating tile.
 if(front)for(let floor=0;floor<15;floor++)slab('terracotta',t,16+floor*3.6+.49,ww+.18,.12,.06,.25,true);
 if(pavilion)for(const floor of [7,11,15,19]){const y=16+(floor-5)*3.6+.24;box('terracotta',t,y,1.42,.43,-.02,.17);diamond(f,t,y,1.06,.30,.10);}
 }
 for(let i=0;i<=count;i++){const t=-clear/2+i*pitch,major=i===0||i===count||centre&&i%4===0;slab(major?'umber':'brick',t,43,major?.90:.67,54,.10,major?.72:.58);if(major){for(const sign of [-1,1])slab('terracotta',t+sign*.30,43,.075,52.8,.49,.06);box('terracotta',t,69.36,1.04,.45,.22,.83);}}
 band(f,'terracotta',41.2,.24,.20);band(f,'limestone',69.50,.5,.34);band(f,'terracotta',69.94,.33,.53);band(f,'limestone',70.23,.25,.85);
 }});
 function terrace(outer,inner,y){const ax0=-outer.width/2,ax1=outer.width/2,az0=outer.z-outer.depth/2,az1=outer.z+outer.depth/2,bx0=-inner.width/2,bx1=inner.width/2,bz0=inner.z-inner.depth/2,bz1=inner.z+inner.depth/2;for(const [x,z,w,d]of [[0,(az0+bz0)/2,outer.width,bz0-az0],[0,(bz1+az1)/2,outer.width,az1-bz1],[(ax0+bx0)/2,inner.z,bx0-ax0,inner.depth],[(bx1+ax1)/2,inner.z,ax1-bx1,inner.depth]])b.box('roof',x,y-.05,z,w,.1,d);}
 function parapet(outline,y){for(const f of faces(outline)){const {box,slab}=tools(f);band(f,'brick',y+.52,1.04,.06);band(f,'limestone',y+1.07,.16,.20);const n=Math.max(1,Math.round(f.length/3.3));for(let i=0;i<=n;i++){const t=-f.length/2+i*f.length/n;slab('umber',t,y+.73,.42,1.46,.08,.4);box('terracotta',t,y+1.47,.58,.16,.13,.56);}}}
 part('three-stage brick setback crown and terraces',()=>{
 const stages=DESIGN.crown;terrace({width:42,depth:30.6,z:.3},stages[0],70);parapet(rect(42,30.6,.3),70);
 for(const [index,stage]of stages.entries()){const outline=rect(stage.width,stage.depth,stage.z);for(const f of faces(outline)){const {p,slab,box}=tools(f),count=Math.max(1,Math.round((f.length-1.2)/3.3)),clear=count*3.3,pitch=3.3,height=stage.top-stage.bottom;wall(f,index===2?'umber':'brick',stage.bottom,stage.top);for(let i=0;i<count;i++){const t=-clear/2+(i+.5)*pitch,ww=Math.min(2.12,pitch-.65);b.quad(index===2?'pavilionGlass':'mainGlass',[p(t-ww/2,stage.bottom+.2,-.18),p(t+ww/2,stage.bottom+.2,-.18),p(t+ww/2,stage.top-.3,-.18),p(t-ww/2,stage.top-.3,-.18)],[0,.2/7.2,1,.2/7.2,1,(height-.3)/7.2,0,(height-.3)/7.2]);b.windowBays+=Math.round(height/3.6);if(index===1&&f.normal[1]>.9)diamond(f,t,stage.bottom+.52,1.2,.44,.10);}
 for(let i=0;i<=count;i++){const t=-clear/2+i*pitch;slab('brick',t,(stage.bottom+stage.top)/2,.70,height,.10,.65);box('terracotta',t,stage.top-.33,.94,.44,.25,.77);if(index===2)for(const sign of [-1,1])slab('terracotta',t+sign*.21,(stage.bottom+stage.top)/2,.065,height-.5,.45,.06);}
 band(f,'limestone',stage.bottom+.12,.24,.24);band(f,'terracotta',stage.top-.34,.34,.35);band(f,'limestone',stage.top+.03,index===2?.56:.30,index===2?.80:.52);band(f,'terracotta',stage.top+.38,.16,index===2?.94:.65);
 if(index===2){const n=Math.floor(f.length/.64);for(let i=0;i<n;i++)box('terracotta',-f.length/2+(i+.5)*f.length/n,stage.top-.13,.18,.28,.62,.36);}
 }
 if(index<2){terrace(stage,stages[index+1],stage.top);parapet(outline,stage.top);}else{b.box('roof',0,stage.top-.05,stage.z,stage.width,.1,stage.depth);parapet(outline,stage.top+.48);}
 }
 });
 part('brick lift and ventilation penthouse with period roof services',()=>{
 const roof=95.2;for(const f of faces(rect(8.4,6.6,-2.3))){const {p,slab}=tools(f);wall(f,'umber',roof,99.0);band(f,'terracotta',98.68,.25,.14);band(f,'limestone',99.02,.22,.28);const count=Math.max(1,Math.round((f.length-1)/2.1));for(let i=0;i<count;i++){const t=-f.length/2+(i+.5)*f.length/count;slab('metal',t,97.05,1.36,2.05,-.04,.05);for(let j=0;j<7;j++)slab('bronze',t,96.22+j*.25,1.32,.055,.02,.05);}}
 b.box('roof',0,99.19,-2.3,8.6,.16,6.8);b.box('metal',0,99.42,-2.3,7.8,.3,6.0);
 // Two masonry boiler flues have capped terracotta terminals; no modern condenser bank.
 for(const x of [-7.6,7.6]){b.box('umber',x,96.5,-5.8,.86,2.6,.92);b.box('terracotta',x,97.72,-5.8,1.05,.22,1.12);b.box('metal',x,97.92,-5.8,.88,.20,.95);}
 function ventilator(x,z){const y=95.2,r=.42,top=y+1.45;for(let i=0;i<10;i++){const a=i*2*pi/10,c=(i+1)*2*pi/10,p=(angle,yy,rr=r)=>[x+rr*Math.cos(angle),yy,z+rr*Math.sin(angle)];b.quad('metal',[p(c,y),p(a,y),p(a,top),p(c,top)]);b.triangle('metal',[[x,top+.42,z],p(c,top,.66),p(a,top,.66)]);}b.box('bronze',x,y+.14,z,1.08,.28,1.08);}
 for(const [x,z]of [[-6.4,2.2],[6.5,2.1],[0,4.0]])ventilator(x,z);
 b.box('metal',6.4,95.38,-.4,1.32,.36,2.5);for(let i=0;i<5;i++)b.box('bronze',6.4,95.6,-1.42+i*.5,1.42,.05,.065);
 });
 const model=b.finish(materials,DESIGN.name);for(const mesh of model.children)if(['brick','umber','limestone','roof'].includes(mesh.name)){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv,scale=['brick','umber'].includes(mesh.name)?[1.2,1.2]:mesh.name==='roof'?[5,5]:[3.2,1.8];for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale[0],(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale[1]);}
 model.userData.design=DESIGN;model.userData.reviewOnly=true;model.userData.baseOutline=baseOutline;model.userData.shaftOutline=shaftOutline;model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);model.userData.provenance={geometry:'Independently authored for this fixed design',textures:'Original code-generated pixels; no extracted or existing building maps',reused:['Three.js r180','ArchitectureBatch','OptimizedFamilyRenderer','Catalogue physical-lighting adapter']};return model;
}
