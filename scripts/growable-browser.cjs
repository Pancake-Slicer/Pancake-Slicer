const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('../.tools/node_modules/playwright');const root=path.resolve(__dirname,'..');process.chdir(root);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.ART_DECO_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1}),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>network.push(r.url()));
 await page.route('**/favicon.ico',r=>r.fulfill({status:204,body:''}));
 await page.route('**/approved-model.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'benchmark/art-deco/model.js'),'utf8').replace("import * as T from './engine.js';",'const T=window.__sandbox.growables.three;')}));
 await page.route('**/assets/facade.png',r=>r.fulfill({path:path.join(root,'Assets/Architecture/Art Deco/Art Deco Limestone Window Facade.png'),contentType:'image/png'}));
 await page.goto('http://127.0.0.1:4183/Pancake%20City%20-%20Lind%20Growables%20Demo.html');await page.waitForFunction(()=>window.__growableDemoReady,{timeout:60000});await page.waitForTimeout(600);
 const initial=await page.evaluate(()=>({demo:__growableDemoReady,building:__sandbox.zoning.buildings.find(b=>b.id===__growableDemoReady.focusId),terrain:__sandbox.world.terrainInfo(),development:__sandbox.world.developmentInfo()}));
 assert.equal(initial.demo.lindCount,3);assert.equal(initial.demo.buildingCount,36);assert.equal(initial.terrain.settings.hills,0);assert.equal(initial.building.y,8.57);
 await page.screenshot({path:'.tools/lind-growables-city.png'});
 const fidelity=await page.evaluate(async()=>{
  const {createArtDeco,loadMaterials}=await import('/approved-model.js'),original=createArtDeco(await loadMaterials()),resource=__sandbox.growables.resource(__sandbox.growables.definitions[0]);
  let positionError=0,normalError=0,uvError=0,colorError=0,pixelError=0,indicesEqual=true;
  for(let i=0;i<original.children.length;i++){
   const a=original.children[i],b=resource.parts[i];
   for(const [key,error] of [['position','positionError'],['normal','normalError'],['uv','uvError']]){
    const x=a.geometry.attributes[key].array,y=b.geometry.attributes[key].array;if(x.length!==y.length)throw Error('Geometry count mismatch');let max=0;for(let j=0;j<x.length;j++)max=Math.max(max,Math.abs(x[j]-y[j]));if(error==='positionError')positionError=Math.max(positionError,max);if(error==='normalError')normalError=Math.max(normalError,max);if(error==='uvError')uvError=Math.max(uvError,max);
   }
   const x=a.geometry.index.array,y=b.geometry.index.array;indicesEqual&&=x.length===y.length&&x.every((v,j)=>v===y[j]);
   for(const key of ['r','g','b'])colorError=Math.max(colorError,Math.abs(a.material.color[key]-b.material.color[key]));
   for(const key of ['roughness','metalness','side'])if(a.material[key]!==b.material[key])throw Error('Material changed: '+key);
   if(a.material.map){
    const src=a.material.map.image,img=b.material.map.image,canvas=document.createElement('canvas');canvas.width=src.width;canvas.height=src.height;
    const c=canvas.getContext('2d');c.drawImage(src,0,0);const p=c.getImageData(0,0,src.width,src.height).data;c.clearRect(0,0,src.width,src.height);c.drawImage(img,0,0);const q=c.getImageData(0,0,src.width,src.height).data;
    // glTF embeds the original image flipped vertically; flipY=false preserves
    // identical sampling without changing any UV or original texture pixels.
    for(let y=0;y<src.height;y++)for(let x=0;x<src.width;x++)for(let k=0;k<4;k++)pixelError=Math.max(pixelError,Math.abs(p[(y*src.width+x)*4+k]-q[((src.height-1-y)*src.width+x)*4+k]));
    if(a.material.map.wrapS!==b.material.map.wrapS||a.material.map.wrapT!==b.material.map.wrapT)throw Error('Sampler changed');
   }
  }
  return {positionError,normalError,uvError,colorError,pixelError,indicesEqual,sharedParts:resource.parts.length,sharedTextureCount:resource.images.length};
 });
 assert.equal(fidelity.positionError,0);assert.equal(fidelity.uvError,0);assert.equal(fidelity.indicesEqual,true);assert.ok(fidelity.normalError<1e-6&&fidelity.colorError<1e-12);assert.equal(fidelity.pixelError,0);
 const picked=await page.evaluate(()=>{
  const s=__sandbox,b=s.zoning.buildings.find(b=>b.id===__growableDemoReady.focusId),p=b.office.assetPlacement,point=s.world.screenPoint({x:p.x,y:b.y+112,z:p.z});return {...point,id:s.world.developmentAt(point.x,point.y)};
 });assert.equal(picked.id,initial.building.id);
 await page.locator('[data-tool="demolish"]').click();await page.mouse.move(picked.x,picked.y);await page.waitForTimeout(150);await page.screenshot({path:'.tools/lind-growables-selected.png'});
 await page.mouse.click(picked.x,picked.y);await page.waitForTimeout(200);assert.equal(await page.evaluate(id=>__sandbox.zoning.buildings.some(b=>b.id===id),initial.building.id),false);await page.screenshot({path:'.tools/lind-growables-demolished.png'});
 await page.locator('#undo').click();await page.waitForTimeout(200);const restored=await page.evaluate(id=>__sandbox.zoning.buildings.find(b=>b.id===id),initial.building.id);assert.equal(restored.signature,initial.building.signature);
 await page.locator('#redo').click();await page.waitForTimeout(150);assert.equal(await page.evaluate(id=>__sandbox.zoning.buildings.some(b=>b.id===id),initial.building.id),false);
 await page.locator('#undo').click();await page.waitForTimeout(200);await page.screenshot({path:'.tools/lind-growables-restored.png'});
 const dense=await page.evaluate(()=>{const s=__sandbox;s.zoning.pcCatalogueChoice=null;s.zoning.applyProperties(s.zoning.properties,'offices');s.world.drawZoning();return {count:s.zoning.buildings.length,linds:s.zoning.buildings.filter(b=>b.office.assetKey).length,development:s.world.developmentInfo(),render:s.world.performanceInfo(),cache:s.world.frameCacheInfo()};});assert.equal(dense.count,68);assert.equal(dense.linds,4);
 const timing=await page.evaluate(async()=>{
  const s=__sandbox,c=s.world.controls,b=s.zoning.buildings.find(b=>b.id===__growableDemoReady.focusId);c.enableDamping=false;c.target.set(0,85,0);const samples=[];let last=performance.now();
  for(let i=0;i<90;i++){const a=.8+i*.002;c.object.position.set(Math.sin(a)*800,650,Math.cos(a)*800);c.update();await new Promise(requestAnimationFrame);const now=performance.now();if(i>=10)samples.push(now-last);last=now;}
  c.enableDamping=true;samples.sort((a,b)=>a-b);return {samples:samples.length,medianFrameIntervalMs:samples[40],p95FrameIntervalMs:samples[76],method:'80 camera-motion requestAnimationFrame intervals after 10 warmups, actual game with 68 mixed buildings / 4 Lind; includes browser scheduling, not isolated GPU time',render:s.world.performanceInfo(),cache:s.world.frameCacheInfo()};
 });await page.screenshot({path:'.tools/lind-growables-dense-city.png'});
 assert.deepEqual(errors,[]);
 const external=network.filter(u=>!u.startsWith('http://127.0.0.1:4183/')&&!u.startsWith('data:')&&!u.startsWith('blob:'));assert.deepEqual(external,[]);
 // A real offline file-URL launch, not just static packaging checks.
 const offline=await browser.newPage({viewport:{width:1440,height:1080}}),offlineErrors=[];offline.on('pageerror',e=>offlineErrors.push(e.message));await offline.goto('file:///'+path.join(root,'dist/Pancake City - Lind Growables Demo.html').replaceAll('\\','/'));await offline.waitForFunction(()=>window.__growableDemoReady,{timeout:60000});assert.equal(await offline.evaluate(()=>__growableDemoReady.lindCount),3);assert.deepEqual(offlineErrors,[]);await offline.screenshot({path:'.tools/lind-growables-offline.png'});
 const standard=await browser.newPage(),standardErrors=[];standard.on('pageerror',e=>standardErrors.push(e.message));await standard.goto('file:///'+path.join(root,'dist/Pancake City - Playtest.html').replaceAll('\\','/'));await standard.locator('#terrain-setup[open]').waitFor({timeout:60000});assert.deepEqual(standardErrors,[]);
 const report={initial:{...initial.demo,foundationY:initial.building.y,terrainHeight:8},fidelity,picked,demolitionUndoRedo:'PASS',dense:{count:dense.count,linds:dense.linds,meshes:dense.development.meshes},timing,errors,offline:'PASS: demo end-to-end and ordinary Playtest terrain setup'};
 fs.writeFileSync('.tools/lind-growables-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
