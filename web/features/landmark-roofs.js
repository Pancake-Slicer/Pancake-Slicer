// Give each exposed horizontal roof patch one owner. Coincident upward caps
// from intersecting authored boxes otherwise fight in the depth buffer and
// reveal their triangulation as diagonal seams. Keep walls, roofs and props.
function pcCleanLandmarkCaps(model,minHeight=180){
 model.updateMatrixWorld(true);const groups=new Map,meshes=[],changes=new Map;let removedArea=0;
 model.traverse(mesh=>{
  if(!mesh.isMesh||mesh.userData.celInk||Array.isArray(mesh.material))return;
  const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry,p=geometry.attributes.position;
  const entry={mesh,geometry,temporary:geometry!==mesh.geometry};meshes.push(entry);
  for(let face=0;face<p.count;face+=3){
   const points=[0,1,2].map(k=>new q().fromBufferAttribute(p,face+k).applyMatrix4(mesh.matrixWorld));
   const normal=new q().subVectors(points[1],points[0]).cross(new q().subVectors(points[2],points[0]));
   if(normal.y<=.000001||points[0].y<minHeight||Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))>.00002)continue;
   const key=points[0].y.toFixed(4),record={entry,face,points,paths:Te(points)};
   if(!groups.has(key))groups.set(key,[]);groups.get(key).push(record);
  }
 });
 for(const records of groups.values()){
  let covered=[];
  for(const record of records.reverse()){
   const area=sn(record.paths),remaining=covered.length?je(record.paths,covered):record.paths,removed=area-sn(remaining);
   if(removed>.00001){if(!changes.has(record.entry))changes.set(record.entry,new Map);changes.get(record.entry).set(record.face,{record,remaining});removedArea+=removed;}
   covered=ve([...covered,...record.paths]);
  }
 }
 for(const entry of meshes){
  const edits=changes.get(entry);if(!edits){if(entry.temporary)entry.geometry.dispose();continue;}
  const attributes=entry.geometry.attributes,data=Object.fromEntries(Object.keys(attributes).map(key=>[key,[]]));
  const append=(face,weights)=>{for(const [key,attribute] of Object.entries(attributes))for(let component=0;component<attribute.itemSize;component++)data[key].push(weights.reduce((sum,w,k)=>sum+w*attribute.array[(face+k)*attribute.itemSize+component],0));};
  for(let face=0;face<attributes.position.count;face+=3){
   const edit=edits.get(face);if(!edit){append(face,[1,0,0]);append(face,[0,1,0]);append(face,[0,0,1]);continue;}
   const [a,b,c]=edit.record.points,det=(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
   for(const part of xn(edit.remaining)){
    const shape=new As(part.outer.map(p=>new Ft(p.x,p.z)));shape.holes=part.holes.map(h=>new As(h.map(p=>new Ft(p.x,p.z))));
    const cap=new Mr(shape),p=cap.attributes.position,index=cap.index;
    for(let triangle=0;triangle<(index?index.count:p.count);triangle+=3)for(const k of [0,2,1]){
     const i=index?index.getX(triangle+k):triangle+k,x=p.getX(i)-a.x,z=p.getY(i)-a.z,u=(x*(c.z-a.z)-z*(c.x-a.x))/det,v=((b.x-a.x)*z-(b.z-a.z)*x)/det;append(face,[1-u-v,u,v]);
    }
    cap.dispose();
   }
  }
  const repaired=new Ce;for(const [key,attribute] of Object.entries(attributes))repaired.setAttribute(key,new pe(data[key],attribute.itemSize));
  entry.mesh.geometry.dispose();entry.mesh.geometry=repaired;if(entry.temporary)entry.geometry.dispose();
 }
 model.userData.roofRepair={removedArea,changedMeshes:changes.size};return model;
}
