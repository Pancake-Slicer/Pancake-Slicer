// Embed the additive Phase1 adapter and the unchanged BMO source on the game's
// existing Three constructors. No second engine or runtime fetch is included.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function bmoSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/bmo-source-lock.json')));
 for(const [file,sha]of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'BMO architecture changed without a reviewed template version: '+file);
 const seen=new Map,output=[];
 function visit(file){
  if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';
  if(seen.has(file))return seen.get(file);
  const allowed=['architecture/bmo/spec.mjs','architecture/bmo/generator.js','architecture/lightweight/template.mjs','architecture/lightweight/bmo.mjs','architecture/assemblies/optimized-renderer.js','benchmark/shared/batched-architecture.js'];
  if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';
  assert.ok(allowed.includes(file),'Unexpected BMO dependency '+file);if(seen.has(file))return seen.get(file);
  const name='bmoModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];
  code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');
  code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported BMO module syntax');
  output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;
 }
 const bmo=visit('architecture/bmo/generator.js'),contract=visit('architecture/lightweight/template.mjs'),definition=visit('architecture/lightweight/bmo.mjs'),optimizer=visit('architecture/assemblies/optimized-renderer.js');
 return 'function pcBmoPackage(engine){\n'+output.join('\n')+'\nreturn {...'+bmo+',...'+contract+',...'+definition+',...'+optimizer+'};}\n'+fs.readFileSync(path.join(root,'web/features/bmo-materials.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'web/features/lightweight-bmo.js'),'utf8');
}
function applyBmoIntegration(source){
 const replace=(before,after)=>{assert.equal(source.split(before).length,2,'BMO integration boundary changed: '+before.slice(0,90));source=source.replace(before,()=>after);};
 replace('const pcGrowableDefinitions=',bmoSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){return ','function pcGrowableFind(key){if(key===pcBmoKey)return pcBmoDefinition;return ');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-bmo")return asset.record?pcBmoPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const bmo=pcBmoChoose(collection,property,forPaint);if(bmo)return bmo;');
 replace("...(asset.model.format==='ohneeohnee-family'?{procedural:pcOhneeSpec(asset)}:{})","...(asset.model.format==='ohneeohnee-family'?{procedural:pcOhneeSpec(asset)}:{}),...(asset.record?{lightweightBmo:structuredClone(asset.record)}:{})");
 replace('pcOhneeRemember(collection,property,asset);','pcOhneeRemember(collection,property,asset);pcBmoRemember(collection,property,asset);');
 replace('function pcQueueGrowable(building,queue,B,stats){','function pcQueueGrowable(building,queue,B,stats){if(pcBmoQueue(building,queue,B,stats))return true;');
 replace('const procedural=[];','const procedural=[],lightweight=[];');
 replace("if(asset.model.format==='ohneeohnee-family'){procedural.push", "if(asset.model.format==='lightweight-bmo'){lightweight.push(...buildings);continue;}if(asset.model.format==='ohneeohnee-family'){procedural.push");
 replace('pcOhneeFlush(procedural,group);','pcOhneeFlush(procedural,group);pcBmoFlush(lightweight,group);');
 replace('pcOhneeClearChunk(R);','pcOhneeClearChunk(R);pcBmoClearChunk(R);');
 replace('pcOhneeRuntime?.trim();E={','pcOhneeRuntime?.trim();pcBmoRuntime?.generator.prune();E={');
 replace('at(R){if(R.object.userData.pcOhneeBuildings)','at(R){if(R.object.userData.pcBmoBuildings)return pcBmoPick(R);if(R.object.userData.pcOhneeBuildings)');
 replace('proceduralOffices:pcOhneeHistory(this)}','proceduralOffices:pcOhneeHistory(this),lightweightBmo:pcBmoHistory(this)}');
 replace('s=pcOhneeRestore(this,i?.proceduralOffices)||s;','s=pcOhneeRestore(this,i?.proceduralOffices)||s;s=pcBmoRestore(this,i?.lightweightBmo)||s;');
 replace('pcOhneeInitControls(Vh,','pcBmoInitControls(Vh,()=>Gt.performanceInfo());pcOhneeInitControls(Vh,');
 replace('if(Ze=H,M)return;const mt=','if(Ze=H,M)return;pcBmoFrame(H);const mt=');
 replace('window.__sandbox={proceduralOffices:', 'window.__sandbox={lightweightBmo:{setControl:pcBmoSetControl,info:pcBmoInfo,fit:pcBmoFit,history:pcBmoHistory,get runtime(){return pcBmoRuntime;}},proceduralOffices:');
 return source;
}
module.exports={bmoSource,applyBmoIntegration};
