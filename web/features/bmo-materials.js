// Visual-only host material layer. The locked BMO generator, specifications,
// vertex buffers, UVs, fitting and neighbourhood optimizer remain unchanged.
const pcBmoPaletteVersion='1.0.0';
const pcBmoPaletteNames=['Light silver / blue-grey','Medium grey / slate','Warm grey / neutral','Dark charcoal / subdued blue-grey'];
let pcBmoMaterialReviewMode='harmonized';
function pcBmoPalettes(){
 const reference=id=>pcIllustratedPalette(pcSC4Model(id)),light=reference(407),medium=reference(403),warm=reference(414),mix=pcIllustratedMix;
 // All endpoints come from actual catalogue palette/material definitions.
 const metal='#777e7f',dark='#394448';
 return [
  {id:'light-silver',name:pcBmoPaletteNames[0],reference:407,cladding:mix(light.trim,metal,.10),glass:mix(light.glass,metal,.18)},
  {id:'medium-grey',name:pcBmoPaletteNames[1],reference:403,cladding:mix(medium.stone,metal,.32),glass:mix(medium.glass,dark,.32)},
  {id:'warm-grey',name:pcBmoPaletteNames[2],reference:414,cladding:mix(warm.stone,metal,.16),glass:mix(warm.glass,metal,.25)},
  {id:'dark-charcoal',name:pcBmoPaletteNames[3],reference:403,cladding:mix(dark,medium.stone,.24),glass:mix(medium.glass,dark,.56)}
 ];
}
function pcBmoMaterialLibrary(base){
 const palettes=pcBmoPalettes(),owned=new Set;
 const clone=(source,name,color,roughness,metalness)=>{const material=source.clone();material.name=name;material.color.set(color);material.roughness=roughness;material.metalness=metalness;material.transparent=false;material.opacity=1;material.depthWrite=true;pcRebuiltLighting(material);owned.add(material);return material;};
 // Common catalogue finishes are shared by all four palettes. Glass0/1/2
 // deliberately share one opaque glazing material per palette, softening
 // the former floor-tone striping and keeping the active pool to13 materials.
 const common={edge:clone(base.edge,'BMO · shared trim',pcIllustratedMix(pcIllustratedPalette(pcSC4Model(403)).trim,'#777e7f',.24),.65,.06),corner:clone(base.corner,'BMO · shared charcoal',pcIllustratedMix('#394448','#777e7f',.38),.75,0),metal:clone(base.metal,'BMO · catalogue metal','#777e7f',.55,.32),roof:clone(base.roof,'BMO · catalogue roof','#767a78',.94,0),plant:clone(base.plant,'BMO · rooftop housings','#777e7f',.75,.10)};
 const sets=palettes.map(p=>{const silver=clone(base.silver,'BMO · '+p.id+' cladding',p.cladding,.65,.06),glass=clone(base.glass0,'BMO · '+p.id+' glazing',p.glass,.25,.20);glass.envMapIntensity=.25;return {...common,silver,glass0:glass,glass1:glass,glass2:glass};});
 function index(record){const explicit=record.materialPalette;if(explicit==='original')return -1;if(Number.isInteger(explicit)&&explicit>=0&&explicit<4)return explicit;return pcOfficeHash(String(record.seed)+':bmo-palette-v1')%4;}
 return {palettes,owned,sets,index,apply(model,record,mode=pcBmoMaterialReviewMode){const i=mode==='original'?-1:index(record),materials=i<0?base:sets[i];for(const mesh of model.children){if(mesh.isMesh){if(!materials[mesh.name])throw Error('Unknown BMO material slot '+mesh.name);mesh.material=materials[mesh.name];}}model.userData.bmoPalette={version:pcBmoPaletteVersion,index:i,name:i<0?'Original dark BMO':palettes[i].name};return model;},dispose(){for(const m of owned)m.dispose();owned.clear();}};
}
