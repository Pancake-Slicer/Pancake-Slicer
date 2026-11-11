// Soft paper colour and restrained fine linework. The image retains continuous
// tones: no posterisation, grain, temporal blending or black shadow contours.
vec3 pcComicFinish(vec3 colour, vec2 uv, sampler2D image, vec2 pixel) {
  vec3 weights=vec3(0.2126,0.7152,0.0722);
  float centre=dot(texture2D(image,uv).rgb,weights);
  float edge=0.0;
  edge=max(edge,abs(centre-dot(texture2D(image,uv+vec2(pixel.x,0.0)).rgb,weights)));
  edge=max(edge,abs(centre-dot(texture2D(image,uv-vec2(pixel.x,0.0)).rgb,weights)));
  edge=max(edge,abs(centre-dot(texture2D(image,uv+vec2(0.0,pixel.y)).rgb,weights)));
  edge=max(edge,abs(centre-dot(texture2D(image,uv-vec2(0.0,pixel.y)).rgb,weights)));
  float light=dot(colour,weights);
  vec3 painted=mix(vec3(light),colour,0.95);
  painted=painted*vec3(1.015,1.005,0.975)*0.98+vec3(0.012,0.014,0.011);
  // A local colour-aware pencil edge keeps windows and sunlit roofs readable.
  float ink=smoothstep(0.16,0.38,edge)*0.45;
  vec3 pencil=painted*vec3(0.52,0.55,0.54);
  return clamp(mix(painted,pencil,ink),0.0,1.0);
}
