const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..'),policy=require('../reference/retired-reference-offices.json');
function applyReferenceOfficeRetirement(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Reference retirement boundary changed: '+a.slice(0,90));source=source.replace(a,()=>b);};
 for(const [name,file]of [['pcSC4Catalogue','sc4-commercial-wealth3.json'],['pcRebuiltDesigns','sc4-rebuilt-designs.json']]){const full=JSON.parse(fs.readFileSync(path.join(root,'reference',file))),active={...full,entries:full.entries.filter(e=>!policy.catalogueIds.includes(e.id))};if('count'in active)active.count=active.entries.length;replace('const '+name+'='+JSON.stringify(full)+';','const '+name+'='+JSON.stringify(active)+';');}
 source=fs.readFileSync(path.join(root,'web/features/retired-reference-offices.js'),'utf8')+'\n'+source;
 for(const family of ['Lind','Brick']){
  replace('function pc'+family+'Ready(){','function pc'+family+"Ready(){throw Error('Retired reference-only Office family');");
  replace('function pc'+family+'Fit(property){','function pc'+family+"Fit(property){return {ok:false,reason:'Retired reference-only Office family'};");
  replace('function pc'+family+'Choose(collection,property,forPaint=false){','function pc'+family+'Choose(collection,property,forPaint=false){return null;');
  replace('function pc'+family+'Control(collection){','function pc'+family+'Control(collection){return {enabled:false,favour:false};');
  replace('function pc'+family+'SetControl(collection,value){','function pc'+family+'SetControl(collection,value){value={enabled:false,favour:false};');
  replace('function pc'+family+'Validate(record){','function pc'+family+'Validate(record){return pcReferenceOfficeRecord(record);');
  replace('function pc'+family+'InitControls(collection){','function pc'+family+'InitControls(collection){return;');
 }
 // Preserve source for archival tools; no approved Lind pixels ship in normal gameplay.
 const textures='const pcLindTexturePayload='+JSON.stringify(require('./lind-textures.cjs')())+';';replace(textures,'const pcLindTexturePayload={};');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){if(pcReferenceOfficeRetired(key))return null;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(pcReferenceOfficeRetired(asset))return null;');
 replace('function pcGrowableResource(asset){',"function pcGrowableResource(asset){if(pcReferenceOfficeRetired(asset))throw Error('Retired reference-only Office family');");
 replace('if(collection.pcCatalogueChoice)for(const property of properties)','if(pcCatalogueFind(collection.pcCatalogueChoice))for(const property of properties)');
 source=source.replaceAll('Mix all 98','Mix all 96').replaceAll('Mix all98','Mix all96').replaceAll('98 reference designs','96 reference designs').replaceAll('Offices (64)','Offices (62)');return source;
}
module.exports={applyReferenceOfficeRetirement};
