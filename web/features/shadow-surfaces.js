// Bias follows the fitted shadow texel in world metres. A fixed depth offset
// under-corrects filtered self-shadowing as the camera includes a wider city.
// Keep the existing normal offset, without its old sub-texel .25m ceiling.
function pcShadowSurfaceBias(texel,near,far){
 return {normalBias:Math.max(.025,texel*.5),bias:-Math.max(.015,texel)/Math.max(1,far-near)};
}
