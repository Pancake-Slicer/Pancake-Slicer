// One-time authoring export. Runtime builds do not require these optional tools.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('../.tools/node_modules/playwright');
const root=path.resolve(__dirname,'..');require('./prepare-art-deco.cjs');
(async()=>{
 const server=http.createServer((req,res)=>{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');return res.end('<script type="importmap">{"imports":{"three":"/.tools/node_modules/three/build/three.module.js"}}</script>');}
  const file=path.resolve(root,'.'+decodeURIComponent(req.url));if(!file.startsWith(root+path.sep)){res.statusCode=403;return res.end();}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':'application/octet-stream');fs.createReadStream(file).on('error',()=>{res.statusCode=404;res.end();}).pipe(res);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.ART_DECO_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/');
  // loadMaterials uses a document-relative image URL; supply the existing crop
  // source without editing any approved model or material code.
  const data=await page.evaluate(async()=>{
   const base=document.createElement('base');base.href='/.tools/art-deco/';document.head.append(base);
   const {createArtDeco,loadMaterials}=await import('/.tools/art-deco/model.js');
   const {GLTFExporter}=await import('/.tools/node_modules/three/examples/jsm/exporters/GLTFExporter.js');
   const model=createArtDeco(await loadMaterials());
   const binary=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});
   const bytes=new Uint8Array(binary);let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(text);
  });
  const out=path.join(root,'Assets/buildings/lind-art-deco/lind.glb');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.from(data,'base64'));console.log('Exported approved Lind to '+out);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
