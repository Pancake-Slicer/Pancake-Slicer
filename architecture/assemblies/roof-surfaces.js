// Resolve coincident top surfaces in retained roof trim without depth bias,
// changing its silhouette, or modifying the baseline meshes/materials.
import * as T from '../engine.js';
const signedArea=poly=>poly.reduce((n,p,i)=>{const q=poly[(i+1)%poly.length];return n+p.x*q.z-q.x*p.z;},0)/2;
function cut(poly,a,b,winding,inside){
 const distance=p=>winding*((b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x)),out=[];
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],dp=distance(p),dq=distance(q),keep=d=>inside?d>=0:d<=0;
  if(keep(dp))out.push(p);
  if(keep(dp)!==keep(dq)){const t=dp/(dp-dq),v={};for(const key of Object.keys(p))v[key]=p[key]+(q[key]-p[key])*t;out.push(v);}
 }return out;
}
function subtract(poly,triangle){
 const winding=Math.sign(signedArea(triangle)),pieces=[];let inside=poly;
 for(let i=0;i<3&&inside.length;i++){
  const a=triangle[i],b=triangle[(i+1)%3],outside=cut(inside,a,b,winding,false);
  if(Math.abs(signedArea(outside))>1e-10)pieces.push(outside);
  inside=cut(inside,a,b,winding,true);
 }
 // Shared edges have no area and must not introduce unnecessary splits.
 return Math.abs(signedArea(inside))>1e-10?pieces:[poly];
}
function bounds(poly){return {x0:Math.min(...poly.map(v=>v.x)),x1:Math.max(...poly.map(v=>v.x)),z0:Math.min(...poly.map(v=>v.z)),z1:Math.max(...poly.map(v=>v.z))};}
const overlaps=(a,b)=>Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>1e-8&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>1e-8;

export function resolveRoofOverlaps(group){
 const planes=new Map;let trimmed=0,removedArea=0;
 for(const mesh of group.children){
  const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,triangles=[];let changed=false;
  for(let i=0;i<g.index.count;i+=3){
   const ids=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)],tri=ids.map(j=>({x:p.getX(j),y:p.getY(j),z:p.getZ(j),u:uv.getX(j),v:uv.getY(j),nx:n.getX(j),ny:n.getY(j),nz:n.getZ(j)}));
   if(!tri.every(v=>v.ny>.99&&Math.abs(v.y-tri[0].y)<1e-6)){triangles.push(tri);continue;}
   const plane=tri[0].y.toFixed(5),previous=planes.get(plane)||[],box=bounds(tri);let parts=[tri];
   for(const old of previous){if(!overlaps(box,old.bounds))continue;parts=parts.flatMap(poly=>subtract(poly,old.tri));if(!parts.length)break;}
   const lost=Math.abs(signedArea(tri))-parts.reduce((total,poly)=>total+Math.abs(signedArea(poly)),0);
   if(lost>1e-10){changed=true;trimmed++;removedArea+=lost;}
   for(const poly of parts)for(let j=1;j<poly.length-1;j++)if(Math.abs(signedArea([poly[0],poly[j],poly[j+1]]))>1e-10)triangles.push([poly[0],poly[j],poly[j+1]]);
   previous.push({tri,bounds:box});planes.set(plane,previous);
  }
  if(!changed)continue;
  const positions=[],normals=[],uvs=[];
  for(const tri of triangles)for(const v of tri){positions.push(v.x,v.y,v.z);normals.push(v.nx,v.ny,v.nz);uvs.push(v.u,v.v);}
  const geometry=new T.BufferGeometry;geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(Array.from({length:positions.length/3},(_,i)=>i));geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.geometry=geometry;g.dispose();
 }
 group.userData.roofSurfaceRepair={trimmedSourceTriangles:trimmed,removedDuplicateArea:removedArea};return group;
}
