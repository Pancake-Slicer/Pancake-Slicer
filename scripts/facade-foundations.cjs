const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function applyFacadeFoundations(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Facade foundation host boundary changed: '+a.slice(0,90));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',fs.readFileSync(path.join(__dirname,'../web/features/facade-foundations.js'),'utf8')+'\nconst pcGrowableDefinitions=');
 replace('if(spec.assetPlacement){building.rotation=spec.assetPlacement.angle;building.entrance=spec.assetPlacement.entrance;}','if(spec.assetPlacement){building.rotation=spec.assetPlacement.angle;building.entrance=spec.assetPlacement.entrance;}pcFacadePlace(building,property,collection?.network.terrain);');
 replace('building.signature = JSON.stringify([key, property.footprint, building.y, building.ground, spec]);','building.signature = JSON.stringify([key, property.footprint, building.y, building.ground, spec]);if(pcFacadeRecord(building))building.signature+="|facade-foundation:"+pcFacadeStamp(building);');
 const old="B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18),pcRebuiltSolid('foundation','#9a9a8d',.97),building.id);";assert.equal(source.split(old).length,3);source=source.replaceAll(old,'if(!pcFacadeRecord(building))'+old);
 replace('models.push(runtime.materials.apply(runtime.system.generate(record),record));','models.push(pcFacadeAttach(building,runtime.materials.apply(runtime.system.generate(record),record),runtime,record));');
 // Custom support geometry belongs to the chunk lease, never the source cache.
 assert.equal(source.split('models.forEach(m=>runtime.system.release(m));').length,3);source=source.replaceAll('models.forEach(m=>runtime.system.release(m));','models.forEach(m=>{pcFacadeRelease(m);runtime.system.release(m)});');
 return source;
}
module.exports={applyFacadeFoundations};
