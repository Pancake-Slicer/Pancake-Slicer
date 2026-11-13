const {assetSource}=require('./growable-assets.cjs');
function applyGrowableAssets(source){
 const replace=(before,after)=>{if(source.split(before).length!==2)throw Error('Growable patch boundary changed: '+before.slice(0,100));source=source.replace(before,()=>after);};
 replace('const vi=Object.freeze(',assetSource()+'\nconst vi=Object.freeze(');
 replace('N.geometry?.dispose(),N.dispose?.()', '(N.userData.pcSharedAssetGeometry||N.geometry?.dispose()),N.dispose?.()');
 replace('function A(R,D,N){const X=new Map,W=new Map,F=', 'function A(R,D,N){const pcAssetInstances=new Map;const X=new Map,W=new Map,F=');
 replace('for(const J of R){if(J.zone==="offices")', 'for(const J of R){if(pcQueueGrowable(J,pcAssetInstances,B,F))continue;if(J.zone==="offices")');
 replace('return F.meshes=D.children.length,F}', 'pcFlushGrowables(pcAssetInstances,D);return F.meshes=D.children.length,F}');
 replace('D.footprint.map(W=>({x:D.x+', '(D.office?.assetPlacement?.footprint||D.footprint).map(W=>({x:D.x+');
 replace('pcCatalogueFind(l.office?.catalogueId)?.name||"office tower"', 'pcGrowableFind(l.office?.assetKey)?.name||pcCatalogueFind(l.office?.catalogueId)?.name||"office tower"');
 // Keep VM-tested declarations synchronous; initialize embedded textures after
 // the icon table, before the actual game starts. Offline HTML also awaits it.
 replace(';const _e=new zb;pw(', ';await pcGrowablesReady();const _e=new zb;pw(');
 replace('window.__sandbox={network:_e,', 'window.__sandbox={growables:{definitions:pcGrowableDefinitions,resource:pcGrowableResource,placement:pcGrowablePlacement,three:{Group:Se,BoxGeometry:mn,BufferGeometry:Ce,Float32BufferAttribute:pe,Mesh:ae,MeshStandardMaterial:Re,CanvasTexture:vr,SRGBColorSpace:hn}},network:_e,');
 return source;
}
module.exports={applyGrowableAssets};
