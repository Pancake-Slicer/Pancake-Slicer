// pcSC4Catalogue is embedded from the reviewed reference JSON at assembly time.
function pcCatalogueFind(id){return pcSC4Catalogue.entries.find(entry=>entry.id===Number(id));}
function pcCatalogueReference(collection,property){
  const assigned=collection.pcCatalogueAssignments?.get(property.id);
  const fixed=pcCatalogueFind(assigned)||pcCatalogueFind(collection.pcCatalogueChoice);if(fixed)return fixed;
  const options=pcSC4Catalogue.entries.filter(entry=>!pcSC4Model(entry.id)||pcSC4Fits(property,pcSC4Model(entry.id)));
  return options[pcOfficeHash(property.id+':catalogue')%options.length];
}
function pcCatalogueNeedsChange(collection,properties,zone,erase){
  if(erase||zone!=='offices'||!collection.pcCatalogueChoice)return false;
  return properties.some(property=>Number(collection.pcCatalogueAssignments?.get(property.id))!==Number(collection.pcCatalogueChoice));
}
function pcCatalogueAssign(collection,properties,zone,erase){
  if(zone!=='offices'||erase)return;
  if(!collection.pcCatalogueAssignments)collection.pcCatalogueAssignments=new Map;
  for(const property of properties)collection.pcCatalogueAssignments.set(property.id,pcCatalogueReference(collection,property).id);
  if(collection.pcCatalogueChoice)for(const property of properties)collection.pcCatalogueAssignments.set(property.id,Number(collection.pcCatalogueChoice));
}
function pcCatalogueSpec(collection,property,spec){
  const entry=pcCatalogueReference(collection,property);
  const original=pcSC4Model(entry.id),sourceHeight=original?original.bounds.maxY-original.bounds.minY:undefined;
  return {...spec,catalogueId:entry.id,catalogueName:entry.name,style:entry.style,facade:entry.facade,colour:entry.colour,
    floors:entry.estimatedFloors,floorHeight:sourceHeight?sourceHeight/entry.estimatedFloors:entry.type==='services'&&entry.estimatedFloors<6?4.2:3.9,sourceHeight,variant:0};
}
function pcCatalogueOutline(building,entry,scale=1,offsetX=0,offsetZ=0){
  const shape=entry.shape;
  let p=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],parts=null;
  if(['oval','oval-core'].includes(shape))p=Array.from({length:32},(_,i)=>[Math.cos(i*Math.PI/16)*.5,Math.sin(i*Math.PI/16)*.5]);
  if(['bow','round-front','showroom'].includes(shape))p=[[-.5,.5],[.5,.5],...Array.from({length:21},(_,i)=>[Math.cos(i*Math.PI/20)*.5,-Math.sin(i*Math.PI/20)*.5])];
  if(shape==='round-corner')p=[[-.5,-.5],[.2,-.5],...Array.from({length:9},(_,i)=>[.2+.3*Math.cos(-Math.PI/2+i*Math.PI/16),-.2+.3*Math.sin(-Math.PI/2+i*Math.PI/16)]),[.5,.5],[-.5,.5]];
  if(shape==='octagon')p=[[-.3,-.5],[.3,-.5],[.5,-.3],[.5,.3],[.3,.5],[-.3,.5],[-.5,.3],[-.5,-.3]];
  if(['u-court','court','twin-notch'].includes(shape))p=[[-.5,-.5],[.5,-.5],[.5,.5],[.16,.5],[.16,0],[-.16,0],[-.16,.5],[-.5,.5]];
  if(shape==='l-shape')p=[[-.5,-.5],[.5,-.5],[.5,-.12],[-.12,-.12],[-.12,.5],[-.5,.5]];
  if(['cross','hotel-wings'].includes(shape))p=[[-.2,-.5],[.2,-.5],[.2,-.22],[.5,-.22],[.5,.22],[.2,.22],[.2,.5],[-.2,.5],[-.2,.22],[-.5,.22],[-.5,-.22],[-.2,-.22]];
  if(['notch','notched','recessed'].includes(shape))p=[[-.5,-.5],[-.14,-.5],[-.14,-.28],[.14,-.28],[.14,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
  if(['twin-core','slab-core'].includes(shape))p=[[-.5,-.5],[-.06,-.5],[-.06,-.22],[.12,-.22],[.12,-.5],[.5,-.5],[.5,.5],[.12,.5],[.12,.18],[-.06,.18],[-.06,.5],[-.5,.5]];
  if(shape==='wedge')p=[[-.48,.5],[.48,.5],[.08,-.5],[-.08,-.5]];
  if(shape==='mall')p=[[-.5,-.5],[.12,-.5],[.12,-.14],[.5,-.14],[.5,.5],[-.5,.5]];
  if(shape==='spa')parts=[[[-.5,-.45],[-.12,-.45],[-.12,.2],[-.5,.2]],[[.16,-.35],[.48,-.35],[.48,.05],[.16,.05]],[[-.35,.3],[.18,.3],[.18,.5],[-.35,.5]]];
  if(shape==='theatre')p=[[-.5,-.4],[-.2,-.4],[-.2,-.5],[.2,-.5],[.2,-.4],[.5,-.4],[.5,.5],[-.5,.5]];
  if(shape==='fluted')p=[[-.5,-.4],[-.3,-.4],[-.3,-.5],[-.1,-.5],[-.1,-.4],[.1,-.4],[.1,-.5],[.3,-.5],[.3,-.4],[.5,-.4],[.5,.4],[.3,.4],[.3,.5],[.1,.5],[.1,.4],[-.1,.4],[-.1,.5],[-.3,.5],[-.3,.4],[-.5,.4]];
  const ring=building.footprint,a=ring[0],b=ring[1],d=ring.at(-1);
  const world=([x,z])=>({x:a.x+(b.x-a.x)*(.5+offsetX+x*entry.bodyWidth*scale)+(d.x-a.x)*(.5+offsetZ+z*entry.bodyDepth*scale),z:a.z+(b.z-a.z)*(.5+offsetX+x*entry.bodyWidth*scale)+(d.z-a.z)*(.5+offsetZ+z*entry.bodyDepth*scale)});
  return (parts||[p]).map(part=>part.map(world));
}
function pcCatalogueTiers(building){
  const entry=pcCatalogueFind(building.office.catalogueId),floors=building.floors;
  let fractions=[1],scales=[1];
  if(entry.shape==='steps'||entry.shape==='pencil'){
    fractions=floors>40?[.14,.22,.25,.23,.16]:[.2,.55,.25];scales=fractions.length===5?[1,.87,.73,.59,.43]:[1,.88,.69];
  }else if(['stepped-slab','box-top'].includes(entry.shape)){fractions=[.18,.6,.22];scales=entry.shape==='box-top'?[.67,1,1]:[1,.9,.76];}
  else if(floors>=20){fractions=[.1,.76,.14];scales=[1,.94,.88];}
  const counts=fractions.map(f=>Math.max(1,Math.floor(floors*f)));counts[0]+=floors-counts.reduce((a,b)=>a+b,0);
  let y=building.y;
  return counts.map((count,index)=>{
    const parts=pcCatalogueOutline(building,entry,scales[index]);
    const tier={parts,footprint:parts[0],y,height:count*building.office.floorHeight,floors:count,index};y+=tier.height;return tier;
  });
}
function pcCatalogueAccent(entry){
  const key=entry.roof; if(!pcCatalogueRoofMaterials.has(key))pcCatalogueRoofMaterials.set(key,new Re({color:key.includes('gold')?0xc7a85b:key.includes('copper')?0x4d8173:key.includes('red')?0x865043:key.includes('teal')?0x3f6266:key.includes('green')?0x7fa7a4:key.includes('blue')?0x455e77:0x424d54,roughness:.6,metalness:key.includes('domes')?.3:.08}));
  return pcCatalogueRoofMaterials.get(key);
}
const pcCatalogueRoofMaterials=new Map;
function pcCatalogueRoofMesh(ring,base,height,kind){
  const centre=cS(ring);if(!centre)return null;
  const bounds=En(ring),positions=[],uv=[];
  const reverse=kind!=='dome'&&ring.reduce((sum,p,i)=>sum+p.x*ring[(i+1)%ring.length].z-ring[(i+1)%ring.length].x*p.z,0)>0;
  const add=(a,b,c)=>{for(const p of reverse?[a,c,b]:[a,b,c]){positions.push(p.x,p.y,p.z);uv.push(p.x/4,p.z/4);}};
  if(kind==='dome'){
    const radius=Math.min((bounds.maxX-bounds.minX)/2,(bounds.maxZ-bounds.minZ)/2)*.6;
    for(let row=0;row<8;row++)for(let col=0;col<24;col++){
      const p=(r,c)=>{const theta=r/8*Math.PI/2,angle=c/24*Math.PI*2;return{x:centre.x+Math.cos(theta)*Math.cos(angle)*radius,y:base+Math.sin(theta)*height,z:centre.z+Math.cos(theta)*Math.sin(angle)*radius};};
      add(p(row,col),p(row+1,col),p(row,col+1));add(p(row,col+1),p(row+1,col),p(row+1,col+1));
    }
  }else if(kind==='angled'){
    // A clipped, sloping cap, rather than another horizontal roof slab.
    const low=bounds.minZ,span=Math.max(.01,bounds.maxZ-low),peak={x:centre.x,z:centre.z,y:base+height*(centre.z-low)/span};
    for(let i=0;i<ring.length;i++){
      const a={...ring[i],y:base+height*(ring[i].z-low)/span},b={...ring[(i+1)%ring.length],y:base+height*(ring[(i+1)%ring.length].z-low)/span};
      add(a,b,peak);add({...a,y:base},{...b,y:base},a);add({...b,y:base},b,a);
    }
  }else{
    // Inset perimeter rings keep even concave and rotated roof forms on site.
    const steps=kind.includes('barrel')?12:kind.includes('mansard')?2:1;
    let previous=ring.map(p=>({...p,y:base}));
    for(let row=1;row<=steps;row++){
      const t=row/steps,scale=kind.includes('mansard')?1-t*.35:Math.cos(t*Math.PI/2)*.95;
      const current=ring.map(p=>({x:centre.x+(p.x-centre.x)*scale,z:centre.z+(p.z-centre.z)*scale,y:base+Math.sin(t*Math.PI/2)*height}));
      for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length;add(previous[i],previous[j],current[i]);add(previous[j],current[j],current[i]);}
      previous=current;
    }
    if(kind.includes('mansard'))for(let i=0;i<ring.length;i++)add(previous[i],previous[(i+1)%ring.length],{x:centre.x,z:centre.z,y:base+height});
  }
  const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(uv,2));geometry.computeVertexNormals();return geometry;
}
function pcCatalogueDetails(building,tiers,B,U,materials){
  const entry=pcCatalogueFind(building.office.catalogueId),top=tiers.at(-1),roof=building.y+building.height,accent=pcCatalogueAccent(entry),id=building.id;
  const ring=top.parts[0],centre=cS(ring);if(!centre)return;
  const size=Math.min(8,centre.clearance),angle=building.rotation;
  if(/gable|mansard|hip|barrel|sail|angled/.test(entry.roof)){
    const mesh=pcCatalogueRoofMesh(ring,roof+.2,Math.min(7,centre.clearance*.55),entry.roof);if(mesh)B(mesh,accent,id);
  }
  if(entry.roof.includes('domes')){
    const mesh=pcCatalogueRoofMesh(ring,roof+.2,Math.min(7,centre.clearance*.6),'dome');if(mesh)B(mesh,accent,id);
  }
  if(['glass-pyramid','glasshouse','skylights','solar'].includes(entry.roof)){
    U({x:centre.x,y:roof+.8,z:centre.z},size*1.3,1.1,size*.75,angle,materials.glass,id);
    for(let mullion=-2;mullion<=2;mullion++)U({x:centre.x+mullion*size*.22,y:roof+1.4,z:centre.z},.09,.1,size*.8,angle,materials.trim,id);
    if(entry.roof==='glass-pyramid'){const mesh=pcCatalogueRoofMesh(ring.map(p=>({x:centre.x+(p.x-centre.x)*.4,z:centre.z+(p.z-centre.z)*.4})),roof+.8,4,'gable');if(mesh)B(mesh,materials.glass,id);}
  }
  if(['gothic','dark-crown','pediment','portal','notch'].includes(entry.roof)){
    const height=entry.roof==='gothic'?6:entry.roof==='portal'?4:3;
    U({x:centre.x,y:roof+height/2,z:centre.z},size*.8,height,size*.65,angle,accent,id);
    if(entry.roof==='gothic')for(const side of [-1,1]){const cone=new Dn(0,.65,3,4);cone.translate(centre.x+side*size*.7,roof+1.5,centre.z);const mesh=cone.toNonIndexed();cone.dispose();B(mesh,materials.trim,id);}
  }
  if(entry.roof==='helipad'||entry.roof==='roof-track'){
    U({x:centre.x,y:roof+.3,z:centre.z},size*1.8,.16,size*1.6,angle,accent,id);
    if(entry.roof==='helipad'){for(const side of [-1,1])U({x:centre.x+side*size*.35,y:roof+.4,z:centre.z},.2,.03,size,angle,materials.trim,id);U({x:centre.x,y:roof+.4,z:centre.z},size*.8,.03,.2,angle,materials.trim,id);}
  }
  const base=building.footprint,origin=base[0],dx=base[1].x-origin.x,dz=base[1].z-origin.z,ex=base[3].x-origin.x,ez=base[3].z-origin.z;
  const site=(x,z,y)=>({x:origin.x+dx*x+ex*z,z:origin.z+dz*x+ez*z,y});
  if(['garage','showroom','mall'].includes(entry.shape))for(let i=0;i<8;i++){
    U(site(.12+i*.105,.92,building.y+.02),.12,.03,3,angle,materials.trim,id);
    if(i%3!==0)U(site(.16+i*.105,.92,building.y+.55),1.6,1,3.2,angle,materials.glass,id);
  }
  if(entry.shape==='spa'){
    U(site(.62,.69,building.y+.04),Math.hypot(dx,dz)*.3,.08,Math.hypot(ex,ez)*.3,angle,materials.glass,id);
    for(let i=0;i<4;i++)U(site(.12+i*.2,.86,building.y+.2),2,.3,1,angle,materials.trim,id);
  }
}
function pcCatalogueInitMenu(container,collection,redraw){
  const select=container.querySelector('#commercial-catalogue');if(!select)return;
  // The catalogue includes one-storey services as well as high-rise offices.
  const helpText=container.querySelector('#zoning-type-help');
  const refreshHelp=()=>{if(collection.propertyZone==='offices'&&helpText)helpText.textContent=globalThis.pcSC4Originals?.models?'Original buildings retain their size. Parcels range up to 76 × 76 m; choose a large enough parcel for the selected building. Paint or bucket-fill to apply it.':'Office plots are 32–56 m wide and 30–58 m deep. Choose a Commercial $$$ building, then paint or bucket-fill an Office parcel. The catalogue includes low-rise shops and hotels as well as towers.';};
  for(const tab of container.querySelectorAll?.('[data-zone]')||[])tab.addEventListener('click',refreshHelp);
  const option=entry=>`<option value="${entry.id}">${entry.name.replace(/&/g,'&amp;').replace(/</g,'&lt;')} [${entry.id}]</option>`;
  select.innerHTML='<option value="">Mix all 98 commercial $$$ buildings</option>'+['office','services'].map(type=>`<optgroup label="${type==='office'?'Offices (64)':'Shops, hotels and services (34)'}">${pcSC4Catalogue.entries.filter(entry=>entry.type===type).map(option).join('')}</optgroup>`).join('');
  select.value=collection.pcCatalogueChoice?String(collection.pcCatalogueChoice):'';
  select.addEventListener('change',()=>{
    collection.pcCatalogueChoice=select.value?Number(select.value):null;
    const entry=pcCatalogueFind(select.value),help=container.querySelector('#catalogue-help');
    const original=entry&&pcSC4Model(entry.id);
    help.textContent=original?`${entry.name} · original SimCity 4 model and textures · ${original.size[0]} × ${original.size[2]} m building, ${original.size[1]} m reference height. Paint a parcel large enough for this building; small parcels stay empty.`:entry?`${entry.name} · ${entry.tileset} · reference lots ${entry.lots.join(', ')} · approximately ${entry.estimatedFloors} storeys. Paint or refill an Office parcel to apply this design.`:'Mix all 98 referenced offices, shops, hotels and services. Existing buildings keep their chosen design.';
    redraw();
  });
}
