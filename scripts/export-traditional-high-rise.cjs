const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),out=path.join(root,'.tools/traditional-high-rise-reference');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const strip=source=>source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');
const source='architecture/traditional-high-rise-reference/';
const reference=process.argv[2]||path.join(out,'reference.png');
const image=fs.readFileSync(reference);
assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Supply the original reference PNG');
fs.mkdirSync(out,{recursive:true});
if(path.resolve(reference)!==path.join(out,'reference.png'))fs.writeFileSync(path.join(out,'reference.png'),image);
execFileSync(process.execPath,[path.join(__dirname,'export-html.cjs')],{cwd:root,stdio:'inherit'});
let html=read('dist/Pancake City - Playtest.html');
assert.ok(!html.includes('traditionalHighRise'));
for(const [before,after] of [
  ['new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox='],
  ['(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew'],
  ['performanceInfo:()=>({...pi,','traditionalReviewScene:C,performanceInfo:()=>({...pi,']
]){
  assert.equal(html.split(before).length,2,before);
  html=html.replace(before,()=>after);
}
const batch=strip(read('benchmark/shared/batched-architecture.js')),model=strip(read(source+'model.js'));
const payload='function traditionalHighRise(T){\n'+batch+'\n'+model+'\nreturn {plan,createMaterials,buildStudy,buildSite};\n}\n'+
  'const traditionalReferenceImage="data:image/png;base64,'+image.toString('base64')+'";\n'+read(source+'preview.js');
assert.ok(!/<\/script/i.test(payload));
const end=html.indexOf('</script>',html.indexOf('<script type="module">'));
assert.ok(end>0);
html=html.slice(0,end)+'\n'+payload+'\n'+html.slice(end);
assert.ok(!/<(?:script|link|img)\b[^>]*(?:src|href)\s*=\s*["'](?!data:)/i.test(html));
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const file=path.join(dist,'Pancake City - Traditional High-Rise Test City - '+stamp+'.html');
fs.writeFileSync(file,html,{flag:'wx'});
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const report={file,sha256:hash(html),referenceSha256:hash(image),models:1,reviewOnly:true};
fs.writeFileSync(path.join(out,'export.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
