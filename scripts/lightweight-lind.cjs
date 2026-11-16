const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function lindSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/lind-source-lock.json')));for(const [file,sha]of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'Approved Lind source changed: '+file);
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/lind/spec.mjs','architecture/lind/generator.js','architecture/lind/materials.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Lind dependency '+file);const name='lindModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Lind module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/lind/spec.mjs'),g=visit('architecture/lind/generator.js'),m=visit('architecture/lind/materials.js');return 'function pcLindPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+',...'+m+'};}\nconst pcLindTexturePayload='+JSON.stringify(require('./lind-textures.cjs')())+';\n'+fs.readFileSync(path.join(root,'web/features/lightweight-lind.js'),'utf8');
}
function applyLindIntegration(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Lind host boundary changed: '+a.slice(0,95));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',lindSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){if(key===pcLindKey)return pcLindDefinition;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-lind")return asset.record?pcLindPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const lind=pcLindChoose(collection,property,forPaint);if(lind)return lind;');
 replace("...(asset.record?{lightweightBmo:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-bmo'?{lightweightBmo:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-lind'?{lightweightLind:structuredClone(asset.record)}:{})");
 replace('pcBmoRemember(collection,property,asset);',"pcBmoRemember(collection,property,asset?.model.format==='lightweight-bmo'?asset:null);pcLindRemember(collection,property,asset);");
 replace('const procedural=[],lightweight=[];','const procedural=[],lightweight=[],linds=[];');
 replace("if(asset.model.format==='lightweight-bmo'){", "if(asset.model.format==='lightweight-lind'){linds.push(...buildings);continue;}if(asset.model.format==='lightweight-bmo'){");
 replace('pcBmoFlush(lightweight,group);','pcBmoFlush(lightweight,group);pcBmoFlush(linds,group,pcLindAdapter);');
 // Optional typed argument extends the existing BMO flush, cleanup and picking.
 replace('function pcBmoFlush(buildings,group){','function pcBmoFlush(buildings,group,adapter=null){');
 replace('const runtime=pcBmoReady(),models=[],batch=', 'const runtime=adapter?adapter.ready():pcBmoReady(),liveBatches=adapter?.batches||pcBmoBatches,models=[],batch=');
 replace('structuredClone(building.office.lightweightBmo);record.placement.y=', 'structuredClone(adapter?adapter.record(building):building.office.lightweightBmo);record.placement.y=');
 replace("batch.root.name='Lightweight BMO chunk';","batch.root.name=adapter?.name||'Lightweight BMO chunk';");
 replace('pcBmoBatches.add(record);batch.root.userData.pcBmoCleanup=()=>{pcBmoBatches.delete(record);','liveBatches.add(record);batch.root.userData.pcBmoCleanup=()=>{liveBatches.delete(record);');
 replace('function pcBmoInfo(){','function pcBmoInfo(liveBatches=pcBmoBatches,runtime=pcBmoRuntime){');
 replace('for(const record of pcBmoBatches){','for(const record of liveBatches){');
 replace('cacheEntries:pcBmoRuntime?.generator.cache.size||0,leases:pcBmoRuntime?.generator.leases.size||0','cacheEntries:runtime?.generator.cache.size||0,leases:runtime?.generator.leases.size||0');
 replace('pcBmoRuntime?.generator.prune();E={','pcBmoRuntime?.generator.prune();pcLindRuntime?.generator.prune();E={');
 replace('lightweightBmo:pcBmoHistory(this)}','lightweightBmo:pcBmoHistory(this),lightweightLind:pcLindHistory(this)}');
 replace('s=pcBmoRestore(this,i?.lightweightBmo)||s;','s=pcBmoRestore(this,i?.lightweightBmo)||s;s=pcLindRestore(this,i?.lightweightLind)||s;');
 replace('pcBmoInitControls(Vh,()=>Gt.performanceInfo());','pcBmoInitControls(Vh,()=>Gt.performanceInfo());pcLindInitControls(Vh);');
 replace('return collection.pcBmoControl||{enabled:false,favour:false};','return collection.pcBmoControl||{enabled:pcLightweightDefaults(),favour:false};');
 replace('window.__sandbox={lightweightBmo:', 'window.__sandbox={lightweightLind:{setControl:pcLindSetControl,info:pcLindInfo,fit:pcLindFit,history:pcLindHistory,get runtime(){return pcLindRuntime;}},lightweightBmo:');
 return source;
}
module.exports={lindSource,applyLindIntegration};
