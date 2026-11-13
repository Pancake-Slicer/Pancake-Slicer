const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {syncLibrary,validatePackage}=require('./approved-building-import.cjs'),{definitions}=require('./growable-assets.cjs'),{smoke}=require('./approved-building-smoke.cjs');
const root=path.resolve(__dirname,'..'),fixtures=path.join(root,'.tools/import-tests');fs.mkdirSync(fixtures,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(){const dir=fs.mkdtempSync(path.join(fixtures,'case-')),source=path.join(dir,'source'),registry=path.join(dir,'registry');fs.mkdirSync(source);return {source,registry};}
function copy(source,name='tower',version='1.0.0',change=()=>{}){
 const dest=path.join(source,name);fs.mkdirSync(dest,{recursive:true});const original=path.join(process.env.PANCAKE_GROWABLE_REGISTRY||path.join(root,'Assets/growable-registry'),'ohneeohnee-modernist@1.0.0');for(const file of ['asset.json','architecture.json','ohneeohnee.glb'])fs.copyFileSync(path.join(original,file),path.join(dest,file));
 const d=JSON.parse(fs.readFileSync(path.join(dest,'asset.json'))),m=JSON.parse(fs.readFileSync(path.join(dest,'architecture.json')));d.id='fixture-tower';d.version=version;d.source={kind:'isolated-test-fixture'};m.id=d.id;m.version=version;change(d,m,dest);fs.writeFileSync(path.join(dest,'asset.json'),JSON.stringify(d));m.integrity.manifestSha256=hash(fs.readFileSync(path.join(dest,'asset.json')));fs.writeFileSync(path.join(dest,'architecture.json'),JSON.stringify(m));return dest;
}
test('repeat scans are idempotent and duplicate copies register only once without changing model bytes',()=>{
 const f=fixture(),p=copy(f.source);copy(f.source,'nested/copy');const first=syncLibrary(f);assert.equal(first.added.length,1);assert.equal(first.entries.find(e=>e.status==='accepted').duplicates,1);const model=path.join(f.registry,'fixture-tower@1.0.0/ohneeohnee.glb');assert.ok(fs.readFileSync(model).equals(fs.readFileSync(path.join(p,'ohneeohnee.glb'))));assert.equal(syncLibrary(f).added.length,0);assert.equal(definitions(f.registry).length,1);
});
test('a higher version is added immutably; same-version changes and broken updates retain the last good version',()=>{
 const f=fixture();copy(f.source);syncLibrary(f);copy(f.source,'tower','1.1.0');assert.equal(syncLibrary(f).added.length,1);assert.equal(definitions(f.registry).length,2);copy(f.source,'tower','1.1.0',(d)=>d.name='Changed without version');assert.ok(syncLibrary(f).entries.some(e=>e.reason?.includes('immutable')));copy(f.source,'tower','1.2.0',(d,m)=>m.approval='draft');assert.equal(syncLibrary(f).added.length,0);assert.equal(definitions(f.registry).length,2);
});
test('bad approval, hashes, orientation, dimensions, textures, indices and missing files are isolated',()=>{
 for(const [name,change] of [
  ['approval',(d,m)=>m.approval='draft'],['hash',(d,m)=>m.integrity.modelSha256='0'.repeat(64)],['orientation',d=>d.orientation.front=[1,0,0]],['dimensions',d=>d.dimensions.height=1],['texture',(d,m)=>m.textures=[]],['missing',(d,m,p)=>fs.unlinkSync(path.join(p,'ohneeohnee.glb'))],['capacity',d=>d.eligibility.capacityMinFloors=100],['parcel',d=>d.eligibility.minLotWidth=70]
 ]){const f=fixture();copy(f.source,name,'1.0.0',change);const report=syncLibrary(f);assert.equal(report.added.length,0,name);assert.equal(report.entries[0].status,'skipped',name);assert.ok(report.entries[0].reason,name);}
});
test('conflicting duplicate versions and duplicate models under different identities are reported',()=>{
 const f=fixture();copy(f.source,'one');copy(f.source,'two','1.0.0',d=>d.name='Conflicting name');assert.equal(syncLibrary(f).added.length,0);
 const g=fixture();copy(g.source,'one');copy(g.source,'two','1.0.0',(d,m)=>{d.id='another-tower';m.id=d.id;});const r=syncLibrary(g);assert.equal(r.added.length,1);assert.ok(r.entries.some(e=>e.reason?.includes('Identical model')));
});
test('a placement/render smoke failure skips that package; accepted registry survives missing source packages',()=>{
 const f=fixture();copy(f.source);assert.equal(syncLibrary({...f,probe:()=>{throw Error('Unsupported rendering');}}).entries[0].status,'skipped');syncLibrary(f);fs.renameSync(path.join(f.source,'tower'),path.join(path.dirname(f.source),'removed-from-inbox'));assert.equal(syncLibrary(f).retained.length,1);assert.equal(definitions(f.registry).length,1);
});
test('all currently accepted models pass generic native-fit and instanced-render smoke checks',()=>{
 const results=smoke(path.join(root,'web/assets/game.bundle.js'));assert.ok(results.length>=3);assert.ok(results.every(r=>r.status==='passed'&&r.placements===3&&r.sharedRenderBatches>0));
});
test('newest versions grow while old versioned assignments still resolve',()=>{
 const d=definitions().find(d=>d.id==='ohneeohnee-modernist'&&d.version==='1.0.0'),newer={...d,version:'1.1.0',key:'asset:'+d.id+'@1.1.0'};
 const runtime=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8').replace(/const pcGrowableDefinitions=.*?;\n/,()=> 'const pcGrowableDefinitions='+JSON.stringify([d,newer])+';\n'),context=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});vm.runInContext(runtime.slice(0,runtime.indexOf('const LP='))+';globalThis.api={pcGrowableChoose,pcGrowableCurrentDefinitions};',context);const a=context.api;assert.equal(a.pcGrowableCurrentDefinitions.length,1);assert.equal(a.pcGrowableCurrentDefinitions[0].version,'1.1.0');let grew=0;
 for(let i=0;i<30;i++){const p={id:'version-'+i,zone:'offices',area:3600,officeProfile:{maxFloors:80},x:0,z:0,y:8,rotation:0,towardRoad:{x:0,z:1},entrance:{x:0,z:30},footprint:[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:-30,z:30}]},selected=a.pcGrowableChoose({},p);if(selected){assert.equal(selected.version,'1.1.0');grew++;}assert.equal(a.pcGrowableChoose({pcCatalogueAssignments:new Map([[p.id,d.key]])},p).version,d.version);}assert.ok(grew>0);
});
test('source dependency tampering is rejected at acceptance without tying old accepted versions to changing authoring files',()=>{
 const f=fixture(),dir=copy(f.source),file=path.join(dir,'asset.json'),meta=path.join(dir,'architecture.json'),d=JSON.parse(fs.readFileSync(file)),m=JSON.parse(fs.readFileSync(meta));
 d.source={kind:'test',module:'scripts/approved-building-import.cjs',sha256:hash(fs.readFileSync(path.join(root,'scripts/approved-building-import.cjs'))),dependencies:{'approved-building-smoke.cjs':hash(fs.readFileSync(path.join(root,'scripts/approved-building-smoke.cjs')))}};
 fs.writeFileSync(file,JSON.stringify(d));m.integrity.manifestSha256=hash(fs.readFileSync(file));fs.writeFileSync(meta,JSON.stringify(m));assert.ok(validatePackage(file));const original=fs.readFileSync;
 try{fs.readFileSync=function(file,...args){if(String(file).replaceAll('\\','/').endsWith('/scripts/approved-building-smoke.cjs'))return Buffer.from('changed');return original.call(this,file,...args);};assert.throws(()=>validatePackage(path.join(dir,'asset.json')),/Approved architecture dependency changed/);}finally{fs.readFileSync=original;}
});
test('incomplete model folders are reported rather than silently ignored',()=>{
 const f=fixture(),dir=path.join(f.source,'unfinished');fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'unfinished.glb'),'not ready');const r=syncLibrary(f);assert.equal(r.entries.length,1);assert.equal(r.entries[0].status,'skipped');assert.equal(r.added.length,0);
});
test('license trees are preserved and hashed; accepted metadata tampering fails visibly',()=>{
 const f=fixture(),dir=copy(f.source),notice=path.join(dir,'licenses','author.txt');fs.mkdirSync(path.dirname(notice));fs.writeFileSync(notice,'Attribution must be preserved.');syncLibrary(f);const accepted=path.join(f.registry,'fixture-tower@1.0.0');assert.equal(fs.readFileSync(path.join(accepted,'licenses/author.txt'),'utf8'),'Attribution must be preserved.');assert.ok(definitions(f.registry));fs.appendFileSync(path.join(accepted,'architecture.json'),' ');assert.throws(()=>definitions(f.registry),/Accepted package metadata changed/);
});
test('a loose incomplete model in the shared root does not hide valid nested packages',()=>{
 const f=fixture();copy(f.source,'nested/tower');fs.writeFileSync(path.join(f.source,'unfinished.glb'),'incomplete');const r=syncLibrary(f);assert.equal(r.added.length,1);assert.ok(r.entries.some(e=>e.status==='skipped'));assert.equal(definitions(f.registry).length,1);
});
