const fs=require('node:fs'),path=require('node:path');
function applyLandmarkPerformance(source){
  const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Expected one landmark patch: '+before.slice(0,100));source=source.replace(before,()=>after);};
  replace('const vi=Object.freeze(',fs.readFileSync(path.join(__dirname,'../web/features/landmark-performance.js'),'utf8')+'\nconst vi=Object.freeze(');
  replace('restore:e=>{this.items=e??[],this.syncFoundations()}', 'restore:e=>{pcRestoreLandmarkLayout(t);this.items=e??[],this.syncFoundations()}');
  replace('const e=this.foundation(t);return e?.error?e.error:', 'const occupied=pcLandmarkDevelopmentError(this.network,t);if(occupied)return occupied;const e=this.foundation(t);return e?.error?e.error:');
  replace('const i=this.foundation(t);this.network.remember();let s=[];', 'const i=this.foundation(t);pcBeginLandmarkEdit(this.network);this.network.remember();let s=[];');
  replace('&&!o.some(c=>Ah(l,c,8))),s.length', '&&!o.some(c=>Ah(l,c,8))&&!pcLandmarkTerrainBlocked(this.network,l)),s.length');
  replace('this.syncFoundations(),{ok:!0,item:r,', 'this.syncFoundations(),pcFinishLandmarkEdit(this.network),{ok:!0,item:r,');
  replace('remove(t){return this.items.some(e=>e.id===t)?(this.network.remember(),this.items=', 'remove(t){return this.items.some(e=>e.id===t)?(pcBeginLandmarkEdit(this.network),this.network.remember(),this.items=');
  replace('this.items=this.items.filter(e=>e.id!==t),this.syncFoundations(),!0)', 'this.items=this.items.filter(e=>e.id!==t),this.syncFoundations(),pcFinishLandmarkEdit(this.network),!0)');
  replace('if(!["straight","curve","grid"].includes(se)){Sn(n);return}', 'if(!["straight","curve","grid","landmark"].includes(se)){Sn(n);return}');
  replace('Gt.acceptProtectedTerrainEdit(),Gt.drawRoads(_e)),Gt.drawLandmarks', 'Gt.acceptProtectedTerrainEdit()),Gt.drawLandmarks');
  replace('function qS(n,{groundHeight:t=()=>0}={}){const e=new Se;e.name="Placed landmarks",n.add(e);const i=new Map,s=new Map,r=new Map;', 'function qS(n,{groundHeight:t=()=>0}={}){const e=new Se;e.name="Placed landmarks",n.add(e);const i=new Map,s=new Map,r=new Map;const pcBounds=new Map;');
  replace('shadowBounds:()=>[...r.values()].map(y=>new di().setFromObject(y))', 'shadowBounds:()=>pcLandmarkShadowBounds(r,pcBounds)');
  replace('model:{...o($n.id).userData.dimensions}', 'model:{...(i.get($n.id)?.userData.dimensions??{height:$n.height,roofHeight:$n.height,totalHeight:$n.height+$n.antennaHeight,width:$n.towerWidth,depth:$n.towerDepth,floors:$n.floors})}');
  return source;
}
module.exports={applyLandmarkPerformance};
