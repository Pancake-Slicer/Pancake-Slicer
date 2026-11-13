import * as T from './engine.js';

// Proportional reconstruction in metres; measured drawings are unavailable.
// One 3.7m storey, one 3.7m bay, 44.4m street wall, 183.9m total height.
export const architecture={floor:3.7,bay:3.7,width:44.4,depth:29.6,height:183.9,
  levels:[18.5,77.7,88.8,92.5,122.1,140.6,159.1,177.6]};

function canvasTexture(image,x,y,w,h,width,height){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.drawImage(image,x,y,w,h,0,0,width,height);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  return map;
}
export async function loadMaterials(){
  const image=new Image();image.src='./assets/facade.png';await image.decode();
  if(image.naturalWidth!==1254||image.naturalHeight!==1254)throw Error('Facade crop requires supplied 1254px image');
  // Crop one orthogonal, complete window + bronze spandrel from the source.
  // The image is front-facing: no perspective rectification is necessary.
  const bay=canvasTexture(image,134,92,173,310,256,512);
  const stone=canvasTexture(image,343,20,59,193,128,256);
  stone.wrapS=stone.wrapT=1000; // Three.RepeatWrapping; metric stone UVs below.
  const material=(color,roughness=0.85,other={})=>new T.MeshStandardMaterial({color,roughness,...other});
  return {stone:material(0xc5b59a,.92,{map:stone}),trim:material(0xd4c6ac),
    bay:material(0xeeeeeb,.58,{map:bay,metalness:.12}),glass:material(0x263b43,.34,{metalness:.3}),
    bronze:material(0x675b48,.62,{metalness:.45}),roof:material(0x586d63,.78,{metalness:.25}),
    dark:material(0x77746b),textures:{bay,stone}};
}

