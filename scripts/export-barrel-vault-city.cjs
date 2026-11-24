const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{out}=require('./export-barrel-vault.cjs');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const strip=source=>source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');
const model=strip(fs.readFileSync(path.join(root,'architecture/barrel-vault-reference/model.js'),'utf8'));
const batch=strip(fs.readFileSync(path.join(root,'benchmark/shared/batched-architecture.js'),'utf8'));
const city=fs.readFileSync(path.join(root,'architecture/barrel-vault-reference/city.js'),'utf8');
execFileSync(process.execPath,[path.join(__dirname,'export-html.cjs')],{cwd:root,stdio:'inherit'});
let html=fs.readFileSync(path.join(dist,'Pancake City - Playtest.html'),'utf8');
for(const [before,after] of [
  ['new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox='],
  ['(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew'],
  ['performanceInfo:()=>({...pi,','barrelVaultScene:C,performanceInfo:()=>({...pi,']
]){
  assert.equal(html.split(before).length,2,before);
  html=html.replace(before,()=>after);
}
const end=html.indexOf('</script>',html.indexOf('<script type="module">'));
assert.ok(end>0);
const study='function barrelVaultPackage(T){\n'+batch+'\n'+model+'\nreturn {createMaterials,buildStudy,buildSite};\n}\n'+city;
assert.ok(!/<\/script/i.test(study));
html=html.slice(0,end)+'\n'+study+'\n'+html.slice(end);
assert.ok(!/<(?:script|link|img)\b[^>]*\b(?:src|href)\s*=\s*["'](?!data:)/i.test(html));
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const file=path.join(dist,'Pancake City - Barrel-Vault Test City - '+stamp+'.html');
fs.writeFileSync(file,html,{flag:'wx'});
const report={file,sha256:crypto.createHash('sha256').update(html).digest('hex'),models:1,reviewOnly:true};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'city-export.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
