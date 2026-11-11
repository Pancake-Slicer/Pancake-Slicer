const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),file=path.join(root,'web/assets/sc4-originals.local.js');
const local={};if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),local);
const imported=local.pcSC4Originals;
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
const context=vm.createContext({console,performance,structuredClone,pcSC4Originals:imported,window:{addEventListener(){}},document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,q,Se,pS,pcSC4Fits,pcSC4Render,pcSC4Model,pcSC4UpdateViews};',context);
const api=context.api;
const originalTest=(name,fn)=>test(name,{skip:!imported?.models?'Local SC4 artwork not imported on this computer':false},fn);
originalTest('all 98 references have four original highest-detail models and embedded PNG atlases',()=>{
 assert.equal(imported.version,2,'Artwork must use the corrected BC1 alpha decoder');
 const mapping=require('../reference/sc4-original-mapping.json'),references=require('../reference/sc4-commercial-wealth3.json').entries;
 assert.equal(Object.keys(imported.models).length,98);assert.equal(mapping.entries.length,98);
 for(const entry of references){const model=imported.models[entry.id];assert.equal(model.name,entry.name);assert.equal(model.variants.length,4);
  for(const view of model.variants){assert.equal(view.key[0],0x5ad0e817);assert.equal(view.key[2]&0xf00,0x400);assert.equal(view.positions.length%9,0);assert.equal(view.uv.length/2,view.positions.length/3);assert.ok(view.positions.every(Number.isFinite));assert.ok(view.uv.every(v=>Number.isFinite(v)&&v>=0&&v<=1));assert.equal(Buffer.from(view.png,'base64').subarray(0,8).toString('hex'),'89504e470d0a1a0a');}
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)assert.ok(model.variants[a].direction[0]*model.variants[b].direction[0]+model.variants[a].direction[1]*model.variants[b].direction[1]<.2,'Views must face different directions');
 }
});
originalTest('every original renders at native scale, with four view meshes and preserved picking IDs',()=>{
 for(const model of Object.values(imported.models)){
  const building={id:'test:'+model.id,office:{catalogueId:model.id},x:100,z:200,y:5,ground:4.5,rotation:.37,frontage:76,depth:76,floors:50,footprint:[{x:62,z:162},{x:138,z:162},{x:138,z:238},{x:62,z:238}]},group=new api.Se,statistics={windows:0};
  assert.equal(api.pcSC4Render(building,(geometry,material,id)=>{assert.equal(id,building.id);const object={geometry,material,visible:true};group.children.push(object);},()=>{throw Error('No invented detail boxes may be added');},statistics),true);
  const views=group.children.filter(x=>x.material.userData.pcSC4);assert.equal(views.length,4);
  const p=views[0].geometry.attributes.position;
  assert.ok(Math.abs(p.getY(0)-(building.y+model.variants[0].positions[1]-model.bounds.minY))<.0001,'Original height must not be rescaled');
  const dx=p.getX(0)-p.getX(1),dz=p.getZ(0)-p.getZ(1),q=model.variants[0].positions;
  assert.ok(Math.abs(Math.hypot(dx,dz)-Math.hypot(q[0]-q[3],q[2]-q[5]))<.0001,'Original proportions and dimensions must survive rotation');
  for(let view=0;view<4;view++){
   const [x,z]=model.variants[view].direction,cos=Math.cos(building.rotation),sin=Math.sin(building.rotation);
   const camera={getWorldDirection:out=>out.set(-(cos*x+sin*z),-.5,-(-sin*x+cos*z))};api.pcSC4UpdateViews(group,camera);
   assert.equal(views.filter(x=>x.visible).length,1);assert.equal(views[view].visible,true);assert.equal(views[view].material.map.flipY,false);
  }
  for(const object of group.children)object.geometry.dispose();
 }
});
originalTest('all 392 PNG atlases contain complete, decodable RGBA image streams',()=>{
 const {inflateSync}=require('node:zlib');let count=0;
 for(const model of Object.values(imported.models))for(const view of model.variants){
  const bytes=Buffer.from(view.png,'base64'),chunks=[];let width,height;
  for(let offset=8;offset<bytes.length;){const size=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);assert.ok(offset+12+size<=bytes.length);if(type==='IHDR'){width=bytes.readUInt32BE(offset+8);height=bytes.readUInt32BE(offset+12);assert.equal(bytes[offset+16],8);assert.equal(bytes[offset+17],6);}if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+size));offset+=12+size;}
  assert.equal(width,view.width);assert.equal(height,view.height);const raw=inflateSync(Buffer.concat(chunks));assert.equal(raw.length,(width*4+1)*height);for(let y=0;y<height;y++)assert.ok(raw[y*(width*4+1)]<=4);count++;
 }
 assert.equal(count,392);
});
originalTest('large originals cannot paint small plots; adequate plots retain native dimensions through undo/redo',()=>{
 const network=new api.zb,points=[{x:-180,z:-120},{x:180,z:-120},{x:180,z:120},{x:-180,z:120}];
 network.addBatch(points.map((p,i)=>[p,points[(i+1)%4]]));const zoning=new api.qb(network,{items:[]});zoning.setPropertyZone('offices');
 zoning.pcCatalogueChoice=424;const model=api.pcSC4Model(424),small=zoning.properties.find(p=>!api.pcSC4Fits(p,model)),large=zoning.properties.find(p=>api.pcSC4Fits(p,model));assert.ok(small&&large);
 assert.equal(zoning.fillProperty(small.id,'offices'),false);assert.equal(zoning.buildings.length,0);
 assert.equal(zoning.fillProperty(large.id,'offices'),true);assert.equal(zoning.buildings[0].height,model.bounds.maxY-model.bounds.minY);
 const signature=zoning.buildings[0].signature;assert.equal(network.undo(),true);zoning.rebuild();assert.equal(zoning.buildings.length,0);assert.equal(network.redo(),true);zoning.rebuild();assert.equal(zoning.buildings[0].signature,signature);
 const scene=new api.Se,renderer=api.pS(scene);assert.equal(renderer.render(zoning),true);const camera={position:{x:100,y:500,z:100},getWorldDirection:out=>out.set(-1,-1,-1)};renderer.updateLOD(camera);
 let originalVisible=0,ranges=0;scene.traverse(object=>{if(object.material?.userData.pcSC4&&object.visible)originalVisible++;ranges+=(object.userData.buildingRanges||[]).length;});assert.equal(originalVisible,1);assert.ok(ranges>=5);assert.equal(renderer.render(zoning),false);
});
test('S3D primitive conversion preserves triangle lists and handles strips/fans',()=>{
 const {triangles}=require('./import-sc4-originals.cjs');assert.deepEqual(triangles([0,1,2],[{type:0,first:0,numIndex:3}]),[0,1,2]);assert.deepEqual(triangles([0,1,2,3],[{type:1,first:0,numIndex:4}]),[0,1,2,2,1,3]);assert.deepEqual(triangles([0,1,2,3],[{type:2,first:0,numIndex:4}]),[0,1,2,0,2,3]);
});
test('BC1 endpoint colours remain opaque, with transparency only in the defined three-colour mode',()=>{
 const {decodeBlocks}=require('./sc4-texture-decoder.cjs');
 const opaque=decodeBlocks(Buffer.from([0,248,224,7,0xe4,0xe4,0xe4,0xe4]),4,4);
 assert.deepEqual([...opaque.subarray(0,4)],[255,0,0,255]);assert.deepEqual([...opaque.subarray(4,8)],[0,255,0,255]);
 for(let p=0;p<16;p++)assert.equal(opaque[p*4+3],255,'Endpoint colours may not create holes');
 const transparent=decodeBlocks(Buffer.from([0,0,255,255,255,255,255,255]),4,4);assert.ok(transparent.every(v=>v===0));
 const explicit=decodeBlocks(Buffer.from([0x0f,0xff,0xff,0xff,0xff,0xff,0xff,0xff,0,0,255,255,0,0,0,0]),4,4,true);assert.equal(explicit[3],255);assert.equal(explicit[7],0);assert.equal(explicit[11],255);
 assert.throws(()=>decodeBlocks(Buffer.alloc(7),4,4),/Truncated/);
});
