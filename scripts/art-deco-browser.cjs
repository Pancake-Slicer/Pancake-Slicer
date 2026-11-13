// Optional real-GPU test. Start npm run benchmark:serve first.
// Install the test driver outside tracked dependencies:
// npm install --prefix .tools playwright --no-audit --no-fund
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');process.chdir(root);
const {chromium}=require('../.tools/node_modules/playwright');
(async()=>{
  const executablePath=process.env.ART_DECO_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser=await chromium.launch({executablePath,headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1}),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
    await page.goto('http://127.0.0.1:4180');await page.waitForFunction(()=>window.benchmarkReady,{timeout:60000});
    const validation=await page.evaluate(()=>{
      const {building,materials}=artDeco;let minY=Infinity,maxY=-Infinity;
      const wingWorldMax={left:-Infinity,right:-Infinity};building.updateMatrixWorld(true);
      for(const mesh of building.children){
        for(const attr of Object.values(mesh.geometry.attributes))if(!Array.from(attr.array).every(Number.isFinite))throw Error('Nonfinite geometry');
        const pos=mesh.geometry.attributes.position;
        for(let i=0;i<pos.count;i++){
          const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
          // Central shaft and its projecting trim fit inside |x| < 12.1m.
          // Inspect actual wing vertices, including parapets and finials,
          // transformed by the mesh's world matrix, rather than recipe heights.
          const m=mesh.matrixWorld.elements,worldY=m[1]*x+m[5]*y+m[9]*z+m[13];
          if(x < -12.1)wingWorldMax.left=Math.max(wingWorldMax.left,worldY);
          if(x > 12.1)wingWorldMax.right=Math.max(wingWorldMax.right,worldY);
        }
        if(Array.from(mesh.geometry.index.array).some(i=>i>=pos.count))throw Error('Out-of-range index');
      }
      const bays=building.children.find(m=>m.name==='bay').geometry.attributes.position;
      for(let i=0;i<bays.count;i+=4){
        const width=Math.hypot(bays.getX(i+1)-bays.getX(i),bays.getZ(i+1)-bays.getZ(i));
        const height=bays.getY(i+2)-bays.getY(i);
        if(Math.abs(width/height-173/310)>1e-5)throw Error('Distorted window crop');
      }
      return {minY,maxY,wingWorldMax,batches:building.children.length,baySize:[materials.textures.bay.image.width,materials.textures.bay.image.height],
        sourceImages:Array.from(document.querySelectorAll('figure img')).map(i=>[i.naturalWidth,i.naturalHeight]),volumes:building.userData.volumes};
    });
    assert.equal(validation.minY,0);assert.ok(Math.abs(validation.maxY-183.9)<.001);assert.equal(validation.batches,7);assert.deepEqual(validation.baySize,[256,512]);assert.deepEqual(validation.sourceImages,[[103,270],[1024,1536]]);
    for(const v of validation.volumes){assert.ok(v.top>v.base);assert.ok(Math.abs(v.top/3.7-Math.round(v.top/3.7))<1e-9);}
    for(const part of ['main wing','shoulder','termination']){
      const left=validation.volumes.find(v=>v.label==='left '+part),right=validation.volumes.find(v=>v.label==='right '+part);
      assert.equal(left.base,right.base);assert.equal(left.top,right.top);
      assert.equal(left.w,right.w);assert.equal(left.d,right.d);assert.equal(left.x,-right.x);assert.equal(left.z,right.z);
    }
    assert.equal(validation.volumes.find(v=>v.label==='right termination').top,92.5);
    assert.equal(validation.wingWorldMax.left,validation.wingWorldMax.right);
    assert.ok(Math.abs(validation.wingWorldMax.right-93.66)<.00001);
    assert.ok(requests.every(r=>!r.includes('game.bundle')&&!r.includes('quaternius')));
    await page.getByRole('button',{name:'Opposite front',exact:true}).click();
    assert.ok(await page.getByRole('button',{name:'Opposite front',exact:true}).evaluate(e=>e.classList.contains('active')));
    const before=await page.evaluate(()=>artDeco.camera.position.toArray());await page.keyboard.press('ArrowRight');await page.waitForTimeout(60);const after=await page.evaluate(()=>artDeco.camera.position.toArray());assert.notDeepEqual(before,after);
    const canvas=page.locator('#canvas');const rect=await canvas.boundingBox();
    await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+70,rect.y+rect.height/2+20);await page.mouse.up();
    await page.waitForTimeout(60);assert.notDeepEqual(after,await page.evaluate(()=>artDeco.camera.position.toArray()));
    const left=await page.evaluate(()=>artDeco.camera.left);await page.mouse.wheel(0,-250);await page.waitForTimeout(60);assert.ok(Math.abs(await page.evaluate(()=>artDeco.camera.left))<Math.abs(left));
    await page.keyboard.press('r');
    const metrics=await page.evaluate(()=>artDeco.measure());
    for(const key of ['bay','stone']){
      const data=await page.evaluate(key=>artDeco.materials.textures[key].image.toDataURL('image/png').split(',')[1],key);
      fs.writeFileSync(`.tools/art-deco/assets/processed-${key}.png`,Buffer.from(data,'base64'));
    }
    for(const [name,angle,detail] of [['southeast',35,false],['front',0,false],['southwest',-35,false],['rear',145,false],['crown',35,true]]){
      await page.evaluate(({angle,detail})=>{artDeco.setView(angle,detail);artDeco.draw();},{angle,detail});
      await page.screenshot({path:`.tools/art-deco-${name}.png`});
    }
    await page.setViewportSize({width:700,height:950});await page.waitForTimeout(60);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);assert.ok(metrics.drawCalls<=10);assert.ok(metrics.triangles<30000);
    fs.writeFileSync('.tools/art-deco-metrics.json',JSON.stringify({metrics,validation,errors},null,2));
    console.log(JSON.stringify({result:'PASS',checks:'five views including front; exact world-space wing height equality; mirrored wing footprints and levels; UI buttons, keys, drag, zoom; narrow layout; finite indexed geometry; exact crop aspect; floor grid; source images; engine isolation; console; draw budget',wingWorldMax:validation.wingWorldMax,metrics,errors},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
