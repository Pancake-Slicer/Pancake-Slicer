const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist'),out=path.join(root,'.tools/original-traditional-offices');
execFileSync(process.execPath,[path.join(__dirname,'export-html.cjs')],{cwd:root,stdio:'inherit'});
const normal=fs.readFileSync(path.join(dist,'Pancake City - Playtest.html'),'utf8').replace('<html','<html data-bmo-development');
let review=normal;
for(const [before,after] of [
  ['new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox='],
  ['(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew']
]){
  assert.equal(review.split(before).length,2,before);
  review=review.replace(before,()=>after);
}
const scene=fs.readFileSync(path.join(root,'scripts/original-traditional-offices-review.js'),'utf8');
const end=review.indexOf('</script>',review.indexOf('<script type="module">'));
assert.ok(end>0&&!/<\/script/i.test(scene));
review=review.slice(0,end)+'\n'+scene+'\n'+review.slice(end);
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
function save(kind,html){
  assert.ok(!/<(?:script|link|img)\b[^>]*\b(?:src|href)\s*=\s*["'](?!data:)/i.test(html));
  assert.ok(!html.includes('function traditionalHighRise('),'Archived U-shaped benchmark must stay out of this export');
  const file=path.join(dist,'Pancake City - Traditional Offices '+kind+' - '+stamp+'.html');
  fs.writeFileSync(file,html,{flag:'wx'});
  return {file,sha256:crypto.createHash('sha256').update(html).digest('hex')};
}
const manifest={playtest:save('Playtest',normal),review:save('Test City',review)};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'exports.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
