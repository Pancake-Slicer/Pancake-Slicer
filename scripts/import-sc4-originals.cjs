// Read-only conversion of a local SimCity 4 installation. Game artwork stays local.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const {decodeImage}=require('./sc4-texture-decoder.cjs');
const normalise=s=>(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
const aliases={281:"Andrews' Fashion Centre",280:'Kenner Dinner Theater',367:'Farly Publishing',393:'Brickhaven Office Suite',298:'Sixth Floor Fashion Center',406:'Ferrrara Inc.',410:'Hourvitz Accounting'};
const boutique={284:'12x28_1Chi',283:'12x28_1NY',282:'12x28_1Hou',275:'24x24_1Chi',274:'24x24_1NY',273:'24x24_1Hou',289:'40x24_3Chi',288:'40x24_3NY',287:'40x24_3Hou',296:'14x14_4Chi',295:'14x14_4NY',294:'14x14_4Hou',301:'44x26_5Chi',300:'44x26_5NY',299:'44x26_5Hou'};
const tiles={Chicago:'Chi','New York':'NY',Houston:'Hou',Europa:'Euro'};
function triangles(indices,primitives){
 const out=[];
 for(const p of primitives){const sequence=indices.slice(p.first,p.first+p.numIndex);
  if(p.type===0)out.push(...sequence);
  else if(p.type===1)for(let i=2;i<sequence.length;i++)out.push(...(i%2?[sequence[i-1],sequence[i-2],sequence[i]]:[sequence[i-2],sequence[i-1],sequence[i]]));
  else if(p.type===2)for(let i=2;i<sequence.length;i++)out.push(sequence[0],sequence[i-1],sequence[i]);
  else throw Error('Unsupported S3D primitive '+p.type);
 }
 return out;
}
async function main(){
 const location=path.resolve(process.argv[2]||'C:/Program Files (x86)/Steam/steamapps/common/SimCity 4 Deluxe');
 const dependency=path.join(root,'.tools/sc4-import/node_modules');
 if(!fs.existsSync(path.join(dependency,'sc4/lib/core/index.js')))throw Error('Import tools missing. Install with: npm install --prefix .tools/sc4-import sc4@0.2.24 pngjs@7.0.0');
 const {DBPF}=await import(pathToFileURL(path.join(dependency,'sc4/lib/core/index.js')));
 const {PNG}=require(path.join(dependency,'pngjs'));
 const files=[1,2,3,4,5].map(n=>new DBPF(path.join(location,`SimCity_${n}.dat`)));
 files.push(new DBPF(path.join(location,'EP1.dat')));
 const locale=new DBPF(path.join(location,'SimCityLocale.DAT'));
 const find=key=>[locale,...[...files].reverse()].map(d=>d.find({type:key[0],group:key[1],instance:key[2]})).find(Boolean);
 const candidates=[];
 for(const e of files[0].findAll({type:0x6534284a})){
  const x=e.read(),name=x.get('ExemplarName')||'',model=x.get('ResourceKeyType1');
  if(!/^(CO|CS).*\$\$\$/.test(name)||!model||!x.get('OccupantSize'))continue;
  const key=x.get('UserVisibleNameKey'),display=key?find(key)?.read().value:null;
  candidates.push({name,display,key:Array.from(e.tgi),model,size:x.get('OccupantSize')});
 }
 const reference=require('../reference/sc4-commercial-wealth3.json'),models={},mapping=[];
 const textures=new Map;
 for(const file of files)for(const entry of file.findAll({type:0x7ab50e44})){
  // Maxis building textures use 1ABE787D; other groups must not shadow them.
  if(entry.tgi.group===0x1abe787d||!textures.has(entry.tgi.instance))textures.set(entry.tgi.instance,entry);
 }
 for(const referenceEntry of reference.entries){
  const possible=candidates.filter(c=>c.name.startsWith(referenceEntry.type==='office'?'CO':'CS')&&normalise(c.display)===normalise(aliases[referenceEntry.id]||referenceEntry.name));
  const filtered=possible.filter(c=>boutique[referenceEntry.id]?c.name.includes(boutique[referenceEntry.id]):c.name.includes(tiles[referenceEntry.tileset]));
  const match=filtered.length===1?filtered[0]:possible.length===1?possible[0]:null;
  if(!match)throw Error(`Ambiguous/missing original for ${referenceEntry.id}: ${referenceEntry.name}`);
  const base=match.model,variants=[],bounds={minX:Infinity,minY:Infinity,minZ:Infinity,maxX:-Infinity,maxY:-Infinity,maxZ:-Infinity};
  for(let rotation=0;rotation<4;rotation++){
   const modelKey=[base[0],base[1],((base[2]&0xffff0000)+0x400+rotation*0x10)>>>0],resource=find(modelKey);
   if(!resource)throw Error('Missing highest-detail view '+modelKey.join(','));
   const source=resource.read(),parts=[],images=[];
   for(const group of source.animations.groups){
    const block=group.blocks[0],verts=source.vertexGroups[block.vertex].vertices,indices=triangles(source.indexGroups[block.index],source.primGroups[block.prim]);
    const mat=source.materialGroups[block.material],textureId=mat.textures[0]?.id;
    if(!textureId)throw Error('S3D has no texture');
    const textureEntry=textures.get(textureId);if(!textureEntry)throw Error('Missing texture '+textureId.toString(16));
    const image=textureEntry.read().image,rgba=decodeImage(image);
    if(rgba.length!==image.width*image.height*4)throw Error('Bad FSH dimensions');
    let imageIndex=images.findIndex(i=>i.id===textureId);
    if(imageIndex<0){imageIndex=images.length;images.push({id:textureId,width:image.width,height:image.height,rgba});}
    const positions=[],uv=[];
    for(const index of indices){const v=verts[index];if(!v)throw Error('Invalid S3D vertex');
     // Maxis stores each view pre-rotated. Undo that rotation without rescaling.
     const [x,z]=[[v.x,v.z],[v.z,-v.x],[-v.x,-v.z],[-v.z,v.x]][rotation],point={x,y:v.y,z};
     positions.push(x,v.y,z);uv.push(v.u,v.v);
     for(const axis of ['X','Y','Z']){bounds['min'+axis]=Math.min(bounds['min'+axis],point[axis.toLowerCase()]);bounds['max'+axis]=Math.max(bounds['max'+axis],point[axis.toLowerCase()]);}
    }
    parts.push({imageIndex,positions,uv});
   }
   const cell=Math.max(...images.map(i=>Math.max(i.width,i.height)))+4,columns=Math.ceil(Math.sqrt(images.length)),rows=Math.ceil(images.length/columns);
   const atlas=new PNG({width:columns*cell,height:rows*cell});atlas.data.fill(0);
   for(let i=0;i<images.length;i++){
    const image=images[i],x=i%columns*cell+2,y=Math.floor(i/columns)*cell+2;
    // Duplicate a two-pixel gutter so linear sampling does not pull in a neighbour.
    for(let row=-2;row<image.height+2;row++)for(let col=-2;col<image.width+2;col++){
     const from=(Math.max(0,Math.min(image.height-1,row))*image.width+Math.max(0,Math.min(image.width-1,col)))*4,to=((y+row)*atlas.width+x+col)*4;
     image.rgba.copy(atlas.data,to,from,from+4);
    }
   }
   const positions=[],uv=[];let nx=0,nz=0;
   for(const part of parts){const image=images[part.imageIndex],x=part.imageIndex%columns*cell+2,y=Math.floor(part.imageIndex/columns)*cell+2;
    positions.push(...part.positions);
    // D3D UVs start at the top left. Runtime textures explicitly use flipY=false.
    for(let i=0;i<part.uv.length;i+=2)uv.push((x+part.uv[i]*image.width)/atlas.width,(y+part.uv[i+1]*image.height)/atlas.height);
    for(let i=0;i<part.positions.length;i+=9){const p=part.positions,ax=p[i+3]-p[i],ay=p[i+4]-p[i+1],az=p[i+5]-p[i+2],bx=p[i+6]-p[i],by=p[i+7]-p[i+1],bz=p[i+8]-p[i+2];nx+=ay*bz-az*by;nz+=ax*by-ay*bx;}
   }
   const length=Math.hypot(nx,nz);if(!length)throw Error('No view direction');
   const diagonal=Math.SQRT1_2,direction=[[diagonal,diagonal],[diagonal,-diagonal],[-diagonal,-diagonal],[-diagonal,diagonal]][rotation];
   variants.push({key:modelKey,positions,uv,direction,width:atlas.width,height:atlas.height,png:PNG.sync.write(atlas,{colorType:6,deflateLevel:9,deflateStrategy:0}).toString('base64'),textureIds:images.map(i=>i.id)});
  }
  models[referenceEntry.id]={id:referenceEntry.id,name:referenceEntry.name,sourceName:match.display,exemplar:match.key,resource:base,size:match.size,bounds,variants};
  mapping.push({id:referenceEntry.id,name:referenceEntry.name,exemplar:match.key,resource:base,size:match.size,sourceName:match.display});
  console.log(`Imported ${referenceEntry.id}: ${referenceEntry.name}`);
 }
 const output=path.join(root,'web/assets/sc4-originals.local.js');
 fs.writeFileSync(output,'globalThis.pcSC4Originals='+JSON.stringify({version:2,models})+';\n');
 fs.writeFileSync(path.join(root,'reference/sc4-original-mapping.json'),JSON.stringify({version:1,entries:mapping},null,2)+'\n');
 console.log(`Imported ${mapping.length} original buildings, four highest-detail views each. Local artwork: ${output} (${fs.statSync(output).size} bytes)`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={triangles,normalise};
