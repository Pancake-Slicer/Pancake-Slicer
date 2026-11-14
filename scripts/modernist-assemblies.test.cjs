const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.tools/modernist-lab'),ready=Promise.all(['spec.mjs','geometry.js','engine.js','assemblies/enhanced.js','assemblies/systems.mjs'].map(f=>import(pathToFileURL(path.join(out,f)).href)));
function materials(T){return Object.fromEntries(['glass','sideGlass','upperGlass','panel','side','frame','mullion','roof','equipment','dark'].map(k=>[k,new T.MeshStandardMaterial]));}
function signature(group){const h=crypto.createHash('sha256');group.traverse(m=>{if(m.geometry){h.update(m.name);for(const a of Object.values(m.geometry.attributes))h.update(Buffer.from(a.array.buffer));h.update(Buffer.from(m.geometry.index.array.buffer));h.update(JSON.stringify({color:m.material.color.toArray(),roughness:m.material.roughness,opacity:m.material.opacity}));}});return h.digest('hex');}
test('Building 07 seed, tiers, complete massing and decorated envelope are unchanged',async()=>{
 const [S,G,T,E]=await ready,s=S.createSpecification('1138',6),m=materials(T),a=G.buildModernist(s,m),before=signature(a),b=E.buildEnhanced(s,a,E.createAssemblyMaterials(m));assert.equal(s.storeys,35);assert.equal(s.floorHeight,3.75);assert.equal(s.lobbyHeight,5);assert.deepEqual(s.podium,{storeys:4,widthBays:24,depthBays:16});const ab=new T.Box3().setFromObject(a),bb=new T.Box3().setFromObject(b);assert.deepEqual(bb.min.toArray(),ab.min.toArray());assert.deepEqual(bb.max.toArray(),ab.max.toArray());assert.deepEqual(b.userData.massing,a.userData.volumes);assert.equal(signature(a),before,'07A geometry/materials must not be mutated');assert.deepEqual(b.userData.spec,s);
});
test('roof decks and vertical details retain exact source attributes; trimmed caps preserve source planes and UVs',async()=>{
 const [S,G,T,E]=await ready,s=S.createSpecification('1138',6),m=materials(T),a=G.buildModernist(s,m),b=E.buildEnhanced(s,a,E.createAssemblyMaterials(m)),levels=S.tiers(s);
 const vertex=(g,id)=>({p:new T.Vector3().fromBufferAttribute(g.attributes.position,id),n:new T.Vector3().fromBufferAttribute(g.attributes.normal,id),uv:new T.Vector2().fromBufferAttribute(g.attributes.uv,id)});
 const isCap=tri=>tri.every(v=>v.n.y>.99&&Math.abs(v.p.y-tri[0].p.y)<1e-6);
 const flatten=triangles=>triangles.flatMap(t=>t.flatMap(v=>[...v.p.toArray(),...v.n.toArray(),...v.uv.toArray()]));
 for(const original of a.children){
  const g=original.geometry,source=[];
  for(let i=0;i<g.index.count;i+=3){const ids=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];if(E.roofTriangle(original,ids,levels,s))source.push(ids.map(j=>vertex(g,j)));}
  const copy=b.children.find(m=>m.name==='retained-roof:'+original.name);if(!source.length){assert.equal(copy,undefined);continue;}assert.ok(copy);assert.equal(copy.material,original.material);
  const actual=[],c=copy.geometry;for(let i=0;i<c.index.count;i+=3)actual.push([0,1,2].map(j=>vertex(c,c.index.getX(i+j))));
  if(original.name==='roof'){assert.deepEqual(flatten(actual),flatten(source));continue;}
  assert.deepEqual(flatten(actual.filter(t=>!isCap(t))),flatten(source.filter(t=>!isCap(t))),'Only coincident top caps may change');
  const caps=source.filter(isCap);
  for(const tri of actual.filter(isCap)){
   assert.ok(caps.some(old=>tri.every(v=>{
    if(Math.abs(v.p.y-old[0].p.y)>1e-5)return false;
    const weights=T.Triangle.getBarycoord(v.p,...old.map(v=>v.p),new T.Vector3);if(!weights||Math.min(...weights.toArray())<-.0001)return false;
    const uv=new T.Vector2;old.forEach((v,i)=>uv.addScaledVector(v.uv,weights.getComponent(i)));return uv.distanceTo(v.uv)<.0001;
   })),'Trimmed cap must stay on a source triangle with unchanged UV interpolation');
  }
 }
});
test('enhanced floor, spandrel, bay and corner assemblies follow the original grid',async()=>{
 const [S,G,T,E]=await ready,s=S.createSpecification('1138',6),m=materials(T),a=G.buildModernist(s,m),b=E.buildEnhanced(s,a,E.createAssemblyMaterials(m));assert.equal(b.userData.audit.windows.length,a.userData.windows.length);for(let i=0;i<a.userData.windows.length;i++){const original=a.userData.windows[i],enhanced=b.userData.audit.windows[i];for(const key of ['floor','side','col','bottom','top'])assert.equal(enhanced[key],original[key]);}assert.equal(b.userData.audit.corners.length,S.tiers(s).length*4);
 for(const mesh of b.children){const g=mesh.geometry;assert.ok(mesh.material);for(const a of Object.values(g.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));for(const i of g.index.array)assert.ok(i<g.attributes.position.count);const n=g.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<.0001);}
});
test('optional clear recessed doors still reveal the interior when explicitly requested',async()=>{
 const [S,G,T,E]=await ready,s=S.createSpecification('1138',6),base=materials(T),m=E.createAssemblyMaterials(base,{lobbyGlazing:'clear-interior'}),a=G.buildModernist(s,base),b=E.buildEnhanced(s,a,m);assert.ok(m.lobbyGlass.opacity<.35&&m.doorGlass.opacity<.25);assert.ok(m.vision0.opacity>=.85);assert.equal(m.backing.transparent,false);assert.ok(b.userData.audit.lobby.doorPlane<s.podium.depthBays*s.bay/2-1);assert.ok(b.userData.audit.lobby.interiorRear<b.userData.audit.lobby.doorPlane-3);b.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(.5,1.6,40),new T.Vector3(0,0,-1)),hits=ray.intersectObject(b,true);assert.ok(hits.some(h=>h.object.name==='doorGlass'));assert.ok(hits.some(h=>h.object.name==='wall'));assert.ok(hits.find(h=>h.object.name==='wall').distance>hits.find(h=>h.object.name==='doorGlass').distance+3);
});

