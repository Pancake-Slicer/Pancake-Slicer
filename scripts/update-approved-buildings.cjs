const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {syncLibrary}=require('./approved-building-import.cjs'),{smoke}=require('./approved-building-smoke.cjs');
const root=path.resolve(__dirname,'..'),registry=path.join(root,'Assets/growable-registry'),source=path.join(root,'Assets/buildings');
const stamp=new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex'),runDir=path.join(root,'.tools/building-updates',stamp),stage=path.join(runDir,'registry');
const lock=path.join(root,'.tools/building-updates/update.lock');fs.mkdirSync(path.dirname(lock),{recursive:true});
if(fs.existsSync(lock)){let alive=true;try{process.kill(Number(fs.readFileSync(lock,'utf8')),0);}catch(e){if(e.code==='ESRCH')alive=false;}if(alive){console.error('Another building update is running. Wait for it to finish.');process.exit(1);}fs.unlinkSync(lock);}
fs.writeFileSync(lock,String(process.pid),{flag:'wx'});process.on('exit',()=>{try{if(fs.readFileSync(lock,'utf8')===String(process.pid))fs.unlinkSync(lock);}catch{}});
fs.mkdirSync(stage,{recursive:true});if(fs.existsSync(registry))fs.cpSync(registry,stage,{recursive:true});
const runtime=path.join(root,'web/assets/game.bundle.js'),before=fs.readFileSync(runtime),report={started:new Date().toISOString(),status:'running',source};
function run(script,args=[]){const r=spawnSync(process.execPath,[script,...args],{cwd:root,env:{...process.env,PANCAKE_GROWABLE_REGISTRY:stage},encoding:'utf8',maxBuffer:20*1024*1024});fs.appendFileSync(path.join(runDir,'checks.log'),(r.stdout||'')+(r.stderr||''));if(r.status!==0)throw Error(script+' failed. See '+path.join(runDir,'checks.log'));}
try{
 Object.assign(report,syncLibrary({source,registry:stage,probe:d=>smoke(runtime,[d])}));
 if(!report.added.length&&!report.retained.length)throw Error('No compatible approved buildings; no registry was activated');
 run('scripts/assemble-runtime.cjs');report.smoke=smoke(runtime);
 // Ordinary full project checks, followed by the normal offline packager.
 run('scripts/verify-recovery.cjs');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),testFiles=pkg.scripts.check.split('node --test ')[1].trim().split(/\s+/);run('--test',testFiles);
 run('scripts/create-approved-growables-demo.cjs');
 // Only activate a registry that has passed the complete build/check path.
 fs.mkdirSync(registry,{recursive:true});for(const e of fs.readdirSync(stage,{withFileTypes:true})){const from=path.resolve(stage,e.name),dest=path.resolve(registry,e.name);if(!from.startsWith(stage+path.sep)||!dest.startsWith(registry+path.sep))throw Error('Registry path escapes workspace');if(e.isDirectory()&&!fs.existsSync(dest))fs.renameSync(from,dest);}
 const downloads=path.join(os.homedir(),'Downloads');fs.mkdirSync(downloads,{recursive:true});report.outputs=[];
 for(const [src,name]of [['Pancake City - Playtest.html','Playtest'],['Pancake City - Approved Architecture Demo.html','Demo']]){const bytes=fs.readFileSync(path.join(root,'dist',src)),dest=path.join(downloads,'Pancake City - Approved Buildings '+name+' - '+stamp+'.html');fs.writeFileSync(dest,bytes,{flag:'wx'});report.outputs.push({file:dest,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
 report.status='passed';report.reportFile=path.join(downloads,'Pancake City - Building Update Report - '+stamp+'.json');
}catch(e){report.status='failed';report.error=e.message;fs.writeFileSync(runtime,before);process.exitCode=1;}
report.summary=Object.fromEntries(['accepted','unchanged','skipped'].map(status=>[status,(report.entries||[]).filter(e=>e.status===status).length]));
report.completed=new Date().toISOString();fs.writeFileSync(path.join(runDir,'report.json'),JSON.stringify(report,null,2)+'\n');if(report.reportFile)fs.writeFileSync(report.reportFile,JSON.stringify(report,null,2)+'\n');
if(report.reportFile)fs.writeFileSync(report.reportFile.replace(/\.json$/,'.txt'),['Pancake City approved-building update: '+report.status,...(report.entries||[]).map(e=>(e.key||e.file)+': '+e.status+(e.reason?' — '+e.reason:'')),...report.outputs.map(o=>'Open in Google Chrome: '+o.file),'Geometry and materials are copied unchanged. No GitHub push was performed.'].join('\r\n')+'\r\n');
console.log('Building update: '+report.status+' — '+report.summary.accepted+' accepted, '+report.summary.unchanged+' unchanged, '+report.summary.skipped+' skipped');for(const e of report.entries||[])console.log((e.key||e.file)+': '+e.status+(e.reason?' — '+e.reason:''));for(const o of report.outputs||[])console.log('Playable HTML: '+o.file);console.log('Report: '+(report.reportFile||path.join(runDir,'report.json')));if(report.error)console.error(report.error);
