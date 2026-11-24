const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..');
function curvedSource(){
 const seen=new Map,output=[];function visit(file){if(file==='architecture/engine.js'||file==='benchmark/shared/engine.js')return 'engine';if(file==='architecture/batched-architecture.js')file='benchmark/shared/batched-architecture.js';if(seen.has(file))return seen.get(file);assert.ok(['architecture/curved-modernist/spec.mjs','architecture/curved-modernist/generator.js','architecture/curved-modernist/materials.js','benchmark/shared/batched-architecture.js'].includes(file),'Unexpected Curved dependency '+file);const name='curvedModule'+seen.size;seen.set(file,name);let code=fs.readFileSync(path.join(root,file),'utf8'),exports=[];code=code.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)))+';');code=code.replace(/^export\s+async\s+function\s+(\w+)/gm,(_,id)=>{exports.push(id);return 'async function '+id;});code=code.replace(/^export\s+(function|class|const|let)\s+(\w+)/gm,(_,kind,id)=>{exports.push(id);return kind+' '+id;});assert.ok(!/^\s*(?:import|export)\s/m.test(code),'Unsupported Curved module syntax');output.push('const '+name+'=(()=>{\n'+code+'\nreturn {'+exports.join(',')+'};})();');return name;}
 const s=visit('architecture/curved-modernist/spec.mjs'),g=visit('architecture/curved-modernist/generator.js'),m=visit('architecture/curved-modernist/materials.js');return 'function pcCurvedPackage(engine){\n'+output.join('\n')+'\nreturn {...'+s+',...'+g+',...'+m+'};}\n'+fs.readFileSync(path.join(root,'web/features/lightweight-curved.js'),'utf8');
}

function applyCurvedIntegration(source){const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Curved boundary changed: '+a.slice(0,90));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',curvedSource()+'\nconst pcGrowableDefinitions=');
 replace('function pcGrowableFind(key){','function pcGrowableFind(key){const curved=pcCurvedDefinitions.find(d=>d.key===key);if(curved)return curved;');
 replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-curved")return asset.record?pcCurvedPlacement(property,asset):null;');
 replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const curved=pcCurvedChoose(collection,property,forPaint);if(curved)return curved;');
 replace("...(asset.model.format==='lightweight-waterfall'?{lightweightWaterfall:structuredClone(asset.record)}:{})","...(asset.model.format==='lightweight-waterfall'?{lightweightWaterfall:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-curved'?{lightweightCurved:structuredClone(asset.record)}:{})");
 replace('pcWaterfallRemember(collection,property,asset);','pcWaterfallRemember(collection,property,asset);pcCurvedRemember(collection,property,asset);');
 replace('decos=[],waterfalls=[];','decos=[],waterfalls=[],curveds=[];');
 replace("if(asset.model.format==='lightweight-waterfall'){","if(asset.model.format==='lightweight-curved'){curveds.push(...buildings);continue;}if(asset.model.format==='lightweight-waterfall'){");
 replace('pcBmoFlush(waterfalls,group,pcWaterfallAdapter);','pcBmoFlush(waterfalls,group,pcWaterfallAdapter);pcCurvedFlush(curveds,group);');
 replace('j.updateLOD(ut)&&','pcCurvedUpdateLOD(ut.position)&&(w(),I.requestShadows()),j.updateLOD(ut)&&');
 replace('pcWaterfallRuntime?.generator.prune();E={','pcWaterfallRuntime?.generator.prune();pcCurvedRuntime?.generator.prune();E={');
 replace('lightweightWaterfall:pcWaterfallHistory(this)}','lightweightWaterfall:pcWaterfallHistory(this),lightweightCurved:pcCurvedHistory(this)}');
 replace('s=pcWaterfallRestore(this,i?.lightweightWaterfall)||s;','s=pcWaterfallRestore(this,i?.lightweightWaterfall)||s;s=pcCurvedRestore(this,i?.lightweightCurved)||s;');
 replace('pcWaterfallInitControls(Vh);','pcWaterfallInitControls(Vh);pcCurvedInitControls(Vh);');
 replace('window.__sandbox={experimentalWaterfall:','window.__sandbox={experimentalCurved:{setControl:pcCurvedSetControl,fit:pcCurvedFit,info:pcCurvedInfo,history:pcCurvedHistory,get runtime(){return pcCurvedRuntime;}},experimentalWaterfall:');
 replace('function pcFacadeRecord(b){return ','function pcFacadeRecord(b){return b.office?.lightweightCurved||');
 replace('offset:bmo?.14:.04,band:true,portal:true','offset:b.office?.lightweightCurved ? .30 : (bmo ? .14 : .04),band:true,portal:true');
 replace('function pcFacadeParts(b){','function pcFacadeParts(b){if(b.office?.lightweightCurved)return [];');
 replace('const front=b.office.lightweightWaterfall?', 'const front=b.office.lightweightCurved?r.grid.entrance.z:b.office.lightweightWaterfall?');
 replace('const doorX=b.office.lightweightWaterfall?', 'const doorX=b.office.lightweightCurved?r.grid.entrance.x:b.office.lightweightWaterfall?');
 replace('doorHalf=b.office.lightweightWaterfall?', 'doorHalf=b.office.lightweightCurved?r.grid.entrance.width/2:b.office.lightweightWaterfall?');
 replace('const rings=xn(ve(parts.flatMap(v=>Te(rect(v))))).map(v=>v.outer),samples=[];','const rings=b.office.lightweightCurved?[r.grid.groundRing.map(([x,z])=>({x,z}))]:xn(ve(parts.flatMap(v=>Te(rect(v))))).map(v=>v.outer),samples=[];');
 replace('...((b.office.lightweightWaterfall||b.office.lightweightDeco)?{doorX:', '...((b.office.lightweightCurved||b.office.lightweightWaterfall||b.office.lightweightDeco)?{doorX:');
 return source;
}
module.exports={curvedSource,applyCurvedIntegration};
