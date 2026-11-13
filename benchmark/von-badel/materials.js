import * as T from './engine.js';
import {croppedTexture} from './batched-architecture.js';

export async function loadMaterials(){
  const image=new Image;image.src='./assets/facade.png';await image.decode();
  const source=croppedTexture(image,[146,90,135,322],128,256).image;
  const atlas=document.createElement('canvas');atlas.width=512;atlas.height=256;
  const ctx=atlas.getContext('2d');
  for(let cell=0;cell<4;cell++){
    const c=document.createElement('canvas');c.width=128;c.height=256;const brush=c.getContext('2d');brush.drawImage(source,0,0);
    const data=brush.getImageData(0,0,128,256),gain=[.96,1,1.035,1.015][cell];
    for(let i=0;i<data.data.length;i+=4){
      const r=data.data[i],g=data.data[i+1],b=data.data[i+2],y=Math.floor(i/4/128),x=i/4%128,l=.2126*r+.7152*g+.0722*b;
      if(b>r*1.06&&b>g*.98){
        // Retain the source's subdued reflection structure, with a coordinated
        // cool sky gradient. Four nearby values, not random window colours.
        const tone=(l-55)*.22+(1-y/256)*8+Math.cos((x/128)*Math.PI)*2;
        data.data[i]=(90+tone)*gain;data.data[i+1]=(113+tone)*gain;data.data[i+2]=(128+tone)*gain;
      }else if(l<105){data.data[i]=34+l*.11;data.data[i+1]=39+l*.11;data.data[i+2]=43+l*.11;}
      else {const v=64+(l-180)*.17;data.data[i]=v;data.data[i+1]=v+4;data.data[i+2]=v+7;}
    }
    brush.putImageData(data,0,0);ctx.drawImage(c,cell*128,0);
  }
  const concrete=document.createElement('canvas');concrete.width=concrete.height=256;
  const c=concrete.getContext('2d');c.drawImage(image,318,22,65,216,0,0,256,256);
  const p=c.getImageData(0,0,256,256);
  for(let i=0;i<p.data.length;i+=4){const l=.2126*p.data[i]+.7152*p.data[i+1]+.0722*p.data[i+2],x=i/4%256,y=Math.floor(i/4/256);
    const panel=[-2,1,2,-1][Math.floor(y/64)],grain=((x*37+y*61)%13-6)*.27,v=181+(l-210)*.18+panel+grain;
    p.data[i]=v;p.data[i+1]=v+2;p.data[i+2]=v+3;}
  c.putImageData(p,0,0);c.fillStyle='#343b4020';for(const y of [0,64,128,192])c.fillRect(0,y,256,1);
  const roofCanvas=document.createElement('canvas');roofCanvas.width=roofCanvas.height=128;
  const rc=roofCanvas.getContext('2d');rc.fillStyle='#7b8084';rc.fillRect(0,0,128,128);rc.fillStyle='#515b6026';rc.fillRect(0,0,128,1);rc.fillRect(0,0,1,128);
  const glassCanvas=document.createElement('canvas');glassCanvas.width=128;glassCanvas.height=256;
  const gc=glassCanvas.getContext('2d'),gradient=gc.createLinearGradient(0,0,40,256);gradient.addColorStop(0,'#7c96a2');gradient.addColorStop(.5,'#617c8b');gradient.addColorStop(1,'#435e6c');gc.fillStyle=gradient;gc.fillRect(0,0,128,256);
  const tex=canvas=>{const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;return map;};
  const bay=tex(atlas),stone=tex(concrete),roof=tex(roofCanvas),storefront=tex(glassCanvas);
  stone.wrapS=stone.wrapT=roof.wrapS=roof.wrapT=1000;
  const material=(color,roughness,other={})=>new T.MeshStandardMaterial({color,roughness,...other});
  return {stone:material(0x555e65,.94,{map:stone}),trim:material(0x858e94,.87,{map:stone}),
    shaft:material(0xffffff,.34,{map:bay,metalness:.08}),podium:material(0xf3f6f7,.37,{map:bay,metalness:.08}),
    glass:material(0xc0d0d7,.29,{map:storefront,metalness:.26}),bronze:material(0x343e45,.58,{metalness:.42}),
    roof:material(0x646e76,.97,{map:roof}),terrace:material(0x535c62,.94,{map:roof}),mechanical:material(0x778187,.83,{metalness:.12}),
    textures:{bay,stone,roof,storefront}};
}
