// Reuse Lind's exact viewer/lighting without changing its approved files.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),id=process.argv[2]||'von-badel';
if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid benchmark identifier');
const folder=path.join(root,'benchmark',id),config=JSON.parse(fs.readFileSync(path.join(folder,'benchmark.json'),'utf8')),out=path.join(root,'.tools',id);
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8'),end=source.indexOf('const LP=');if(end<0||!source.includes('const Ui="180"'))throw Error('Recovered engine boundary changed');
const engineExports=fs.readFileSync(path.join(root,'scripts/prepare-art-deco.cjs'),'utf8').match(/const engineExports='([^']+)'/)[1];
fs.writeFileSync(path.join(out,'engine.js'),source.slice(0,end)+'\n'+engineExports);
fs.copyFileSync(path.join(folder,'model.js'),path.join(out,'model.js'));fs.copyFileSync(path.join(root,'benchmark/shared/batched-architecture.js'),path.join(out,'batched-architecture.js'));
fs.copyFileSync(path.join(root,'benchmark/art-deco/style.css'),path.join(out,'style.css'));
for(const [to,from] of Object.entries(config.images))fs.copyFileSync(path.join(root,config.sourceDirectory,from),path.join(out,'assets',to));
let scene=fs.readFileSync(path.join(root,'benchmark/art-deco/scene.js'),'utf8');
scene=scene.replaceAll('createArtDeco','createModel').replace('detail?72:211',`detail?72:${config.view.span}`).replace('detail?153:91',`detail?${config.view.detailTarget}:${config.view.target}`).replace('52,.55,37',`${config.view.plinthWidth},.55,${config.view.plinthDepth}`);
scene=scene.replace('angle=Number(a);detail=close;', 'angle=Number(a);pitch=angle===0&&!close?0:19;detail=close;');
fs.writeFileSync(path.join(out,'scene.js'),scene);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>${escape(config.name)} · Architectural benchmark</title><link rel="stylesheet" href="style.css"></head><body>
<header><div><span class="eyebrow">PANCAKE CITY / ARCHITECTURE STUDY ${escape(config.study)}</span><h1>${escape(config.name)} <em>Art Deco</em></h1></div><p>${escape(config.correction)}<br><span>Three.js r180 · independent architectural study</span></p></header>
<main><section class="viewport"><div id="canvas" aria-label="Interactive three-dimensional skyscraper"></div><div class="caption"><span>${escape(config.caption)}</span><span id="view-label">Three-quarter elevation</span></div><div class="toolbar"><button data-view="35" class="active">Three-quarter</button><button data-view="-35">Opposite front</button><button data-view="145">Rear</button><button data-view="0">Front</button><button id="detail">Crown detail</button><button id="rotate">Auto rotate</button></div><p class="hint">Drag to orbit · scroll to zoom · arrow keys rotate · R resets</p></section>
<aside><span class="eyebrow">DESIGN REFERENCES</span><div class="references"><figure><img src="assets/original.jpg" alt="Original ${escape(config.name)} building screenshot"><figcaption>Original / silhouette authority</figcaption></figure><figure><img src="assets/reference.png" alt="Supplied architectural concept with unequal wing widths"><figcaption>Concept / left wing width corrected</figcaption></figure></div><details><summary>Facade source & processed bay</summary><div class="texture"><img src="assets/facade.png" alt="Supplied ${escape(config.name)} facade artwork"><canvas id="bay-preview" width="128" height="256"></canvas></div><p>A complete window and spandrel cropped from the supplied artwork; raised piers are real geometry.</p></details><div class="specs">${config.facts.map(f=>`<div><strong>${escape(f.value)}</strong><span>${escape(f.label)}</span></div>`).join('')}</div><div id="metrics">Loading materials…</div><p class="note">${escape(config.description)}</p><a href="THIRD-PARTY-NOTICES.txt">Third-party notices</a></aside></main><script type="module" src="scene.js"></script></body></html>`);
fs.copyFileSync(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
console.log(`${config.name} benchmark: ${out}`);
