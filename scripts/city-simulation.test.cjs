const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const shell=fs.readFileSync(path.join(__dirname,'../web/index.html'),'utf8').match(/<html\b[^>]+>/)[0];
const context=vm.createContext({console,performance,structuredClone,window:{addEventListener(){}},document:{documentElement:{hasAttribute:name=>shell.includes(' '+name)},createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.a={PcCitySimulation,pcCivicTypes,pcCivicModel,zb,qb,Se,qS,di,Pw,pcFacadeSites,pcBmoControl,pcVonControl,pcAlderwickControl,pcDecoControl};',context);const a=context.a;
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture(){const sim=new a.PcCitySimulation;sim.setCandidates([{id:'r1',zone:'rowhouses',x:0,z:0,area:400,floors:3,roadId:1},{id:'r2',zone:'rowhouses',x:30,z:0,area:400,floors:3,roadId:1},{id:'c1',zone:'offices',x:60,z:0,area:1500,floors:12,roadId:1}]);return sim;}
const facilities=[{typeId:'civic-wind',x:120,z:40},{typeId:'civic-water',x:120,z:80},{typeId:'civic-recycling',x:120,z:120}];
function months(sim,count){for(let i=0;i<count;i++)sim.tick();}
test('development requires power, commercial growth requires water, and occupied buildings generate revenue',()=>{
 const sim=fixture();months(sim,3);assert.equal(sim.last.population,0);assert.equal(sim.last.jobs,0);assert.equal(sim.last.developed,0);
 sim.setWorld([facilities[0]],100);months(sim,5);assert.ok(sim.last.population>0);assert.equal(sim.last.jobs,0);
 sim.setWorld(facilities,100);months(sim,8);assert.ok(sim.last.jobs>0);assert.ok(sim.last.income>0);assert.equal(sim.last.power,1);assert.equal(sim.last.water,1);
 for(const b of sim.candidates)assert.ok(sim.records.get(b.id).occupants<=sim.describe(b).capacity);
});
test('monthly accounts balance exactly and higher taxes reduce demand',()=>{
 const sim=fixture();sim.setWorld(facilities,1200);months(sim,12);const before=sim.funds;sim.tick();assert.equal(sim.funds,before+sim.last.income-sim.last.expenses);
 const other=fixture();other.restore(sim.capture());other.setWorld(facilities,1200);other.setTax('residential',20);other.setTax('commercial',20);sim.tick();other.tick();assert.ok(other.last.demand.residential<sim.last.demand.residential);assert.ok(other.last.demand.commercial<sim.last.demand.commercial);
 assert.equal(sim.setTax('residential',NaN),false);assert.equal(sim.setFunding('power',-10),false);
});
test('utility funding cuts cause outages, migration and abandonment; restoring supply permits recovery',()=>{
 const sim=fixture();sim.setWorld(facilities,100);months(sim,15);const population=sim.last.population;sim.setFunding('power',0);months(sim,7);
 assert.equal(sim.last.power,0);assert.ok(sim.last.population<population);assert.ok([...sim.records.values()].some(r=>r.abandoned));
 sim.setFunding('power',100);months(sim,15);assert.equal(sim.last.power,1);assert.ok([...sim.records.values()].some(r=>r.occupants>0&&!r.abandoned));
});
test('funded services depend on distance and capacity, and improve wealth eligibility',()=>{
 const sim=fixture();sim.setWorld([...facilities,{typeId:'civic-school',x:0,z:0},{typeId:'civic-clinic',x:0,z:0},{typeId:'civic-park',x:0,z:0}],100);months(sim,8);
 assert.equal(sim.records.get('r1').wealth,3);assert.equal(sim.coverage('health',{x:5000,z:5000},10),0);
 sim.setFunding('education',0);sim.tick();assert.equal(sim.records.get('r1').wealth,1);assert.equal(sim.last.education,0);
});
test('underfunded roads deteriorate and repair funding restores condition',()=>{
 const sim=fixture();sim.setWorld(facilities,1000);sim.setFunding('roads',0);months(sim,10);assert.equal(sim.roadCondition,80);assert.equal(sim.last.roadExpense,0);sim.setFunding('roads',150);months(sim,20);assert.equal(sim.roadCondition,100);assert.ok(sim.last.roadExpense>0);
});
test('clock, loans, sandbox and snapshot restoration are bounded and deterministic',()=>{
 const sim=fixture();sim.setWorld(facilities,100);sim.paused=true;assert.equal(sim.advance(1),0);assert.equal(sim.month,0);sim.paused=false;for(let i=0;i<24;i++)sim.advance(.25);assert.equal(sim.month,1);
 for(let i=0;i<4;i++)assert.equal(sim.loan(),true);assert.equal(sim.loan(),false);assert.equal(sim.debt,200000);assert.equal(sim.repay(),true);assert.equal(sim.debt,150000);
 const state=sim.capture(),other=fixture();other.restore(state);other.setWorld(facilities,100);sim.tick();other.tick();assert.deepEqual(plain(other.capture()),plain(sim.capture()));
 assert.throws(()=>other.restore({version:1,funds:0,month:0,records:[],active:true,paused:false}));
 sim.active=false;const funds=sim.funds,month=sim.month;assert.equal(sim.tick(),false);sim.spend(1000,'sandbox');assert.equal(sim.funds,funds);assert.equal(sim.month,month);
});
test('the original road/lot geometry remains intact while simulation controls development visibility',()=>{
 const n=new a.zb,p=[{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];n.addBatch(p.map((v,i)=>[v,p[(i+1)%4]]));const z=new a.qb(n,{items:[]});z.syncProperties();z.applyProperties(z.properties,'rowhouses');const roads=plain(n.roads),plots=plain(z.properties),footprints=new Map(z.buildings.map(b=>[b.id,plain(b.footprint)]));
 const sim=new a.PcCitySimulation;n.citySimulation=sim;sim.ready=true;z.revision++;z.rebuild();assert.equal(z.buildings.length,0);assert.ok(sim.candidates.length>0);sim.setWorld(facilities,500);months(sim,2);z.revision++;z.rebuild();assert.ok(z.buildings.length>0);
 for(const b of z.buildings)assert.deepEqual(plain(b.footprint),footprints.get(b.id));assert.deepEqual(plain(n.roads),roads);assert.deepEqual(plain(z.properties),plots);
 sim.active=false;z.revision++;z.rebuild();assert.equal(z.buildings.length,footprints.size);
});
test('all civic models fit their sites and use the real placement and landmark rendering path',()=>{
 const n=new a.zb,renderer=a.qS(new a.Se);for(const type of a.pcCivicTypes){const model=a.pcCivicModel(type.id),bounds=new a.di().setFromObject(model);assert.ok(bounds.min.x>=-type.lotWidth/2-.01&&bounds.max.x<=type.lotWidth/2+.01,type.name);assert.ok(bounds.min.z>=-type.lotDepth/2-.01&&bounds.max.z<=type.lotDepth/2+.01,type.name);assert.ok(bounds.max.y<=type.height+.01,type.name+' height');renderer.draw([{id:'civic',typeId:type.id,x:0,z:0,rotation:0,foundationHeight:0}]);assert.equal(renderer.info().count,1);}
});


test('canonical mixed Office growth retains assigned designs and facade foundations under the budget simulation',()=>{
 const makeCity=()=>{
  const n=new a.zb,roads=[];
  n.terrain=a.Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
  for(const x of [-400,-220,-20,180,400])roads.push([{x,z:-400},{x,z:400}],[{x:-400,z:x},{x:400,z:x}]);
  n.addBatch(roads);
  const zoning=new a.qb(n,{items:[]});zoning.setPropertyZone('offices');
  return {n,zoning};
 };
 const {n,zoning}=makeCity();
 const sim=new a.PcCitySimulation;n.citySimulation=sim;sim.ready=true;
 zoning.applyProperties(zoning.properties,'offices');assert.equal(zoning.buildings.length,0);
 const counts=new Map;
 for(const b of sim.candidates){
  const office=b.office;
  const family=['Bmo','Von','Alderwick','Deco','Curved','Vault'].find(name=>office?.['lightweight'+name]);
  if(family)counts.set(family,(counts.get(family)||0)+1);
  assert.ok(![420,423].includes(office?.catalogueId));
 }
 assert.deepEqual([...counts.keys()].sort(),['Alderwick','Bmo','Curved','Deco','Vault','Von']);
 const selected=sim.candidates.find(b=>b.office.lightweightVault);
 sim.records.get(selected.id).developed=true;
 zoning.revision++;zoning.rebuild();
 const current=zoning.buildings[0];assert.equal(current.id,selected.id);
 assert.ok(a.pcFacadeSites.get(current)?.rings.length);
 const state=plain(n.captureState().participants.zoning),budget=plain(sim.capture());
 const {n:restoredNetwork,zoning:restored}=makeCity();
 const restoredSim=new a.PcCitySimulation;restoredNetwork.citySimulation=restoredSim;restoredSim.ready=true;
 restoredSim.restore(budget);
 restoredNetwork.historyParticipants.get('zoning').restore(state);restored.rebuild();
 assert.deepEqual(plain(restored.buildings[0].office.lightweightVault),plain(current.office.lightweightVault));
 assert.ok(a.pcFacadeSites.get(restored.buildings[0])?.rings.length);
 restoredNetwork.historyParticipants.get('zoning').restore({...state,lightweightBmo:undefined,lightweightVon:undefined,lightweightDeco:undefined,lightweightAlderwick:undefined});
 assert.ok([a.pcBmoControl,a.pcVonControl,a.pcDecoControl,a.pcAlderwickControl].every(control=>control(restored).enabled));
});
