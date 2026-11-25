// Review scenarios call the actual Office-zoning entry point.
{
  const panel=document.createElement('details');
  panel.open=true;
  panel.style.cssText='position:fixed;top:12px;left:12px;z-index:46;padding:11px 12px;background:#173044f5;color:white;font:13px system-ui;border-radius:6px';
  panel.innerHTML='<summary>Traditional Offices</summary><p><button data-tr-view="all">Comparison</button> <button data-tr-view="A">Grand Courtyard</button> <button data-tr-view="B">Metropolitan</button> <button data-tr-view="C">Heritage</button></p><p><button data-tr-detail="roof">Roof</button> <button data-tr-detail="entry">Entrance</button> <button data-tr-mode="mixed">Mixed growth</button></p><span id="traditional-status">Preparing Test City…</span><output id="traditional-report" hidden></output>';
  for(const button of panel.querySelectorAll('button'))button.style.cssText='background:#edf4f6;color:#173047;border:1px solid #879eab;border-radius:3px;padding:4px 7px;cursor:pointer';
  document.body.append(panel);
  const development=document.querySelector('#bmo-development');if(development)development.open=false;
  const status=panel.querySelector('#traditional-status'),output=panel.querySelector('#traditional-report');
  try{
    const terrain=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:920,tileSize:920});
    ll.setMap(terrain);await Gt.setTerrain(terrain,_e);
    const roads=[];
    for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
    _e.addBatch(roads);Gt.drawRoads(_e);Vh.setPropertyZone('offices');
    const empty=structuredClone(_e.captureState().participants.zoning),controls=Gt.controls,subjects={};
    controls.enableDamping=false;
    let selected='A',mode='lineup';
    const fit=(lot,type)=>pcTraditionalFit(lot,type).ok;
    const record=b=>b.office?.lightweightTraditional;
    const towers=()=>Vh.buildings.filter(record);
    function reset(next){
      _e.historyParticipants.get('zoning').restore(structuredClone(empty));Vh.rebuild();
      for(const key of pcTraditionalTypes)delete subjects[key];
      mode=next;
    }
    function lineup(){
      reset('lineup');const used=new Set;
      for(const [index,type] of pcTraditionalTypes.entries()){
        const gx=80+index*56,gz=-434;
        const cost=lot=>Math.abs(lot.x-gx)+Math.abs(lot.z-gz)*2+Math.abs(pcGrowableFacing(lot).angle)*340;
        const lot=Vh.properties.filter(p=>!used.has(p.id)&&fit(p,type)).sort((a,b)=>cost(a)-cost(b))[0];
        if(!lot)throw Error('No eligible Office lot for '+pcTraditionalNames[index]);
        used.add(lot.id);pcTraditionalSetControl(Vh,{enabled:true,type});Vh.applyProperties([lot],'offices');
        const building=towers().find(b=>b.propertyIds.includes(lot.id));
        if(!building)throw Error('Office zoning failed for '+pcTraditionalNames[index]);
        subjects[type]=building;
      }
      pcTraditionalSetControl(Vh,{enabled:true,type:'mix'});
      Gt.drawZoning();frame('all');
    }
    function mixed(){
      reset('mixed');pcTraditionalSetControl(Vh,{enabled:true,type:'mix'});
      const lots=Vh.properties.filter(lot=>pcTraditionalTypes.some(type=>fit(lot,type)));
      Vh.applyProperties(lots,'offices');
      for(const building of towers())subjects[record(building).parameters.archetype]??=building;
      Gt.drawZoning();frame('all');
    }
    function frame(type,detail='tower'){
      if(type==='all'){
        const city=mode==='mixed';
        if(city){
          controls.target.set(0,50,0);controls.object.position.set(42,562,751);controls.object.fov=48;
        }else{
          const positions=Object.values(subjects).map(b=>record(b).placement);
          const minX=Math.min(...positions.map(p=>p.x)),maxX=Math.max(...positions.map(p=>p.x));
          const x=(minX+maxX)/2,z=positions.reduce((sum,p)=>sum+p.z,0)/positions.length;
          const horizontalSpan=(maxX-minX+75)/Math.max(.6,controls.object.aspect);
          const distance=Math.max(225,horizontalSpan*1.52);
          controls.target.set(x,48,z);controls.object.position.set(x+distance*.075,48+distance*.55,z+distance);controls.object.fov=37;
        }
      }else{
        const b=subjects[type];if(!b)return;
        selected=type;
        const {placement,grid}=record(b),height=grid.roofTop,front=grid.entrance;
        const radius=detail==='roof'?132:detail==='entry'?43:height*2.74;
        const rearCourt=type==='C'&&detail==='roof';
        const yaw=placement.angle+(rearCourt?Math.PI+.26:detail==='entry'?.16:.41);
        const elevation=detail==='roof'?(rearCourt?.65:.79):detail==='entry'?.50:.58;
        const entranceOffset=type==='B'?9.5:0;
        const x=detail==='entry'?b.entrance.x+Math.cos(placement.angle)*entranceOffset:placement.x;
        const z=detail==='entry'?b.entrance.z-Math.sin(placement.angle)*entranceOffset:placement.z;
        const y=b.y+(detail==='roof'?height-4:detail==='entry'?Math.min(7,front.height):height*.48);
        controls.target.set(x,y,z);
        controls.object.position.set(x+Math.sin(yaw)*Math.cos(elevation)*radius,y+Math.sin(elevation)*radius,z+Math.cos(yaw)*Math.cos(elevation)*radius);
        controls.object.fov=detail==='tower'?27:detail==='entry'&&type==='B'?37:30;
      }
      controls.object.updateProjectionMatrix();controls.update();
      status.textContent=type!=='all'?pcTraditionalNames[pcTraditionalTypes.indexOf(type)]+' · '+detail:
        mode==='mixed'?'Mixed Office growth · '+towers().length+' traditional towers':'Three originals grown through Office zoning';
      output.textContent=JSON.stringify({type,detail,mode,towers:towers().length,totalOffices:Vh.buildings.length,
        designs:[...new Set(towers().map(b=>record(b).parameters.archetype))],resources:pcTraditionalInfo()});
    }
    for(const button of panel.querySelectorAll('[data-tr-view]'))button.onclick=()=>button.dataset.trView==='all'?lineup():frame(button.dataset.trView);
    for(const button of panel.querySelectorAll('[data-tr-detail]'))button.onclick=()=>frame(selected,button.dataset.trDetail);
    panel.querySelector('[data-tr-mode=mixed]').onclick=mixed;
    Gn('hand');Ui();lineup();
  }catch(error){status.textContent=error.message;throw error;}
}
