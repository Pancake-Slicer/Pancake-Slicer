
// Actual-game fixture and existing offline exporter; no Architecture Lab.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..'),folder=path.join(root,'.tools/brick-integration');fs.mkdirSync(folder,{recursive:true});
let review=fs.readFileSync(path.join(root,'scripts/von-growables-review.js'),'utf8');
review=review.replace("const vonReviewCounts=()=>({von:","const vonReviewCounts=()=>({brick:Vh.buildings.filter(b=>b.office.lightweightBrick).length,von:").replace("!b.office.lightweightLind).length","!b.office.lightweightLind&&!b.office.lightweightBrick).length");
review=review.replace('function vonReviewControls(von,bmo,favour=false){','function vonReviewControls(von,bmo,favour=false){pcBrickSetControl(Vh,{enabled:von&&bmo&&!favour,favour:false});');
const start=review.indexOf('function vonReviewActions()'),end=review.indexOf('async function vonReviewFrames()');review=review.slice(0,start)+review.slice(start,end).replaceAll('lightweightVon','lightweightBrick').replaceAll('Von','Brick')+review.slice(end);
const marker='ll.setMap(map);await Gt.setTerrain(map,_e);';assert.equal(review.split(marker).length,2);review=review.replace(marker,"if(new URLSearchParams(location.search).has('foundation-slope')){map.heightAt=(x,z)=>30+x*.025+z*.018;map.landHeightAt=map.heightAt;map.signature+=':brick-slope';map.revision=(map.revision||0)+1;}"+marker);
review+='\n'+fs.readFileSync(path.join(root,'scripts/foundation-review.js'),'utf8').replace('[...pcBmoBatches,...pcLindBatches,...pcVonBatches]','[...pcBmoBatches,...pcLindBatches,...pcVonBatches,...pcBrickBatches]');
review+='\n'+fs.readFileSync(path.join(root,'scripts/brick-growables-review.js'),'utf8');fs.writeFileSync(path.join(folder,'review.js'),review);
process.env.PANCAKE_EXPORT_LABEL='Brick Commercial Offices';process.env.PANCAKE_REVIEW_SCRIPT='.tools/brick-integration/review.js';require('./export-von-growables.cjs');
