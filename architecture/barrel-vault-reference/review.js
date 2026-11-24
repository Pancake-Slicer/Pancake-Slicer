import * as T from './engine.js';
import {OrbitControls} from './OrbitControls.js';
import {createMaterials, buildStudy, buildSite} from './barrel-vault-reference/model.js';

const host=document.querySelector('#view'), source=document.querySelector('#source');
const reference=document.querySelector('#reference'), metrics=document.querySelector('#metrics');
const scene=new T.Scene();
scene.background=new T.Color(0xffffff);
scene.add(new T.HemisphereLight(0xeaf4fa,0x8b898b,1.25));
const light=new T.DirectionalLight(0xfff5ec,2.0);
light.position.set(-88,145,94);
light.castShadow=true;
Object.assign(light.shadow.camera,{left:-100,right:100,top:110,bottom:-110,near:.2,far:380});
light.shadow.mapSize.set(2048,2048);
light.shadow.normalBias=.055;
light.shadow.bias=-.00015;
light.shadow.intensity=.42;
scene.add(light);
const fill=new T.DirectionalLight(0xc9dbff,.48);fill.position.set(98,55,-20);scene.add(fill);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false;
host.append(renderer.domElement);
const materials=createMaterials(), model=buildStudy(materials), site=buildSite(materials);
scene.add(model,site);
const camera=new T.OrthographicCamera(-70,70,70,-70,.1,800);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=false;
controls.maxPolarAngle=Math.PI*.49;
controls.minZoom=.55;
controls.maxZoom=9;
const views={
  matched:{center:[0,56,0],span:null,azimuth:24,elevation:40.5,crop:[0,0,1014,1014]},
  crown:{center:[0,111.5,-.5],span:38,azimuth:24,elevation:40.5,crop:[278,12,482,336]},
  entrance:{center:[0,10,19],span:35,azimuth:24,elevation:40.5,crop:[221,633,570,346]}
};
let mode='matched', halfSpan=65, ratio=1;
scene.updateMatrixWorld(true);

function drawReference(w,h){
  reference.width=w;reference.height=h;
  const ctx=reference.getContext('2d'), [x,y,a,b]=views[mode].crop;
  const scale=Math.min(w/a,h/b);
  ctx.fillStyle='white';ctx.fillRect(0,0,w,h);
  ctx.drawImage(source,x,y,a,b,(w-a*scale)/2,(h-b*scale)/2,a*scale,b*scale);
}
function draw(){
  renderer.setSize(host.clientWidth,host.clientHeight,false);
  renderer.render(scene,camera);
  metrics.textContent=JSON.stringify({view:mode,reviewOnly:true,models:1,triangles:model.userData.triangles,
    batches:model.children.length,sceneCalls:renderer.info.render.calls,siteTriangles:site.children.reduce((n,m)=>n+m.geometry.index.count/3,0),
    viewport:[host.clientWidth,host.clientHeight],azimuth:views[mode].azimuth,elevation:views[mode].elevation});
}
function frame(next){
  mode=next;
  const view=views[mode], azimuth=T.MathUtils.degToRad(view.azimuth), elevation=T.MathUtils.degToRad(view.elevation);
  const direction=new T.Vector3(Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.cos(azimuth)*Math.cos(elevation));
  controls.target.fromArray(view.center);
  camera.position.copy(controls.target).addScaledVector(direction,290);
  camera.zoom=1;
  camera.lookAt(controls.target);camera.updateMatrixWorld(true);
  ratio=host.clientWidth/host.clientHeight;
  halfSpan=view.span;
  if(halfSpan===null){
    const box=new T.Box3(), v=new T.Vector3();
    for(const mesh of [...model.children,...site.children]){
      const pos=mesh.geometry.attributes.position;
      for(let i=0;i<pos.count;i++)box.expandByPoint(v.fromBufferAttribute(pos,i).applyMatrix4(camera.matrixWorldInverse));
    }
    const size=box.getSize(v), center=box.getCenter(new T.Vector3());
    halfSpan=Math.max(size.y,size.x/ratio)*.533;
    const shift=new T.Vector3(center.x,center.y,0).applyQuaternion(camera.quaternion);
    controls.target.add(shift);camera.position.add(shift);
  }
  camera.left=-halfSpan*ratio;camera.right=halfSpan*ratio;camera.top=halfSpan;camera.bottom=-halfSpan;
  camera.updateProjectionMatrix();
  controls.update();
  drawReference(reference.clientWidth,reference.clientHeight);
  for(const key of Object.keys(views))document.querySelector('#'+key).setAttribute('aria-pressed',String(key===mode));
  draw();
}
await source.decode();
renderer.shadowMap.needsUpdate=true;
frame('matched');
controls.addEventListener('change',draw);
for(const key of Object.keys(views))document.querySelector('#'+key).onclick=()=>frame(key);
window.addEventListener('resize',()=>frame(mode));
window.addEventListener('pagehide',()=>{
  controls.dispose();
  for(const m of [...model.children,...site.children])m.geometry.dispose();
  for(const m of Object.values(materials)){m.map?.dispose();m.dispose();}
  renderer.dispose();
},{once:true});
