// Convex polygon intersection in roof X/Z coordinates (independent test audit).
// 1e-4 m2 area tolerance allows Float32 intersection rounding on long thin
// caps; source defects overlap by up to 0.038 m2, not numerical slivers.
function area(poly){return Math.abs(poly.reduce((n,p,i)=>{const q=poly[(i+1)%poly.length];return n+p.x*q.z-q.x*p.z;},0))/2;}
function intersection(subject,clip){
 const winding=Math.sign(clip.reduce((n,p,i)=>{const q=clip[(i+1)%clip.length];return n+p.x*q.z-q.x*p.z;},0));
 for(let i=0;i<clip.length&&subject.length;i++){
  const a=clip[i],b=clip[(i+1)%clip.length],distance=p=>winding*((b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x)),next=[];
  for(let j=0;j<subject.length;j++){const p=subject[j],q=subject[(j+1)%subject.length],dp=distance(p),dq=distance(q);if(dp>=0)next.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);next.push({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t});}}subject=next;
 }return area(subject);
}
function roofConflicts(model){
 const planes=new Map,conflicts=[];
 for(const mesh of model.children.filter(m=>m.name.startsWith('retained-roof:'))){const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<g.index.count;i+=3){const ids=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];if(!ids.every(j=>n.getY(j)>.99&&Math.abs(p.getY(j)-p.getY(ids[0]))<.00001))continue;const y=p.getY(ids[0]).toFixed(4),tri=ids.map(j=>({x:p.getX(j),z:p.getZ(j)})),previous=planes.get(y)||[];for(const old of previous){const overlap=intersection(tri,old.tri);if(overlap>.0001)conflicts.push({y,first:old.mesh,second:mesh.name,area:overlap});}previous.push({mesh:mesh.name,tri});planes.set(y,previous);}}
  return conflicts;
}
module.exports={roofConflicts};
