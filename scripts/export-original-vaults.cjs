const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),out=path.join(root,'.tools/original-vaults');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const strip=source=>source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');
const batch=strip(read('benchmark/shared/batched-architecture.js'));
const archived=strip(read('architecture/barrel-vault-reference/model.js'));
const review=read('scripts/original-vaults-review.js');
execFileSync(process.execPath,[path.join(__dirname,'export-html.cjs')],{cwd:root,stdio:'inherit'});
const normal=read('dist/Pancake City - Playtest.html').replace('<html','<html data-bmo-development');
let compare=normal;
for(const [a,b] of [
  ['new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox='],
  ['(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew'],
  ['performanceInfo:()=>({...pi,','vaultReviewScene:C,performanceInfo:()=>({...pi,']
]){
  assert.equal(compare.split(a).length,2,a);compare=compare.replace(a,()=>b);
}
const end=compare.indexOf('</script>',compare.indexOf('<script type="module">'));
assert.ok(end>0);
const extra='\nfunction barrelVaultReference(T){\n'+batch+'\n'+archived+'\nreturn {buildStudy};\n}\n'+review+'\n';
assert.ok(!/<\/script/i.test(extra));
compare=compare.slice(0,end)+extra+compare.slice(end);
assert.ok(!/function barrelVaultReference/.test(normal));
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
function save(name,html){
  assert.ok(!/<(?:script|link|img)\b[^>]*\b(?:src|href)\s*=\s*["'](?!data:)/i.test(html));
  const file=path.join(dist,'Pancake City - Original Vault Offices '+name+' - '+stamp+'.html');
  fs.writeFileSync(file,html,{flag:'wx'});
  return {file,sha256:crypto.createHash('sha256').update(html).digest('hex')};
}
const manifest={playtest:save('Playtest',normal),review:save('Test City',compare)};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'exports.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