test('opaque reflective lobby omits hidden interiors and preserves every exterior frame and glazing plane',async()=>{
 const [S,G,T,E]=await ready,s=S.createSpecification('1138',6),base=materials(T),a=G.buildModernist(s,base),opaque=E.createAssemblyMaterials(base),clear=E.createAssemblyMaterials(base,{lobbyGlazing:'clear-interior'}),b=E.buildEnhanced(s,a,opaque),c=E.buildEnhanced(s,a,clear);
 for(const key of ['lobbyGlass','lobbyGlassAlt','doorGlass']){const m=opaque[key];assert.ok(m.isMeshStandardMaterial&&!m.isMeshPhysicalMaterial);assert.equal(m.transparent,false);assert.equal(m.opacity,1);assert.equal(m.depthWrite,true);assert.equal(m.envMap,opaque.lobbyGlass.envMap);assert.ok(m.roughness>.2&&m.roughness<.4);}
 for(const key of ['floor','ceiling','wall','desk','light'])assert.ok(!b.children.some(m=>m.name===key),'hidden interior '+key+' removed');
 // The clear variant batches its counter trim into aluminum: remove only the
 // trailing interior counter/fins before comparing the untouched exterior.
 const exteriorAluminum=b.children.find(m=>m.name==='aluminum').geometry.attributes.position.array,clearAluminum=c.children.find(m=>m.name==='aluminum').geometry.attributes.position.array;
 assert.deepEqual(exteriorAluminum,clearAluminum.slice(0,exteriorAluminum.length));
 for(const key of ['edge','threshold','spandrel','podiumSpandrel','backing','vision0','vision1','vision2'])assert.deepEqual(b.children.find(m=>m.name===key).geometry.attributes.position.array,c.children.find(m=>m.name===key).geometry.attributes.position.array);
 const panes=model=>model.children.filter(m=>['lobbyGlass','lobbyGlassAlt','doorGlass'].includes(m.name)).flatMap(m=>{const p=m.geometry.attributes.position;return Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)].join(','));}).sort();assert.deepEqual(panes(b),panes(c));
 assert.equal(b.userData.audit.lobby.interior,false);assert.equal(b.userData.audit.lobby.glazing,'opaque-reflective');assert.ok(E.modelMetrics(b).triangles<E.modelMetrics(c).triangles);
 assert.throws(()=>E.createAssemblyMaterials(base,{lobbyGlazing:'unknown'}),/Unknown lobby glazing/);
});
test('lobby compatibility and pane variation are reusable and deterministic',async()=>{
 const [S,,T,,A]=await ready,s=S.createSpecification('1138',6);assert.equal(A.lobbyProfile(s,'C').name,'Podium lobby');assert.throws(()=>A.lobbyProfile(S.createSpecification('1138',0),'C'),/podium/);assert.ok(A.lobbyProfile(S.createSpecification('1138',0),'A'));assert.ok(A.lobbyProfile(s,'B'));assert.deepEqual(A.paneModule(s,0,12,3),A.paneModule(s,0,12,3));const set=new Set;for(let f=1;f<15;f++)for(let c=0;c<18;c++){const p=A.paneModule(s,0,f,c);assert.ok(p.variant>=0&&p.variant<3&&p.atlasCol<4&&p.atlasRow<3);set.add(JSON.stringify(p));}assert.ok(set.size>12);
});
test('review import/export is version-bound and never changes a building specification',async()=>{
 const [S,,,,A]=await ready,s=S.createSpecification('1138',6),before=JSON.stringify(s),review=A.emptyReview(s);review.status='needs-refinement';review.notes='Architectural review';assert.deepEqual(A.validateReview(JSON.parse(JSON.stringify(review)),s),review);assert.throws(()=>A.validateReview({...review,status:'publish'},s),/Invalid/);assert.throws(()=>A.validateReview(review,S.createSpecification('another',6)),/another prototype/);assert.equal(JSON.stringify(s),before);
});
test('the assemblies also fit a synthetic different bay count and floor count without per-building code',async()=>{
 const [S,G,T,E]=await ready,original=S.createSpecification('1138',6),s={...original,id:'assembly-compatibility-fixture',storeys:30,widthBays:24,depthBays:14,podium:{storeys:4,widthBays:30,depthBays:18}},m=materials(T),a=G.buildModernist(s,m),b=E.buildEnhanced(s,a,E.createAssemblyMaterials(m)),ab=new T.Box3().setFromObject(a),bb=new T.Box3().setFromObject(b);assert.deepEqual(bb.min.toArray(),ab.min.toArray());assert.deepEqual(bb.max.toArray(),ab.max.toArray());assert.equal(b.userData.audit.windows.length,a.userData.windows.length);assert.ok(E.modelMetrics(b).meshes<=24);
});
test('the approved Phase 1 generator and material source files are unchanged from the checkpoint',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/assemblies-phase2-baseline.json')));for(const [file,expected]of Object.entries(baseline.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),expected,file);
});

