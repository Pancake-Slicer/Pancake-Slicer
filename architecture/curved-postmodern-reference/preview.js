/* global pcOhneeEngine, Pw, ll, Gt, _e, Gn, Ui, curvedPostmodernStudy, curvedPostmodernReferenceImage, Sf, fy, gy, sb, Ad */
{
  const T=pcOhneeEngine();
  const {createMaterials,buildStudy,buildSite}=curvedPostmodernStudy(T);
  const materials=createMaterials(), model=buildStudy(materials), site=buildSite(materials);
  const terrain=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:480,tileSize:480});
  ll.setMap(terrain);
  await Gt.setTerrain(terrain,_e);
  const base=terrain.heightAt(0,0)+.10,pavement=site.getObjectByName('paving').clone();
  model.position.y=pavement.position.y=base;
  Gt.curvedPostmodernReviewScene.add(model,pavement);
  terrain.forest.clearDevelopment([{footprint:[{x:-32,z:-25},{x:30,z:-25},{x:30,z:27},{x:-32,z:27}]}]);
  Gt.refreshTrees({final:true});
  _e.addBatch([[{x:-156,z:31.5},{x:156,z:31.5}],[{x:-110,z:31.5},{x:-110,z:-100}],
    [{x:110,z:31.5},{x:110,z:-100}],[{x:-110,z:-100},{x:110,z:-100}]]);
  Gt.drawRoads(_e);
  const yaw=22.6*Math.PI/180,elevation=44.6*Math.PI/180;
  const direction=new T.Vector3(Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation));
  const controls=Gt.controls;
  function frame(view){
    const [x,y,z,distance]={matched:[-1,59,4,351],roof:[-6,110,2,154],join:[3,102,5,130],entry:[-6,4,22,41]}[view];
    const angle=view==='join'?78:view==='entry'?13:null;
    const viewDirection=angle===null?direction:new T.Vector3(
      Math.sin(yaw)*Math.cos(angle*Math.PI/180),Math.sin(angle*Math.PI/180),Math.cos(yaw)*Math.cos(angle*Math.PI/180));
    controls.target.set(x,base+y,z);
    controls.object.position.copy(controls.target).addScaledVector(viewDirection,distance);
    controls.object.fov=29;
    controls.object.updateProjectionMatrix();
    controls.enableDamping=false;
    controls.update();
  }

  const tools=document.createElement('details');
  tools.open=true;
  tools.style.cssText='position:fixed;top:12px;left:12px;z-index:45;padding:10px 12px;background:#183031;color:#fff;font:14px system-ui;border-radius:6px';
  tools.innerHTML='<summary>Curved Postmodern Office</summary><p><button data-view="matched">Reference angle</button> <button data-view="roof">Roof frames</button> <button data-view="join">Wing junction</button> <button data-view="entry">Entrances</button> <button data-view="compare">Side by side</button></p>';
  for(const button of tools.querySelectorAll('button'))button.style.cssText='background:#edf3f0;color:#183031;border:1px solid #9caeaa;border-radius:3px;padding:4px 7px;cursor:pointer';
  document.body.append(tools);
  let comparison;
  async function compare(){
    if(comparison){if(!comparison.open)comparison.showModal();return;}
    comparison=document.createElement('dialog');
    comparison.id='curved-postmodern-comparison';
    comparison.innerHTML='<style>#curved-postmodern-comparison{width:min(1240px,96vw);max-width:none;max-height:94vh;padding:0;border:1px solid #aebaba;background:#ebefee;color:#253939;font:15px system-ui}#curved-postmodern-comparison::backdrop{background:#142523cc}.cp-header{display:flex;justify-content:space-between;padding:10px 16px;background:#f7f9f8}.cp-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:8px}.cp-columns figure{margin:0;background:#fff}.cp-columns figcaption{padding:5px 10px;border-bottom:1px solid #e1e7e4}.cp-view{height:min(79vh,58vw)}.cp-view canvas{width:100%;height:100%;display:block}@media(max-width:620px){.cp-columns{grid-template-columns:1fr}.cp-view{height:92vw}}</style><div class="cp-header"><strong>Curved Postmodern Office</strong><button>Return to city</button></div><div class="cp-columns"><figure><figcaption>Supplied reference</figcaption><div class="cp-view"><canvas aria-label="Supplied reference building"></canvas></div></figure><figure><figcaption>Fixed reconstruction</figcaption><div class="cp-view" id="curved-postmodern-render"></div></figure></div>';
    for(const event of ['pointerdown','wheel','keydown'])comparison.addEventListener(event,e=>e.stopPropagation());
    document.body.append(comparison);
    comparison.querySelector('button').onclick=()=>comparison.close();
    const image=new Image();
    image.src=curvedPostmodernReferenceImage;
    await image.decode();

    const scene=new Sf();
    scene.background=new T.Color(0xffffff);
    scene.add(new fy(0xe4eeff,0x7e7887,1.11));
    const sun=new gy(0xfff7ef,2.30);
    sun.position.set(-130,164,149);
    sun.castShadow=true;
    Object.assign(sun.shadow.camera,{left:-86,right:86,top:100,bottom:-90,near:1,far:370});
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.normalBias=.028;
    sun.shadow.bias=-.00012;
    sun.shadow.intensity=.65;
    scene.add(sun);
    const fill=new gy(0xc6deef,.21);
    fill.position.set(-35,25,120);
    scene.add(fill);
    const copy=model.clone(true);
    copy.position.y=0;
    scene.add(copy,site);

    const renderer=new sb({antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
    renderer.toneMapping=4;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=1;
    renderer.shadowMap.autoUpdate=false;
    const host=comparison.querySelector('#curved-postmodern-render'),reference=comparison.querySelector('canvas');
    renderer.domElement.setAttribute('aria-label','Rendered reconstruction at the reference angle');
    host.append(renderer.domElement);
    const target=new T.Vector3(0,56,0), camera=new Ad(-80,80,80,-80,.1,800);
    camera.position.copy(target).addScaledVector(direction,300);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    const bounds=new T.Box3(),point=new T.Vector3();
    for(const mesh of [...copy.children,...site.children]){
      const position=mesh.geometry.attributes.position;
      for(let i=0;i<position.count;i++)bounds.expandByPoint(point.fromBufferAttribute(position,i).applyMatrix4(camera.matrixWorldInverse));
    }
    const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
    camera.position.add(new T.Vector3(center.x,center.y,0).applyQuaternion(camera.quaternion));
    function draw(){
      const w=host.clientWidth,h=host.clientHeight;
      if(!w||!h)return;
      const pixelRatio=renderer.getPixelRatio();
      reference.width=Math.round(reference.clientWidth*pixelRatio);
      reference.height=Math.round(reference.clientHeight*pixelRatio);
      const ctx=reference.getContext('2d'),crop=[302,19,590,1166];
      const scale=Math.min(reference.width/crop[2],reference.height/crop[3])*.96;
      const rw=crop[2]*scale,rh=crop[3]*scale;
      ctx.fillStyle='white';
      ctx.fillRect(0,0,reference.width,reference.height);
      ctx.drawImage(image,...crop,(reference.width-rw)/2,(reference.height-rh)/2,rw,rh);
      const ratio=w/h,half=Math.max(size.y,size.x/ratio)*.528;
      Object.assign(camera,{top:half,bottom:-half,left:-half*ratio,right:half*ratio});
      camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
      renderer.render(scene,camera);
    }
    const observer=new ResizeObserver(draw);
    observer.observe(host);
    window.addEventListener('pagehide',()=>{observer.disconnect();renderer.dispose();},{once:true});
    comparison.showModal();
    renderer.shadowMap.needsUpdate=true;
    draw();
    comparison.dataset.ready='true';
  }
  for(const button of tools.querySelectorAll('button')){
    button.onclick=()=>button.dataset.view==='compare'?compare():frame(button.dataset.view);
  }
  window.__sandbox.curvedPostmodernReview={model,frame};
  Gn('hand');
  Ui();
  frame('matched');
}
