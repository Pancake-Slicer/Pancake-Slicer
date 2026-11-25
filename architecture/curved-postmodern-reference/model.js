export function createStudy(T,ArchitectureBatch){
  // Metres, with +Z toward the street. Dimensions are inferred from the supplied view.
  const storey=96/26, lobby=15, floors=28;
  const roof=lobby+floors*storey, coreFront=3.5;
  const study = Object.freeze({
    curve: {x:-9, z:-12.5, rx:17.5, rz:29.15, roof, floors, lobby},
    core: [1,19,-8.5,coreFront,roof+1],
    front: [-2,16,coreFront,22,97.4],
    wing: [16,23,-6.5,17,75.8],
    base: [[-27,-21,-17,17,14],[-21,-2,-17,22,11.4],[-2,16,-6,22,11.4],[16,23,-16,17,9.2]]
  });
  const {x:cx,z:cz,rx,rz}=study.curve;
  const streetZ=study.front[3], frontageBays=4;
  const frontage=[
    [study.base[1][0],study.front[0]],
    [study.front[0],study.front[1]]
  ];
  const datum=n=>lobby+n*storey;
  const sill=.36, headroom=storey-.37;
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
  function facade(batch,a,b,lo,hi,bays,style,doorBay=-1){
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]), pitch=length/bays;
    const dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
    const point=(u,y,n)=>[a[0]+dx*u-dz*n,y,a[1]+dz*u+dx*n];
    const face=(material,x0,x1,y0,y1,n,uv)=>batch.quad(material,
      [point(x0,y0,n),point(x1,y0,n),point(x1,y1,n),point(x0,y1,n)],uv);
    const cladding=style==='wing' || (dz<-.9 && a[0]>0)?'sidePanel':'panel';
    face('joint',0,length,lo,hi,-.36);
    const entry=style==='entry', crown=style==='crown', service=style==='core', wing=style==='wing', blind=style==='blind';
    const first=entry?0:Math.floor((lo-lobby)/storey+1e-7);
    const end=entry?1:Math.ceil((hi-lobby)/storey-1e-7);
    for(let floor=first;floor<end;floor++){
      const y=entry?lo:datum(floor);
      const bottom=entry?lo+.10:y+sill, head=entry?lo+(hi-lo)*.81:y+headroom;
      const rowLo=Math.max(lo,y),rowHi=entry?hi:Math.min(hi,y+storey);
      if(rowHi-rowLo<=.048)continue;
      const fullWindow=bottom>rowLo && head<rowHi;
      for(let i=0;i<bays;i++){
        const left=i*pitch,right=left+pitch,c=(left+right)*.5;
        const opening=blind || !fullWindow?0:service?(i===bays-2?pitch*.43:0):pitch*(entry?.83:crown?.88:wing?.62:.72);
        if(!opening){
          face(cladding,left+.028,right-.028,rowLo+.024,rowHi-.024,0);
          continue;
        }
        const l=c-opening/2,r=c+opening/2;
        face(cladding,left+.028,l,rowLo+.024,rowHi-.024,0);
        face(cladding,r,right-.028,rowLo+.024,rowHi-.024,0);
        face(cladding,l,r,rowLo+.024,bottom,0);
        face(cladding,l,r,head,rowHi-.024,0);
        batch.quad('reveal',[point(l,bottom,0),point(r,bottom,0),point(r,bottom,-.35),point(l,bottom,-.35)]);
        batch.quad('reveal',[point(l,bottom,-.35),point(l,head,-.35),point(l,head,0),point(l,bottom,0)]);
        batch.quad('reveal',[point(r,bottom,0),point(r,head,0),point(r,head,-.35),point(r,bottom,-.35)]);
        batch.quad('reveal',[point(l,head,-.35),point(r,head,-.35),point(r,head,0),point(l,head,0)]);
        const [u0,u1]=atlas((i*3+floor*5+bays)%8);
        const glazed=(x0,x1,y0,y1)=>face('glass',x0,x1,y0,y1,-.34,[u0,0,u1,0,u1,1,u0,1]);
        const revolving=entry && i===doorBay;
        if(revolving){
          const halfDoor=1.19, canopy=2.88;
          glazed(l,c-halfDoor,bottom,canopy);
          glazed(c+halfDoor,r,bottom,canopy);
          glazed(l,r,canopy,head);
          const [x,,z]=point(c,0,-.33);
          surround('Revolving entrance doors',batch,()=>revolvingDoor(batch,x,z));
        }else{
          glazed(l,r,bottom,head);
        }
        const transom=entry?3.33:mix(bottom,head,.58);
        face('silver',l,r,transom-.05,transom+.05,-.28);
        if(!entry && !service && !crown){
          const lower=mix(bottom,head,.34);
          face('reveal',l,r,lower-.03,lower+.03,-.29);
        }
        if(entry){
          const divisions=revolving?[c-opening*.29,c+opening*.29]:[c-opening*.22,c,c+opening*.22];
          for(const x of divisions){
            const [xx,,zz]=point(x,0,-.23);
            batch.box('frame',xx,(bottom+head)/2,zz,.10,head-bottom,.10);
          }
        }
      }
    }
  }
  function deck(batch,volume,parapet=[...rect(volume),rect(volume)[0]]){
    const [x0,x1,z0,z1,y]=volume;
    top(batch,'gravel',x0,x1,z0,z1,y);
    for(let i=1;i<parapet.length;i++){
      const [x,z]=parapet[i-1],[nx,nz]=parapet[i];
      batch.beam('panel',[x,y+.26,z],[nx,y+.26,nz],.27,.52);
      batch.beam('silver',[x,y+.53,z],[nx,y+.53,nz],.33,.09);
    }
  }
  function rectangularVolume(batch,volume,y0,bays,style){
    const outline=rect(volume);
    for(let i=0;i<4;i++)facade(batch,outline[i],outline[(i+1)%4],y0,volume[4],
      bays[i],i===0?style:style==='core'?'blind':'wing');
    deck(batch,volume);
  }
  const curvePoint=(t,y,offset=0)=>[cx+(rx+offset)*Math.cos(t),y,cz+(rz+offset)*Math.sin(t)];
  const curveFrontAt=x=>cz+rz*Math.sqrt(1-((x-cx)/rx)**2);
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
    const officeBays=34, officeFacets=2, lobbyFacets=2*officeFacets;
    const angles=equalArc(officeBays*officeFacets);
    const mullionOffset=.025;
    const strip=(material,lo,hi,offset,uvFor)=>angles.slice(1).forEach((b,i)=>{
      const a=angles[i];
      batch.quad(material,[curvePoint(b,lo,offset),curvePoint(a,lo,offset),
        curvePoint(a,hi,offset),curvePoint(b,hi,offset)],uvFor?.(i));
    });
    const last=curvePoint(Math.PI,0),first=curvePoint(0,0);
    facade(batch,[first[0],first[2]],[last[0],last[2]],lobby,roof,10,'wing');
    strip('dark',8,lobby,-.34);
    strip('reveal',lobby-.08,roof,-.085);
    // Sample one clear atlas pane per curved opening. The modelled mullions
    // define the visible bay rhythm on both levels.
    const paneUV=(variant,facet,facets)=>{
      const u=(variant*64+3)/512, span=10/512;
      const a=u+span*facet/facets, b=a+span/facets;
      return [b,0,a,0,a,1,b,1];
    };
    strip('glass',9.7,14.8,-.12,i=>paneUV(Math.floor(i/lobbyFacets)%8,i%lobbyFacets,lobbyFacets));
    surround('Curved lobby columns',batch,()=>{
      for(let i=0;i<angles.length;i+=lobbyFacets){
        const [x,,z]=curvePoint(angles[i],0,mullionOffset);
        batch.box('panel',x,12.3,z,.59,5.5,.57);
      }
    });
    for(let n=0;n<floors;n++){
      const y=datum(n),crown=n>=floors-2;
      strip('glass',y+sill,y+headroom,0,i=>
        paneUV((Math.floor(i/officeFacets)*5+n*3)%8,i%officeFacets,officeFacets));
      const projection=crown?.61:.32, edge=y+(crown?.56:.29);
      strip('reveal',y+headroom,y+storey,0);
      strip('silver',y-.05,edge,projection);
      for(let i=0;i<angles.length-1;i++){
        const a=angles[i],b=angles[i+1];
        batch.quad('silver',[curvePoint(b,edge,projection),curvePoint(a,edge,projection),
          curvePoint(a,edge),curvePoint(b,edge)]);
      }
      surround('Curved office mullions',batch,()=>{
        for(let i=0;i<angles.length;i+=officeFacets){
          const [x,,z]=curvePoint(angles[i],0,mullionOffset);
          batch.box(crown?'silver':'reveal',x,y+(sill+headroom)/2,z,crown?.20:.09,headroom-sill,crown?.20:.09);
        }
      });
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
    const projection=3.1,y=roof+.98;
    const junction=Math.asin((coreFront+.18-cz)/(rz+projection));
    const angles=[junction,...equalArc(52).filter(t=>t>junction)];
    const anchors=angles.map(t=>curvePoint(t,roof+.35,-.24));
    const rim=angles.map(t=>curvePoint(t,y,projection));
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
    const join=curveFrontAt(-1.82);
    for(let i=0;i<3;i++){
      const z=mix(join,21,i/3);
      pair(-1.82,z,-4.1,z);
    }
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
    for(const z of [19,15.5,12,8.5,5])pair(15.82,z,18.1,z);
    pair(18.78,coreFront-.6,20.9,coreFront-.6);
    const returnZ=study.core[2]+2;
    for(let i=1;i<=3;i++){
      const z=mix(coreFront-.6,returnZ,i/3);
      pair(18.78,z,21.8,z);
    }
    for(let i=1;i<=8;i++){
      const t=Math.PI*i/16;
      pair(18.72,returnZ-.8,19.1+2.7*Math.cos(t),returnZ-2.7*Math.sin(t));
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
  function revolvingDoor(batch,x,z){
    const radius=1.17, canopy=2.88;
    cylinder(batch,'frame',x,z,canopy-.16,.16,radius+.045);
    cylinder(batch,'silver',x,z,.018,.07,radius+.015);
    batch.box('silver',x,1.40,z,.12,2.64,.12);
    const p=(angle,y,r=radius)=>[x+r*Math.cos(angle),y,z+r*Math.sin(angle)];
    const glassPair=(a,b,c,d)=>{
      const [u0,u1]=atlas(2);
      batch.quad('glass',[a,b,c,d],[u0,0,u1,0,u1,1,u0,1]);
      batch.quad('glass',[b,a,d,c],[u1,0,u0,0,u0,1,u1,1]);
    };
    // Two curved side screens leave the street and lobby openings clear.
    for(const side of [0,Math.PI]){
      for(let i=0;i<6;i++){
        const a=side+(i-3)*Math.PI/15,b=a+Math.PI/15;
        glassPair(p(a,.10),p(b,.10),p(b,2.70),p(a,2.70));
        batch.beam('frame',p(a,.13),p(b,.13),.05,.075);
      }
      for(const angle of [side-Math.PI/5,side,side+Math.PI/5]){
        const [px,,pz]=p(angle,0);
        batch.box('silver',px,1.40,pz,.065,2.67,.065);
      }
    }
    for(let i=0;i<4;i++){
      const angle=Math.PI/4+i*Math.PI/2;
      glassPair(p(angle,.14,.075),p(angle,.14,1.10),p(angle,2.67,1.10),p(angle,2.67,.075));
      for(const y of [.18,1.25,2.64])batch.beam('frame',p(angle,y,.08),p(angle,y,1.10),.052,.062);
      const [px,,pz]=p(angle,0,1.10);
      batch.box('silver',px,1.40,pz,.06,2.55,.06);
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
    for(const x of [-21,-17.8,-14.6,-8,-4.8,-1.6])ac(batch,x,cz+5,roof);
    for(const offset of [16.9,20.25])ac(batch,-10,cz+offset,roof,true);
    for(const [x,offset] of [[-20,11.3],[-17.8,12.1],[-5,14],[-2.8,14.7]])
      cylinder(batch,'plant',x,cz+offset,roof,.70,.52);
    for(const x of [-8.3,-6.1]){
      const z=cz+2.8;
      batch.box('dark',x,roof+.15,z,.53,.30,.52);
      cylinder(batch,'plant',x,z,roof+.30,5.9,.092);
      for(const y of [roof+2.25,roof+3.2])batch.beam('plant',[x-.52,y,z],[x+.52,y,z],.073,.069);
    }
    for(const x of [5.4,10,14.6])ac(batch,x,coreFront-4.3,study.core[4],true);
    for(const x of [1.4,4.8,8.2,11.6])ac(batch,x,13.6,study.front[4]);
    for(const x of [8.6,12.1])ac(batch,x,8.1,study.front[4],true);
    for(const x of [-17.6,-14.6,-11.6,-8.6,-5.6])ac(batch,x,18.7,study.base[1][4]);
    ac(batch,-23.9,13.8,study.base[0][4],true);
  }
  function buildStudy(materials=createMaterials()){
    const batch=new ArchitectureBatch;
    surround('Stepped street podium',batch,()=>{
      const front=[-21,16,-17,22,11.4];
      const storefrontBays=frontageBays/2;
      for(const [i,[left,right]] of frontage.entries()){
        facade(batch,[left,streetZ],[right,streetZ],0,5.45,storefrontBays,'entry',i===0?1:0);
      }
      const [[left,split],[,right]]=frontage;
      facade(batch,[left,streetZ],[split,streetZ],5.45,11.4,frontageBays,'office');
      surround('Street-facing podium piers',batch,()=>{
        const pierTop=front[4];
        for(const x of [(left+split)/2,split,(split+right)/2]){
          batch.box('panel',x,pierTop/2,streetZ,.48,pierTop,.22);
        }
      });
      facade(batch,[16,22],[16,-17],0,11.4,7,'wing');
      facade(batch,[16,-17],[-21,-17],0,11.4,8,'wing');
      deck(batch,front);
      rectangularVolume(batch,study.base[0],0,[1,6,1,6],'core');
      rectangularVolume(batch,study.base[3],0,[2,5,2,5],'wing');
    });
    surround('Curved curtain wall and main roof',batch,()=>curvedTower(batch));
    surround('Recessed right wing',batch,()=>rectangularVolume(batch,study.wing,9.2,[1,6,1,6],'wing'));
    surround('Front tower',batch,()=>{
      const [x0,x1,z0,z1,y]=study.front;
      const crown=datum(Math.floor((y-lobby)/storey)-1), crownHeight=y-crown;
      // The terrace meets the core along its back and passes into the curve at the inside corner.
      const curveJoin=curveFrontAt(x0);
      facade(batch,[x0,z1],[x1,z1],5.45,crown,frontageBays,'office');
      facade(batch,[x1,z1],[x1,z0],5.45,crown,5,'wing');
      facade(batch,[x0,curveJoin],[x0,z1],5.45,crown,3,'wing');
      facade(batch,[x0+.35,z1-.62],[x1-.35,z1-.62],crown,y,4,'crown');
      facade(batch,[x1-.42,z1-.62],[x1-.42,z0],crown,y,5,'crown');
      facade(batch,[x0+.3,curveJoin],[x0+.3,z1],crown,y,3,'wing');
      for(let i=0;i<=4;i++)batch.box('silver',mix(x0+.16,x1-.16,i/4),crown+crownHeight/2,z1-.12,.53,crownHeight,.67);
      for(let i=1;i<=5;i++)batch.box('silver',x1-.10,crown+crownHeight/2,mix(z1-.16,z0+.16,i/5),.60,crownHeight,.49);
      batch.beam('silver',[x0,crown,z1],[x1,crown,z1],.79,.31);
      batch.beam('silver',[x1,crown,z1],[x1,crown,z0],.79,.31);
      deck(batch,study.front,[[x0,curveJoin],[x0,z1],[x1,z1],[x1,z0]]);
    });
    surround('Rear service core',batch,()=>rectangularVolume(batch,study.core,0,[5,3,5,3],'core'));
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
