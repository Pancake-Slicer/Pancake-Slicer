import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';
import {tiers,floorBase,validateSpecification} from '../spec.mjs';
import {ASSEMBLY_VERSION,lobbyProfile,lobbyGlazingProfile,paneModule} from './systems.mjs';
import {resolveRoofOverlaps} from './roof-surfaces.js';

// Small, shared static sky/horizon reflection; no scene capture or per-pane maps.
function lobbyReflection(){
 const width=128,height=64,data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const v=y/(height-1),horizon=Math.exp(-Math.pow((v-.48)/.18,2)),sky=Math.max(0,1-v*1.6),az=x/width*Math.PI*2;
  const skyline=v>.49&&v<.56+.05*Math.sin(Math.floor(x/9)*2.7),shade=skyline?-.15:0;
  const level=.30+.22*sky+.24*horizon+.025*Math.cos(az*3)+shade,i=(y*width+x)*4;
  data[i]=Math.round(255*(level-.045));data[i+1]=Math.round(255*level);data[i+2]=Math.round(255*(level+.055));data[i+3]=255;
 }
 const map=new T.DataTexture(data,width,height,T.RGBAFormat);map.mapping=T.EquirectangularReflectionMapping;map.colorSpace=T.SRGBColorSpace;map.minFilter=map.magFilter=T.LinearFilter;map.needsUpdate=true;map.name='Shared restrained lobby sky reflection';return map;
}
export function createAssemblyMaterials(base,{lobbyGlazing='opaque-reflective'}={}){
 const glazing=lobbyGlazingProfile(lobbyGlazing);
 const m={};const standard=(color,roughness,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 for(let i=0;i<3;i++){m['vision'+i]=base.glass.clone();Object.assign(m['vision'+i],{roughness:.27+i*.035,metalness:.16,opacity:.88+i*.025,transparent:true,depthWrite:false});m['vision'+i].color.set([0xd5e0e7,0xdde5e9,0xd2dfe6][i]);}
 m.spandrel=standard(0x485560,.47,.18);m.podiumSpandrel=standard(0x68777e,.55,.15);
 m.aluminum=standard(0x9daab0,.4,.55);m.edge=standard(0xc2cbd0,.32,.6);m.backing=standard(0x252f37,.92);
 if(glazing.interior){m.lobbyGlass=new T.MeshPhysicalMaterial({color:0xc5dde3,roughness:.16,metalness:.04,opacity:.27,transparent:true,depthWrite:false,reflectivity:.35});m.doorGlass=m.lobbyGlass.clone();m.doorGlass.opacity=.18;}
 else{m.lobbyGlass=standard(0x536d80,.26,.48);m.lobbyGlass.envMap=lobbyReflection();m.lobbyGlass.envMapIntensity=.65;m.doorGlass=m.lobbyGlass.clone();m.doorGlass.color.set(0x59788b);m.doorGlass.roughness=.23;}
 m.lobbyGlass.userData.lobbyGlazing=lobbyGlazing;
 m.lobbyGlassAlt=m.lobbyGlass.clone();m.lobbyGlassAlt.color.multiplyScalar(.96);m.lobbyGlassAlt.roughness+=.025;
 m.floor=standard(0x999b98,.72);m.ceiling=standard(0xd3d7d1,.9);m.wall=standard(0x939a96,.85);m.desk=standard(0x4b5d64,.65,.12);m.threshold=standard(0x465159,.68);
 m.light=standard(0xe8e9dd,.6);m.light.emissive.set(0xd4d9c2);m.light.emissiveIntensity=.8;
 return m;
}

// Roofs are retained from the exact baseline triangles, not regenerated.
export function roofTriangle(mesh,indices,levels,spec){
 if(mesh.name==='roof')return true;const p=mesh.geometry.attributes.position,ys=indices.map(i=>p.getY(i)),low=Math.min(...ys),high=Math.max(...ys),top=floorBase(spec,spec.storeys);
 if(low>=top-.0001)return true;
 return levels.slice(0,-1).some(level=>{const y=floorBase(spec,level.end);return low>=y-.0001&&high<=y+.731;});
}
function retainRoofs(original,spec){
 const group=new T.Group,levels=tiers(spec);
 for(const mesh of original.children){const g=mesh.geometry,p=[],uv=[],normal=[],indices=[];for(let i=0;i<g.index.count;i+=3){const source=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];if(!roofTriangle(mesh,source,levels,spec))continue;for(const j of source){indices.push(p.length/3);p.push(g.attributes.position.getX(j),g.attributes.position.getY(j),g.attributes.position.getZ(j));normal.push(g.attributes.normal.getX(j),g.attributes.normal.getY(j),g.attributes.normal.getZ(j));uv.push(g.attributes.uv.getX(j),g.attributes.uv.getY(j));}}
  if(!indices.length)continue;const geometry=new T.BufferGeometry;geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeBoundingBox();geometry.computeBoundingSphere();const copy=new T.Mesh(geometry,mesh.material);copy.name='retained-roof:'+mesh.name;copy.castShadow=copy.receiveShadow=true;group.add(copy);
 }return resolveRoofOverlaps(group);
}

