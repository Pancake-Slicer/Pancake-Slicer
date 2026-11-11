// Conversion tools remain available for reference work; the game uses authored rebuilds.
const {test}=require('node:test'),assert=require('node:assert/strict');
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
