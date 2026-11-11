// Authored, fully volumetric buildings. Reference data contains measurements and
// material statistics only: no imported triangles, UV buffers or image pixels.
const pcRebuiltById=new Map(pcRebuiltDesigns.entries.map(entry=>[entry.id,entry]));
function pcSC4Model(id){return pcRebuiltById.get(Number(id))||null;}
function pcSC4Fits(property,model){return !!model&&property.area>=4;}
const pcRebuiltMaterialCache=new Map,pcRebuiltSharedCache=new Map;
function pcRebuiltLighting(material){material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse *= 1.7;\nreflectedLight.indirectDiffuse *= 3.0;');pcCelPhysicalShader(shader);};material.customProgramCacheKey=()=> 'pc-illustrated-office-v2';material.userData.pcRebuiltLighting=true;return material;}
function pcRebuiltSolid(key,colour,roughness=.8,metalness=0){if(!pcRebuiltSharedCache.has(key))pcRebuiltSharedCache.set(key,pcRebuiltLighting(new Re({color:colour,roughness,metalness})));return pcRebuiltSharedCache.get(key);}
function pcRebuiltMaterials(design){
 if(pcRebuiltMaterialCache.has(design.id))return pcRebuiltMaterialCache.get(design.id);
 const palette=pcIllustratedPalette(design);
 const colour=document.createElement('canvas'),relief=document.createElement('canvas'),roughness=document.createElement('canvas');
 for(const canvas of [colour,relief,roughness]){canvas.width=256;canvas.height=512;}
 const c=colour.getContext('2d'),b=relief.getContext('2d'),r=roughness.getContext('2d'),masonry=['classic','deco','brick'].includes(design.facade),ribbon=design.facade==='ribbon';
 c.fillStyle=palette.stone;c.fillRect(0,0,256,512);b.fillStyle='#a0a0a0';b.fillRect(0,0,256,512);r.fillStyle='#e5e5e5';r.fillRect(0,0,256,512);
 // Direction-neutral grain and mortar. Light and shadows come from the scene.
 for(let i=0;i<450;i++){const hash=pcOfficeHash(design.id+':grain:'+i);c.fillStyle=hash%2?'#ffffff04':'#00000003';c.fillRect(hash%256,(hash>>>8)%512,1,1);}
 if(masonry)for(let y=0;y<512;y+=8){c.fillStyle='#00000014';c.fillRect(0,y,256,1);for(let x=(y%16?0:16);x<256;x+=32)c.fillRect(x,y,1,8);}
 for(let floor=0;floor<8;floor++)for(let bay=0;bay<8;bay++){
  const x=bay*32,y=floor*64,seed=pcOfficeHash(design.id+':window:'+floor+':'+bay),wx=x+(masonry?8:2),wy=y+(masonry?10:ribbon?17:5),ww=masonry?16:28,wh=masonry?43:ribbon?35:54;
  c.fillStyle=palette.trim;c.fillRect(wx-1,wy-1,ww+2,wh+2);b.fillStyle='#d0d0d0';b.fillRect(wx-1,wy-1,ww+2,wh+2);
  c.fillStyle=palette.glass;c.fillRect(wx,wy,ww,wh);b.fillStyle='#535353';b.fillRect(wx,wy,ww,wh);r.fillStyle=masonry?'#696969':'#494949';r.fillRect(wx,wy,ww,wh);
  // Each pane has a flat material tone; no fixed directional reflections.
  c.fillStyle=seed%3?'#ffffff04':'#0000000e';c.fillRect(wx,wy,ww,wh);
  if(masonry&&seed%9===0){c.fillStyle='#c4bdab';c.fillRect(wx+1,wy+1,ww-2,6+seed%16);r.fillStyle='#b8b8b8';r.fillRect(wx+1,wy+1,ww-2,6+seed%16);}
  c.fillStyle=palette.trim;c.fillRect(wx+ww/2-.5,wy,1,wh);
  if(masonry){c.fillRect(wx,wy+wh*.58,ww,1);c.fillRect(wx-2,wy+wh+2,ww+4,2);b.fillStyle='#d0d0d0';b.fillRect(wx-2,wy+wh+2,ww+4,2);}
  if(design.facade==='classic')for(let u=0;u<ww;u++){const d=(u-ww/2)/(ww/2),height=9*(1-Math.sqrt(Math.max(0,1-d*d)));c.fillStyle=palette.stone;c.fillRect(wx+u,wy,1,height);b.fillStyle='#a0a0a0';b.fillRect(wx+u,wy,1,height);}
  if(design.facade==='deco'){c.fillStyle=palette.trim;c.fillRect(x+2,y,2,64);c.fillRect(x+28,y,2,64);}
  if(ribbon){c.fillStyle=palette.stone;c.fillRect(x,y+1,32,10);b.fillStyle='#cccccc';b.fillRect(x,y+1,32,10);}
 }
 const texture=new vr(colour),bump=new vr(relief),rough=new vr(roughness);texture.colorSpace=hn;
 for(const map of [texture,bump,rough]){map.wrapS=map.wrapT=gr;map.anisotropy=4;}
 const facade=pcRebuiltLighting(new Re({map:texture,bumpMap:bump,bumpScale:masonry?.012:.004,roughnessMap:rough,roughness:1,metalness:masonry?.01:.025}));facade.userData.pcRebuiltFacade=design.id;
 const roofMaterial=pcRebuiltSolid('roof','#767a78',.94);
 if(!roofMaterial.map){const tile=document.createElement('canvas');tile.width=tile.height=128;const brush=tile.getContext('2d');brush.fillStyle='#b9b7a5';brush.fillRect(0,0,128,128);for(let i=0;i<450;i++){const hash=pcOfficeHash('roof-grain:'+i);brush.fillStyle=hash%2?'#ffffff05':'#00000004';brush.fillRect(hash%128,(hash>>>8)%128,1,1);}brush.fillStyle='#777f78';brush.fillRect(0,0,128,1);brush.fillRect(0,0,1,128);roofMaterial.map=new vr(tile);roofMaterial.map.colorSpace=hn;roofMaterial.map.wrapS=roofMaterial.map.wrapT=gr;roofMaterial.map.anisotropy=4;roofMaterial.color.set(0xffffff);roofMaterial.needsUpdate=true;}
 const materials={facade,stone:pcRebuiltSolid('stone:'+palette.stone,palette.stone),trim:pcRebuiltSolid('trim:'+palette.trim,palette.trim,.65,.06),
  roof:roofMaterial,metal:pcRebuiltSolid('metal','#777e7f',.55,.32),glass:pcRebuiltSolid('glass:'+palette.glass,palette.glass,.25,.2),
  copper:pcRebuiltSolid('copper','#56837b',.55,.18),dark:pcRebuiltSolid('dark','#394448',.75),plants:pcRebuiltSolid('plants','#536f3c',.9)};
 pcRebuiltMaterialCache.set(design.id,materials);return materials;
}
const pcRebuiltSupportCache=new Map;
function pcRebuiltSupportedBands(design){
 if(pcRebuiltSupportCache.has(design.id))return pcRebuiltSupportCache.get(design.id);
 // Every upper wing has continuous support down to the ground. Union compound
 // plans before extrusion so overlapping imported survey slices cannot leave
 // internal walls, detached islands or arbitrary cantilevers.
 let supported=[];const bands=[];
 for(const band of [...design.bands].reverse()){
  supported=ve([...supported,...band.parts.flatMap(r=>Te(r.map(([x,z])=>({x,z})))),...(band.upper||[]).flatMap(r=>Te(r.map(([x,z])=>({x,z}))))]);
  const parts=xn(supported).map(p=>({outer:p.outer,holes:p.holes}));
  bands.unshift({y:band.y,top:band.top,plans:parts});
 }
 pcRebuiltSupportCache.set(design.id,bands);return bands;
}
function pcRebuiltTransform(building,design){
 const baseAngle=building.rotation,baseCos=Math.cos(baseAngle),baseSin=Math.sin(baseAngle);
 const local=building.footprint.map(p=>({x:(p.x-building.x)*baseCos-(p.z-building.z)*baseSin,z:(p.x-building.x)*baseSin+(p.z-building.z)*baseCos})),box=En(local);
 const native=design.bands.flatMap(b=>[...b.parts,...(b.upper||[])].flat()).map(([x,z])=>({x,z})),bounds=En(native),w=bounds.maxX-bounds.minX,d=bounds.maxZ-bounds.minZ;
 const direct=Math.min((box.maxX-box.minX)/w,(box.maxZ-box.minZ)/d),turned=Math.min((box.maxX-box.minX)/d,(box.maxZ-box.minZ)/w);
 const angle=baseAngle+(turned>direct?Math.PI/2:0),cos=Math.cos(angle),sin=Math.sin(angle),cx=(bounds.minX+bounds.maxX)/2,cz=(bounds.minZ+bounds.maxZ)/2;
 const site=cS(building.footprint)||building;
 let scale=Math.min(1.6,Math.max(direct,turned));
 const point=([x,z],y=0)=>({x:site.x+cos*(x-cx)*scale+sin*(z-cz)*scale,y:building.y+y,z:site.z-sin*(x-cx)*scale+cos*(z-cz)*scale});
 const source=pcRebuiltSupportedBands(design)[0].plans;
 const fits=value=>{scale=value;const paths=ve(source.flatMap(p=>Te(p.outer.map(v=>point([v.x,v.z])))));return sn(je(paths,Te(building.footprint)))<.002;};
 let low=0,high=scale;if(fits(high))low=high;else for(let i=0;i<20;i++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid;}scale=low;
 return {angle,scale,point,localX:(x,z)=>((x-site.x)*cos-(z-site.z)*sin)/scale+cx};
}
function pcRebuiltWalls(lower,upper,y0,y1,floorHeight,bayWidth,curved=false,originY=0,inward=false){
 const positions=[],uv=[],normals=[],sign=(Math.sign(lower.reduce((s,p,i)=>s+p.x*lower[(i+1)%lower.length].z-lower[(i+1)%lower.length].x*p.z,0))||1)*(inward?-1:1);
 let distance=0;
 for(let i=0;i<lower.length;i++){
  const j=(i+1)%lower.length,a=lower[i],b=lower[j],c=upper[i],d=upper[j],length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.001)continue;
  const out=[sign*(b.z-a.z)/length,0,-sign*(b.x-a.x)/length],nAt=k=>{if(!curved)return out;const p=lower[(k+lower.length-1)%lower.length],q=lower[(k+1)%lower.length],len=Math.hypot(q.x-p.x,q.z-p.z);return [sign*(q.z-p.z)/len,0,-sign*(q.x-p.x)/len];};
  const points=[[a.x,y0,a.z],[c.x,y1,c.z],[b.x,y0,b.z],[d.x,y1,d.z]],u0=distance/bayWidth/8,u1=(distance+length)/bayWidth/8,coords=[[u0,(y0-originY)/floorHeight/8],[u0,(y1-originY)/floorHeight/8],[u1,(y0-originY)/floorHeight/8],[u1,(y1-originY)/floorHeight/8]],order=sign>0?[0,1,2,2,1,3]:[0,2,1,2,3,1];
  for(const k of order){positions.push(...points[k]);uv.push(...coords[k]);normals.push(...nAt(k<2?i:j));}distance+=length;
 }
 const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(uv,2));geometry.setAttribute('normal',new pe(normals,3));return geometry;
}
function pcRebuiltCap(paths,y,down=false){
 const position=[],uv=[];
 for(const part of xn(paths)){
  const shape=new As(part.outer.map(p=>new Ft(p.x,-p.z)));for(const hole of part.holes)shape.holes.push(new As(hole.map(p=>new Ft(p.x,-p.z))));
  const mesh=new Oh(shape,{depth:.05,bevelEnabled:false,steps:1,curveSegments:1});mesh.rotateX(-Math.PI/2);
  const p=mesh.attributes.position,n=mesh.attributes.normal;
  for(let face=0;face<p.count;face+=3)if(n.getY(face)>.5)for(const k of down?[0,2,1]:[0,1,2]){const index=face+k,x=p.getX(index),z=p.getZ(index);position.push(x,typeof y==='function'?y(x,z):y,z);uv.push(x/8,z/8);}
  mesh.dispose();
 }
 const geometry=new Ce;geometry.setAttribute('position',new pe(position,3));geometry.setAttribute('uv',new pe(uv,2));geometry.computeVertexNormals();return geometry;
}
function pcRebuiltPlanarUV(geometry){const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;for(let face=0;face<p.count;face+=3){const nx=Math.abs(n.getX(face)),ny=Math.abs(n.getY(face)),nz=Math.abs(n.getZ(face));for(let k=0;k<3;k++){const i=face+k;uv.setXY(i,ny>=nx&&ny>=nz?p.getX(i)/8:nx>nz?p.getZ(i)/8:p.getX(i)/8,ny>=nx&&ny>=nz?p.getZ(i)/8:p.getY(i)/8);}}return geometry;}
function pcRebuiltRoofMesh(ring,base,height,kind,centre){
 if(ring.length===4&&/barrel|gable/.test(kind)){
  const a=ring[0],b=ring[1],d=ring[3],w=Math.hypot(b.x-a.x,b.z-a.z),depth=Math.hypot(d.x-a.x,d.z-a.z),along=w>=depth?{x:(b.x-a.x)/w,z:(b.z-a.z)/w}:{x:(d.x-a.x)/depth,z:(d.z-a.z)/depth},across={x:-along.z,z:along.x},long=Math.max(w,depth),short=Math.min(w,depth),positions=[],uv=[];
  const roofCentre={x:(ring[0].x+ring[2].x)/2,z:(ring[0].z+ring[2].z)/2};
  const point=(end,x,y)=>({x:roofCentre.x+along.x*end+across.x*x,y:base+y,z:roofCentre.z+along.z*end+across.z*x});
  const add=(a,b,c,out)=>{const ab={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},ac={x:c.x-a.x,y:c.y-a.y,z:c.z-a.z},dot=(ab.y*ac.z-ab.z*ac.y)*out.x+(ab.z*ac.x-ab.x*ac.z)*out.y+(ab.x*ac.y-ab.y*ac.x)*out.z;for(const p of dot>=0?[a,b,c]:[a,c,b]){positions.push(p.x,p.y,p.z);uv.push(p.x/6,p.z/6);}};
  const segments=kind.includes('barrel')?32:2;
  for(let i=0;i<segments;i++){
   const t=i*Math.PI/segments,s=(i+1)*Math.PI/segments,p=point(-long/2,Math.cos(t)*short/2,Math.sin(t)*height),q=point(-long/2,Math.cos(s)*short/2,Math.sin(s)*height),r=point(long/2,Math.cos(t)*short/2,Math.sin(t)*height),u=point(long/2,Math.cos(s)*short/2,Math.sin(s)*height);
   add(p,q,r,{x:0,y:1,z:0});add(q,u,r,{x:0,y:1,z:0});
   add(point(-long/2,0,0),q,p,{x:-along.x,y:0,z:-along.z});add(point(long/2,0,0),r,u,{x:along.x,y:0,z:along.z});
  }
  const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(uv,2));geometry.computeVertexNormals();return pcRebuiltPlanarUV(geometry);
 }
 const positions=[],uv=[],sign=Math.sign(ring.reduce((s,p,i)=>s+p.x*ring[(i+1)%ring.length].z-ring[(i+1)%ring.length].x*p.z,0))||1;
 const add=(a,b,c)=>{for(const p of sign>0?[a,c,b]:[a,b,c]){positions.push(p.x,p.y,p.z);uv.push(p.x/8,p.z/8);}};
 const shrink=(p,s,y)=>({x:centre.x+(p.x-centre.x)*s,z:centre.z+(p.z-centre.z)*s,y});
 let previous=ring.map(p=>({...p,y:base}));
 const rows=/barrel|sail/.test(kind)?12:1;
 for(let row=1;row<=rows;row++){
  const t=row/rows,scale=/mansard|theatre/.test(kind)?.78:/barrel|sail/.test(kind)?Math.cos(t*Math.PI/2):0,current=ring.map(p=>shrink(p,scale,base+Math.sin(t*Math.PI/2)*height));
  for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length;add(previous[i],previous[j],current[i]);if(scale>1e-5)add(previous[j],current[j],current[i]);}previous=current;
 }
 if(/mansard|theatre/.test(kind))for(let i=0;i<previous.length;i++)add(previous[i],previous[(i+1)%previous.length],{...centre,y:base+height});
 const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(uv,2));geometry.computeVertexNormals();return pcRebuiltPlanarUV(geometry);
}
function pcRebuiltDome(point,radius,height,material,id,B){
 const positions=[],uv=[],add=(a,b,c)=>{for(const p of [a,b,c]){positions.push(...p);uv.push(p[0]/4,p[2]/4);}};
 const p=(row,column)=>{const a=column*Math.PI/12,t=row*Math.PI/16;return [point.x+Math.cos(a)*Math.cos(t)*radius,point.y+Math.sin(t)*height,point.z+Math.sin(a)*Math.cos(t)*radius];};
 for(let row=0;row<8;row++)for(let column=0;column<24;column++){add(p(row,column),p(row+1,column),p(row,column+1));if(row<7)add(p(row,column+1),p(row+1,column),p(row+1,column+1));}
 const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(uv,2));geometry.computeVertexNormals();B(geometry,material,id);
}
function pcRebuiltRender(building,B,U,statistics){
 const design=pcSC4Model(building.office.catalogueId);if(!design)return false;
 const materials=pcRebuiltMaterials(design),transform=pcRebuiltTransform(building,design),point=transform.point,id=building.id;
 const bandPaths=new Map,podiumHeight=Math.min(design.bodyHeight,design.floorHeight*2);
 const bands=pcRebuiltSupportedBands(design).filter(b=>b.top>podiumHeight).map(band=>{
  const holes=new Set,roofs=[];
  const parts=band.plans.flatMap(plan=>[plan.outer,...plan.holes].map((r,i)=>{const ring=r.map(p=>point([p.x,p.z]));if(i)holes.add(ring);else roofs.push(ring);return ring;}));
  const shape=ve(band.plans.flatMap(plan=>je(Te(plan.outer.map(p=>point([p.x,p.z]))),ve(plan.holes.flatMap(h=>Te(h.map(p=>point([p.x,p.z]))))))));bandPaths.set(parts,shape);
  return {y:Math.max(band.y,podiumHeight),top:band.top,parts,upper:parts,holes,roofs};
 });
 // The occupied footprint is the lot itself: an actual textured street wall,
 // rather than a large paved slab surrounding a small freestanding model.
 bands.unshift({y:0,top:podiumHeight,parts:[building.footprint],upper:[building.footprint]});
 const paths=parts=>bandPaths.get(parts)||ve(parts.flatMap(Te)),addCap=(shape,y,material=materials.roof,down=false)=>{if(!shape.length)return;const geometry=pcRebuiltCap(shape,y,down);if(geometry.attributes.position.count)B(geometry,material,id);else geometry.dispose();};
 const foundation=pcRebuiltSolid('foundation','#9a9a8d',.97);
 B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18,{top:false}),foundation,id);
 addCap(je(Te(building.footprint),paths(bands[0].parts)),building.y,foundation);
 for(let index=0;index<bands.length;index++){
  const band=bands[index],next=bands[index+1];
  for(let p=0;p<band.parts.length;p++){
   const ring=band.parts[p],upper=band.upper[p],curved=['oval','oval-core','bow','round-front','round-corner','showroom'].includes(design.shape)&&ring.length>15;
   B(pcRebuiltWalls(ring,upper,building.y+band.y,building.y+band.top,design.floorHeight,design.bayWidth,curved,building.y,band.holes?.has(ring)),materials.facade,id);
   const sign=Math.sign(ring.reduce((s,p,i)=>s+p.x*ring[(i+1)%ring.length].z-ring[(i+1)%ring.length].x*p.z,0))||1;
   for(let edge=0;edge<ring.length;edge++){
    const a=ring[edge],b=ring[(edge+1)%ring.length],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);if(length<.6)continue;
    const yaw=Math.atan2(-dz,dx),out={x:sign*dz/length,z:-sign*dx/length},at=(t,y,offset=.1)=>({x:a.x+dx*t+out.x*offset,z:a.z+dz*t+out.z*offset,y});
    const floors=Math.max(1,Math.round((band.top-band.y)/design.floorHeight));statistics.windows+=Math.round(length/design.bayWidth)*floors;
    // Cornices and pilasters are actual geometry and receive the same sunlight.
    U(at(.5,building.y+band.top-.11,-.13),length,.22,.25,yaw,materials.trim,id);
    if(design.style==='art-deco'&&length>5&&!curved){const bays=Math.min(14,Math.max(2,Math.round(length/design.bayWidth)));for(let bay=0;bay<=bays;bay++)U(at(bay/bays,building.y+(band.y+band.top)/2),.16,band.top-band.y,.24,yaw,materials.trim,id);}
    if(design.facade==='ribbon'&&length>4)for(let y=band.y+design.floorHeight;y<band.top-.2;y+=design.floorHeight)U(at(.5,building.y+y,0),length,.15,.22,yaw,materials.stone,id);
   }
  }
  if(next){addCap(je(paths(band.upper),paths(next.parts)),building.y+band.top);addCap(je(paths(next.parts),paths(band.upper)),building.y+band.top,materials.stone,true);}
 }
 const roofBox=(position,w,h,d,yaw,material,id)=>{const box=new mn(w,h,d);box.rotateY(yaw);box.translate(position.x,position.y,position.z);const geometry=box.toNonIndexed();box.dispose();B(geometry,material,id);};
 const top=bands.at(-1),roofY=building.y+design.bodyHeight,roofTop=building.y+design.height;
 for(const ring of top.roofs||top.upper){
  const centre=cS(ring);if(!centre)continue;const box=En(ring),clearance=Math.max(.25,centre.clearance),roof=design.roof;
  if(roof==='angled'){
   const min=Math.min(...ring.map(p=>transform.localX(p.x,p.z))),max=Math.max(...ring.map(p=>transform.localX(p.x,p.z))),plane=(x,z)=>roofY+.2+(max-transform.localX(x,z))/Math.max(.01,max-min)*(design.roofHeight-.2);
   const positions=[],uv=[];let edgeStart,edgeDirection;const add=(a,b,c)=>{for(const p of [a,b,c]){positions.push(p.x,p.y,p.z);uv.push(((p.x-edgeStart.x)*edgeDirection.x+(p.z-edgeStart.z)*edgeDirection.z)/design.bayWidth/8,(p.y-building.y)/design.floorHeight/8);}};const sign=Math.sign(ring.reduce((s,p,i)=>s+p.x*ring[(i+1)%ring.length].z-ring[(i+1)%ring.length].x*p.z,0));
   for(let i=0;i<ring.length;i++){const a={...ring[i],y:roofY},b={...ring[(i+1)%ring.length],y:roofY},c={...a,y:plane(a.x,a.z)},d={...b,y:plane(b.x,b.z)},length=Math.hypot(b.x-a.x,b.z-a.z);edgeStart=a;edgeDirection={x:(b.x-a.x)/length,z:(b.z-a.z)/length};if(sign>0){add(a,c,b);add(b,c,d);}else{add(a,b,c);add(b,d,c);}}
   const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(uv,2));geometry.computeVertexNormals();B(geometry,materials.facade,id);addCap(Te(ring),plane);
   addCap(je(Te(ring),Bo(Te(ring),-.65)),(x,z)=>plane(x,z)+.08,materials.trim);
   roofBox({...centre,y:plane(centre.x,centre.z)+1},Math.min(4,clearance*.5),2,Math.min(6,clearance*.65),transform.angle,materials.metal,id);
   for(const side of [-1,1]){const radius=Math.min(.7,clearance*.1),offset=side*Math.min(1.1,clearance*.15),fan=new Dn(radius,radius,.35,12);fan.translate(centre.x+Math.cos(transform.angle)*offset,plane(centre.x,centre.z)+2.175,centre.z-Math.sin(transform.angle)*offset);const mesh=fan.toNonIndexed();fan.dispose();B(mesh,materials.dark,id);}continue;
  }
  if(/gable|hip|mansard|barrel|sail|theatre/.test(roof)){
   const mat=/barrel/.test(roof)?pcRebuiltSolid('barrel-glass','#7fafa8',.3,.2):/green|teal|theatre/.test(roof)?materials.copper:/red/.test(roof)?pcRebuiltSolid('red-roof','#87584c',.8):materials.roof;
   B(pcRebuiltRoofMesh(ring,roofY,design.roofHeight*(roof==='theatre-copper'?.6:1),roof,centre),mat,id);
   if(roof.includes('barrel')&&ring.length===4){
    const a=ring[0],b=ring[1],d=ring[3],w=Math.hypot(b.x-a.x,b.z-a.z),depth=Math.hypot(d.x-a.x,d.z-a.z),long=Math.max(w,depth),short=Math.min(w,depth),along=w>=depth?{x:(b.x-a.x)/w,z:(b.z-a.z)/w}:{x:(d.x-a.x)/depth,z:(d.z-a.z)/depth},across={x:-along.z,z:along.x},middle={x:(ring[0].x+ring[2].x)/2,z:(ring[0].z+ring[2].z)/2};
    const at=(station,t)=>({x:middle.x+along.x*long*station+across.x*Math.cos(t)*short/2,y:roofY+Math.sin(t)*design.roofHeight+.06,z:middle.z+along.z*long*station+across.z*Math.cos(t)*short/2});
    for(const station of [-.5,0,.5])for(let i=0;i<12;i++){const a=at(station,i*Math.PI/12),b=at(station,(i+1)*Math.PI/12),length=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z),bar=new Dn(.07,.07,length,6);bar.rotateX(Math.acos((b.y-a.y)/length));bar.rotateY(Math.atan2(b.x-a.x,b.z-a.z));bar.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);const mesh=bar.toNonIndexed();bar.dispose();B(mesh,materials.trim,id);}
    for(let i=1;i<6;i++)roofBox(at(0,i*Math.PI/6),long,.1,.1,Math.atan2(-along.z,along.x),materials.trim,id);
    if(design.id===422){const frame=pcRebuiltSolid('trottier-frame','#d7ded6',.7),base=design.bands[1]?.y||0,yaw=Math.atan2(-across.z,across.x);for(const end of [-1,1]){const edge={x:middle.x+along.x*(long/2+.18)*end,z:middle.z+along.z*(long/2+.18)*end};for(const side of [-1,1])roofBox({x:edge.x+across.x*(short/2-.6)*side,z:edge.z+across.z*(short/2-.6)*side,y:building.y+(base+design.bodyHeight)/2},1.2,design.bodyHeight-base,.4,yaw,frame,id);for(let y=base+design.floorHeight;y<design.bodyHeight;y+=design.floorHeight)roofBox({...edge,y:building.y+y},short-1.2,.16,.45,yaw,frame,id);}}
   }
   if(roof==='theatre-copper')for(const side of [-1,1])pcRebuiltDome({x:centre.x+side*Math.min(8,(box.maxX-box.minX)*.27),y:roofY+design.roofHeight*.52,z:centre.z},Math.min(2.8,clearance*.35),design.roofHeight*.48,materials.copper,id,B);
   continue;
  }
  addCap(Ee(Te(ring),paths(top.upper)),roofY);
  if(roof==='deco-platform'){
   let y=roofY;for(const [nominal,fraction] of [[16,.31],[12,.22],[9,.10]]){const width=Math.min(nominal,clearance*1.3*nominal/16),h=design.roofHeight*fraction,rectangle=[[-width/2,-width/2],[width/2,-width/2],[width/2,width/2],[-width/2,width/2]].map(([x,z])=>({x:centre.x+Math.cos(transform.angle)*x+Math.sin(transform.angle)*z,z:centre.z-Math.sin(transform.angle)*x+Math.cos(transform.angle)*z}));B(Ql(rectangle,y,h,{bottom:false}),materials.stone,id);y+=h;}
   const mast=new Dn(.1,.16,roofTop-y,8);mast.translate(centre.x,y+(roofTop-y)/2,centre.z);const geometry=mast.toNonIndexed();mast.dispose();B(geometry,materials.metal,id);continue;
  }
  if(roof.includes('domes')){for(const side of [-1,1])pcRebuiltDome({x:centre.x+side*clearance*.45,y:roofY,z:centre.z},clearance*.32,design.roofHeight,roof.includes('copper')?materials.copper:pcRebuiltSolid('gold','#b89952',.42,.3),id,B);continue;}
  if(['gothic','dark-crown','portal','notch','pediment'].includes(roof)){
   const w=Math.min(clearance*1.2,12),h=design.roofHeight;
   roofBox({...centre,y:roofY+h*.2},w,h*.4,w*.72,transform.angle,roof==='dark-crown'?materials.dark:materials.stone,id);
   if(['portal','notch'].includes(roof)){for(const side of [-1,1])roofBox({x:centre.x+Math.cos(transform.angle)*side*w*.36,z:centre.z-Math.sin(transform.angle)*side*w*.36,y:roofY+h*.7},w*.18,h*.6,w*.5,transform.angle,materials.trim,id);roofBox({...centre,y:roofTop-.25},w,.5,w*.5,transform.angle,materials.trim,id);}
   else {const cone=new Dn(0,w*.24,h*.6,4);cone.rotateY(transform.angle+Math.PI/4);cone.translate(centre.x,roofY+h*.7,centre.z);const geometry=cone.toNonIndexed();cone.dispose();B(geometry,roof==='dark-crown'?materials.dark:materials.trim,id);}
   if(roof==='gothic')for(const side of [-1,1])roofBox({x:centre.x+Math.cos(transform.angle)*side*w*.4,z:centre.z-Math.sin(transform.angle)*side*w*.4,y:roofY+h*.4},.25,h*.8,.25,transform.angle,materials.trim,id);
   continue;
  }
  const size=Math.min(4,clearance*.6),height=Math.min(design.roofHeight,2.5);
  if(size>.7){roofBox({...centre,y:roofY+height/2},size,height,size*.8,transform.angle,materials.metal,id);for(let slat=0;slat<4;slat++)roofBox({x:centre.x+Math.sin(transform.angle)*size*.405,z:centre.z+Math.cos(transform.angle)*size*.405,y:roofY+.15+slat*height*.2},size*.8,.06,.05,transform.angle,materials.dark,id);}
  if(['glass-pyramid','glasshouse','skylights','solar'].includes(roof)){
   const small=ring.map(p=>({x:centre.x+(p.x-centre.x)*.45,z:centre.z+(p.z-centre.z)*.45}));B(pcRebuiltRoofMesh(small,roofY,design.roofHeight,'hip',centre),materials.glass,id);
  }
 }
 // A recessed entry and canopy, sized for the building rather than for its lot.
 const base=bands[0].parts[0],front=base.reduce((best,p,i)=>{const q=base[(i+1)%base.length],mid={x:(p.x+q.x)/2,z:(p.z+q.z)/2},dot=(mid.x-building.x)*building.towardRoad.x+(mid.z-building.z)*building.towardRoad.z;return !best||dot>best.dot?{dot,mid,yaw:Math.atan2(p.z-q.z,q.x-p.x),length:Math.hypot(q.x-p.x,q.z-p.z)}:best;},null);
 if(front&&front.length>3){const door=Math.min(4,design.floorHeight*.8,podiumHeight-.4),width=Math.min(6,front.length*.65),yaw=front.yaw;U({...front.mid,y:building.y+door/2},width,door,.18,yaw,materials.glass,id);}
 return true;
}
function pcSC4Render(building,B,U,statistics){return pcRebuiltRender(building,B,U,statistics);}
