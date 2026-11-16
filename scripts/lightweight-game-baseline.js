// Developer-only actual-game fixture: ordinary roads, lots and catalogue.
const reportPanel=document.createElement('pre');reportPanel.id='baseline-result';reportPanel.style.cssText='position:fixed;left:10px;top:10px;max-height:80vh;overflow:auto;z-index:999;background:#102a;color:white;padding:12px;font:12px monospace';document.body.append(reportPanel);
try{
 reportPanel.textContent='Preparing flat 480m current-game baseline…';
 const map=Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:480,tileSize:480});ll.setMap(map);await Gt.setTerrain(map,_e);
 const lines=[];for(const v of [-180,-60,60,180])lines.push([{x:v,z:-180},{x:v,z:180}],[{x:-180,z:v},{x:180,z:v}]);_e.addBatch(lines);Gt.drawRoads(_e);Vh.setPropertyZone('offices');pcOhneeSetControl(Vh,{enabled:false,style:'all'});Gn('hand');Ui();
 const properties=Vh.properties,start=performance.now();Vh.applyProperties(properties,'offices');Gt.drawZoning();const generationMs=performance.now()-start;
 const intervals=[],c=Gt.controls;c.enableDamping=false;c.target.set(0,55,0);let last=performance.now();
 for(let i=0;i<112;i++){const angle=.78+i*.002;c.object.position.set(Math.sin(angle)*650,490,Math.cos(angle)*650);c.update();await new Promise(requestAnimationFrame);const now=performance.now();if(i>=16)intervals.push(now-last);last=now;}
 c.enableDamping=true;intervals.sort((a,b)=>a-b);const mean=intervals.reduce((a,b)=>a+b,0)/intervals.length;
 const result={fixture:'current-game-68-office-lots',seed:1138,size:480,buildings:Vh.buildings.length,experimental:Vh.buildings.filter(b=>b.office?.procedural).length,viewport:[innerWidth,innerHeight],visibility:document.visibilityState,renderer:Gt.performanceInfo(),generationMs,jsHeapBytes:performance.memory?.usedJSHeapSize??null,timing:{samples:96,fps:1000/mean,medianMs:intervals[48],p95Ms:intervals[91],meanMs:mean,method:'moving camera requestAnimationFrame intervals; includes scheduling; not isolated GPU time'}};
 result.nvidia=/NVIDIA/.test(result.renderer.gpuRenderer||'');reportPanel.textContent=JSON.stringify(result,null,2);await fetch('/report-game',{method:'POST',body:JSON.stringify(result)});
}catch(error){reportPanel.textContent=error.stack;}
