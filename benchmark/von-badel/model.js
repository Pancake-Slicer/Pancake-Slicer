import {ArchitectureBatch} from './batched-architecture.js';
import {architecture} from './baseline-v2.js';
export {architecture};
export {loadMaterials} from './materials.js';

// True wall apertures: no solid wall box behind the recessed glazing.
export function createModel(materials){
  const b=new ArchitectureBatch,volumes=[],F=architecture.floor,B=architecture.bay,windows=[];
  const box=(...a)=>b.box(...a);
  function volume(label,x,z,w,d,base,top,facade,{sides=[0,1,2,3],storefront=false}={}){
    const part=b.begin(label);volumes.push({label,x,z,w,d,base,top,bays:Math.round(w/B)});
    box('stone',x,base+.05,z,w,.1,d);box('stone',x,top-.05,z,w,.1,d);
    const faces=[{n:[0,1],u:[1,0],len:w},{n:[1,0],u:[0,-1],len:d},{n:[0,-1],u:[-1,0],len:w},{n:[-1,0],u:[0,1],len:d}];
    for(const side of sides){
      const {n,u,len}=faces[side],count=Math.round(len/B),pitch=len/count,depth=n[0]?w/2:d/2;
      const point=(t,y,projection=0)=>[x+u[0]*t+n[0]*(depth+projection),y,z+u[1]*t+n[1]*(depth+projection)];
      const strip=(key,t,y,width,height,projection,thickness)=>box(key,...point(t,y,projection),n[0]?thickness:width,height,n[0]?width:thickness);
      for(let i=0;i<=count;i++){
        const p=point(-len/2+i*pitch,(base+top)/2,.21);
        b.chamferedPier('trim',...p,n[0]?.62:1.35,top-base,n[0]?1.35:.62);
      }
      const half=(F-.16)*135/322/2,startFloor=Math.round(base/F)+(storefront?2:0);
      for(let i=0;i<count;i++){
        const t=-len/2+(i+.5)*pitch;
        // Continuous jambs and frame rails cost two strips per window stack,
        // rather than four complete box meshes per individual window.
        for(const sign of [-1,1]){
          strip('stone',t+sign*(half+.16),(base+top)/2,.32,top-base,-.05,.4);
          strip('bronze',t+sign*(half-.035),(base+top)/2,.07,top-base,-.12,.12);
        }
        for(let floor=startFloor;floor<Math.round(top/F);floor++){
          const y0=floor*F+.08,y1=(floor+1)*F-.08,cell=(i+Math.floor(floor/6))%4;
          b.quad(facade,[point(t-half,y0,-.22),point(t+half,y0,-.22),point(t+half,y1,-.22),point(t-half,y1,-.22)],[cell/4,0,(cell+1)/4,0,(cell+1)/4,1,cell/4,1]);b.windowBays++;
        }
        windows.push({label,side,bay:i,width:half*2,spacing:pitch,glassPlane:-.22,frameFront:-.06,pierFront:.52});
      }
      for(let floor=startFloor;floor<Math.round(top/F);floor++){
        const yy=floor*F;
        b.quad('stone',[point(-len/2,yy,-.035),point(len/2,yy,-.035),point(len/2,yy+.92,-.035),point(-len/2,yy+.92,-.035)],[0,0,len/1.5,0,len/1.5,.26,0,.26]);
        for(const y of [yy+.95,yy+F-.065])strip('bronze',0,y,len,.065,-.12,.16);
      }
      if(storefront){
        for(let i=0;i<count;i++){
          const t=-len/2+(i+.5)*pitch;if(label==='central podium'&&side===0&&Math.abs(t)<3.5)continue;
          b.quad('glass',[point(t-1.2,.75,-.16),point(t+1.2,.75,-.16),point(t+1.2,6.65,-.16),point(t-1.2,6.65,-.16)]);
          for(const offset of [-1.2,0,1.2])strip('bronze',t+offset,3.7,.075,5.9,-.03,.15);
          for(const y of [.75,3.1,6.65])strip('bronze',t,y,2.4,.075,-.03,.15);
          strip('stone',t,.36,2.65,.55,.10,.25);
        }
        strip('bronze',0,7.2,len,.22,.06,.25);
      }
      // Thin dark copings; no former stepped stone bands.
      strip('stone',0,top+.2,len+.5,.4,.14,.4);strip('bronze',0,top+.46,len+.5,.12,.20,.5);
    }
    box('terrace',x,top+.035,z,w-.4,.07,d-.4);b.end(part);
  }
  volume('central podium',0,0,42,42,0,50.4,'podium',{sides:[0,2],storefront:true});
  for(const wing of architecture.wings)volume(wing.label,wing.x,wing.z,wing.width,wing.depth,wing.base,wing.top,'podium',{sides:wing.x<0?[0,2,3]:[0,1,2],storefront:true});
  volume('central shaft',0,0,42,35,50.4,183.6,'shaft');
  const entrance=b.begin('entrance');
  // Original centre/threshold retained; doors sit behind real jamb returns.
  box('stone',0,.10,21.55,8.5,.2,1.11);
  for(const sign of [-1,1]){
    box('trim',sign*3.6,3.8,21.45,.7,7.6,.9);
    const points=[[sign*3.25,.2,21.90],[sign*3.25,.2,21.20],[sign*3.25,7.2,21.20],[sign*3.25,7.2,21.90]];b.quad('stone',sign>0?points:points.reverse());
    box('stone',sign*3.075,3.7,21.18,.35,7,.10);
  }
  b.quad('stone',[[-3.25,7.2,21.9],[3.25,7.2,21.9],[3.25,7.2,21.2],[-3.25,7.2,21.2]].reverse());
  box('stone',0,7.0,21.18,6.5,.4,.1);
  box('bronze',0,7.35,21.30,8.5,.20,1.5);box('glass',0,3.6,21.23,5.7,6.4,.08);
  for(const x of [-2.85,-1.425,0,1.425,2.85])box('bronze',x,3.6,21.32,.095,6.4,.13);
  for(const y of [.4,3.6,6.8])box('bronze',0,y,21.32,5.8,.09,.13);
  for(const x of [-2.1,-.72,.72,2.1])box('mechanical',x,1.8,21.42,.045,1.1,.06);b.end(entrance);
  for(const wing of architecture.wings){const part=b.begin(wing.label+' equipment');
    for(const z of [-10.5,0,10.5]){box('bronze',wing.x,50.57,z,1.15,.26,1.55);box('mechanical',wing.x,51.17,z,1,1,1.4);box('terrace',wing.x,51.72,z,1.1,.1,1.5);
      for(const offset of [-.345,-.115,.115,.345])box('bronze',wing.x+offset,51.77,z,.05,.04,1.12);}
    b.end(part);
  }
  const roof=b.begin('flat roof');box('roof',0,183.64,0,41.6,.08,34.6);
  const roofUV=b.bucket('roof').uv;for(let i=0;i<roofUV.length;i+=2){roofUV[i]*=7;roofUV[i+1]*=6;}
  for(const sign of [-1,1]){box('stone',sign*20.7,184.05,0,.4,.9,34.8);box('bronze',sign*20.7,184.55,0,.55,.1,34.95);box('stone',0,184.05,sign*17.2,41.8,.9,.4);box('bronze',0,184.55,sign*17.2,41.95,.1,.55);}
  function fan(x,z){const y=186.35;
    for(let i=0;i<12;i++){const a=i*Math.PI/6,c=(i+1)*Math.PI/6,p=(r,t)=>[x+Math.cos(t)*r,y,z+Math.sin(t)*r];b.quad('mechanical',[p(.95,a),p(.95,c),p(.75,c),p(.75,a)].reverse());
      b.quad('mechanical',[p(.95,a),[x+Math.cos(a)*.95,186.24,z+Math.sin(a)*.95],[x+Math.cos(c)*.95,186.24,z+Math.sin(c)*.95],p(.95,c)]);
      b.triangle('bronze',[[x,y-.035,z],p(.74,c),p(.74,a)]);}
    for(const dx of [-.45,0,.45])box('mechanical',x+dx,y+.025,z,.035,.035,1.35);
  }
  for(const x of [-9,9]){
    for(const z of [-2.8,2.8])box('bronze',x,183.95,z,5.6,.5,.35);
    box('mechanical',x,185.15,0,5.4,1.9,7);box('bronze',x,186.17,0,5.5,.14,7.1);
    for(const z of [-1.9,1.9])fan(x,z);
    for(let y=184.45;y<=185.9;y+=.24)box('bronze',x,y,3.53,4.8,.055,.08);
    box('mechanical',x/2,184.35,2,8.8,.7,1.0);
  }
  box('mechanical',0,185.4,-10,4.5,3.2,4);box('bronze',0,187.1,-10,4.7,.2,4.2);
  box('bronze',0,184.8,-7.97,1.1,2,.08);box('mechanical',.4,184.75,-7.90,.06,.28,.07);box('mechanical',0,184.35,-3,1,.7,9);
  for(const x of [-12.3,12.3])box('bronze',x,185.0,-2,.12,2.3,12);
  for(let y=184.1;y<=186;y+=.27)box('mechanical',0,y,-6.3,24.7,.08,.10);
  b.end(roof);
  const group=b.finish(materials,'Von Badel · International Style facade refinement');
  const maps=new Set(Object.values(materials).filter(m=>m?.isMaterial&&m.map).map(m=>m.map));
  group.userData={...group.userData,dimensions:architecture,volumes,wings:architecture.wings,windows,roofType:'flat mechanical',textureBytes:Math.round([...maps].reduce((n,m)=>n+m.image.width*m.image.height*4*4/3,0))};return group;
}
