// Standalone benchmark only. Reuse the exact r180 engine recovered with the game.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.tools/art-deco');
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
const source=fs.readFileSync(path.join(root,'web/assets/game.bundle.js'),'utf8');
const end=source.indexOf('const LP=');
if(end<0||!source.includes('const Ui="180"'))throw Error('Recovered Three.js r180 boundary changed');
const engineExports='export {Sf as Scene,Me as Color,fy as HemisphereLight,gy as DirectionalLight,sb as WebGLRenderer,Ad as OrthographicCamera,ae as Mesh,mn as BoxGeometry,Re as MeshStandardMaterial,Ce as BufferGeometry,pe as Float32BufferAttribute,vr as CanvasTexture,Se as Group,hn as SRGBColorSpace,cd as ACESFilmicToneMapping,hm as PCFSoftShadowMap};';
fs.writeFileSync(path.join(out,'engine.js'),source.slice(0,end)+'\n'+engineExports);
for(const file of ['index.html','model.js','scene.js','style.css'])fs.copyFileSync(path.join(root,'benchmark/art-deco',file),path.join(out,file));
const assets=path.join(root,'Assets/Architecture/Art Deco');
for(const [from,to] of [['Lind.jpg','Lind.jpg'],['Art Deco Limestone Skyscraper Crown.png','reference.png'],['Art Deco Limestone Window Facade.png','facade.png']])fs.copyFileSync(path.join(assets,from),path.join(out,'assets',to));
fs.copyFileSync(path.join(root,'reference/third-party-notices.txt'),path.join(out,'THIRD-PARTY-NOTICES.txt'));
console.log('Art Deco benchmark built in .tools/art-deco (Three.js r180).');
