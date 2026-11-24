function pcAttachCitySimulation(network,landmarks,zoning,world,{ready,selectService,onMessage}){
 const sim=new PcCitySimulation;network.citySimulation=sim;sim.ready=false;
 network.historyParticipants.set('city-simulation',{capture:()=>sim.capture(),restore:data=>{if(data){sim.restore(data);zoning.revision++;sim.uiDirty=true;}}});
 const root=document.createElement('section');root.className='city-hud';root.hidden=true;root.setAttribute('aria-label','City simulation');
 root.innerHTML=`<div class="city-summary"><strong>Pancake City</strong><span data-stat="date"></span><span data-stat="funds"></span><span data-stat="population"></span><button data-action="pause">Pause</button><select aria-label="Simulation speed" data-control="speed"><option value="1">1×</option><option value="3">3×</option><option value="12">12×</option></select><button data-action="month">Next month</button><button data-action="panel" aria-expanded="false">City hall</button></div>
 <aside class="city-dashboard" hidden aria-label="City hall"><h2>City hall</h2><p data-stat="advice"></p><div class="city-metrics" data-stat="metrics"></div><div data-stat="demand"></div>
 <details open><summary>City services</summary><label>Facility<select aria-label="City service" data-control="facility">${pcCivicTypes.map(t=>`<option value="${t.id}">${t.name} · $${t.cost.toLocaleString()} + $${t.upkeep}/month</option>`).join('')}</select></label><button data-action="service">Place selected service</button><p class="city-note">Place power, zone homes, then add water and offices. Services use the existing building placement tool.</p></details>
 <details><summary>Taxes and budget</summary>${['residential','commercial'].map(kind=>`<label>${kind==='residential'?'Residential':'Commercial'} tax %<input aria-label="${kind} tax" type="number" min="0" max="20" step="0.5" value="9" data-tax="${kind}"></label>`).join('')}<div data-stat="budget"></div><button data-action="loan">Borrow $50,000</button><button data-action="repay">Repay up to $50,000</button></details>
 <details><summary>Department funding</summary>${Object.keys(sim.funding).map(kind=>`<label>${kind}<input aria-label="${kind} funding" type="range" min="0" max="150" step="10" value="100" data-funding="${kind}"><output data-funding-output="${kind}">100%</output></label>`).join('')}</details>
 <details><summary>City trends</summary><div data-stat="trends"></div></details><label class="city-mode"><input type="checkbox" data-control="sandbox"> Free-building sandbox</label><p class="city-note">Residential and commercial management only. Power and water capacity currently serve the whole city. Refreshing resets this city; full-city save/load is not available yet.</p></aside>`;
 document.querySelector('#app').append(root);const query=selector=>root.querySelector(selector),money=value=>'$'+Math.round(value).toLocaleString();
 let roadSource=null,roadRevision=-1;
 const totals=()=>{sim.setWorld(landmarks.items,sim.roadLength);
  if(roadSource!==network.roads||roadRevision!==network.revision){roadSource=network.roads;roadRevision=network.revision;let length=0;for(const road of network.roads.filter(r=>!r.outsideGenerated))for(let i=1;i<road.points.length;i++)length+=Math.hypot(road.points[i].x-road.points[i-1].x,road.points[i].z-road.points[i-1].z);sim.roadLength=length;const parent=new Map(network.roads.filter(r=>Ut(r.typeId).family!=='rail').map(r=>[r.id,r.id])),find=id=>{let p=id;while(parent.get(p)!==p)p=parent.get(p);return p;};
   for(const node of network.graph.nodes){const ids=node.edges.map(id=>network.graph.edges[id].roadId).filter(id=>parent.has(id));for(const id of ids.slice(1))parent.set(find(id),find(ids[0]));}
   sim.componentByRoad=new Map([...parent.keys()].map(id=>[id,find(id)]));
  }
 };
 const refreshWorld=()=>{zoning.revision++;zoning.rebuild();world.drawZoning();};
 function redraw(){
  const s=sim.last;query('[data-stat="date"]').textContent=`${2000+Math.floor(sim.month/12)}-${String(sim.month%12+1).padStart(2,'0')}`;
  query('[data-stat="funds"]').textContent=money(sim.funds);query('[data-stat="population"]').textContent=`${s.population.toLocaleString()} residents · ${s.jobs.toLocaleString()} jobs`;
  query('[data-action="pause"]').textContent=sim.paused?'Resume':'Pause';query('[data-control="speed"]').value=String(sim.speed);query('[data-control="sandbox"]').checked=!sim.active;
  const advice=!sim.active?'Sandbox: construction is free and all zoned buildings appear immediately.':sim.funds<0?'The city is in deficit. Reduce spending, raise revenue, or arrange a loan.':!s.power?'Place a power station to allow development.':!s.population?'Zone homes and advance a month. Larger developments also need water.':!s.water?'Add water supply for offices and larger homes.':s.unemployment>35?'Residents need jobs. Zone offices near your housing.':s.net<0?'Spending exceeds income. Check service funding and grow the tax base.':'Keep jobs, homes and services in balance.';
  query('[data-stat="advice"]').textContent=advice;
  const percent=value=>Math.round((value||0)*100)+'%';query('[data-stat="metrics"]').innerHTML=[['Power',percent(s.power)],['Water',percent(s.water)],['Waste handled',percent(s.waste)],['Mayor approval',s.approval+'%'],['Education',(s.education||0)+'%'],['Health',(s.health||0)+'%'],['Crime',(s.crime||0)+'%'],['Fire risk',(s.fireRisk||0)+'%'],['Land value',(s.landValue||0)+'%'],['Unemployment',(s.unemployment||0)+'%'],['Road condition',Math.round(sim.roadCondition)+'%']].map(([name,value])=>`<div><span>${name}</span><strong>${value}</strong></div>`).join('');
  query('[data-stat="demand"]').innerHTML=['residential','commercial'].map(kind=>`<label>${kind==='residential'?'Housing demand':'Commercial demand'} <strong>${s.demand[kind]}</strong><meter min="-100" max="100" value="${s.demand[kind]}" aria-label="${kind} demand"></meter></label>`).join('');
  query('[data-stat="budget"]').innerHTML=`<p>Monthly income ${money(s.income)}<br>Monthly expenses ${money(s.expenses)}<br>Monthly balance ${money(s.net||0)}<br>Loans outstanding ${money(sim.debt)}</p>`;
  query('[data-stat="trends"]').innerHTML=sim.history.slice(-12).reverse().map(h=>`<div>Month ${h.month}: ${h.population} residents · ${h.jobs} jobs · ${money(h.net)}/month</div>`).join('')||'Advance a month to begin the city history.';
  for(const input of root.querySelectorAll('[data-tax]'))input.value=String(sim.taxes[input.dataset.tax]);
  for(const input of root.querySelectorAll('[data-funding]')){input.value=String(sim.funding[input.dataset.funding]);query(`[data-funding-output="${input.dataset.funding}"]`).textContent=input.value+'%';}
 }
 function transact(callback){network.remember();callback();totals();refreshWorld();redraw();}
 root.addEventListener('pointerdown',event=>event.stopPropagation());root.addEventListener('wheel',event=>event.stopPropagation());root.addEventListener('keydown',event=>event.stopPropagation());
 root.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;
  if(action==='panel'){const panel=query('.city-dashboard');panel.hidden=!panel.hidden;event.target.setAttribute('aria-expanded',String(!panel.hidden));}
  if(action==='pause'){sim.paused=!sim.paused;sim.accumulator=0;redraw();}
  if(action==='month'){totals();const paused=sim.paused;sim.paused=false;sim.tick();sim.paused=paused;refreshWorld();redraw();}
  if(action==='service'){selectService(query('[data-control="facility"]').value);query('.city-dashboard').hidden=true;query('[data-action="panel"]').setAttribute('aria-expanded','false');}
  if(action==='loan')transact(()=>{if(!sim.loan())onMessage('The municipal loan limit is $200,000.');});
  if(action==='repay')transact(()=>{if(!sim.repay())onMessage('No affordable loan repayment is available.');});
 });
 root.addEventListener('change',event=>{const input=event.target;
  if(input.dataset.control==='speed'){sim.speed=Number(input.value);sim.accumulator=0;}
  if(input.dataset.control==='sandbox')transact(()=>{sim.active=!input.checked;});
  if(input.dataset.tax)transact(()=>sim.setTax(input.dataset.tax,Number(input.value)));
  if(input.dataset.funding)transact(()=>sim.setFunding(input.dataset.funding,Number(input.value)));
 });
 const roadCost=(points,options={})=>Math.round(points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.z-points[i].z),0)*Ut(options.typeId||Ja).width*.65);
 function wrap(owner,name,costOf,failed){const original=owner[name];owner[name]=function(...args){const charged=sim.ready&&sim.active,cost=charged?costOf(...args):0;if(charged&&!sim.canSpend(cost)){onMessage(`This project needs ${money(cost)}. Available funds: ${money(sim.funds)}.`);return failed();}const result=original.apply(this,args);if(result===true||result?.ok===true){if(charged)sim.spend(cost,name==='place'?'Civic/landmark construction':name==='applyProperties'?'Zoning':'Road construction');totals();redraw();}return result;};}
 wrap(network,'add',(points,kind,indices,options)=>roadCost(points,options),()=>({ok:false,error:'Insufficient city funds.'}));
 wrap(network,'addBatch',(lines,options)=>lines.reduce((sum,line)=>sum+roadCost(line,options),0),()=>({ok:false,error:'Insufficient city funds.'}));
 wrap(landmarks,'place',candidate=>pcCivicById.get(candidate.typeId)?.cost||100000,()=>({ok:false,error:'Insufficient city funds.'}));
 wrap(zoning,'applyProperties',(properties,zone='rowhouses',erase=false)=>{const selected=pcOfficeSelection(zoning,properties,zone,erase);return erase?0:Math.ceil(sn(je(ve(selected.flatMap(Ip)),zoning.regions[zone]||[]))*.08);},()=>false);
 const picker=document.querySelector('#landmark-type');picker.addEventListener('change',()=>{const t=pcCivicById.get(picker.value);if(!t){document.querySelector('.landmark-portrait').hidden=false;return;}document.querySelector('#landmark-name').textContent=t.name;document.querySelector('#landmark-location').textContent='City service · '+t.kind;document.querySelector('.landmark-portrait').hidden=true;document.querySelector('.landmark-size').textContent=`${t.lotWidth} × ${t.lotDepth} m site`;document.querySelector('.landmark-note').textContent=`Construction ${money(t.cost)} · upkeep ${money(t.upkeep)}/month at full funding${t.radius?' · service radius '+t.radius+' m':''}.`;});
 let previous=performance.now();const timer=setInterval(()=>{const now=performance.now(),dt=(now-previous)/1000;previous=now;const available=ready();root.hidden=!available;if(!available||document.hidden)return;
  if(!sim.ready){sim.ready=true;totals();refreshWorld();redraw();}
  totals();if(sim.advance(dt)){refreshWorld();redraw();}else if(sim.uiDirty){redraw();sim.uiDirty=false;}
 },250);
 window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 return {simulation:sim,root,redraw,refreshWorld};
}
