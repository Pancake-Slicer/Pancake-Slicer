const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),current=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
const original=fs.readFileSync(path.join(root,'original/Pancake (52).html'),'utf8').match(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/i)[1];
function load(source){const context=vm.createContext({console:{...console,warn(){}},performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){},createLinearGradient:()=>({addColorStop(){}})})})}});vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={WS,ZS,q,Te,Ee,ve,sn,di};',context);return context.api;}
const live=load(current),old=load(original);
function survey(a,model){
 model.updateMatrixWorld(true);const groups=new Map,wallTriangles=[];let valid=true;
 model.traverse(mesh=>{if(!mesh.isMesh||mesh.userData.celInk)return;const p=mesh.geometry.attributes.position,index=mesh.geometry.index;
  for(let face=0;face<(index?index.count:p.count);face+=3){const points=[0,1,2].map(k=>new a.q().fromBufferAttribute(p,index?index.getX(face+k):face+k).applyMatrix4(mesh.matrixWorld)),n=new a.q().subVectors(points[1],points[0]).cross(new a.q().subVectors(points[2],points[0]));
   if(points.some(p=>![p.x,p.y,p.z].every(Number.isFinite)))valid=false;
   const horizontal=n.y>.000001&&Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))<.00002;
   if(horizontal&&points[0].y>=180){const key=points[0].y.toFixed(4);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(a.Te(points));}
   else wallTriangles.push(points.map(p=>[p.x,p.y,p.z].map(v=>v.toFixed(4)).join(',')).join(';'));
  }
 });
 let overlap=0;const areas=new Map;for(const [height,triangles]of groups){areas.set(height,a.sn(a.ve(triangles.flat())));for(let i=0;i<triangles.length;i++)for(let j=0;j<i;j++)overlap+=a.sn(a.Ee(triangles[i],triangles[j]));}
 return {overlap,areas,wallTriangles:wallTriangles.sort(),valid};
}
for(const factory of ['WS','ZS'])test(factory+' landmark roof caps have one owner without changing exterior area or equipment',()=>{
 const before=old[factory](),after=live[factory](),a=survey(old,before),b=survey(live,after);
 assert.ok(a.overlap>(factory==='WS'?2000:.1),'Reproduce the pre-existing coincident roof faces');
 assert.ok(b.overlap<.001,'No overlapping upward caps remain above the crown');
 assert.equal(b.valid,true);assert.deepEqual([...b.areas.keys()].sort(),[...a.areas.keys()].sort());
 for(const [height,area]of a.areas)assert.ok(Math.abs(b.areas.get(height)-area)<.003,'Roof coverage changed at '+height);
 assert.deepEqual(b.wallTriangles,a.wallTriangles,'Keep every wall, antenna brace and non-roof triangle');
 assert.deepEqual(JSON.parse(JSON.stringify(after.userData.dimensions)),JSON.parse(JSON.stringify(before.userData.dimensions)));
 assert.ok(after.userData.roofRepair.removedArea>0);
});
