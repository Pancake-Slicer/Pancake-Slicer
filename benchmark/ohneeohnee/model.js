import * as T from './engine.js';
import {ArchitectureBatch,croppedTexture} from './batched-architecture.js';

// Metres; +Z is the broad road-facing elevation. Proportions inferred from U-3.
export const architecture={width:36,depth:18,wallTop:49.8,height:53.2,floor:3.6,floors:14,bay:2,curtainBase:4.8,curtainTop:44.4,glazedFloors:11,frontColumns:18,sideColumns:9};
export async function loadMaterials(){
 const image=new Image;image.src='./assets/facade.png';await image.decode();
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');
 // Twelve rectified source panes, excluding baked mullions/spandrels. The
 // supplied artwork is an aligned orthographic facade, so no homography needed.
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const x=[8,217,427,637][col],y=[105,418,732][row];ctx.drawImage(image,x,y,196,212,col*128,row*170,128,170);
 }
 // Last two scanlines repeat edge content rather than an empty atlas border.
 ctx.drawImage(canvas,0,509,512,1,0,510,512,2);
 const pixels=ctx.getImageData(0,0,512,512);
 for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2],l=.2126*r+.7152*g+.0722*b;
  // Retain blinds/interior silhouettes at restrained contrast; cool reflections
  // are shared coherent source artwork, not random per-window colours.
  pixels.data[i]=94+l*.43;pixels.data[i+1]=102+l*.44;pixels.data[i+2]=111+l*.46;
 }
 ctx.putImageData(pixels,0,0);const bay=new T.CanvasTexture(canvas);bay.colorSpace=T.SRGBColorSpace;bay.anisotropy=8;
 const stone=croppedTexture(image,[15,16,180,65],256,128);const c=stone.image.getContext('2d'),p=c.getImageData(0,0,256,128);
 for(let i=0;i<p.data.length;i+=4){const l=.2126*p.data[i]+.7152*p.data[i+1]+.0722*p.data[i+2],v=180+(l-100)*.23;p.data[i]=v;p.data[i+1]=v+1;p.data[i+2]=v+2;}c.putImageData(p,0,0);stone.wrapS=stone.wrapT=1000;
 const roofCanvas=document.createElement('canvas');roofCanvas.width=roofCanvas.height=128;const rc=roofCanvas.getContext('2d'),rp=rc.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4,v=108+((x*31+y*43)%11-5)*.65;rp.data.set([v,v+2,v+3,255],i);}rc.putImageData(rp,0,0);rc.fillStyle='#333b4028';rc.fillRect(0,0,128,1);const roof=new T.CanvasTexture(roofCanvas);roof.colorSpace=T.SRGBColorSpace;roof.wrapS=roof.wrapT=1000;
 const mat=(color,roughness,props={})=>new T.MeshStandardMaterial({color,roughness,...props});
 return {glass:mat(0xf0f3f5,.39,{map:bay,metalness:.12}),sideGlass:mat(0xf0f3f6,.58,{map:bay,metalness:.1}),upperGlass:mat(0xffffff,.42,{map:bay,metalness:.05}),
  frame:mat(0x9ca2a6,.75,{map:stone}),panel:mat(0x969ba1,.92,{map:stone}),side:mat(0x8b96a0,.91,{map:stone}),mullion:mat(0x626b73,.82,{metalness:.18}),roof:mat(0x899198,.98,{map:roof}),equipment:mat(0x858d92,.8,{metalness:.15}),dark:mat(0x343d43,.85),textures:{bay,stone,roof}};
}
export function createModel(materials){
 const a=architecture,b=new ArchitectureBatch,box=(...x)=>b.box(...x),windows=[];
 const faces=[{n:[0,1],u:[1,0],len:a.width,depth:a.depth/2},{n:[1,0],u:[0,-1],len:a.depth,depth:a.width/2},{n:[0,-1],u:[-1,0],len:a.width,depth:a.depth/2},{n:[-1,0],u:[0,1],len:a.depth,depth:a.width/2}];
 for(let side=0;side<4;side++){
  const part=b.begin(['principal facade','east side','rear facade','west side'][side]),{n,u,len,depth}=faces[side],count=len/a.bay,isSide=side%2===1;
  const point=(t,y,v=0)=>[u[0]*t+n[0]*(depth+v),y,u[1]*t+n[1]*(depth+v)];
  const strip=(key,t,y,w,h,v,d)=>box(key,...point(t,y,v),n[0]?d:w,h,n[0]?w:d);
  // Recessed opaque backpan closes light leaks between panel joints without
  // covering glazing, which remains 0.1 m in front of this inner plane.
  strip(isSide?'side':'panel',0,24.6,len,39.6,-.23,.04);
  // Lobby wall has actual apertures. Upper fascia is deliberately deep and
  // planar, as in the original, rather than a new setback or decorative crown.
  strip(isSide?'side':'panel',0,4.2,len,1.2,-.03,.22);
  strip(isSide?'side':'panel',0,47.1,len,5.4,-.04,.24);
  for(let row=0;row<3;row++)strip('mullion',0,44.4+row*1.8,len,.025,.09,.035);
  for(let i=0;i<=count;i++){
   const t=-len/2+i*a.bay;
   strip('mullion',t,24.6,.055,39.6,.035,.12);
   strip(isSide?'mullion':'frame',t,47.1,.032,5.4,.09,.04);
  }
  for(let floor=0;floor<a.glazedFloors;floor++){
   const y=a.curtainBase+floor*a.floor,glassHeight=2.12;
   strip(isSide?'side':'panel',0,y+.61,len,1.22,-.045,.15);
   strip('mullion',0,y+1.23,len,.06,.025,.13);strip('mullion',0,y+a.floor-.035,len,.065,.035,.13);
   for(let col=0;col<count;col++){
    const t=-len/2+(col+.5)*a.bay,variantCol=(col+Math.floor(floor/4))%4,variantRow=floor%3,uv=[(variantCol*128+1)/512,(512-(variantRow*170+169))/512,(variantCol*128+127)/512,(512-(variantRow*170+169))/512,(variantCol*128+127)/512,(512-(variantRow*170+1))/512,(variantCol*128+1)/512,(512-(variantRow*170+1))/512];
    b.quad(isSide?'sideGlass':floor>=9?'upperGlass':'glass',[point(t-.96,y+1.29,-.10),point(t+.96,y+1.29,-.10),point(t+.96,y+1.29+glassHeight,-.10),point(t-.96,y+1.29+glassHeight,-.10)],uv);b.windowBays++;
    // The original has a small intermediate rail through the lower glazing.
    if(floor<9)strip('mullion',t,y+2.34,1.92,.028,-.025,.05);
    windows.push({side,floor,col,t,bottom:y+1.29,top:y+3.41,plane:-.10});
   }
  }
  for(const t of [-len/2,len/2])strip(isSide?'side':'frame',t,24.9,.25,49.8,.055,.28);
  strip('frame',0,44.45,len,.11,.065,.2);strip('frame',0,4.8,len,.10,.07,.20);
  // Subdued ground-floor panels and glazing. Entrance is offset one module
  // left of centre, matching the original's small frontage opening.
  const entrance=side===0?-4:null;
  strip(isSide?'side':'panel',0,1.84,len,2.64,-.28,.04);
  for(let col=0;col<count;col++){
   const t=-len/2+(col+.5)*a.bay,door=entrance!==null&&Math.abs(t-entrance)<2;
   strip(isSide?'side':'panel',t,.27,2,.54,-.04,.24);strip(isSide?'side':'panel',t,3.37,2,.46,-.04,.24);
   if(isSide||(!door&&Math.abs(t)>11)){strip(isSide?'side':'panel',t,1.83,2,2.58,-.04,.24);}
   else {b.quad('glass',[point(t-.91,.56,-.18),point(t+.91,.56,-.18),point(t+.91,3.13,-.18),point(t-.91,3.13,-.18)]);for(const dx of [-.94,0,.94])strip('mullion',t+dx,1.85,.055,2.6,-.06,.13);}
   strip('frame',-len/2+col*a.bay,1.8,.08,3.6,.025,.15);
  }
  if(entrance!==null){strip('mullion',entrance,3.17,4.05,.12,.20,.55);strip('frame',entrance,.10,4.05,.20,.16,.65);for(const t of [entrance-.2,entrance+.2])strip('equipment',t,1.45,.035,.7,-.04,.04);}
  b.end(part);
 }
 const shell=b.begin('floor and roof');box('panel',0,.04,0,36,.08,18);box('roof',0,49.76,0,35.7,.08,17.7);
 const uv=b.bucket('roof').uv;for(let i=0;i<uv.length;i+=2){uv[i]*=9;uv[i+1]*=4.5;}
 for(const sign of [-1,1]){box('side',sign*17.86,50.05,0,.28,.7,18);box('frame',sign*17.86,50.43,0,.36,.06,18.06);box('side',0,50.05,sign*8.86,35.5,.7,.28);box('frame',0,50.43,sign*8.86,35.7,.06,.36);}b.end(shell);
 const plant=b.begin('roof plant');
 const plantBox=(key,x,y,z,w,h,d)=>box(key,x,y,z*.7,w,h,d*.7);
 function housing(x,z,w,d,h){plantBox('dark',x,49.98,z,w+.26,.36,d+.26);plantBox('equipment',x,50.12+h/2,z,w,h,d);plantBox('dark',x,50.15+h,z,w+.12,.06,d+.12);return 50.18+h;}
 // Original: low row to the left, linked duct in the centre and a larger
 // rectangular louvred housing to the right, not an arbitrary scatter.
 for(const z of [-6.7,-2.9,1.0]){const y=housing(-12.6,z,2.7,2.6,1.35);plantBox('mullion',-12.6,y+.03,z,1.5,.04,1.5);plantBox('equipment',-12.6,y+.055,z,.7,.025,.7);}
 housing(-4.5,-8.0,4.8,2.6,1.2);
 const access=housing(6.4,1.9,5.4,4.1,3.02);plantBox('mullion',6.4,51.55,4.0,4.95,2.35,.075);
 for(let y=50.5;y<52.7;y+=.19)plantBox('equipment',6.4,y,4.06,4.95,.035,.065);
 for(let x=4.05;x<=8.8;x+=.19)plantBox('mullion',x,51.55,-.19,.035,2.3,.065);
 housing(10,-3.7,3.4,3.5,1.6);housing(12.4,7.5,2.5,2.3,1.0);
 function duct(x,z,w,d){plantBox('equipment',x,50.65,z,w,.8,d);plantBox('frame',x,51.06,z,w+.035,.035,d+.035);}
 duct(-2,-4,1.4,6.8);duct(.6,-.7,6.6,1.4);duct(3.2,-2.0,1.4,2.6);duct(6.7,-3.2,6.9,1.4);
 for(const z of [-6,-3.5,-1])plantBox('mullion',-2,50.13,z,1.6,.3,.12);
 for(const z of [-5,-3,-1])plantBox('mullion',-2,50.65,z,1.44,.83,.045);
 for(const x of [-1,1,6.5,8.5])plantBox('mullion',x,50.65,x<3?-.7:-3.2,.045,.83,1.44);
 housing(-3.8,5.6,1.4,1.4,.7);plantBox('dark',-3.8,50.87,5.6,1,.03,1);
 b.end(plant);const group=b.finish(materials,'Ohneeohnee · Modernist office tower');
 const maps=new Set(Object.values(materials).filter(m=>m?.isMaterial&&m.map).map(m=>m.map));group.userData={...group.userData,dimensions:architecture,volumes:[{label:'single rectangular volume',x:0,z:0,w:36,d:18,base:0,top:49.8}],windows,floors:14,roofType:'flat mechanical',textureBytes:Math.round([...maps].reduce((s,m)=>s+m.image.width*m.image.height*4*4/3,0))};return group;
}
