// The exported demo is the actual game plus a repeatable ordinary road/zoning
// scenario. This setup is not included in the normal game runtime.
const fs=require('node:fs'),path=require('node:path');require('./export-html.cjs');
const root=path.resolve(__dirname,'..'),file=path.join(root,'dist/Pancake City - Playtest.html');
let html=fs.readFileSync(file,'utf8');
const before='new URLSearchParams(location.search).has("test")&&(window.__sandbox=';
if(html.split(before).length!==2)throw Error('Test inspection boundary changed');
html=html.replace(before,'true&&(window.__sandbox=');
html=html.replace('(!Or.has("test")||Or.has("terrain"))&&Ew','false&&Ew');
const setup=fs.readFileSync(path.join(root,'scripts/growable-demo-setup.js'),'utf8');
const marker='</script>';const index=html.indexOf(marker,html.indexOf('<script type="module">'));
html=html.slice(0,index)+'\n'+setup+'\n'+html.slice(index);
const out=path.join(root,'dist/Pancake City - Lind Growables Demo.html');fs.writeFileSync(out,html);console.log('Playable actual-game demo: '+out);
