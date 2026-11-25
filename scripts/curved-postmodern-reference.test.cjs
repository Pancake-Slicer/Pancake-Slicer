
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bundle=read('web/assets/game.bundle.js');
const strip=source=>source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');

test('fixed benchmark uses aligned windows, joined wings, revolving doors and open roof frames',()=>{
  const context=vm.createContext({console,performance,structuredClone,atob,URL,
    document:{createElement:()=>({relList:{supports:()=>true}})}});
  const prefix=bundle.slice(0,bundle.indexOf('const LP='));
  const batch=strip(read('benchmark/shared/batched-architecture.js'));
  const modelCode=strip(read('architecture/curved-postmodern-reference/model.js'));
  const {buildStudy,study}=vm.runInContext(
    prefix+';\n((T)=>{\n'+batch+'\n'+modelCode+'\nreturn createStudy(T,ArchitectureBatch);\n})(pcOhneeEngine());',context);
  const model=buildStudy();
  assert.equal(model.userData.reviewOnly,true);
  assert.ok(model.userData.triangles<65000);
  assert.ok(model.children.length<=11);
  assert.ok(model.children.every(mesh=>!mesh.material.transparent));
  assert.ok(study.core[4]>study.curve.roof && study.curve.roof>study.front[4] && study.front[4]>study.wing[4]);

  const frame=model.getObjectByName('frame').geometry;
  const area=(px,pz,qx,qz,rx,rz)=>(qx-px)*(rz-pz)-(qz-pz)*(rx-px);
  function covers(geometry,range,x,z){
    const position=geometry.getAttribute('position'),index=geometry.index.array;
    for(let i=0;i<index.length;i+=3){
      const a=index[i],b=index[i+1],c=index[i+2];
      if([a,b,c].some(vertex=>vertex<range.start || vertex>=range.end))continue;
      const ax=position.getX(a),az=position.getZ(a),bx=position.getX(b),bz=position.getZ(b),cx=position.getX(c),cz=position.getZ(c);
      const total=area(ax,az,bx,bz,cx,cz);
      if(Math.abs(total)<.00001)continue;
      const p=area(ax,az,bx,bz,x,z)/total,q=area(bx,bz,cx,cz,x,z)/total,r=area(cx,cz,ax,az,x,z)/total;
      if(Math.min(p,q,r)>=-.0001)return true;
    }
    return false;
  }
  for(const [label,deckY,rail,brace,gap] of [
    ['Curved roof perimeter frame',study.curve.roof,[-9.8,study.curve.z-3.1],[-11.57,study.curve.z-1.3],[-9.8,study.curve.z-1.3]],
    ['Lower rounded roof perimeter frame',study.front[4],[4,25.9],[2,23.5],[4,23.5]]
  ]){
    const part=model.userData.partRanges.find(range=>range.label===label && range.material==='frame');
    assert.ok(part,label);
    const position=frame.getAttribute('position');
    const heights=Array.from({length:part.end-part.start},(_,i)=>position.getY(part.start+i));
    assert.ok(Math.min(...heights)<deckY+.5);
    assert.ok(Math.max(...heights)>deckY+1.2);
    assert.ok(covers(frame,part,...rail),label+' continuous outer rail');
    assert.ok(covers(frame,part,...brace),label+' solid radial brace');
    assert.equal(covers(frame,part,...gap),false,label+' open bay');
  }

  const glass=model.getObjectByName('glass').geometry.getAttribute('position');
  const windows=['Curved curtain wall and main roof','Front tower','Rear service core','Recessed right wing'];
  for(const label of windows){
    const range=model.userData.partRanges.find(part=>part.label===label && part.material==='glass');
    assert.ok(range,label);
    const heights=Array.from({length:range.end-range.start},(_,i)=>glass.getY(range.start+i))
      .filter(y=>y>20 && y<70).map(y=>y.toFixed(3));
    const expected=[];
    const {roof,lobby,floors}=study.curve,storey=(roof-lobby)/floors;
    for(let floor=0;floor<floors;floor++){
      for(const y of [lobby+floor*storey+.36,lobby+(floor+1)*storey-.37]){
        if(y>20 && y<70)expected.push(y.toFixed(3));
      }
    }
    assert.deepEqual([...new Set(heights)].sort(),expected.sort(),label+' window sills and heads');
  }

  assert.equal(study.front[2],study.core[3]);
  const terrace=model.userData.partRanges.find(part=>part.label==='Front tower' && part.material==='gravel');
  const gravel=model.getObjectByName('gravel').geometry;
  assert.ok(covers(gravel,terrace,12,study.core[3]+.02),'the terrace reaches the service core');
  for(const x of [-1.8,4,14]){
    assert.ok(covers(gravel,terrace,x,study.core[3]+2),'the former gap is roofed');
  }

  const {z,rz,roof,lobby,floors}=study.curve;
  assert.equal(floors,28);
  assert.ok(Math.abs((roof-lobby)/floors-96/26)<1e-8);
  assert.equal(study.core[4],roof+1);
  assert.ok(z<=study.core[2]-4 && z<=study.wing[2]-4,'curved shaft extends behind both right-hand volumes');

  function columnCenters(label,material){
    const part=model.userData.partRanges.find(range=>range.label===label && range.material===material);
    const position=model.getObjectByName(material).geometry.getAttribute('position');
    const result=[];
    assert.equal((part.end-part.start)%24,0);
    for(let start=part.start;start<part.end;start+=24){
      let x=0,z=0;
      for(let i=start;i<start+24;i++){
        x+=position.getX(i);
        z+=position.getZ(i);
      }
      result.push([x/24,z/24]);
    }
    return result;
  }
  const lobbyColumns=columnCenters('Curved lobby columns','panel');
  const officeMullions=columnCenters('Curved office mullions','reveal');
  assert.equal(officeMullions.length-1,2*(lobbyColumns.length-1));
  for(const [i,[x,z]] of lobbyColumns.entries()){
    const [upperX,upperZ]=officeMullions[2*i];
    assert.ok(Math.hypot(x-upperX,z-upperZ)<.00001,'lobby column sits under every second office mullion');
  }
  const plantClearance=18.7-(2.08+.16)/2-(z+rz);
  assert.ok(plantClearance>.5 && plantClearance<1.5,'curved shaft sits just behind the podium plant');

  const doors=model.userData.partRanges.filter(part=>part.label==='Revolving entrance doors' && part.material==='glass');
  assert.equal(doors.length,2);
  for(const door of doors){
    assert.equal(door.end-door.start,(12+4)*8,'each door has curved screens and four two-sided leaves');
    const positions=Array.from({length:door.end-door.start},(_,i)=>glass.getZ(door.start+i));
    assert.ok(Math.min(...positions)<21.4 && Math.max(...positions)>22.4,'the drum straddles the storefront');
  }
});

test('the normal game and growable catalogue do not include the benchmark',()=>{
  for(const file of ['web/assets/game.bundle.js','scripts/assemble-runtime.cjs','web/features/growable-assets.js']){
    assert.doesNotMatch(read(file),/curved-postmodern-reference|curvedPostmodernStudy|curvedPostmodernReview/);
  }
});