// Bake all repetitive facade/stone elements into one indexed geometry per
// material. There is no Object3D, material, or draw call per individual window.
export function createArtDeco(materials){
  const group=new T.Group();group.name='Lind reference reconstruction';
  const buckets=new Map(),unit=new T.BoxGeometry(1,1,1);
  const source=unit.attributes,idx=unit.index.array;
  let boxes=0,windowBays=0;const volumes=[];
  function bucket(key){if(!buckets.has(key))buckets.set(key,{p:[],n:[],uv:[],i:[]});return buckets.get(key);}
  function box(key,x,y,z,w,h,d){
    const b=bucket(key),base=b.p.length/3;
    for(let i=0;i<source.position.count;i++){
      b.p.push(source.position.getX(i)*w+x,source.position.getY(i)*h+y,source.position.getZ(i)*d+z);
      b.n.push(source.normal.getX(i),source.normal.getY(i),source.normal.getZ(i));
      const nx=Math.abs(source.normal.getX(i)),ny=Math.abs(source.normal.getY(i));
      b.uv.push(source.uv.getX(i)*(key==='stone'?(nx?d:w)/2:1),source.uv.getY(i)*(key==='stone'?(ny?d:h)/3.7:1));
    }
    for(const i of idx)b.i.push(base+i);boxes++;
  }
  function quad(key,points,uv=[0,0,1,0,1,1,0,1]){
    const b=bucket(key),base=b.p.length/3;
    b.p.push(...points.flat());b.uv.push(...uv);b.n.push(...Array(4).fill([0,0,0]).flat());
    b.i.push(base,base+1,base+2,base,base+2,base+3);
  }
  // Each slab uses the same physical bay pitch. Front/rear have the same
  // articulated grammar; unseen rear details are an explicit reconstruction.
  function volume(label,x,z,w,d,base,top,pitch=3.7){
    volumes.push({label,x,z,w,d,base,top});
    box('stone',x,(base+top)/2,z,w,top-base,d);
    const sides=[{n:[0,1],u:[1,0],len:w},{n:[1,0],u:[0,-1],len:d},
      {n:[0,-1],u:[-1,0],len:w},{n:[-1,0],u:[0,1],len:d}];
    for(const side of sides){
      const {n,u,len}=side,count=Math.max(1,Math.round(len/pitch)),step=len/count;
      const depth=n[0]?w/2:d/2;
      // Raised structural piers run uninterrupted across floor lines.
      for(let i=0;i<=count;i++){
        const t=-len/2+i*step,px=x+u[0]*t+n[0]*(depth+.16),pz=z+u[1]*t+n[1]*(depth+.16);
        const pierWidth=Math.min(1.4,step-2.0);
        box('trim',px,(base+top)/2,pz,n[0]?.55:pierWidth,top-base,n[0]?pierWidth:.55);
        // Narrow recessed joints in the stone face keep the verticals legible.
        box('stone',px+u[0]*.33,(base+top)/2,pz+u[1]*.33,n[0]?.57:.055,top-base,n[0]?.055:.57);
        if(i>0&&i<count){
          box('trim',px,top+.48,pz,n[0]?.62:1.15,.96,n[0]?1.15:.62);
          // Compact geometric finial; no imaginary spires.
          box('stone',px,top+1.04,pz,n[0]?.36:.4,.24,n[0]?.4:.36);
        }
      }
      const firstFloor=Math.round(base/3.7),lastFloor=Math.round(top/3.7);
      for(let floor=firstFloor;floor<lastFloor&&label!=='crown drum';floor++)for(let i=0;i<count;i++){
        const t=-len/2+(i+.5)*step,hw=(173/310*3.46)/2;
        const y0=floor*3.7+.14,y1=(floor+1)*3.7-.1;
        const center=[x+u[0]*t+n[0]*(depth+.025),z+u[1]*t+n[1]*(depth+.025)];
        const p=(a,y)=>[center[0]+u[0]*a,y,center[1]+u[1]*a];
        quad('bay',[p(-hw,y0),p(hw,y0),p(hw,y1),p(-hw,y1)]);windowBays++;
      }
      if(label==='crown drum')for(let i=0;i<count;i++){
        const t=-len/2+(i+.5)*step,hw=(step-1.9)/2;
        const center=[x+u[0]*t+n[0]*(depth+.03),z+u[1]*t+n[1]*(depth+.03)];
        const p=(a,y)=>[center[0]+u[0]*a,y,center[1]+u[1]*a];
        quad('glass',[p(-hw,base+.6),p(hw,base+.6),p(hw,top-1.35),p(-hw,top-1.35)]);
        for(let y=base+.8;y<top-1.35;y+=.48)box('bronze',center[0],y,center[1],n[0]?.12:hw*2,.055,n[0]?hw*2:.12);
      }
      // Raised cap, recessed grey walkable roof, and parapet wall.
      const cap=(yy,width,height,proj,key)=>box(key,x+n[0]*(depth+proj),yy,z+n[1]*(depth+proj),n[0]?width:len+.38,height,n[0]?len+.38:width);
      cap(top-.38,.42,.38,.11,'trim');cap(top+.15,.48,.3,.12,'trim');
      cap(top+.48,.25,.36,.08,'stone');cap(top+.74,.52,.16,.12,'trim');
      // Shallow carved masonry panel at the roof return, repeated at pier heads.
      if(top>75)for(const t of [-len/2+.8,len/2-.8]){
        const px=x+u[0]*t+n[0]*(depth+.39),pz=z+u[1]*t+n[1]*(depth+.39);
        box('trim',px,top-1.45,pz,n[0]?.22:1.2,2.7,n[0]?1.2:.22);
        for(const du of [-.32,0,.32])box('stone',px+u[0]*du,top-1.45,pz+u[1]*du,n[0]?.26:.08,2,n[0]?.08:.26);
      }
    }
    box('dark',x,top+.04,z,w-.55,.08,d-.55);
  }

  volume('street podium',0,0,44.4,29.6,0,18.5);
  // Central mass stays narrow and continuous behind the shoulders.
  volume('central shaft',0,-1.85,22.2,18.5,18.5,122.1);
  // Match the existing right wing elevations; retain every original footprint.
  volume('left main wing',-16.65,0,11.1,25.9,18.5,77.7);
  volume('left shoulder',-15.73,-.92,9.25,22.2,77.7,88.8);
  volume('left termination',-14.8,-1.85,7.4,18.5,88.8,92.5);
  volume('right main wing',16.65,0,11.1,25.9,18.5,77.7);
  volume('right shoulder',15.73,-.92,9.25,22.2,77.7,88.8);
  volume('right termination',14.8,-1.85,7.4,18.5,88.8,92.5);
  volume('upper setback',0,-1.85,18.5,16.65,122.1,140.6);
  volume('upper lantern',0,-1.85,14.8,14.8,140.6,159.1);
  volume('crown drum',0,-1.85,12.95,12.95,159.1,177.6,4.32);
  // Broad fluted corner buttresses distinguish the central shaft from the
  // smaller bay piers and rise only slightly above each setback coping.
  for(const [w,d,base,top] of [[22.2,18.5,18.5,122.1],[18.5,16.65,122.1,140.6],[14.8,14.8,140.6,159.1],[12.95,12.95,159.1,177.6]]){
    for(const sx of [-1,1])for(const sz of [-1,1]){
      const x=sx*(w/2-.55),z=-1.85+sz*(d/2-.55);
      box('trim',x,(base+top)/2,z,1.6,top-base,1.6);
      box('trim',x,top+.25,z,1.85,.5,1.85);
      box('stone',x,top+.65,z,1.3,.3,1.3);
    }
  }

  // Buttress blades follow the matching lower-wing roof elevations.
  for(const sign of [-1,1]){
    const top=79.2;
    for(const z of [-12.8,10.9]){
      box('trim',sign*20.1,top/2,z,.72,top,.82);
      box('trim',sign*20.1,top+.7,z,.95,1.4,1.05);
      box('stone',sign*20.1,top+1.6,z,.6,.4,.7);
    }
  }
  // Two-storey entry portal; fluted limestone jambs and restrained bronze doors.
  for(const x of [-3.65,3.65]){
    box('trim',x,5.5,15.12,1.15,11,1.05);
    for(const dx of [-.32,0,.32])box('stone',x+dx,5.5,15.7,.10,10.5,.10);
  }
  box('trim',0,11.4,15.15,8.5,1.2,1.2);
  box('bronze',0,3,14.96,5.8,6,.22);
  for(const x of [-1.95,0,1.95]){
    box('glass',x,3,15.1,1.6,5.5,.12);
    box('bronze',x+.74,3,15.22,.06,5.3,.08);
    box('bronze',x,3.8,15.22,1.6,.10,.08);
  }
  // Faceted, low green-grey metal roof with a light perimeter frame.
  const roofY=178.5,peak=183.9,half=6.6,cz=-1.85;
  const corners=[[-half,roofY,cz+half],[half,roofY,cz+half],[half,roofY,cz-half],[-half,roofY,cz-half]];
  const roof=bucket('roof');
  for(let i=0;i<4;i++){
    const a=corners[i],b=corners[(i+1)%4],p=[0,peak,cz],j=roof.p.length/3;
    roof.p.push(...a,...b,...p);roof.n.push(...Array(9).fill(0));roof.uv.push(0,0,1,0,.5,1);roof.i.push(j,j+1,j+2);
    // Standing seams are real narrow triangular ribbons following the slope.
    for(let k=1;k<7;k++){
      const t=k/7,q=a.map((v,c)=>v+(b[c]-v)*t),r=q.map((v,c)=>v+(p[c]-v)*.94);
      const width=.032,off=[(b[0]-a[0])*width/13.2,.035,(b[2]-a[2])*width/13.2];
      quad('bronze',[[q[0]-off[0],q[1]+.035,q[2]-off[2]],[q[0]+off[0],q[1]+.035,q[2]+off[2]],
        [r[0]+off[0],r[1]+.035,r[2]+off[2]],[r[0]-off[0],r[1]+.035,r[2]-off[2]]]);
    }
  }
  for(const s of [-1,1]){
    box('trim',s*6.65,178.5,cz,.35,.45,13.65);
    box('trim',0,178.5,cz+s*6.65,13.65,.45,.35);
  }
  box('trim',0,183.85,cz,.15,.1,.15);
  for(const [key,b] of buckets){
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(b.p,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));geometry.setIndex(b.i);geometry.computeVertexNormals();geometry.computeBoundingSphere();
    const mesh=new T.Mesh(geometry,materials[key]);mesh.name=key;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  unit.dispose();
  group.userData={boxes,windowBays,materialBatches:buckets.size,dimensions:architecture,volumes,
    textureBytes:Math.round((256*512+128*256)*4*4/3)};
  return group;
}
