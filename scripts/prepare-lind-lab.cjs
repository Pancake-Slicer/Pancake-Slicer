const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.tools/lind-lab'),copy=(a,b)=>{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b);};
async function prepare(){
 const vendor=path.join(root,'.tools/node_modules/three');if(JSON.parse(fs.readFileSync(path.join(vendor,'package.json'))).version!=='0.180.0')throw Error('Existing local Three r180 tools required');
 for(const f of ['three.module.js','three.core.js'])copy(path.join(vendor,'build',f),path.join(out,'vendor',f));copy(path.join(vendor,'LICENSE'),path.join(out,'vendor/LICENSE'));
 fs.writeFileSync(path.join(out,'engine.js'),"export * from './vendor/three.module.js';\n");fs.writeFileSync(path.join(out,'package.json'),'{"type":"module"}\n');
 for(const f of ['spec.mjs','generator.js','materials.js'])copy(path.join(root,'architecture/lind',f),path.join(out,'lind',f));
 for(const f of ['spec.mjs','generator.js'])copy(path.join(root,'architecture/bmo',f),path.join(out,'bmo',f));
 copy(path.join(root,'architecture/lightweight/template.mjs'),path.join(out,'lightweight/template.mjs'));copy(path.join(root,'architecture/lightweight/bmo.mjs'),path.join(out,'lightweight/bmo.mjs'));
 copy(path.join(root,'architecture/assemblies/optimized-renderer.js'),path.join(out,'assemblies/optimized-renderer.js'));copy(path.join(root,'benchmark/shared/batched-architecture.js'),path.join(out,'batched-architecture.js'));
 copy(path.join(root,'benchmark/art-deco/model.js'),path.join(out,'approved-lind.js'));copy(path.join(root,'Assets/Architecture/Art Deco/Art Deco Limestone Window Facade.png'),path.join(out,'assets/facade.png'));copy(path.join(root,'Assets/Architecture/Art Deco/Lind.jpg'),path.join(out,'assets/Lind.jpg'));
 for(const f of ['lind.html','lind.js'])copy(path.join(root,'architecture/lab',f),path.join(out,f));copy(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
 // Use actual current catalogue shader and BMO material definitions, not a second approximation.
 const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8'),context=vm.createContext({performance,console,atob,URL,structuredClone,document:{createElement:()=>({relList:{supports:()=>true}})}});
 vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.finishes={pcCelPhysicalShader,pcRebuiltLighting,pcIllustratedMix,pcIllustratedPalette,pcOfficeHash};',context);
 const functions=Object.entries(context.finishes).map(([k,v])=>v.toString().replace(/\bNe\b/g,'T.ShaderChunk')).join('\n'),designs=require('../reference/sc4-rebuilt-designs.json').entries.filter(x=>[403,407,414].includes(x.id));
 fs.writeFileSync(path.join(out,'catalogue-finish.js'),"import * as T from './engine.js';\n"+functions+'\nconst pcSC4Model=id=>'+JSON.stringify(designs)+'.find(x=>x.id===id);\n'+fs.readFileSync(path.join(root,'web/features/bmo-materials.js'),'utf8')+'\nexport {pcRebuiltLighting as finish,pcBmoMaterialLibrary as bmoMaterials};\n');
 const {createTemplateSystem}=await import(pathToFileURL(path.join(out,'lightweight/template.mjs'))),{lindTemplate}=await import(pathToFileURL(path.join(out,'lind/spec.mjs'))),{host}=require('./lightweight-host.cjs'),system=createTemplateSystem({definition:lindTemplate,polygon:host()});
 const rect=(w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
 const rows=[['Narrow · no podium',28,28,0,rect(28,28),{storeys:24}],['Wide · street podium',66,38,0,rect(66,38),{storeys:40,podium:{storeys:5}}],['Deep · no podium',34,56,0,rect(34,56),{storeys:34}],['Rotated · street podium',48,40,.38,rect(48,40),{storeys:42,podium:{storeys:4}}],['Irregular · no podium',58,44,0,[[-29,-22],[28,-22],[22,22],[-24,22]],{storeys:36}]];
 const fixtures=rows.map(([name,w,d,angle,ring,parameters],i)=>{const lot={id:'lind-lot-'+i,name,zone:'offices',x:0,z:0,y:0,towardRoad:{x:Math.sin(angle),z:Math.cos(angle)},rotation:angle,footprint:ring.map(([x,z])=>({x:x*Math.cos(angle)+z*Math.sin(angle),z:z*Math.cos(angle)-x*Math.sin(angle)}))},input={...parameters,id:lot.id,name,seed:'lind-review-'+i},result=system.fit(lot,{parameters:input,seed:input.seed});if(!result.ok)throw Error(name+': '+result.reason);return {lot,result};});
 fs.writeFileSync(path.join(out,'lind-fixtures.json'),JSON.stringify(fixtures,null,2));return {out,fixtures};
}
module.exports={prepare,out};if(require.main===module)prepare().then(()=>console.log('Prepared isolated Lind Lab: http://127.0.0.1:4199/lind.html')).catch(e=>{console.error(e);process.exitCode=1;});
