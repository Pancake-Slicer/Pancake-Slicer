const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const sandbox={console,performance,structuredClone,window:{addEventListener(){}},Image:function(){throw Error('Rebuilt buildings must not load image assets');},document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}};
Object.defineProperty(sandbox,'pcSC4Originals',{get(){throw Error('Imported asset dependency must not return');}});
const context=vm.createContext(sandbox);
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={pcRebuiltDesigns,pcSC4Model,pcSC4Fits,pcRebuiltRender,pcRebuiltMaterials,pcRebuiltCap,pcRebuiltRoofMesh,pcRebuiltSupportedBands,pcRebuiltTransform,Te,je,sn,cS,Se,pS,zb,qb};',context);
const api=context.api,entries=api.pcRebuiltDesigns.entries;
function fixture(d){return {id:'rebuilt:'+d.id,signature:'rebuilt:'+d.id,zone:'offices',office:{catalogueId:d.id,style:d.style},x:100,z:200,y:5,ground:4.43,rotation:0,frontage:76,depth:76,height:d.height,floors:d.floors,towardRoad:{x:0,z:-1},entrance:{x:100,z:162,y:5},footprint:[{x:62,z:162},{x:138,z:162},{x:138,z:238},{x:62,z:238}]};}
function collect(d){const building=fixture(d),geometries=[],boxes=[];assert.equal(api.pcRebuiltRender(building,(geometry,material,id)=>{assert.equal(id,building.id);geometries.push({geometry,material});},(point,w,h,depth,yaw,material,id)=>{assert.equal(id,building.id);assert.ok([point.x,point.y,point.z,w,h,depth,yaw].every(Number.isFinite));boxes.push({point,w,h,depth,material});},{windows:0}),true);return {building,geometries,boxes};}
function rayHit(geometries,origin,direction){
 for(const {geometry} of geometries){const p=geometry.attributes.position.array;for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],ab=[p[i+3]-a[0],p[i+4]-a[1],p[i+5]-a[2]],ac=[p[i+6]-a[0],p[i+7]-a[1],p[i+8]-a[2]],n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],dot=(x,y)=>x.reduce((s,v,j)=>s+v*y[j],0),den=dot(n,direction);if(den>=-1e-8)continue;const t=dot(n,a.map((v,k)=>v-origin[k]))/den;if(t<0)continue;const v=origin.map((x,k)=>x+direction[k]*t-a[k]),aa=dot(ab,ab),bb=dot(ac,ac),cc=dot(ab,ac),det=aa*bb-cc*cc;if(det<1e-12)continue;const u=(dot(v,ab)*bb-dot(v,ac)*cc)/det,w=(dot(v,ac)*aa-dot(v,ab)*cc)/det;if(u>=-1e-5&&w>=-1e-5&&u+w<=1.00001)return true;}}
 return false;
}
test('all 98 recipes contain authored solid plans and no imported raster/triangle/UV payload',()=>{
 assert.equal(entries.length,98);assert.equal(new Set(entries.map(e=>e.id)).size,98);
 const text=fs.readFileSync(path.join(__dirname,'../reference/sc4-rebuilt-designs.json'),'utf8');assert.ok(!/"(?:png|positions|uv|variants)"/.test(text));
 for(const d of entries){assert.ok(d.height>0&&d.floors>=1&&d.floors<=80);assert.ok(Math.abs(d.bodyHeight+d.roofHeight-d.height)<.02);assert.equal(d.bands[0].y,0);assert.ok(Math.abs(d.bands.at(-1).top-d.bodyHeight)<.02);for(let i=0;i<d.bands.length;i++){const b=d.bands[i];assert.ok(b.top>b.y);if(i)assert.equal(b.y,d.bands[i-1].top);for(const ring of b.parts)assert.ok(api.sn(api.Te(ring.map(([x,z])=>({x,z}))))>1);}}
});
test('facades are opaque scene-lit materials drawn locally, with relief and roughness maps',()=>{
 for(const d of entries){const m=api.pcRebuiltMaterials(d);assert.equal(m,api.pcRebuiltMaterials(d));assert.equal(m.facade.isMeshStandardMaterial,true);assert.equal(m.facade.transparent,false);assert.equal(m.facade.alphaTest,0);assert.equal(m.facade.toneMapped,true);assert.equal(m.facade.side,0);assert.ok(m.facade.map&&m.facade.bumpMap&&m.facade.roughnessMap);assert.equal(m.facade.map.image.width,256);assert.equal(m.facade.map.image.height,512);const shader={fragmentShader:'#include <lights_fragment_end>'};m.facade.onBeforeCompile(shader);assert.ok(shader.fragmentShader.includes('reflectedLight.directDiffuse'));assert.ok(!shader.fragmentShader.includes('emissive'));}
});
test('all rebuilt buildings have finite geometry and textured faces have non-collapsed UVs',()=>{
 for(const d of entries){const {geometries}=collect(d);for(const {geometry,material} of geometries){const p=geometry.attributes.position,n=geometry.attributes.normal,u=geometry.attributes.uv;assert.equal(p.count%3,0);for(const value of p.array)assert.ok(Number.isFinite(value),d.name);for(const value of n.array)assert.ok(Number.isFinite(value),d.name);if(material.map)for(let f=0;f<p.count;f+=3){const a=[p.getX(f+1)-p.getX(f),p.getY(f+1)-p.getY(f),p.getZ(f+1)-p.getZ(f)],b=[p.getX(f+2)-p.getX(f),p.getY(f+2)-p.getY(f),p.getZ(f+2)-p.getZ(f)],area=Math.hypot(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);if(area<1e-5)continue;const uvArea=Math.abs((u.getX(f+1)-u.getX(f))*(u.getY(f+2)-u.getY(f))-(u.getY(f+1)-u.getY(f))*(u.getX(f+2)-u.getX(f)));assert.ok(uvArea>1e-12,d.name+' has a collapsed texture face');}geometry.dispose();}}
});
test('rebuilt walls face outward and enclose volume from all eight camera headings',()=>{
 for(const d of entries){const result=collect(d),band=api.pcRebuiltSupportedBands(d)[Math.floor(d.bands.length/2)],transform=api.pcRebuiltTransform(result.building,d),ring=band.plans[0].outer.map(p=>transform.point([p.x,p.z])),centre=api.cS(ring),y=5+(band.y+band.top)/2;assert.ok(centre,d.name);
  for(let heading=0;heading<8;heading++){const x=Math.cos(heading*Math.PI/4),z=Math.sin(heading*Math.PI/4);assert.ok(rayHit(result.geometries,[centre.x+x*200,y,centre.z+z*200],[-x,0,-z]),d.name+' is missing an outward-facing wall');}
  const top=api.pcRebuiltSupportedBands(d).at(-1),target=api.cS(top.plans[0].outer.map(p=>transform.point([p.x,p.z])));assert.ok(rayHit(result.geometries,[target.x,d.height+100,target.z],[0,-1,0]),d.name+' is missing a roof');for(const g of result.geometries)g.geometry.dispose();
 }
});
test('terrace caps exclude upper volumes instead of stacking coplanar internal faces',()=>{
 const outer=[{x:0,z:0},{x:40,z:0},{x:40,z:40},{x:0,z:40}],inner=[{x:10,z:10},{x:30,z:10},{x:30,z:30},{x:10,z:30}],paths=api.je(api.Te(outer),api.Te(inner)),geometry=api.pcRebuiltCap(paths,20);let area=0;const p=geometry.attributes.position;for(let i=0;i<p.count;i+=3)area+=Math.abs((p.getX(i+1)-p.getX(i))*(p.getZ(i+2)-p.getZ(i))-(p.getZ(i+1)-p.getZ(i))*(p.getX(i+2)-p.getX(i)))/2;assert.ok(Math.abs(area-1200)<.01);geometry.dispose();
});
test('barrel and gable roofs meet all four base corners even with an off-centre interior point',()=>{
 const ring=[{x:-28,z:-18},{x:28,z:-18},{x:28,z:18},{x:-28,z:18}];
 for(const kind of ['barrel-green','gable-dark']){const g=api.pcRebuiltRoofMesh(ring,100,10,kind,{x:8,z:0}),p=g.attributes.position;for(const corner of ring){let found=false;for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i)-corner.x)<.001&&Math.abs(p.getZ(i)-corner.z)<.001&&Math.abs(p.getY(i)-100)<.001)found=true;assert.ok(found,kind);}for(let i=0;i<p.count;i++){assert.ok(p.getX(i)>=-28.001&&p.getX(i)<=28.001);assert.ok(p.getZ(i)>=-18.001&&p.getZ(i)<=18.001);}g.dispose();}
});
test('camera motion retains the same actual neighborhood meshes and picking IDs',()=>{
 const d=api.pcSC4Model(413),building=fixture(d),scene=new api.Se,renderer=api.pS(scene);assert.equal(renderer.render({buildings:[building]}),true);const before=[];scene.traverse(o=>{if(o.geometry)before.push(o);for(const range of o.userData.buildingRanges||[])assert.equal(range.id,building.id);assert.ok(!o.material?.userData.pcSC4);});
 for(let i=0;i<8;i++)renderer.updateLOD({position:{x:100+Math.cos(i)*300,y:250,z:200+Math.sin(i)*300}});
 const after=[];scene.traverse(o=>{if(o.geometry)after.push(o);});assert.deepEqual(after,before);assert.equal(renderer.render({buildings:[building]}),false);
});
test('native placement, demolition and undo/redo retain rebuild identity without source assets',()=>{
 const network=new api.zb,points=[{x:-100,z:-60},{x:100,z:-60},{x:100,z:60},{x:-100,z:60}];network.addBatch(points.map((p,i)=>[p,points[(i+1)%4]]));const zoning=new api.qb(network,{items:[]});zoning.setPropertyZone('offices');zoning.pcCatalogueChoice=424;const site=zoning.properties.find(p=>api.pcSC4Fits(p,api.pcSC4Model(424)));assert.ok(site);zoning.fillProperty(site.id,'offices');const count=zoning.buildings.length,b=zoning.buildings[0];assert.equal(b.height,326);assert.equal(zoning.demolish(b.id),true);assert.equal(network.undo(),true);zoning.rebuild();assert.equal(zoning.buildings[0].signature,b.signature);assert.equal(network.redo(),true);zoning.rebuild();assert.equal(zoning.buildings.length,count-1);
});

test('glass roof shells touch their supporting roof and portal lintels meet their posts',()=>{
 for(const d of entries.filter(d=>['glass-pyramid','glasshouse','skylights','solar'].includes(d.roof))){
  const {building,geometries}=collect(d),glass=api.pcRebuiltMaterials(d).glass;
  const shells=geometries.filter(g=>g.material===glass);assert.ok(shells.length,d.name);
  for(const {geometry} of shells){geometry.computeBoundingBox();assert.ok(Math.abs(geometry.boundingBox.min.y-building.y-d.bodyHeight)<.001,d.name+' skylight floats above roof');}
  for(const {geometry} of geometries)geometry.dispose();
 }
 for(const d of entries.filter(d=>['portal','notch'].includes(d.roof))){
  const {geometries}=collect(d),[left,right,beam]=geometries.slice(-3).map(({geometry})=>{geometry.computeBoundingBox();return geometry.boundingBox;});
  assert.ok(left.max.y>=beam.min.y-.001&&right.max.y>=beam.min.y-.001,d.name+' roof beam floats above posts');
  for(const {geometry} of geometries)geometry.dispose();
 }
});
