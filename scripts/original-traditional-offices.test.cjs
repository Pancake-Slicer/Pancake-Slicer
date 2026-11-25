const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'),crypto=require('node:crypto'),root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function api(){
  const c=vm.createContext({console,performance,structuredClone,atob,URL,
    document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
  vm.runInContext(source.slice(0,source.indexOf('const LP='))+';globalThis.a={zb,qb,Se,pS,Pw,Te,je,sn,pcGrowableFind,pcTraditionalControl,pcTraditionalSetControl,pcTraditionalReady,pcTraditionalFit,pcTraditionalHistory,pcTraditionalInfo,pcTraditionalUpdateLOD,pcOfficeParcels,pcFacadeSites,pcFacadeAttach,pcFacadeRelease,get runtime(){return pcTraditionalRuntime;}};',c);
  return c.a;
}
function city(a){
  const n=new a.zb,roads=[];
  n.terrain=a.Pw({kind:'inland',seed:1138,hills:0,mountains:0,slope:0,river:0,coast:0},{size:900,tileSize:900});
  for(const v of [-400,-220,-20,180,400])roads.push([{x:v,z:-400},{x:v,z:400}],[{x:-400,z:v},{x:400,z:v}]);
  n.addBatch(roads);const z=new a.qb(n,{items:[]});z.setPropertyZone('offices');return {n,z};
}
function lot(type,w,d,angle=0){
  const sin=Math.sin(angle),cos=Math.cos(angle);
  return {id:type,zone:'offices',area:w*d,towardRoad:{x:sin,z:cos},footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]
    .map(([x,z])=>({x:x*cos+z*sin,z:-x*sin+z*cos}))};
}
test('three fixed native shapes fit rotated parcels and keep supported terraces, opaque materials and decorated bounds',()=>{
  const a=api(),rt=a.pcTraditionalReady(),data=[];
  for(const [i,type] of ['A','B','C'].entries()){
    const site=lot(type,58,48,.4+i*.27),fit=a.pcTraditionalFit(site,type,{benchmark:true});
    assert.ok(fit.ok,fit.reason);const r=fit.record,s=r.parameters,g=r.grid;
    assert.deepEqual(plain(a.pcTraditionalFit({...site},type,{benchmark:true}).record),plain(r));
    assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(site.footprint)))<.001);
    assert.equal(s.revision,type==='C'?4:2);
    assert.equal(r.placement.scale,1);assert.ok(Math.abs(r.placement.angle-(.4+i*.27))<.001);
    assert.equal(a.pcTraditionalFit(lot(type+'-small',s.width,s.depth),type,{benchmark:true}).ok,false);
    assert.equal(a.pcTraditionalFit({...site,officeProfile:{maxFloors:12}},type,{benchmark:true}).ok,false);
    const poly=ring=>a.Te(ring.map(([x,z])=>({x,z})));
    const rings=[g.groundRing,...g.tiers.map(t=>t.ring)];
    for(let j=1;j<rings.length;j++)assert.ok(a.sn(a.je(poly(rings[j]),poly(rings[j-1])))<.001);
    assert.equal(g.groundRing.length,{A:12,B:6,C:8}[type]);
    assert.equal(g.entries.length,type==='B'?2:1);
    assert.equal(g.tiers.length,{A:2,B:3,C:1}[type]);
    const model=rt.generator.generate(s),copy=rt.generator.generate(s);
    assert.ok(model.children.length<=11&&model.userData.triangles<24000);
    for(const [j,mesh] of model.children.entries()){
      assert.equal(mesh.material.transparent,false);assert.equal(mesh.geometry,copy.children[j].geometry);
      const p=mesh.geometry.attributes.position;
      for(let k=0;k<p.count;k++){
        assert.ok(Math.abs(p.getX(k))<=s.width/2+1.751,type+' x envelope');
        assert.ok(Math.abs(p.getZ(k))<=s.depth/2+1.751,type+' z envelope');
        assert.ok(p.getY(k)>=-.001&&p.getY(k)<=g.roofTop+.001,type+' roof envelope');
      }
    }
    const peak=g.tiers.at(-1),parts=label=>model.userData.partRanges.filter(r=>r.label===label);
    const vertices=range=>{
      const p=model.getObjectByName(range.material).geometry.attributes.position;
      return Array.from({length:range.end-range.start},(_,j)=>[p.getX(range.start+j),p.getY(range.start+j),p.getZ(range.start+j)]);
    };
    const cornice=vertices(parts('projecting cornice').filter(r=>r.material==='trim').at(-1));
    const right=Math.max(...peak.ring.map(([x])=>x));
    assert.ok(Math.abs(Math.max(...cornice.map(([x])=>x))-right-1.63)<.001);
    const tower=parts('rooftop water tower').flatMap(vertices);
    assert.ok(Math.abs(Math.min(...tower.map(([,y])=>y))-peak.end)<.001);
    assert.ok(Math.abs(Math.max(...tower.map(([,y])=>y))-g.roofTop)<.001);
    const minX=Math.min(...tower.map(p=>p[0])),maxX=Math.max(...tower.map(p=>p[0]));
    const minZ=Math.min(...tower.map(p=>p[2])),maxZ=Math.max(...tower.map(p=>p[2]));
    assert.ok(a.sn(a.je(poly([[minX,minZ],[maxX,minZ],[maxX,maxZ],[minX,maxZ]]),poly(peak.ring)))<.001);
    if(type==='C'){
      assert.equal(s.width,46);assert.equal(s.depth,40);assert.equal(2*right,46);
      assert.deepEqual(plain(peak.ring),plain(g.groundRing));
      assert.ok(Math.abs(a.sn(poly(g.groundRing))-(46*40-15*12))<.001);
      const court=poly([[-7.5,-20],[7.5,-20],[7.5,-8],[-7.5,-8]]);
      const roof=model.getObjectByName('roof').geometry,{position}=roof.attributes;
      for(let i=0;i<roof.index.count;i+=3){
        const face=poly([0,1,2].map(j=>{const k=roof.index.getX(i+j);return [position.getX(k),position.getZ(k)];}));
        assert.ok(a.sn(face)-a.sn(a.je(face,court))<.001,'the roof must leave the courtyard open');
      }
    }
    data.push([type,s.storeys,model.userData.triangles,model.children.length]);
    rt.generator.release(model);rt.generator.release(copy);
  }
  rt.generator.prune();assert.equal(rt.generator.cache.size,0);console.log('Traditional Offices [design,storeys,triangles,materials]',JSON.stringify(data));
});
test('all three Traditional Office forms grow by default alongside established offices',()=>{
  const a=api(),{n,z}=city(a);
  assert.equal(a.pcTraditionalControl(z).enabled,true);
  const empty=plain(n.captureState().participants.zoning);
  assert.equal(a.runtime,null);
  a.pcTraditionalSetControl(z,{enabled:false,type:'mix'});
  z.applyProperties(z.properties.slice(0,8),'offices');
  assert.ok(z.buildings.length>0&&z.buildings.every(b=>!b.office.lightweightTraditional));
  assert.equal(a.runtime,null);
  n.historyParticipants.get('zoning').restore(empty);z.rebuild();
  z.applyProperties(z.properties,'offices');
  const towers=z.buildings.filter(b=>b.office.lightweightTraditional);
  assert.deepEqual([...new Set(towers.map(b=>b.office.lightweightTraditional.parameters.archetype))].sort(),['A','B','C']);
  assert.ok(towers.length<z.buildings.length);
  assert.ok(towers.every(b=>b.office.lightweightTraditional.parameters.revision===5));
  assert.ok(z.buildings.some(b=>b.office.lightweightCurved));assert.ok(z.buildings.some(b=>b.office.lightweightVault));
  assert.ok(!source.includes('function traditionalHighRise('));
  const benchmark=fs.readFileSync(path.join(root,'architecture/traditional-high-rise-reference/model.js'));
  assert.equal(crypto.createHash('sha256').update(benchmark).digest('hex'),"5e3c6bf5204ea3c51e40d35bc3e77df5d58ec180f759cf013eea0567a1e96358");
});
test('explicit zoning selection retains foundations, picking, undo, cold restoration and deterministic redevelopment',()=>{
  const a=api(),{n,z}=city(a);
  a.pcTraditionalSetControl(z,{enabled:true,type:'B'});
  const target=z.properties.find(p=>a.pcTraditionalFit(p,'B').ok);
  assert.ok(target);z.applyProperties([target],'offices');
  let b=z.buildings.find(b=>b.propertyIds.includes(target.id));assert.equal(b.office.lightweightTraditional.parameters.archetype,'B');
  const old=plain(b.office.lightweightTraditional),saved=plain(n.captureState().participants.zoning);
  let site=a.pcFacadeSites.get(b);assert.equal(site.front,old.grid.entrance.z);assert.equal(site.doorX,old.grid.entrance.x);assert.equal(site.rings[0].length,6);
  const scene=new a.Se,renderer=a.pS(scene);renderer.render(z);
  assert.equal(a.pcTraditionalInfo().activeBuildings,1);assert.equal(renderer.render(z),false);
  const near=a.pcTraditionalInfo().visibleTriangles;
  assert.equal(a.pcTraditionalUpdateLOD({x:10000,y:1200,z:10000}),true);
  assert.ok(a.pcTraditionalInfo().visibleTriangles<near*.8);assert.equal(a.pcTraditionalInfo().distantChunks,1);
  assert.equal(a.pcTraditionalUpdateLOD({x:b.x,y:b.y+5,z:b.z}),true);
  assert.equal(a.pcTraditionalInfo().visibleTriangles,near);
  let picked=false;scene.traverse(m=>{if(m.userData.pcBmoBuildings?.some(v=>v.id===b.id)){
    const p=b.office.assetPlacement;assert.equal(renderer.at({object:m,point:{x:p.x,y:b.y+2,z:p.z+5}}),b.id);picked=true;
  }});assert.ok(picked);
  assert.equal(z.demolish(b.id),true);assert.equal(n.undo(),true);z.rebuild();
  b=z.buildings.find(b=>b.propertyIds.includes(target.id));assert.deepEqual(plain(b.office.lightweightTraditional),old);
  assert.equal(n.redo(),true);z.rebuild();assert.ok(!z.buildings.some(b=>b.propertyIds.includes(target.id)));
  z.applyProperties([target],'offices');assert.deepEqual(plain(z.buildings.find(b=>b.propertyIds.includes(target.id)).office.lightweightTraditional),old);
  const other=city(api());other.n.historyParticipants.get('zoning').restore(saved);other.z.rebuild();
  assert.deepEqual(plain(other.z.buildings.find(b=>b.propertyIds.includes(target.id)).office.lightweightTraditional),old);
  const terrain={heightAt:(x,z)=>22+x*.022-z*.016,revision:1};
  const key='template:original-traditional-offices-b@0.1.0',c={network:{terrain},pcCatalogueAssignments:new Map([[target.id,key]]),pcTraditionalAssignments:new Map([[target.id,old]])};
  const [sloped]=a.pcOfficeParcels([target],c);site=a.pcFacadeSites.get(sloped);
  assert.ok(sloped.y>site.ground(site.doorX,site.front));
  const rt=a.pcTraditionalReady(),r={...old,placement:{...old.placement,y:sloped.y}};
  const supported=a.pcFacadeAttach(sloped,rt.system.generate(r),rt,r);
  assert.ok(supported.children.some(mesh=>mesh.userData.pcFacadeOwned));
  a.pcFacadeRelease(supported);rt.system.release(supported);
});

