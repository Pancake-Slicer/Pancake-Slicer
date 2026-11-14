const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const modules=Promise.all(['spec.mjs','geometry.js','engine.js','assemblies/family.js','assemblies/family-panel.js'].map(f=>import(pathToFileURL(path.resolve(__dirname,'../.tools/modernist-lab',f)).href)));
function library(T){const m=Object.fromEntries(['glass','sideGlass','upperGlass','panel','side','frame','mullion','roof','equipment','dark'].map(k=>[k,new T.MeshStandardMaterial]));return {get:()=>m};}
function signature(model){const h=crypto.createHash('sha256');model.traverse(c=>{if(!c.geometry)return;h.update(c.name);for(const key of ['position','normal','uv'])h.update(Buffer.from(c.geometry.attributes[key].array.buffer));h.update(Buffer.from(c.geometry.index.array.buffer));h.update(JSON.stringify({color:c.material.color.toArray(),roughness:c.material.roughness,metalness:c.material.metalness,opacity:c.material.opacity,transparent:c.material.transparent,side:c.material.side}));});return h.digest('hex');}

test('family rollout preserves every benchmark seed, specification, volume and exact envelope',async()=>{
 const [S,G,T,F]=await modules,lib=library(T),generator=new F.EnhancedFamilyGenerator(lib),historical=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/modernist-family-1138.json')));
 for(const [i,s]of S.benchmark('1138').entries()){
  const {generatorVersion:oldVersion,...old}=historical[i].specification,{generatorVersion:newVersion,...now}=s;assert.deepEqual(now,old);
  const before=JSON.stringify(s),a=G.buildModernist(s,lib.get()),b=generator.generate(s),ab=new T.Box3().setFromObject(a),bb=new T.Box3().setFromObject(b);
  assert.deepEqual(bb.min.toArray(),ab.min.toArray(),s.name);assert.deepEqual(bb.max.toArray(),ab.max.toArray(),s.name);assert.deepEqual(b.userData.massing,a.userData.volumes);assert.equal(JSON.stringify(s),before);assert.deepEqual(b.userData.spec,s);
 }
});
test('approved 07B geometry, detailing and material settings remain identical to its accepted checkpoint',async()=>{
 const [S,,T,F]=await modules,fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/family-phase3-approved07.json'))),s=S.createSpecification('1138',6),g=new F.EnhancedFamilyGenerator(library(T));assert.deepEqual(s,fixture.spec);assert.equal(signature(g.generate(s)),fixture.signature);
});
test('automatic A/B/C lobby choice supports podium and non-podium buildings without altering massing',async()=>{
 const [S,,T,F]=await modules,g=new F.EnhancedFamilyGenerator(library(T)),types=new Set;
 for(const s of S.benchmark('1138')){const b=g.generate(s),lobby=b.userData.audit.lobby;types.add(lobby.type);assert.equal(lobby.type,F.chooseLobby(s));assert.equal(lobby.type==='C',!!s.podium);assert.equal(lobby.interior,false);assert.equal(lobby.glazing,'opaque-reflective');assert.ok(!b.children.some(m=>['desk','wall','light'].includes(m.name)));for(const m of b.children.filter(m=>m.name.includes('Glass'))){assert.equal(m.material.transparent,false);assert.equal(m.material.opacity,1);}}
 assert.deepEqual([...types].sort(),['A','B','C']);assert.equal(F.chooseLobby({...S.createSpecification('1138',0),archetype:99,name:'Not an indexed preset',widthBays:8}),'A');
});
test('all ten facade grids, corners and mesh attributes remain finite, aligned and valid',async()=>{
 const [S,G,T,F]=await modules,lib=library(T),g=new F.EnhancedFamilyGenerator(lib);
 for(const s of S.benchmark('1138')){const a=G.buildModernist(s,lib.get()),b=g.generate(s);assert.equal(b.userData.audit.windows.length,a.userData.windows.length);for(const [i,w]of b.userData.audit.windows.entries())for(const k of ['floor','side','col','bottom','top'])assert.equal(w[k],a.userData.windows[i][k]);assert.equal(b.userData.audit.corners.length,S.tiers(s).length*4);
  for(const mesh of b.children){const g=mesh.geometry;assert.ok(mesh.material);for(const attr of Object.values(g.attributes))assert.ok(Array.from(attr.array).every(Number.isFinite));for(const id of g.index.array)assert.ok(id<g.attributes.position.count);for(let i=0;i<g.index.count;i+=3){const p=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(g.attributes.position,g.index.getX(i+j)));assert.ok(new T.Triangle(...p).getArea()>1e-10);}}
 }
});
test('all ten lobby head joints and entrances are opaque and closed on every elevation',async()=>{
 const [S,,T,F]=await modules,g=new F.EnhancedFamilyGenerator(library(T));
 for(const s of S.benchmark('1138')){const b=g.generate(s);b.updateMatrixWorld(true);for(const side of [0,1,2,3])for(const y of [s.lobbyHeight-.49,s.lobbyHeight-.45]){const horizontal=side%2===0,count=horizontal?(s.podium?.widthBays||s.widthBays):(s.podium?.depthBays||s.depthBays),offset=(horizontal?(s.podium?.depthBays||s.depthBays):(s.podium?.widthBays||s.widthBays))*s.bay/2,sign=side<2?1:-1;for(let col=0;col<count;col++){const t=(-count/2+col+.5)*s.bay,origin=horizontal?new T.Vector3(t,y,sign*(offset+2)):new T.Vector3(sign*(offset+2),y,t),direction=horizontal?new T.Vector3(0,0,-sign):new T.Vector3(-sign,0,0);assert.ok(new T.Raycaster(origin,direction,0,4).intersectObject(b,true).some(h=>!h.object.material.transparent),s.name+' head gap');}}const z=(s.podium?.depthBays||s.depthBays)*s.bay/2;assert.ok(new T.Raycaster(new T.Vector3(.4,1.6,z+2),new T.Vector3(0,0,-1),0,5).intersectObject(b,true).some(h=>h.object.name==='doorGlass'),s.name+' door');}
});
test('all ten roofs resolve coplanar trim intersections, including setback terraces and penthouses',async()=>{
 const [S,,T,F]=await modules,g=new F.EnhancedFamilyGenerator(library(T)),{roofConflicts}=require('./roof-overlap-test-helper.cjs');for(const s of S.benchmark('1138')){const conflicts=roofConflicts(g.generate(s));assert.equal(conflicts.length,0,s.name+': '+JSON.stringify(conflicts.slice(0,2)));}
});
test('family caches geometry, shares facade materials/reflections and bounds cache growth',async()=>{
 const [S,,T,F]=await modules,g=new F.EnhancedFamilyGenerator(library(T)),s=S.createSpecification('1138',6),a=g.generate(s),b=g.generate(s),neighbor=g.generate(S.createSpecification('1138',0)),before=signature(neighbor);assert.equal(a.children[0].geometry,b.children[0].geometry);assert.equal(a.children[0].material,neighbor.children[0].material);assert.equal(a.children.find(m=>m.name==='lobbyGlass').material.envMap,neighbor.children.find(m=>m.name==='lobbyGlass').material.envMap);g.release(a);g.release(b);for(let i=0;i<30;i++){const m=g.generate(S.createSpecification('cache-'+i,0));g.release(m);}assert.ok(g.cache.size<=24);assert.equal(signature(neighbor),before);
});
test('family reviews are bound to exact seed/revision and separate from approved 07B prototype reviews',async()=>{
 const [S,,,,P]=await modules,s=S.createSpecification('1138',6),data={version:'3.0.0',key:P.familyReviewKey(s),status:'needs-refinement',notes:'Review test'};assert.deepEqual(P.validateFamilyReview(JSON.parse(JSON.stringify(data)),s),data);assert.throws(()=>P.validateFamilyReview(data,S.createSpecification('1138',6,1)),/does not match/);assert.throws(()=>P.validateFamilyReview({...data,status:'publish'},s),/does not match/);assert.throws(()=>P.validateFamilyReview({...data,version:'2.1.1'},s),/does not match/);
});
