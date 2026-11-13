// Runs only inside the generated demo, through the game's own terrain, roads,
// Office paint, rendering, history, picking and camera controls.
const pcDemoMap=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:480,tileSize:480});
ll.setMap(pcDemoMap);await Gt.setTerrain(pcDemoMap,_e);
const pcDemoLines=[];
for(const x of [-204,-68,68,204])pcDemoLines.push([{x,z:-204},{x,z:204}]);
for(const z of [-204,-68,68,204])pcDemoLines.push([{x:-204,z},{x:204,z}]);
const pcDemoRoads=_e.addBatch(pcDemoLines);if(!pcDemoRoads.ok)throw Error(pcDemoRoads.error);
Gt.drawRoads(_e);Vh.setPropertyZone('offices');
const pcDemoLots=Vh.properties.filter(p=>p.bounds.minX>-204&&p.bounds.maxX<204&&p.bounds.minZ>-204&&p.bounds.maxZ<204);
Vh.applyProperties(pcDemoLots,'offices');Gt.drawZoning();
const pcDemoLinds=Vh.buildings.filter(b=>b.office?.assetKey),pcDemoCounts=pcGrowableDefinitions.map(d=>({id:d.id,name:d.name,count:pcDemoLinds.filter(b=>b.office.assetKey===d.key).length}));
if(!pcDemoLinds.length)throw Error('Automatic growable fixture failed');
const pcDemoFocus=pcDemoLinds.find(b=>b.office.assetKey===pcGrowableDefinitions.reduce((a,b)=>a.dimensions.height<b.dimensions.height?a:b).key)||pcDemoLinds[0],pcDemoFront=pcDemoFocus.towardRoad,pcDemoSide=Math.sign(pcDemoFront.z*pcDemoFocus.x-pcDemoFront.x*pcDemoFocus.z)||1;
Gt.controls.enableDamping=false;Gt.controls.target.set(pcDemoFocus.x,pcDemoFocus.y+pcDemoFocus.height*.5,pcDemoFocus.z);
Gt.controls.object.position.set(pcDemoFocus.x+pcDemoFront.x*120+pcDemoFront.z*210*pcDemoSide,pcDemoFocus.y+150,pcDemoFocus.z+pcDemoFront.z*120-pcDemoFront.x*210*pcDemoSide);Gt.controls.update();Gt.controls.enableDamping=true;
Gn('hand');Ui();Ue(pcDemoCounts.map(d=>d.count+' '+d.name).join(' · ')+' among '+Vh.buildings.length+' Office buildings. Grown through normal zoning.',true);
window.__growableDemoReady={assetCounts:pcDemoCounts,buildingCount:Vh.buildings.length,focusId:pcDemoFocus.id};
