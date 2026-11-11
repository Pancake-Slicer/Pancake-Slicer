// Optional original artwork is generated locally by import-sc4-originals.cjs.
function pcSC4Model(id){return globalThis.pcSC4Originals?.models?.[id]||null;}
function pcSC4Fits(property,model){
  const w=model.bounds.maxX-model.bounds.minX,d=model.bounds.maxZ-model.bounds.minZ;
  return (property.frontage>=w+2&&property.depth>=d+2)||(property.frontage>=d+2&&property.depth>=w+2);
}
function pcSC4ProfileOptions(){return globalThis.pcSC4Originals?.models?[
  ...pcOfficeProfiles,
  {id:'original-large',style:'international',width:64,depth:64,minFloors:10,maxFloors:80},
  {id:'original-largest',style:'art-deco',width:76,depth:76,minFloors:10,maxFloors:80}
]:pcOfficeProfiles;}
function pcSC4Orientation(property,model){const w=model.bounds.maxX-model.bounds.minX,d=model.bounds.maxZ-model.bounds.minZ;return property.frontage>=w+2&&property.depth>=d+2?0:Math.PI/2;}
const pcSC4MaterialCache=new Map,pcSC4TextureCache=new Map;
const pcSC4Foundation=new Re({color:0x8a8b7c,roughness:.95});
let pcSC4Refresh=()=>{},pcSC4TexturesReady=0;
function pcSC4Material(model,view,angle){
  const key=model.id+':'+view+':'+angle.toFixed(6);
  if(pcSC4MaterialCache.has(key))return pcSC4MaterialCache.get(key);
  const material=new Qn({color:0xffffff,alphaTest:.5,side:2,toneMapped:false});
  material.userData.pcSC4={model,view,angle};
  pcSC4MaterialCache.set(key,material);return material;
}
function pcSC4LoadTexture(material){
  if(material.map)return;
  const {model,view}=material.userData.pcSC4,key=model.id+':'+view;
  let record=pcSC4TextureCache.get(key);
  if(!record){
    const texture=new ui;texture.colorSpace=hn;texture.flipY=false;texture.anisotropy=4;
    // Gutters and mipmaps stabilize high-frequency facade detail when zooming out.
    texture.generateMipmaps=true;texture.minFilter=1008;texture.magFilter=1006;
    record={texture,ready:false,materials:new Set};pcSC4TextureCache.set(key,record);
    if(typeof Image!=='undefined'){
      const image=new Image;
      image.onload=()=>{texture.image=image;texture.needsUpdate=true;record.ready=true;pcSC4TexturesReady++;for(const mat of record.materials)mat.needsUpdate=true;pcSC4Refresh();};
      image.onerror=()=>{record.error=true;console.error('Could not decode original SC4 building texture:',model.name,view);};
      image.src='data:image/png;base64,'+model.variants[view].png;
    }
  }
  record.materials.add(material);material.map=record.texture;material.needsUpdate=true;
}
function pcSC4Render(building,B,U,statistics){
  const model=pcSC4Model(building.office.catalogueId);if(!model)return false;
  B(Ql(building.footprint,building.ground-.18,building.y-building.ground+.18),pcSC4Foundation,building.id);
  const rotation=building.rotation+pcSC4Orientation(building,model),cos=Math.cos(rotation),sin=Math.sin(rotation),bounds=model.bounds;
  const cx=(bounds.minX+bounds.maxX)/2,cz=(bounds.minZ+bounds.maxZ)/2;
  // Original dimensions, not a nonuniform stretch or a rescaled tower.
  for(let view=0;view<model.variants.length;view++){
    const source=model.variants[view],positions=new Float32Array(source.positions.length);
    for(let i=0;i<positions.length;i+=3){const x=source.positions[i]-cx,z=source.positions[i+2]-cz;positions[i]=building.x+cos*x+sin*z;positions[i+1]=building.y+source.positions[i+1]-bounds.minY;positions[i+2]=building.z-sin*x+cos*z;}
    const geometry=new Ce;geometry.setAttribute('position',new pe(positions,3));geometry.setAttribute('uv',new pe(source.uv,2));geometry.computeVertexNormals();
    B(geometry,pcSC4Material(model,view,rotation),building.id);
  }
  statistics.windows+=Math.max(1,Math.floor((model.size[0]+model.size[2])*building.floors/3));
  return true;
}
const pcSC4CameraDirection=new q;
function pcSC4UpdateViews(group,camera){
  camera.getWorldDirection(pcSC4CameraDirection);
  const x=-pcSC4CameraDirection.x,z=-pcSC4CameraDirection.z;
  let changed=false;
  for(const mesh of group.children){
    const data=mesh.material?.userData.pcSC4;if(!data)continue;
    const {model,angle}=data,cos=Math.cos(angle),sin=Math.sin(angle);
    let best=0,score=-Infinity;
    for(let view=0;view<4;view++){const [dx,dz]=model.variants[view].direction,dot=x*(cos*dx+sin*dz)+z*(-sin*dx+cos*dz);if(dot>score){score=dot;best=view;}}
    let visible=data.view===best;
    if(visible){pcSC4LoadTexture(mesh.material);const record=pcSC4TextureCache.get(model.id+':'+best);if(typeof Image!=='undefined'&&!record.ready)visible=false;}
    if(mesh.visible!==visible){mesh.visible=visible;changed=true;}
  }
  return changed;
}
