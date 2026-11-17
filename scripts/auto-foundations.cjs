const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function applyAutoFoundations(source){
 const replace=(a,b)=>{assert.equal(source.split(a).length,2,'Auto foundation boundary changed: '+a.slice(0,90));source=source.replace(a,()=>b);};
 replace('const pcGrowableDefinitions=',fs.readFileSync(path.join(__dirname,'../web/features/auto-foundations.js'),'utf8')+'\nconst pcGrowableDefinitions=');
 replace('function C(R){S=R.buildings;','function C(R){S=R.buildings.map(b=>pcAutoRenderBuilding(b,R.network?.terrain));');
 replace('for(const J of R){if(pcQueueGrowable(J,pcAssetInstances,B,F))','for(const J of R){pcOfficePave(J,B);if(pcQueueGrowable(J,pcAssetInstances,B,F))');
 replace('B(Ql(J.footprint,J.ground-.18,tt-J.ground+.18,{top:false}),f,J.id),','pcAutoFacadeFoundation(J,B,{stone:ut,trim:ut}),');
 const legacy="if(!pcFacadeRecord(building))B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18),pcRebuiltSolid('foundation','#9a9a8d',.97),building.id);";
 assert.equal(source.split(legacy).length,3);source=source.replaceAll(legacy,"if(!pcAutoFacadeFoundation(building,B))B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18),pcRebuiltSolid('foundation','#9a9a8d',.97),building.id);");
 replace("const foundation=pcRebuiltSolid('foundation','#9a9a8d',.97);\n B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18,{top:false}),foundation,id);\n addCap(je(Te(building.footprint),paths(bands[0].parts)),building.y,foundation);","pcAutoFacadeFoundation(building,B,materials);");
 replace('B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18,{top:!!catalogue}),catalogue?material.roof:material.stone,id);','pcAutoFacadeFoundation(building,B,material);');
 replace('const Lt=Math.min(7,Math.max(2,Math.ceil((tt-St.y)/.22)+2));for(let st=0;st<Lt;st++){const it=(st+1)*.25;U({x:St.x+Pt.x*it,y:tt-.1-st*.16,z:St.z+Pt.z*it},1.7,.23,.33,xt,f,J.id)}','');
 return source;
}
module.exports={applyAutoFoundations};
