import * as T from '../engine.js';
import {ModernistGenerator} from '../geometry.js';
import {validateSpecification} from '../spec.mjs';
import {buildEnhanced,createAssemblyMaterials,modelMetrics} from './enhanced.js';
import {lobbyProfile} from './systems.mjs';
import {facadeStyle,validateFacadeStyle,massingSpecification,FACADE_STYLE_VERSION} from './facade-styles.mjs';

export const FAMILY_ASSEMBLY_VERSION='3.0.0';
export function chooseLobby(spec){
 validateSpecification(spec);
 // These are geometry rules, never building indices/names/seeds.
 for(const type of spec.podium?['C','B','A']:spec.widthBays>=16?['B','A']:['A']){
  try{lobbyProfile(spec,type);return type;}catch{/* try the next compatible assembly */}
 }
 throw Error('No compatible lobby for the existing footprint');
}

// Cache generated geometry by complete deterministic specification. Materials,
// the approved source maps and the lobby reflection map are shared by all ten.
export class EnhancedFamilyGenerator{
 constructor(materialLibrary,{baseline=new ModernistGenerator(materialLibrary)}={}){
  this.baseline=baseline;this.materials=createAssemblyMaterials(materialLibrary.get('graphite'));this.cache=new Map;
 }
 generate(spec){
  validateSpecification(spec);validateFacadeStyle(spec);const style=facadeStyle(spec),massing=massingSpecification(spec),key=JSON.stringify(style==='grid'?massing:spec);let entry=this.cache.get(key);
  if(!entry){
   const original=this.baseline.generate(massing),type=chooseLobby(spec),model=buildEnhanced(spec,original,this.materials,{lobbyType:type}),box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3),performance=modelMetrics(model);
   model.name=spec.name;model.userData.metadata={...structuredClone(original.userData.metadata),assemblyVersion:FAMILY_ASSEMBLY_VERSION,lobby:{type,glazing:'opaque-reflective'},dimensions:{width:size.x,height:size.y,depth:size.z},performance:{...performance,materialBatches:performance.meshes,windowBays:model.userData.audit.windows.length},approval:'family-benchmark-awaiting-review'};
   this.baseline.release(original);entry={model,users:0};this.cache.set(key,entry);
  }
  entry.users++;const model=entry.model.clone(true);model.userData.spec=structuredClone(spec);if(spec.facadeStyle!==undefined)model.userData.metadata.facade={...model.userData.metadata.facade,facadeStyle:style,styleVersion:FACADE_STYLE_VERSION};model.userData.familyResourceKey=key;return model;
 }
 release(model){
  const entry=this.cache.get(model.userData.familyResourceKey);if(entry)entry.users--;
  if(this.cache.size>24)for(const [key,item]of this.cache){if(item.users<=0){item.model.traverse(m=>m.geometry?.dispose());this.cache.delete(key);if(this.cache.size<=24)break;}}
 }
}

export function lineupMetrics(models){
 return modelMetrics({traverse(visit){for(const model of models)model.traverse(visit);}});
}
