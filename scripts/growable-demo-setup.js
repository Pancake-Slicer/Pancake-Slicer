// Runs only inside the generated demo, through the game's own terrain, roads,
// Office paint, rendering, history, picking and camera controls.
const pcDemoMap=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:480,tileSize:480});
ll.setMap(pcDemoMap);await Gt.setTerrain(pcDemoMap,_e);
const pcDemoLines=[];
for(const x of [-180,-60,60,180])pcDemoLines.push([{x,z:-180},{x,z:180}]);
for(const z of [-180,-60,60,180])pcDemoLines.push([{x:-180,z},{x:180,z}]);
const pcDemoRoads=_e.addBatch(pcDemoLines);if(!pcDemoRoads.ok)throw Error(pcDemoRoads.error);
Gt.drawRoads(_e);Vh.setPropertyZone('offices');
const pcDemoLots=Vh.properties.filter(p=>p.bounds.minX>-180&&p.bounds.maxX<180&&p.bounds.minZ>-180&&p.bounds.maxZ<180);
Vh.applyProperties(pcDemoLots,'offices');Gt.drawZoning();
const pcDemoLinds=Vh.buildings.filter(b=>b.office?.assetKey);
if(!pcDemoLinds.length)throw Error('Automatic growable fixture failed');
const pcDemoFocus=pcDemoLinds[0],pcDemoFront=pcDemoFocus.towardRoad;
Gt.controls.enableDamping=false;Gt.controls.target.set(pcDemoFocus.x,pcDemoFocus.y+80,pcDemoFocus.z);
Gt.controls.object.position.set(pcDemoFocus.x+pcDemoFront.x*340+pcDemoFront.z*240,pcDemoFocus.y+240,pcDemoFocus.z+pcDemoFront.z*340-pcDemoFront.x*240);Gt.controls.update();Gt.controls.enableDamping=true;
Gn('hand');Ui();Ue(pcDemoLinds.length+' Lind Art Deco growables developed automatically among '+Vh.buildings.length+' Office buildings. Select Zoning to inspect or demolish buildings.',true);
window.__growableDemoReady={lindCount:pcDemoLinds.length,buildingCount:Vh.buildings.length,focusId:pcDemoFocus.id};
