const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {prepare,out}=require('./export-barrel-vault.cjs');

test('fixed reference uses two smooth opaque vaults, a street entry and shared batches',async()=>{
  prepare();
  const {STUDY,createMaterials,buildStudy}=await import(pathToFileURL(path.join(out,'barrel-vault-reference/model.js')));
  const materials=createMaterials(),model=buildStudy(materials);
  assert.equal(model.userData.reviewOnly,true);
  assert.equal(STUDY.storeys,29);
  assert.ok(model.userData.triangles<4500&&model.children.length<=9);
  assert.ok(model.children.every(mesh=>mesh.material.transparent===false));
  assert.ok(model.children.some(mesh=>mesh.name==='door'));
  for(const key of ['crown','entry']){
    const section=model.userData.vaults[key],label=key==='crown'?'crown':'entrance';
    const part=model.userData.partRanges.find(p=>p.label===label+' vault glass'&&p.material==='jade');
    const {position,normal}=model.children.find(m=>m.name==='jade').geometry.attributes;
    const width=key==='crown'?STUDY.width:47.6;
    let rise=0;
    for(let i=part.start;i<part.end;i++){
      const dy=position.getY(i)-section.spring,dz=position.getZ(i)-section.center;
      assert.ok(Math.abs(Math.abs(position.getX(i))-width/2)<.001);
      assert.ok(Math.abs((dy/section.rise)**2+(dz/section.radius)**2-1)<.00001);
      assert.ok(Math.abs(normal.getX(i))<.00001&&normal.getY(i)>=-.00001);
      const length=Math.hypot(dy/section.rise**2,dz/section.radius**2);
      assert.ok(Math.abs(normal.getZ(i)-(dz/section.radius**2)/length)<.00001);
      rise=Math.max(rise,dy);
    }
    assert.ok(Math.abs(rise-section.rise)<.001);
  }
  for(const mesh of model.children)mesh.geometry.dispose();
  for(const material of Object.values(materials)){material.map?.dispose();material.dispose();}
});

test('benchmark stays outside the assembled game and growable scripts',()=>{
  const root=path.resolve(__dirname,'..');
  for(const file of ['web/assets/game.bundle.js','scripts/assemble-runtime.cjs','web/features/growable-assets.js']){
    const text=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(!text.includes('barrel-vault-reference'),file);
  }
});
