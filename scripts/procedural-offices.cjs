// Embed the reviewed ESM source closure without bundling a second Three.js.
// Approved sources stay immutable; module scopes/exports become local closures.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),packageRoot='architecture/integration/ohneeohnee-family';
const sources={ 'spec.mjs':'architecture/modernist/spec.mjs','geometry.js':'architecture/modernist/geometry.js','materials.js':'architecture/modernist/materials.js','batched-architecture.js':'benchmark/shared/batched-architecture.js',...Object.fromEntries(['systems.mjs','enhanced.js','roof-surfaces.js','family.js','facade-styles.mjs','optimized-renderer.js'].map(f=>['assemblies/'+f,'architecture/assemblies/'+f])),'index.js':packageRoot+'/index.js'};
function bundlePackage(){
 const lock=JSON.parse(fs.readFileSync(path.join(root,packageRoot,'source-lock.json')));
 for(const [file,hash]of Object.entries(lock.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Approved architecture changed: '+file);
 const seen=new Map,output=[];
 function visit(file){
  if(file==='engine.js')return 'engine';if(seen.has(file))return seen.get(file);
  assert.ok(sources[file],'Unexpected package dependency '+file);const name='module'+seen.size;seen.set(file,name);
  let text=fs.readFileSync(path.join(root,sources[file]),'utf8'),exports=[];
  // Host-only material binding path; leave the archived/Lab loader unchanged.
  if(file==='materials.js'){const before='for(const p of payload.parts){const array=';assert.equal(text.split(before).length,2);text=text.replace(before,'for(const p of payload.parts){if(!p.position){byName[p.name]=materials[p.material];continue;}const array=');}
  text=text.replace(/^import\s+(\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?/gm,(_,binding,relative)=>{
   const dependency=visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),relative)));
   return 'const '+(binding.startsWith('*')?binding.replace(/^\*\s+as\s+/,''):binding.replace(/(\w+)\s+as\s+(\w+)/g,'$1:$2'))+'='+dependency+';';
  });
  text=text.replace(/^export\s+(?=(?:async\s+)?(?:function|class|const|let)\s+)(?:(async\s+)?(function|class|const|let)\s+)(\w+)/gm,(_,async,kind,id)=>{exports.push(id);return (async||'')+kind+' '+id;});
  text=text.replace(/^export\s*\{([^}]+)\};?/gm,(_,names)=>{exports.push(...names.split(',').map(x=>x.trim()));return '';});
  text=text.replace(/import\.meta\.url/g,'location.href');
  assert.ok(!/^\s*(?:import\s|export\s)/m.test(text),'Unsupported ESM syntax in '+file);
  output.push('const '+name+'=(()=>{\n'+text+'\nreturn {'+exports.join(',')+'};})();');return name;
 }
 const entry=visit('index.js');return 'function pcOhneePackage(engine){\n'+output.join('\n')+'\nreturn '+entry+';\n}';
}
function proceduralOfficeSource(){
 const catalogue=JSON.parse(fs.readFileSync(path.join(root,packageRoot,'catalogue.json')));
 assert.equal(catalogue.candidates.length,9);assert.equal(catalogue.generator.version,'6.0.0');
 const bytes=fs.readFileSync(path.join(root,'Assets/procedural-templates/ohneeohnee-family@6.0.0/materials.json'));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'df62d64d94dd352de1575ef9fc9e60fcccf2bc5f438eec62e2c68acb789157d6','Shared procedural materials changed');const payload=JSON.parse(bytes);
 assert.ok(payload.parts.every(p=>Object.keys(p).every(k=>['name','material'].includes(k))),'Do not embed retired geometry');
 assert.equal(payload.sha256,'2938c48decce49b82fcead7dd831f138597f24828f0155a32f2e8b0894f8f133');
 const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');
 return 'const pcOhneeCatalogue='+json(catalogue)+';\nconst pcOhneePayload='+json(payload)+';\n'+bundlePackage()+'\n'+fs.readFileSync(path.join(root,'web/features/procedural-offices.js'),'utf8');
}
module.exports={bundlePackage,proceduralOfficeSource};
