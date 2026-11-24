import * as T from '../engine.js';
import {ArchitectureBatch} from '../batched-architecture.js';

// Fixed reconstruction from the supplied single view. Units are metres.
export const STUDY = Object.freeze({
  width: 60, depth: 32, podiumWidth: 59, podiumDepth: 38,
  podiumHeight: 19, storeys: 29, floorHeight: 3.18, crownRise: 10.4,
  reviewOnly: true
});

function texture(width, height, paint) {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    rgba.set([...paint(x, y), 255], (y * width + x) * 4);
  }
  const map = new T.DataTexture(rgba, width, height);
  map.colorSpace = T.SRGBColorSpace;
  map.wrapS = map.wrapT = T.RepeatWrapping;
  map.generateMipmaps = true;
  map.minFilter = T.LinearMipmapLinearFilter;
  map.magFilter = T.LinearFilter;
  map.anisotropy = 8;
  map.needsUpdate = true;
  return map;
}

export function createMaterials() {
  const material = (name, color, roughness, map = null, metalness = 0) =>
    new T.MeshStandardMaterial({name, color, roughness, map, metalness});
  const noise = (x, y) => ((Math.imul(x + 23, 73856093) ^ Math.imul(y + 7, 19349663)) >>> 0) % 17 - 8;
  const ribbon = glass => texture(256, 256, (x, y) => {
    const u = x % 64, v = y % 64, n = noise(x >> 6, y >> 6);
    if (v < 30) {
      const r = (v < 3 ? -13 : v > 26 ? 8 : 0) + (u < 2 ? -16 : 0);
      return [187, 184, 188].map(channel => channel + r + n * .48);
    }
    const r = (u < 2 ? 19 : 0) + (v < 32 ? 11 : 0) + n * .45;
    return glass.map(channel => channel + r);
  });
  const jade = texture(512, 512, (x, y) => {
    const v = y / 511, u = x / 512;
    const reflection = 48 * Math.exp(-((v - .28) ** 4) / .00085) + 29 * Math.exp(-((v - .72) ** 4) / .0012);
    const bx = x % 128 - 64, by = y % 128 - 64;
    const trace = Math.exp(-((Math.hypot(bx * .82, by) - 23) ** 2) / 62);
    const plant = Math.exp(-(bx ** 2 + (by + 7) ** 2) / 230);
    const variation = 4 * Math.sin(u * 37 + v * 13) + noise(x >> 4, y >> 4) * .33;
    return [61 + reflection * 1.74 + variation - trace * 14 - plant * 9,
      127 + reflection * 1.41 + variation - trace * 18 - plant * 10,
      108 + reflection * 1.64 + variation - trace * 12 - plant * 15].map(value => Math.min(255, value));
  });
  const podium = texture(256, 256, (x, y) => {
    const n = noise(x >> 5, y >> 5) * .7 - (x % 64 < 2 || y % 64 < 2 ? 8 : 0);
    return [176 + n, 174 + n, 177 + n];
  });
  const paving = texture(128, 128, (x, y) => {
    const n = noise(x >> 4, y >> 4) * .55 - (x % 32 < 2 || y % 32 < 2 ? 17 : 0);
    return [200 + n, 194 + n, 187 + n];
  });
  return {
    blue: material('Deep blue ribbons', '#ffffff', .65, ribbon([52, 82, 118])),
    teal: material('Teal ribbons', '#ffffff', .65, ribbon([52, 108, 109])),
    jade: material('Jade vault glazing', '#ffffff', .67, jade, .04),
    silver: material('Slim silver framing', '#e0e7e5', .65, null, .07),
    end: material('Solid blue-grey end framing', '#747d94', .72),
    stone: material('Silver-grey podium cladding', '#ffffff', .88, podium),
    deck: material('Tile paving', '#ffffff', .92, paving),
    terrace: material('Recessed terrace paving', '#bbb5bd', .92, paving),
    door: material('Recessed entrance glazing', '#3b5a68', .50),
    road: material('Asphalt', '#404141', .96),
    paint: material('Road centre lines', '#c4a966', .9)
  };
}

const point = ([x, z], y) => [x, y, z];

