const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');

const root=path.resolve(__dirname,'..');
const review=path.join(root,'.tools/curved-postmodern-reference');
const source='architecture/curved-postmodern-reference/';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const strip=code=>code.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const reference=path.join(review,'reference.png');
const image=fs.readFileSync(process.argv[2]||reference);
assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Supply the reference PNG');
assert.equal(image.readUInt32BE(16),1200);
assert.equal(image.readUInt32BE(20),1200);
fs.mkdirSync(review,{recursive:true});
if(process.argv[2]&&path.resolve(process.argv[2])!==reference)fs.writeFileSync(reference,image);

execFileSync(process.execPath,[path.join(__dirname,'export-html.cjs')],{cwd:root,stdio:'inherit'});
const game=read('dist/Pancake City - Playtest.html');
assert.ok(!game.includes('curvedPostmodernStudy'));
let html=game;
for(const [before,after] of [
  ['new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox='],
  ['(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew'],
  ['performanceInfo:()=>({...pi,','curvedPostmodernReviewScene:C,performanceInfo:()=>({...pi,']
]){
  assert.equal(html.split(before).length,2,before);
  html=html.replace(before,()=>after);
}
const model=strip(read(source+'model.js')),batch=strip(read('benchmark/shared/batched-architecture.js'));
const payload='\nfunction curvedPostmodernStudy(T){\n'+batch+'\n'+model+'\nreturn createStudy(T,ArchitectureBatch);\n}\n'+
  'const curvedPostmodernReferenceImage="data:image/png;base64,'+image.toString('base64')+'";\n'+read(source+'preview.js');
assert.ok(!/<\/script/i.test(payload));
const end=html.indexOf('</script>',html.indexOf('<script type="module">'));
assert.ok(end>0);
html=html.slice(0,end)+payload+html.slice(end);
assert.ok(!/<(?:script|link|img)\b[^>]*(?:src|href)\s*=\s*["'](?!data:)/i.test(html));

const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const file=path.join(root,'dist','Pancake City - Curved Postmodern Office Preview - '+stamp+'.html');
fs.writeFileSync(file,html,{flag:'wx'});
const report={file,sha256:hash(html),referenceSha256:hash(image),normalPlaytestSha256:hash(game),models:1,reviewOnly:true};
fs.writeFileSync(path.join(review,'export.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
