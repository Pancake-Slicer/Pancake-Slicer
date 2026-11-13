import * as T from './engine.js';
import {ArchitectureBatch,croppedTexture} from './batched-architecture.js';

// Proportional reconstruction: the screenshot governs character/silhouette.
// The concept's two-bay RIGHT wing is the authority for BOTH lower wings.
export const architecture=Object.freeze({floor:3.6,bay:3.5,height:187.2,
  podium:{width:56,depth:42,top:50.4},shaft:{width:42,depth:35,base:50.4,top:151.2},
  wings:[{label:'left wing',x:-24.5,z:0,width:7,depth:42,base:0,top:50.4,bays:2},
    {label:'right wing',x:24.5,z:0,width:7,depth:42,base:0,top:50.4,bays:2}],
  crown:[{width:35,depth:28,base:151.2,top:169.2},{width:28,depth:21,base:169.2,top:176.4}],
  crop:{bay:[146,90,135,322],stone:[318,22,65,216]}});

export async function loadMaterials(){
  const image=new Image;image.src='./assets/facade.png';await image.decode();
  if(image.naturalWidth!==1254||image.naturalHeight!==1254)throw Error('Unexpected Von Badel facade source dimensions');
  const bay=croppedTexture(image,architecture.crop.bay,256,512),stone=croppedTexture(image,architecture.crop.stone,128,256);stone.wrapS=stone.wrapT=1000;
  const material=(color,roughness=.88,other={})=>new T.MeshStandardMaterial({color,roughness,...other});
  return {stone:material(0xc9bca5,.94,{map:stone}),trim:material(0xd7cbb5,.9),
    shaft:material(0xf0eeea,.64,{map:bay,metalness:.08}),podium:material(0xe9e5dc,.72,{map:bay,metalness:.06}),
    crown:material(0xf2efe8,.64,{map:bay,metalness:.08}),glass:material(0x2b3f46,.38,{metalness:.22}),
    bronze:material(0x706654,.68,{metalness:.35}),roof:material(0x5c6e66,.82,{metalness:.25}),
    terrace:material(0x777c78,.96),mechanical:material(0x8c918b,.91),textures:{bay,stone}};
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
        for(const offset of [-.39,.39]){const q=point(-len/2+i*pitch+offset,(base+top)/2,.54);
          box('stone',...q,n[0]?.045:.07,top-base,n[0]?.07:.045);}
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
  volume('central shaft',0,0,42,35,50.4,151.2,'shaft');
  for(const [i,c] of architecture.crown.entries())volume('crown '+(i+1),0,0,c.width,c.depth,c.base,c.top,'crown',{ornament:true});

  const entrance=b.begin('entrance');
  // Source-inspired stepped, fluted entry surround; taller than storefronts.
  for(const sign of [-1,1]){
    box('trim',sign*4.0,6.2,21.45,1.45,12.4,.9);
    for(const offset of [-.46,-.23,0,.23,.46])box('stone',sign*4.0+offset,6.2,21.94,.075,11.7,.09);
    box('trim',sign*3.35,12.6,21.5,1.4,.8,1);
  }
  box('trim',0,13.0,21.45,7.6,.8,.95);box('trim',0,13.65,21.4,5.9,.5,.85);
  box('stone',0,10.1,21.55,5.7,5.1,.9);
  for(let x=-2.5;x<=2.5;x+=.5)box('trim',x,10.1,22.04,.13,4.7,.10);
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

  const roof=b.begin('hipped roof'),y0=177.3,y1=187.0;
  const lower=[[-14,y0,10.5],[14,y0,10.5],[14,y0,-10.5],[-14,y0,-10.5]],upper=[[-8.75,y1,4.9],[8.75,y1,4.9],[8.75,y1,-4.9],[-8.75,y1,-4.9]];
  for(let i=0;i<4;i++){
    const j=(i+1)%4;b.quad('roof',[lower[i],lower[j],upper[j],upper[i]]);
    const count=i%2?7:10;
    for(let k=1;k<count;k++){
      const t=k/count,a=lower[i].map((v,c)=>v+(lower[j][c]-v)*t),c=upper[i].map((v,c)=>v+(upper[j][c]-v)*t);
      const dx=(lower[j][0]-lower[i][0]),dz=(lower[j][2]-lower[i][2]),len=Math.hypot(dx,dz),ex=dx/len*.026,ez=dz/len*.026;
      b.quad('bronze',[[a[0]-ex,a[1]+.035,a[2]-ez],[a[0]+ex,a[1]+.035,a[2]+ez],[c[0]+ex,c[1]+.035,c[2]+ez],[c[0]-ex,c[1]+.035,c[2]-ez]]);
    }
  }
  b.quad('roof',upper); // Flat upper roof panel, unlike Lind's pointed pyramid.
  for(let x=-8.4;x<=8.4;x+=.7)box('roof',x,187.035,0,.035,.06,9.8);
  for(let i=0;i<4;i++){
    const j=(i+1)%4,a=upper[i],c=upper[j],dx=c[0]-a[0],dz=c[2]-a[2];
    box('trim',(a[0]+c[0])/2,187.1,(a[2]+c[2])/2,Math.abs(dx)||.34,.2,Math.abs(dz)||.34);
    // Solid light limestone frame follows each hip, rather than an edge-on
    // ribbon that could disappear from one quarter view.
    const p=lower[i],q=upper[i];b.beam('trim',[p[0],p[1]+.15,p[2]],[q[0],q[1]+.03,q[2]],.45,.2);
  }
  for(const sign of [-1,1]){box('trim',sign*14,177.45,0,.45,.5,21.4);box('trim',0,177.45,sign*10.5,28.4,.5,.45);}
  b.end(roof);
  const group=b.finish(materials,'Von Badel · corrected symmetrical wings');
  group.userData={...group.userData,dimensions:architecture,volumes,wings:architecture.wings,textureBytes:Math.round((256*512+128*256)*4*4/3)};
  return group;
}
