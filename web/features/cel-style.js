// Bright illustrated architecture: gently grouped sunlight, generous sky fill,
// matte highlights, and the existing real cast shadows and facade textures.
function pcCelPhysicalShader(shader) {
 const physical=Ne.lights_physical_pars_fragment.replace(
  'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );',
  'float pcSun = dot( geometryNormal, directLight.direction );\nfloat pcDay = max(pcSun,0.0);\nfloat pcBands = 0.38 + 0.30*smoothstep(0.25,0.39,pcDay) + 0.32*smoothstep(0.64,0.78,pcDay);\nfloat dotNL = pcSun <= 0.0 ? 0.0 : mix(pcDay,pcBands,0.45);');
 shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',physical)
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= 0.90;\nreflectedLight.directSpecular *= 0.12;\nreflectedLight.indirectSpecular *= 0.12;');
}

function pcIllustratedMix(hex,target,amount){
 const a=parseInt(hex.slice(1),16),b=parseInt(target.slice(1),16);
 return '#'+[16,8,0].map(shift=>Math.round(((a>>shift)&255)*(1-amount)+((b>>shift)&255)*amount).toString(16).padStart(2,'0')).join('');
}
function pcIllustratedPalette(design){return {
 stone:pcIllustratedMix(design.colours.stone,'#f0ebdf',.43),
 glass:pcIllustratedMix(design.colours.glass,'#b9d8d0',.32),
 trim:pcIllustratedMix(design.colours.trim,'#ecebdf',.45)
};}

let pcIllustrationLineMaterial;
function pcIllustrationInk(){
 if(!pcIllustrationLineMaterial)pcIllustrationLineMaterial=new _i({color:0x4d554e,transparent:true,opacity:.62,depthWrite:false,toneMapped:false});
 return pcIllustrationLineMaterial;
}
