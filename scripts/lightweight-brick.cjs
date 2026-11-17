const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function brickSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/brick-source-lock.json')));for(const [file,sha]of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'Approved Brick source changed: '+file);
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/brick-office/spec.mjs','architecture/brick-office/generator.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Brick dependency '+file);const name='brickModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Brick module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/brick-office/spec.mjs'),g=visit('architecture/brick-office/generator.js');return 'function pcBrickPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+'};}\n'+fs.readFileSync(path.join(root,'web/features/lightweight-brick.js'),'utf8');
}


function applyBrickIntegration(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Brick host boundary changed: '+a.slice(0,95));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',brickSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){if(key===pcBrickKey)return pcBrickDefinition;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-brick")return asset.record?pcBrickPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const brick=pcBrickChoose(collection,property,forPaint);if(brick)return brick;');
 replace("...(asset.model.format==='lightweight-von'?{lightweightVon:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-von'?{lightweightVon:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-brick'?{lightweightBrick:structuredClone(asset.record)}:{})");
 replace('pcVonRemember(collection,property,asset);','pcVonRemember(collection,property,asset);pcBrickRemember(collection,property,asset);');
 replace('const procedural=[],lightweight=[],linds=[],vons=[];','const procedural=[],lightweight=[],linds=[],vons=[],bricks=[];');
 replace("if(asset.model.format==='lightweight-von'){","if(asset.model.format==='lightweight-brick'){bricks.push(...buildings);continue;}if(asset.model.format==='lightweight-von'){");
 replace('pcBmoFlush(vons,group,pcVonAdapter);','pcBmoFlush(vons,group,pcVonAdapter);pcBmoFlush(bricks,group,pcBrickAdapter);');
 replace('pcVonRuntime?.generator.prune();E={','pcVonRuntime?.generator.prune();pcBrickRuntime?.generator.prune();E={');
 replace('lightweightVon:pcVonHistory(this)}','lightweightVon:pcVonHistory(this),lightweightBrick:pcBrickHistory(this)}');
 replace('s=pcVonRestore(this,i?.lightweightVon)||s;','s=pcVonRestore(this,i?.lightweightVon)||s;s=pcBrickRestore(this,i?.lightweightBrick)||s;');
 replace('pcVonInitControls(Vh);','pcVonInitControls(Vh);pcBrickInitControls(Vh);');
 replace('window.__sandbox={lightweightVon:', 'window.__sandbox={lightweightBrick:{setControl:pcBrickSetControl,info:pcBrickInfo,fit:pcBrickFit,history:pcBrickHistory,get runtime(){return pcBrickRuntime;}},lightweightVon:');
 replace('function pcFacadeRecord(b){return ','function pcFacadeRecord(b){return b.office?.lightweightBrick||');
 replace('if(b.office.lightweightLind)return r.grid.volumes.filter(v=>v.start===0);','if(b.office.lightweightBrick||b.office.lightweightLind)return r.grid.volumes.filter(v=>v.start===0);');
 replace('const front=b.office.lightweightLind?', 'const front=b.office.lightweightBrick?r.grid.entrance.z:b.office.lightweightLind?');
 replace('if(b.office.lightweightVon)return runtime.generator.materials;','if(b.office.lightweightBrick||b.office.lightweightVon)return runtime.generator.materials;');
 return source;
}
module.exports={brickSource,applyBrickIntegration};
