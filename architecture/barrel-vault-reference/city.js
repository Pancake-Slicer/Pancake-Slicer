// This block is included only in the disposable Benchmark Test City export.
{
  const panel=document.createElement('details');
  panel.open=true;
  panel.style.cssText='position:fixed;top:12px;left:12px;z-index:45;padding:10px;background:#173044ed;color:white;font:13px system-ui;border-radius:5px';
  panel.innerHTML='<summary>Barrel-vault benchmark</summary><p><button id="bv-matched">Reference angle</button> <button id="bv-crown">Crown</button> <button id="bv-entrance">Entrance</button></p><span id="bv-status">Preparing Test City…</span>';
  for(const button of panel.querySelectorAll('button'))button.style.cssText='color:#173047;background:#edf4f6;border:1px solid #879eab;padding:4px 7px';
  document.body.append(panel);
  const status=panel.querySelector('#bv-status');
  try{
    const terrain=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:480,tileSize:480});
    ll.setMap(terrain);
    await Gt.setTerrain(terrain,_e);
    const base=terrain.heightAt(0,0)+.10;
    const {buildStudy,buildSite,createMaterials}=barrelVaultPackage(pcOhneeEngine());
    const materials=createMaterials(),model=buildStudy(materials),site=buildSite(materials);
    for(const mesh of [...site.children])if(mesh.name!=='deck'){site.remove(mesh);mesh.geometry.dispose();}
    model.position.y=base;site.position.y=base;
    Gt.barrelVaultScene.add(model,site);
    // Clear vegetation only from the disposable benchmark pavement.
    const footprint=[{x:-35,z:-24},{x:35,z:-24},{x:35,z:31},{x:-35,z:31}];
    terrain.forest.clearDevelopment([{footprint}]);
    Gt.refreshTrees({final:true});
    _e.addBatch([[{x:-165,z:36.9},{x:165,z:36.9}],[{x:-112,z:-126},{x:-112,z:36.9}],[{x:112,z:-126},{x:112,z:36.9}],[{x:-112,z:-126},{x:112,z:-126}]]);
    Gt.drawRoads(_e);
    Vh.setPropertyZone('offices');
    const controls=Gt.controls;
    function frame(mode){
      const [y,z,distance,fov]={
        matched:[58,0,365,25],crown:[109,0,144,27],entrance:[9,19,106,29]
      }[mode];
      const yaw=24*Math.PI/180,elevation=40.5*Math.PI/180;
      controls.target.set(0,base+y,z);
      controls.object.position.set(Math.sin(yaw)*Math.cos(elevation)*distance,base+y+Math.sin(elevation)*distance,z+Math.cos(yaw)*Math.cos(elevation)*distance);
      controls.object.fov=fov;controls.object.updateProjectionMatrix();
      controls.enableDamping=false;controls.update();
      status.textContent='Fixed scene study · '+mode;
    }
    for(const mode of ['matched','crown','entrance'])panel.querySelector('#bv-'+mode).onclick=()=>frame(mode);
    window.__sandbox.barrelVaultReview={model,frame};
    Gn('hand');Ui();frame('matched');
  }catch(error){status.textContent=error.message;throw error;}
}
