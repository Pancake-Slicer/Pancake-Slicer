// Original simulation rules. These are documented game-design approximations,
// not SC4 source code or a claim to reproduce its undisclosed simulator.
const pcCivicTypes=Object.freeze([
 {id:'civic-wind',name:'Wind power station',kind:'power',cost:3000,upkeep:90,capacity:800,radius:0,pollution:0,height:38,lotWidth:26,lotDepth:26},
 {id:'civic-coal',name:'Coal power station',kind:'power',cost:18000,upkeep:450,capacity:6000,radius:0,pollution:70,height:48,lotWidth:62,lotDepth:48},
 {id:'civic-gas',name:'Natural gas power station',kind:'power',cost:36000,upkeep:650,capacity:10000,radius:0,pollution:28,height:35,lotWidth:58,lotDepth:46},
 {id:'civic-water',name:'Water tower',kind:'water',cost:1600,upkeep:75,capacity:2200,radius:0,pollution:0,height:27,lotWidth:24,lotDepth:24},
 {id:'civic-pump',name:'Water pumping station',kind:'water',cost:7000,upkeep:260,capacity:14000,radius:0,pollution:0,height:12,lotWidth:36,lotDepth:30},
 {id:'civic-recycling',name:'Recycling centre',kind:'waste',cost:8000,upkeep:250,capacity:1800,radius:0,pollution:5,height:14,lotWidth:46,lotDepth:38},
 {id:'civic-landfill',name:'Waste transfer facility',kind:'waste',cost:3000,upkeep:150,capacity:3500,radius:0,pollution:35,height:12,lotWidth:56,lotDepth:46},
 {id:'civic-school',name:'Elementary school',kind:'education',cost:6000,upkeep:220,capacity:500,radius:650,pollution:0,height:15,lotWidth:48,lotDepth:36},
 {id:'civic-library',name:'Public library',kind:'education',cost:5000,upkeep:170,capacity:800,radius:800,pollution:0,height:12,lotWidth:34,lotDepth:30},
 {id:'civic-clinic',name:'Health clinic',kind:'health',cost:7000,upkeep:300,capacity:1200,radius:700,pollution:0,height:17,lotWidth:38,lotDepth:32},
 {id:'civic-police',name:'Police station',kind:'police',cost:8000,upkeep:260,capacity:2500,radius:850,pollution:0,height:16,lotWidth:38,lotDepth:32},
 {id:'civic-fire',name:'Fire station',kind:'fire',cost:6500,upkeep:230,capacity:2500,radius:800,pollution:0,height:15,lotWidth:40,lotDepth:34},
 {id:'civic-park',name:'Neighbourhood park',kind:'park',cost:1200,upkeep:35,capacity:1000,radius:400,pollution:-6,height:9,lotWidth:38,lotDepth:34}
].map(type=>Object.freeze({...type,towerWidth:type.lotWidth*.7,towerDepth:type.lotDepth*.7,antennaHeight:0,floors:Math.max(1,Math.round(type.height/5)),city:'Pancake City'})));
const pcCivicById=new Map(pcCivicTypes.map(type=>[type.id,type]));
const pcSimClamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
class PcCitySimulation {
 constructor(){
  this.version=1;this.active=true;this.paused=false;this.speed=1;this.month=0;this.funds=500000;this.debt=0;this.roadCondition=100;this.accumulator=0;
  this.taxes={residential:9,commercial:9,industrial:9};
  this.funding={power:100,water:100,waste:100,education:100,health:100,police:100,fire:100,park:100,roads:100};
  this.records=new Map;this.descriptors=new WeakMap;this.candidates=[];this.facilities=[];this.componentByRoad=new Map;this.roadLength=0;this.history=[];this.ledger=[];this.last={population:0,jobs:0,income:0,expenses:0,approval:55,demand:{residential:70,commercial:20,industrial:30}};
 }
 capture(){return structuredClone({version:1,active:this.active,paused:this.paused,speed:this.speed,month:this.month,funds:this.funds,debt:this.debt,roadCondition:this.roadCondition,taxes:this.taxes,funding:this.funding,records:[...this.records],history:this.history,ledger:this.ledger,last:this.last});}
 restore(data){
  if(data?.version!==1||!Number.isFinite(data.funds)||!Number.isInteger(data.month)||data.month<0||!Array.isArray(data.records))throw Error('Unsupported or invalid simulation snapshot.');
  const next=structuredClone(data);for(const key of ['active','paused'])if(typeof next[key]!=='boolean')throw Error('Invalid simulation mode.');
  if(!Array.isArray(next.history)||!Array.isArray(next.ledger)||!next.last||Object.keys(this.taxes).some(k=>!Number.isFinite(next.taxes?.[k]))||Object.keys(this.funding).some(k=>!Number.isFinite(next.funding?.[k])))throw Error('Incomplete simulation snapshot.');
  for(const [kind,value]of Object.entries(next.taxes||{}))if(!['residential','commercial','industrial'].includes(kind)||!Number.isFinite(value)||value<0||value>20)throw Error('Invalid tax rate.');
  for(const [kind,value]of Object.entries(next.funding||{}))if(!(kind in this.funding)||!Number.isFinite(value)||value<0||value>150)throw Error('Invalid funding.');
  if(!Number.isFinite(next.debt)||next.debt<0||![1,3,12].includes(next.speed)||!Number.isFinite(next.roadCondition)||next.roadCondition<0||next.roadCondition>100)throw Error('Invalid financial snapshot.');
  for(const [id,record]of next.records)if(typeof id!=='string'||!Number.isFinite(record.occupants)||record.occupants<0||typeof record.developed!=='boolean')throw Error('Invalid building record.');
  for(const key of ['active','paused','speed','month','funds','debt','roadCondition','taxes','funding','history','ledger','last'])this[key]=next[key];this.records=new Map(next.records);this.accumulator=0;
 }
 setCandidates(candidates){
  this.candidates=candidates;
  const ids=new Set(candidates.map(b=>b.id));for(const id of this.records.keys())if(!ids.has(id))this.records.delete(id);
  for(const b of candidates)if(!this.records.has(b.id))this.records.set(b.id,{developed:false,occupants:0,wealth:1,vacantMonths:0});
 }
 describe(b){
  if(this.descriptors.has(b))return this.descriptors.get(b);
  const residential=b.zone==='rowhouses',service=b.office?.catalogueId&&typeof pcCatalogueFind==='function'&&pcCatalogueFind(b.office.catalogueId)?.type==='services';
  const result={kind:residential?'residential':'commercial',residential,service,capacity:Math.max(1,Math.round((b.area||100)*Math.max(1,b.floors||2)/(residential?38:service?35:22)))};this.descriptors.set(b,result);return result;
 }
 setWorld(facilities,roadLength){this.facilities=facilities;this.roadLength=Math.max(0,roadLength);}
 canSpend(amount){return !this.active||this.funds>=Math.max(0,Math.round(amount));}
 spend(amount,reason){amount=Math.max(0,Math.round(amount));if(!this.canSpend(amount))return false;if(this.active){this.funds-=amount;this.ledger.push({month:this.month,amount:-amount,reason});this.ledger=this.ledger.slice(-80);}return true;}
 setTax(kind,value){if(!(kind in this.taxes)||!Number.isFinite(value)||value<0||value>20)return false;this.taxes[kind]=Math.round(value*10)/10;return true;}
 setFunding(kind,value){if(!(kind in this.funding)||!Number.isFinite(value)||value<0||value>150)return false;this.funding[kind]=Math.round(value);return true;}
 loan(){if(this.debt>=200000)return false;this.funds+=50000;this.debt+=50000;this.ledger.push({month:this.month,amount:50000,reason:'Municipal loan'});return true;}
 repay(){const amount=Math.min(50000,this.debt);if(!amount||this.funds<amount)return false;this.funds-=amount;this.debt-=amount;return true;}
 coverage(kind,b,population){
  let quality=0;
  for(const f of this.facilities){const t=pcCivicById.get(f.typeId);if(t?.kind!==kind||!t.radius)continue;const funding=this.funding[kind]/100,distance=Math.hypot(b.x-f.x,b.z-f.z),radius=t.radius*Math.sqrt(funding);
   if(distance<radius)quality=Math.max(quality,(1-distance/radius)*Math.min(1.2,funding)*Math.min(1,t.capacity/Math.max(1,population*(kind==='education'?.2:1))));
  }return pcSimClamp(quality);
 }
 tick(){
  if(!this.active||this.paused)return false;
  this.month++;this.roadCondition=pcSimClamp(this.roadCondition+(this.funding.roads/100-1)*2,0,100);let population=0,jobs=0,capacityR=0,capacityC=0;
  for(const b of this.candidates){const d=this.describe(b),r=this.records.get(b.id);r.occupants=Math.min(r.occupants,d.capacity);if(d.residential){population+=r.occupants;capacityR+=d.capacity;}else{jobs+=r.occupants;capacityC+=d.capacity;}}
  const resources={power:0,water:0,waste:0};let upkeep=0,pollution=0;
  for(const f of this.facilities){const t=pcCivicById.get(f.typeId);if(!t)continue;const funding=this.funding[t.kind]/100;upkeep+=t.upkeep*funding;if(t.kind in resources)resources[t.kind]+=t.capacity*Math.min(1.5,funding);pollution+=t.pollution||0;}
  const powerNeed=population*.16+jobs*.22+this.facilities.length*5,waterNeed=population*.20+jobs*.12;
  const power=resources.power?pcSimClamp(resources.power/Math.max(20,powerNeed)):0;
  const water=resources.water?pcSimClamp(resources.water/Math.max(20,waterNeed))*power:0;
  const wasteNeed=population*.06+jobs*.025,waste=resources.waste?pcSimClamp(resources.waste/Math.max(1,wasteNeed)):population?0:1;
  const unemployment=population?pcSimClamp(1-jobs/Math.max(1,population*.48)):0;
  const demand={residential:Math.round(pcSimClamp(.58+(jobs-population*.48)/Math.max(100,population*.6)-(this.taxes.residential-9)*.055-unemployment*.3,-1,1)*100),commercial:Math.round(pcSimClamp(.15+(population*.50-jobs)/Math.max(100,population*.65)-(this.taxes.commercial-9)*.055,-1,1)*100),industrial:Math.round(pcSimClamp(.30+unemployment*.6-(this.taxes.industrial-9)*.055,-1,1)*100)};
  let newlyDeveloped=0,education=0,health=0,crime=0,fireRisk=0,landValue=0,income=0;
  for(const b of this.candidates){
   const d=this.describe(b),r=this.records.get(b.id),school=this.coverage('education',b,population),clinic=this.coverage('health',b,population),police=this.coverage('police',b,population),fire=this.coverage('fire',b,population),park=this.coverage('park',b,population);
   let localPollution=0;for(const f of this.facilities){const t=pcCivicById.get(f.typeId);localPollution+=Math.max(0,(t?.pollution||0)*(1-Math.hypot(b.x-f.x,b.z-f.z)/700));}
   const desirability=pcSimClamp(.54+park*.2+school*.13+clinic*.13+police*.08-localPollution/220-(1-waste)*.10);
   const wantsWater=!d.residential||d.capacity>70,utilities=power*(wantsWater?water:1);
   if(!r.developed&&newlyDeveloped<3&&demand[d.kind]>0&&utilities>.6&&desirability>.3){r.developed=true;r.builtMonth=this.month;newlyDeveloped++;}
   if(!r.developed)continue;
   let target=d.capacity*pcSimClamp(.35+demand[d.kind]/100)*utilities*desirability*(.2+.8*this.roadCondition/100);
   const component=this.componentByRoad.get(b.roadId),reachable=other=>component!==undefined&&component===this.componentByRoad.get(other.roadId)&&Math.hypot(other.x-b.x,other.z-b.z)<=1600;
   if(this.componentByRoad.size){
    if(d.residential){const localJobs=this.candidates.filter(other=>!this.describe(other).residential&&reachable(other)).reduce((sum,other)=>sum+(this.records.get(other.id)?.occupants||0),0);target*=.25+.75*pcSimClamp(localJobs/Math.max(1,population*.48));}
    else {const localResidents=this.candidates.filter(other=>this.describe(other).residential&&reachable(other)).reduce((sum,other)=>sum+(this.records.get(other.id)?.occupants||0),0),offices=Math.max(1,this.candidates.filter(other=>!this.describe(other).residential&&reachable(other)).length);target=Math.min(target,Math.max(2,localResidents*.5/offices));}
   }else if(!d.residential)target=Math.min(target,Math.max(2,population*.5/Math.max(1,this.candidates.filter(other=>!this.describe(other).residential).length)));
   const movement=Math.max(1,Math.ceil(d.capacity*.025));r.occupants=Math.max(0,Math.min(d.capacity,Math.round(r.occupants+pcSimClamp(target-r.occupants,-movement,movement))));
   r.vacantMonths=r.occupants?0:r.vacantMonths+1;r.outageMonths=utilities<.4?(r.outageMonths||0)+1:0;r.abandoned=r.vacantMonths>=8||r.outageMonths>=6;
   if(r.abandoned&&utilities>.8&&demand[d.kind]>30){r.abandoned=false;r.vacantMonths=0;}
   r.wealth=school>.55&&clinic>.5&&park>.3&&water>.8?3:school>.2&&clinic>.15&&water>.8?2:1;
   r.desirability=Math.round(desirability*100);r.powered=power>.8;r.watered=water>.8;
   const rate=this.taxes[d.kind];income+=r.occupants*(d.residential?1.35:2.2)*(1+(r.wealth-1)*.35)*rate/9;
   education+=school;health+=clinic;crime+=pcSimClamp(.32+unemployment*.45-police*.65);fireRisk+=pcSimClamp(.30+localPollution/300-fire*.55);landValue+=desirability;
  }
  population=0;jobs=0;let occupiedBuildings=0;for(const b of this.candidates){const r=this.records.get(b.id);if(this.describe(b).residential)population+=r.occupants;else jobs+=r.occupants;if(r.developed)occupiedBuildings++;}
  const roadExpense=this.roadLength*.055*this.funding.roads/100,interest=this.debt*.008;
  const expenses=Math.round(upkeep+roadExpense+interest);income=Math.round(income);this.funds+=income-expenses;
  const n=Math.max(1,occupiedBuildings),approval=Math.round(pcSimClamp(.52+landValue/n*.3-unemployment*.20-(1-power)*.15-(1-waste)*.1-Math.max(0,this.taxes.residential-9)*.025)*100);
  this.last={population,jobs,income,expenses,net:income-expenses,approval,demand,power,water,waste,powerNeed,waterNeed,wasteNeed,resources,education:Math.round(education/n*100),health:Math.round(health/n*100),crime:Math.round(crime/n*100),fireRisk:Math.round(fireRisk/n*100),landValue:Math.round(landValue/n*100),unemployment:Math.round(unemployment*100),capacityR,capacityC,developed:occupiedBuildings,pollution:Math.round(pollution),roadExpense:Math.round(roadExpense),interest:Math.round(interest)};
  this.history.push({month:this.month,population,jobs,funds:this.funds,net:income-expenses});this.history=this.history.slice(-240);return true;
 }
 advance(seconds){if(!Number.isFinite(seconds)||seconds<0||!this.active||this.paused)return 0;this.accumulator+=Math.min(seconds,1)*this.speed;let steps=0;while(this.accumulator>=6&&steps<4){this.accumulator-=6;this.tick();steps++;}return steps;}
}
function pcSimulationBuildings(collection,buildings){
 const sim=collection.network.citySimulation;
 if(!sim||!sim.active||!sim.ready)return buildings;
 sim.setCandidates(buildings);
 return buildings.filter(b=>sim.records.get(b.id)?.developed).map(b=>{
  const record=sim.records.get(b.id),abandoned=Boolean(record.abandoned);
  const visible={...b,pcSimAbandoned:abandoned,pcSimStatus:{...record},signature:b.signature+'|abandoned:'+abandoned};
  const facadeSite=pcFacadeSites.get(b);
  if(facadeSite)pcFacadeSites.set(visible,facadeSite);
  return visible;
 });
}
const pcSimVacantMaterials=new WeakMap;
function pcSimVacantMaterial(material){if(!pcSimVacantMaterials.has(material)){const vacant=material.clone();vacant.color.multiplyScalar(.38);vacant.onBeforeCompile=material.onBeforeCompile;vacant.customProgramCacheKey=()=>material.customProgramCacheKey()+'-vacant';pcSimVacantMaterials.set(material,vacant);}return pcSimVacantMaterials.get(material);}
