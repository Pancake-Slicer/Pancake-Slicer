const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const context=vm.createContext({console,performance,structuredClone,atob,URL,location:{href:'file:///phase6b.html'},Image:class{set src(value){this.width=this.height=512;queueMicrotask(()=>this.onload());}},document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,pS,Se,pcOhneeDefinitions,pcOhneeReady,pcOhneeSetControl,pcOhneeHistory,pcGrowablePlacement,pcGrowableFind,pcOhneeClearChunk,getRuntime:()=>pcOhneeRuntime,Te,sn,je,Ee};',context);
const a=context.api,ready=a.pcOhneeReady();
function city(style='all',enabled=true){const network=new a.zb,lines=[];for(const v of [-180,-60,60,180])lines.push([{x:v,z:-180},{x:v,z:180}],[{x:-180,z:v},{x:180,z:v}]);assert.equal(network.addBatch(lines).ok,true);const zoning=new a.qb(network,{items:[]});zoning.setPropertyZone('offices');if(enabled)a.pcOhneeSetControl(zoning,{enabled,style});zoning.applyProperties(zoning.properties,'offices');return {network,zoning};}
const family=z=>z.buildings.filter(b=>b.office?.procedural);
test('ordinary startup allocates no experimental resources and readiness uses one shared promise',async()=>{
 let images=0;const cold=vm.createContext({console,performance,structuredClone,atob,URL,location:{href:'file:///cold.html'},Image:class{constructor(){images++;}},document:{createElement:()=>({relList:{supports:()=>true}})}});
 vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.state={runtime:pcOhneeRuntime,task:pcOhneeReadyTask,batches:pcOhneeLiveBatches.size};',cold);assert.equal(cold.state.runtime,null);assert.equal(cold.state.task,null);assert.equal(cold.state.batches,0);assert.equal(images,0);assert.ok(!source.includes('await pcGrowablesReady();await pcOhneeReady();const _e='));assert.equal(a.pcOhneeReady(),a.pcOhneeReady());await ready;
});
test('hidden frames skip all scene work and keep the resume clock current',()=>{
 const start=source.indexOf('b.setAnimationLoop(H=>{'),end=source.indexOf('}),{async setTerrain',start),callback=source.slice(start+'b.setAnimationLoop('.length,end+1);assert.ok(start>0&&end>start);
 const ctx=vm.createContext({document:{hidden:true}});vm.runInContext('let Ze=0;let M=true;const frame='+callback+';frame(1000);globalThis.hiddenClock=Ze;document.hidden=false;frame(1016);globalThis.visibleClock=Ze;',ctx);assert.equal(ctx.hiddenClock,1000);assert.equal(ctx.visibleClock,1016);
});
test('a failed experimental material load leaves the existing catalogue and zoning operational',async()=>{
 const messages=[],broken=vm.createContext({console:{...console,error:(...args)=>messages.push(args.join(' '))},performance,structuredClone,atob,URL,location:{href:'file:///phase6b.html'},Image:class{set src(value){queueMicrotask(()=>this.onerror());}},document:{createElement:()=>({relList:{supports:()=>true}})}});
 vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,pcOhneeReady,pcOhneeSetControl};',broken);const api=broken.api;assert.equal(await api.pcOhneeReady(),null);assert.ok(messages.some(m=>m.includes('decode')));
 const network=new api.zb,lines=[];for(const v of [-180,-60,60,180])lines.push([{x:v,z:-180},{x:v,z:180}],[{x:-180,z:v},{x:180,z:v}]);assert.equal(network.addBatch(lines).ok,true);const zoning=new api.qb(network,{items:[]});zoning.setPropertyZone('offices');api.pcOhneeSetControl(zoning,{enabled:true,style:'all'});zoning.applyProperties(zoning.properties,'offices');assert.equal(zoning.buildings.length,68);assert.equal(family(zoning).length,0);
});
test('shared package initializes on the recovered host engine and reproduces all nine approved bounds',async()=>{
 const r=await ready;assert.ok(r);for(const d of a.pcOhneeDefinitions){const m=r.generate(d.specification);
 // Complete cross-engine fidelity comparison is exercised by browser/package
 // tests; here enforce the authoritative bounds and shared generated resources.
 assert.deepEqual(plain(m.userData.integration.bounds),plain(d.bounds));assert.equal(m.userData.integration.seed,d.seed);assert.equal(m.userData.integration.facadeSubfamily,d.facadeSubfamily);const repeated=r.generate(d.specification);assert.equal(m.children[0].geometry,repeated.children[0].geometry);assert.equal(m.children[0].material,repeated.children[0].material);r.release(m);r.release(repeated);}r.trim();assert.equal(r.stats.activeModels,0);
});
test('all nine candidates grow through existing Office painting, preserve scale/frontage and do not overlap',async()=>{
 await ready;const {zoning}=city(),grown=family(zoning);assert.equal(new Set(grown.map(b=>b.office.assetId)).size,9);assert.ok(zoning.buildings.some(b=>!b.office.procedural));
 for(const b of grown){const d=a.pcGrowableFind(b.office.assetKey),p=b.office.assetPlacement;assert.equal(p.scale,1);assert.ok(Math.abs(Math.sin(2*p.angle))<1e-12);assert.ok(Math.sin(p.angle)*b.towardRoad.x+Math.cos(p.angle)*b.towardRoad.z>=Math.max(Math.abs(b.towardRoad.x),Math.abs(b.towardRoad.z))-1e-12);assert.ok(a.sn(a.je(a.Te(p.footprint),a.Te(b.footprint)))<.001);assert.deepEqual(plain(b.office.procedural.specification),plain(d.specification));for(const other of zoning.buildings)if(other!==b)assert.ok(a.sn(a.Ee(a.Te(p.footprint),a.Te(other.footprint)))<.002);}
});
test('default disabled selection is unchanged; each facade filter affects only eligible future growth',async()=>{
 await ready;assert.equal(family(city('all',false).zoning).length,0);for(const style of ['vertical','horizontal','grid']){const {zoning}=city(style);assert.equal(new Set(family(zoning).map(b=>b.office.assetId)).size,3);for(const b of family(zoning))assert.equal(b.office.procedural.specification.facadeStyle,style);}
 const {zoning}=city(),before=zoning.buildings.map(b=>b.signature);a.pcOhneeSetControl(zoning,{enabled:false,style:'all'});zoning.rebuild();assert.deepEqual(zoning.buildings.map(b=>b.signature),before);
});
test('native-fit rules reject residential, undersized and low-capacity lots, including rotated irregular parcels',async()=>{
 await ready;for(const d of a.pcOhneeDefinitions){const p={id:'fit-'+d.id,zone:'offices',area:3600,officeProfile:{maxFloors:80},x:0,z:0,y:8,entrance:{x:0,z:30},towardRoad:{x:0,z:1},rotation:0,footprint:[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:-30,z:30}]};
 for(const angle of [0,.37,1.23]){const point=p=>({x:p.x*Math.cos(angle)+p.z*Math.sin(angle),z:-p.x*Math.sin(angle)+p.z*Math.cos(angle)}),fit=a.pcGrowablePlacement({...p,rotation:angle,footprint:p.footprint.map(point),towardRoad:point(p.towardRoad),entrance:point(p.entrance)},d);assert.ok(fit);assert.ok(Math.abs(Math.sin(fit.angle-angle))<1e-12);}
 for(const patch of [{zone:'rowhouses'},{area:50},{officeProfile:{maxFloors:1}},{footprint:[{x:-5,z:-30},{x:5,z:-30},{x:5,z:30},{x:-5,z:30}]}])assert.equal(a.pcGrowablePlacement({...p,...patch},d),null);
 for(const footprint of [[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:0,z:0},{x:-30,z:30}],[{x:-30,z:-30},{x:30,z:-30},{x:0,z:30}]]){const fit=a.pcGrowablePlacement({...p,footprint},d);if(fit)assert.ok(a.sn(a.je(a.Te(fit.footprint),a.Te(footprint)))<.001,'An irregular lot must contain the complete native model');}}
});
test('history/JSON round trips retain candidate, version, full specification and seed across demolition and regeneration',async()=>{
 await ready;const {network,zoning}=city(),b=family(zoning)[0],before=zoning.buildings.map(b=>b.signature),saved=plain(network.captureState());assert.equal(saved.participants.zoning.proceduralOffices.assignments.length,family(zoning).length);zoning.rebuild();assert.deepEqual(zoning.buildings.map(b=>b.signature),before);
 assert.equal(zoning.demolish(b.id),true);assert.equal(network.undo(),true);zoning.rebuild();assert.equal(zoning.buildings.find(x=>x.id===b.id).signature,b.signature);assert.equal(network.redo(),true);zoning.rebuild();assert.ok(!zoning.buildings.some(x=>x.id===b.id));network.historyParticipants.get('zoning').restore(saved.participants.zoning);zoning.rebuild();assert.deepEqual(zoning.buildings.map(b=>b.signature),before);
 const restored=new a.qb(network,{items:[]});network.historyParticipants.get('zoning').restore(saved.participants.zoning);restored.rebuild();assert.deepEqual(restored.buildings.map(b=>b.signature),before);
});
test('restoring an experimental snapshot into a cold runtime loads the library and restores exact buildings',async()=>{
 await ready;const saved=plain(city().network.captureState().participants.zoning),cold=vm.createContext({console,performance,structuredClone,atob,URL,location:{href:'file:///restore.html'},Image:class{set src(value){this.width=this.height=512;queueMicrotask(()=>this.onload());}},document:{createElement:()=>({relList:{supports:()=>true}})}});
 vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,pcOhneeReady};',cold);const api=cold.api,n=new api.zb,lines=[];for(const v of [-180,-60,60,180])lines.push([{x:v,z:-180},{x:v,z:180}],[{x:-180,z:v},{x:180,z:v}]);n.addBatch(lines);const z=new api.qb(n,{items:[]});n.historyParticipants.get('zoning').restore(saved);await api.pcOhneeReady();z.rebuild();assert.equal(new Set(family(z).map(b=>b.office.assetId)).size,9);for(const b of family(z))assert.deepEqual(plain(b.office.procedural),saved.proceduralOffices.assignments.find(([id])=>id===b.propertyIds[0])[1]);
});
test('chunk batches preserve picking and leases, unchanged frames do not rebuild and complete removal releases geometry',async()=>{
 await ready;const r=a.getRuntime(),{zoning}=city(),scene=new a.Se,renderer=a.pS(scene);renderer.render(zoning);assert.ok(r.stats.activeModels>0);assert.ok(r.stats.activeBatches>0);const stats=plain(r.stats);assert.equal(renderer.render(zoning),false);assert.deepEqual(plain(r.stats),stats);
 let picked=0;scene.traverse(o=>{if(!o.userData.pcOhneeBuildings)return;for(const b of o.userData.pcOhneeBuildings){const p=b.office.assetPlacement;assert.equal(renderer.at({object:o,point:{x:p.x,y:b.y+2,z:p.z},instanceId:0}),b.id);picked++;}});assert.ok(picked>0);
 for(const b of [...zoning.buildings])zoning.demolish(b.id);renderer.render(zoning);assert.equal(r.stats.activeModels,0);assert.equal(r.stats.activeBatches,0);assert.equal(r.stats.geometryCacheEntries,0);assert.equal(r.stats.baselineCacheEntries,0);
});
