// Crisp lighting bands retain the existing PBR textures, normals and shadows.
function pcCelPhysicalShader(shader) {
 const physical=Ne.lights_physical_pars_fragment.replace(
  'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );',
  'float pcSun = dot( geometryNormal, directLight.direction );\nfloat dotNL = pcSun <= 0.0 ? 0.0 : pcSun < 0.32 ? 0.20 : pcSun < 0.70 ? 0.56 : 1.0;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',physical)
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= 0.65;\nreflectedLight.directSpecular *= 0.35;\nreflectedLight.indirectSpecular *= 0.35;');
}