function towerRing(width, depth, squareOuter = false) {
  const x = width / 2, z = depth / 2, bevel = squareOuter ? 0 : 4;
  return [[-x + bevel,-z],[x - bevel,-z],[x,-z + 4],[x,z - 7.2],[x - bevel,z - 3.4],
    [19.8,z - 3.4],[14.1,z + 1],[ -14.1,z + 1],[-19.8,z - 3.4],
    [-x + bevel,z - 3.4],[-x,z - 7.2],[-x,-z + 4]];
}

function walls(batch, bottom, top, y0, y1, bandHeight, surfaces, floorStart = 0) {
  let u = 0;
  for (let i = 0; i < bottom.length; i++) {
    const j = (i + 1) % bottom.length, next = u + Math.hypot(bottom[j][0] - bottom[i][0], bottom[j][1] - bottom[i][1]) / 10.4;
    const v0 = floorStart / 4, v1 = v0 + (y1 - y0) / bandHeight / 4;
    batch.quad(surfaces(i), [point(bottom[i], y0), point(top[i], y1), point(top[j], y1), point(bottom[j], y0)],
      [u,v0,u,v1,next,v1,next,v0]);
    u = next;
  }
}

function terrace(batch, outside, inside, y, key = 'deck') {
  for (let i = 0; i < outside.length; i++) {
    const j = (i + 1) % outside.length;
    const ring = [outside[i], inside[i], inside[j], outside[j]];
    batch.quad(key, ring.map(p => point(p, y)), ring.flatMap(([x, z]) => [x / 6, z / 6]));
  }
}

const rectangle = (w, d) => [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];

function vault(batch, {width, center, spring, radius, rise, bays, rails, vestibule = false}) {
  const half = width / 2, steps = 72, strips = 32;
  const p = (x, a, lift = 0) => [x, spring + (rise + lift) * Math.sin(a), center + (radius + lift) * Math.cos(a)];
  const shell = batch.begin(vestibule ? 'entrance vault glass' : 'crown vault glass');
  for (let i = 0; i < steps; i++) {
    const a = Math.PI * i / steps, b = Math.PI * (i + 1) / steps;
    batch.quad('jade',[p(-half,a),p(half,a),p(half,b),p(-half,b)],
      [0,i/steps,bays/4,i/steps,bays/4,(i+1)/steps,0,(i+1)/steps]);
  }
  batch.end(shell);
  for (let bay = 0; bay <= bays; bay++) {
    const x = -half + width * bay / bays, terminal = bay === 0 || bay === bays;
    const w = terminal ? (vestibule ? .27 : .65) : .145;
    const key = terminal ? 'end' : 'silver', lift = terminal ? .26 : .064;
    for (let i = 0; i < strips; i++) {
      const a = Math.PI * i / strips, b = Math.PI * (i + 1) / strips;
      const quad = [p(x-w/2,a,lift),p(x+w/2,a,lift),p(x+w/2,b,lift),p(x-w/2,b,lift)];
      batch.quad(key,quad);
      if (terminal) {
        const side = x + Math.sign(x) * w/2;
        const lip = [p(side,a),p(side,b),p(side,b,lift),p(side,a,lift)];
        batch.quad(key,x<0?lip:lip.reverse());
      }
    }
  }
  for (let rail = 0; rail <= rails; rail++) {
    const a = Math.PI * rail / rails, run = .085 / Math.hypot(radius*Math.sin(a), rise*Math.cos(a));
    batch.quad('silver',[p(-half,a-run,.09),p(half,a-run,.09),p(half,a+run,.09),p(-half,a+run,.09)]);
  }
  for (const side of [-1,1]) {
    const x = side * half, pivot = [x,spring,center];
    for (let i = 0; i < strips; i++) {
      const a = p(x,Math.PI*i/strips), b = p(x,Math.PI*(i+1)/strips);
      batch.triangle('end',side>0?[pivot,b,a]:[pivot,a,b]);
    }
    if (!vestibule) {
      const edge = x + side * .045;
      for(let i=0;i<22;i++){
        const a=.45+i*(Math.PI-.9)/22,b=.45+(i+1)*(Math.PI-.9)/22;
        const q=(t,offset)=>[edge,spring+(rise*.60+offset)*Math.sin(t),center+(radius*.60+offset)*Math.cos(t)];
        const strip=[q(a,0),q(b,0),q(b,.34),q(a,.34)];
        batch.quad('silver',side<0?strip:strip.reverse());
      }
    }
  }
  return {center, spring, radius, rise};
}

