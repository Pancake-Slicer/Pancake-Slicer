// Shared adaptation for catalogue offices, native homes and other active assets.
// The original plot objects, road geometry, source models and save records stay intact.
const pcAutoRenderCache=new WeakMap,pcAutoBorrowedMaterials=new Map;
let pcOfficeConcrete=null;
function pcAutoFacadePlace(b,property,terrain){
 if(!b.footprint?.length)return;
 const footprint=b.office?.assetPlacement?.footprint||b.footprint,toward=b.towardRoad||{x:0,z:1},centre=cS(footprint)||b;
 let front;
 for(let i=0;i<footprint.length;i++){const p=footprint[i],q=footprint[(i+1)%footprint.length],mid={x:(p.x+q.x)/2,z:(p.z+q.z)/2},dot=(mid.x-centre.x)*toward.x+(mid.z-centre.z)*toward.z;if(!front||dot>front.dot)front={p,q,mid,dot};}
 const dx=front.q.x-front.p.x,dz=front.q.z-front.p.z,length=Math.hypot(dx,dz)||1;
 let nx=dz/length,nz=-dx/length;if(nx*toward.x+nz*toward.z<0){nx=-nx;nz=-nz;}
 const angle=Math.atan2(nx,nz),cos=Math.cos(angle),sin=Math.sin(angle),origin=front.mid;
 const point=(x,z)=>({x:origin.x+x*cos+z*sin,z:origin.z-x*sin+z*cos});
 const local=p=>({x:(p.x-origin.x)*cos-(p.z-origin.z)*sin,z:(p.x-origin.x)*sin+(p.z-origin.z)*cos});
 const ground=(x,z)=>{const p=point(x,z),y=terrain?.heightAt(p.x,p.z);return Number.isFinite(y)?y:(Number.isFinite(b.ground)?b.ground:0);};
 const half=b.zone==='offices'?Math.min(3,length*.325):.7;
 const base=Math.max(ground(-half,0),ground(0,0),ground(half,0))+ur+.06;
 b.y=base;b.entrance={...origin,y:base};
 if(b.office?.assetPlacement)b.office.assetPlacement={...b.office.assetPlacement,entrance:{...b.office.assetPlacement.entrance,y:base}};
 const rings=[footprint.map(local)],samples=[];
 for(const ring of rings)for(let i=0;i<ring.length;i++){const a=ring[i],c=ring[(i+1)%ring.length],count=Math.max(1,Math.ceil(Math.hypot(c.x-a.x,c.z-a.z)/2));for(let j=0;j<count;j++){const x=a.x+(c.x-a.x)*j/count,z=a.z+(c.z-a.z)*j/count;samples.push([x,z,ground(x,z)]);}}
 pcFacadeSites.set(b,{terrain,terrainRevision:terrain?.revision||0,heightAt:terrain?.heightAt,parts:[],rings,point,ground,angle,front:0,doorX:0,doorHalfWidth:half,stepHalfWidth:b.zone==='offices'?1.4:.85,sill:0,base,terrainMin:Math.min(...samples.map(p=>p[2])),terrainMax:Math.max(...samples.map(p=>p[2])),signature:JSON.stringify([base,samples])});
}
function pcAutoRenderBuilding(b,terrain){
 const site=pcFacadeSites.get(b),revision=terrain?.revision||0;
 if(site&&site.terrain===terrain&&site.terrainRevision===revision&&site.heightAt===terrain?.heightAt)return b;
 const cached=pcAutoRenderCache.get(b);if(cached&&cached.terrain===terrain&&cached.revision===revision&&cached.heightAt===terrain?.heightAt)return cached.building;
 const building={...b,entrance:{...b.entrance},...(b.office?{office:{...b.office}}:{})};
 pcFacadePlace(building,b,terrain);building.signature=b.signature+'|site-surface:'+pcFacadeStamp(building);
 pcAutoRenderCache.set(b,{terrain,revision,heightAt:terrain?.heightAt,building});return building;
}
function pcAutoAssetMaterials(b){
 const asset=pcGrowableFind(b.office?.assetKey);if(!asset)return null;
 if(asset.model.format==='ohneeohnee-family'){
  if(!pcOhneeRuntime)return null;if(pcAutoBorrowedMaterials.has(asset.key))return pcAutoBorrowedMaterials.get(asset.key);
  const model=pcOhneeRuntime.generate(asset.specification),meshes=[];model.traverse(m=>{if(m.isMesh&&!m.material.transparent)meshes.push(m);});
  const preferred=meshes.find(m=>/^(panel|stone|side|frame)$/.test(m.name))||meshes[0];const materials={stone:preferred.material,trim:preferred.material};pcOhneeRuntime.release(model);pcAutoBorrowedMaterials.set(asset.key,materials);return materials;
 }
 const resource=pcGrowableResource(asset),material=resource.parts.find(p=>/stone|panel|wall|body/i.test(p.geometry.name||p.material.name))?.material||resource.parts[0]?.material;
 return material?{stone:material,trim:material}:null;
}
function pcAutoFacadeFoundation(b,B,materials=null){
 if(pcFacadeRecord(b))return true;let site=pcFacadeSites.get(b);if(!site){const copy={...b,office:b.office?{...b.office}:undefined};pcAutoFacadePlace(copy,b,null);site=pcFacadeSites.get(copy);if(!site)return false;site.base=b.y;pcFacadeSites.set(b,site);}
 materials=materials||pcAutoAssetMaterials(b);if(!materials)return false;
 const model=new Se,record={template:{id:b.zone==='offices'?'catalogue-office':'native-residential'},parameters:{}};
 pcFacadeAttach(b,model,{foundationMaterials:materials},record);site.audit=model.userData.facadeFoundation;
 const origin=site.point(0,0);
 for(const mesh of [...model.children]){mesh.geometry.rotateY(site.angle);mesh.geometry.translate(origin.x,b.y,origin.z);mesh.geometry.userData.pcFacadeIntegrated=true;B(mesh.geometry,mesh.material,b.id);model.remove(mesh);}
 return true;
}
function pcOfficePavingPaths(b){
 const site=pcFacadeSites.get(b);if(b.zone!=='offices'||!site)return [];
 const occupied=ve(site.rings.flatMap(ring=>Te(ring.map(p=>site.point(p.x,p.z)))));
 return je(Te(b.footprint),occupied);
}
function pcOfficePave(b,B){
 if(b.zone!=='offices')return false;const site=pcFacadeSites.get(b);if(!site)return false;
 const paths=pcOfficePavingPaths(b);if(!paths.length)return true;
 if(!pcOfficeConcrete){pcOfficeConcrete=new Re({color:Wl,roughness:1,side:$e});pcOfficeConcrete.name='Office concrete · sidewalk';}
 const flat=pcRebuiltCap(paths,0);flat.setIndex(Array.from({length:flat.attributes.position.count},(_,i)=>i));
 const terrain=site.terrain,geometry=Ih(flat,ur,p=>{const h=terrain?.heightAt(p.x,p.z);return Number.isFinite(h)?h:b.ground;},{maxEdge:12,tolerance:.02,maxTriangles:1800,adaptive:true});geometry.computeVertexNormals();
 geometry.userData.pcOfficeConcrete=true;B(geometry,pcOfficeConcrete,b.id);return true;
}
