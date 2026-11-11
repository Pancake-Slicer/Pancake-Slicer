const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../web/assets/game.bundle.js'),'utf8');
const context=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={zb,qb,pcOfficePlots,pcRebuiltDesigns,pcRebuiltRender,pcRebuiltSupportedBands,pcRebuiltTransform,Te,ve,je,Ee,sn,Bo,Yb,Od,xn,Gi};',context);
const a=context.api;
function network(angle=0,points=[[-100,-60],[100,-60],[100,60],[-100,60]]){
 const n=new a.zb,p=points.map(([x,z])=>({x:x*Math.cos(angle)-z*Math.sin(angle),z:x*Math.sin(angle)+z*Math.cos(angle)}));
 n.addBatch(p.map((point,i)=>[point,p[(i+1)%p.length]]));return n;
}
test('axis-aligned, rotated, and concave street blocks are completely covered with no overlapping lots',()=>{
 for(const n of [network(),network(.39),network(.11,[[-120,-80],[120,-80],[120,80],[0,80],[0,20],[-120,20]])]){
  const plots=a.pcOfficePlots(n),land=a.je(a.Od(n),a.Bo(a.Yb(n).paths,-1.5)),tile=a.Gi(n);
  const blocks=a.xn(land).filter(p=>!p.outer.some(v=>v.x<=tile.minX+.01||v.x>=tile.maxX-.01||v.z<=tile.minZ+.01||v.z>=tile.maxZ-.01));
  assert.ok(blocks.length);
  const occupied=a.ve(plots.flatMap(p=>a.Te(p.footprint)));
  for(const block of blocks){const expected=a.je(a.Te(block.outer),a.ve(block.holes.flatMap(a.Te)));assert.ok(a.sn(a.je(expected,occupied))<.01,'Every buildable square metre must be occupied');}
  for(let i=0;i<plots.length;i++)for(let j=0;j<i;j++)assert.ok(a.sn(a.Ee(a.Te(plots[i].footprint),a.Te(plots[j].footprint)))<.01,'Lots must not overlap');
 }
});
test('block bucket fill, partial brush, individual repaint and demolition retain separate history',()=>{
 const n=network(),z=new a.qb(n,{items:[]});z.setPropertyZone('offices');const site=z.properties[0],block=z.properties.filter(p=>p.blockId===site.blockId);
 z.applyProperties([site],'offices');assert.equal(z.buildings.length,1);
 z.fillProperty(site.id,'offices');assert.equal(z.buildings.length,block.length);
 n.undo();z.rebuild();assert.equal(z.buildings.length,1);n.redo();z.rebuild();assert.equal(z.buildings.length,block.length);
 const before=new Map(z.buildings.map(b=>[b.id,b.office.catalogueId]));
 z.pcCatalogueChoice=424;z.applyProperties([site],'offices');
 for(const b of z.buildings)assert.equal(b.office.catalogueId,b.propertyIds.includes(site.id)?424:before.get(b.id));
 z.demolish(z.buildings.find(b=>b.propertyIds.includes(site.id)).id);assert.equal(z.buildings.length,block.length-1);
 n.undo();z.rebuild();assert.equal(z.buildings.length,block.length);
});
test('all 98 designs have continuous supporting floor plates beneath every upper volume',()=>{
 for(const d of a.pcRebuiltDesigns.entries){const bands=a.pcRebuiltSupportedBands(d),shape=band=>a.ve(band.plans.flatMap(p=>a.je(a.Te(p.outer),a.ve(p.holes.flatMap(a.Te)))));
  for(let i=1;i<bands.length;i++){assert.equal(bands[i].y,bands[i-1].top);assert.ok(a.sn(a.je(shape(bands[i]),shape(bands[i-1])))<.001,d.name+' has an unsupported offset');}
 }
});
test('all designs occupy the full lot with textured ground-floor walls, and their shafts fit inside it',()=>{
 const n=network(.31),lots=a.pcOfficePlots(n),lot=lots[0];
 for(const d of a.pcRebuiltDesigns.entries){
  const b={...lot,id:'test:'+d.id,office:{catalogueId:d.id},height:d.height},walls=[];
  a.pcRebuiltRender(b,(g,m)=>{if(m.userData.pcRebuiltFacade)walls.push(g);},()=>{}, {windows:0});
  const first=walls[0],p=first.attributes.position;
  for(const corner of lot.footprint){let found=false;for(let i=0;i<p.count;i++)if(Math.hypot(p.getX(i)-corner.x,p.getZ(i)-corner.z)<.001&&Math.abs(p.getY(i)-b.y)<.001)found=true;assert.ok(found,d.name+' leaves an unbuilt lot edge');}
  assert.ok(Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i)))-b.y>=Math.min(d.bodyHeight,d.floorHeight*2)-.001);
  const transform=a.pcRebuiltTransform(b,d),bands=a.pcRebuiltSupportedBands(d);
  for(const band of bands)for(const plan of band.plans){const ring=plan.outer.map(v=>transform.point([v.x,v.z]));assert.ok(a.sn(a.je(a.Te(ring),a.Te(lot.footprint)))<.01,d.name+' extends outside its lot');}
  for(const g of walls)g.dispose();
 }
});
