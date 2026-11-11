// A landmark edits its own site, not the city's parcel generation seed/layout.
function pcLandmarkProperties(collection) {
  const network=collection.network, map=network.terrain, bounds=JSON.stringify(Gi(network));
  let state=collection.pcLandmarkPropertyState;
  const sameRoads=state&&state.roads.length===network.roads.length&&state.roads.every((road,i)=>road===network.roads[i]);
  if(!sameRoads||state.map!==map||state.heightAt!==map?.heightAt||state.revision!==(map?.revision||0)||state.bounds!==bounds){
    state={roads:[...network.roads],map,heightAt:map?.heightAt,revision:map?.revision||0,bounds,
      residential:Zb(network,[]),offices:pcOfficePlots(network,[]),key:null};
    collection.pcLandmarkPropertyState=state;
  }
  const items=collection.landmarks.items;
  const key=JSON.stringify(items.map(item=>[item.id,item.typeId,item.x,item.z,item.rotation]));
  if(state.key!==key){
    const exclusions=items.map(item=>{const paths=Bo(Te(us(item)),1);return {paths,bounds:En(us(item))};});
    const filter=properties=>{
      const retained=properties.filter(property=>!exclusions.some(exclusion=>hs(property.bounds||En(property.footprint),exclusion.bounds)&&sn(Ee(Ip(property),exclusion.paths))>.01));
      return retained.length===properties.length?properties:retained;
    };
    state.filteredResidential=filter(state.residential);state.filteredOffices=filter(state.offices);state.key=key;
  }
  return {residential:state.filteredResidential,offices:state.filteredOffices};
}
function pcBeginLandmarkEdit(network){network.development?.rebuild();}
function pcFinishLandmarkEdit(network){
  const state=network.development?.pcLandmarkPropertyState;
  if(state){state.revision=network.terrain?.revision||0;state.key=null;}
}
function pcRestoreLandmarkLayout(network){
  const state=network.development?.pcLandmarkPropertyState;
  if(state&&state.map===network.terrain&&state.heightAt===network.terrain?.heightAt&&JSON.stringify(state.roads)===JSON.stringify(network.roads)){
    state.roads=[...network.roads];state.revision=network.terrain?.revision||0;state.key=null;
  }
}
const pcDevelopmentCollisionCache=new WeakMap;
function pcDevelopmentCollisions(network){
  const buildings=network.development?.buildings||[];
  let cached=pcDevelopmentCollisionCache.get(network);
  if(cached?.source===buildings)return cached;
  const cells=new Map;
  for(const building of buildings){
    const paths=Bo(Te(building.footprint),4),bounds=En(building.footprint),record={paths,bounds,building};
    for(let x=Math.floor((bounds.minX-5)/64);x<=Math.floor((bounds.maxX+5)/64);x++)for(let z=Math.floor((bounds.minZ-5)/64);z<=Math.floor((bounds.maxZ+5)/64);z++){
      const key=x+':'+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(record);
    }
  }
  cached={source:buildings,cells};pcDevelopmentCollisionCache.set(network,cached);return cached;
}
function pcLandmarkTerrainBlocked(network,point){return (pcDevelopmentCollisions(network).cells.get(Math.floor(point.x/64)+':'+Math.floor(point.z/64))||[]).some(record=>ns(record.paths,point));}
function pcLandmarkDevelopmentError(network,candidate){
  const footprint=us(candidate),bounds=En(footprint),paths=Bo(Te(footprint),1),near=new Set;
  const cache=pcDevelopmentCollisions(network);
  for(let x=Math.floor((bounds.minX-2)/64);x<=Math.floor((bounds.maxX+2)/64);x++)for(let z=Math.floor((bounds.minZ-2)/64);z<=Math.floor((bounds.maxZ+2)/64);z++)for(const record of cache.cells.get(x+':'+z)||[])near.add(record);
  return [...near].some(record=>hs(bounds,record.bounds)&&sn(Ee(paths,Te(record.building.footprint)))>.01)?'Choose a landmark site clear of existing buildings.':null;
}
function pcLandmarkShadowBounds(models,cache){
  for(const id of cache.keys())if(!models.has(id))cache.delete(id);
  return [...models].map(([id,model])=>{
    const key=[model.position.x,model.position.y,model.position.z,model.rotation.y].join(':');
    let stored=cache.get(id);
    if(!stored||stored.model!==model||stored.key!==key){stored={key,model,bounds:new di().setFromObject(model)};cache.set(id,stored);}
    return stored.bounds;
  });
}
