const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../web/assets/game.bundle.js'), 'utf8');
const context = vm.createContext({
  console, performance, structuredClone,
  window: { addEventListener() {} },
  document: { createElement: () => ({ relList: { supports: () => true }, getContext: () => ({ fillRect() {} }) }) }
});
vm.runInContext(source.slice(0, source.indexOf('const LP=')) + ';globalThis.api={zb,qb,Se,pS,yw,Te,Bo,Ee,sn,ve,Yb,Gi,pcOfficePlots,pcOfficeSpec,pcOfficeTiers,pcOfficeMaterials};', context);
const api = context.api;
const plain = value => JSON.parse(JSON.stringify(value));
function city() {
  const network = new api.zb();
  const points = [{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];
  assert.equal(network.addBatch(points.map((point,i) => [point,points[(i+1)%4]])).ok, true);
  const zoning = new api.qb(network, { items: [] });
  zoning.syncProperties();
  return { network, zoning };
}
test('Office designs deterministically span all three styles and 10 through 80 storeys', () => {
  const styles = new Set, floors = new Set;
  for (let i=0;i<1000;i++) {
    const spec=api.pcOfficeSpec('office-fixture-'+i,3200);
    assert.deepEqual(plain(spec),plain(api.pcOfficeSpec('office-fixture-'+i,3200)));
    assert.ok(Number.isInteger(spec.floors)&&spec.floors>=10&&spec.floors<=80);
    styles.add(spec.style); floors.add(spec.floors);
    assert.ok(api.pcOfficeSpec('small-'+i,960).floors<=24);
  }
  assert.equal(styles.size,3); assert.ok(floors.has(10)&&floors.has(80));
});
test('Office selection exposes independent, deep parcels instead of merged rowhouse strips', () => {
  const {zoning}=city();
  const properties=plain(zoning.properties);
  zoning.setPropertyZone('offices');
  const officeProperties=plain(zoning.properties);
  assert.equal(zoning.applyProperties(zoning.properties,'offices'),true);
  assert.ok(zoning.buildings.length>5&&zoning.buildings.length<properties.length);
  assert.equal(zoning.buildings.length,zoning.properties.length);
  assert.equal(new Set(zoning.buildings.map(b=>b.office.style)).size,3);
  assert.ok(zoning.buildings.every(b=>Number.isInteger(b.office.catalogueId)&&b.floors>=1&&b.floors<=80));
  assert.equal(zoning.info().offices,zoning.buildings.length);
  assert.equal(zoning.info().homes,0);
  assert.deepEqual(plain(zoning.properties),officeProperties);
  assert.deepEqual(plain(zoning.pcResidentialProperties),properties);
  for(const building of zoning.buildings) {
    assert.equal(building.zone,'offices');
    assert.ok(building.frontage>=32&&building.depth>=30);
    assert.ok(building.area>=960&&building.area<=3132);
    assert.ok(Math.max(building.frontage,building.depth)/Math.min(building.frontage,building.depth)<=1.2);
    const members=building.propertyIds.map(id=>zoning.propertyById.get(id));
    const allowance=api.Bo(api.ve(members.flatMap(p=>api.Te(p.footprint))),.08);
    assert.ok(api.sn(api.Ee(api.Te(building.footprint),allowance))>=building.area-.01,'Offices must stay on their painted properties');
    assert.ok(building.footprint.every((p,i,a)=>{
      const q=a[(i+1)%a.length]; return Math.abs(p.x-q.x)<1e-4||Math.abs(p.z-q.z)<1e-4;
    }),'Rectangular street blocks retain square building corners');
  }
});
test('Office undo/redo, demolition, and repaint operate through existing zoning history', () => {
  const {network,zoning}=city();
  zoning.applyProperties(zoning.properties,'offices');
  const before=plain(zoning.buildings);
  assert.equal(network.undo(),true); zoning.rebuild(); assert.equal(zoning.buildings.length,0);
  assert.equal(network.redo(),true); zoning.rebuild(); assert.deepEqual(plain(zoning.buildings),before);
  const victim=zoning.buildings[0],count=zoning.buildings.length;
  assert.equal(zoning.demolish(victim.id),true);
  assert.equal(zoning.buildings.length,count-1);
  assert.ok(zoning.buildings.every(b=>b.propertyIds.every(id=>!victim.propertyIds.includes(id))));
  assert.equal(network.undo(),true); zoning.rebuild(); assert.deepEqual(plain(zoning.buildings),before);
  zoning.demolish(victim.id);
  const site=zoning.propertyById.get(victim.propertyIds[0]);
  zoning.fillProperty(site.id,'offices');
  assert.ok(zoning.buildings.some(b=>b.propertyIds.includes(site.id)));
});
test('Office and rowhouse zoning coexist; rezoning back restores the residential designs', () => {
  const {zoning}=city();
  zoning.applyProperties(zoning.properties,'rowhouses');
  const residential=plain(zoning.buildings);
  const officeSites=zoning.properties.slice(0,20);
  zoning.applyProperties(officeSites,'offices');
  const homes=zoning.buildings.filter(b=>b.zone==='rowhouses'),offices=zoning.buildings.filter(b=>b.zone==='offices');
  assert.ok(homes.length>0&&offices.length>0);
  for(const home of homes)for(const office of offices)assert.ok(api.sn(api.Ee(api.Te(home.footprint),api.Te(office.footprint)))<.001);
  zoning.setPropertyZone('rowhouses');
  zoning.applyProperties(zoning.properties,'rowhouses');
  assert.deepEqual(plain(zoning.buildings),residential);
  // Older snapshots without an offices key remain usable.
  zoning.network.historyParticipants.get('zoning').restore({regions:{rowhouses:[]},suppressed:[]});
  zoning.rebuild(); assert.equal(zoning.buildings.length,0);
  assert.equal(zoning.regions.offices.length,0);
});
test('residential zoning is unchanged from the approved rendering checkpoint',()=>{
  const original=fs.readFileSync(path.join(__dirname,'../original/Pancake (52).html'),'utf8');
  const embedded=original.match(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/i)[1];
  const approved=require('./rendering-fixes.cjs').applyRenderingFixes(embedded);
  const previous=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true}})}});
  vm.runInContext(approved.slice(0,approved.indexOf('const LP='))+';globalThis.api={zb,qb};',previous);
  const {zoning}=city(),network=new previous.api.zb();
  const points=[{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];
  network.addBatch(points.map((p,i)=>[p,points[(i+1)%4]]));
  const oldZoning=new previous.api.qb(network,{items:[]});oldZoning.syncProperties();
  assert.deepEqual(plain(zoning.properties),plain(oldZoning.properties));
  zoning.applyProperties(zoning.properties,'rowhouses');oldZoning.applyProperties(oldZoning.properties,'rowhouses');
  assert.deepEqual(plain(zoning.buildings),plain(oldZoning.buildings));
});
test('the existing brush paints Office sites only where street properties exist',()=>{
  const {zoning}=city();
  assert.equal(zoning.paint([{x:0,z:-45}],30,'offices'),true);
  assert.ok(zoning.buildings.length>0&&zoning.buildings.every(b=>b.zone==='offices'));
  const empty=new api.qb(new api.zb(),{items:[]});
  assert.equal(empty.paint([{x:0,z:0}],50,'offices'),false);
  assert.equal(empty.buildings.length,0);
});
test('bucket fill uses a full office-depth plot and tab changes retain placed offices',()=>{
  const {zoning}=city();
  zoning.setPropertyZone('offices');
  const plot=zoning.properties.find(property=>property.depth>=44);
  assert.ok(plot);
  assert.equal(zoning.fillProperty(plot.id,'offices'),true);
  assert.equal(zoning.buildings.length,1);
  const building=zoning.buildings[0];
  assert.equal(building.depth,plot.depth);
  assert.ok(building.area>1800);
  zoning.setPropertyZone('rowhouses');
  assert.equal(zoning.buildings[0].id,building.id);
  assert.ok(zoning.properties.every(property=>property.zone==='rowhouses'));
  assert.equal(zoning.demolish(building.id),true);
  assert.equal(zoning.buildings.length,0);
  zoning.fillProperty(plot.id,'offices');
  assert.equal(zoning.buildings.length,1);
});
test('native office plots avoid roads, each other, landmarks and tile edges on rotated streets',()=>{
  const network=new api.zb(),angle=.39;
  const rotate=([x,z])=>({x:x*Math.cos(angle)-z*Math.sin(angle),z:x*Math.sin(angle)+z*Math.cos(angle)});
  const corners=[[-100,-70],[100,-70],[100,70],[-100,70]].map(rotate);
  assert.equal(network.addBatch(corners.map((p,i)=>[p,corners[(i+1)%4]])).ok,true);
  const plots=api.pcOfficePlots(network),roads=api.Yb(network).paths,bounds=api.Gi(network);
  assert.ok(plots.length>5);
  for(let i=0;i<plots.length;i++){
    const plot=plots[i],shape=api.Te(plot.footprint);
    const widths=plot.footprint.map((p,j,a)=>Math.hypot(p.x-a[(j+1)%4].x,p.z-a[(j+1)%4].z));
    assert.ok(Math.min(...widths)>=29.99,'Office depth must not collapse into the residential strip');
    assert.ok(api.sn(api.Ee(shape,roads))<.001);
    assert.ok(plot.footprint.every(p=>p.x>=bounds.minX&&p.x<=bounds.maxX&&p.z>=bounds.minZ&&p.z<=bounds.maxZ));
    for(let j=0;j<i;j++)assert.ok(api.sn(api.Ee(shape,api.Te(plots[j].footprint)))<.001);
  }
  assert.equal(api.pcOfficePlots(network),plots,'Unchanged roads and terrain must reuse the plot cache');
  const landmark={id:'test-landmark',x:plots[0].x,z:plots[0].z,rotation:0};
  const protectedPlots=api.pcOfficePlots(network,[landmark]);
  assert.notEqual(protectedPlots,plots);
  const exclusion=api.Te([{x:landmark.x-48,z:landmark.z-48},{x:landmark.x+48,z:landmark.z-48},{x:landmark.x+48,z:landmark.z+48},{x:landmark.x-48,z:landmark.z+48}]);
  assert.ok(protectedPlots.every(plot=>api.sn(api.Ee(api.Te(plot.footprint),exclusion))<.001));
});
test('Office and residential rezoning removes whole conflicting sites instead of overlapping buildings',()=>{
  const {zoning}=city();
  zoning.applyProperties(zoning.properties,'rowhouses');
  zoning.setPropertyZone('offices');
  const plot=zoning.properties[0];zoning.fillProperty(plot.id,'offices');
  assert.ok(zoning.buildings.some(b=>b.zone==='offices'));
  zoning.setPropertyZone('rowhouses');
  const house=zoning.properties.find(p=>api.sn(api.Ee(api.Te(p.footprint),api.Te(plot.footprint)))>.01);
  assert.ok(house);zoning.fillProperty(house.id,'rowhouses');
  assert.ok(zoning.buildings.every(b=>b.zone!=='offices'));
});
test('office tiers stay within their site and account for exactly the advertised storeys', () => {
  const footprint=[{x:0,z:0},{x:40,z:0},{x:40,z:30},{x:0,z:30}];
  for(const style of ['art-deco','international','modernist'])for(const floors of [10,40,80]){
    const building={footprint,y:3,floors,office:{style,floorHeight:3.9}};
    const tiers=api.pcOfficeTiers(building);
    assert.equal(tiers.reduce((sum,tier)=>sum+tier.floors,0),floors);
    assert.ok(tiers.every(tier=>tier.floors>=1));
    assert.ok(Math.abs(tiers.at(-1).y+tiers.at(-1).height-(3+floors*3.9))<1e-8);
    assert.ok(api.sn(api.Te(tiers.at(-1).footprint))<api.sn(api.Te(footprint)));
    for(const tier of tiers)assert.ok(Math.abs(api.sn(api.Ee(api.Te(tier.footprint),api.Te(footprint)))-api.sn(api.Te(tier.footprint)))<.001);
  }
});
test('actual office rendering batches facade geometry, reuses materials and keeps picking IDs', () => {
  const {zoning}=city(); zoning.applyProperties(zoning.properties,'offices');
  const scene=new api.Se,renderer=api.pS(scene);
  assert.equal(renderer.render(zoning),true);
  assert.ok(renderer.info().windows>1000);
  assert.ok(renderer.info().meshes<150,'Curtain-wall windows must not become individual mesh objects');
  const ids=new Set(zoning.buildings.map(building=>building.id));
  let ranges=0;
  scene.traverse(object=>{
    for(const range of object.userData.buildingRanges||[]){assert.ok(ids.has(range.id));ranges++;}
    for(const id of object.userData.buildingIds||[])assert.ok(ids.has(id));
    if(object.geometry){for(const v of object.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}
  });
  assert.ok(ranges>zoning.buildings.length);
  const material=api.pcOfficeMaterials(zoning.buildings[0].office);
  assert.equal(material,api.pcOfficeMaterials(zoning.buildings[0].office));
  assert.equal(renderer.render(zoning),false,'Unchanged Office buildings must reuse their cached meshes');
});
class Element {
  constructor(dataset={}){this.dataset=dataset;this.events={};this.attributes={};this.value='100';}
  addEventListener(type,callback){(this.events[type]??=[]).push(callback);}
  setAttribute(key,value){this.attributes[key]=String(value);}
  focus(){this.focused=true;}
  click(){for(const callback of this.events.click||[])callback({});}
  key(key){for(const callback of this.events.keydown||[])callback({key,preventDefault(){},stopPropagation(){}});}
}
test('the real zoning menu exposes and switches the Office tab by click and keyboard',()=>{
  const {zoning}=city(),tabs=[],elements=new Map;
  const container=new Element;
  Object.defineProperty(container,'innerHTML',{set(html){
    this.html=html;
    for(const match of html.matchAll(/<button data-zone="([^"]+)"[^>]*>/g)){
      const tab=new Element({zone:match[1]});
      for(const attr of match[0].matchAll(/([\w-]+)="([^"]*)"/g))tab.setAttribute(attr[1],attr[2]);
      tabs.push(tab);
    }
  }});
  container.querySelector=selector=>{if(!elements.has(selector))elements.set(selector,new Element);return elements.get(selector);};
  container.querySelectorAll=selector=>selector==='[data-zone]'?tabs:[];
  const world={canvas:new Element,controls:{enabled:true},setLandscapeBrush(){},highlightProperty(){},highlightDevelopment(){},drawZoning(){}};
  const ui=api.yw({container,world,collection:zoning,onChange(){},onClose(){},onMessage(){},getTool:()=> 'zoning'});
  assert.equal(tabs.length,2);
  assert.ok(container.html.includes('role="tablist"'));
  assert.equal(tabs[1].dataset.zone,'offices'); assert.equal(tabs[1].attributes.role,'tab');
  tabs[1].click(); assert.equal(ui.info().type,'offices'); assert.equal(tabs[1].attributes['aria-selected'],'true');
  assert.ok(elements.get('#zoning-type-help').textContent.includes('30–58 m deep'));
  assert.ok(zoning.properties.every(property=>property.zone==='offices'&&property.depth>=30));
  tabs[1].key('ArrowLeft'); assert.equal(ui.info().type,'rowhouses'); assert.equal(tabs[0].tabIndex,0);
  tabs[0].key('End'); assert.equal(ui.info().type,'offices'); assert.equal(tabs[1].focused,true);
});
