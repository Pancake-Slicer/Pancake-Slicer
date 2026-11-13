// Publication tooling only: asset.json remains the sole game registration contract.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {definitions}=require('./growable-assets.cjs');
const root=path.resolve(__dirname,'..'),base=path.join(root,'Assets/buildings'),out=path.join(root,'.tools/approved-library');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);};
const resolveDependency=dep=>{const paths=[dep.path,...(dep.alternatePaths||[])].map(p=>path.resolve(root,p));assert.ok(paths.every(p=>p.startsWith(root+path.sep)));const found=paths.find(p=>fs.existsSync(p));assert.ok(found,'Missing source dependency: '+dep.path);return found;};
const registered=new Map(definitions().map(d=>[d.id,d])),entries=[];
for(const id of fs.readdirSync(base).sort()){
 const folder=path.join(base,id),metaFile=path.join(folder,'architecture.json');if(!fs.existsSync(metaFile))continue;
 const meta=JSON.parse(fs.readFileSync(metaFile));if(meta.approval!=='approved')continue;
 const d=registered.get(id);assert.ok(d,'Published asset must use existing asset.json interface');assert.equal(meta.schemaVersion,1);assert.equal(meta.assetManifest,'asset.json');assert.equal(meta.id,d.id);assert.equal(meta.version,d.version);
 assert.equal(meta.integrity.manifestSha256,hash(path.join(folder,'asset.json')));assert.equal(meta.integrity.modelSha256,hash(path.join(folder,d.model.path)));
 assert.deepEqual(meta.origin.position,[0,0,0]);assert.deepEqual(meta.origin.front,d.orientation.front);assert.deepEqual(meta.origin.up,d.orientation.up);assert.deepEqual(meta.origin.entrance,d.orientation.entrance);assert.equal(meta.origin.groundY,0);assert.equal(meta.units,'metres');assert.deepEqual(meta.dependencies.runtime,[]);
 assert.ok(meta.architecturalStyle&&meta.suggestedUse.category==='commercial'&&meta.suggestedUse.density==='high');
 const measuredMin=[Infinity,Infinity,Infinity],measuredMax=[-Infinity,-Infinity,-Infinity];
 for(const part of d.payload.parts){const bytes=Buffer.from(part.position.array,'base64'),m=part.matrix;for(let i=0;i<bytes.length;i+=12){const x=bytes.readFloatLE(i),y=bytes.readFloatLE(i+4),z=bytes.readFloatLE(i+8),q=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];q.forEach((v,k)=>{measuredMin[k]=Math.min(measuredMin[k],v);measuredMax[k]=Math.max(measuredMax[k],v);});}}
 assert.deepEqual(meta.measured.bounds,{min:measuredMin,max:measuredMax});assert.deepEqual(meta.measured.dimensions,{width:measuredMax[0]-measuredMin[0],depth:measuredMax[2]-measuredMin[2],height:measuredMax[1]-measuredMin[1]});
 assert.ok(meta.textures.every(t=>t.embedded&&t.width>0&&t.height>0));
 for(const dep of meta.dependencies.authoring){const file=resolveDependency(dep);assert.equal(hash(file),dep.sha256,'Authoring dependency changed: '+dep.path);}
 const sourceOut=path.join(out,'sources',id);fs.mkdirSync(path.join(sourceOut,'assets'),{recursive:true});
 for(const dep of meta.dependencies.authoring.filter(d=>d.role!=='facade source artwork'))copy(resolveDependency(dep),path.join(sourceOut,path.basename(dep.path)));
 fs.writeFileSync(path.join(sourceOut,'engine.js'),"export * from '../../vendor/three.module.js';\n");copy(resolveDependency(meta.dependencies.authoring.find(d=>d.path===meta.benchmark.facadeSource)),path.join(sourceOut,'assets/facade.png'));
 for(const f of ['asset.json','architecture.json',d.model.path])copy(path.join(folder,f),path.join(out,'packages',id,f));
 entries.push({id:d.id,name:d.name,version:d.version,manifest:id+'/asset.json',metadata:id+'/architecture.json',model:id+'/'+d.model.path,sha256:d.model.sha256});
}
assert.ok(entries.length,'No approved architecture metadata found');
const catalogue={schemaVersion:1,manifestSpecification:'../../docs/building-asset.schema.json',metadataSpecification:'../../docs/approved-building-metadata.schema.json',entries};
fs.writeFileSync(path.join(base,'approved-library.json'),JSON.stringify(catalogue,null,2)+'\n');copy(path.join(base,'approved-library.json'),path.join(out,'catalogue.json'));
for(const f of ['index.html','scene.js'])copy(path.join(root,'benchmark/approved-library',f),path.join(out,f));
for(const [from,to] of [['build/three.module.js','three.module.js'],['build/three.core.js','three.core.js'],['examples/jsm/loaders/GLTFLoader.js','loaders/GLTFLoader.js'],['examples/jsm/utils/BufferGeometryUtils.js','utils/BufferGeometryUtils.js'],['LICENSE','LICENSE']])copy(path.join(root,'.tools/node_modules/three',from),path.join(out,'vendor',to));
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'.tools/node_modules/three/package.json'))).version,'0.180.0');
copy(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
console.log('Prepared '+entries.length+' independent approved packages at '+out);
