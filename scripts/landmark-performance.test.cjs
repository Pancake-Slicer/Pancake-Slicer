const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const canvases=[];
const context=vm.createContext({console,performance,structuredClone,document:{createElement:type=>{
  const operations=[],canvas={relList:{supports:()=>true},operations,getContext:()=>({fillStyle:'#000',fillRect(...args){operations.push({colour:this.fillStyle,args});}})};
  if(type==='canvas')canvases.push(canvas);return canvas;
}}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,Iw,vw,pS,qS,Se,ae,mn,Re,Te,Ee,sn,ve,pcOfficeTiers,pcOfficeMaterials,pcOfficeMassingNames,pcLandmarkTerrainBlocked,pcLandmarkShadowBounds};',context);
const a=context.api;
function city(terrain=false){
  const network=new a.zb,points=[{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];
  network.addBatch(points.map((p,i)=>[p,points[(i+1)%4]]));
  if(terrain){const bounds={minX:-240,maxX:240,minZ:-240,maxZ:240};const map={size:480,tileSize:480,tileBounds:bounds,bounds,revision:0,heightAt:(x,z)=>10+.01*x+.005*z,landHeightAt:(x,z)=>10+.01*x+.005*z};new a.vw(map);network.terrain=map;}
  const landmarks=new a.Iw(network),zoning=new a.qb(network,landmarks);
  zoning.syncProperties();
  const houses=zoning.properties.filter(p=>p.bounds.minZ>25&&p.bounds.maxZ<55&&Math.abs(p.x)<35);
  zoning.applyProperties(houses,'rowhouses');
  zoning.setPropertyZone('offices');zoning.applyProperties(zoning.properties.filter(p=>p.bounds.maxZ< -65),'offices');
  return {network,landmarks,zoning};
}
test('landmark placement and removal keep existing house/office signatures and meshes unchanged',()=>{
  const {landmarks,zoning}=city();assert.ok(zoning.buildings.length>2);
  const renderer=a.pS(new a.Se);renderer.render(zoning);
  const signatures=zoning.buildings.map(b=>b.signature).join('|'),base=zoning.pcLandmarkPropertyState;
  const homes=base.residential,offices=base.offices;
  const result=landmarks.place({x:0,z:-5,rotation:0,typeId:'prudential-tower'});
  assert.equal(result.ok,true,result.error);zoning.rebuild();
  assert.equal(zoning.buildings.map(b=>b.signature).join('|'),signatures);
  assert.equal(zoning.pcLandmarkPropertyState.residential,homes);assert.equal(zoning.pcLandmarkPropertyState.offices,offices);
  assert.equal(renderer.render(zoning),false,'Placing a landmark must not rebuild neighborhood meshes');
  landmarks.remove(result.item.id);zoning.rebuild();
  assert.equal(zoning.buildings.map(b=>b.signature).join('|'),signatures);assert.equal(renderer.render(zoning),false);
});
test('landmark foundation grading protects occupied terrain and does not invalidate property generation',()=>{
  const {network,landmarks,zoning}=city(true);
  const signatures=zoning.buildings.map(b=>b.signature).join('|'),base=zoning.pcLandmarkPropertyState;
  const samples=zoning.buildings.flatMap(b=>b.footprint.map(p=>({...p,height:network.terrain.heightAt(p.x,p.z)})));
  const result=landmarks.place({x:0,z:-5,rotation:0,typeId:'prudential-tower'});
  assert.equal(result.ok,true,result.error);assert.ok(result.terrainBounds,'Exercise real terrain grading');
  zoning.rebuild();assert.equal(zoning.pcLandmarkPropertyState,base);
  assert.equal(zoning.buildings.map(b=>b.signature).join('|'),signatures);
  for(const p of samples)assert.ok(Math.abs(network.terrain.heightAt(p.x,p.z)-p.height)<1e-7);
  const building=zoning.buildings[0];assert.equal(a.pcLandmarkTerrainBlocked(network,{x:building.x,z:building.z}),true);
  assert.equal(network.undo(),true);zoning.rebuild();assert.equal(zoning.buildings.map(b=>b.signature).join('|'),signatures);
  assert.equal(network.redo(),true);zoning.rebuild();assert.equal(zoning.buildings.map(b=>b.signature).join('|'),signatures);
});
test('landmarks reject occupied sites instead of clearing or rearranging buildings',()=>{
  const {landmarks,zoning}=city(),building=zoning.buildings[0];
  const count=zoning.buildings.length;
  const result=landmarks.place({x:building.x,z:building.z,rotation:0,typeId:'prudential-tower'});
  assert.equal(result.ok,false);assert.match(result.error,/existing buildings/);assert.equal(zoning.buildings.length,count);
});
test('landmark shadow bounds are cached per model pose',()=>{
  const model=new a.ae(new a.mn(10,20,10),new a.Re),models=new Map([[1,model]]),cache=new Map;
  const first=a.pcLandmarkShadowBounds(models,cache),again=a.pcLandmarkShadowBounds(models,cache);
  assert.equal(first[0],again[0]);model.position.x=20;
  const moved=a.pcLandmarkShadowBounds(models,cache);assert.notEqual(moved[0],first[0]);
  assert.ok(moved[0].min.x>=15);models.clear();a.pcLandmarkShadowBounds(models,cache);assert.equal(cache.size,0);
});
test('reading landmark counters does not construct an unselected detailed model',()=>{
  const renderer=a.qS(new a.Se),info=renderer.info();
  assert.equal(info.count,0);assert.equal(Object.keys(info.models).length,0);
  assert.equal(info.model.height,300);assert.ok(info.model.totalHeight>350);
});
test('office architecture has six distinct massings per style with contained, supported floor plates',()=>{
  const footprint=[{x:0,z:0},{x:56,z:0},{x:56,z:54},{x:0,z:54}];
  for(const style of ['art-deco','international','modernist']){
    const shapes=new Set;
    for(let variant=0;variant<6;variant++){
      const tiers=a.pcOfficeTiers({footprint,y:10,floors:80,office:{style,variant,floorHeight:3.9}});
      assert.equal(tiers.reduce((sum,t)=>sum+t.floors,0),80);
      assert.equal(a.pcOfficeMassingNames[style].length,6);
      let previous=a.Te(footprint);
      for(const tier of tiers){const current=a.ve(tier.parts.flatMap(a.Te));assert.ok(a.sn(a.Ee(current,previous))>=a.sn(current)-.01);previous=current;}
      shapes.add(JSON.stringify(tiers.map(t=>t.parts)));
    }
    assert.equal(shapes.size,6);
  }
});
test('facades use varied multi-floor textures, relief maps and shared roof materials',()=>{
  const materials=['art-deco','international','modernist'].map(style=>a.pcOfficeMaterials({style,palette:3}));
  for(const material of materials){
    assert.equal(material.facade.map.image.width,512);assert.equal(material.facade.map.image.height,1024);
    assert.ok(material.facade.bumpMap);assert.ok(material.facade.bumpScale>0);
    assert.ok(material.facade.map.image.operations.length>700);
    assert.ok(new Set(material.facade.map.image.operations.map(op=>op.colour)).size>15);
  }
  assert.equal(materials[0].roof,materials[1].roof);assert.equal(materials[1].roof,materials[2].roof);
});
test('landmark pointer events are coalesced to one preview update per animation frame',()=>{
  const start=source.indexOf('function Jg(n){'),end=source.indexOf('function Sn(n){',start);
  assert.ok(start>0&&end>start);
  const frames=[],updates=[];
  const preview=vm.createContext({se:'landmark',Br:{events:0,updates:0,maxMs:0},Ba:null,Yo:0,performance,
    requestAnimationFrame:callback=>{frames.push(callback);return frames.length;},Sn:point=>updates.push(point)});
  vm.runInContext(source.slice(start,end),preview);
  for(let i=0;i<100;i++)preview.Jg({clientX:i,clientY:i,altKey:false});
  assert.equal(frames.length,1);assert.equal(updates.length,0);frames[0]();
  assert.equal(updates.length,1);assert.equal(updates[0].clientX,99);
});
test('landmark placement refreshes local terrain without rebuilding road geometry',()=>{
  const start=source.indexOf('if(se==="landmark"){Sn(Hr??n);const i=ms.place(ue);');
  const end=source.indexOf('if(se==="upgrade")',start);
  assert.ok(start>0&&end>start);
  const calls=[];
  const event=vm.createContext({se:'landmark',Hr:null,ue:{x:0,z:0},Sn(){},_e:{},ia:'prudential-tower',Ui(){},Ue(){},Es:()=>({name:'Test landmark',height:200}),
    ms:{items:[],place:()=>({ok:true,terrainBounds:{minX:-10,maxX:10,minZ:-10,maxZ:10}})},
    Gt:{refreshTerrain:()=>calls.push('terrain'),acceptProtectedTerrainEdit:()=>calls.push('accept'),drawRoads(){throw Error('Unnecessary full road rebuild');},drawLandmarks:()=>calls.push('landmarks'),previewLandmark(){}}});
  vm.runInContext('function handle(n){'+source.slice(start,end)+'}',event);event.handle({});
  assert.deepEqual(calls,['terrain','accept','landmarks']);
});
