import * as T from '../engine.js';

// Geometry/material ownership stays with the approved generator. This adapter
// owns only its merged buffers and instance buffers; callers retain source
// models until clear(), then may release/prune their generation leases.
export class OptimizedFamilyRenderer{
 constructor({chunkSize=768}={}){if(!(chunkSize>0))throw Error('Positive chunk size required');this.chunkSize=chunkSize;this.root=new T.Group;this.root.name='Optimized approved architecture';this.owned=new Set;this.instances=new Set;this.stats=null;}
 build(models){
  this.clear();const buckets=new Map,transparent=[];let inputMeshes=0,triangles=0;
  for(const [buildingIndex,model]of models.entries()){
   model.updateWorldMatrix(true,true);const origin=new T.Vector3().setFromMatrixPosition(model.matrixWorld),chunk=[origin.x,origin.z].map(v=>Math.floor((v+this.chunkSize/2)/this.chunkSize)).join(':');
   model.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.visible)return;if(Array.isArray(mesh.material)||mesh.geometry.groups.length)throw Error('Grouped materials require an explicit adapter');
    const count=mesh.geometry.index?.count||mesh.geometry.attributes.position.count;inputMeshes++;triangles+=count/3;
    const record={mesh,matrix:mesh.matrixWorld.clone(),buildingIndex};
    // Preserve each alpha object's original geometry, centre and ordering.
    // Merging them would change transparent sorting, even at identical colours.
    if(mesh.material.transparent){transparent.push(record);return;}
    const key=[chunk,mesh.material.uuid,mesh.castShadow,mesh.receiveShadow,mesh.renderOrder,mesh.layers.mask,mesh.frustumCulled].join('|');
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(record);
   });
  }
  let merged=0,instanced=0,borrowed=0;const batches=[];
  for(const records of buckets.values()){
   const repeated=new Map;for(const r of records){const key=r.mesh.geometry.uuid;if(!repeated.has(key))repeated.set(key,[]);repeated.get(key).push(r);}
   // With four or more repeats per geometry, preserve shared source buffers
   // rather than copying the architecture repeatedly just to minimize draws.
   if(repeated.size>1&&records.length>=repeated.size*4)batches.push(...repeated.values());else batches.push(records);
  }
  for(const records of batches){
   const source=records[0].mesh;let output;
   if(records.length>1&&records.every(r=>r.mesh.geometry===source.geometry)&&records.every(r=>instanceCompatible(r.matrix))){
    // Instance whole existing mesh batches, never turn windows into objects.
    output=new T.InstancedMesh(source.geometry,source.material,records.length);records.forEach((r,i)=>output.setMatrixAt(i,r.matrix));output.instanceMatrix.needsUpdate=true;output.computeBoundingBox();output.computeBoundingSphere();this.instances.add(output);instanced++;
   }else if(records.length===1){
    output=new T.Mesh(source.geometry,source.material);output.matrixAutoUpdate=false;output.matrix.copy(records[0].matrix);borrowed++;
   }else{
    const geometry=mergeRecords(records);this.owned.add(geometry);output=new T.Mesh(geometry,source.material);merged++;
   }
   copyFlags(source,output);output.name='batch:'+source.material.name+':'+this.root.children.length;output.userData.sourceBuildings=[...new Set(records.map(r=>r.buildingIndex))];this.root.add(output);
  }
  for(const {mesh,matrix,buildingIndex}of transparent){const copy=new T.Mesh(mesh.geometry,mesh.material);copy.name=mesh.name;copy.matrixAutoUpdate=false;copy.matrix.copy(matrix);copyFlags(mesh,copy);copy.userData.sourceBuildings=[buildingIndex];this.root.add(copy);}
  this.stats={inputMeshes,outputMeshes:this.root.children.length,triangles,opaqueMergedBatches:merged,opaqueInstancedBatches:instanced,opaqueBorrowedMeshes:borrowed,transparentObjects:transparent.length,ownedGeometryBytes:[...this.owned].reduce((n,g)=>n+Object.values(g.attributes).reduce((v,a)=>v+a.array.byteLength,0)+g.index.array.byteLength,0),instanceMatrixBytes:[...this.instances].reduce((n,m)=>n+m.instanceMatrix.array.byteLength,0),chunkSize:this.chunkSize};return this.root;
 }
 clear(){for(const mesh of this.instances)mesh.dispose();for(const geometry of this.owned)geometry.dispose();this.instances.clear();this.owned.clear();this.root.clear();this.stats=null;}
}
function copyFlags(a,b){b.castShadow=a.castShadow;b.receiveShadow=a.receiveShadow;b.renderOrder=a.renderOrder;b.layers.mask=a.layers.mask;b.frustumCulled=a.frustumCulled;}
function instanceCompatible(matrix){
 // Three's instance normal transform assumes orthogonal basis vectors.
 // Mirrored or sheared placements use the exact normal-matrix bake instead.
 if(matrix.determinant()<=0)return false;
 const axes=[0,1,2].map(i=>new T.Vector3().setFromMatrixColumn(matrix,i));
 return axes.every(a=>a.lengthSq()>0)&&[[0,1],[0,2],[1,2]].every(([a,b])=>Math.abs(axes[a].dot(axes[b]))<1e-7*axes[a].length()*axes[b].length());
}
function mergeRecords(records){
 const vertices=records.reduce((n,r)=>n+r.mesh.geometry.attributes.position.count,0),count=records.reduce((n,r)=>n+(r.mesh.geometry.index?.count||r.mesh.geometry.attributes.position.count),0),positions=new Float32Array(vertices*3),normals=new Float32Array(vertices*3),uvs=new Float32Array(vertices*2),indices=vertices>65535?new Uint32Array(count):new Uint16Array(count),p=new T.Vector3,n=new T.Vector3,normalMatrix=new T.Matrix3;let vertexBase=0,indexBase=0;
 for(const {mesh,matrix}of records){const g=mesh.geometry;normalMatrix.getNormalMatrix(matrix);
  for(let i=0;i<g.attributes.position.count;i++){p.fromBufferAttribute(g.attributes.position,i).applyMatrix4(matrix);n.fromBufferAttribute(g.attributes.normal,i).applyNormalMatrix(normalMatrix);const j=vertexBase+i;positions.set([p.x,p.y,p.z],j*3);normals.set([n.x,n.y,n.z],j*3);uvs.set([g.attributes.uv.getX(i),g.attributes.uv.getY(i)],j*2);}
  const length=g.index?.count||g.attributes.position.count,mirrored=matrix.determinant()<0;for(let i=0;i<length;i++){const offset=mirrored&&i%3?i+(i%3===1?1:-1):i;indices[indexBase+i]=vertexBase+(g.index?g.index.getX(offset):offset);}vertexBase+=g.attributes.position.count;indexBase+=length;
 }
 const geometry=new T.BufferGeometry;geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(normals,3));geometry.setAttribute('uv',new T.BufferAttribute(uvs,2));geometry.setIndex(new T.BufferAttribute(indices,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

// Only used on a privately owned performance-lab generator, after all model
// leases have been released. Shared materials/maps are intentionally retained.
export function pruneUnusedGeometry(generator){
 let disposed=0;const seen=new Set;
 for(const cache of [generator.cache,generator.baseline?.cache])if(cache)for(const [key,entry]of cache){if(entry.users>0)continue;entry.model.traverse(mesh=>{if(mesh.geometry&&!seen.has(mesh.geometry)){mesh.geometry.dispose();seen.add(mesh.geometry);disposed++;}});cache.delete(key);}
 return disposed;
}
