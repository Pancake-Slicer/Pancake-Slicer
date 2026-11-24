const fs=require('node:fs'),path=require('node:path');
function applyCitySimulation(source){
 const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Expected one city simulation patch: '+before.slice(0,90));source=source.replace(before,()=>after);};
 const helpers=['city-simulation.js','city-services.js','city-simulation-ui.js'].map(file=>fs.readFileSync(path.join(__dirname,'../web/features',file),'utf8')).join('\n');
 replace('const vi=Object.freeze(',helpers+'\nconst vi=Object.freeze(');
 replace('Bd=Object.freeze([$n,cs])','Bd=Object.freeze([$n,cs,...pcCivicTypes])');
 replace('i.set(y,y===cs.id?WS():ZS())','i.set(y,pcCivicModel(y)||(y===cs.id?WS():ZS()))');
 replace('ut=u[at],tt=J.y','ut=J.pcSimAbandoned?pcSimVacantMaterial(u[at]):u[at],tt=J.y');
 replace('Traffic, budgets and saving come later. Refreshing starts a fresh terrain.', 'City hall adds population, jobs, utilities, services and a monthly budget. Full-city saving is not available yet; refreshing starts a fresh terrain.');
 replace("  return [...homes, ...pcOfficeParcels(offices,collection)].filter(building => !collection.suppressed.has(building.id));","  return pcSimulationBuildings(collection,[...homes, ...pcOfficeParcels(offices,collection)].filter(building => !collection.suppressed.has(building.id)));");
 replace("function pcRenderOffice(building, addGeometry, addBox, statistics) { if(pcSC4Render(building,addGeometry,addBox,statistics))return;return pcDetailedOfficeRender(building, addGeometry, addBox, statistics); }","function pcRenderOffice(building, addGeometry, addBox, statistics) { if(building.pcSimAbandoned){const geometry=addGeometry,box=addBox;addGeometry=(g,m,id)=>geometry(g,pcSimVacantMaterial(m),id);addBox=(p,w,h,d,yaw,m,id)=>box(p,w,h,d,yaw,pcSimVacantMaterial(m),id);}if(pcSC4Render(building,addGeometry,addBox,statistics))return;return pcDetailedOfficeRender(building, addGeometry, addBox, statistics); }");
 const startup=`\nconst pcTerrainSetup=document.querySelector('#terrain-setup');
if(pcTerrainSetup)pcAttachCitySimulation(_e,ms,Vh,Gt,{ready:()=>!!_e.terrain&&!pcTerrainSetup.open,selectService:id=>{ia=id;const picker=document.querySelector('#landmark-type');picker.value=id;picker.dispatchEvent(new Event('change'));Gn('landmark')},onMessage:message=>Ue(message,true)});\n`;
 source+=startup;return source;
}
module.exports={applyCitySimulation};
