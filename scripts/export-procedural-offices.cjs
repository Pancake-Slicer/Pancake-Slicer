const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
require('./export-html.cjs');
const root=path.resolve(__dirname,'..'),base=fs.readFileSync(path.join(root,'dist/Pancake City - Playtest.html'),'utf8').replace('<html','<html data-experimental-offices');
const folder=path.join(os.homedir(),'Downloads'),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
function write(kind,html){const name='Pancake City - Procedural Offices '+kind+' - '+stamp+'.html',out=path.join(folder,name);fs.writeFileSync(out,html,{flag:'wx'});return out;}
const playtest=write('Playtest',base);
let demo=base.replace('new URLSearchParams(location.search).has("test")&&(window.__sandbox=','true&&(window.__sandbox=').replace('(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew');
const offset=demo.indexOf('</script>',demo.indexOf('<script type="module">'));
demo=demo.slice(0,offset)+'\n'+fs.readFileSync(path.join(root,'scripts/procedural-offices-demo.js'),'utf8')+'\n'+demo.slice(offset);
const populated=write('Demo',demo);fs.mkdirSync(path.join(root,'.tools/phase6b'),{recursive:true});fs.writeFileSync(path.join(root,'.tools/phase6b/exports.json'),JSON.stringify({playtest,demo:populated},null,2));console.log(JSON.stringify({playtest,demo:populated},null,2));
