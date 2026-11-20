const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function waterfallSource(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'architecture/lightweight/waterfall-source-lock.json')));for(const [file,sha]of Object.entries({...lock.dependencies,...lock.files}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,'Approved Deco source changed: '+file);
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/waterfall/spec.mjs','architecture/waterfall/generator.js','architecture/waterfall/materials.js','architecture/original-deco/components.js','architecture/lind/generator.js','architecture/lind/spec.mjs','architecture/lind/materials.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Deco dependency '+file);const name='decoModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Deco module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/waterfall/spec.mjs'),g=visit('architecture/waterfall/generator.js'),m=visit('architecture/waterfall/materials.js');return 'function pcWaterfallPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+',...'+m+'};}\n'+fs.readFileSync(path.join(root,'web/features/lightweight-waterfall.js'),'utf8');
}

function applyWaterfallIntegration(source){const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Waterfall boundary changed: '+a.slice(0,90));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',waterfallSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){const waterfall=pcWaterfallDefinitions.find(d=>d.key===key);if(waterfall)return waterfall;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-waterfall")return asset.record?pcWaterfallPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const waterfall=pcWaterfallChoose(collection,property,forPaint);if(waterfall)return waterfall;');
 replace("...(asset.model.format==='lightweight-deco'?{lightweightDeco:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-deco'?{lightweightDeco:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-waterfall'?{lightweightWaterfall:structuredClone(asset.record)}:{})");
 replace('pcDecoRemember(collection,property,asset);','pcDecoRemember(collection,property,asset);pcWaterfallRemember(collection,property,asset);');
 replace('alderwicks=[],decos=[];','alderwicks=[],decos=[],waterfalls=[];');
 replace("if(asset.model.format==='lightweight-deco'){","if(asset.model.format==='lightweight-waterfall'){waterfalls.push(...buildings);continue;}if(asset.model.format==='lightweight-deco'){");
 replace('pcBmoFlush(decos,group,pcDecoAdapter);','pcBmoFlush(decos,group,pcDecoAdapter);pcBmoFlush(waterfalls,group,pcWaterfallAdapter);');
 replace('pcDecoRuntime?.generator.prune();E={','pcDecoRuntime?.generator.prune();pcWaterfallRuntime?.generator.prune();E={');
 replace('lightweightDeco:pcDecoHistory(this)}','lightweightDeco:pcDecoHistory(this),lightweightWaterfall:pcWaterfallHistory(this)}');
 replace('s=pcDecoRestore(this,i?.lightweightDeco)||s;','s=pcDecoRestore(this,i?.lightweightDeco)||s;s=pcWaterfallRestore(this,i?.lightweightWaterfall)||s;');
 replace('pcDecoInitControls(Vh);','pcDecoInitControls(Vh);pcWaterfallInitControls(Vh);');
 replace('window.__sandbox={experimentalDeco:', 'window.__sandbox={experimentalWaterfall:{setControl:pcWaterfallSetControl,fit:pcWaterfallFit,info:pcWaterfallInfo,history:pcWaterfallHistory,get runtime(){return pcWaterfallRuntime;}},experimentalDeco:');
 replace('function pcFacadeRecord(b){return ','function pcFacadeRecord(b){return b.office?.lightweightWaterfall||');
 replace('if(b.office.lightweightDeco||b.office.lightweightAlderwick','if(b.office.lightweightWaterfall||b.office.lightweightDeco||b.office.lightweightAlderwick');
 replace('const front=b.office.lightweightDeco?', 'const front=b.office.lightweightWaterfall?r.grid.entrance.z:b.office.lightweightDeco?');
 replace('const doorX=b.office.lightweightDeco?', 'const doorX=b.office.lightweightWaterfall?r.grid.entrance.x:b.office.lightweightDeco?');
 replace('doorHalf=b.office.lightweightDeco?', 'doorHalf=b.office.lightweightWaterfall?r.grid.entrance.width/2:b.office.lightweightDeco?');
 replace('...(b.office.lightweightDeco?{doorX:', '...((b.office.lightweightWaterfall||b.office.lightweightDeco)?{doorX:');
 replace('if(b.office.lightweightDeco)return runtime.generator.materials;', 'if(b.office.lightweightWaterfall||b.office.lightweightDeco)return runtime.generator.materials;');
 replace('for(const v of site.parts){','for(const v of site.parts){if(b.office?.lightweightWaterfall)continue;');
 replace(' // A narrow door transition stays inside',' if(b.office?.lightweightWaterfall)for(const p of r.grid.supports)rectangle(pier,p.x,p.z,p.width,p.depth);\n // A narrow door transition stays inside');
 return source;
}
module.exports={waterfallSource,applyWaterfallIntegration};
