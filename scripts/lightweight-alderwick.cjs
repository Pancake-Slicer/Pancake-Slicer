const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function alderwickSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/alderwick-source-lock.json')));for(const [file,sha]of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'Approved Alderwick source changed: '+file);
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/alderwick/spec.mjs','architecture/alderwick/generator.js','architecture/alderwick/materials.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Alderwick dependency '+file);const name='alderwickModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Alderwick module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/alderwick/spec.mjs'),g=visit('architecture/alderwick/generator.js'),m=visit('architecture/alderwick/materials.js');return 'function pcAlderwickPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+',...'+m+'};}\n'+fs.readFileSync(path.join(root,'web/features/lightweight-alderwick.js'),'utf8');
}
function applyAlderwickIntegration(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Alderwick host boundary changed: '+a.slice(0,95));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',alderwickSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){if(key===pcAlderwickKey)return pcAlderwickDefinition;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-alderwick")return asset.record?pcAlderwickPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const alderwick=pcAlderwickChoose(collection,property,forPaint);if(alderwick)return alderwick;');
 replace("...(asset.model.format==='lightweight-brick'?{lightweightBrick:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-brick'?{lightweightBrick:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-alderwick'?{lightweightAlderwick:structuredClone(asset.record)}:{})");
 replace('pcBrickRemember(collection,property,asset);','pcBrickRemember(collection,property,asset);pcAlderwickRemember(collection,property,asset);');
 replace('const procedural=[],lightweight=[],linds=[],vons=[],bricks=[];','const procedural=[],lightweight=[],linds=[],vons=[],bricks=[],alderwicks=[];');
 replace("if(asset.model.format==='lightweight-brick'){","if(asset.model.format==='lightweight-alderwick'){alderwicks.push(...buildings);continue;}if(asset.model.format==='lightweight-brick'){");
 replace('pcBmoFlush(bricks,group,pcBrickAdapter);','pcBmoFlush(bricks,group,pcBrickAdapter);pcBmoFlush(alderwicks,group,pcAlderwickAdapter);');
 replace('pcBrickRuntime?.generator.prune();E={','pcBrickRuntime?.generator.prune();pcAlderwickRuntime?.generator.prune();E={');
 replace('lightweightBrick:pcBrickHistory(this)}','lightweightBrick:pcBrickHistory(this),lightweightAlderwick:pcAlderwickHistory(this)}');
 replace('s=pcBrickRestore(this,i?.lightweightBrick)||s;','s=pcBrickRestore(this,i?.lightweightBrick)||s;s=pcAlderwickRestore(this,i?.lightweightAlderwick)||s;');
 replace('pcBrickInitControls(Vh);','pcBrickInitControls(Vh);pcAlderwickInitControls(Vh);');
 replace('window.__sandbox={lightweightBrick:', 'window.__sandbox={lightweightAlderwick:{setControl:pcAlderwickSetControl,info:pcAlderwickInfo,fit:pcAlderwickFit,history:pcAlderwickHistory,get runtime(){return pcAlderwickRuntime;}},lightweightBrick:');
 replace('function pcFacadeRecord(b){return ','function pcFacadeRecord(b){return b.office?.lightweightAlderwick||');
 replace('if(b.office.lightweightBrick||b.office.lightweightLind)return r.grid.volumes.filter(v=>v.start===0);','if(b.office.lightweightAlderwick||b.office.lightweightBrick||b.office.lightweightLind)return r.grid.volumes.filter(v=>v.start===0);');
 replace('const front=b.office.lightweightBrick?', 'const front=b.office.lightweightAlderwick?r.grid.entrance.z:b.office.lightweightBrick?');
 replace('const sill=bmo?.16:0,base=Math.max(ground(-2.2,front),ground(0,front),ground(2.2,front))','const doorHalf=b.office.lightweightAlderwick?5.6:2.2,sill=bmo?.16:0,base=Math.max(ground(-doorHalf,front),ground(0,front),ground(doorHalf,front))');
 replace('parts,rings,point,ground,front,sill,base,terrainMin:','...(b.office.lightweightAlderwick?{doorHalfWidth:5.6,stepHalfWidth:3.6}:{}),parts,rings,point,ground,front,sill,base,terrainMin:');
 replace('if(b.office.lightweightBrick||b.office.lightweightVon)return runtime.generator.materials;','if(b.office.lightweightAlderwick){const m=runtime.materials.forRecord(r);return {...m,stone:m.limestone,trim:m.limestone};}if(b.office.lightweightBrick||b.office.lightweightVon)return runtime.generator.materials;');
 return source;
}
module.exports={alderwickSource,applyAlderwickIntegration};
