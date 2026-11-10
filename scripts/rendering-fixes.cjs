// Deliberately small edits to the recovered bundle. Keep the v52 input immutable.
// This recipe also lets preservation checks reject unrelated runtime changes.
function applyRenderingFixes(source) {
  const replace = (before, after) => {
    if (source.split(before).length !== 2) throw Error(`Expected one patch location: ${before.slice(0,90)}`);
    source = source.replace(before, () => after);
  };
  replace('const v=H-x<150?A?.5:.75:1;', 'const v=1;');

  // Validate width/area as before, but only triangular plots use the old
  // erosion/dilation and acute-corner treatment. Other footprints stay sharp.
  replace('function dh(n,{minimumWidth:t=3,minimumArea:e=45,preserveBoundary:i=!1}={}){', `function dh(n,options={}){
    const {minimumWidth=3,minimumArea=45,preserveBoundary=false}=options;
    const frame=br(n);
    const clean=oa(ps.Clipper.SimplifyPolygons(frame.groups[0],ps.PolyFillType.pftNonZero),frame);
    return xn(clean).filter(part=>!part.holes.length).flatMap(part=>{
      const outer=yg(part.outer),paths=Te(outer);
      if(outer.length<3||sn(paths)<minimumArea||!Bo(paths,-minimumWidth/2).length)return [];
      return outer.length===3&&!preserveBoundary
        ? pcV52Footprint(paths,options)
        : [{...part,outer}];
    });
  }
  function pcV52Footprint(n,{minimumWidth:t=3,minimumArea:e=45,preserveBoundary:i=!1}={}){`);
  replace('i=Bo(e,-.15);return xn(Ee(e,Bo(i,.15))).filter(s=>!s.holes.length&&sn(Te(s.outer))>=45).map(s=>yg(s.outer))}', `i=xn(e);return i.filter(part=>!part.holes.length).flatMap(part=>{
    const outer=yg(part.outer);
    if(outer.length!==3)return sn(Te(outer))>=45?[outer]:[];
    const paths=Te(outer),inset=Bo(paths,-.15);
    return xn(Ee(paths,Bo(inset,.15))).filter(shape=>!shape.holes.length&&sn(Te(shape.outer))>=45).map(shape=>yg(shape.outer));
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