export function buildStudy(materials = createMaterials()) {
  const batch = new ArchitectureBatch, s = STUDY;
  const crownSpring = s.podiumHeight + s.storeys * s.floorHeight;
  const podium = rectangle(s.podiumWidth, s.podiumDepth);
  const podiumGlassTop = 13.8;
  walls(batch,podium,podium,0,podiumGlassTop,4.6,()=> 'blue');
  walls(batch,podium,podium,podiumGlassTop,s.podiumHeight,3.1,()=> 'stone');
  const topInset=rectangle(s.podiumWidth-.86,s.podiumDepth-.86);
  terrace(batch,podium,topInset,s.podiumHeight,'stone');
  walls(batch,topInset,topInset,17.97,s.podiumHeight,3.1,()=> 'end');
  batch.box('terrace',0,17.96,0,s.podiumWidth-.86,.08,s.podiumDepth-.86);

  const shaft=towerRing(56,29), cap=towerRing(s.width,s.depth,true), skirt=s.podiumHeight+2.75;
  const shoulder=s.podiumHeight+23*s.floorHeight, shoulderTop=shoulder+2*s.floorHeight;
  const facade=i=>i===5||i===6||i===7?'blue':'teal';
  walls(batch,shaft,shaft,17.99,skirt,3.4,()=> 'stone');
  walls(batch,shaft,shaft,skirt,shoulder,s.floorHeight,facade);
  walls(batch,shaft,cap,shoulder,shoulderTop,s.floorHeight,facade,(shoulder-skirt)/s.floorHeight);
  walls(batch,cap,cap,shoulderTop,crownSpring,s.floorHeight,facade,(shoulderTop-skirt)/s.floorHeight);

  // Close the tower at the vault spring, including the chamfered shoulders.
  const capFaces=[[0,1,2],[5,6,7],[8,9,10],[10,0,2],[2,4,5],[5,7,8],[8,10,2],[2,5,8]];
  for(const [i,j,k] of capFaces){
    const [a,b,c]=[cap[i],cap[j],cap[k]];
    const upward=(b[1]-a[1])*(c[0]-a[0])>(b[0]-a[0])*(c[1]-a[1]);
    batch.triangle('end',(upward?[a,b,c]:[a,c,b]).map(p=>point(p,crownSpring-.018)));
  }

  // The projecting centre continues in front of the vault spring as a shallow terrace.
  const radius=13.5, center=-1.8, terraceZ=center+radius;
  const terraceEdge=[[-19.8,12.6],[-14.1,17],[14.1,17],[19.8,12.6]];
  for(let i=0;i<terraceEdge.length-1;i++){
    const a=terraceEdge[i],b=terraceEdge[i+1],c=[a[0],terraceZ],d=[b[0],terraceZ];
    batch.quad('terrace',[point(a,crownSpring),point(b,crownSpring),point(d,crownSpring),point(c,crownSpring)],
      [a[0]/6,a[1]/6,b[0]/6,b[1]/6,d[0]/6,d[1]/6,c[0]/6,c[1]/6]);
    batch.beam('silver',point(a,crownSpring+.32),point(b,crownSpring+.32),.21,.36);
  }
  batch.box('end',0,crownSpring-.13,center,s.width,.26,2*radius);
  const crown=vault(batch,{width:s.width,center,spring:crownSpring,radius,rise:s.crownRise,bays:12,rails:6});
  for(const x of [-12.4,12.4]){
    const z=terraceZ+1.22,bottom=crownSpring+.08,top=crownSpring+1.85;
    batch.box('end',x,bottom+.75,z-.58,2.05,1.5,1.12);
    batch.quad('jade',[[x-.94,bottom,z],[x+.94,bottom,z],[x+.94,top-.55,z],[x-.94,top-.55,z]],[0,0,.24,0,.24,.16,0,.16]);
    for(const dx of [-.94,0,.94])batch.box('silver',x+dx,bottom+.64,z+.038,.085,1.3,.07);
    for(let i=0;i<12;i++){
      const p=(j,d)=>[x+.99*Math.cos(j*Math.PI/12),top-.55+.55*Math.sin(j*Math.PI/12),z-d];
      batch.quad('silver',[p(i+1,0),p(i,0),p(i,1.22),p(i+1,1.22)]);
      batch.triangle('jade',[[x,top-.55,z],p(i,0),p(i+1,0)]);
    }
  }

  const entryW=47.6, entryCenter=20.9, entryR=5.2, doorZ=entryCenter+entryR;
  const doorwayHalf=4.55, doorHeight=5.55, entrySpring=7.1;
  const entry = vault(batch, {width:entryW,center:entryCenter,spring:entrySpring,radius:entryR,rise:4.8,bays:18,rails:5,vestibule:true});
  const panel=(x0,x1,y0,y1)=>batch.quad('jade',[[x0,y0,doorZ],[x1,y0,doorZ],[x1,y1,doorZ],[x0,y1,doorZ]],
    [x0/11,.01+y0/65,x1/11,.01+y0/65,x1/11,.01+y1/65,x0/11,.01+y1/65]);
  panel(-entryW/2,-doorwayHalf,0,entrySpring);panel(doorwayHalf,entryW/2,0,entrySpring);
  panel(-doorwayHalf,doorwayHalf,doorHeight,entrySpring);
  for(const x of [-entryW/2,entryW/2])batch.box('end',x,entrySpring/2,(s.podiumDepth/2+doorZ)/2,.24,entrySpring,doorZ-s.podiumDepth/2);
  for(let i=0;i<=18;i++){
    const x=entryW*(i/18-.5), bottom=Math.abs(x)<doorwayHalf?doorHeight:0;
    batch.box('silver',x,(bottom+entrySpring)/2,doorZ+.035,.10,entrySpring-bottom,.085);
  }
  for(const x of [-3.36,-1.12,1.12,3.36]){
    batch.box('door',x,doorHeight/2,doorZ-.10,2.19,doorHeight,.08);
    batch.box('silver',x-1.12,doorHeight/2,doorZ-.045,.075,doorHeight,.11);
    batch.box('silver',x+.43,2.32,doorZ+.031,.055,.55,.064);
  }
  batch.box('silver',0,doorHeight,doorZ+.02,9.22,.15,.18);
  batch.box('silver',0,doorHeight+1.37,doorZ+.09,10.65,.16,.26);
  for(const x of [-5.25,5.25])batch.box('silver',x,(doorHeight+1.37)/2,doorZ+.09,.17,doorHeight+1.37,.26);
  batch.box('silver',doorwayHalf,doorHeight/2,doorZ,.13,doorHeight,.18);

  const model=batch.finish(materials,'Barrel-vault skyscraper · fixed benchmark');
  const glass=model.children.find(m=>m.name==='jade').geometry;
  for(const [label,section] of [['crown vault glass',crown],['entrance vault glass',entry]]) {
    const {start,end}=model.userData.partRanges.find(r=>r.label===label&&r.material==='jade');
    const {position,normal}=glass.attributes;
    const direction=new T.Vector3();
    for(let i=start;i<end;i++){
      direction.set(0,(position.getY(i)-section.spring)/section.rise**2,(position.getZ(i)-section.center)/section.radius**2).normalize();
      normal.setXYZ(i,direction.x,direction.y,direction.z);
    }
    normal.needsUpdate=true;
  }
  model.userData.reviewOnly=true;
  model.userData.triangles=model.children.reduce((n,m)=>n+m.geometry.index.count/3,0);
  model.userData.vaults={crown,entry};
  return model;
}

export function buildSite(materials) {
  const batch=new ArchitectureBatch;
  batch.quad('deck',[[-35,-.05,-24],[-35,-.05,31],[35,-.05,31],[35,-.05,-24]],[0,0,0,10,12,10,12,0]);
  batch.box('road',0,-.14,36.9,69,.18,9.0);
  for(const z of [36.70,37.03])batch.box('paint',0,-.043,z,68,.01,.073);
  return batch.finish(materials,'Review pavement and road');
}
