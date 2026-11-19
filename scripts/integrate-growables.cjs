const {assetSource}=require('./growable-assets.cjs');
function applyGrowableAssets(source){
 const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Growable patch boundary changed: '+before.slice(0,100));source=source.replace(before,()=>after);};
 replace('const vi=Object.freeze(',assetSource()+'\nconst vi=Object.freeze(');
 replace('N.geometry?.dispose(),N.dispose?.()', '(N.userData.pcSharedAssetGeometry||N.geometry?.dispose()),N.dispose?.()');
 replace('function T(R){for(const D of[...R.children])', 'function T(R){pcOhneeClearChunk(R);for(const D of[...R.children])');
 // Reuse inactive templates throughout the synchronous chunk transaction;
 // prune once after replacements/removals, not before rebuilding each chunk.
 replace('E={meshes:0,windows:0,rebuiltChunks:F,builtBuildings:B,totalChunks:_.size', 'pcOhneeRuntime?.trim();E={meshes:0,windows:0,rebuiltChunks:F,builtBuildings:B,totalChunks:_.size');
 replace('at(R){return R.instanceId!==void 0?', 'at(R){if(R.object.userData.pcOhneeBuildings)return pcOhneePick(R);return R.instanceId!==void 0?');
 replace('performanceInfo:()=>({...pi,triangles:b.info.render.triangles})', 'performanceInfo:()=>({...pi,triangles:b.info.render.triangles,calls:b.info.render.calls,memory:{...b.info.memory},gpuRenderer:T})');
 replace('new sb({antialias:!1,logarithmicDepthBuffer:!0})', 'new sb({antialias:!1,logarithmicDepthBuffer:!0,powerPreference:"high-performance"})');
 // Background copies must not compete with the active game for GPU/simulation
 // time. Advance the clock while hidden so resuming never catches up a backlog.
 replace('b.setAnimationLoop(H=>{const Mt=', 'b.setAnimationLoop(H=>{if(document.hidden){Ze=H;return}const Mt=');
 replace('catalogueAssignments:[...(this.pcCatalogueAssignments||new Map)]}', 'catalogueAssignments:[...(this.pcCatalogueAssignments||new Map)],proceduralOffices:pcOhneeHistory(this)}');
 replace('restore:i=>{const s=JSON.stringify(i?.regions)', 'restore:i=>{let s=JSON.stringify(i?.regions)');
 replace('this.pcCatalogueAssignments=new Map(i?.catalogueAssignments??[]);this.regions=', 's=pcOhneeRestore(this,i?.proceduralOffices)||s;this.pcCatalogueAssignments=new Map(i?.catalogueAssignments??[]);this.regions=');
 replace('function A(R,D,N){const X=new Map,W=new Map,F=', 'function A(R,D,N){const pcAssetInstances=new Map;const X=new Map,W=new Map,F=');
 replace('for(const J of R){if(J.zone==="offices")', 'for(const J of R){if(pcQueueGrowable(J,pcAssetInstances,B,F))continue;if(J.zone==="offices")');
 replace('return F.meshes=D.children.length,F}', 'pcFlushGrowables(pcAssetInstances,D);return F.meshes=D.children.length,F}');
 replace('D.footprint.map(W=>({x:D.x+', '(D.office?.assetPlacement?.footprint||D.footprint).map(W=>({x:D.x+');
 replace('pcCatalogueFind(l.office?.catalogueId)?.name||"office tower"', 'pcGrowableFind(l.office?.assetKey)?.name||pcCatalogueFind(l.office?.catalogueId)?.name||"office tower"');
 // Keep VM-tested declarations synchronous; initialize embedded textures after
 // the icon table, before the actual game starts. Offline HTML also awaits it.
 replace(';const _e=new zb;pw(', ';await pcGrowablesReady();const _e=new zb;pw(');
 replace('Ui();new URLSearchParams(location.search).has("test")', 'pcOhneeInitControls(Vh,()=>{Gt.drawZoning();Ui()},()=>Gt.performanceInfo());Ui();new URLSearchParams(location.search).has("test")');
 replace('window.__sandbox={network:_e,', 'window.__sandbox={proceduralOffices:{definitions:pcOhneeDefinitions,get runtime(){return pcOhneeRuntime},info:pcOhneeInfo,setControl:pcOhneeSetControl,engine:pcOhneeEngine,package:pcOhneePackage},growables:{definitions:pcGrowableDefinitions,resource:pcGrowableResource,placement:pcGrowablePlacement,three:{Group:Se,BoxGeometry:mn,BufferGeometry:Ce,Float32BufferAttribute:pe,Mesh:ae,MeshStandardMaterial:Re,CanvasTexture:vr,SRGBColorSpace:hn}},network:_e,');
 return require('./lightweight-deco.cjs').applyDecoIntegration(require('./lightweight-alderwick.cjs').applyAlderwickIntegration(require('./lightweight-brick.cjs').applyBrickIntegration(require('./auto-foundations.cjs').applyAutoFoundations(require('./facade-foundations.cjs').applyFacadeFoundations(require('./lightweight-von.cjs').applyVonIntegration(require('./lightweight-lind.cjs').applyLindIntegration(require('./lightweight-bmo.cjs').applyBmoIntegration(source))))))));
}
module.exports={applyGrowableAssets};
