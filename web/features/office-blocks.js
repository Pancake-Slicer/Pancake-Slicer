// Gap-free office land subdivision. Every cut partitions its parent polygon;
// there are no random cursor jumps, plot buffers, or internal grass strips.
function pcOfficeBlockLayout(network, landmarks) {
  const tile=Gi(network), roadMask=Bo(Yb(network).paths,-1.5);
  const land=je(Od(network),ve([...roadMask,...landmarks.flatMap(Gb)]));
  const enclosed=xn(land).filter(p=>!p.outer.some(v=>v.x<=tile.minX+.01||v.x>=tile.maxX-.01||v.z<=tile.minZ+.01||v.z>=tile.maxZ-.01));
  const interior=ve(enclosed.flatMap(p=>Te(p.outer)));
  // Open streets get a continuous 64 m development belt, not the entire map.
  const belt=ve(network.roads.filter(Gc).flatMap(road=>zn(bn(road),Ut(road.typeId).width+128)));
  const exterior=xn(je(Ee(land,belt),interior));
  const plots=[],heightAt=(x,z)=>network.terrain?.heightAt(x,z)||0;
  const roads=network.roads.filter(Gc).map(road=>({road,sample:Hn(Qo(road))}));
  function nearest(point) {
    let best;
    for(const item of roads)for(let station=0;station<=item.sample.length;station+=Math.max(2,item.sample.length/120)){
      const p=item.sample.at(station),distance=Math.hypot(point.x-p.x,point.z-p.z);
      if(!best||distance<best.distance)best={...item,p,station,distance};
    }
    return best;
  }
  function partition(paths,angle,blockId,code='',level=0) {
    const parts=xn(paths);if(!parts.length)return;
    const cos=Math.cos(angle),sin=Math.sin(angle),local=p=>({x:p.x*cos+p.z*sin,z:-p.x*sin+p.z*cos}),world=(x,z)=>({x:x*cos-z*sin,z:x*sin+z*cos});
    const points=parts.flatMap(p=>p.outer.map(local)),bounds=En(points),w=bounds.maxX-bounds.minX,d=bounds.maxZ-bounds.minZ;
    if(level<16&&(w>66||d>66||parts.some(p=>p.holes.length))){
      const axis=w>=d?'x':'z',length=axis==='x'?w:d,min=axis==='x'?bounds.minX:bounds.minZ;
      // Balanced cuts distribute the remainder, so no leftover strip is skipped.
      const count=Math.max(2,Math.ceil(length/60));
      let span=length*Math.floor(count/2)/count;
      // Keep a viable native-width site instead of splitting both halves too
      // narrowly for registered growables. The remainder stays fully zonable.
      const nativeWidth=Math.min(66,Math.max(0,...pcGrowableCurrentDefinitions.map(a=>Math.max(a.eligibility.minLotWidth,a.eligibility.minLotDepth)))+.1);
      if(span<nativeWidth&&length>=nativeWidth+20)span=nativeWidth;
      const cut=min+span;
      const rectangle=(x0,z0,x1,z1)=>Te([world(x0,z0),world(x1,z0),world(x1,z1),world(x0,z1)]);
      const first=axis==='x'?rectangle(bounds.minX-1,bounds.minZ-1,cut,bounds.maxZ+1):rectangle(bounds.minX-1,bounds.minZ-1,bounds.maxX+1,cut);
      const a=Ee(paths,first),b=je(paths,first);
      partition(a,angle,blockId,code+'0',level+1);partition(b,angle,blockId,code+'1',level+1);return;
    }
    for(let i=0;i<parts.length;i++){
      const part=parts[i],footprint=yg(part.outer),area=sn(Te(footprint));
      if(part.holes.length||area<4)continue;
      const centre=cS(footprint);if(!centre)continue;
      const samples=[...footprint,centre];
      // Sample the interior too; a level perimeter must not hide a hill/water.
      const box=En(footprint);
      for(let x=box.minX;x<=box.maxX;x+=8)for(let z=box.minZ;z<=box.maxZ;z+=8)if(Kr({x,z},footprint))samples.push({x,z});
      const heights=samples.map(p=>heightAt(p.x,p.z)),low=Math.min(...heights),high=Math.max(...heights);
      if(network.terrain&&(low<1.4||high-low>3.6))continue;
      const near=nearest(centre);if(!near)continue;
      const toward={x:near.p.x-centre.x,z:near.p.z-centre.z},length=Math.hypot(toward.x,toward.z)||1;
      const unit={x:toward.x/length,z:toward.z/length};let frontDistance=Infinity;
      for(let j=0;j<footprint.length;j++){
        const a=footprint[j],b=footprint[(j+1)%footprint.length],dx=b.x-a.x,dz=b.z-a.z,det=unit.x*dz-unit.z*dx;
        if(Math.abs(det)<1e-9)continue;
        const t=((a.x-centre.x)*dz-(a.z-centre.z)*dx)/det,u=((a.x-centre.x)*unit.z-(a.z-centre.z)*unit.x)/det;
        if(t>=0&&u>=0&&u<=1)frontDistance=Math.min(frontDistance,t);
      }
      if(!Number.isFinite(frontDistance))frontDistance=0;
      const entrance={x:centre.x+unit.x*Math.max(0,frontDistance-.05),z:centre.z+unit.z*Math.max(0,frontDistance-.05)};
      const extent=En(footprint.map(local)),id=`office-block:${blockId}:${code}:${i}`;
      const plot={id,blockId,zone:'offices',roadId:near.road.id,side:1,station:near.station,footprint,bounds:box,area,
        x:centre.x,z:centre.z,y:high+.57,ground:low,foundationDepth:high-low+.75,
        entrance:{...entrance,y:heightAt(entrance.x,entrance.z)},towardRoad:unit,
        rotation:-angle,variation:pcOfficeHash(id)/0x100000000,frontage:extent.maxX-extent.minX,depth:extent.maxZ-extent.minZ,
        officeProfile:pcOfficeProfiles[pcOfficeHash(id)%pcOfficeProfiles.length]};
      plot.signature=JSON.stringify([id,footprint,plot.y,low]);plots.push(plot);
    }
  }
  for(const [index,part] of [...enclosed,...exterior].entries()){
    const shape=je(Te(part.outer),ve(part.holes.flatMap(Te))),bounds=En(part.outer);
    let edge=0;for(let i=1;i<part.outer.length;i++)if(Math.hypot(part.outer[(i+1)%part.outer.length].x-part.outer[i].x,part.outer[(i+1)%part.outer.length].z-part.outer[i].z)>Math.hypot(part.outer[(edge+1)%part.outer.length].x-part.outer[edge].x,part.outer[(edge+1)%part.outer.length].z-part.outer[edge].z))edge=i;
    const a=part.outer[edge],b=part.outer[(edge+1)%part.outer.length],angle=Math.atan2(b.z-a.z,b.x-a.x);
    const blockId=[bounds.minX,bounds.minZ,bounds.maxX,bounds.maxZ].map(v=>v.toFixed(2)).join(':')+':'+index;
    partition(shape,angle,blockId);
  }
  // Absorb narrow corner/remainder pieces into a touching neighbour rather
  // than spawning pencil-thin buildings or discarding the land as grass.
  for(let pass=0;pass<plots.length;pass++){
    const small=plots.find(p=>p.area<600||Math.min(p.frontage,p.depth)<20||p.area/(p.frontage*p.depth)<.3);if(!small)break;
    let choice;
    for(const neighbour of plots){
      if(neighbour===small||neighbour.blockId!==small.blockId||Math.max(neighbour.y,small.y)-Math.min(neighbour.ground,small.ground)>4.17)continue;
      const joined=xn(ve([...Te(small.footprint),...Te(neighbour.footprint)]));
      if(joined.length!==1||joined[0].holes.length)continue;
      const shared=sn(Ee(Bo(Te(small.footprint),.02),Te(neighbour.footprint)));
      if(shared>.01&&(!choice||shared>choice.shared))choice={neighbour,footprint:yg(joined[0].outer),shared};
    }
    if(!choice)break;
    const p=choice.neighbour;p.footprint=choice.footprint;p.bounds=En(p.footprint);p.area=sn(Te(p.footprint));
    const centre=cS(p.footprint);p.x=centre.x;p.z=centre.z;p.y=Math.max(p.y,small.y);p.ground=Math.min(p.ground,small.ground);p.foundationDepth=p.y-p.ground+.18;
    const cos=Math.cos(p.rotation),sin=Math.sin(p.rotation),box=En(p.footprint.map(v=>({x:v.x*cos-v.z*sin,z:v.x*sin+v.z*cos})));
    p.frontage=box.maxX-box.minX;p.depth=box.maxZ-box.minZ;p.signature=JSON.stringify([p.id,p.footprint,p.y,p.ground]);plots.splice(plots.indexOf(small),1);
  }
  return plots;
}
