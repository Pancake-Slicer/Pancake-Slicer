// Optional authoring tool. GLBs/templates stay with the benchmark until review;
// they are not placed in the live game's automatically discovered registry.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{chromium}=require('../.tools/node_modules/playwright'),{compileGLB}=require('./growable-assets.cjs');
const root=path.resolve(__dirname,'..'),id=process.argv[2]||'von-badel';if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid benchmark id');
execFileSync(process.execPath,[path.join(__dirname,'prepare-building-benchmark.cjs'),id],{cwd:root,stdio:'inherit'});
const folder=path.join(root,'benchmark',id),config=JSON.parse(fs.readFileSync(path.join(folder,'benchmark.json'),'utf8'));
const digest=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
(async()=>{
 const server=http.createServer((req,res)=>{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');return res.end('<script type="importmap">{"imports":{"three":"/.tools/node_modules/three/build/three.module.js"}}</script>');}
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.statusCode=403;return res.end();}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':'application/octet-stream');fs.createReadStream(file).on('error',()=>{res.statusCode=404;res.end();}).pipe(res);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.ART_DECO_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/');
  const result=await page.evaluate(async id=>{
    const base=document.createElement('base');base.href='/.tools/'+id+'/';document.head.append(base);
    const {createModel,loadMaterials}=await import('/.tools/'+id+'/model.js'),{GLTFExporter}=await import('/.tools/node_modules/three/examples/jsm/exporters/GLTFExporter.js');
    const model=createModel(await loadMaterials()),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    const hash=async array=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',array.buffer.slice(array.byteOffset,array.byteOffset+array.byteLength)))).map(v=>v.toString(16).padStart(2,'0')).join('');
    const hashes=[];
    for(const mesh of model.children){const g=mesh.geometry,p=g.attributes.position;
      for(let i=0;i<p.count;i++)for(let j=0;j<3;j++){const v=p.array[i*3+j];min[j]=Math.min(min[j],v);max[j]=Math.max(max[j],v);}
      hashes.push({position:await hash(g.attributes.position.array),normal:await hash(g.attributes.normal.array),uv:await hash(g.attributes.uv.array),index:await hash(g.index.array)});
    }
    const buffer=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true}),bytes=new Uint8Array(buffer);let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));
    const floorHeight=model.userData.dimensions.floor;
    return {binary:btoa(text),hashes,min,max,floorHeight,floors:Math.round(Math.max(...model.userData.volumes.map(v=>v.top))/floorHeight),windowBays:model.userData.windowBays};
  },id);
  const file=path.join(folder,id+'.glb');fs.writeFileSync(file,Buffer.from(result.binary,'base64'));const payload=compileGLB(file);assert.equal(payload.parts.length,result.hashes.length);
  payload.parts.forEach((part,i)=>{for(const key of ['position','normal','uv','index'])assert.equal(digest(Buffer.from(part[key].array,'base64')),result.hashes[i][key],'GLB changed '+key);});
  const min=result.min.map(v=>Math.floor(v*1000)/1000),max=result.max.map(v=>Math.ceil(v*1000)/1000),width=+(max[0]-min[0]).toFixed(3),depth=+(max[2]-min[2]).toFixed(3);
  const template={schemaVersion:1,id:id+'-art-deco',version:'1.0.0',name:config.name+' Art Deco',model:{format:'glb',path:id+'.glb',sha256:digest(fs.readFileSync(file))},dimensions:{width,depth,height:max[1],floors:result.floors,floorHeight:result.floorHeight,windowBays:result.windowBays},footprint:[[min[0],min[2]],[max[0],min[2]],[max[0],max[2]],[min[0],max[2]]],bounds:{min,max},selection:{kind:'model-instances',bounds:'bounds'},orientation:{front:[0,0,1],entrance:[0,0,max[2]],up:[0,1,0]},eligibility:{zone:'offices',density:'high',capacityMinFloors:result.floors,developmentStage:'immediate',minLotArea:Math.ceil((width+.6)*(depth+.6)),minLotWidth:+(width+.6).toFixed(3),minLotDepth:+(depth+.6).toFixed(3),setback:.3},selectionWeight:4,source:{kind:'reference-led-procedural-benchmark',module:'benchmark/'+id+'/model.js',sha256:digest(fs.readFileSync(path.join(folder,'model.js'))),helper:'benchmark/shared/batched-architecture.js',helperSha256:digest(fs.readFileSync(path.join(root,'benchmark/shared/batched-architecture.js'))),notes:config.exportNotes||JSON.stringify(config.facts)}};
  fs.writeFileSync(path.join(folder,'registration.template.json'),JSON.stringify(template,null,2)+'\n');
  fs.writeFileSync(path.join(root,'.tools',id+'-export.json'),JSON.stringify({geometryAndUVByteEquality:'PASS',parts:payload.parts.length,min,max,bytes:fs.statSync(file).size,sha256:template.model.sha256},null,2));
  console.log(JSON.stringify({file,parts:payload.parts.length,byteExactGeometry:true,bounds:{min,max},bytes:fs.statSync(file).size},null,2));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
