// Shared Architecture packages are read-only. Only validated portable copies
// enter the game registry; no authoring code is executed by this importer.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {validateAsset,definitions}=require('./growable-assets.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const decoded=new Set;
function decodeTextures(uris){
 const pending=[...new Set(uris)].filter(uri=>!decoded.has(hash(Buffer.from(uri))));if(!pending.length)return;
 if(process.platform!=='win32'){assert.ok(pending.every(uri=>uri.startsWith('data:image/png;')),'JPEG pixel validation requires the Windows image decoder');return;}
 const script="$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Drawing; $items=ConvertFrom-Json ([Console]::In.ReadToEnd()); foreach($b64 in $items){ $s=New-Object System.IO.MemoryStream(,[Convert]::FromBase64String($b64)); $img=$null; $bmp=$null; try { $img=[System.Drawing.Image]::FromStream($s,$true,$true); $bmp=New-Object System.Drawing.Bitmap($img); $null=$bmp.GetPixel($bmp.Width-1,$bmp.Height-1) } finally { if($bmp){$bmp.Dispose()}; if($img){$img.Dispose()}; $s.Dispose() } }; 'decoded'";
 const exe=path.join(process.env.SystemRoot||'C:/Windows','System32/WindowsPowerShell/v1.0/powershell.exe'),result=require('node:child_process').spawnSync(exe,['-NoProfile','-NonInteractive','-Command',script],{input:JSON.stringify(pending.map(uri=>uri.slice(uri.indexOf(',')+1))),encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:1024*1024});
 assert.ok(result.status===0&&result.stdout.includes('decoded'),'Embedded image pixel decoding failed: '+(result.error?.message||result.stderr||''));for(const uri of pending)decoded.add(hash(Buffer.from(uri)));
}
const inside=(base,name)=>{const p=path.resolve(base,name);assert.ok(p.startsWith(path.resolve(base)+path.sep),'Package path escapes its directory');assert.ok(fs.realpathSync(p).startsWith(fs.realpathSync(base)+path.sep),'Package symlink escapes its directory');assert.ok(!fs.lstatSync(p).isSymbolicLink(),'Symlink package files are unsupported');return p;};
function scan(base,onError=()=>{}){
 const found=[];
 function visit(dir){let entries;try{entries=fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name));}catch(e){onError(e,dir);return;}if(entries.some(e=>e.isFile()&&e.name==='asset.json')){found.push(path.join(dir,'asset.json'));return;}if(entries.some(e=>e.isFile()&&(e.name==='architecture.json'||/\.(?:glb|gltf|fbx|obj)$/i.test(e.name))))found.push(path.join(dir,'asset.json'));for(const e of entries)if(e.isDirectory()&&!e.isSymbolicLink())visit(path.join(dir,e.name));}visit(base);return found;
}
function imageSize(uri){
 const match=/^data:(image\/(?:png|jpeg));base64,(.+)$/.exec(uri);assert.ok(match,'Embedded PNG/JPEG required');const b=Buffer.from(match[2],'base64');
 if(match[1]==='image/png'){
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Invalid PNG');assert.equal(b.toString('ascii',12,16),'IHDR');
  const w=b.readUInt32BE(16),h=b.readUInt32BE(20);assert.ok(w>0&&h>0&&w<=16384&&h<=16384,'Invalid texture size');
  let at=8,ended=false;const idat=[];while(at<b.length){const n=b.readUInt32BE(at),type=b.toString('ascii',at+4,at+8);assert.ok(at+12+n<=b.length,'Truncated PNG');if(type==='IDAT')idat.push(b.subarray(at+8,at+8+n));at+=12+n;if(type==='IEND'){ended=true;break;}}
  assert.ok(ended&&idat.length,'Incomplete PNG');require('node:zlib').inflateSync(Buffer.concat(idat),{maxOutputLength:256*1024*1024});return {width:w,height:h,sha256:hash(b)};
 }
 assert.equal(b.readUInt16BE(0),0xffd8,'Invalid JPEG');assert.equal(b.readUInt16BE(b.length-2),0xffd9,'Truncated JPEG');
 for(let i=2;i+8<b.length;){assert.equal(b[i++],255,'Invalid JPEG marker');while(b[i]===255)i++;const tag=b[i++];if(tag===0xda)break;const n=b.readUInt16BE(i);assert.ok(n>=2&&i+n<=b.length);if([0xc0,0xc1,0xc2].includes(tag))return {height:b.readUInt16BE(i+3),width:b.readUInt16BE(i+5),sha256:hash(b)};i+=n;}throw Error('Unsupported JPEG dimensions');
}
function validatePackage(file){
 const folder=path.dirname(file),meta=JSON.parse(fs.readFileSync(inside(folder,'architecture.json'))),raw=fs.readFileSync(file);
 assert.equal(meta.approval,'approved','Architecture approval must be approved');assert.equal(meta.schemaVersion,1);assert.equal(meta.assetManifest,path.basename(file));
 assert.equal(meta.integrity.manifestSha256,hash(raw),'Approved manifest hash mismatch');
 const manifest=JSON.parse(raw);assert.equal(manifest.model.format,'glb','Only portable static GLBs can be auto-imported');assert.ok(fs.statSync(inside(folder,manifest.model.path)).size<=64*1024*1024,'Model exceeds the 64 MiB per-package import limit');
 const d=validateAsset(file);assert.equal(d.model.sha256,meta.integrity.modelSha256);assert.equal(d.payload.sha256,meta.integrity.modelSha256);
 assert.equal(meta.id,d.id);assert.equal(meta.version,d.version);assert.equal(meta.units,'metres');assert.deepEqual(meta.origin.position,[0,0,0]);assert.equal(meta.origin.groundY,0);assert.deepEqual(meta.origin.front,d.orientation.front);assert.deepEqual(meta.origin.up,d.orientation.up);assert.deepEqual(meta.origin.entrance,d.orientation.entrance);assert.deepEqual(meta.dependencies.runtime,[]);
 assert.ok(d.selectionWeight>0&&Number.isFinite(d.selectionWeight));assert.ok(Object.values(d.dimensions).every(v=>Number.isFinite(v)&&v>=0),'Invalid architectural dimensions');assert.ok(d.eligibility.capacityMinFloors<=80,'Current game capacity is at most 80 floors');assert.equal(d.eligibility.density,'high');assert.ok(Number.isSafeInteger(d.dimensions.floors));
 assert.ok(d.eligibility.minLotWidth<=66&&d.eligibility.minLotDepth<=66,'Package needs a larger parcel policy than the existing 66 m growable limit');
 assert.ok(d.orientation.entrance[1]>=0&&d.orientation.entrance[1]<=d.bounds.max[1]);
 const measured={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
 for(const part of d.payload.parts){
  const pos=Buffer.from(part.position.array,'base64'),n=pos.length/12,m=part.matrix;assert.equal(m.length,16);assert.ok(m.every(Number.isFinite));assert.ok(n>=3&&Number.isInteger(n));assert.ok(part.normal&&part.uv,'Normals and UV0 required');assert.equal(Buffer.from(part.normal.array,'base64').length,n*12);assert.equal(Buffer.from(part.uv.array,'base64').length,n*8);assert.ok(d.payload.materials[part.material],'Invalid material reference');
  const idx=part.index&&Buffer.from(part.index.array,'base64');if(idx){const stride=part.index.type==='Uint32Array'?4:2;assert.equal(idx.length/stride%3,0);for(let i=0;i<idx.length;i+=stride)assert.ok((stride===4?idx.readUInt32LE(i):idx.readUInt16LE(i))<n,'Index exceeds vertex count');}else assert.equal(n%3,0);
  for(let i=0;i<pos.length;i+=12){const x=pos.readFloatLE(i),y=pos.readFloatLE(i+4),z=pos.readFloatLE(i+8),q=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];q.forEach((v,k)=>{measured.min[k]=Math.min(v,measured.min[k]);measured.max[k]=Math.max(v,measured.max[k]);});}
 }
 assert.deepEqual(measured,meta.measured.bounds,'Measured model bounds differ from approval');
 const dims={width:measured.max[0]-measured.min[0],height:measured.max[1]-measured.min[1],depth:measured.max[2]-measured.min[2]};assert.deepEqual(dims,meta.measured.dimensions);for(const k of Object.keys(dims))assert.ok(Math.abs(d.dimensions[k]-dims[k])<.01,'Declared dimensions mismatch');assert.ok(Math.abs(measured.min[1])<.001,'Model is not grounded');
 for(const material of d.payload.materials){assert.equal(material.color.length,3);assert.equal(material.emissive.length,3);assert.ok([...material.color,...material.emissive,material.metalness,material.roughness].every(Number.isFinite));assert.ok([...material.color,material.metalness,material.roughness].every(v=>v>=0&&v<=1),'Invalid PBR factor');if(material.image){const size=imageSize(material.image),listed=meta.textures.find(t=>t.sha256===size.sha256);assert.ok(size.width>0&&size.height>0&&size.width<=16384&&size.height<=16384,'Invalid texture dimensions');assert.ok(listed&&listed.embedded,'Texture absent from approval inventory');assert.equal(size.width,listed.width);assert.equal(size.height,listed.height);assert.equal(listed.mimeType,material.image.slice(5,material.image.indexOf(';')));}}
 decodeTextures(d.payload.materials.filter(m=>m.image).map(m=>m.image));
 const notices=[];function collect(dir,inNotice=false){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){if(e.isSymbolicLink())continue;const p=path.join(dir,e.name),notice=inNotice||/^(?:license|licence|copyright|notice|attribution)/i.test(e.name);if(e.isDirectory())collect(p,notice);else if(notice)notices.push({path:path.relative(folder,p),sha256:hash(fs.readFileSync(p))});}}collect(folder);
 const model=inside(folder,d.model.path),fingerprint=hash(Buffer.concat([raw,fs.readFileSync(model),fs.readFileSync(path.join(folder,'architecture.json')),...(notices.length?[Buffer.from(JSON.stringify(notices))]:[])]));
 return {d,folder,file,model,meta,fingerprint,notices,manifestSha256:hash(raw),modelSha256:d.payload.sha256};
}
function syncLibrary({source,registry,probe=()=>{}}){
 fs.mkdirSync(registry,{recursive:true});const existing=definitions(registry),keys=new Map(existing.map(d=>[d.id+'@'+d.version,d])),report={source,entries:[],added:[],retained:existing.map(d=>d.key)};
 const candidates=new Map;
 for(const file of scan(source,(e,dir)=>report.entries.push({file:dir,status:'skipped',reason:'Cannot scan directory: '+e.message}))){try{const p=validatePackage(file),key=p.d.id+'@'+p.d.version;probe(p.d);if(!candidates.has(key))candidates.set(key,[]);candidates.get(key).push(p);}catch(e){report.entries.push({file,status:'skipped',reason:e.message});}}
 for(const [key,packages]of candidates){
  if(new Set(packages.map(p=>p.fingerprint)).size>1){report.entries.push({key,status:'skipped',reason:'Conflicting packages use the same ID/version; publish a new version'});continue;}
  const p=packages[0],current=keys.get(key),dest=path.join(registry,key);
  if(current){const receipt=JSON.parse(fs.readFileSync(path.join(dest,'accepted.json')));report.entries.push({key,status:receipt.fingerprint===p.fingerprint?'unchanged':'skipped',reason:receipt.fingerprint===p.fingerprint?'Already registered':'Published version is immutable; increase the Architecture package version'});continue;}
  // Same bytes under another ID create a duplicate model rather than a new design.
  if(existing.some(d=>d.id!==p.d.id&&d.payload.sha256===p.modelSha256)||report.added.some(a=>a.id!==p.d.id&&a.modelSha256===p.modelSha256)){report.entries.push({key,status:'skipped',reason:'Identical model already registered under another identity'});continue;}
  fs.mkdirSync(dest);fs.copyFileSync(p.file,path.join(dest,'asset.json'));const modelDest=path.join(dest,p.d.model.path);fs.mkdirSync(path.dirname(modelDest),{recursive:true});fs.copyFileSync(p.model,modelDest);fs.copyFileSync(path.join(p.folder,'architecture.json'),path.join(dest,'architecture.json'));
  for(const notice of p.notices){const to=path.join(dest,notice.path);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(inside(p.folder,notice.path),to);}
  const receipt={id:p.d.id,version:p.d.version,fingerprint:p.fingerprint,manifestSha256:p.manifestSha256,modelSha256:p.modelSha256,notices:p.notices};fs.writeFileSync(path.join(dest,'accepted.json'),JSON.stringify(receipt,null,2)+'\n');report.added.push({...receipt,key});report.entries.push({key,status:'accepted',duplicates:packages.length-1});
 }
 return report;
}
module.exports={scan,validatePackage,syncLibrary,imageSize};
