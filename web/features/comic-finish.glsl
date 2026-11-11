// Four neighbouring colour samples add ink to the existing FXAA pass. No
// additional scene render, depth buffer, geometry copies or temporal history.
vec3 pcComicFinish(vec3 colour, vec2 uv, sampler2D image, vec2 pixel) {
  vec3 weights=vec3(0.2126,0.7152,0.0722);
  float centre=dot(texture2D(image,uv).rgb,weights);
  float edge=0.0;
  edge=max(edge,abs(centre-dot(texture2D(image,uv+vec2(pixel.x,0.0)).rgb,weights)));
  edge=max(edge,abs(centre-dot(texture2D(image,uv-vec2(pixel.x,0.0)).rgb,weights)));
  edge=max(edge,abs(centre-dot(texture2D(image,uv+vec2(0.0,pixel.y)).rgb,weights)));
  edge=max(edge,abs(centre-dot(texture2D(image,uv-vec2(0.0,pixel.y)).rgb,weights)));
  float light=dot(colour,weights);
  vec3 saturated=mix(vec3(light),colour,1.22);
  float band=floor(clamp(light,0.0,1.0)*10.0+0.5)/10.0;
  saturated*=mix(1.0,band/max(light,0.025),0.40);
  float ink=smoothstep(0.12,0.30,edge)*0.83;
  return clamp(mix(saturated,vec3(0.035,0.045,0.065),ink),0.0,1.0);
}
