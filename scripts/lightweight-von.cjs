const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function vonSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/von-source-lock.json')));for(const [file,sha]of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'Approved Von source changed: '+file);
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/von-badel/spec.mjs','architecture/von-badel/generator.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Von dependency '+file);const name='vonModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Von module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/von-badel/spec.mjs'),g=visit('architecture/von-badel/generator.js');return 'function pcVonPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+'};}\n'+fs.readFileSync(path.join(root,'web/features/lightweight-von.js'),'utf8');
}

function applyVonIntegration(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Von host boundary changed: '+a.slice(0,95));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',vonSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){if(key===pcVonKey)return pcVonDefinition;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-von")return asset.record?pcVonPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const von=pcVonChoose(collection,property,forPaint);if(von)return von;');
 replace("...(asset.model.format==='lightweight-lind'?{lightweightLind:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-lind'?{lightweightLind:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-von'?{lightweightVon:structuredClone(asset.record)}:{})");
 replace('pcLindRemember(collection,property,asset);','pcLindRemember(collection,property,asset);pcVonRemember(collection,property,asset);');
 replace('const procedural=[],lightweight=[],linds=[];','const procedural=[],lightweight=[],linds=[],vons=[];');
 replace("if(asset.model.format==='lightweight-lind'){","if(asset.model.format==='lightweight-von'){vons.push(...buildings);continue;}if(asset.model.format==='lightweight-lind'){");
 replace('pcBmoFlush(linds,group,pcLindAdapter);','pcBmoFlush(linds,group,pcLindAdapter);pcBmoFlush(vons,group,pcVonAdapter);');
 replace('pcLindRuntime?.generator.prune();E={','pcLindRuntime?.generator.prune();pcVonRuntime?.generator.prune();E={');
 replace('lightweightLind:pcLindHistory(this)}','lightweightLind:pcLindHistory(this),lightweightVon:pcVonHistory(this)}');
 replace('s=pcLindRestore(this,i?.lightweightLind)||s;','s=pcLindRestore(this,i?.lightweightLind)||s;s=pcVonRestore(this,i?.lightweightVon)||s;');
 replace('pcLindInitControls(Vh);','pcLindInitControls(Vh);pcVonInitControls(Vh);');
 replace('window.__sandbox={lightweightLind:', 'window.__sandbox={lightweightVon:{setControl:pcVonSetControl,info:pcVonInfo,fit:pcVonFit,history:pcVonHistory,get runtime(){return pcVonRuntime;}},lightweightLind:');
 return source;
}
module.exports={vonSource,applyVonIntegration};
