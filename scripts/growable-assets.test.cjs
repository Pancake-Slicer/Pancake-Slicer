const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {definitions}=require('./growable-assets.cjs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const context=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,pS,Se,Te,je,sn,Ee,pcGrowableDefinitions,pcGrowablePlacement,pcGrowableResource,pcGrowableChoose};',context);
const a=context.api,asset=a.pcGrowableDefinitions[0],plain=x=>JSON.parse(JSON.stringify(x));
function city(){const network=new a.zb,lines=[];for(const x of [-180,-60,60,180])lines.push([{x,z:-180},{x,z:180}]);for(const z of [-180,-60,60,180])lines.push([{x:-180,z},{x:180,z}]);assert.equal(network.addBatch(lines).ok,true);const zoning=new a.qb(network,{items:[]});zoning.setPropertyZone('offices');return {network,zoning};}
test('only approved Lind is discovered with a portable, embedded static GLB',()=>{
 const defs=definitions();assert.equal(defs.length,1);assert.equal(defs[0].id,'lind-art-deco');assert.equal(defs[0].model.format,'glb');assert.equal(defs[0].payload.parts.length,7);assert.equal(defs[0].payload.materials.filter(m=>m.image).length,2);assert.ok(defs[0].payload.sha256);assert.equal(asset.dimensions.height,183.9);
});
test('strict placement keeps native proportions on rotated lots and rejects narrow/concave/ineligible lots',()=>{
 const property={id:'placement',zone:'offices',area:3600,officeProfile:{maxFloors:80},x:0,z:0,y:8,entrance:{x:0,z:30},towardRoad:{x:0,z:1},footprint:[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:-30,z:30}]};
 for(const angle of [0,.45,Math.PI/2,Math.PI,4.1]){const cos=Math.cos(angle),sin=Math.sin(angle),point=p=>({x:p.x*cos+p.z*sin,z:-p.x*sin+p.z*cos});const p={...property,footprint:property.footprint.map(point),towardRoad:point(property.towardRoad),entrance:point(property.entrance)};const placement=a.pcGrowablePlacement(p,asset);assert.ok(placement);assert.equal(placement.scale,1);assert.ok(a.sn(a.je(a.Te(placement.footprint),a.Te(p.footprint)))<.001);assert.ok(Math.abs(Math.sin(placement.angle)-p.towardRoad.x)<1e-9);}
 for(const patch of [{area:1000},{zone:'rowhouses'},{officeProfile:{maxFloors:40}},{footprint:[{x:-10,z:-40},{x:10,z:-40},{x:10,z:40},{x:-10,z:40}]},{footprint:[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:0,z:0},{x:-30,z:30}]}])assert.equal(a.pcGrowablePlacement({...property,...patch},asset),null);
 const shifted={...asset,key:'test-offset-origin',bounds:{min:[asset.bounds.min[0]+40,0,asset.bounds.min[2]+30],max:[asset.bounds.max[0]+40,183.9,asset.bounds.max[2]+30]},footprint:asset.footprint.map(([x,z])=>[x+40,z+30]),orientation:{...asset.orientation,entrance:[40,0,45.75]}};
 const placement=a.pcGrowablePlacement({...property},shifted);assert.ok(placement,'Model origin need not be at the footprint centre');assert.ok(a.sn(a.je(a.Te(placement.footprint),a.Te(property.footprint)))<.001);
});
test('Office paint automatically grows Lind alongside the unchanged catalogue, with stable IDs and no overlap',()=>{
 const {zoning}=city();assert.equal(zoning.pcCatalogueChoice,undefined);zoning.applyProperties(zoning.properties,'offices');const lind=zoning.buildings.filter(b=>b.office.assetKey);assert.ok(lind.length>=2,'Dense fixture must grow multiple Linds automatically');assert.ok(zoning.buildings.some(b=>b.office.catalogueId));
 for(const b of lind){assert.ok(b.id.startsWith('office:office-block:'));assert.equal(b.height,183.9);assert.equal(b.floors,48);assert.equal(b.office.assetVersion,'1.0.0');assert.equal(b.office.assetPlacement.scale,1);assert.ok(a.sn(a.je(a.Te(b.office.assetPlacement.footprint),a.Te(b.footprint)))<.001);assert.equal(b.entrance.y,b.y);for(const other of zoning.buildings)if(other!==b)assert.ok(a.sn(a.Ee(a.Te(b.office.assetPlacement.footprint),a.Te(other.footprint)))<.002);}
 const signatures=zoning.buildings.map(b=>b.signature);zoning.rebuild();assert.deepEqual(zoning.buildings.map(b=>b.signature),signatures);
});
test('instanced render shares all model geometry/materials across chunks, preserves picking and survives chunk disposal',()=>{
 const {network,zoning}=city();zoning.applyProperties(zoning.properties,'offices');const resource=a.pcGrowableResource(asset),scene=new a.Se,renderer=a.pS(scene);renderer.render(zoning);let instances=0,meshes=[];
 scene.traverse(o=>{if(o.userData.assetKey){meshes.push(o);assert.ok(resource.parts.some(p=>p.geometry===o.geometry&&p.material===o.material));instances+=o.count;for(let i=0;i<o.count;i++)assert.equal(renderer.at({object:o,instanceId:i}),o.userData.buildingIds[i]);}});
 assert.equal(instances,zoning.buildings.filter(b=>b.office.assetKey).length*7);assert.ok(meshes.length<instances);assert.equal(renderer.render(zoning),false);
 const b=zoning.buildings.find(b=>b.office.assetKey),signature=b.signature;let disposed=0;for(const p of resource.parts)p.geometry.addEventListener('dispose',()=>disposed++);
 assert.equal(zoning.demolish(b.id),true);renderer.render(zoning);assert.equal(zoning.buildings.some(x=>x.id===b.id),false);assert.equal(disposed,0);
 assert.equal(network.undo(),true);zoning.rebuild();renderer.render(zoning);assert.equal(zoning.buildings.find(x=>x.id===b.id).signature,signature);assert.equal(network.redo(),true);zoning.rebuild();renderer.render(zoning);assert.equal(zoning.buildings.some(x=>x.id===b.id),false);assert.equal(disposed,0);
});
test('assignment history is JSON serializable and retains asset ID/version, and explicit legacy choices still override',()=>{
 const {network,zoning}=city();zoning.applyProperties(zoning.properties,'offices');const state=JSON.parse(JSON.stringify(network.captureState()));assert.ok(state.participants.zoning.catalogueAssignments.some(([,v])=>v===asset.key));
 const before=zoning.buildings.map(b=>b.signature);network.historyParticipants.get('zoning').restore(state.participants.zoning);zoning.rebuild();assert.deepEqual(zoning.buildings.map(b=>b.signature),before);
 const property=zoning.properties.find(p=>zoning.pcCatalogueAssignments.get(p.id)===asset.key);zoning.pcCatalogueChoice=424;zoning.applyProperties([property],'offices');assert.equal(zoning.buildings.find(b=>b.propertyIds.includes(property.id)).office.catalogueId,424);network.undo();zoning.rebuild();assert.equal(zoning.buildings.find(b=>b.propertyIds.includes(property.id)).office.assetKey,asset.key);
});
