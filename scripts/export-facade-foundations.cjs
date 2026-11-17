// Reuse the existing offline exporter and actual-game neighbourhood fixture.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..'),folder=path.join(root,'.tools/facade-foundations');fs.mkdirSync(folder,{recursive:true});
let review=fs.readFileSync(path.join(root,'scripts/von-growables-review.js'),'utf8');
const marker='ll.setMap(map);await Gt.setTerrain(map,_e);';assert.equal(review.split(marker).length,2);
review=review.replace(marker,"if(new URLSearchParams(location.search).has('foundation-slope')){map.heightAt=(x,z)=>30+x*.025+z*.018;map.landHeightAt=map.heightAt;map.signature+=':foundation-slope';map.revision=(map.revision||0)+1;}"+marker);
review+='\n'+fs.readFileSync(path.join(root,'scripts/foundation-review.js'),'utf8');fs.writeFileSync(path.join(folder,'review.js'),review);
process.env.PANCAKE_EXPORT_LABEL='Facade Foundations';process.env.PANCAKE_REVIEW_SCRIPT='.tools/facade-foundations/review.js';require('./export-von-growables.cjs');
