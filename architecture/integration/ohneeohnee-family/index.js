import * as T from './engine.js';
import {loadApprovedReference,createMaterialLibrary} from './materials.js';
import {EnhancedFamilyGenerator,FAMILY_ASSEMBLY_VERSION} from './assemblies/family.js';
import {OptimizedFamilyRenderer,pruneUnusedGeometry} from './assemblies/optimized-renderer.js';
import {validateSpecification,VERSION,FAMILY} from './spec.mjs';
import {validateFacadeStyle,facadeStyle,FACADE_STYLE_VERSION} from './assemblies/facade-styles.mjs';
import {modelMetrics} from './assemblies/enhanced.js';

export const GENERATOR_VERSION='6.0.0';
export const COMPONENT_VERSIONS=Object.freeze({core:VERSION,assembly:FAMILY_ASSEMBLY_VERSION,facade:FACADE_STYLE_VERSION});
export {FAMILY};

export function validateBuildingSpecification(input){
 const spec=structuredClone(input);validateSpecification(spec);validateFacadeStyle(spec);
 if(typeof spec.id!=='string'||!spec.id||typeof spec.seed!=='string')throw Error('A stable id and string seed are required');
 return spec;
}

// Pure measurement in local authoring coordinates; never rescale/recenter the
// approved geometry. The doorway is distinct from the frontage threshold.
export function describeBuilding(model){
 const saved={position:model.position.clone(),quaternion:model.quaternion.clone(),scale:model.scale.clone()};
 if(model.parent)throw Error('Measure before adding the building to a placement hierarchy');
 model.position.set(0,0,0);model.quaternion.identity();model.scale.set(1,1,1);model.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3),spec=model.userData.spec;
 model.position.copy(saved.position);model.quaternion.copy(saved.quaternion);model.scale.copy(saved.scale);model.updateMatrixWorld(true);
 const frontage=(spec.podium?.depthBays||spec.depthBays)*spec.bay/2;
 return {id:spec.id,family:FAMILY,facadeSubfamily:facadeStyle(spec),generatorVersion:GENERATOR_VERSION,components:COMPONENT_VERSIONS,seed:spec.seed,storeys:spec.storeys,dimensions:{width:size.x,depth:size.z,height:size.y},bounds:{min:box.min.toArray(),max:box.max.toArray()},footprint:[[box.min.x,box.min.z],[box.max.x,box.min.z],[box.max.x,box.max.z],[box.min.x,box.max.z]],orientation:{origin:[0,0,0],up:[0,1,0],front:[0,0,1],entrance:[0,0,frontage],door:[0,0,model.userData.audit.lobby.doorPlane]},performance:modelMetrics(model)};
}

// One runtime owns the shared material/map pool and cached geometry for all
// specifications. Individual buildings/batches are leases, not resource owners.
export async function createOhneeohneeRuntime({payload,resourceURL=new URL('./approved-reference.json',import.meta.url)}={}){
 if(String(T.REVISION)!=='180')throw Error('Ohneeohnee package requires the existing Three.js r180 engine');
 if(!payload){const response=await fetch(resourceURL);if(!response.ok)throw Error('Approved material resource failed: '+response.status);payload=await response.json();}
 const approved=await loadApprovedReference(payload),library=createMaterialLibrary(approved.byName),generator=new EnhancedFamilyGenerator(library);
 // Source reference geometry is only needed to reconstruct the approved named
 // material pool. None of its original static building meshes enter gameplay.
 for(const mesh of approved.reference.children)mesh.geometry.dispose();approved.reference.clear();
 const live=new Set,batches=new Set;let disposed=false;
 const assertOpen=()=>{if(disposed)throw Error('Ohneeohnee runtime is disposed');};
 function release(model){
  assertOpen();if(!live.has(model))return false;
  if([...batches].some(batch=>batch.models.includes(model)))throw Error('Clear batches borrowing this building before releasing it');
  live.delete(model);model.removeFromParent();generator.release(model);return true;
 }
 return {
  generate(input){assertOpen();const spec=validateBuildingSpecification(input),model=generator.generate(spec);model.name=spec.name;model.userData.integration=describeBuilding(model);live.add(model);return model;},
  release,
  createBatch(models,options){
   assertOpen();if(models.some(m=>!live.has(m)))throw Error('Batch models must be active leases of this runtime');
   const optimizer=new OptimizedFamilyRenderer(options),batch={models:[...models],root:optimizer.build(models),get stats(){return optimizer.stats;},dispose(){if(!batches.has(batch))return false;optimizer.root.removeFromParent();optimizer.clear();batches.delete(batch);batch.models.length=0;return true;}};
   batches.add(batch);return batch;
  },
  trim(){assertOpen();return pruneUnusedGeometry(generator);},
  get stats(){return {disposed,activeModels:live.size,activeBatches:batches.size,geometryCacheEntries:generator.cache.size,baselineCacheEntries:generator.baseline.cache.size};},
  dispose(){
   if(disposed)return false;if(live.size||batches.size)throw Error('Release all model and batch leases before disposing the runtime');
   pruneUnusedGeometry(generator);
   const materials=new Set([...Object.values(approved.byName),...Object.values(generator.materials),...[...library.cache.values()].flatMap(m=>Object.values(m))]),textures=new Set;
   for(const material of materials){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);material.dispose();}
   for(const texture of textures)texture.dispose();library.cache.clear();disposed=true;return true;
  }
 };
}