test('earlier saved designs retain their exact geometry and native fit envelope',()=>{
  const rt=api().pcTraditionalReady(),locks={
    A:'18ba24aa17ab047ee79f72b3deaa59042e88440c1e7951f7b23bea0eb92dfd21',
    B:'3f1cadd47466166cb826e396eeba026cce5dcfb21cfacda7d4df0f9c8992ac35',
    C:'bc6f79645836665108109def2c4911ab6b37dfa7e288c595eed32b74ad136d0d'
  };
  const approved={
    A:'a90b1e64e0886bc27158c16e791a5417b8ac2dd4bba4dd5cb5b664947b6d7dae',
    B:'74804cc180c5c91a5711b68828340005415a27e8a6dfbe17a50b03cde8af6058',
    C:'8609bd60888a4ec79fd3adcee992ccf0f937e0280e85ac7b9c05a238e017e1a4'
  };
  const previousHeritage={C:'799816a7eb335633df058faba8502f6d84a10a56ee625af8bda64ee2cfe1006e'};
  for(const [archetype,revision,expected] of [locks,approved,previousHeritage].flatMap((set,i)=>Object.entries(set).map(([type,hash])=>[type,i+1,hash]))){
    const site=lot(archetype,58,50),parameters=rt.system.definition.normalize({archetype,revision});
    const fit=rt.system.fit(site,{parameters});
    assert.ok(fit.ok,fit.reason);assert.equal(fit.record.parameters.revision,revision===1?undefined:revision);
    const [left,right]=fit.record.footprint,margin=revision===1?2.35:3.5;
    assert.ok(Math.abs(right.x-left.x-parameters.width-margin)<.001);
    const model=rt.system.generate(plain(fit.record)),hash=crypto.createHash('sha256');
    for(const mesh of model.children){
      hash.update(mesh.name);
      for(const {array} of [mesh.geometry.index,...Object.values(mesh.geometry.attributes)])hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));
    }
    assert.equal(hash.digest('hex'),expected);
    rt.system.release(model);
  }
});

