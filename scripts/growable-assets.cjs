// Compile portable static glTF into an offline payload; no runtime fetch/loader
// dependency. All authored manifests are discovered automatically.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function multiply(a,b){return Array.from({length:16},(_,i)=>{const row=i%4,col=Math.floor(i/4);let v=0;for(let k=0;k<4;k++)v+=a[k*4+row]*b[col*4+k];return v;});}
function nodeMatrix(n){
 if(n.matrix)return n.matrix;
 const [x,y,z,w]=n.rotation||[0,0,0,1],[sx,sy,sz]=n.scale||[1,1,1],t=n.translation||[0,0,0];
 return [(1-2*y*y-2*z*z)*sx,(2*x*y+2*z*w)*sx,(2*x*z-2*y*w)*sx,0,(2*x*y-2*z*w)*sy,(1-2*x*x-2*z*z)*sy,(2*y*z+2*x*w)*sy,0,(2*x*z+2*y*w)*sz,(2*y*z-2*x*w)*sz,(1-2*x*x-2*y*y)*sz,0,...t,1];
}
function compileGLB(file){
 const data=fs.readFileSync(file);assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
 let doc,bin;for(let offset=12;offset<data.length;){const length=data.readUInt32LE(offset),type=data.readUInt32LE(offset+4),chunk=data.subarray(offset+8,offset+8+length);if(type===0x4e4f534a)doc=JSON.parse(chunk.toString());if(type===0x004e4942)bin=chunk;offset+=8+length;}
 assert.ok(doc&&bin,'GLB needs embedded JSON/BIN');assert.ok(!doc.animations?.length&&!doc.skins?.length,'Static buildings only');assert.equal(doc.buffers.length,1);assert.ok(!doc.buffers[0].uri);
 assert.ok(!(doc.extensionsUsed||[]).length,'Unsupported glTF extension: '+doc.extensionsUsed);
 const read=(i,indices=false)=>{
  const a=doc.accessors[i];assert.ok(a&&!a.sparse,'Missing/sparse accessor unsupported');const v=doc.bufferViews[a.bufferView];assert.equal(v.buffer||0,0);
  if(indices){assert.equal(a.type,'SCALAR');assert.ok([5121,5123,5125].includes(a.componentType),'Unsigned integer indices required');}
  const size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];assert.ok(size);const types={5121:['readUInt8',1,255],5123:['readUInt16LE',2,65535],5125:['readUInt32LE',4,4294967295],5126:['readFloatLE',4,1],5120:['readInt8',1,127],5122:['readInt16LE',2,32767]};const [method,bytes,max]=types[a.componentType]||[];assert.ok(method);
  const out=indices?(a.componentType===5125?new Uint32Array(a.count):new Uint16Array(a.count)):new Float32Array(a.count*size);
  for(let j=0;j<a.count;j++)for(let k=0;k<size;k++){let value=bin[method]((v.byteOffset||0)+(a.byteOffset||0)+j*(v.byteStride||bytes*size)+k*bytes);if(a.normalized)value=Math.max(-1,value/max);assert.ok(Number.isFinite(value));out[j*size+k]=value;}
  return {array:Buffer.from(out.buffer).toString('base64'),itemSize:size,type:out.constructor.name};
 };
 const images=(doc.images||[]).map(image=>{assert.ok(image.bufferView!==undefined&&['image/png','image/jpeg'].includes(image.mimeType),'Embed PNG/JPEG images in GLB');const v=doc.bufferViews[image.bufferView];return 'data:'+image.mimeType+';base64,'+bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength).toString('base64');});
 const materials=(doc.materials||[]).map(m=>{
  assert.ok(!m.extensions&&!m.normalTexture&&!m.occlusionTexture&&!m.emissiveTexture,'Unsupported material detail; bake to supported PBR or extend common adapter');assert.ok(!m.alphaMode||m.alphaMode==='OPAQUE','Opaque PBR buildings only');
  const p=m.pbrMetallicRoughness||{};assert.ok(!p.metallicRoughnessTexture,'Packed metal/rough textures not yet supported');assert.ok(!p.baseColorTexture?.extensions&&(!p.baseColorTexture?.texCoord),'Use UV0 with baked texture transforms');
  const texture=p.baseColorTexture&&doc.textures[p.baseColorTexture.index],sampler=texture?doc.samplers?.[texture.sampler]||{}:null;
  return {color:p.baseColorFactor?.slice(0,3)||[1,1,1],metalness:p.metallicFactor??1,roughness:p.roughnessFactor??1,emissive:m.emissiveFactor||[0,0,0],side:m.doubleSided?2:0,image:texture?images[texture.source]:null,sampler};
 });
 const parts=[];function visit(index,parent){const n=doc.nodes[index];assert.ok(n.skin===undefined&&!n.weights);const matrix=multiply(parent,nodeMatrix(n));if(n.mesh!==undefined)for(const p of doc.meshes[n.mesh].primitives){assert.ok(p.mode===undefined||p.mode===4,'Triangle meshes only');assert.ok(!p.targets&&!p.extensions);assert.ok(Object.keys(p.attributes).every(k=>['POSITION','NORMAL','TEXCOORD_0'].includes(k)),'Unsupported vertex attributes');parts.push({name:n.name||'',matrix,position:read(p.attributes.POSITION),normal:p.attributes.NORMAL!==undefined?read(p.attributes.NORMAL):null,uv:p.attributes.TEXCOORD_0!==undefined?read(p.attributes.TEXCOORD_0):null,index:p.indices!==undefined?read(p.indices,true):null,material:p.material??0});}for(const child of n.children||[])visit(child,matrix);}
 for(const n of doc.scenes[doc.scene||0].nodes)visit(n,identity());assert.ok(parts.length);
 return {parts,materials,sha256:crypto.createHash('sha256').update(data).digest('hex')};
}
function definitions(){
 const base=path.join(root,'Assets/buildings');if(!fs.existsSync(base))return [];
 const files=fs.readdirSync(base).sort().map(name=>path.join(base,name,'asset.json')).filter(file=>fs.existsSync(file)),seen=new Set;
 return files.map(file=>{
  const d=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(d.schemaVersion,1);assert.match(d.id,/^[a-z][a-z0-9-]+$/);assert.match(d.version,/^\d+\.\d+\.\d+$/);assert.ok(d.name&&d.selectionWeight>0);assert.ok(!seen.has(d.id+'@'+d.version),'Duplicate asset version');seen.add(d.id+'@'+d.version);
  assert.equal(d.eligibility.zone,'offices');assert.equal(d.eligibility.developmentStage,'immediate');assert.ok(d.bounds.min.every(Number.isFinite)&&d.bounds.max.every(Number.isFinite));assert.ok(d.dimensions.height>0&&d.dimensions.floorHeight>0&&d.dimensions.floors>0);
  assert.deepEqual(d.orientation.up,[0,1,0]);assert.deepEqual(d.orientation.front,[0,0,1]);assert.equal(d.bounds.min[1],0,'Model origin must sit on ground');
  assert.ok(d.footprint.length>=3&&d.footprint.every(p=>p.length===2&&p.every(Number.isFinite)));
  assert.ok(d.orientation.entrance.length===3&&d.orientation.entrance.every(Number.isFinite));
  for(const key of ['capacityMinFloors','minLotArea','minLotWidth','minLotDepth'])assert.ok(Number.isFinite(d.eligibility[key])&&d.eligibility[key]>0,'Invalid eligibility '+key);
  assert.ok(Number.isFinite(d.eligibility.setback)&&d.eligibility.setback>=0);
  assert.equal(d.selection.kind,'model-instances');assert.equal(d.selection.bounds,'bounds');
  if(d.source?.module&&d.source.sha256){const source=path.resolve(root,d.source.module);assert.ok(source.startsWith(root+path.sep));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),d.source.sha256,'Approved model source changed; review/version the asset');}
  const model=path.resolve(path.dirname(file),d.model.path);assert.ok(model.startsWith(path.dirname(file)+path.sep),'Model path outside asset folder');
  if(d.model.sha256)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(model)).digest('hex'),d.model.sha256,'Registered model hash changed');
  if(d.model.format==='glb'){
   const payload=compileGLB(model),inside=(x,z)=>{
    let hit=false;for(let i=0,j=d.footprint.length-1;i<d.footprint.length;j=i++){
     const [ax,az]=d.footprint[i],[bx,bz]=d.footprint[j],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
     if(Math.hypot(x-ax-t*dx,z-az-t*dz)<.001)return true;
     if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)hit=!hit;
    }return hit;
   };
   for(const part of payload.parts){const bytes=Buffer.from(part.position.array,'base64'),m=part.matrix;
    for(let i=0;i<bytes.length;i+=12){const x=bytes.readFloatLE(i),y=bytes.readFloatLE(i+4),z=bytes.readFloatLE(i+8),p=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
     assert.ok(p.every((v,k)=>v>=d.bounds.min[k]-.001&&v<=d.bounds.max[k]+.001),'Model exceeds bounds');assert.ok(inside(p[0],p[2]),'Model exceeds registered footprint');
    }
   }
   return {...d,key:'asset:'+d.id+'@'+d.version,payload};
  }
  // Procedural authors expose the same reusable resource shape as GLB parts.
  assert.equal(d.model.format,'procedural');const code=fs.readFileSync(model,'utf8');assert.ok(!/\b(?:import|export)\b/.test(code),'Procedural factory must be a standalone function expression');
  return {...d,key:'asset:'+d.id+'@'+d.version,factorySource:code};
 });
}
function assetSource(){const defs=definitions(),factories=defs.filter(d=>d.factorySource).map(d=>'pcRegisterGrowableFactory('+JSON.stringify(d.key)+','+d.factorySource+');');const json=JSON.stringify(defs.map(({factorySource,...d})=>d)).replace(/</g,'\\u003c');return 'const pcGrowableDefinitions='+json+';\n'+fs.readFileSync(path.join(root,'web/features/growable-assets.js'),'utf8')+'\n'+factories.join('\n');}
module.exports={assetSource,definitions,compileGLB};
