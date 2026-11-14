const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {compileGLB}=require('./growable-assets.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.tools/modernist-lab'),vendor=path.join(root,'.tools/node_modules/three');
if(!fs.existsSync(path.join(vendor,'package.json'))||JSON.parse(fs.readFileSync(path.join(vendor,'package.json'))).version!=='0.180.0')throw Error('This lab reuses the existing Architecture tools’ three@0.180.0. Ask Codex to restore that optional local tool package; game dependencies are unchanged.');
const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);};
for(const file of ['three.module.js','three.core.js'])copy(path.join(vendor,'build',file),path.join(out,'vendor',file));
copy(path.join(vendor,'LICENSE'),path.join(out,'vendor/LICENSE'));
fs.writeFileSync(path.join(out,'engine.js'),"export * from './vendor/three.module.js';\n");fs.writeFileSync(path.join(out,'package.json'),'{"type":"module"}\n');
for(const file of ['spec.mjs','geometry.js','materials.js'])copy(path.join(root,'architecture/modernist',file),path.join(out,file));
for(const file of ['index.html','style.css','scene.js'])copy(path.join(root,'architecture/lab',file),path.join(out,file));
copy(path.join(root,'benchmark/shared/batched-architecture.js'),path.join(out,'batched-architecture.js'));
copy(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
// Pin the accepted version, so a future Architecture update cannot silently
// alter this generator version's reference maps or reproducible output.
const packageRoot=path.join(root,'Assets/growable-registry/ohneeohnee-modernist@1.0.0');
const source=path.join(packageRoot,'ohneeohnee.glb'),expected='2938c48decce49b82fcead7dd831f138597f24828f0155a32f2e8b0894f8f133';
if(crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')!==expected)throw Error('Approved Ohneeohnee GLB changed');
fs.writeFileSync(path.join(out,'approved-ohneeohnee.json'),JSON.stringify(compileGLB(source)));
console.log('Prepared isolated Procedural Architecture Lab: '+out+'\nServe at http://127.0.0.1:4187');
