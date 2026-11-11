const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const context=vm.createContext({console,performance,structuredClone,window:{addEventListener(){}},document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,Se,pS,Te,Ee,sn,pcSC4Catalogue,pcSC4Model,pcCatalogueTiers,pcCatalogueRoofMesh,pcCatalogueInitMenu};',context);
const api=context.api,plain=x=>JSON.parse(JSON.stringify(x));
function city(){
  const network=new api.zb,points=[{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];
  network.addBatch(points.map((p,i)=>[p,points[(i+1)%4]]));
  const zoning=new api.qb(network,{items:[]});zoning.setPropertyZone('offices');return {network,zoning};
}
test('all 98 public catalogue IDs remain independently selectable, including repeated names',()=>{
  const entries=api.pcSC4Catalogue.entries;
  assert.equal(entries.length,98);assert.equal(new Set(entries.map(e=>e.id)).size,98);
  assert.equal(entries.filter(e=>e.type==='office').length,64);assert.equal(entries.filter(e=>e.type==='services').length,34);
  const local=JSON.parse(fs.readFileSync(path.join(__dirname,'../reference/sc4-commercial-wealth3.json'),'utf8'));
  assert.deepEqual(plain(api.pcSC4Catalogue),local);
  const select={addEventListener(type,handler){this[type]=handler;}},help={};
  const {zoning}=city();api.pcCatalogueInitMenu({querySelector:s=>s==='#commercial-catalogue'?select:help},zoning,()=>{});
  assert.equal((select.innerHTML.match(/<option /g)||[]).length,99);
  for(const entry of entries){select.value=String(entry.id);select.change();assert.equal(zoning.pcCatalogueChoice,entry.id);assert.ok(help.textContent.includes(entry.name));assert.ok(help.textContent.includes('SC4-inspired rebuild'));}
  select.value='';select.change();assert.equal(zoning.pcCatalogueChoice,null);
});
test('every catalogue building actually renders finite geometry with picking IDs and contained floor plates',()=>{
  const {zoning}=city(),site=zoning.properties[0],scene=new api.Se,renderer=api.pS(scene),signatures=new Set;
  for(const entry of api.pcSC4Catalogue.entries){
    zoning.pcCatalogueChoice=entry.id;assert.equal(zoning.fillProperty(site.id,'offices'),true);
    const building=zoning.buildings[0];assert.equal(building.office.catalogueId,entry.id);assert.equal(building.floors,api.pcSC4Model(entry.id).floors);
    const tiers=api.pcCatalogueTiers(building);assert.equal(tiers.reduce((sum,t)=>sum+t.floors,0),building.floors);
    for(const tier of tiers)for(const ring of tier.parts){const shape=api.Te(ring);assert.ok(api.sn(shape)>1);assert.ok(Math.abs(api.sn(api.Ee(shape,api.Te(site.footprint)))-api.sn(shape))<.01);}
    signatures.add(building.signature);assert.equal(renderer.render(zoning),true);
    let triangles=0,picking=0;
    scene.traverse(object=>{if(object.geometry){const geometry=object.geometry;triangles+=geometry.attributes.position.count/3;for(const value of geometry.attributes.position.array)assert.ok(Number.isFinite(value),entry.name);if(geometry.attributes.normal)for(const value of geometry.attributes.normal.array)assert.ok(Number.isFinite(value));}
      for(const range of object.userData.buildingRanges||[]){assert.equal(range.id,building.id);picking++;}
      for(const id of object.userData.buildingIds||[])assert.equal(id,building.id);
    });
    assert.ok(triangles>30&&picking>0,entry.name);assert.equal(renderer.render(zoning),false);
  }
  assert.equal(signatures.size,98);
});
test('catalogue choice only changes painted sites, and undo/redo restores design identity',()=>{
  const {network,zoning}=city(),[a,b]=zoning.properties;
  zoning.pcCatalogueChoice=424;zoning.fillProperty(a.id,'offices');const initial=plain(zoning.buildings);
  zoning.pcCatalogueChoice=273;zoning.rebuild();assert.deepEqual(plain(zoning.buildings),initial);
  zoning.fillProperty(b.id,'offices');assert.equal(zoning.buildings.find(x=>x.propertyIds.includes(a.id)).office.catalogueId,424);
  const before=plain(zoning.buildings);zoning.fillProperty(a.id,'offices');
  assert.equal(zoning.buildings.find(x=>x.propertyIds.includes(a.id)).office.catalogueId,273);
  assert.equal(network.undo(),true);zoning.rebuild();assert.deepEqual(plain(zoning.buildings),before);
  assert.equal(network.redo(),true);zoning.rebuild();assert.ok(zoning.buildings.every(x=>x.office.catalogueId===273));
  zoning.pcCatalogueChoice=null;zoning.rebuild();assert.ok(zoning.buildings.every(x=>x.office.catalogueId===273));
});
test('special roof caps face upward for both parcel winding directions',()=>{
  const ring=[{x:0,z:0},{x:40,z:0},{x:40,z:30},{x:0,z:30}];
  for(const outline of [ring,[...ring].reverse()])for(const kind of ['angled','gable','mansard-red','barrel-green']){
    const geometry=api.pcCatalogueRoofMesh(outline,30,6,kind),normals=geometry.attributes.normal.array;
    let up=0;for(let i=1;i<normals.length;i+=3)if(normals[i]>.1)up++;
    assert.ok(up>=12,kind+' must be visible from above');
    geometry.dispose();
  }
});
