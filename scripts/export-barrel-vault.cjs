const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), out=path.join(root,'.tools/barrel-vault-reference');
const source=path.join(root,'architecture/barrel-vault-reference'), vendor=path.join(root,'.tools/node_modules/three');

function prepare() {
  assert.equal(JSON.parse(fs.readFileSync(path.join(vendor,'package.json'))).version,'0.180.0');
  const write=(file,data)=>{const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);};
  write('package.json','{"type":"module"}');
  write('engine.js',"export * from './vendor/three.module.js';\n");
  for(const file of ['three.module.js','three.core.js'])write('vendor/'+file,fs.readFileSync(path.join(vendor,'build',file)));
  write('OrbitControls.js',fs.readFileSync(path.join(vendor,'examples/jsm/controls/OrbitControls.js'),'utf8').replace("from 'three'","from './engine.js'"));
  write('batched-architecture.js',fs.readFileSync(path.join(root,'benchmark/shared/batched-architecture.js')));
  write('barrel-vault-reference/model.js',fs.readFileSync(path.join(source,'model.js')));
  write('review.js',fs.readFileSync(path.join(source,'review.js')));
  const reference=process.env.PANCAKE_BARREL_VAULT_REFERENCE;
  if(reference&&path.resolve(reference)!==path.join(out,'reference.png'))write('reference.png',fs.readFileSync(reference));
}

function exportReview() {
  prepare();
  const read=file=>fs.readFileSync(path.join(out,file));
  const modules=['engine.js','vendor/three.module.js','vendor/three.core.js','OrbitControls.js','batched-architecture.js','barrel-vault-reference/model.js','review.js'];
  const entries=modules.map(file=>{
    const module=read(file).toString().replace(/\b(from\s*|import\s*)['"](\.[^'"]+)['"]/g,(_match,prefix,specifier)=>{
      const target=path.posix.normalize(path.posix.join(path.posix.dirname(file),specifier));
      assert.ok(modules.includes(target),target);
      return prefix+JSON.stringify('barrel-vault/'+target);
    });
    return ['barrel-vault/'+file,'data:text/javascript;base64,'+Buffer.from(module).toString('base64')];
  });
  const image=read('reference.png');
  const notices=fs.readFileSync(path.join(root,'reference/third-party-notices.txt'),'utf8')+'\n\n'+fs.readFileSync(path.join(vendor,'LICENSE'),'utf8');
  const html=fs.readFileSync(path.join(source,'index.html'),'utf8')
    .replace('src="reference.png"','src="data:image/png;base64,'+image.toString('base64')+'"')
    .replace('<script type="module" src="review.js"></script>','<script type="importmap">'+JSON.stringify({imports:Object.fromEntries(entries)})+'</script>\n<script type="module">import "barrel-vault/review.js";</script>')
    .replace('</body>','<script type="text/plain" id="third-party-notices">'+notices.replaceAll('<','&lt;')+'</script>\n</body>');
  assert.ok(!/<(?:script|link|img)\b[^>]*(?:src|href)\s*=\s*["'](?!data:)/i.test(html));
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  const folder=path.join(root,'dist');fs.mkdirSync(folder,{recursive:true});
  const file=path.join(folder,'Pancake City - Barrel-Vault Benchmark - '+stamp+'.html');
  const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
  fs.writeFileSync(file,html,{flag:'wx'});
  const report={file,sha256:hash(html),referenceSha256:hash(image),models:1,reviewOnly:true};
  fs.writeFileSync(path.join(out,'export.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}

module.exports={prepare,out};
if(require.main===module)exportReview();
