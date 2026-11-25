const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const strip=source=>source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');
function applyTraditionalOfficeIntegration(source){
  const replace=(before,after)=>{
    assert.equal(source.split(before).length,2,'Traditional Office boundary changed: '+before);
    source=source.replace(before,()=>after);
  };
  const batch=strip(read('benchmark/shared/batched-architecture.js'));
  const model=strip(read('architecture/original-traditional-offices/model.js'));
  const code='function pcTraditionalPackage(T){\n'+batch+'\n'+model+'\nreturn {definition,TraditionalOfficeGenerator};\n}\n'+read('web/features/lightweight-traditional-offices.js');
  replace('const pcGrowableDefinitions=',code+'\nconst pcGrowableDefinitions=');
  replace('function pcGrowableFind(key){','function pcGrowableFind(key){const traditional=pcTraditionalDefinitions.find(d=>d.key===key);if(traditional)return traditional;');
  replace('function pcGrowablePlacement(property,asset){','function pcGrowablePlacement(property,asset){if(asset.model.format==="lightweight-traditional")return asset.record?pcCurvedPlacement(property,asset):null;');
  replace('function pcGrowableChoose(collection,property,forPaint=false){','function pcGrowableChoose(collection,property,forPaint=false){const traditional=pcTraditionalChoose(collection,property,forPaint);if(traditional)return traditional;');
  replace('return pcVaultChoose(collection,property,forPaint,true);','return pcVaultChoose(collection,property,forPaint,true)||pcTraditionalChoose(collection,property,forPaint,true);');
  replace("...(asset.model.format==='lightweight-vault'?{lightweightVault:structuredClone(asset.record)}:{})",
    "...(asset.model.format==='lightweight-vault'?{lightweightVault:structuredClone(asset.record)}:{}),...(asset.model.format==='lightweight-traditional'?{lightweightTraditional:structuredClone(asset.record)}:{})");
  replace('pcVaultRemember(collection,property,asset);','pcVaultRemember(collection,property,asset);pcTraditionalRemember(collection,property,asset);');
  replace('curveds=[],vaults=[];','curveds=[],vaults=[],traditionals=[];');
  replace("if(asset.model.format==='lightweight-vault'){vaults.push","if(asset.model.format==='lightweight-traditional'){traditionals.push(...buildings);continue;}if(asset.model.format==='lightweight-vault'){vaults.push");
  replace('pcBmoFlush(vaults,group,pcVaultAdapter);','pcBmoFlush(vaults,group,pcVaultAdapter);pcTraditionalFlush(traditionals,group);');
  replace('pcCurvedUpdateLOD(ut.position)&&(w(),I.requestShadows()),','pcTraditionalUpdateLOD(ut.position)&&(w(),I.requestShadows()),pcCurvedUpdateLOD(ut.position)&&(w(),I.requestShadows()),');
  replace('pcVaultRuntime?.generator.prune();E={','pcVaultRuntime?.generator.prune();pcTraditionalRuntime?.generator.prune();E={');
  replace('lightweightVault:pcVaultHistory(this)}','lightweightVault:pcVaultHistory(this),lightweightTraditional:pcTraditionalHistory(this)}');
  replace('s=pcVaultRestore(this,i?.lightweightVault)||s;','s=pcVaultRestore(this,i?.lightweightVault)||s;s=pcTraditionalRestore(this,i?.lightweightTraditional)||s;');
  replace('pcVaultInitControls(Vh);','pcVaultInitControls(Vh);pcTraditionalInitControls(Vh);');
  replace('window.__sandbox={experimentalVaults:','window.__sandbox={experimentalTraditional:{setControl:pcTraditionalSetControl,fit:pcTraditionalFit,info:pcTraditionalInfo,history:pcTraditionalHistory},experimentalVaults:');
  replace('function pcFacadeRecord(b){return b.office?.lightweightVault','function pcFacadeRecord(b){return b.office?.lightweightTraditional||b.office?.lightweightVault');
  replace('function pcFacadeParts(b){if(b.office?.lightweightVault','function pcFacadeParts(b){if(b.office?.lightweightTraditional||b.office?.lightweightVault');
  for(const boundary of ['const front=','const doorX=','doorHalf=','const rings=','...(('])
    replace(boundary+'b.office.lightweightVault||b.office.lightweightCurved',boundary+'b.office.lightweightTraditional||b.office.lightweightVault||b.office.lightweightCurved');
  return source;
}
module.exports={applyTraditionalOfficeIntegration};
