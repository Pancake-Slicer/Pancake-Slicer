import * as T from '../engine.js';
// Original Lind crop coordinates, reused without editing the source image.
// One physical 3.7m floor repeats along each fixed-width recessed window stack.
export function createLindMaterials({bayMap=null,stoneMap=null,finish=m=>m}={}){
 for(const map of [bayMap,stoneMap])if(map){map.wrapS=map.wrapT=T.RepeatWrapping;map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;map.needsUpdate=true;}
 const make=(key,color,roughness,metalness=0,map=null)=>finish(Object.assign(new T.MeshStandardMaterial({color,roughness,metalness,map}),{name:'Lind · '+key}));
 return {stone:make('limestone','#ccc6b7',.92,0,stoneMap),trim:make('pier limestone','#d7d1c1',.85),bay:make('recessed bronze windows','#d7dbda',.58,.12,bayMap),glass:make('opaque blue-grey glass','#52656b',.32,.2),bronze:make('restrained bronze','#706756',.62,.35),roof:make('green-grey crown','#697f77',.78,.2),dark:make('terrace membrane','#767a78',.94)};
}
export async function loadLindMaps(url){
 const image=new Image;image.src=url;await image.decode();if(image.naturalWidth!==1254||image.naturalHeight!==1254)throw Error('Approved Lind facade dimensions changed');
 const crop=(x,y,w,h,width,height)=>{const c=document.createElement('canvas');c.width=width;c.height=height;c.getContext('2d').drawImage(image,x,y,w,h,0,0,width,height);return new T.CanvasTexture(c);};
 // Pad the approved 3.46m window crop inside a 3.7m floor; no complete facade stretching.
 const raw=crop(134,92,173,310,256,480),c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#71695c';ctx.fillRect(0,0,256,512);ctx.drawImage(raw.image,0,16);raw.dispose();
 return {bayMap:new T.CanvasTexture(c),stoneMap:crop(343,20,59,193,128,256)};
}
