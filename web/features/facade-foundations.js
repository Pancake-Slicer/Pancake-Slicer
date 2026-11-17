// Host terrain adaptation only: source templates, bays and lot fitting stay immutable.
const pcFacadeSites=new WeakMap;
function pcFacadeRecord(b){return b.office?.lightweightLind||b.office?.lightweightBmo||b.office?.lightweightVon||null;}
function pcFacadeParts(b){
 const r=pcFacadeRecord(b);if(!r)return null;
 if(b.office.lightweightLind)return r.grid.volumes.filter(v=>v.start===0);
 if(b.office.lightweightVon)return r.grid.volumes.filter(v=>v.start===0).map(v=>({...v,x:0,z:0}));
 const s=r.parameters,p=s.podium;return [{x:0,z:0,width:p?.width||s.width,depth:p?.depth||s.depth,front:r.grid.podium?.front||r.grid.tower.front,side:r.grid.podium?.side||r.grid.tower.side}];
}
function pcFacadePlace(b,property,terrain){
 const r=pcFacadeRecord(b);if(!r){pcAutoFacadePlace(b,property,terrain);return;}
 const p=b.office.assetPlacement,s=r.parameters,bmo=!!b.office?.lightweightBmo,cos=Math.cos(p.angle),sin=Math.sin(p.angle);
 const point=(x,z)=>({x:p.x+x*cos+z*sin,z:p.z-x*sin+z*cos});
 const ground=(x,z)=>{const w=point(x,z),v=terrain?.heightAt(w.x,w.z);return Number.isFinite(v)?v:b.ground;};
 const front=b.office.lightweightLind?(s.podium?.depth/2||s.depth*.25):(s.podium?.depth||s.depth)/2;
 // The existing sidewalk surface uses ur (terrain+.24). Put the doorway just above it;
 // BMO already has its native .16m entrance threshold.
 const sill=bmo?.16:0,base=Math.max(ground(-2.2,front),ground(0,front),ground(2.2,front))+(bmo?ur-.04:ur+.06);
 b.y=base;b.entrance={...b.entrance,y:base};b.office.assetPlacement={...p,entrance:{...p.entrance,y:base}};
 const parts=pcFacadeParts(b),rect=v=>[{x:v.x-v.width/2,z:v.z-v.depth/2},{x:v.x+v.width/2,z:v.z-v.depth/2},{x:v.x+v.width/2,z:v.z+v.depth/2},{x:v.x-v.width/2,z:v.z+v.depth/2}];
 const rings=xn(ve(parts.flatMap(v=>Te(rect(v))))).map(v=>v.outer),samples=[];
 for(const ring of rings)for(let i=0;i<ring.length;i++){const a=ring[i],c=ring[(i+1)%ring.length],count=Math.max(1,Math.ceil(Math.hypot(c.x-a.x,c.z-a.z)/2));for(let j=0;j<count;j++){const x=a.x+(c.x-a.x)*j/count,z=a.z+(c.z-a.z)*j/count;samples.push([x,z,ground(x,z)]);}}
 pcFacadeSites.set(b,{terrain,terrainRevision:terrain?.revision||0,heightAt:terrain?.heightAt,parts,rings,point,ground,front,sill,base,terrainMin:Math.min(...samples.map(p=>p[2])),terrainMax:Math.max(...samples.map(p=>p[2])),signature:JSON.stringify([base,samples])});
}
function pcFacadeStamp(b){return pcFacadeSites.get(b)?.signature||'';}
function pcFacadeMaterials(b,runtime,r){
 if(runtime.foundationMaterials)return runtime.foundationMaterials;
 if(b.office.lightweightLind)return runtime.materials.sets[r.visual.tone];
 if(b.office.lightweightVon)return runtime.generator.materials;
 const i=pcBmoMaterialReviewMode==='original'?-1:runtime.materials.index(r);return i<0?runtime.generator.materials:runtime.materials.sets[i];
}
function pcFacadeAttach(b,model,runtime,r){
 const site=pcFacadeSites.get(b);if(!site)return model;
 const mats=pcFacadeMaterials(b,runtime,r),bmo=!!b.office?.lightweightBmo,body=bmo?'silver':'stone',pier=bmo?'silver':'trim',buckets=new Map,doorX=site.doorX||0,doorHalf=site.doorHalfWidth||2.15,left=doorX-doorHalf,right=doorX+doorHalf;
 const audit={family:r.template.id,base:b.y,entranceGrade:site.ground(0,site.front),terrainMin:site.terrainMin,terrainMax:site.terrainMax,threshold:b.y+site.sill,parts:site.parts.length,steps:0,triangles:0};
 function append(key,g){
  if(!buckets.has(key))buckets.set(key,{position:[],normal:[],uv:[]});const bucket=buckets.get(key),plain=g.index?g.toNonIndexed():g;
  for(const name of ['position','normal','uv']){const a=plain.attributes[name];for(const value of a.array)bucket[name].push(value);}
  if(plain!==g)plain.dispose();g.dispose();
 }
 // Same extruder, terrain samples, support depth and native axes as the game.
 // No top slab: only walls under the actual ground-floor perimeter.
 function skirt(key,ring,{offset=0,band=false,portal=false}={}){
  const outlines=offset?xn(Bo(Te(ring),offset)).map(p=>p.outer):[ring];
  for(const outline of outlines){
   const points=[];for(let i=0;i<outline.length;i++){
    const a=outline[i],c=outline[(i+1)%outline.length],count=Math.max(1,Math.ceil(Math.hypot(c.x-a.x,c.z-a.z)/2)),ts=[];
    for(let j=0;j<count;j++)ts.push(j/count);
    // Exact doorway edges keep the solid band below the door, not across it.
    if(portal&&Math.abs(a.z-c.z)<1e-5&&Math.abs(a.z-site.front-offset)<.02)for(const x of [left,right]){const t=(x-a.x)/(c.x-a.x);if(t>0&&t<1)ts.push(t);}
    for(const t of [...new Set(ts)].sort((a,b)=>a-b))points.push({x:a.x+(c.x-a.x)*t,z:a.z+(c.z-a.z)*t});
   }
   const low=Math.min(...points.map(p=>site.ground(p.x,p.z)-b.y))-.18,g=Ql(points,low,Math.max(.02,.42-low),{top:false,bottom:false}),a=g.attributes.position;
   for(let i=0;i<a.count;i++){
    const x=a.getX(i),z=a.getZ(i),h=site.ground(x,z)-b.y,isTop=a.getY(i)>low+.01,face=i-i%3,mx=(a.getX(face)+a.getX(face+1)+a.getX(face+2))/3,mz=(a.getZ(face)+a.getZ(face+1)+a.getZ(face+2))/3;
    let top=band?Math.max(.42,h+ur+.22):0;
    if(portal&&mx>left+.00001&&mx<right-.00001&&mz>=site.front-.001&&mz<=site.front+offset+.026)top=0;
    a.setY(i,isTop?top:Math.min(h-.18,top-.02));
   }
   g.computeVertexNormals();const normal=g.attributes.normal,uv=g.attributes.uv;
   for(let i=0;i<a.count;i++)uv.setXY(i,(-a.getX(i)*normal.getZ(i)+a.getZ(i)*normal.getX(i))/1.5,a.getY(i)/3.7);
   append(key,g);
   // Seal the narrow lip at the same edge stations as its supporting wall.
   // This prevents a long flat cap from bridging a change in terrain height.
   if(band&&offset){
    const bucket=buckets.get(key),project=p=>{let best,dist=Infinity;for(let j=0;j<ring.length;j++){const a=ring[j],c=ring[(j+1)%ring.length],dx=c.x-a.x,dz=c.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz))),q={x:a.x+t*dx,z:a.z+t*dz},d=Math.hypot(p.x-q.x,p.z-q.z);if(d<dist){dist=d;best=q;}}return best;};
    const vertex=p=>[p.x,Math.max(.42,site.ground(p.x,p.z)-b.y+ur+.22),p.z];
    for(let j=0;j<points.length;j++){
     const a=points[j],c=points[(j+1)%points.length],mx=(a.x+c.x)/2,mz=(a.z+c.z)/2;
     if(portal&&mx>left+.00001&&mx<right-.00001&&mz>=site.front-.001&&mz<=site.front+offset+.026)continue;
     const av=vertex(a),cv=vertex(c),ai=vertex(project(a)),ci=vertex(project(c));
     for(const triangle of [[av,ai,ci],[av,ci,cv]]){
      const [u,v,w]=triangle;if(Math.abs((v[0]-u[0])*(w[2]-u[2])-(v[2]-u[2])*(w[0]-u[0]))<1e-8)continue;const ab=v.map((n,k)=>n-u[k]),ac=w.map((n,k)=>n-u[k]),normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],length=Math.hypot(...normal);if(length<1e-8)continue;if(normal[1]<0){triangle.reverse();for(let k=0;k<3;k++)normal[k]*=-1;}
      for(const p of triangle){bucket.position.push(...p);bucket.normal.push(...normal.map(v=>v/length));bucket.uv.push(p[0]/1.5,p[2]/3.7);}
     }
    }
   }
  }
 }
 for(const ring of site.rings)skirt(body,ring,{offset:bmo?.14:.04,band:true,portal:true});
 function rectangle(key,x,z,w,d){
  if(!buckets.has(key))buckets.set(key,{position:[],normal:[],uv:[]});const bucket=buckets.get(key),ring=[{x:x-w/2,z:z-d/2},{x:x+w/2,z:z-d/2},{x:x+w/2,z:z+d/2},{x:x-w/2,z:z+d/2}];
  // Four repeated pier strips; no temporary extrusions or per-pier meshes.
  for(let i=0;i<4;i++){const a=ring[i],c=ring[(i+1)%4],dx=c.x-a.x,dz=c.z-a.z,length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length,ay=Math.min(site.ground(a.x,a.z)-b.y-.18,-.02),cy=Math.min(site.ground(c.x,c.z)-b.y-.18,-.02);
   for(const [v,y]of [[a,ay],[a,0],[c,0],[a,ay],[c,0],[c,cy]]){bucket.position.push(v.x,y,v.z);bucket.normal.push(nx,0,nz);bucket.uv.push((-v.x*nz+v.z*nx)/1.5,y/3.7);}
  }
 }
 for(const v of site.parts){
  const faces=[{n:[0,1],u:[1,0],off:v.depth/2,g:v.front},{n:[1,0],u:[0,-1],off:v.width/2,g:v.side},{n:[0,-1],u:[-1,0],off:v.depth/2,g:v.front},{n:[-1,0],u:[0,1],off:v.width/2,g:v.side}];
  for(const {n,u,off,g}of faces)for(let i=0;i<=g.count;i++){
   if(bmo&&i%3!==0)continue;
   const t=-g.clear/2+i*g.pitch,w=bmo?.34:b.office.lightweightLind?Math.min(1.22,g.pitch-2.05):.62,d=bmo?.27:b.office.lightweightLind?.42:.5,o=bmo?.01:b.office.lightweightLind?.17:.21;
   rectangle(pier,v.x+u[0]*t+n[0]*(off+o),v.z+u[1]*t+n[1]*(off+o),n[0]?d:w,n[0]?w:d);
  }
  if(bmo)for(const sx of [-1,1])for(const sz of [-1,1])rectangle('corner',sx*(v.width/2-r.parameters.cornerWidth/2),sz*(v.depth/2-r.parameters.cornerWidth/2),r.parameters.cornerWidth,r.parameters.cornerWidth);
 }
 // A narrow door transition stays inside the already fitted native envelope.
 const stepHalf=site.stepHalfWidth||1.4,start=site.front+(bmo?.425:.09),end=site.front+(bmo?.58:.82),outer=site.ground(doorX,end)+ur,threshold=b.y+site.sill,rise=threshold-outer;
 if(rise>.025){
  const count=Math.max(1,Math.ceil(rise/.18));audit.steps=count;
  for(let i=0;i<count;i++){
   const z0=start+(end-start)*i/count,z1=start+(end-start)*(i+1)/count,top=threshold-rise*i/count,ring=[{x:doorX-stepHalf,z:z0},{x:doorX+stepHalf,z:z0},{x:doorX+stepHalf,z:z1},{x:doorX-stepHalf,z:z1}],bottom=Math.min(...ring.map(p=>site.ground(p.x,p.z)))-.18;
   append(body,Ql(ring,bottom-b.y,Math.max(.02,top-bottom),{bottom:false}));
  }
 }
 for(const [key,values]of buckets){
  const geometry=new Ce;for(const name of ['position','normal','uv'])geometry.setAttribute(name,new pe(values[name],name==='uv'?2:3));
  geometry.computeBoundingBox();geometry.computeBoundingSphere();const mesh=new ae(geometry,mats[key]);mesh.name=key;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.pcFacadeOwned=true;model.add(mesh);audit.triangles+=values.position.length/9;
 }
 model.userData.facadeFoundation=audit;return model;
}
function pcFacadeRelease(model){for(const mesh of [...model.children])if(mesh.userData.pcFacadeOwned){mesh.geometry.dispose();model.remove(mesh);}}
