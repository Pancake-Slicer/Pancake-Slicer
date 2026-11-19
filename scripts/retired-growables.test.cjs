const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {definitions,activeDefinitions,assetSource}=require('./growable-assets.cjs'),retired=require('../reference/retired-growables.json').ids,root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
function api(defaults=true,code=source){
 let images=0;const context=vm.createContext({console,performance,structuredClone,atob,URL,location:{href:'http://localhost/'},Image:class{constructor(){images++;}},document:{documentElement:{hasAttribute:name=>defaults&&name==='data-lightweight-growables'},createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
 vm.runInContext(code.slice(0,code.indexOf('const LP='))+';globalThis.a={zb,qb,pS,Se,pcGrowableDefinitions,pcGrowableCurrentDefinitions,pcGrowableFind,pcGrowableResource,pcGrowablesReady,pcGrowableResources,pcOhneePayload,pcLindHistory,pcVonHistory,pcBmoHistory,pcRetiredGrowableIds,get enhanced(){return pcOhneeRuntime;}};',context);return {a:context.a,images:()=>images};
}
function city(a){const n=new a.zb,lines=[];for(const v of [-180,-60,60,180])lines.push([{x:v,z:-180},{x:v,z:180}],[{x:-180,z:v},{x:180,z:v}]);assert.equal(n.addBatch(lines).ok,true);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');return {n,z};}
test('active packaging never reads retired GLBs, while archive definitions remain available',()=>{
 const original=fs.readFileSync;let text;
 try{fs.readFileSync=function(file,...args){assert.ok(!String(file).endsWith('.glb'),'Gameplay assembly must not import a retired model');return original.call(this,file,...args);};assert.equal(activeDefinitions().length,0);text=assetSource();}finally{fs.readFileSync=original;}
 assert.ok(text.includes('const pcGrowableDefinitions=[]'));const archived=definitions();for(const id of retired){assert.ok(archived.some(d=>d.id===id));for(const d of archived.filter(d=>d.id===id)){for(const p of d.payload.parts)assert.ok(!text.includes(p.position.array),'Retired vertices must not be embedded');}}
});
test('ordinary readiness and mixed lightweight growth allocate zero retired resources or image decodes',async()=>{
 const host=api(),{a}=host;await a.pcGrowablesReady();assert.equal(host.images(),0);assert.equal(a.pcGrowableResources.size,0);assert.equal(a.enhanced,null);
 const {z}=city(a);z.applyProperties(z.properties,'offices');for(const field of ['lightweightVon','lightweightBmo'])assert.ok(z.buildings.some(b=>b.office[field]),field);assert.ok(z.buildings.some(b=>!b.office.assetKey));
 for(const d of a.pcGrowableDefinitions)assert.ok(!retired.includes(d.id));for(const b of z.buildings)assert.ok(!retired.includes(b.office.assetId));
 const scene=new a.Se,renderer=a.pS(scene);renderer.render(z);assert.equal(renderer.render(z),false);assert.equal(a.pcGrowableResources.size,0);assert.equal(host.images(),0);assert.equal(a.enhanced,null);
 for(const b of [...z.buildings])z.demolish(b.id);renderer.render(z);assert.equal(scene.children.flatMap(c=>c.children||[]).filter(m=>retired.some(id=>m.userData.assetKey?.includes(id))).length,0);
});
test('retirement guards reject stale definitions and every archived version even when injected by an outdated importer',async()=>{
 const archived=definitions(),injected=source.replace(/const pcGrowableDefinitions=.*?;\n/,()=> 'const pcGrowableDefinitions='+JSON.stringify(archived)+';\n'),{a,images}=api(false,injected);
 assert.equal(a.pcGrowableCurrentDefinitions.length,0);await a.pcGrowablesReady();assert.equal(images(),0);
 for(const d of archived){assert.equal(a.pcGrowableFind(d.key),null);assert.equal(a.pcGrowableFind(d.id),null);assert.throws(()=>a.pcGrowableResource(d),/Retired reference-only/);}assert.equal(a.pcGrowableResources.size,0);
});
test('legacy assignments survive cold restore, fallback rendering, demolition and Undo/Redo without mutating saved user data',()=>{
 const host=api(false),{a}=host,first=city(a);first.z.applyProperties(first.z.properties,'offices');const saved=plain(first.n.captureState().participants.zoning),keys=definitions().flatMap(d=>[d.key,'asset:'+d.id+'@99.0.0',d.id]);
 const entries=saved.catalogueAssignments.slice(0,keys.length).map(([id],i)=>[id,keys[i]]);saved.catalogueAssignments=entries.concat(saved.catalogueAssignments.slice(keys.length));const untouched=JSON.stringify(saved),fresh=api(),{n,z}=city(fresh.a);
 n.historyParticipants.get('zoning').restore(saved);z.rebuild();const before=plain(z.buildings.map(b=>[b.id,b.signature]));for(const [id,key]of entries){assert.equal(z.pcCatalogueAssignments.get(id),key);const b=z.buildings.find(b=>b.propertyIds.includes(id));assert.ok(b);assert.ok(b.office.catalogueId);assert.equal(b.office.assetKey,undefined);}
 const scene=new fresh.a.Se,renderer=fresh.a.pS(scene);renderer.render(z);assert.equal(fresh.a.pcGrowableResources.size,0);const b=z.buildings.find(b=>b.propertyIds.includes(entries[0][0]));assert.equal(z.demolish(b.id),true);renderer.render(z);assert.equal(n.undo(),true);z.rebuild();renderer.render(z);assert.deepEqual(plain(z.buildings.map(b=>[b.id,b.signature])),before);assert.equal(n.redo(),true);z.rebuild();renderer.render(z);assert.ok(!z.buildings.some(x=>x.id===b.id));assert.equal(n.undo(),true);z.rebuild();
 assert.deepEqual(plain(n.captureState().participants.zoning.catalogueAssignments),saved.catalogueAssignments);assert.equal(JSON.stringify(saved),untouched);assert.equal(fresh.a.pcGrowableResources.size,0);assert.equal(fresh.images(),0);
});
test('optional enhanced family retains exact approved materials without any original mesh arrays or transforms',()=>{
 const {a}=api(false),archived=definitions().find(d=>d.id==='ohneeohnee-modernist'),payload=plain(a.pcOhneePayload);assert.deepEqual(payload.materials,archived.payload.materials);assert.deepEqual(payload.parts,archived.payload.parts.map(({name,material})=>({name,material})));assert.equal(a.enhanced,null);
});
test('library updates report retired source packages as reference-only without probing or reimporting them',()=>{
 const {syncLibrary}=require('./approved-building-import.cjs'),dir=fs.mkdtempSync(path.join(root,'.tools/retirement-update-'));let probes=0;const report=syncLibrary({source:path.join(root,'Assets/buildings'),registry:dir,probe:()=>probes++});assert.equal(probes,0);assert.equal(report.added.length,0);assert.equal(report.entries.filter(e=>e.status==='reference-only').length,3);assert.equal(fs.readdirSync(dir).length,0);
});
