// Original civic architecture. Uses the existing placement, terrain foundation,
// demolition, history and landmark renderer paths, without changing lot grids.
function pcCivicModel(id){
 const type=pcCivicById.get(id);if(!type)return null;const group=new Se;group.name=type.name;
 const colour={power:0x995a47,water:0x9dbab9,waste:0x7e9283,education:0xb57455,health:0xe1e2d9,police:0x7f99aa,fire:0xa74e3f,park:0x8ba971}[type.kind];
 const wall=Ji({color:colour}),trim=Ji({color:0xe7e1cd}),glass=Ji({color:0x42606d}),roof=Ji({color:0x748589}),metal=Ji({color:0xb7c3bc}),grass=Ji({color:0x86a767});
 const box=(w,h,d,x,y,z,m=wall)=>{const mesh=new ae(new mn(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const cylinder=(rt,rb,h,x,y,z,m=metal)=>{const mesh=new ae(new Dn(rt,rb,h,12),m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 box(type.lotWidth,.25,type.lotDepth,0,.125,0,trim);
 if(type.kind==='park'){
  box(type.lotWidth-1,.25,type.lotDepth-1,0,.38,0,grass);box(3,.08,type.lotDepth-2,0,.55,0,trim);box(type.lotWidth-2,.08,3,0,.56,0,trim);
  for(const x of [-10,10])for(const z of [-8,8]){cylinder(.3,.45,3,x,2,z,wall);const tree=new ae(new rl(3.6,7,5),grass);tree.position.set(x,5,z);tree.castShadow=true;group.add(tree);}box(5,.5,3,7,.9,1,wall);
 }else if(id==='civic-wind'){
  cylinder(.6,1.2,26,0,13.3,0,trim);const hub=cylinder(.8,.8,2,0,27,0,metal);hub.rotation.x=Math.PI/2;
  for(let blade=0;blade<3;blade++){const a=blade*Math.PI*2/3,mesh=box(.55,11,.25,Math.sin(a)*5.1,27+Math.cos(a)*5.1,1.1,trim);mesh.rotation.z=-a;}
 }else if(id==='civic-water'){
  for(const x of [-5,5])for(const z of [-5,5])box(.55,17,.55,x,9,z,metal);cylinder(7,6,7,0,21,0,wall);cylinder(0,7.2,2,0,25.5,0,roof);
 }else{
  const w=type.lotWidth*.74,d=type.lotDepth*.65,h=type.kind==='power'?12:type.height-4;
  box(w,h,d,0,.3+h/2,0);box(w+.8,.45,d+.8,0,h+.55,0,roof);box(w*.30,3,d*.35,w*.24,h+2.275,0,trim);
  for(let floor=0;floor<Math.max(1,Math.floor(h/4));floor++)for(let x=-w/2+3;x<w/2-1;x+=3.5){box(1.9,2.1,.12,x,2.4+floor*4,d/2+.07,glass);box(1.9,.15,.3,x,1.28+floor*4,d/2+.1,trim);}
  box(3.4,3,.15,0,1.8,d/2+.1,glass);box(5,.25,2,0,3.8,d/2+.8,trim);
  if(type.kind==='power'){for(const x of [-w*.30,w*.30]){cylinder(1.1,1.5,type.height-2,x,type.height/2+1,-d*.25);cylinder(1.25,1.25,2,x,type.height-1,-d*.25,wall);}for(const x of [-w*.25,0,w*.25])box(4,4,6,x,2.5,d*.62,metal);}
  if(type.kind==='water')for(const x of [-w*.2,w*.2])cylinder(4,4,8,x,4.5,-d*.5,wall);
  if(type.kind==='health'){box(4,.65,.2,0,h*.7,d/2+.2,trim);box(.65,4,.22,0,h*.7,d/2+.22,trim);}
  if(type.kind==='fire')for(const x of [-w*.25,w*.25])box(6,4.3,.2,x,2.5,d/2+.15,roof);
  if(type.kind==='waste')for(const x of [-w*.2,w*.2])box(5,2.5,7,x,1.6,d*.55,metal);
 }
 group.updateMatrixWorld(true);const outlines=[];group.traverse(mesh=>{if(mesh.isMesh){const edges=new Co(mesh.geometry,35);edges.applyMatrix4(mesh.matrixWorld);outlines.push(edges);}});
 if(outlines.length){const lines=new Vs(Ys(outlines),pcIllustrationInk());outlines.forEach(g=>g.dispose());lines.raycast=()=>{};group.add(lines);}
 group.userData.dimensions={height:type.height,roofHeight:type.height,totalHeight:type.height,width:type.lotWidth,depth:type.lotDepth,floors:type.floors};return group;
}
