// Original procedural massing and texture work, informed by classic city-builder
// skylines. These are not extracted SimCity models or copies of its catalogue.
const pcOfficeMassingNames={
  'art-deco':['Ziggurat','Wedding Cake','Shoulder Tower','Twin Beacons','Cruciform Crown','Setback L'],
  international:['Slab and Core','Paired Slabs','Glass Cross','Offset L','Stepped Glass','Pinwheel'],
  modernist:['Terraced Wings','Concrete Cross','Split Bars','Ribbon L','Offset Pavilion','Layered Podium']
};
let pcSharedOfficeMaterialCache=null;
function pcOfficeShape(building,rectangles){
  const ring=building.footprint,a=ring[0],b=ring[1],d=ring.at(-1);
  const width=Math.hypot(b.x-a.x,b.z-a.z),depth=Math.hypot(d.x-a.x,d.z-a.z);
  const ux=(b.x-a.x)/width,uz=(b.z-a.z)/width,vx=(d.x-a.x)/depth,vz=(d.z-a.z)/depth;
  const world=(x,z)=>({x:a.x+ux*width*(x+.5)+vx*depth*(z+.5),z:a.z+uz*width*(x+.5)+vz*depth*(z+.5)});
  const paths=ve(rectangles.flatMap(([cx,cz,w,h])=>Te([world(cx-w/2,cz-h/2),world(cx+w/2,cz-h/2),world(cx+w/2,cz+h/2),world(cx-w/2,cz+h/2)])));
  return xn(Ee(paths,Te(ring))).filter(part=>!part.holes.length&&sn(Te(part.outer))>12).map(part=>part.outer).sort((x,y)=>sn(Te(y))-sn(Te(x)));
}
function pcDetailedOfficeTiers(building){
  const style=building.office.style,variant=building.office.variant||0;
  const weights=style==='art-deco'?[.12,.4,.25,.15,.08]:[.12,.62,.26];
  const counts=weights.map(weight=>Math.max(1,Math.floor(building.floors*weight)));
  let difference=building.floors-counts.reduce((a,b)=>a+b,0);
  while(difference>0){counts[0]++;difference--;}
  while(difference<0){const index=counts.indexOf(Math.max(...counts));counts[index]--;difference++;}
  let y=building.y,previousParts=[building.footprint];
  return counts.map((floors,index)=>{
    let rectangles=[[0,0,1,1]];
    if(index){
      const scale=style==='art-deco'?[1,.88,.73,.57,.4][index]:index===1?.88:.7;
      const s=scale;
      if(style==='art-deco'){
        if(variant===0)rectangles=[[0,0,s,s*.94]];
        if(variant===1)rectangles=index<3?[[0,0,s,.46*s],[-.28*s,0,.24*s,.85*s],[.28*s,0,.24*s,.85*s]]:[[0,0,s,s*.9]];
        if(variant===2)rectangles=index<3?[[0,.1*s,.42*s,.78*s],[-.29*s,-.12*s,.25*s,.5*s],[.29*s,-.12*s,.25*s,.5*s]]:[[0,.05*s,s*.8,s]];
        if(variant===3)rectangles=[[-.24*s,0,.34*s,.82*s],[.24*s,0,.34*s,.82*s]];
        if(variant===4)rectangles=[[0,0,.85*s,.36*s],[0,0,.36*s,.85*s]];
        if(variant===5)rectangles=[[-.2*s,0,.34*s,.85*s],[.05*s,-.25*s,.84*s,.34*s]];
      }else{
        const v=style==='modernist'?(variant+2)%6:variant;
        if(v===0)rectangles=[[0,-.12*s,.92*s,.42*s],[.26*s,.1*s,.22*s,.72*s]];
        if(v===1)rectangles=[[-.25*s,0,.32*s,.9*s],[.25*s,0,.32*s,.9*s]];
        if(v===2)rectangles=[[0,0,.9*s,.36*s],[0,0,.36*s,.9*s]];
        if(v===3)rectangles=[[-.24*s,0,.35*s,.9*s],[.03*s,-.27*s,.9*s,.35*s]];
        if(v===4)rectangles=index===1?[[-.1,0,.68,.86],[.3,-.17,.18,.48]]:[[.08,.1,.55,.58]];
        if(v===5)rectangles=[[-.17*s,-.15*s,.54*s,.48*s],[.2*s,.18*s,.48*s,.5*s]];
      }
    }
    let parts=index?pcOfficeShape(building,rectangles):[building.footprint];
    if(index&&parts.length)parts=xn(Ee(ve(parts.flatMap(Te)),ve(previousParts.flatMap(Te)))).filter(part=>!part.holes.length&&sn(Te(part.outer))>12).map(part=>part.outer).sort((a,b)=>sn(Te(b))-sn(Te(a)));
    const safe=parts.length?parts:previousParts;
    const tier={footprint:safe[0],parts:safe,y,height:floors*building.office.floorHeight,floors,index};
    y+=tier.height;previousParts=safe;return tier;
  });
}
function pcDetailedOfficeMaterials(spec){
  const key=spec.catalogueId?'catalogue:'+spec.facade+':'+spec.colour:spec.style+':'+spec.palette;
  if(pcOfficeMaterialCache.has(key))return pcOfficeMaterialCache.get(key);
  const palette={
    'art-deco':[['#c6b79a','#d9cdb1'],['#9c775e','#c4ad89'],['#b1aaa0','#dbd5c6'],['#ba956a','#e0c69e']],
    international:[['#3f6479','#9eb6bf'],['#4e615f','#b0bcb6'],['#665b4c','#b6aa91'],['#303e4b','#8e9fab']],
    modernist:[['#b7b8b0','#e3e2d8'],['#a99d88','#d8ccb5'],['#899e9f','#cad8d4'],['#999a96','#d3d4cd']]
  };
  const [base,trim]=spec.catalogueId?[spec.colour,'#c9c6b8']:palette[spec.style][spec.palette];
  const canvas=document.createElement('canvas'),bump=document.createElement('canvas');
  canvas.width=bump.width=512;canvas.height=bump.height=1024;
  const c=canvas.getContext('2d'),h=bump.getContext('2d');
  c.fillStyle=base;c.fillRect(0,0,512,1024);h.fillStyle='#888888';h.fillRect(0,0,512,1024);
  // Fine courses and restrained dirt produce a material surface rather than
  // one flat colour; window occupancy varies across a four-bay/eight-floor tile.
  for(let row=0;row<64;row++){
    c.fillStyle=row%2?'#ffffff09':'#00000012';c.fillRect(0,row*16,512,1);
    for(let column=0;column<8;column++){
      c.fillStyle='#0000000d';c.fillRect(column*64+(row%2)*32,row*16,1,16);
    }
  }
  for(let floor=0;floor<8;floor++)for(let bay=0;bay<4;bay++){
    const x=bay*128,y=floor*128,seed=pcOfficeHash(key+':'+floor+':'+bay);
    const lit=seed%13===0,glass=lit?'#c4ae78':spec.style==='international'?['#35566c','#486d82','#5b7c89','#304957'][seed%4]:['#253a45','#344a53','#455962','#283e49'][seed%4];
    const masonry=spec.catalogueId?['classic','deco','brick'].includes(spec.facade):spec.style==='art-deco',ribbon=spec.catalogueId?spec.facade==='ribbon':spec.style==='modernist';
    const wx=x+(masonry?24:4),wy=y+(masonry?17:ribbon?32:5),ww=masonry?80:120,wh=masonry?93:ribbon?78:110;
    c.fillStyle='#182a32';c.fillRect(wx-3,wy-3,ww+6,wh+7);h.fillStyle='#303030';h.fillRect(wx-3,wy-3,ww+6,wh+7);
    c.fillStyle=glass;c.fillRect(wx,wy,ww,wh);
    c.fillStyle=lit?'#e4d0a2':'#a4c2ce55';c.fillRect(wx+2,wy+2,Math.floor(ww*.37),wh-5);
    c.fillStyle='#142c3b44';c.fillRect(wx+Math.floor(ww*.66),wy+2,Math.floor(ww*.3),wh-4);
    if(seed%4===0){c.fillStyle='#c5c3acaa';c.fillRect(wx+2,wy+2,ww-4,12+seed%24);}
    c.fillStyle=masonry?'#baa98d':'#a4b4ba';
    c.fillRect(wx+ww/2-1,wy,2,wh);c.fillRect(wx,wy+wh*.62,ww,2);
    if(spec.facade==='classic'){
      c.fillStyle=base;h.fillStyle='#888888';
      for(let u=0;u<ww;u+=2){const d=(u-ww/2)/(ww/2),height=wh*.24*(1-Math.sqrt(Math.max(0,1-d*d)));c.fillRect(wx+u,wy,2,height);h.fillRect(wx+u,wy,2,height);}
    }
    if(masonry){
      c.fillStyle=trim;c.fillRect(x+8,y,8,128);c.fillRect(x+112,y,7,128);c.fillRect(wx-5,wy+wh+3,ww+10,5);
      h.fillStyle='#dddddd';h.fillRect(x+8,y,8,128);h.fillRect(wx-5,wy+wh+3,ww+10,5);
      c.fillStyle='#766950';for(let flute=0;flute<5;flute++)c.fillRect(x+38+flute*10,y+117,4,7);
    }else if(ribbon){
      c.fillStyle=trim;c.fillRect(x,y+5,128,9);c.fillStyle='#4a555544';c.fillRect(x,y+117,128,6);
      h.fillStyle='#cccccc';h.fillRect(x,y+5,128,9);
      if(floor===7){c.fillStyle='#475354';for(let vent=0;vent<6;vent++)c.fillRect(x+15+vent*16,y+18,10,3);}
    }else{
      c.fillStyle=trim;c.fillRect(x,y,3,128);c.fillRect(x,y,128,3);
      c.fillStyle='#1b2c37';c.fillRect(x,y+118,128,10);h.fillStyle='#cccccc';h.fillRect(x,y,3,128);
    }
  }
  const texture=new vr(canvas),relief=new vr(bump);
  for(const map of [texture,relief]){map.wrapS=map.wrapT=gr;map.anisotropy=8;}
  texture.colorSpace=hn;
  if(!pcSharedOfficeMaterialCache){
  const roofCanvas=document.createElement('canvas');roofCanvas.width=roofCanvas.height=256;
  const r=roofCanvas.getContext('2d');r.fillStyle='#626967';r.fillRect(0,0,256,256);
  for(let i=0;i<1200;i++){r.fillStyle=i%2?'#707571':'#555e5b';r.fillRect(i*47%256,i*89%256,2,2);}
  r.fillStyle='#414b49';for(let i=0;i<256;i+=64){r.fillRect(i,0,1,256);r.fillRect(0,i,256,1);}
  const roofTexture=new vr(roofCanvas);roofTexture.colorSpace=hn;roofTexture.wrapS=roofTexture.wrapT=gr;roofTexture.anisotropy=4;
  pcSharedOfficeMaterialCache={roof:new Re({color:0xffffff,map:roofTexture,roughness:.95}),
    glass:new Re({color:0x365968,roughness:.3,metalness:.35}),dark:new Re({color:0x293536,roughness:.85}),metal:new Re({color:0x8c9795,roughness:.64,metalness:.25})};
  }
  const materials={
    ...pcSharedOfficeMaterialCache,
    facade:new Re({color:0xffffff,map:texture,bumpMap:relief,bumpScale:spec.style==='international'?.025:.09,roughness:spec.style==='international'?.38:.78,metalness:spec.style==='international'?.28:.03}),
    stone:new Re({color:base,roughness:.86}),trim:new Re({color:trim,roughness:.6,metalness:.15})
  };
  pcOfficeMaterialCache.set(key,materials);return materials;
}
function pcDetailedOfficeRender(building,B,U,statistics){
  const material=pcOfficeMaterials(building.office),id=building.id,catalogue=pcCatalogueFind(building.office.catalogueId);
  B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18,{top:!!catalogue}),catalogue?material.roof:material.stone,id);
  const tiers=pcOfficeTiers(building);
  for(const tier of tiers)for(const ring of tier.parts){
    B(pcOfficeWalls(ring,tier.y,tier.height,building.office.floorHeight),tier.index===0&&!catalogue?material.glass:material.facade,id);
    B(Ql(ring,tier.y+tier.height,.18,{bottom:false}),material.roof,id);
    const orientation=Math.sign(ring.reduce((sum,p,i)=>sum+p.x*ring[(i+1)%ring.length].z-ring[(i+1)%ring.length].x*p.z,0));
    for(let edge=0;edge<ring.length;edge++){
      const a=ring[edge],b=ring[(edge+1)%ring.length],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
      if(length<1)continue;
      const ox=orientation*dz/length,oz=-orientation*dx/length,yaw=Math.atan2(-dz,dx);
      const at=(t,y,out=.12)=>({x:a.x+dx*t+ox*out,y,z:a.z+dz*t+oz*out});
      statistics.windows+=Math.floor(length/3)*tier.floors;
      // Solid cornices, parapets and structural fins give the texture depth.
      U(at(.5,tier.y+tier.height+.42,0),length,.65,.32,yaw,material.trim,id);
      if(tier.index===0||building.office.style!=='modernist'){
        const bays=Math.min(12,Math.max(1,Math.floor(length/(tier.index===0?6:4))));
        for(let bay=0;bay<=bays;bay++)U(at(bay/bays,tier.y+tier.height/2),tier.index===0?.5:.18,tier.height,.24,yaw,tier.index===0?material.stone:material.trim,id);
      }
      const spacing=building.office.style==='modernist'?3:building.office.style==='art-deco'?5:12;
      for(let floor=spacing;floor<tier.floors;floor+=spacing)U(at(.5,tier.y+floor*building.office.floorHeight),length,.22,building.office.style==='modernist'?.55:.3,yaw,material.trim,id);
    }
  }
  const top=tiers.at(-1),roofY=building.y+building.height;
  for(const ring of top.parts){
    const centre=cS(ring);if(!centre||centre.clearance<1.5)continue;
    const size=Math.min(5,centre.clearance*.7);
    U({x:centre.x,y:roofY+1.5,z:centre.z},size,2.6,size*.8,building.rotation,material.metal,id);
    for(const side of [-1,1]){
      const x=centre.x+side*size*.29,z=centre.z;
      const fan=new Dn(size*.12,size*.12,.2,12);fan.translate(x,roofY+2.9,z);const face=fan.toNonIndexed();fan.dispose();B(face,material.dark,id);
      for(let slat=0;slat<4;slat++)U({x,y:roofY+.5+slat*.35,z:z+size*.405},size*.42,.08,.04,0,material.dark,id);
    }
    if(building.office.style==='art-deco'&&centre.clearance>3&&!catalogue){
      U({x:centre.x,y:roofY+3.5,z:centre.z},size*.5,1.4,size*.5,building.rotation,material.trim,id);
      if((building.office.variant||0)%2===0)U({x:centre.x,y:roofY+5.4,z:centre.z},.2,3,.2,0,material.metal,id);
    }
  }
  const front=building.towardRoad,entry=building.entrance,yaw=Math.atan2(front.x,front.z),lobby=Math.min(4.6,building.height*.7);
  U({x:entry.x+front.x*.15,y:building.y+lobby/2,z:entry.z+front.z*.15},5.2,lobby,.24,yaw,material.glass,id);
  U({x:entry.x-front.x,y:building.y+lobby+.2,z:entry.z-front.z},7,.28,3.2,yaw,material.trim,id);
  U({x:entry.x,y:building.y+lobby+.9,z:entry.z},5,.65,.3,yaw,material.dark,id);
  if(catalogue)pcCatalogueDetails(building,tiers,B,U,material);
}