export function buildEnhanced(spec,original,materials,{lobbyType='C'}={}){
 validateSpecification(spec);const compatible=lobbyProfile(spec,lobbyType),profile={...compatible,canopy:spec.podium?compatible.canopy:spec.entrance==='canopy'},columnOffset=spec.columns?.2:-.035,canopyProjection=!spec.podium&&spec.entrance==='canopy'?.84:.18,lobbyGlazing=materials.lobbyGlass.userData.lobbyGlazing,glazing=lobbyGlazingProfile(lobbyGlazing),b=new ArchitectureBatch,levels=tiers(spec),audit={windows:[],corners:[],lobby:null},roof=retainRoofs(original,spec);let openTop=null;
 const box=(key,x,y,z,w,h,d)=>{const bucket=b.bucket(key),start=bucket.i.length,base=bucket.p.length/3;b.box(key,x,y,z,w,h,d);if(openTop!==null&&Math.abs(y+h/2-openTop)<1e-7){let write=start;for(let i=start;i<bucket.i.length;i+=3)if(b.unit.attributes.normal.getY(bucket.i[i]-base)<.9)for(let j=0;j<3;j++)bucket.i[write++]=bucket.i[i+j];bucket.i.length=write;}};
 const uvFor=module=>{const u0=(module.atlasCol*128+1)/512,u1=(module.atlasCol*128+127)/512,v0=(512-(module.atlasRow*170+169))/512,v1=(512-(module.atlasRow*170+1))/512;return[u0,v0,u1,v0,u1,v1,u0,v1];};
 for(const tier of levels){
  const width=tier.widthBays*spec.bay,depth=tier.depthBays*spec.bay,base=floorBase(spec,tier.start),top=floorBase(spec,tier.end),isPodium=tier.start===0&&!!spec.podium;openTop=top;
  const faces=[{n:[0,1],u:[1,0],length:width,offset:depth/2,count:tier.widthBays},{n:[1,0],u:[0,-1],length:depth,offset:width/2,count:tier.depthBays},{n:[0,-1],u:[-1,0],length:width,offset:depth/2,count:tier.widthBays},{n:[-1,0],u:[0,1],length:depth,offset:width/2,count:tier.depthBays}];
  faces.forEach(({n,u,length,offset,count},side)=>{
   const point=(t,y,v=0)=>[u[0]*t+n[0]*(offset+v),y,u[1]*t+n[1]*(offset+v)],strip=(key,t,y,w,h,v,d)=>box(key,...point(t,y,v),n[0]?d:w,h,n[0]?w:d);
   const curtainBase=Math.max(base,spec.lobbyHeight);if(top>curtainBase)strip('backing',0,(curtainBase+top)/2,length,top-curtainBase,-.78,.04);
   for(let floor=Math.max(1,tier.start);floor<tier.end;floor++){
    const y=floorBase(spec,floor),spandrel=isPodium?'podiumSpandrel':'spandrel';strip(spandrel,0,y+spec.spandrel/2,length,spec.spandrel,-.07,.12);
    for(const rail of [y+spec.spandrel+.035,y+spec.floorHeight-.035]){strip('aluminum',0,rail,length,.055,.025,.09);strip('edge',0,rail+.019,length,.012,.073,.018);}
    if(spec.visionRail)strip('aluminum',0,y+spec.spandrel+.1+(spec.floorHeight-spec.spandrel-.2)/2,length,.026,-.025,.045);
    for(let col=0;col<count;col++){
     const t=-length/2+(col+.5)*spec.bay,module=paneModule(spec,side,floor,col),bottom=y+spec.spandrel+.1,ceiling=y+spec.floorHeight-.1;
     b.quad('vision'+module.variant,[point(t-spec.bay/2+.045,bottom,-.12),point(t+spec.bay/2-.045,bottom,-.12),point(t+spec.bay/2-.045,ceiling,-.12),point(t-spec.bay/2+.045,ceiling,-.12)],uvFor(module));b.windowBays++;audit.windows.push({side,floor,col,bottom,top:ceiling,tier:tier.start,module});
    }
   }
   for(let col=1;col<count;col++){
    const t=-length/2+col*spec.bay,accent=spec.rhythm==='paired'&&col%spec.structuralBays===0,profileWidth=accent?.105:spec.mullion;
    strip('aluminum',t,(base+top)/2,profileWidth,top-base,.02,accent?.22:.13);for(const sign of [-1,1])strip('edge',t+sign*(profileWidth/2-.006),(base+top)/2,.009,top-base,accent?.136:.091,.012);
   }
   if(tier.start===0){
    // Close the head joint down to the glazing/frame, including the recessed
    // entrance soffit: a shallow fascia alone left a through-building slot.
    const entryHalf=profile.entranceBays*spec.bay/2,headDepth=side===0?profile.recess:.46;
    strip('podiumSpandrel',0,spec.lobbyHeight-.275,length,.55,(.05-headDepth)/2,headDepth+.05);
    for(let col=0;col<count;col++){
     const t=-length/2+(col+.5)*spec.bay,inEntry=side===0&&Math.abs(t)<entryHalf,isDoor=inEntry&&Math.abs(t)<spec.bay,plane=inEntry?-profile.recess:-.46,bottom=isDoor?.12:.22,ceiling=spec.lobbyHeight-.55;
     const glassKey=isDoor?'doorGlass':!glazing.interior&&Math.floor(col/spec.structuralBays)%3===1?'lobbyGlassAlt':'lobbyGlass';
     b.quad(glassKey,[point(t-spec.bay/2+.055,bottom,plane),point(t+spec.bay/2-.055,bottom,plane),point(t+spec.bay/2-.055,ceiling,plane),point(t-spec.bay/2+.055,ceiling,plane)]);b.windowBays++;
     for(const dx of [-spec.bay/2+.035,spec.bay/2-.035])strip('aluminum',t+dx,(bottom+ceiling)/2,.045,ceiling-bottom,plane+.025,.075);
     strip('aluminum',t,3.03,spec.bay-.07,.055,plane+.025,.075);
     strip('aluminum',t,ceiling+.025,spec.bay-.07,.05,plane+.025,.075);
     if(isDoor){strip('aluminum',t,1.58,.04,2.92,plane+.025,.075);for(const dx of [-.16,.16])strip('edge',t+dx,1.43,.025,.6,plane+.095,.04);}
     if(!inEntry)strip('threshold',t,.11,spec.bay,.22,-.1,.25);
    }
    if(profile.columns)for(let col=0;col<=count;col++)if(col%spec.structuralBays===0){const t=-length/2+col*spec.bay;if(side===0&&Math.abs(t)<entryHalf)continue;strip('aluminum',t,spec.lobbyHeight/2,.19,spec.lobbyHeight,columnOffset,.3);}
    if(side===0){
     // Threshold keeps the original decorated envelope; canopy projects inside
     // the recessed entry instead of enlarging the approved footprint.
     strip('threshold',0,.06,spec.bay*2,.12,.12,.5);
     if(profile.columns)for(const sign of [-1,1])strip('aluminum',sign*entryHalf,spec.lobbyHeight/2,.19,spec.lobbyHeight,columnOffset,.3);
     for(const sign of [-1,1])strip('aluminum',sign*entryHalf,2.3,.085,4.6,-profile.recess/2,profile.recess);
     if(profile.canopy)strip('aluminum',0,3.78,profile.entranceBays*spec.bay+.2,.13,(-profile.recess+canopyProjection)/2,profile.recess+canopyProjection);
    }
   }
  });
  for(const sx of [-1,1])for(const sz of [-1,1]){const x=sx*(width/2-.025),z=sz*(depth/2-.025);box('aluminum',x,(base+top)/2,z,.25,top-base,.25);audit.corners.push({x,z,base,top});}
 }
 openTop=null;
 const podium=levels[0],w=podium.widthBays*spec.bay,d=podium.depthBays*spec.bay,lobbyDepth=Math.min(6,d*.24),ceiling=spec.lobbyHeight-.52;
 if(glazing.interior){
 box('floor',0,.04,0,w-.4,.08,d);box('ceiling',0,ceiling+.06,0,w-.4,.12,d-.4);
 // An opaque shallow core gives all four lobby elevations real backing.
 box('wall',0,(.08+ceiling)/2,0,w-lobbyDepth*2,ceiling-.08,d-lobbyDepth*2);
 const rear=d/2-lobbyDepth,deskZ=rear+2.0;box('desk',0,.61,deskZ,spec.bay*2,1.06,1.05);box('aluminum',0,1.17,deskZ,spec.bay*2+.14,.10,1.17);
 for(let i=-5;i<=5;i++)box('aluminum',i*spec.bay/6,2.45,rear+.07,.035,3.9,.14);
 for(const x of [-spec.bay*2,0,spec.bay*2])box('light',x,ceiling-.025,d/2-lobbyDepth/2,spec.bay*1.2,.035,.12);
 }else{
 // Only exterior paving/soffit inside the existing entrance recess remain.
 const z=d/2-profile.recess/2;
 box('entryPaving',0,.04,z,profile.entranceBays*spec.bay,.08,profile.recess);
 box('entrySoffit',0,ceiling+.06,z,profile.entranceBays*spec.bay,.12,profile.recess);
 }
 audit.lobby={type:lobbyType,glazing:lobbyGlazing,interior:glazing.interior,floor:0,ceiling:ceiling-.0,doorPlane:d/2-profile.recess,entranceWidth:profile.entranceBays*spec.bay,doorTop:3.03,...(glazing.interior?{interiorRear:d/2-lobbyDepth,deskTop:1.22}:{}),eyeHeight:1.6};
 for(const bucket of b.buckets.values()){const used=new Set(bucket.i);if(used.size===bucket.p.length/3)continue;const p=[],uv=[],remap=new Map;for(let i=0;i<bucket.p.length/3;i++)if(used.has(i)){remap.set(i,p.length/3);p.push(...bucket.p.slice(i*3,i*3+3));uv.push(...bucket.uv.slice(i*2,i*2+2));}bucket.p=p;bucket.uv=uv;bucket.i=bucket.i.map(i=>remap.get(i));}
 const group=b.finish({...materials,entryPaving:materials.floor,entrySoffit:materials.ceiling},'07B · Enhanced podium lobby');for(const mesh of roof.children.slice())group.add(mesh);
 group.userData={spec:structuredClone(spec),assemblyVersion:ASSEMBLY_VERSION,massing:structuredClone(original.userData.volumes),audit,approval:'unreviewed-no-publication'};return group;
}

export function modelMetrics(model){
 const geometries=new Set,materials=new Set,textures=new Set;let triangles=0,meshes=0,geometryBytes=0;
 model.traverse(mesh=>{if(!mesh.isMesh)return;meshes++;triangles+=mesh.geometry.index?.count/3||mesh.geometry.attributes.position.count/3;if(!geometries.has(mesh.geometry)){geometries.add(mesh.geometry);geometryBytes+=Object.values(mesh.geometry.attributes).reduce((n,a)=>n+a.array.byteLength,0)+(mesh.geometry.index?.array.byteLength||0);}materials.add(mesh.material);for(const v of Object.values(mesh.material))if(v?.isTexture)textures.add(v);});
 return {meshes,triangles,materialCount:materials.size,geometryBytes,textureCount:textures.size,textureBytes:Math.round([...textures].reduce((n,t)=>n+(t.image?.width||0)*(t.image?.height||0)*4*4/3,0))};
}
