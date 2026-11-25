export function createStudy(T,ArchitectureBatch){
  // Metres, with +Z toward the street. Dimensions are inferred from the supplied view.
  const study = Object.freeze({
    curve: {x:-9, z:-17, rx:17.5, rz:26, roof:111, floors:26, lobby:15},
    core: [1,19,-18,-4.5,112],
    front: [-2,16,2,22,97.4],
    wing: [16,23,-16,17,75.8],
    base: [[-27,-21,-17,17,14],[-21,-2,-17,22,11.4],[-2,16,-6,22,11.4],[16,23,-16,17,9.2]]
  });
  const hash = (x,y) => ((Math.imul(x+611,73856093)^Math.imul(y+952,19349663))>>>0)%251/250;
  const mix = (a,b,t) => a+(b-a)*t;
  function texture(w,h,pixel){
    const data=new Uint8Array(w*h*4);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=(y*w+x)*4;
      data.set(pixel(x,y).map(value=>Math.max(0,Math.min(255,Math.round(value)))),i);
      data[i+3]=255;
    }
    const map=new T.DataTexture(data,w,h);
    map.colorSpace=T.SRGBColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    map.minFilter=T.LinearMipmapLinearFilter;
    map.generateMipmaps=true;
    map.anisotropy=8;
    map.needsUpdate=true;
    return map;
  }
  function createMaterials(){
    const glazing=texture(512,64,(x,y)=>{
      const index=x>>6,u=x%64,pane=u>>4;
      const seam=u%16<1 || u%16===15 || y<2 || y>61;
      if(seam)return [136,147,140];
      const n=19*(hash(index,pane)-.5)+8*(hash(x>>2,y>>2)-.5);
      const reflection=13*(y/63)+10*Math.sin(y/9+index*.8)*Math.sin(u/28);
      const horizon=y<18?-10:0;
      return [98+n+reflection+horizon,112+n+reflection+horizon,106+n+reflection+horizon];
    });
    const panels=texture(128,128,(x,y)=>{
      const n=8*(hash(x>>4,y>>4)-.5)+5*(hash(x,y)-.5);
      return [166+n,179+n,167+n];
    });
    const gravel=texture(128,128,(x,y)=>{
      const n=48*(hash(x,y)-.5)+18*(hash(x>>2,y>>2)-.5);
      return [123+n,119+n,113+n];
    });
    const paving=texture(128,128,(x,y)=>{
      const n=10*(hash(x>>2,y>>2)-.5)+(x%32===0||y%32===0?-18:0);
      return [186+n,174+n,160+n];
    });
    const fan=texture(64,64,(x,y)=>{
      const dx=x-31.5,dy=y-31.5,r=Math.hypot(dx,dy);
      const blade=Math.sin(8*Math.atan2(dy,dx)+r*.24)>.35;
      const value=r<4?107:r<25?(Math.abs(r%3)<.8?126:blade?94:60):156;
      return [value,value,value-2];
    });
    const make=(name,color,map=null,roughness=.82)=>new T.MeshStandardMaterial({name,color,map,roughness});
    return {
      panel:make('Sage enamel panels','#ffffff',panels),
      sidePanel:make('Cool sage side elevation','#b1bacf',panels),
      joint:make('Shadowed sage panel joints','#66736e'),
      reveal:make('Recessed metal window reveals','#738079'),
      glass:make('Muted green-grey opaque glazing','#ffffff',glazing,.49),
      silver:make('Silver floor edges and mullions','#b6c0ba'),
      frame:make('Dark grey perimeter frame','#666a7f'),
      gravel:make('Weathered roof gravel','#ffffff',gravel,.97),
      plant:make('Weathered zinc mechanical housings','#a2a29f'),
      dark:make('Roof vents and entry recesses','#41484a'),
      fan:make('Fan guards and impellers','#ffffff',fan),
      paving:make('Sidewalk slabs','#ffffff',paving,.98),
      road:make('Asphalt','#363633'),
      marking:make('Centre lines','#a89b63')
    };
  }

  const surround=(label,batch,draw)=>{
    const part=batch.begin(label);
    draw();
    batch.end(part);
  };
  const top=(batch,material,x0,x1,z0,z1,y,repeat=8)=>{
    batch.quad(material,[[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]],
      [0,0,(x1-x0)/repeat,0,(x1-x0)/repeat,(z1-z0)/repeat,0,(z1-z0)/repeat]);
  };
  const atlas=index=>[(index*64+.5)/512,(index*64+63.5)/512];
  const rect=([x0,x1,z0,z1])=>[[x0,z1],[x1,z1],[x1,z0],[x0,z0]];
  function facade(batch,a,b,lo,hi,bays,floors,style){
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]), pitch=length/bays, height=(hi-lo)/floors;
    const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
    const point=(u,y,n)=>[a[0]+dx*u-dz*n,y,a[1]+dz*u+dx*n];
    const face=(material,x0,x1,y0,y1,n,uv)=>batch.quad(material,
      [point(x0,y0,n),point(x1,y0,n),point(x1,y1,n),point(x0,y1,n)],uv);
    const beam=(material,x0,x1,y,n,depth,h)=>batch.beam(material,point(x0,y,n),point(x1,y,n),depth,h);
    const cladding=style==='wing' || (dz<-.9 && a[0]>0)?'sidePanel':'panel';
    face('joint',0,length,lo,hi,-.36);
    const entry=style==='entry', crown=style==='crown', service=style==='core', wing=style==='wing', blind=style==='blind';
    for(let floor=0;floor<floors;floor++){
      const y=lo+floor*height;
      for(let i=0;i<bays;i++){
        const left=i*pitch,right=left+pitch,c=(left+right)*.5;
        const opening=blind?0:service?(i===bays-2?pitch*.43:0):pitch*(entry?.83:crown?.88:wing?.62:.72);
        if(!opening){
          face(cladding,left+.028,right-.028,y+.024,y+height-.024,0);
          continue;
        }
        const bottom=y+(entry?.10:height*(crown?.055:.18)),head=y+height*(crown?.95:entry?.81:.80);
        const l=c-opening/2,r=c+opening/2;
        face(cladding,left+.028,l,y+.024,y+height-.024,0);
        face(cladding,r,right-.028,y+.024,y+height-.024,0);
        face(cladding,l,r,y+.024,bottom,0);
        face(cladding,l,r,head,y+height-.024,0);
        batch.quad('reveal',[point(l,bottom,0),point(r,bottom,0),point(r,bottom,-.35),point(l,bottom,-.35)]);
        batch.quad('reveal',[point(l,bottom,-.35),point(l,head,-.35),point(l,head,0),point(l,bottom,0)]);
        batch.quad('reveal',[point(r,bottom,0),point(r,head,0),point(r,head,-.35),point(r,bottom,-.35)]);
        batch.quad('reveal',[point(l,head,-.35),point(r,head,-.35),point(r,head,0),point(l,head,0)]);
        const [u0,u1]=atlas((i*3+floor*5+bays)%8);
        face('glass',l,r,bottom,head,-.34,[u0,0,u1,0,u1,1,u0,1]);
        beam('silver',l,r,mix(bottom,head,entry?.73:.58),-.28,.10,.10);
        if(!entry && !service && !crown)beam('reveal',l,r,mix(bottom,head,.34),-.29,.08,.06);
        if(entry){
          for(const x of [c-opening*.22,c,c+opening*.22]){
            const [xx,,zz]=point(x,0,-.23);
            batch.box('frame',xx,(bottom+head)/2,zz,.10,head-bottom,.10);
          }
          if(i===1||i===2){
            beam('frame',c-.84,c+.84,bottom+2.65,-.15,.12,.11);
            for(const off of [-.12,.12]){
              const [x,,z]=point(c+off,0,-.12);
              batch.box('silver',x,bottom+1.32,z,.045,.39,.055);
            }
          }
        }
      }
    }
  }
  function deck(batch,volume){
    const [x0,x1,z0,z1,y]=volume;
    top(batch,'gravel',x0,x1,z0,z1,y);
    const corners=rect(volume);
    for(let i=0;i<4;i++){
      const [x,z]=corners[i],[nx,nz]=corners[(i+1)%4];
      batch.beam('panel',[x,y+.26,z],[nx,y+.26,nz],.27,.52);
      batch.beam('silver',[x,y+.53,z],[nx,y+.53,nz],.33,.09);
    }
  }
  function rectangularVolume(batch,volume,y0,floors,bays,style){
    const outline=rect(volume);
    for(let i=0;i<4;i++)facade(batch,outline[i],outline[(i+1)%4],y0,volume[4],
      bays[i],floors,i===0?style:style==='core'?'blind':'wing');
    deck(batch,volume);
  }
  const {x:cx,z:cz,rx,rz,roof,floors,lobby}=study.curve;
  const curvePoint=(t,y,offset=0)=>[cx+(rx+offset)*Math.cos(t),y,cz+(rz+offset)*Math.sin(t)];
  // Equidistant façade modules on the ellipse. Each module has two rendered facets.
  function equalArc(count){
    const samples=512,cumulative=[0];
    for(let i=1;i<=samples;i++){
      const a=curvePoint(Math.PI*(i-1)/samples,0),b=curvePoint(Math.PI*i/samples,0);
      cumulative[i]=cumulative[i-1]+Math.hypot(b[0]-a[0],b[2]-a[2]);
    }
    let i=1;
    return Array.from({length:count+1},(_,j)=>{
      const distance=j*cumulative[samples]/count;
      while(i<samples && cumulative[i]<distance)i++;
      return Math.PI*(i-1+(distance-cumulative[i-1])/(cumulative[i]-cumulative[i-1]))/samples;
    });
  }
  function curvedTower(batch){
    const angles=equalArc(68),floor=(roof-lobby)/floors;
    const strip=(material,lo,hi,offset,uvFor)=>angles.slice(1).forEach((b,i)=>{
      const a=angles[i];
      batch.quad(material,[curvePoint(b,lo,offset),curvePoint(a,lo,offset),
        curvePoint(a,hi,offset),curvePoint(b,hi,offset)],uvFor?.(i));
    });
    const last=curvePoint(Math.PI,0),first=curvePoint(0,0);
    facade(batch,[first[0],first[2]],[last[0],last[2]],lobby,roof,10,floors,'wing');
    strip('dark',8,lobby,-.34);
    strip('reveal',lobby-.08,roof,-.085);
    for(let i=0;i<34;i+=2){
      const a=angles[2*i],b=angles[2*i+3];
      const [u0,u1]=atlas(i%8);
      batch.quad('glass',[curvePoint(b,9.7,-.15),curvePoint(a,9.7,-.15),curvePoint(a,14.8,-.15),curvePoint(b,14.8,-.15)],[u0,0,u1,0,u1,1,u0,1]);
      const [x,,z]=curvePoint(a,0,.15);
      batch.box('panel',x,12.3,z,.59,5.5,.57);
    }
    for(let n=0;n<floors;n++){
      const y=lobby+n*floor,crown=n>=floors-2;
      strip('glass',y+.36,y+floor,.0,i=>{
        const [u0,u1]=atlas((Math.floor(i/2)*5+n*3)%8);
        const mid=(u0+u1)/2;
        return i%2?[mid,0,u0,0,u0,1,mid,1]:[u1,0,mid,0,mid,1,u1,1];
      });
      const projection=crown?.61:.32, edge=y+(crown?.56:.29);
      strip('silver',y-.05,edge,projection);
      for(let i=0;i<angles.length-1;i++){
        const a=angles[i],b=angles[i+1];
        batch.quad('silver',[curvePoint(b,edge,projection),curvePoint(a,edge,projection),
          curvePoint(a,edge),curvePoint(b,edge)]);
      }
      for(let i=0;i<angles.length-1;i+=2){
        const [x,,z]=curvePoint(angles[i],0,.025);
        batch.box(crown?'silver':'reveal',x,y+(floor+.25)/2,z,crown?.20:.068,floor-.28,crown?.20:.068);
      }
    }
    strip('silver',roof-.23,roof+.44,.23);
    const center=[cx,roof,cz],map=([x,,z])=>[(x-cx)/7,(z-cz)/7];
    for(let i=0;i<angles.length-1;i++){
      const a=curvePoint(angles[i],roof),b=curvePoint(angles[i+1],roof);
      batch.quad('gravel',[center,b,a,a],[...map(center),...map(b),...map(a),...map(a)]);
    }
    batch.beam('silver',[cx-rx,roof+.29,cz],[cx+rx,roof+.29,cz],.34,.58);
  }

  // Continuous closed-section ribbon around the outer edge. Discrete beams bridge
  // the horizontal gap back to the slab, leaving daylight between each pair.
  function perimeterFrame(batch,anchors,rim,y,braces){
    const sides=(point,prev,next,width,height)=>{
      const dx=next[0]-prev[0],dz=next[2]-prev[2],d=Math.hypot(dx,dz);
      const x=dz/d*width/2,z=-dx/d*width/2;
      return [[point[0]+x,y+height/2,point[2]+z],[point[0]-x,y+height/2,point[2]-z],
        [point[0]-x,y-height/2,point[2]-z],[point[0]+x,y-height/2,point[2]+z]];
    };
    const rings=rim.map((p,i)=>sides(p,rim[Math.max(0,i-1)],rim[Math.min(i+1,rim.length-1)],.92,.47));
    for(let i=1;i<rings.length;i++)for(let j=0;j<4;j++){
      const k=(j+1)%4;
      batch.quad('frame',[rings[i-1][k],rings[i][k],rings[i][j],rings[i-1][j]]);
    }
    batch.quad('frame',rings[0]);
    batch.quad('frame',[...rings.at(-1)].reverse());
    for(const i of braces){
      batch.beam('frame',anchors[i],rim[i],.45,.39);
      const [x,base,z]=anchors[i];
      batch.box('silver',x,base-.17,z,.76,.58,.76);
    }
  }
  function curvedFrame(batch){
    const angles=equalArc(52).slice(8),y=roof+.98;
    const anchors=angles.map(t=>curvePoint(t,roof+.35,-.24));
    const rim=angles.map(t=>curvePoint(t,y,3.1));
    // Rounded turn from the semicircle to the straight rear run.
    for(let i=1;i<=6;i++){
      const t=Math.PI*i/12;
      rim.push([cx-rx-3.1*Math.cos(t),y,cz-3.1*Math.sin(t)]);
      anchors.push([cx-rx+.20,roof+.35,cz+.19]);
    }
    for(let i=1;i<=9;i++){
      const x=mix(cx-rx,cx+rx-1.4,i/9);
      rim.push([x,y,cz-3.1]);
      anchors.push([x,roof+.35,cz+.22]);
    }
    for(let i=1;i<=6;i++){
      const t=Math.PI*i/12,x=cx+rx-1.4;
      rim.push([x+2*Math.sin(t),y,cz-1.1-2*Math.cos(t)]);
      anchors.push([x,roof+.35,cz+.20]);
    }
    const rearStart=angles.length+5;
    const rearBraces=Array.from({length:10},(_,i)=>rearStart+i);
    perimeterFrame(batch,anchors,rim,y,[...angles.keys()].filter(i=>i%4===0).concat(rearBraces,rim.length-1));
  }
  function frontFrame(batch){
    const y=study.front[4]+1.22,a=[],r=[];
    const pair=(x,z,xx,zz)=>{a.push([x,y-.87,z]);r.push([xx,y,zz]);};
    pair(-1.82,3,-4.1,3);
    pair(-1.82,9,-4.1,9);
    pair(-1.82,15,-4.1,15);
    pair(-1.82,21,-4.1,22);
    for(let i=1;i<=4;i++){
      const t=Math.PI*i/8;
      pair(-1.82,21.72,-1.8-2.3*Math.cos(t),22+3.9*Math.sin(t));
    }
    for(const x of [2,6,10,14,15.8])pair(x,21.75,x,25.9);
    for(let i=1;i<=4;i++){
      const t=Math.PI*i/8;
      pair(15.82,21.78,15.8+2.3*Math.sin(t),22+3.9*Math.cos(t));
    }
    for(const z of [19,15,11,7,3])pair(15.82,z,18.1,z);
    pair(18.78,-5.4,20.9,-5.4);
    for(const z of [-8.6,-12,-15])pair(18.78,z,21.8,z);
    for(let i=1;i<=8;i++){
      const t=Math.PI*i/16;
      pair(18.72,-15.8,19.1+2.7*Math.cos(t),-15-2.7*Math.sin(t));
    }
    perimeterFrame(batch,a,r,y,[0,1,2,3,7,8,9,10,11,12,16,17,18,19,20,21,22,23,24,32]);
  }
  function cylinder(batch,material,x,z,y,height,radius){
    for(let i=0;i<14;i++){
      const a=i*2*Math.PI/14,b=(i+1)*2*Math.PI/14;
      const p=(t,h)=>[x+radius*Math.cos(t),h,z+radius*Math.sin(t)];
      batch.quad(material,[p(b,y),p(a,y),p(a,y+height),p(b,y+height)]);
      batch.triangle(material,[[x,y+height,z],p(b,y+height),p(a,y+height)]);
    }
  }
  function ac(batch,x,z,y,wide=false){
    const size=wide?3.08:2.08;
    batch.box('dark',x,y+.11,z,size+.16,.22,size+.16);
    batch.box('plant',x,y+(wide?.40:.59),z,size,wide?.52:.9,size);
    top(batch,'fan',x-size*.47,x+size*.47,z-size*.47,z+size*.47,y+(wide?.67:1.05),size*.94);
    if(!wide){
      batch.box('dark',x,y+.53,z+size*.506,size*.74,.30,.04);
      for(const dx of [-.29,.29])batch.beam('plant',[x+dx,y+.45,z+size/2],
        [x+dx,y+.16,z+size/2+.47],.12,.13);
    }
  }
  function equipment(batch){
    for(const x of [-21,-17.8,-14.6,-8,-4.8,-1.6])ac(batch,x,-12,roof);
    for(const z of [-.1,3.25])ac(batch,-10,z,roof,true);
    for(const [x,z] of [[-20,-5.7],[-17.8,-4.9],[-5,-3],[-2.8,-2.3]])
      cylinder(batch,'plant',x,z,roof,.70,.52);
    for(const x of [-8.3,-6.1]){
      const z=-14.2;
      batch.box('dark',x,roof+.15,z,.53,.30,.52);
      cylinder(batch,'plant',x,z,roof+.30,5.9,.092);
      for(const y of [roof+2.25,roof+3.2])batch.beam('plant',[x-.52,y,z],[x+.52,y,z],.073,.069);
    }
    for(const x of [5.4,10,14.6])ac(batch,x,-8.8,study.core[4],true);
    for(const x of [1.4,4.8,8.2,11.6])ac(batch,x,13.6,study.front[4]);
    for(const x of [8.6,12.1])ac(batch,x,8.1,study.front[4],true);
    for(const x of [-17.6,-14.6,-11.6,-8.6,-5.6])ac(batch,x,18.7,study.base[1][4]);
    ac(batch,-23.9,13.8,study.base[0][4],true);
  }
  function buildStudy(materials=createMaterials()){
    const batch=new ArchitectureBatch;
    surround('Stepped street podium',batch,()=>{
      const front=[-21,16,-17,22,11.4];
      facade(batch,[-21,22],[16,22],0,5.45,5,1,'entry');
      facade(batch,[-21,22],[-2,22],5.45,11.4,4,1,'office');
      facade(batch,[16,22],[16,-17],0,11.4,7,2,'wing');
      facade(batch,[16,-17],[-21,-17],0,11.4,8,2,'wing');
      deck(batch,front);
      rectangularVolume(batch,study.base[0],0,3,[1,6,1,6],'core');
      rectangularVolume(batch,study.base[3],0,2,[2,5,2,5],'wing');
    });
    surround('Curved curtain wall and main roof',batch,()=>curvedTower(batch));
    surround('Recessed right wing',batch,()=>rectangularVolume(batch,study.wing,9.2,13,[1,6,1,6],'wing'));
    surround('Front tower',batch,()=>{
      const [x0,x1,z0,z1,y]=study.front,outline=rect(study.front),crown=y-4.1;
      for(let i=0;i<4;i++)facade(batch,outline[i],outline[(i+1)%4],5.45,crown,4,14,i===0?'office':'wing');
      facade(batch,[x0+.35,z1-.62],[x1-.35,z1-.62],crown,y,4,1,'crown');
      facade(batch,[x1-.42,z1-.62],[x1-.42,z0],crown,y,4,1,'crown');
      facade(batch,[x0+.3,z0],[x0+.3,z1],crown,y,4,1,'wing');
      facade(batch,[x1-.42,z0],[x0+.3,z0],crown,y,4,1,'wing');
      for(let i=0;i<=4;i++)batch.box('silver',mix(x0+.16,x1-.16,i/4),crown+2.08,z1-.12,.53,4.16,.67);
      for(let i=1;i<=4;i++)batch.box('silver',x1-.10,crown+2.08,mix(z1-.16,z0+.16,i/4),.60,4.16,.49);
      batch.beam('silver',[x0,crown,z1],[x1,crown,z1],.79,.31);
      batch.beam('silver',[x1,crown,z1],[x1,crown,z0],.79,.31);
      deck(batch,study.front);
    });
    surround('Rear service core',batch,()=>rectangularVolume(batch,study.core,0,26,[5,3,5,3],'core'));
    surround('Curved roof perimeter frame',batch,()=>curvedFrame(batch));
    surround('Lower rounded roof perimeter frame',batch,()=>frontFrame(batch));
    surround('Mechanical equipment and twin antennas',batch,()=>equipment(batch));
    const model=batch.finish(materials,'Curved Postmodern Office · fixed benchmark');
    model.userData.reviewOnly=true;
    model.userData.triangles=model.children.reduce((sum,mesh)=>sum+mesh.geometry.index.count/3,0);
    return model;
  }
  function buildSite(materials){
    const batch=new ArchitectureBatch;
    top(batch,'paving',-30,28,-22,26,-.02,7.2);
    batch.box('road',-1,-.15,31.5,59,.16,7.8);
    for(const z of [31.35,31.62])batch.box('marking',-1,-.066,z,58.85,.009,.07);
    return batch.finish(materials,'Study sidewalk and street');
  }
  return {study,createMaterials,buildStudy,buildSite};
}
