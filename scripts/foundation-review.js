// Disposable in-game foundation inspection. No production terrain or road edits.
const foundationMode=new URLSearchParams(location.search).has('foundation-slope')?'sloped':'flat',foundationControls=document.createElement('div');
foundationControls.innerHTML='<hr><p>Facade foundations · '+foundationMode+' lots</p><button id="foundation-flat">Flat lots</button><button id="foundation-slope">Sloped lots</button><button id="foundation-lind">Lind entrance</button><button id="foundation-bmo">BMO entrance</button><button id="foundation-von">Von Badel entrance</button><button id="foundation-corner">Building corner</button><button id="foundation-measure">Measure mixed city</button>';
vonReviewPanel.insertBefore(foundationControls,vonReviewPanel.querySelector('#von-review-status'));
function foundationReport(){
 const models=[...pcBmoBatches,...pcLindBatches,...pcVonBatches].flatMap(batch=>batch.models),audits=models.map(m=>m.userData.facadeFoundation).filter(Boolean);
 const byFamily={};for(const audit of audits){const entry=byFamily[audit.family]||(byFamily[audit.family]={buildings:0,triangles:0,maxSteps:0,maxTerrainSpread:0,minBase:Infinity,maxBase:-Infinity});entry.buildings++;entry.triangles+=audit.triangles;entry.maxSteps=Math.max(entry.maxSteps,audit.steps);entry.maxTerrainSpread=Math.max(entry.maxTerrainSpread,audit.terrainMax-audit.terrainMin);entry.minBase=Math.min(entry.minBase,audit.base);entry.maxBase=Math.max(entry.maxBase,audit.base);}
 vonReviewReport.foundations={mode:foundationMode,byFamily,pooledMaterials:{bmo:pcBmoInfo().materials,lind:pcLindInfo().materials,von:pcVonInfo().materials},renderer:Gt.performanceInfo()};
 return vonReviewReport.foundations;
}
let foundationSelected=null;
function foundationFocus(field){
 const list=Vh.buildings.filter(b=>b.office[field]);list.sort((a,b)=>Number(!!b.office[field].parameters.podium)-Number(!!a.office[field].parameters.podium)||(b.x+b.z)-(a.x+a.z));
 const b=list[0];if(!b)return;foundationSelected=b;const e=b.entrance,p=b.office.assetPlacement,c=Gt.controls,front={x:Math.sin(p.angle),z:Math.cos(p.angle)},side={x:Math.cos(p.angle),z:-Math.sin(p.angle)};
 c.enableDamping=false;c.target.set(e.x,b.y+1.8,e.z);c.object.position.set(e.x+front.x*23+side.x*10,b.y+7.5,e.z+front.z*23+side.z*10);c.update();c.enableDamping=true;foundationReport();vonReviewOutput('Inspecting '+field+' on '+foundationMode+' terrain. Grey lot platforms removed; road/sidewalk geometry unchanged.');
}
foundationControls.querySelector('#foundation-flat').onclick=()=>{const url=new URL(location.href);url.searchParams.delete('foundation-slope');location.href=url.href;};
foundationControls.querySelector('#foundation-slope').onclick=()=>{const url=new URL(location.href);url.searchParams.set('foundation-slope','1');location.href=url.href;};
for(const [id,field]of [['lind','lightweightLind'],['bmo','lightweightBmo'],['von','lightweightVon']])foundationControls.querySelector('#foundation-'+id).onclick=()=>foundationFocus(field);
foundationControls.querySelector('#foundation-corner').onclick=()=>{const b=foundationSelected;if(!b)return;const p=b.office.assetPlacement,record=pcFacadeRecord(b),s=record.parameters,part=[...pcFacadeSites.get(b).parts].sort((a,b)=>(b.z+b.depth/2)-(a.z+a.depth/2)||b.x-a.x)[0],w=part.x+part.width/2,d=part.z+part.depth/2,cos=Math.cos(p.angle),sin=Math.sin(p.angle),x=p.x+w*cos+d*sin,z=p.z-w*sin+d*cos,c=Gt.controls;c.enableDamping=false;c.target.set(x,b.y+1.2,z);c.object.position.set(x-cos*10+sin*22,b.y+7,z+sin*10+cos*22);c.update();c.enableDamping=true;};
foundationControls.querySelector('#foundation-measure').onclick=()=>vonReviewTask(async()=>{const result=await vonReviewFrames();foundationReport();vonReviewReport.foundations.frameSample=result;vonReviewOutput('Measured the actual mixed city; frame intervals include scheduling and postprocessing.');Ui();});
foundationReport();vonReviewOutput('Foundation test city ready ('+foundationMode+'). Use the entrance and corner buttons to inspect terrain contact.');foundationFocus('lightweightLind');
