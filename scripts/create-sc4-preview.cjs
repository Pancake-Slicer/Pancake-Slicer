// Development-only viewer: exercises the same imported-building renderer as the game.
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
const prefix=source.slice(0,source.indexOf('const LP='));
const viewer=`
const previewScene=new Sf,previewGroup=new Se;previewScene.add(previewGroup);previewScene.background=new Me(0xe7e2d5);
const previewRenderer=new sb({antialias:true});previewRenderer.setPixelRatio(1);previewRenderer.outputColorSpace=hn;document.querySelector('#canvas').append(previewRenderer.domElement);
const previewCamera=new Ad(-100,100,100,-100,.1,10000),select=document.querySelector('#building'),viewSelect=document.querySelector('#view'),tilt=document.querySelector('#tilt');
for(const entry of pcSC4Catalogue.entries){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name+' ['+entry.id+']';select.append(option);}
select.value='424';let active;
function previewDraw(){if(!active)return;const box=document.querySelector('#canvas').getBoundingClientRect(),aspect=box.width/box.height,height=Math.max(active.height,active.frontage*2.2)*1.25;
previewRenderer.setSize(box.width,box.height);previewCamera.left=-height*aspect/2;previewCamera.right=height*aspect/2;previewCamera.top=height/2;previewCamera.bottom=-height/2;previewCamera.updateProjectionMatrix();
const angle=(45+Number(viewSelect.value)*90)*Math.PI/180,pitch=Number(tilt.value)*Math.PI/180,distance=1000;
previewCamera.position.set(Math.cos(angle)*distance,active.height*.48+Math.tan(pitch)*distance,Math.sin(angle)*distance);previewCamera.lookAt(0,active.height*.48,0);previewCamera.updateMatrixWorld();
pcSC4UpdateViews(previewGroup,previewCamera);previewRenderer.render(previewScene,previewCamera);
document.querySelector('#status').textContent=pcSC4TexturesReady+' texture views decoded · '+previewGroup.children.filter(x=>x.material.userData.pcSC4&&x.visible).length+' original view visible';}
function previewChoose(){for(const child of [...previewGroup.children]){previewGroup.remove(child);child.geometry.dispose();}const model=pcSC4Model(select.value);if(!model){document.querySelector('#status').textContent='Run npm run import:sc4 first';return;}
const size=76,height=model.bounds.maxY-model.bounds.minY;active={id:'preview:'+model.id,office:{catalogueId:model.id},x:0,z:0,y:0,ground:-.57,rotation:0,frontage:size,depth:size,height,floors:pcCatalogueFind(model.id).estimatedFloors,footprint:[{x:-size/2,z:-size/2},{x:size/2,z:-size/2},{x:size/2,z:size/2},{x:-size/2,z:size/2}]};
pcSC4Render(active,(geometry,material)=>{const mesh=new ae(geometry,material.userData.pcSC4?material:new Qn({color:0x929386}));previewGroup.add(mesh);},()=>{}, {windows:0});
document.querySelector('#name').textContent=model.name;document.querySelector('#dimensions').textContent=model.size[0]+' × '+model.size[2]+' m · '+model.size[1]+' m source height';previewDraw();}
pcSC4Refresh=previewDraw;select.addEventListener('change',previewChoose);viewSelect.addEventListener('change',previewDraw);tilt.addEventListener('input',previewDraw);window.addEventListener('resize',previewDraw);previewChoose();
`;
fs.writeFileSync(path.join(root,'web/assets/sc4-preview.local.js'),prefix+'\n'+viewer);
fs.writeFileSync(path.join(root,'web/sc4-preview.local.html'),`<!doctype html><html><head><meta charset="utf-8"><title>Original SC4 building inspection</title><style>body{margin:0;font:15px system-ui;background:#e7e2d5;color:#233d43}header{padding:14px 20px;background:#233d43;color:white;display:flex;gap:20px;align-items:center;flex-wrap:wrap}label{display:flex;gap:8px;align-items:center}select{max-width:280px;padding:7px}#canvas{width:100%;height:calc(100vh - 150px);min-height:300px}footer{padding:8px 20px}h2{font-size:20px;margin:0 0 4px}p{margin:4px 0;font-size:12px}</style><script src="./assets/sc4-originals.local.js"></script></head><body><header><strong>Original SC4 assets · inspection</strong><label>Building<select id="building" aria-label="Building"></select></label><label>View<select id="view" aria-label="View"><option value="0">NE</option><option value="1">NW</option><option value="2">SW</option><option value="3">SE</option></select></label><label>Tilt<input id="tilt" aria-label="Tilt" type="range" min="15" max="70" value="30"></label></header><main id="canvas"></main><footer><h2 id="name"></h2><div id="dimensions"></div><p id="status"></p><p>Original model and lossless texture pixels. Fixed-view artwork can distort away from its intended camera angle. This is a development inspection tool, not the city game.</p></footer><script type="module" src="./assets/sc4-preview.local.js"></script></body></html>`);
console.log('Inspection viewer: http://127.0.0.1:4175/sc4-preview.local.html');
