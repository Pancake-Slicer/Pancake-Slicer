import * as T from './engine.js';
import {loadMaterials,createArtDeco} from './model.js';
const host=document.querySelector('#canvas'),scene=new T.Scene();scene.background=new T.Color(0xe4e3dd);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;host.append(renderer.domElement);
scene.add(new T.HemisphereLight(0xe9eef2,0x77766b,1.5));
const sun=new T.DirectionalLight(0xffeed8,2.5);sun.position.set(-100,230,150);sun.target.position.set(0,85,0);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-115,right:115,top:155,bottom:-125,near:1,far:480});sun.shadow.bias=-.00015;sun.shadow.normalBias=.04;sun.shadow.radius=2;sun.shadow.intensity=.7;scene.add(sun,sun.target);
const ground=new T.Mesh(new T.BoxGeometry(2000,.5,2000),new T.MeshStandardMaterial({color:0xc8cbc1,roughness:1}));ground.position.y=-.55;ground.receiveShadow=true;scene.add(ground);
const plinth=new T.Mesh(new T.BoxGeometry(52,.55,37),new T.MeshStandardMaterial({color:0xaaa99b,roughness:1}));plinth.position.y=-.25;plinth.receiveShadow=true;scene.add(plinth);
const materials=await loadMaterials(),building=createArtDeco(materials);scene.add(building);
document.querySelector('#bay-preview').getContext('2d').drawImage(materials.textures.bay.image,0,0,128,256);
const camera=new T.OrthographicCamera(-100,100,100,-100,.1,1200);
let angle=35,pitch=19,zoom=1,detail=false,rotating=false,drag=null,last=0,dirty=true,metrics=null;
function draw(){
  const {width,height}=host.getBoundingClientRect(),span=(detail?72:211)/zoom;
  renderer.setSize(width,height,false);camera.left=-span*width/height/2;camera.right=-camera.left;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();
  const a=angle*Math.PI/180,p=pitch*Math.PI/180,target=detail?153:91;
  camera.position.set(Math.sin(a)*400*Math.cos(p),target+400*Math.sin(p),Math.cos(a)*400*Math.cos(p));camera.lookAt(0,target,0);camera.updateMatrixWorld();
  renderer.render(scene,camera);dirty=false;
}
function setView(a,close=false){angle=Number(a);detail=close;zoom=1;dirty=true;document.querySelector('#view-label').textContent=close?'Upper tower & roof study':`Orthographic elevation / ${angle}°`;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',Number(b.dataset.view)===angle&&!close));}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
document.querySelector('#detail').onclick=()=>setView(35,!detail);
document.querySelector('#rotate').onclick=e=>{rotating=!rotating;e.target.classList.toggle('active',rotating);};
host.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,a:angle,p:pitch};host.setPointerCapture(e.pointerId);};
host.onpointermove=e=>{if(drag){angle=drag.a+(e.clientX-drag.x)*.3;pitch=Math.max(5,Math.min(65,drag.p+(e.clientY-drag.y)*.15));dirty=true;}};
host.onpointerup=()=>drag=null;host.onpointercancel=()=>drag=null;
host.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(3,zoom*Math.exp(-e.deltaY*.001)));dirty=true;},{passive:false});
window.onkeydown=e=>{if(e.key==='ArrowLeft'){angle-=10;dirty=true;}if(e.key==='ArrowRight'){angle+=10;dirty=true;}if(e.key.toLowerCase()==='r'){pitch=19;setView(35);}};
window.addEventListener('resize',()=>dirty=true);renderer.shadowMap.needsUpdate=true;draw();
function frame(t){if(rotating){angle+=(t-last)*.008;dirty=true;}last=t;if(dirty)draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
async function measure(){
  rotating=false;for(let i=0;i<20;i++){draw();await new Promise(requestAnimationFrame);}
  const samples=[];
  for(let i=0;i<120;i++){await new Promise(requestAnimationFrame);const begin=performance.now();angle+=.12;draw();renderer.getContext().finish();samples.push(performance.now()-begin);}
  samples.sort((a,b)=>a-b);setView(35);draw();
  const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
  const geometryBytes=building.children.reduce((sum,m)=>sum+Object.values(m.geometry.attributes).reduce((n,a)=>n+a.array.byteLength,0)+m.geometry.index.array.byteLength,0);
  metrics={threeRevision:180,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
    geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,...building.userData,
    geometryBytes,shadowBytesEstimate:2048*2048*8,viewport:[renderer.domElement.width,renderer.domElement.height],
    samples:120,medianSubmissionAndGPUms:+samples[60].toFixed(2),p95SubmissionAndGPUms:+samples[114].toFixed(2),
    renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
    method:'120 orbit frames after 20 warmups; performance.now around render + gl.finish; static cached shadow; browser/compositor scheduling excluded; not full-city FPS'};
  document.querySelector('#metrics').innerHTML=`${metrics.drawCalls} draw calls / ${metrics.triangles.toLocaleString()} triangles<br>${metrics.windowBays} window bays / ${metrics.materialBatches} model batches<br>${metrics.medianSubmissionAndGPUms} ms median / ${metrics.p95SubmissionAndGPUms} ms p95<br>Textures: ${(metrics.textureBytes/1048576).toFixed(2)} MiB + shadow map`;
  return metrics;
}
window.artDeco={setView,draw,measure,get metrics(){return metrics;},building,renderer,camera,scene,materials};
await measure();window.benchmarkReady=true;
