import * as T from './engine.js';
import {ArchitectureBatch,croppedTexture} from './batched-architecture.js';

// Proportional reconstruction: the screenshot governs character/silhouette.
// The concept's two-bay RIGHT wing is the authority for BOTH lower wings.
export const architecture=Object.freeze({floor:3.6,bay:3.5,height:187.2,
  podium:{width:56,depth:42,top:50.4},shaft:{width:42,depth:35,base:50.4,top:183.6},
  wings:[{label:'left wing',x:-24.5,z:0,width:7,depth:42,base:0,top:50.4,bays:2},
    {label:'right wing',x:24.5,z:0,width:7,depth:42,base:0,top:50.4,bays:2}],
  crown:[],
  crop:{bay:[146,90,135,322],stone:[318,22,65,216]}});

export async function loadMaterials(){
  const image=new Image;image.src='./assets/facade.png';await image.decode();
  if(image.naturalWidth!==1254||image.naturalHeight!==1254)throw Error('Unexpected Von Badel facade source dimensions');
  const bay=croppedTexture(image,architecture.crop.bay,256,512),stone=croppedTexture(image,architecture.crop.stone,128,256);stone.wrapS=stone.wrapT=1000;
  for(const [map,isBay] of [[bay,true],[stone,false]]){const c=map.image.getContext('2d'),p=c.getImageData(0,0,map.image.width,map.image.height);
    for(let i=0;i<p.data.length;i+=4){const r=p.data[i],g=p.data[i+1],blue=p.data[i+2],l=.2126*r+.7152*g+.0722*blue,glass=isBay&&blue>r*1.06&&blue>g*.98;
      if(glass){p.data[i]=57+l*.19;p.data[i+1]=72+l*.22;p.data[i+2]=83+l*.25;}else{const v=isBay?(l<95?35+l*.15:65+(l-150)*.16):151+(l-200)*.2;p.data[i]=v;p.data[i+1]=v+2;p.data[i+2]=v+4;}}
    c.putImageData(p,0,0);map.needsUpdate=true;}
  const material=(color,roughness=.88,other={})=>new T.MeshStandardMaterial({color,roughness,...other});
  return {stone:material(0x555b60,.94,{map:stone}),trim:material(0x656b70,.9),
    shaft:material(0xd4d9dc,.64,{map:bay,metalness:.08}),podium:material(0xbac1c5,.72,{map:bay,metalness:.06}),
    crown:material(0xd4d9dc,.64,{map:bay,metalness:.08}),glass:material(0x4f6572,.38,{metalness:.22}),
    bronze:material(0x343a3e,.68,{metalness:.35}),roof:material(0x3c4248,.82,{metalness:.25}),
    terrace:material(0x52585d,.96),mechanical:material(0x646c72,.91),textures:{bay,stone}};
}

