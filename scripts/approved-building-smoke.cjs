const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function smoke(file,overrides){
 let source=fs.readFileSync(file,'utf8');if(overrides)source=source.replace(/const pcGrowableDefinitions=.*?;\n/,()=> 'const pcGrowableDefinitions='+JSON.stringify(overrides)+';\n');
 const context=vm.createContext({console,performance,structuredClone,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
 vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.api={pcGrowableDefinitions,pcGrowablePlacement,pcGrowableResource,pcFlushGrowables,Se,sn,Te,je};',context);const a=context.api,results=[];
 for(const d of a.pcGrowableDefinitions){
  const side=Math.max(60,d.eligibility.minLotWidth+2,d.eligibility.minLotDepth+2,Math.sqrt(d.eligibility.minLotArea)+2),property={id:'smoke:'+d.key,zone:'offices',area:side*side,officeProfile:{maxFloors:80},x:0,z:0,y:8,ground:8,rotation:0,towardRoad:{x:0,z:1},entrance:{x:0,z:side/2},footprint:[{x:-side/2,z:-side/2},{x:side/2,z:-side/2},{x:side/2,z:side/2},{x:-side/2,z:side/2}]};
  const buildings=[];for(const angle of [0,.37,Math.PI/2]){const point=p=>({x:p.x*Math.cos(angle)+p.z*Math.sin(angle),z:-p.x*Math.sin(angle)+p.z*Math.cos(angle)}),p={...property,rotation:angle,footprint:property.footprint.map(point),towardRoad:point(property.towardRoad),entrance:point(property.entrance)},fit=a.pcGrowablePlacement(p,d);assert.ok(fit,'Cannot place '+d.key);assert.equal(fit.scale,1);assert.ok(a.sn(a.je(a.Te(fit.footprint),a.Te(p.footprint)))<.001);buildings.push({...p,id:'smoke:'+d.key+':'+angle,office:{assetKey:d.key,assetPlacement:fit}});}
  const resource=a.pcGrowableResource(d),group=new a.Se;a.pcFlushGrowables(new Map([[d.key,{asset:d,buildings}]]),group);assert.equal(group.children.length,resource.parts.length);
  for(const mesh of group.children){assert.equal(mesh.count,3);assert.equal(mesh.material.transparent,false);assert.ok(resource.parts.some(p=>p.geometry===mesh.geometry&&p.material===mesh.material));assert.ok(mesh.userData.buildingIds.every(id=>buildings.some(b=>b.id===id)));assert.ok(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));}
  results.push({key:d.key,placements:3,sharedRenderBatches:group.children.length,status:'passed'});
 }
 return results;
}
if(require.main===module)console.log(JSON.stringify(smoke(process.argv[2]||'web/assets/game.bundle.js'),null,2));
module.exports={smoke};
