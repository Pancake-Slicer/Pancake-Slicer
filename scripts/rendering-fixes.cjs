// Deliberately small edits to the recovered bundle. Keep the v52 input immutable.
// This recipe also lets preservation checks reject unrelated runtime changes.
function applyRenderingFixes(source) {
  const replace = (before, after) => {
    if (source.split(before).length !== 2) throw Error(`Expected one patch location: ${before.slice(0,90)}`);
    source = source.replace(before, () => after);
  };
  const fs=require('node:fs'),path=require('node:path');
  const cel=fs.readFileSync(path.join(__dirname,'../web/features/cel-style.js'),'utf8');
  const finish=fs.readFileSync(path.join(__dirname,'../web/features/comic-finish.glsl'),'utf8');
  replace('const Lg=Object.freeze([.24,.58,1])',cel+'\nconst Lg=Object.freeze([.42,.72,1])');
  replace('function $w(n=1.35)', 'function $w(n=.75)');
  replace('function ph(n,{width:t=1.35}', 'function ph(n,{width:t=.75}');
  replace('color:2436144,side:ci', 'color:5067868,side:ci');
  replace('ph($,{width:1.1})','ph($,{width:.4})');
  replace('t.fog=new Md(Oi.sky,45e-5)', 't.fog=new Md(0xc6d5cb,12e-5)');
  replace('t.add(new fy(14937329,6912142,.65))','t.add(new fy(0xf0efdc,0x8b9c83,.80))');
  replace('const s=new gy(16773336,2.15)','const s=new gy(0xfff2da,1.90)');
  replace('s.position.set(-260,480,240),s.castShadow=!0,s.shadow.mapSize.set(i,i)', 's.position.set(-260,480,240),s.castShadow=!0,s.shadow.intensity=.65,s.shadow.radius=1.8,s.shadow.mapSize.set(i,i)');
  replace('cel-physical-sun-horizon-v1','cel-physical-sun-horizon-illustrated-v3');
  // Real architectural creases, batched once per neighborhood chunk. Texture
  // grain, triangle diagonals and shadows do not become black contours.
  replace('for(const[J,at]of X){let ut=0;', 'const pcLines=[];for(const[J,at]of X){let ut=0;');
  replace('St.userData.buildingRanges=tt,D.add(St)}const j=new ke', 'St.userData.buildingRanges=tt,D.add(St);if(J.userData.pcRebuiltLighting){const lines=new Co(nt,35);if(lines.attributes.position.count)pcLines.push(lines);else lines.dispose()}}if(pcLines.length){const lines=new Vs(Ys(pcLines),pcIllustrationInk());pcLines.forEach(g=>g.dispose());lines.name="Illustrated architectural creases";lines.raycast=()=>{};lines.renderOrder=1;D.add(lines)}const j=new ke');
  replace('void main() {\n\n\t\t\tgl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );',finish+'\nvoid main() {\n\n\t\t\tvec4 pcAA=ApplyFXAA(tDiffuse,resolution.xy,vUv);\n gl_FragColor=vec4(pcComicFinish(pcAA.rgb,vUv,tDiffuse,resolution.xy),pcAA.a);');
  replace('const v=H-x<150?A?.5:.75:1;', 'const v=1;');
  // Keep a stable, screen-resolution image rather than supersampling every
  // full-scene redraw at up to four times the display's CSS pixel count.
  replace('nt=Math.min(window.devicePixelRatio||1,2);', 'nt=1;');
  replace('const Pt=Math.min(A?2:4,b.capabilities.maxSamples);', 'const Pt=Math.min(2,b.capabilities.maxSamples);');
  replace('shadowSize:Math.min(A?2048:4096,b.capabilities.maxTextureSize)', 'shadowSize:Math.min(A?1024:2048,b.capabilities.maxTextureSize)');
  replace('let Ze=performance.now();return b.setAnimationLoop', 'let pcShadowViewAt=-Infinity;let Ze=performance.now();return b.setAnimationLoop');
  replace('I.updateView(ut,yt.target,X),_&&(x=H,_=!1);', `(_||H-x<150)?(H-pcShadowViewAt>=100&&(I.updateView(ut,yt.target,X),pcShadowViewAt=H)):(I.updateView(ut,yt.target,X),pcShadowViewAt=H),_&&(x=H,_=!1);`);

  // Rendered road fillets must not become rounded building plot boundaries.
  // Use an independent mitered setback mask for development, without touching
  // the visible roads or their render caches.
  replace('function Yb(n){', `const pcDevelopmentMasks=new WeakMap;
    function pcRoundTrianglePlots(mask){
      const fill=[];
      for(const part of xn(mask))for(const hole of part.holes){
        const outline=yg(hole);
        if(outline.length!==3)continue;
        const plot=Te(outline),inset=cn(plot,-1.5);
        if(!inset.length)continue;
        const rounded=Ee(plot,cn(inset,1.5));
        fill.push(...je(plot,rounded));
      }
      return fill.length?ve([...mask,...fill]):mask;
    }
    function Yb(n){`);
  replace('e=Nd.get(n);if(e&&e.roads.length===t.length', 'e=pcDevelopmentMasks.get(n);if(e&&e.roads.length===t.length');
  replace('r=(c,u)=>cn(cn(ve(c),u),-u),o=ve([', 'r=(c,u)=>Bo(Bo(ve(c),u),-u),o=ve([');
  replace('l=cn(a,1.5);return _g(n,t,l)}', 'l=pcRoundTrianglePlots(Bo(a,1.5));return _g(n,t,l,pcDevelopmentMasks)}');
  replace('function _g(n,t,e){', 'function _g(n,t,e,cache=Nd){');
  replace('return Nd.set(n,s),s}function Hb', 'return cache.set(n,s),s}function Hb');
  // Subtracting rounded buffers around an earlier building can also curve its
  // neighbours. These are collision/setback masks, not rendered geometry.
  replace('mask:Hc.get(N)??cn(Te(N.footprint),.025)', 'mask:Hc.get(N)??Bo(Te(N.footprint),.025)');
  replace('Hc.set(N,cn(Te(N.footprint),.025))', 'Hc.set(N,Bo(Te(N.footprint),.025))');

  // Rounded boundaries are decided at the enclosed PLOT level above. Never
  // infer a triangular plot from an individual subdivided building footprint.
  const oldFootprint=source.slice(source.indexOf('function dh(n,'),source.indexOf('function Pp(n,'));
  replace(oldFootprint, `function dh(n,options={}){
    const {minimumWidth=3,minimumArea=45}=options;
    const frame=br(n);
    const clean=oa(ps.Clipper.SimplifyPolygons(frame.groups[0],ps.PolyFillType.pftNonZero),frame);
    return xn(clean).filter(part=>!part.holes.length).flatMap(part=>{
      const outer=yg(part.outer),paths=Te(outer);
      if(outer.length<3||sn(paths)<minimumArea||!Bo(paths,-minimumWidth/2).length)return [];
      return [{...part,outer}];
    });
  }`);
  replace('i=Bo(e,-.15);return xn(Ee(e,Bo(i,.15))).filter(s=>!s.holes.length&&sn(Te(s.outer))>=45).map(s=>yg(s.outer))}', `i=xn(e);return i.filter(part=>!part.holes.length).flatMap(part=>{
    const outer=yg(part.outer);
    return sn(Te(outer))>=45?[outer]:[];
  })}`);

  replace('function Ql(n,t,e){', `function Ql(n,t,e,{top=true,bottom=true}={}){`);
  replace('a.setXY(l,(Math.abs(o.getY(l))>.5?c:c*-o.getZ(l)+u*o.getX(l))/2.4,r.getY(l)/1.2)}return s}', `a.setXY(l,(Math.abs(o.getY(l))>.5?c:c*-o.getZ(l)+u*o.getX(l))/2.4,(Math.abs(o.getY(l))>.5?u:r.getY(l)*2)/2.4)}
    if(top&&bottom)return s;
    const attributes=Object.keys(s.attributes),data=Object.fromEntries(attributes.map(name=>[name,[]]));
    for(let face=0;face<r.count;face+=3){
      const normal=o.getY(face);
      if(!top&&normal>.5||!bottom&&normal<-.5)continue;
      for(let vertex=face;vertex<face+3;vertex++)for(const name of attributes){
        const attribute=s.attributes[name];
        for(let component=0;component<attribute.itemSize;component++)data[name].push(attribute.array[vertex*attribute.itemSize+component]);
      }
    }
    const result=new Ce;
    for(const name of attributes)result.setAttribute(name,new pe(data[name],s.attributes[name].itemSize));
    s.dispose();return result;
  }`);
  replace('B(Ql(J.footprint,J.ground-.18,tt-J.ground+.18),f,J.id),B(Ql(J.footprint,tt,J.height),ut,J.id),B(Ql(J.footprint,nt,.16),g,J.id);', 'B(Ql(J.footprint,J.ground-.18,tt-J.ground+.18,{top:false}),f,J.id),B(Ql(J.footprint,tt,J.height,{top:false,bottom:false}),ut,J.id),B(Ql(J.footprint,nt,.16,{bottom:false}),g,J.id);');
  return source;
}
module.exports = { applyRenderingFixes };
if(require.main===module){
  require('./assemble-runtime.cjs');
}
