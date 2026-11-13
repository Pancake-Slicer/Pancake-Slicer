// Reuse Lind's exact viewer/lighting without changing its approved files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),id=process.argv[2]||'von-badel';
if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid benchmark identifier');
const folder=path.join(root,'benchmark',id),config=JSON.parse(fs.readFileSync(path.join(folder,'benchmark.json'),'utf8')),out=path.join(root,'.tools',id);
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8'),end=source.indexOf('const LP=');if(end<0||!source.includes('const Ui="180"'))throw Error('Recovered engine boundary changed');
const engineExports=fs.readFileSync(path.join(root,'scripts/prepare-art-deco.cjs'),'utf8').match(/const engineExports='([^']+)'/)[1];
let extraExports='';
if(config.study==='03'){const match=source.slice(0,end).match(/class (\w+) extends \w+\{constructor\(t,e,i\)\{super\(t,e\),this.isInstancedMesh=!0/);if(!match)throw Error('r180 instancing export not found');extraExports='\nexport {'+match[1]+' as InstancedMesh};';}
fs.writeFileSync(path.join(out,'engine.js'),source.slice(0,end)+'\n'+engineExports+extraExports);
fs.copyFileSync(path.join(folder,'model.js'),path.join(out,'model.js'));fs.copyFileSync(path.join(root,'benchmark/shared/batched-architecture.js'),path.join(out,'batched-architecture.js'));
for(const file of ['baseline-v2.js','materials.js'])if(fs.existsSync(path.join(folder,file)))fs.copyFileSync(path.join(folder,file),path.join(out,file));
fs.copyFileSync(path.join(root,'benchmark/art-deco/style.css'),path.join(out,'style.css'));
for(const [to,from] of Object.entries(config.images))fs.copyFileSync(path.join(root,config.sourceDirectory,from),path.join(out,'assets',to));
let scene=fs.readFileSync(path.join(root,'benchmark/art-deco/scene.js'),'utf8');
scene=scene.replaceAll('createArtDeco','createModel').replace('detail?72:211',`detail?72:${config.view.span}`).replace('detail?153:91',`detail?${config.view.detailTarget}:${config.view.target}`).replace('52,.55,37',`${config.view.plinthWidth},.55,${config.view.plinthDepth}`);
scene=scene.replace('angle=Number(a);detail=close;', 'angle=Number(a);pitch=angle===0&&!close?0:19;detail=close;');
if(fs.existsSync(path.join(folder,'baseline-v2.js'))){
 scene=scene.replace("import {loadMaterials,createModel} from './model.js';", "import * as refined from './model.js';import * as baseline from './baseline-v2.js';const baselineMode=new URLSearchParams(location.search).has('baseline');const {loadMaterials,createModel}=baselineMode?baseline:refined;window.assetVariant=baselineMode?'Corrected baseline':'Refined';let inspection=null;");
 scene=scene.replace(`span=(detail?72:${config.view.span})/zoom`,`span=(inspection?.span??(detail?72:${config.view.span}))/zoom`).replace(`target=detail?${config.view.detailTarget}:${config.view.target}`,`target=inspection?.target??(detail?${config.view.detailTarget}:${config.view.target})`);
 scene=scene.replace('camera.position.set(Math.sin(a)','camera.position.set((inspection?.x||0)+Math.sin(a)').replace('Math.cos(a)*400*Math.cos(p)','(inspection?.z||0)+Math.cos(a)*400*Math.cos(p)').replace('camera.lookAt(0,target,0)','camera.lookAt(inspection?.x||0,target,inspection?.z||0)');
 scene=scene.replace('angle=Number(a);pitch=', 'inspection=null;angle=Number(a);pitch=');
 scene=scene.replace("document.querySelector('#detail').onclick=()=>setView(35,!detail);",`function inspect(name){const presets={facade:{span:42,target:116,x:11,z:17.5,pitch:12,angle:40},podium:{span:38,target:10,x:0,z:21,pitch:12,angle:30},rooftop:{span:68,target:182,x:0,z:0,pitch:43,angle:35},gameplay:{span:600,target:90,x:0,z:0,pitch:30,angle:35}};setView(35);inspection=presets[name];angle=inspection.angle;pitch=inspection.pitch;rotating=false;dirty=true;draw();document.querySelector('#view-label').textContent=window.assetVariant+' / '+name;}window.assetInspect=inspect;document.querySelector('#detail').onclick=()=>inspect('rooftop');for(const button of document.querySelectorAll('[data-inspect]'))button.onclick=()=>inspect(button.dataset.inspect);`);
 scene=scene.replace("document.querySelector('#bay-preview').getContext('2d').drawImage(materials.textures.bay.image,0,0,128,256);", "const preview=document.querySelector('#bay-preview').getContext('2d'),bayImage=materials.textures.bay.image;if(bayImage.width===512)preview.drawImage(bayImage,0,0,128,256,0,0,128,256);else preview.drawImage(bayImage,0,0,128,256);");
}
if(config.initialAngle!==undefined){
 scene=scene.replace('let angle=35,pitch=19,','let angle='+config.initialAngle+',pitch='+config.initialPitch+',').replaceAll('setView(35)', 'setView('+config.initialAngle+')');
}
if(config.detailSpan){
 scene=scene.replace('detail?72:', 'detail?'+config.detailSpan+':');
 scene=scene.replace('pitch=angle===0&&!close?0:19;', 'pitch=close?'+(config.detailPitch||40)+':'+JSON.stringify(config.elevationAngles||[0])+'.includes(angle)?0:'+(config.initialPitch||19)+';');
}
if(config.study==='03'){
 scene=scene.replace("document.querySelector('#bay-preview').getContext('2d').drawImage(materials.textures.bay.image,0,0,128,256);", "document.querySelector('#bay-preview').getContext('2d').drawImage(materials.textures.bay.image,0,0,128,170,0,0,128,256);");
 scene=scene.replace('let angle=', 'let multiMode=false,multiGroup=null;let angle=').replace('span=(detail?', 'span=(multiMode?300:detail?');
 scene+=`\nconst singleMetricsHTML=document.querySelector('#metrics').innerHTML;window.studyCopies=async function(enable){
 if(!multiGroup){multiGroup=new T.Group;for(const part of building.children){const mesh=new T.InstancedMesh(part.geometry,part.material,25);mesh.name=part.name;mesh.castShadow=mesh.receiveShadow=true;for(let i=0;i<25;i++){const matrix=building.matrix.clone().makeTranslation((i%5-2)*44,0,(Math.floor(i/5)-2)*26);mesh.setMatrixAt(i,matrix);}mesh.instanceMatrix.needsUpdate=true;multiGroup.add(mesh);}scene.add(multiGroup);}
 multiMode=enable;multiGroup.visible=enable;building.visible=!enable;setView(25);renderer.shadowMap.needsUpdate=true;draw();document.querySelector('#copies').classList.toggle('active',enable);document.querySelector('#copies').textContent=enable?'Single building':'25 copies';document.querySelector('#metrics').innerHTML=enable?renderer.info.render.calls+' draw calls / '+renderer.info.render.triangles.toLocaleString()+' triangles<br>25 instances / '+building.children.length+' shared model batches<br>Textures: '+(building.userData.textureBytes/1048576).toFixed(2)+' MiB shared':singleMetricsHTML;return {copies:enable?25:1,sharedGeometry:multiGroup.children.every((m,i)=>m.geometry===building.children[i].geometry),sharedMaterials:multiGroup.children.every((m,i)=>m.material===building.children[i].material)};
};document.querySelector('#copies').onclick=()=>window.studyCopies(!multiMode);\n`;
}
fs.writeFileSync(path.join(out,'scene.js'),scene);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>${escape(config.name)} · Architectural benchmark</title><link rel="stylesheet" href="style.css"></head><body>
<header><div><span class="eyebrow">PANCAKE CITY / ARCHITECTURE STUDY ${escape(config.study)}</span><h1>${escape(config.name)} <em>${escape(config.style||'Art Deco')}</em></h1></div><p>${escape(config.correction)}<br><span>Three.js r180 · independent architectural study</span></p></header>
<main><section class="viewport"><div id="canvas" aria-label="Interactive three-dimensional skyscraper"></div><div class="caption"><span>${escape(config.caption)}</span><span id="view-label">Three-quarter elevation</span></div><div class="toolbar"><button data-view="35" class="active">Three-quarter</button><button data-view="-35">Opposite front</button><button data-view="145">Rear</button><button data-view="0">Front</button><button id="detail">Crown detail</button><button id="rotate">Auto rotate</button></div><p class="hint">Drag to orbit · scroll to zoom · arrow keys rotate · R resets</p></section>
<aside><span class="eyebrow">DESIGN REFERENCES</span><div class="references"><figure><img src="assets/original.jpg" alt="Original ${escape(config.name)} building screenshot"><figcaption>Original / silhouette authority</figcaption></figure><figure><img src="assets/reference.png" alt="Supplied architectural concept with unequal wing widths"><figcaption>Concept / left wing width corrected</figcaption></figure></div><details><summary>Facade source & processed bay</summary><div class="texture"><img src="assets/facade.png" alt="Supplied ${escape(config.name)} facade artwork"><canvas id="bay-preview" width="128" height="256"></canvas></div><p>A complete window and spandrel cropped from the supplied artwork; raised piers are real geometry.</p></details><div class="specs">${config.facts.map(f=>`<div><strong>${escape(f.value)}</strong><span>${escape(f.label)}</span></div>`).join('')}</div><div id="metrics">Loading materials…</div><p class="note">${escape(config.description)}</p><a href="THIRD-PARTY-NOTICES.txt">Third-party notices</a></aside></main><script type="module" src="scene.js"></script></body></html>`);
fs.copyFileSync(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
if(fs.existsSync(path.join(folder,'baseline-v2.js'))){
 const file=path.join(out,'index.html');let html=fs.readFileSync(file,'utf8');
 html=html.replace('Original / silhouette authority','Original / proportions reference').replace('>Crown detail</button>','>Rooftop detail</button>').replace('<button id="rotate">','<button data-inspect="facade">Facade detail</button><button data-inspect="podium">Podium detail</button><button data-inspect="gameplay">Gameplay distance</button><button id="rotate">');
 html=html.replace('<aside>','<aside><p><a href="?baseline=1">Corrected baseline</a> · <a href="?">Refined model</a></p>').replace('Concept / left wing width corrected','Concept / detail reference only');
 fs.writeFileSync(file,html);
}
if(config.study==='03'){
 const file=path.join(out,'index.html');let html=fs.readFileSync(file,'utf8');
 html=html.replace('<button id="rotate">','<button id="copies">25 copies</button><button id="rotate">').replace('data-view="35" class="active"','data-view="25" class="active"').replace('A complete window and spandrel cropped from the supplied artwork; raised piers are real geometry.','Twelve source glazing panes form a compact atlas; aligned mullions and spandrels use shared geometry.').replace('Concept / left wing width corrected','Concept / supplementary detail').replace('Supplied architectural concept with unequal wing widths','Supplied supplementary modernist concept').replace('>Crown detail</button>','>Roof detail</button>').replace('<button id="detail">','<button data-view="90">Side</button><button data-view="180">Rear elevation</button><button id="detail">');
 fs.writeFileSync(file,html);
}
console.log(`${config.name} benchmark: ${out}`);