test('15 native configurations span 12–26 storeys with distinct footprints and lighter distant meshes',()=>{
  const a=api(),rt=a.pcTraditionalReady(),data=[];
  const polygon=ring=>a.Te(ring.map(([x,z])=>({x,z})));
  const contains=(ring,shell)=>a.sn(a.je(polygon(ring),polygon(shell)))<.001;
  const box=(x,z,w,d)=>[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];
  function inside(x,z,ring){
    let hit=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const [ax,az]=ring[j],[bx,bz]=ring[i];
      if(x>=Math.min(ax,bx)-.001&&x<=Math.max(ax,bx)+.001&&z>=Math.min(az,bz)-.001&&z<=Math.max(az,bz)+.001&&
        Math.abs((x-ax)*(bz-az)-(z-az)*(bx-ax))<.005)return true;
      if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)hit=!hit;
    }
    return hit;
  }
  for(const type of ['A','B','C']){
    const footprints=new Set,dim=new Set,variants=new Set;
    for(const [i,[w,d,storeys]] of [[34,28,12],[42,34,15],[48,40,19],[59,47,23],[70,55,26]].entries()){
      const form=i%3,angle=.23*i,site=lot(type+'-'+i,w,d,angle),options={storeys,form};
      const fit=a.pcTraditionalFit(site,type,options);assert.ok(fit.ok,type+' '+storeys+' '+fit.reason);
      const r=fit.record,g=r.grid,s=r.parameters,ring=rt.system.definition.envelope(s);
      assert.deepEqual(plain(a.pcTraditionalFit({...site},type,options).record),plain(r));
      assert.equal(s.revision,5);assert.equal(s.storeys,storeys);assert.equal(s.form,form);
      assert.equal(r.placement.scale,1);assert.ok(Math.abs(r.placement.angle-angle)<.001);
      assert.ok(a.sn(a.je(a.Te(r.footprint),a.Te(site.footprint)))<.001);
      assert.equal(g.groundRing.length,{A:12,B:6,C:8}[type]);
      const rings=[g.groundRing,...g.tiers.map(t=>t.ring)];
      for(let j=1;j<rings.length;j++)assert.ok(contains(rings[j],rings[j-1]),type+' unsupported structural tier');
      const peak=g.tiers.at(-1);
      assert.ok(contains(box(...g.roof.tank,5.8,5.7),peak.ring),type+' water tank support');
      if(g.roof.hut){const [x,z,w,d]=g.roof.hut;assert.ok(contains(box(x,z,w+.27,d+.24),peak.ring));}
      for(const [x,z,w,d,tier] of g.roof.units)assert.ok(contains(box(x,z,w+.29,d+.26),g.tiers[tier].ring),type+' plant support');
      const facing=g.groundRing.some(([x,z],j)=>{
        const [nextX,nextZ]=g.groundRing[(j+1)%g.groundRing.length];
        return z===nextZ&&z===g.entrance.z&&g.entrance.x-g.entrance.width/2>=x&&g.entrance.x+g.entrance.width/2<=nextX;
      });
      assert.ok(facing,type+' street entry');
      const near=rt.system.generate(r),far=rt.distantSystem.generate(r);
      for(const model of [near,far]){
        assert.ok(model.children.length<=11);
        for(const mesh of model.children){
          assert.equal(mesh.material.transparent,false);
          const p=mesh.geometry.attributes.position;
          for(let j=0;j<p.count;j++){
            assert.ok(inside(p.getX(j),p.getZ(j),ring),type+' '+storeys+' decorated envelope '+mesh.name+' @ '+[p.getX(j),p.getZ(j)]);
            assert.ok(p.getY(j)>=-.001&&p.getY(j)<=g.roofTop+.001);
          }
        }
      }
      assert.ok(far.userData.triangles<near.userData.triangles*.83,type+' expected useful distance reduction');
      rt.system.release(near);rt.distantSystem.release(far);
      footprints.add(JSON.stringify(g.groundRing));
      dim.add(s.width+'x'+s.depth);
      const fixed=rt.system.definition.layout({...s,frontBays:11,sideBays:10,storeys:19});
      variants.add(JSON.stringify([fixed.groundRing,fixed.tiers,fixed.entries,fixed.roof]));
      data.push([type,storeys,s.width,s.depth,near.userData.triangles,far.userData.triangles]);
    }
    assert.equal(footprints.size,5);assert.equal(dim.size,5);assert.equal(variants.size,3);
    assert.equal(a.pcTraditionalFit(lot(type+' narrow',21,23),type).ok,false);
  }
  const compact=rt.system.definition.layout({archetype:'C',revision:5,storeys:12,frontBays:7,sideBays:6,form:2});
  const [hx,hz,hw,hd]=compact.roof.hut,[ux,uz,uw,ud]=compact.roof.units[0];
  const hut=box(hx,hz,hw+.27,hd+.24),unit=box(ux,uz,uw+.29,ud+.26);
  assert.ok(contains(unit,compact.tiers[0].ring));
  assert.ok(a.sn(polygon(unit))-a.sn(a.je(polygon(unit),polygon(hut)))<.001);
  rt.generator.prune();assert.equal(rt.generator.cache.size,0);assert.equal(rt.generator.leases.size,0);
  console.log('Parametric Traditional Offices [design,floors,width,depth,near triangles,far triangles]',JSON.stringify(data));
});
