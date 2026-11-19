import * as T from '../engine.js';
import {createLindMaterials} from '../lind/materials.js';
// Reuse approved limestone/bronze/glazing finishes, with independently drawn maps.
// No Lind image crops or pixels are copied. Grain is direction-neutral.
export function createDecoMaterials(finish=m=>m){
 function tile(w,h,pixel){const a=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)a.set([...pixel(x,y),255],(y*w+x)*4);const t=new T.DataTexture(a,w,h,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.flipY=false;t.needsUpdate=true;return t;}
 const grain=(x,y)=>(((Math.imul(x+17,73856093)^Math.imul(y+31,19349663))>>>0)%7)-3;
 const stone=tile(128,128,(x,y)=>{const g=grain(x,y),mortar=y%64<1||((Math.floor(y/64)%2?x+64:x)%128)<1;return mortar?[207,204,192]:[242+g,239+g,229+g];});
 const bay=tile(128,256,(x,y)=>{const g=grain(x,y),pane=x>13&&x<115&&y>48&&y<232,mullion=Math.abs(x-64)<2||Math.abs(y-145)<2,frame=x>10&&x<16||x>112&&x<118||y>231&&y<237||y>43&&y<49;if(frame)return [150,140,113];if(pane){if(mullion)return [117,112,95];const sky=(232-y)*.09,side=x<64?4:-2;return [56+sky+side,72+sky+side,78+sky+side];}const chevron=y>9&&y<37&&Math.abs(y-(14+Math.abs(x-64)*.24))<2;return chevron?[179,170,145]:[125+g,121+g,104+g];});
 const roof=tile(128,128,(x,y)=>{const g=grain(x,y),seam=x%64<1||y%64<1;return seam?[120,124,119]:[230+g,232+g,226+g];});
 const m=createLindMaterials({bayMap:bay,stoneMap:stone,finish});m.roof.dispose();delete m.roof;m.dark.map=roof;m.dark.color.set('#767a78');m.dark.needsUpdate=true;for(const [key,mat]of Object.entries(m))mat.name='Original Deco · '+key;return m;
}
