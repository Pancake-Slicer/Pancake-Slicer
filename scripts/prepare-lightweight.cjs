const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.tools/modernist-lab');
require('./prepare-modernist-lab.cjs');
const copy=(a,b)=>{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b);};
for(const f of ['template.mjs','bmo.mjs'])copy(path.join(root,'architecture/lightweight',f),path.join(out,'lightweight',f));
for(const f of ['lightweight.html','lightweight.js'])copy(path.join(root,'architecture/lab',f),path.join(out,f));
(async()=>{
 const {createTemplateSystem}=await import(pathToFileURL(path.join(out,'lightweight/template.mjs'))),{bmoTemplate}=await import(pathToFileURL(path.join(out,'lightweight/bmo.mjs'))),{host,lots}=require('./lightweight-host.cjs');
 const system=createTemplateSystem({definition:bmoTemplate,polygon:host()}),fixtures=lots().map(lot=>({lot,result:system.fit(lot,{parameters:lot.parameters,seed:'phase1-fixed-1138'})}));
 if(fixtures.some(f=>!f.result.ok))throw Error(JSON.stringify(fixtures));
 fs.writeFileSync(path.join(out,'lightweight-fixtures.json'),JSON.stringify(fixtures,null,2));
 // Profiling-only copy of the actual game; production runtime is untouched.
 let js=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Game probe boundary changed: '+a);js=js.replace(a,()=>b);};
 replace('(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew');
 replace('new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox=');
 let shell=fs.readFileSync(path.join(root,'web/index.html'),'utf8').replace('<link rel="stylesheet" href="./assets/game.css">',()=>'<style>'+fs.readFileSync(path.join(root,'web/assets/game.css'),'utf8')+'</style>');
 shell=shell.replace('<script type="module" src="./assets/game.bundle.js"></script>',()=>'<script type="module">'+js+'\n'+fs.readFileSync(path.join(root,'scripts/lightweight-game-baseline.js'),'utf8')+'</script>');
 fs.writeFileSync(path.join(out,'game-baseline.html'),shell);
 console.log('Prepared five-lot comparison and actual-game baseline.');
})().catch(e=>{console.error(e);process.exitCode=1;});
