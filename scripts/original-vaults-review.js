// Disposable comparison using actual Office assignments and the archived scene model.
{
  const panel=document.createElement('details');
  panel.open=true;
  panel.style.cssText='position:fixed;top:12px;left:12px;z-index:46;padding:11px;max-width:275px;background:#173044ed;color:white;font:13px system-ui;border-radius:5px';
  panel.innerHTML='<summary>Original Vault Offices</summary><p><button data-view="all">All four</button> <button data-view="A">Symmetrical</button> <button data-view="B">Twin</button> <button data-view="C">Atrium</button> <button data-view="R">Benchmark</button></p><p><button data-detail="roof">Roof</button> <button data-detail="entry">Entrance</button></p><span id="vault-status">Preparing Test City…</span><output id="vault-report" hidden></output>';
  for(const button of panel.querySelectorAll('button'))button.style.cssText='color:#173047;background:#edf4f6;border:1px solid #879eab;padding:4px 7px;margin:2px';
  document.body.append(panel);
  const development=document.querySelector('#bmo-development');if(development)development.open=false;
  const status=panel.querySelector('#vault-status'),report=panel.querySelector('#vault-report'),subjects={};
  let selected='A';
  try{
    const terrain=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
    ll.setMap(terrain);await Gt.setTerrain(terrain,_e);
    const roads=[];
    for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
    _e.addBatch(roads);Gt.drawRoads(_e);Vh.setPropertyZone('offices');
    const used=new Set();
    for(const [i,type] of pcVaultTypes.entries()){
      const floors={A:29,B:33,C:38}[type];
      const cost=p=>Math.hypot(p.x-(-255+i*163),p.z+75)+Math.abs(pcGrowableFacing(p).angle)*95;
      const p=Vh.properties.filter(p=>!used.has(p.id)&&pcVaultFit(p,type,floors).ok).sort((a,b)=>cost(a)-cost(b))[0];
      if(!p)throw Error('No compatible comparison lot for '+type);
      const {record:fit}=pcVaultFit(p,type,floors),record={...fit,parameters:{...fit.parameters,palette:i}},asset=pcVaultAsset(record);
      Vh.pcCatalogueAssignments??=new Map;
      Vh.pcCatalogueAssignments.set(p.id,asset.key);
      pcVaultRemember(Vh,p,asset);Vh.applyProperties([p],'offices');used.add(p.id);
      const b=Vh.buildings.find(b=>b.propertyIds.includes(p.id)&&b.office.lightweightVault);
      if(!b)throw Error('Office assignment missing for '+type);
      const r=b.office.lightweightVault,heights=r.grid.slabs.map(s=>s.end);
      const triangulated=pcVaultReady().generator.generate(r.parameters);
      subjects[type]={x:r.placement.x,z:r.placement.z,base:b.y,angle:r.placement.angle,height:r.grid.roofTop,entry:b.entrance,
        storeys:r.parameters.storeys,lot:Math.round(p.area),podium:Math.round(sn(Te(r.grid.groundRing.map(([x,z])=>({x,z}))))),
        triangles:triangulated.userData.triangles,meshes:triangulated.children.length,heights};
      pcVaultReady().generator.release(triangulated);
    }
    const reference=barrelVaultReference(pcOhneeEngine()).buildStudy();
    const x=246,z=subjects.B.z,base=terrain.heightAt(x,z)+.09;
    reference.position.set(x,base,z);Gt.vaultReviewScene.add(reference);
    terrain.forest.clearDevelopment([{footprint:[{x:x-32,z:z-20},{x:x+32,z:z-20},{x:x+32,z:z+28},{x:x-32,z:z+28}]}]);
    Gt.refreshTrees({final:true});
    subjects.R={x,z,base,angle:0,height:121.75,entry:{x,z:z+26.1},triangles:reference.userData.triangles,meshes:reference.children.length};
    Gt.drawZoning();Gn('hand');Ui();
    const controls=Gt.controls;
    controls.enableDamping=false;
    function frame(view,detail='tower'){
      if(view==='all'){
        const x=(subjects.A.x+subjects.R.x)/2,z=subjects.B.z;
        controls.object.fov=Math.max(46,Math.atan(Math.tan(Math.PI*.18)/controls.object.aspect)*360/Math.PI);controls.target.set(x,57,z);controls.object.position.set(x+32,362,z+500);
      }else{
        selected=view;
        const a=subjects[view],radius=detail==='roof'?130:detail==='entry'?86:a.height*2.85;
        const y=detail==='roof'?a.height-5:detail==='entry'?6:a.height*.47;
        const tx=detail==='entry'?a.entry.x:a.x,tz=detail==='entry'?a.entry.z:a.z;
        const azimuth=a.angle+.419,elevation=detail==='entry'?.48:.707;
        controls.object.fov=detail==='tower'?27:29;controls.target.set(tx,a.base+y,tz);
        controls.object.position.set(tx+Math.sin(azimuth)*Math.cos(elevation)*radius,a.base+y+Math.sin(elevation)*radius,tz+Math.cos(azimuth)*Math.cos(elevation)*radius);
      }
      controls.object.updateProjectionMatrix();controls.update();
      status.textContent=view==='all'?'Three experimental towers and one archived benchmark':('Inspecting '+view+' · '+detail);
      report.textContent=JSON.stringify({subjects,resources:pcVaultInfo(),view,detail,normalSpawning:false});
    }
    for(const button of panel.querySelectorAll('[data-view]'))button.onclick=()=>frame(button.dataset.view);
    for(const button of panel.querySelectorAll('[data-detail]'))button.onclick=()=>frame(selected,button.dataset.detail);
    frame('all');
  }catch(error){status.textContent=error.message;throw error;}
}
