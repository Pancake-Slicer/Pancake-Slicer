// Assemble the portable package from the SAME approved modules used by the Lab.
// Copies are generated build output; there is only one architectural source.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {compileGLB}=require('./growable-assets.cjs');
const root=path.resolve(__dirname,'..'),src=path.join(root,'architecture/integration/ohneeohnee-family'),out=path.join(root,'dist/architecture/ohneeohnee-family');
const files=[['architecture/modernist/spec.mjs','spec.mjs'],['architecture/modernist/geometry.js','geometry.js'],['architecture/modernist/materials.js','materials.js'],['benchmark/shared/batched-architecture.js','batched-architecture.js'],...['systems.mjs','enhanced.js','roof-surfaces.js','family.js','facade-styles.mjs','optimized-renderer.js'].map(f=>['architecture/assemblies/'+f,'assemblies/'+f])];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex'),copy=(a,b)=>{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b);};
const lockPath=path.join(src,'source-lock.json'),current=Object.fromEntries(files.map(([file])=>[file,hash(fs.readFileSync(path.join(root,file)))]));
if(fs.existsSync(lockPath))assert.deepEqual(current,JSON.parse(fs.readFileSync(lockPath)).files,'Approved generator changed; review/version the package instead of silently changing candidate output');else fs.writeFileSync(lockPath,JSON.stringify({schemaVersion:1,approvedCommit:'ae30ab76ca80ae8a35ff7942eda96767abee333d',files:current},null,2)+'\n');
for(const [from,to]of files)copy(path.join(root,from),path.join(out,to));
for(const f of ['index.js','candidates.json','source-lock.json','README.md','catalogue.json','catalogue.schema.json'])if(fs.existsSync(path.join(src,f)))copy(path.join(src,f),path.join(out,f));
fs.writeFileSync(path.join(out,'engine.js'),"// Host supplies the same Three.js r180 instance as its renderer.\nexport * from 'three';\n");
const glb=path.join(root,'Assets/growable-registry/ohneeohnee-modernist@1.0.0/ohneeohnee.glb'),sha='2938c48decce49b82fcead7dd831f138597f24828f0155a32f2e8b0894f8f133';assert.equal(hash(fs.readFileSync(glb)),sha);
fs.writeFileSync(path.join(out,'approved-reference.json'),JSON.stringify(compileGLB(glb)));
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify({name:'@pancake-city/ohneeohnee-family',version:'6.0.0',type:'module',main:'./index.js',exports:{'.':'./index.js','./catalogue':'./catalogue.json'},peerDependencies:{three:'0.180.0'},description:'Phase 6A procedural integration candidates; no automatic gameplay registration'},null,2)+'\n');
copy(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({packageVersion:'6.0.0',generatorSources:current,approvedReference:{asset:'ohneeohnee-modernist@1.0.0',sha256:sha},runtimeResourceSha256:hash(fs.readFileSync(path.join(out,'approved-reference.json'))),labUIIncluded:false,registrationEnabled:false},null,2)+'\n');
console.log('Portable UI-free package: '+out);