export function createModel(materials){
  const b=new ArchitectureBatch,volumes=[],F=architecture.floor,B=architecture.bay;
  const box=(...args)=>b.box(...args);
  function volume(label,x,z,w,d,base,top,facade,{sides=[0,1,2,3],storefront=false,ornament=false}={}){
    const part=b.begin(label);volumes.push({label,x,z,w,d,base,top,bays:Math.round(w/B)});
    box('stone',x,(base+top)/2,z,w,top-base,d);
    const faces=[{n:[0,1],u:[1,0],len:w},{n:[1,0],u:[0,-1],len:d},{n:[0,-1],u:[-1,0],len:w},{n:[-1,0],u:[0,1],len:d}];
    for(const side of sides){
      const {n,u,len}=faces[side],count=Math.round(len/B),pitch=len/count,depth=n[0]?w/2:d/2;
      const point=(t,y,projection=0)=>[x+u[0]*t+n[0]*(depth+projection),y,z+u[1]*t+n[1]*(depth+projection)];
      for(let i=0;i<=count;i++){
        const p=point(-len/2+i*pitch,(base+top)/2,.21);
        box('trim',...p,n[0]?.62:1.35,top-base,n[0]?1.35:.62);
        // Fluted reveal is solid geometry; it never crosses the window bays.

      }
      for(let floor=Math.round(base/F)+(storefront?2:0);floor<Math.round(top/F);floor++)for(let i=0;i<count;i++){
        const center=-len/2+(i+.5)*pitch,y0=floor*F+.08,y1=(floor+1)*F-.08;
        // Preserve the precise aspect of the crop on every wall and bay.
        const half=(y1-y0)*architecture.crop.bay[2]/architecture.crop.bay[3]/2;
        b.quad(facade,[point(center-half,y0,.026),point(center+half,y0,.026),point(center+half,y1,.026),point(center-half,y1,.026)]);b.windowBays++;
      }
      if(storefront){
        for(let i=0;i<count;i++){
          const t=-len/2+(i+.5)*pitch,half=1.2;
          b.quad('glass',[point(t-half,.75,.04),point(t+half,.75,.04),point(t+half,6.65,.04),point(t-half,6.65,.04)]);
          for(const offset of [-half,0,half]){const p=point(t+offset,3.7,.12);box('bronze',...p,n[0]?.10:.075,5.9,n[0]?.075:.10);}
          for(const y of [.75,3.1,6.65]){const p=point(t,y,.12);box('bronze',...p,n[0]?.10:2.4,.075,n[0]?2.4:.10);}
          // Pale low stone panels / grilles below the storefront glazing.
          const p=point(t,.36,.12);box('trim',...p,n[0]?.24:2.65,.55,n[0]?2.65:.24);
        }
        const p=point(0,7.2,.12);box('trim',...p,n[0]?.46:len+.5,.52,n[0]?len+.5:.46);
      }
      // Continuous horizontal coping, plain parapet, flat roof returns.
      for(const [height,thickness,projection,key] of [[top-.35,.5,.15,'trim'],[top+.16,.32,.2,'trim'],[top+.48,.32,.14,'stone'],[top+.76,.24,.22,'trim']]){
        const p=point(0,height,projection);box(key,...p,n[0]?.5:len+.5,thickness,n[0]?len+.5:.5);
      }
      if(ornament)for(const t of [-len/2+.7,len/2-.7]){
        const p=point(t,top-1.35,.56);box('trim',...p,n[0]?.22:1.25,2.6,n[0]?1.25:.22);
        for(const q of [-.28,0,.28]){const p=point(t+q,top-1.35,.70);box('stone',...p,n[0]?.055:.06,1.95,n[0]?.06:.055);}
      }
    }
    box('terrace',x,top+.035,z,w-.4,.07,d-.4);b.end(part);
  }

  // Three adjoining podium components: the two lateral portions are the
  // corrected lower wings, not extra towers copied from Lind.
  volume('central podium',0,0,42,42,0,50.4,'podium',{sides:[0,2],storefront:true});
  for(const wing of architecture.wings)volume(wing.label,wing.x,wing.z,wing.width,wing.depth,wing.base,wing.top,'podium',{sides:wing.x<0?[0,2,3]:[0,1,2],storefront:true});
  volume('central shaft',0,0,42,35,50.4,183.6,'shaft');
  for(const [i,c] of architecture.crown.entries())volume('crown '+(i+1),0,0,c.width,c.depth,c.base,c.top,'crown',{ornament:true});

  const entrance=b.begin('entrance');
  for(const x of [-3.6,3.6])box('trim',x,4,21.45,.7,8,.9);
  box('bronze',0,7.8,21.5,7.9,.25,1);
  box('glass',0,3.6,21.96,5.7,6.4,.08);
  for(const x of [-2.85,-1.425,0,1.425,2.85])box('bronze',x,3.6,22.04,.095,6.4,.13);
  for(const y of [.4,3.6,6.8])box('bronze',0,y,22.04,5.8,.09,.13);b.end(entrance);

  // Small mechanical boxes visible on the concept's podium terrace. Matching
  // groups preserve the requested lateral symmetry and leave the shaft plain.
  for(const wing of architecture.wings){const part=b.begin(wing.label+' equipment');
    for(const z of [-10.5,0,10.5]){
      box('mechanical',wing.x,51.04,z,1.0,1.2,1.4);box('terrace',wing.x,51.70,z,1.1,.12,1.5);
      for(const offset of [-.345,-.115,.115,.345])box('bronze',wing.x+offset,51.77,z,.05,.04,1.12);
    }b.end(part);
  }

  const roof=b.begin('flat roof');
  box('roof',0,183.64,0,41.6,.08,34.6);
  for(const sign of [-1,1]){box('stone',sign*20.7,184.05,0,.4,.9,34.8);box('bronze',sign*20.7,184.55,0,.55,.1,34.95);box('stone',0,184.05,sign*17.2,41.8,.9,.4);box('bronze',0,184.55,sign*17.2,41.95,.1,.55);}
  for(const x of [-9,9]){box('mechanical',x,185.2,0,5.4,2.4,7);box('bronze',x,186.45,0,5.5,.1,7.1);}
  box('mechanical',0,185.5,-10,4.5,3.4,4);box('bronze',0,187.1,-10,4.7,.2,4.2);
  b.end(roof);
  const group=b.finish(materials,'Von Badel · corrected International Style baseline');
  group.userData={...group.userData,dimensions:architecture,volumes,wings:architecture.wings,textureBytes:Math.round((256*512+128*256)*4*4/3)};
  return group;
}
