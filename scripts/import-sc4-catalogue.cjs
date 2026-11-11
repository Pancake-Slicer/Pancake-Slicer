// Curated visual observations of the 98 records on /c/13, 2026-11-11.
// Heights, colours and massing below are estimates from the supplied views,
// not dimensions published by the index. Metadata/lot options are source facts.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const observed={
  284:[1,'M','shop','#b7ab90','box','flat',.88,.82],283:[1,'M','shop','#b4b8ad','box','flat',.9,.86],282:[1,'M','shop','#c4bda5','notch','flat',.86,.9],
  281:[2,'I','glass','#918c79','mall','skylights',.95,.9],280:[4,'D','classic','#d3bd88','theatre','portal',.7,.8],279:[1,'M','shop','#d3c4a5','spa','hip',.6,.65],
  278:[1,'M','shop','#bfc0ac','garage','hip',.8,.7],277:[2,'I','glass','#adb9b3','showroom','flat',.8,.62],276:[2,'D','classic','#b9b0a0','box','portal',.75,.85],
  275:[3,'D','classic','#d0c5ab','round-corner','skylights',.88,.85],274:[4,'D','classic','#c0bba8','box','flat',.88,.84],273:[5,'I','glass','#adae9b','bow','flat',.88,.86],
  369:[1,'M','shop','#b7ad94','notch','flat',.88,.87],370:[4,'D','classic','#beb9a9','box','flat',.88,.84],371:[2,'M','ribbon','#bac2bd','slab','flat',.95,.5],
  373:[2,'M','shop','#94a18d','slab','gable-teal',.72,.94],372:[1,'M','shop','#b5b4a9','box','flat',.9,.86],374:[3,'M','ribbon','#b2b5ae','recessed','skylights',.82,.82],
  367:[5,'D','classic','#c2c4ba','box','flat',.9,.8],368:[5,'I','glass','#b0b09d','bow','flat',.88,.86],379:[3,'D','classic','#c8c9b9','box','glass-pyramid',.83,.83],
  378:[3,'I','glass','#b9bfbb','round-front','flat',.86,.84],377:[3,'D','classic','#c9c7b2','round-corner','skylights',.88,.85],376:[2,'D','classic','#bcb9ae','box','pediment',.85,.85],
  380:[3,'I','glass','#bcc3ca','slab','barrel',.88,.76],375:[2,'M','ribbon','#abb4a6','u-court','flat',.87,.84],285:[2,'M','shop','#bbc6b6','slab','gable-teal',.72,.94],
  286:[3,'M','ribbon','#b2b5ae','recessed','skylights',.82,.82],288:[6,'D','classic','#c2b89b','court','glasshouse',.9,.85],289:[3,'D','classic','#c6bca5','box','flat',.94,.9],
  287:[7,'M','ribbon','#c9d2d0','bow','flat',.9,.88],383:[6,'D','classic','#c2b89b','court','glasshouse',.9,.85],384:[3,'D','classic','#c6bca5','box','flat',.94,.9],
  385:[6,'I','glass','#bbc0b1','twin-core','flat',.88,.88],382:[7,'M','ribbon','#c9d2d0','bow','flat',.9,.88],381:[5,'D','brick','#906e58','court','terrace',.88,.86],
  296:[7,'D','classic','#c1b79d','box','pediment',.8,.86],386:[7,'D','brick','#955b43','box','glass-pyramid',.82,.82],297:[3,'D','classic','#d0c2a0','slab','portal',.82,.92],
  292:[4,'D','classic','#a49879','u-court','terrace',.94,.86],387:[12,'D','deco','#c0c1bc','notched','flat',.85,.85],388:[7,'D','classic','#c1b79d','box','pediment',.8,.86],
  389:[14,'I','glass','#b8a77f','round-front','flat',.82,.85],390:[10,'D','deco','#c7b99e','pencil','gothic',.72,.8],391:[10,'D','classic','#c6b597','notched','mansard-red',.84,.84],
  293:[14,'D','classic','#c9bfaa','hotel-wings','gold-domes',.88,.87],392:[16,'I','glass','#8a9488','fluted','solar',.78,.84],393:[9,'D','classic','#b19b80','steps','gable-dark',.85,.84],
  294:[7,'D','brick','#955b43','box','glass-pyramid',.82,.82],295:[10,'D','deco','#c7b99e','pencil','gothic',.72,.8],291:[4,'D','classic','#c6b9a0','box','portal',.9,.88],
  290:[6,'I','glass','#bbc0b1','twin-core','flat',.88,.88],395:[18,'D','classic','#b4a27e','twin-notch','terrace',.88,.86],394:[5,'D','brick','#886e60','box','terrace',.82,.85],
  298:[6,'D','classic','#b7a589','steps','gable-dark',.85,.85],397:[14,'D','deco','#bdc3b1','pencil','sail',.67,.8],301:[6,'D','brick','#9b7b61','court','terrace',.94,.87],
  300:[12,'D','deco','#c8c8be','fluted','flat',.88,.88],299:[10,'I','glass','#8a9294','box','flat',.91,.91],396:[5,'D','brick','#997757','l-shape','glass-pyramid',.88,.87],
  398:[6,'D','brick','#9b7b61','court','terrace',.94,.87],399:[16,'I','glass','#668099','oval','flat',.74,.87],400:[18,'D','brick','#b88a77','wedge','mansard-blue',.87,.86],
  401:[14,'I','ribbon','#9b9690','box','notch',.82,.88],402:[4,'M','ribbon','#896742','box-top','flat',.72,.78],302:[18,'I','glass','#98a7af','stepped-slab','flat',.86,.87],
  407:[17,'I','glass','#a2adb2','twin-core','flat',.83,.88],403:[10,'I','glass','#8a9294','box','flat',.91,.91],404:[12,'D','deco','#c8c8be','fluted','flat',.88,.88],
  405:[17,'D','classic','#b09a74','box','flat',.9,.88],406:[17,'D','classic','#b09d7d','box','roof-track',.9,.88],410:[22,'D','classic','#baad8b','box','terrace',.84,.85],
  306:[4,'M','ribbon','#b4b399','mall','skylights',.95,.94],409:[37,'I','glass','#687c8d','steps','helipad',.86,.9],411:[42,'I','glass','#8e9784','slab-core','flat',.8,.9],
  304:[4,'D','classic','#b2bca6','theatre','copper-domes',.9,.88],408:[24,'D','classic','#cbb8a4','box','terrace',.85,.86],305:[6,'D','classic','#cdc9bc','steps','flat',.9,.9],
  412:[55,'D','deco','#b1a393','pencil','gothic',.74,.8],413:[64,'I','ribbon','#7e96a0','oval','angled',.72,.9],303:[32,'D','classic','#b3a28d','hotel-wings','hip',.9,.87],
  414:[32,'M','ribbon','#b7b8aa','twin-notch','flat',.88,.88],415:[38,'I','glass','#8ba3b5','bow','flat',.78,.88],428:[46,'I','ribbon','#98aaa8','oval','flat',.76,.87],
  416:[48,'D','deco','#879079','steps','terrace',.86,.86],417:[66,'M','ribbon','#c5c6b5','steps','notch',.86,.9],422:[47,'I','glass','#76969e','slab-core','barrel-green',.78,.88],
  430:[64,'I','ribbon','#998478','octagon','dark-crown',.83,.85],429:[72,'I','glass','#aec3c5','oval-core','flat',.82,.9],427:[45,'D','brick','#977964','round-front','flat',.86,.86],
  426:[38,'I','glass','#4f7188','stepped-slab','flat',.82,.87],425:[48,'D','classic','#c6c4b6','hotel-wings','flat',.88,.86],423:[60,'D','deco','#b1a68e','cross','gothic',.85,.85],
  421:[55,'I','glass','#7187a3','notched','flat',.88,.88],420:[52,'D','classic','#b59d81','fluted','terrace',.86,.88],419:[55,'D','deco','#a9aaa0','cross','gothic',.85,.88],
  418:[45,'I','glass','#85a99d','bow','flat',.88,.9],424:[70,'D','deco','#c2bfb0','steps','gothic',.86,.88]
};
async function main(){
  const local=path.join(root,'.tools/sc4-reference/catalogue.json');
  let records;
  if(fs.existsSync(local))records=JSON.parse(fs.readFileSync(local,'utf8').replace(/^\uFEFF/,''));
  else{
    const response=await fetch('https://simcity4buildings.net/buildings.php');if(!response.ok)throw Error('Reference download failed');
    records=(await response.json()).filter(r=>Number(r.scb_typ)>5&&Number(r.scb_wohlstand)===3).map(r=>({id:Number(r.scb_id),name:r.scb_name_eng.replace(/&apos;/g,"'").replace(/&amp;/g,'&'),type:Number(r.scb_typ)===7?'office':'services',tileset:r.scb_set,stage:Number(r.scb_stage),lots:r.scb_lot,image:r.scb_image,source:'https://simcity4buildings.net/c/13/'+r.scb_id}));
  }
  if(records.length!==98||records.some(r=>!observed[r.id])||Object.keys(observed).length!==98)throw Error('Reference scope changed: review the catalogue before importing');
  const entries=records.map(record=>{const [floors,style,facade,colour,shape,roof,bodyWidth,bodyDepth]=observed[record.id];return {...record,lots:record.lots.split(','),estimatedFloors:floors,estimated:true,style:{D:'art-deco',I:'international',M:'modernist'}[style],facade,colour,shape,roof,bodyWidth,bodyDepth};});
  fs.writeFileSync(path.join(root,'reference/sc4-commercial-wealth3.json'),JSON.stringify({source:'https://simcity4buildings.net/c/13',reviewed:'2026-11-11',count:98,entries},null,2)+'\n');
  console.log('Imported all 98 curated commercial $$$ reference entries.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
