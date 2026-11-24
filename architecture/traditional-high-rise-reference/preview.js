// Included only in the disposable architectural Test City.
{
  const panel=document.createElement('details');
  panel.open=true;
  panel.style.cssText='position:fixed;top:12px;left:12px;z-index:45;padding:10px 12px;background:#173044f5;color:white;font:13px system-ui;border-radius:6px';
  panel.innerHTML='<summary>Traditional Commercial High-Rise</summary><p><button data-view="matched">Reference angle</button> <button data-view="roof">Roof</button> <button data-view="entry">Entrance</button> <button data-view="compare">Side by side</button></p><span id="traditional-status">Preparing Test City…</span>';
  for(const button of panel.querySelectorAll('button'))button.style.cssText='background:#edf4f6;color:#173047;border:1px solid #879eab;border-radius:3px;padding:4px 7px;cursor:pointer';
  document.body.append(panel);
  const status=panel.querySelector('#traditional-status'),engine=pcOhneeEngine();
  try{
    const terrain=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:480,tileSize:480});
    ll.setMap(terrain);await Gt.setTerrain(terrain,_e);
    const base=terrain.heightAt(0,0)+.10;
    const {createMaterials,buildStudy,buildSite,plan}=traditionalHighRise(engine);
    const materials=createMaterials(),model=buildStudy(materials),site=buildSite(materials);
    const paving=site.getObjectByName('pavement'),cityPaving=paving.clone();
    model.position.y=base;cityPaving.position.y=base;
    Gt.traditionalReviewScene.add(model,cityPaving);
    terrain.forest.clearDevelopment([{footprint:[{x:-30,z:-30},{x:30,z:-30},{x:30,z:30},{x:-30,z:30}]}]);
    Gt.refreshTrees({final:true});
    _e.addBatch([[{x:-157,z:36.3},{x:157,z:36.3}],
      [{x:-115,z:-113},{x:-115,z:36.3}],[{x:115,z:-113},{x:115,z:36.3}],
      [{x:-115,z:-113},{x:115,z:-113}]]);
    Gt.drawRoads(_e);
    Vh.setPropertyZone('offices');
    const controls=Gt.controls,yaw=22.5*Math.PI/180,elevation=44.5*Math.PI/180;
    const direction=new q(Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation));
    function frame(view){
      const [y,z,distance,fov]={matched:[46,0,306,29],roof:[93,-1,139,30],entry:[7,23,114,29]}[view];
      controls.target.set(0,base+y,z);
      controls.object.position.copy(controls.target).addScaledVector(direction,distance);
      controls.object.fov=fov;controls.object.updateProjectionMatrix();
      controls.enableDamping=false;controls.update();
      status.textContent='Fixed benchmark · '+{matched:'reference angle',roof:'roof and lightwell',entry:'commercial entrance'}[view];
    }
    let comparison;
    async function compare(){
      if(comparison){if(!comparison.open)comparison.showModal();return;}
      comparison=document.createElement('dialog');
      comparison.id='traditional-comparison';
      comparison.style.cssText='width:min(1240px,96vw);max-width:none;max-height:94vh;padding:0;border:1px solid #b9c3c4;border-radius:8px;background:#edf0f0;color:#253939;font:15px system-ui;';
      comparison.innerHTML='<style>#traditional-comparison::backdrop{background:#142523cc}.tr-title{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:10px 16px;background:#f8fbfa}.tr-side{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;padding:9px}.tr-side figure{display:grid;grid-template-rows:30px 1fr;min-width:0;margin:0;background:#fff}.tr-side figcaption{padding:5px 10px;border-bottom:1px solid #e3ecea}.tr-view{width:100%;height:min(73vh,45vw);min-height:175px}.tr-view img,.tr-view canvas{width:100%;height:100%;display:block;object-fit:contain}@media(max-width:620px){.tr-side{grid-template-columns:1fr}.tr-view{height:86vw}}</style><div class="tr-title"><strong>Traditional Commercial High-Rise</strong><button id="traditional-return">Return to city</button></div><div class="tr-side"><figure><figcaption>Reference</figcaption><div class="tr-view"><img hidden alt="Supplied high-rise reference"><canvas aria-label="Supplied reference"></canvas></div></figure><figure><figcaption>Fixed reconstruction</figcaption><div class="tr-view" id="traditional-render"></div></figure></div>';
      document.body.append(comparison);
      for(const event of ['pointerdown','wheel','keydown'])comparison.addEventListener(event,e=>e.stopPropagation());
      comparison.querySelector('#traditional-return').onclick=()=>comparison.close();
      const image=comparison.querySelector('img'),reference=comparison.querySelector('canvas');
      image.src=traditionalReferenceImage;await image.decode();
      const host=comparison.querySelector('#traditional-render');
      const scene=new Sf;scene.background=new Me(0xffffff);
      scene.add(new fy(0xe8eeff,0x867c8d,.84));
      const sun=new gy(0xfff5ed,2.43);
      sun.position.set(-91,145,84);sun.castShadow=true;
      Object.assign(sun.shadow.camera,{left:-91,right:91,top:105,bottom:-90,near:1,far:360});
      sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.035;sun.shadow.bias=-.00012;
      sun.shadow.intensity=.60;scene.add(sun);
      const ambientSide=new gy(0xa4b5ef,.13);ambientSide.position.set(95,48,-21);scene.add(ambientSide);
      const copy=model.clone(true);copy.position.y=0;scene.add(copy,site);
      const renderer=new sb({antialias:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
      renderer.toneMapping=4;renderer.toneMappingExposure=1;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=1;renderer.shadowMap.autoUpdate=false;
      host.append(renderer.domElement);
      const camera=new Ad(-80,80,80,-80,.1,800),target=new q(0,48,0);
      camera.position.copy(target).addScaledVector(direction,300);camera.lookAt(target);camera.updateMatrixWorld(true);
      const bounds=new di(),point=new q();
      for(const mesh of [...copy.children,...site.children]){
        const positions=mesh.geometry.attributes.position;
        for(let i=0;i<positions.count;i++)bounds.expandByPoint(point.fromBufferAttribute(positions,i).applyMatrix4(camera.matrixWorldInverse));
      }
      const center=bounds.getCenter(new q()),size=bounds.getSize(new q()),shift=new q(center.x,center.y,0).applyQuaternion(camera.quaternion);
      camera.position.add(shift);
      const draw=()=>{
        const width=host.clientWidth,height=host.clientHeight;
        if(!width||!height)return;
        reference.width=reference.clientWidth;reference.height=reference.clientHeight;
        const ctx=reference.getContext('2d'),[x,y,w,h]=[204,17,629,1009];
        const scale=Math.min(reference.width/w,reference.height/h)*.956;
        ctx.fillStyle='white';ctx.fillRect(0,0,reference.width,reference.height);
        ctx.drawImage(image,x,y,w,h,(reference.width-w*scale)/2,(reference.height-h*scale)/2,w*scale,h*scale);
        const ratio=width/height,half=Math.max(size.y,size.x/ratio)*.522;
        camera.top=half;camera.bottom=-half;camera.left=-half*ratio;camera.right=half*ratio;
        camera.updateProjectionMatrix();renderer.setSize(width,height,false);renderer.render(scene,camera);
      };
      const observer=new ResizeObserver(draw);observer.observe(host);
      window.addEventListener('pagehide',()=>{observer.disconnect();renderer.dispose();},{once:true});
      comparison.showModal();renderer.shadowMap.needsUpdate=true;draw();
      comparison.dataset.ready='true';
    }
    for(const button of panel.querySelectorAll('button'))button.onclick=()=>button.dataset.view==='compare'?compare():frame(button.dataset.view);
    window.__sandbox.traditionalHighRiseReview={model,plan,frame};
    Gn('hand');Ui();frame('matched');
  }catch(error){status.textContent=error.message;throw error;}
}