test('all lobby head joints are closed across front, rear and side bays',async()=>{
 const [S,G,T,E]=await ready,s=S.createSpecification('1138',6),base=materials(T),a=G.buildModernist(s,base),b=E.buildEnhanced(s,a,E.createAssemblyMaterials(base));b.updateMatrixWorld(true);
 for(const side of [0,1,2,3])for(const y of [s.lobbyHeight-.54,s.lobbyHeight-.49,s.lobbyHeight-.45,s.lobbyHeight-.01]){
  const horizontal=side%2===0,count=horizontal?s.podium.widthBays:s.podium.depthBays,offset=(horizontal?s.podium.depthBays:s.podium.widthBays)*s.bay/2,sign=side<2?1:-1;
  for(let col=0;col<count;col++){const t=(-count/2+col+.5)*s.bay,origin=horizontal?new T.Vector3(t,y,sign*(offset+2)):new T.Vector3(sign*(offset+2),y,t),direction=horizontal?new T.Vector3(0,0,-sign):new T.Vector3(-sign,0,0),ray=new T.Raycaster(origin,direction,0,4);assert.ok(ray.intersectObject(b,true).some(h=>h.object.material.transparent===false),'Open lobby head joint: side '+side+' bay '+col+' y '+y);}
 }
});

test('retained roof decks, parapet caps and plant-screen rails have no overlapping coplanar top faces',async()=>{
 const [S,G,T,E]=await ready;
 for(const s of [S.createSpecification('1138',6),{...S.createSpecification('1138',6),id:'roof-different-dimensions',widthBays:24,depthBays:14,podium:{storeys:4,widthBays:30,depthBays:18}}]){
  const base=materials(T),a=G.buildModernist(s,base),b=E.buildEnhanced(s,a,E.createAssemblyMaterials(base)),conflicts=require('./roof-overlap-test-helper.cjs').roofConflicts(b);assert.equal(conflicts.length,0,JSON.stringify(conflicts.slice(0,3)));
 }
});
