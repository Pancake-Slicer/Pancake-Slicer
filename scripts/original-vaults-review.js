// Disposable comparison using actual Office assignments and the archived scene model.
{
  const panel=document.createElement('details');
  panel.open=true;
  panel.style.cssText='position:fixed;top:12px;left:12px;z-index:46;padding:11px;max-width:275px;background:#173044ed;color:white;font:13px system-ui;border-radius:5px';
  panel.innerHTML='<summary>Original Vault Offices</summary><p><button data-view="all">Comparison</button> <button data-view="A">Symmetrical</button> <button data-view="B">Twin</button> <button data-view="C">Atrium</button> <button data-view="R">Benchmark</button></p><p><button data-mode="benchmarks">Fixed benchmarks</button> <button data-mode="variants">15 variants</button> <button data-mode="next">Next</button> <button data-mode="natural">Natural growth</button></p><p><button data-detail="roof">Roof</button> <button data-detail="entry">Entrance</button></p><span id="vault-status">Preparing Test City…</span><output id="vault-report" hidden></output>';
  for(const button of panel.querySelectorAll('button'))button.style.cssText='color:#173047;background:#edf4f6;border:1px solid #879eab;padding:4px 7px;margin:2px';
  document.body.append(panel);
  const development=document.querySelector('#bmo-development');if(development)development.open=false;
  const status=panel.querySelector('#vault-status'),report=panel.querySelector('#vault-report'),subjects={};
  let selected='A',mode='comparison',index=0;
  const variants=[];
  try{
    const terrain=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
    ll.setMap(terrain);await Gt.setTerrain(terrain,_e);
    const roads=[];
    for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
    _e.addBatch(roads);Gt.drawRoads(_e);Vh.setPropertyZone('offices');
    const empty=structuredClone(_e.captureState().participants.zoning);
    const describe=(b,lot)=>{
      const r=b.office.lightweightVault,g=r.grid,m=pcVaultReady().generator.generate(r.parameters);
      const result={x:r.placement.x,z:r.placement.z,base:b.y,angle:r.placement.angle,height:g.roofTop,entry:b.entrance,
        storeys:r.parameters.storeys,form:r.parameters.form??null,lot:Math.round(lot.area),width:r.parameters.width,depth:r.parameters.depth,
        podium:Math.round(sn(Te(g.groundRing.map(([x,z])=>({x,z}))))),triangles:m.userData.triangles,meshes:m.children.length};
      pcVaultReady().generator.release(m);return result;
    };
    function place(p,type,floors,form,palette){
      const {record:fit}=pcVaultFit(p,type,floors,form),record={...fit,parameters:{...fit.parameters,palette}},asset=pcVaultAsset(record);
      Vh.pcCatalogueAssignments??=new Map;Vh.pcCatalogueAssignments.set(p.id,asset.key);
      pcVaultRemember(Vh,p,asset);Vh.applyProperties([p],'offices');
      const b=Vh.buildings.find(b=>b.propertyIds.includes(p.id)&&b.office.lightweightVault);
      if(!b)throw Error('Office assignment missing for '+type);
      return describe(b,p);
    }
    const comparisonLots=new Set();
    const lineup=[...pcVaultTypes].map((type,i)=>{
      const floors=[29,33,38][i],cost=p=>Math.hypot(p.x-(-310+i*180),p.z+255)+Math.abs(pcGrowableFacing(p).angle)*95;
      const lot=Vh.properties.filter(p=>!comparisonLots.has(p.id)&&pcVaultFit(p,type,floors,i).ok&&pcVaultFit(p,type,floors,null).ok).sort((a,b)=>cost(a)-cost(b))[0];
      if(!lot)throw Error('No comparison lot for '+type);
      comparisonLots.add(lot.id);return {type,floors,lot,palette:i};
    });
    function reset(next){
      _e.historyParticipants.get('zoning').restore(structuredClone(empty));Vh.rebuild();
      for(const type of pcVaultTypes)delete subjects[type];
      variants.length=0;index=0;mode=next;
    }
    function compare(next){
      reset(next);
      for(const {type,floors,lot,palette} of lineup)subjects[type]=place(lot,type,floors,next==='benchmarks'?null:palette,palette);
      Gt.drawZoning();frame('all');
    }
    function portfolio(){
      reset('variants');const used=new Set;
      for(const [i,type] of pcVaultTypes.entries())for(const [j,floors] of [20,25,30,35,40].entries()){
        const form=j%3,options=Vh.properties.filter(p=>!used.has(p.id)).map(p=>[p,pcVaultFit(p,type,floors,form)]).filter(([,f])=>f.ok);
        const cost=([p,f])=>Math.abs(f.record.parameters.width-(46+j*5))*20+Math.hypot(p.x-(-280+i*240),p.z-(-270+j*120));
        const p=options.sort((a,b)=>cost(a)-cost(b))[0]?.[0];
        if(!p)throw Error('No fitted specimen for '+type+' at '+floors+' storeys');
        used.add(p.id);const subject=place(p,type,floors,form,i);
        variants.push({type,subject});subjects[type]??=subject;
      }
      Gt.drawZoning();frame('all');
    }
    function natural(){
      reset('natural');
      const lots=Vh.properties.filter(p=>pcVaultTypes.some(t=>pcVaultFit(p,t).ok));
      Vh.applyProperties(lots,'offices');Gt.drawZoning();
      const towers=Vh.buildings.filter(b=>b.office.lightweightVault);
      for(const b of towers){const r=b.office.lightweightVault;subjects[r.parameters.archetype]??=describe(b,lots.find(p=>p.id===r.lotId));}
      frame('all');
    }
    const reference=barrelVaultReference(pcOhneeEngine()).buildStudy();
    const x=246,z=lineup[1].lot.z,base=terrain.heightAt(x,z)+.09;
    reference.position.set(x,base,z);Gt.vaultReviewScene.add(reference);
    terrain.forest.clearDevelopment([{footprint:[{x:x-32,z:z-20},{x:x+32,z:z-20},{x:x+32,z:z+28},{x:x-32,z:z+28}]}]);
    Gt.refreshTrees({final:true});
    subjects.R={x,z,base,angle:0,height:121.75,entry:{x,z:z+26.1},triangles:reference.userData.triangles,meshes:reference.children.length};
    Gt.drawZoning();Gn('hand');Ui();
    const controls=Gt.controls;
    controls.enableDamping=false;
    function frame(view,detail='tower'){
      if(view==='all'){
        const city=mode==="natural"||mode==="variants",x=city?0:(subjects.A.x+subjects.R.x)/2,z=city?0:subjects.B.z;
        controls.object.fov=Math.max(46,Math.atan(Math.tan(Math.PI*.18)/controls.object.aspect)*360/Math.PI);controls.target.set(x,57,z);controls.object.position.set(x+32,city?510:362,z+(city?750:500));
      }else{
        if(!subjects[view])return;
        selected=view;
        const a=subjects[view],radius=detail==='roof'?130:detail==='entry'?86:a.height*2.85;
        const y=detail==='roof'?a.height-5:detail==='entry'?6:a.height*.47;
        const tx=detail==='entry'?a.entry.x:a.x,tz=detail==='entry'?a.entry.z:a.z;
        const azimuth=a.angle+.419,elevation=detail==='entry'?.48:.707;
        controls.object.fov=detail==='tower'?27:29;controls.target.set(tx,a.base+y,tz);
        controls.object.position.set(tx+Math.sin(azimuth)*Math.cos(elevation)*radius,a.base+y+Math.sin(elevation)*radius,tz+Math.cos(azimuth)*Math.cos(elevation)*radius);
      }
      controls.object.updateProjectionMatrix();controls.update();
      const records=Vh.buildings.filter(b=>b.office.lightweightVault).map(b=>b.office.lightweightVault);
      const summary=mode==='variants'?'15 fitted Office variants':mode==='natural'?'Natural Office growth · '+records.length+' Vault towers':mode==='benchmarks'?'Three fixed prototypes and the archived reference':'Three production forms and the archived benchmark';
      status.textContent=view==='all'?summary:('Inspecting '+view+' · '+detail);
      report.textContent=JSON.stringify({subjects,resources:pcVaultInfo(),view,detail,mode,normalSpawning:true,variants,
        towers:records.length,totalOffices:Vh.buildings.length,types:[...new Set(records.map(r=>r.parameters.archetype))]});
    }
    for(const button of panel.querySelectorAll('[data-view]'))button.onclick=()=>button.dataset.view==='all'?compare('comparison'):frame(button.dataset.view);
    for(const button of panel.querySelectorAll('[data-detail]'))button.onclick=()=>frame(selected,button.dataset.detail);
    const run=fn=>()=>{try{fn();}catch(error){status.textContent=error.message;throw error;}};
    panel.querySelector('[data-mode=benchmarks]').onclick=run(()=>compare('benchmarks'));
    panel.querySelector('[data-mode=variants]').onclick=run(portfolio);
    panel.querySelector('[data-mode=natural]').onclick=run(natural);
    panel.querySelector('[data-mode=next]').onclick=run(()=>{
      if(!variants.length)portfolio();
      const {type,subject}=variants[index++%variants.length];subjects[type]=subject;frame(type);
    });
    compare('comparison');
  }catch(error){status.textContent=error.message;throw error;}
}
