const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function decoSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/deco-source-lock.json')));for(const [file,sha]of Object.entries({...lock.dependencies,...lock.files}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'Approved Deco source changed: '+file);
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/original-deco/spec.mjs','architecture/original-deco/generator.js','architecture/original-deco/materials.js','architecture/original-deco/components.js','architecture/lind/generator.js','architecture/lind/spec.mjs','architecture/lind/materials.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Deco dependency '+file);const name='decoModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Deco module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/original-deco/spec.mjs'),g=visit('architecture/original-deco/generator.js'),m=visit('architecture/original-deco/materials.js');return 'function pcDecoPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+',...'+m+'};}\n'+fs.readFileSync(path.join(root,'web/features/lightweight-deco.js'),'utf8');
}

function applyDecoIntegration(source){const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Deco host boundary changed: '+a.slice(0,90));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',decoSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){const deco=pcDecoDefinitions.find(d=>d.key===key);if(deco)return deco;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-deco")return asset.record?pcDecoPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const deco=pcDecoChoose(collection,property,forPaint);if(deco)return deco;');
 replace("...(asset.model.format==='lightweight-alderwick'?{lightweightAlderwick:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-alderwick'?{lightweightAlderwick:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-deco'?{lightweightDeco:structuredClone(asset.record)}:{})");
 replace('pcAlderwickRemember(collection,property,asset);','pcAlderwickRemember(collection,property,asset);pcDecoRemember(collection,property,asset);');
 replace('const procedural=[],lightweight=[],linds=[],vons=[],bricks=[],alderwicks=[];','const procedural=[],lightweight=[],linds=[],vons=[],bricks=[],alderwicks=[],decos=[];');
 replace("if(asset.model.format==='lightweight-alderwick'){","if(asset.model.format==='lightweight-deco'){decos.push(...buildings);continue;}if(asset.model.format==='lightweight-alderwick'){");
 replace('pcBmoFlush(alderwicks,group,pcAlderwickAdapter);','pcBmoFlush(alderwicks,group,pcAlderwickAdapter);pcBmoFlush(decos,group,pcDecoAdapter);');
 replace('pcAlderwickRuntime?.generator.prune();E={','pcAlderwickRuntime?.generator.prune();pcDecoRuntime?.generator.prune();E={');
 replace('lightweightAlderwick:pcAlderwickHistory(this)}','lightweightAlderwick:pcAlderwickHistory(this),lightweightDeco:pcDecoHistory(this)}');
 replace('s=pcAlderwickRestore(this,i?.lightweightAlderwick)||s;','s=pcAlderwickRestore(this,i?.lightweightAlderwick)||s;s=pcDecoRestore(this,i?.lightweightDeco)||s;');
 replace('pcAlderwickInitControls(Vh);','pcAlderwickInitControls(Vh);pcDecoInitControls(Vh);');
 replace('window.__sandbox={lightweightAlderwick:','window.__sandbox={experimentalDeco:{setControl:pcDecoSetControl,info:pcDecoInfo,fit:pcDecoFit,history:pcDecoHistory,get runtime(){return pcDecoRuntime;}},lightweightAlderwick:');
 replace('function pcFacadeRecord(b){return ','function pcFacadeRecord(b){return b.office?.lightweightDeco||');
 replace('if(b.office.lightweightAlderwick||b.office.lightweightBrick||b.office.lightweightLind)return','if(b.office.lightweightDeco||b.office.lightweightAlderwick||b.office.lightweightBrick||b.office.lightweightLind)return');
 replace('const front=b.office.lightweightAlderwick?', 'const front=b.office.lightweightDeco?r.grid.entrance.z:b.office.lightweightAlderwick?');
 replace('const doorHalf=b.office.lightweightAlderwick?5.6:2.2,','const doorX=b.office.lightweightDeco?r.grid.entrance.x:0,doorHalf=b.office.lightweightDeco?r.grid.entrance.width/2:b.office.lightweightAlderwick?5.6:2.2,');
 replace('base=Math.max(ground(-doorHalf,front),ground(0,front),ground(doorHalf,front))','base=Math.max(ground(doorX-doorHalf,front),ground(doorX,front),ground(doorX+doorHalf,front))');
 replace('parts,rings,point,ground,front,sill,base,terrainMin:','...(b.office.lightweightDeco?{doorX:r.grid.entrance.x,doorHalfWidth:r.grid.entrance.width/2,stepHalfWidth:r.grid.entrance.doorWidth/2}:{}),parts,rings,point,ground,front,sill,base,terrainMin:');
 replace('if(b.office.lightweightAlderwick){const m=runtime.materials.forRecord(r);','if(b.office.lightweightDeco)return runtime.generator.materials;if(b.office.lightweightAlderwick){const m=runtime.materials.forRecord(r);');
 return source;
}
module.exports={decoSource,applyDecoIntegration};
