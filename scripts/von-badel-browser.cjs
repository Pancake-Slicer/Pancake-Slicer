const {chromium}=require('../.tools/node_modules/playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.ART_DECO_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4184');await page.waitForFunction(()=>window.benchmarkReady,{timeout:60000});
  const validation=await page.evaluate(()=>{
    const {building}=artDeco;building.updateMatrixWorld(true);
    function bounds(label,bodyOnly=false){
      const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];let count=0;
      for(const r of building.userData.partRanges.filter(r=>(r.label===label||(!bodyOnly&&r.label===label+' equipment'))&&(!bodyOnly||r.material==='stone'))){const mesh=building.children.find(m=>m.name===r.material),p=mesh.geometry.attributes.position,m=mesh.matrixWorld.elements;
        for(let i=r.start;i<(bodyOnly?r.start+24:r.end);i++){
          const x=p.getX(i),y=p.getY(i),z=p.getZ(i),world=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
          for(let j=0;j<3;j++){min[j]=Math.min(min[j],world[j]);max[j]=Math.max(max[j],world[j]);}count++;
        }
      }
      return {min,max,width:max[0]-min[0],centerX:(min[0]+max[0])/2,count};
    }
    for(const mesh of building.children){for(const a of Object.values(mesh.geometry.attributes))if(!Array.from(a.array).every(Number.isFinite))throw Error('Nonfinite geometry');if(Array.from(mesh.geometry.index.array).some(i=>i>=mesh.geometry.attributes.position.count))throw Error('Bad index');}
    let maxAspectError=0;
    for(const name of ['shaft','podium','crown']){const p=building.children.find(m=>m.name===name).geometry.attributes.position;for(let i=0;i<p.count;i+=4){const width=Math.hypot(p.getX(i+1)-p.getX(i),p.getZ(i+1)-p.getZ(i)),height=p.getY(i+2)-p.getY(i);maxAspectError=Math.max(maxAspectError,Math.abs(width/height-135/322));}}
    function wingPoints(label,mirror){const points=[];for(const r of building.userData.partRanges.filter(r=>r.label===label||r.label===label+' equipment')){const p=building.children.find(m=>m.name===r.material).geometry.attributes.position;for(let i=r.start;i<r.end;i++)points.push([p.getX(i)*(mirror?-1:1),p.getY(i),p.getZ(i)].join(','));}return points.sort();}
    const left=wingPoints('left wing',true),right=wingPoints('right wing',false);
    return {leftBody:bounds('left wing',true),rightBody:bounds('right wing',true),leftComplete:bounds('left wing'),rightComplete:bounds('right wing'),mirroredGeometryEqual:left.length===right.length&&left.every((p,i)=>p===right[i]),shaft:bounds('central shaft',true),roof:bounds('hipped roof'),maxAspectError,volumes:building.userData.volumes,images:Array.from(document.querySelectorAll('figure img')).map(i=>[i.naturalWidth,i.naturalHeight])};
  });
  assert.equal(validation.leftBody.width,7);assert.equal(validation.rightBody.width,7);assert.equal(validation.leftBody.centerX,-24.5);assert.equal(validation.rightBody.centerX,24.5);
  assert.equal(validation.leftComplete.width,validation.rightComplete.width);assert.equal(validation.leftComplete.centerX,-validation.rightComplete.centerX);assert.equal(validation.leftComplete.max[1],validation.rightComplete.max[1]);assert.equal(validation.shaft.width,42);assert.equal(validation.shaft.centerX,0);
  assert.equal(validation.mirroredGeometryEqual,true);assert.equal(validation.roof.centerX,0);assert.ok(Math.abs(validation.roof.max[1]-187.2)<1e-4);
  assert.ok(validation.maxAspectError<1e-5,'Float32 crop aspect error: '+validation.maxAspectError);assert.deepEqual(validation.images,[[146,270],[1024,1536]]);
  await page.getByRole('button',{name:'Opposite front',exact:true}).click();await page.keyboard.press('ArrowRight');await page.keyboard.press('r');
  const rect=await page.locator('#canvas').boundingBox(),before=await page.evaluate(()=>artDeco.camera.position.toArray());
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+55,rect.y+rect.height/2+15);await page.mouse.up();await page.waitForTimeout(60);assert.notDeepEqual(await page.evaluate(()=>artDeco.camera.position.toArray()),before);
  const span=await page.evaluate(()=>artDeco.camera.left);await page.mouse.wheel(0,-250);await page.waitForTimeout(60);assert.ok(Math.abs(await page.evaluate(()=>artDeco.camera.left))<Math.abs(span));await page.keyboard.press('r');
  await page.evaluate(()=>document.activeElement?.blur());
  await page.mouse.move(15,105);
  for(const [name,angle,detail] of [['three-quarter',35,false],['front',0,false],['opposite-front',-35,false],['rear',145,false],['crown',35,true]]){
    await page.evaluate(({angle,detail})=>{artDeco.setView(angle,detail);artDeco.draw();},{angle,detail});
    await page.screenshot({path:`.tools/von-badel-${name}.png`});
  }
  const metrics=await page.evaluate(()=>artDeco.metrics);assert.ok(metrics.drawCalls<=12);assert.ok(metrics.triangles<40000);assert.deepEqual(errors,[]);
  await page.setViewportSize({width:700,height:950});await page.waitForTimeout(60);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const key of ['bay','stone']){const data=await page.evaluate(key=>artDeco.materials.textures[key].image.toDataURL('image/png').split(',')[1],key);fs.writeFileSync(`.tools/von-badel/assets/processed-${key}.png`,Buffer.from(data,'base64'));}
  fs.writeFileSync('.tools/von-badel-metrics.json',JSON.stringify({validation,metrics,errors},null,2));console.log(JSON.stringify({result:'PASS',wingBodyWidths:[validation.leftBody.width,validation.rightBody.width],wingDecoratedWidths:[validation.leftComplete.width,validation.rightComplete.width],wingCenters:[validation.leftComplete.centerX,validation.rightComplete.centerX],drawCalls:metrics.drawCalls,triangles:metrics.triangles,medianMs:metrics.medianSubmissionAndGPUms,p95Ms:metrics.p95SubmissionAndGPUms,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
