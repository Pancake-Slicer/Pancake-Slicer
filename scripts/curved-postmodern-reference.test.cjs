
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bundle=read('web/assets/game.bundle.js');
const strip=source=>source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');

test('fixed benchmark uses opaque batches and open, supported roof frames',()=>{
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
  const position=frame.getAttribute('position');
  const index=frame.index.array;
  const area=(px,pz,qx,qz,rx,rz)=>(qx-px)*(rz-pz)-(qz-pz)*(rx-px);
  function covers(range,x,z){
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
    ['Curved roof perimeter frame',study.curve.roof,[-9.8,-20.1],[-11.57,-18.3],[-9.8,-18.3]],
    ['Lower rounded roof perimeter frame',study.front[4],[4,25.9],[2,23.5],[4,23.5]]
  ]){
    const part=model.userData.partRanges.find(range=>range.label===label && range.material==='frame');
    assert.ok(part,label);
    const heights=Array.from({length:part.end-part.start},(_,i)=>position.getY(part.start+i));
    assert.ok(Math.min(...heights)<deckY+.5);
    assert.ok(Math.max(...heights)>deckY+1.2);
    assert.ok(covers(part,...rail),label+' continuous outer rail');
    assert.ok(covers(part,...brace),label+' solid radial brace');
    assert.equal(covers(part,...gap),false,label+' open bay');
  }
});

test('the normal game and growable catalogue do not include the benchmark',()=>{
  for(const file of ['web/assets/game.bundle.js','scripts/assemble-runtime.cjs','web/features/growable-assets.js']){
    assert.doesNotMatch(read(file),/curved-postmodern-reference|curvedPostmodernStudy|curvedPostmodernReview/);
  }
});
