// Data/compatibility contract only. Units: metres; +Z frontage; Y-up.
export const VERSION='1.0.0';
export const FAMILY='bmo-inspired-horizontal-office';
const finite=(v,name,min,max)=>{if(!Number.isFinite(v)||v<min||v>max)throw Error(`${name} must be ${min}–${max}`);return v;};
export function normalizeSpecification(input={}){
 const s={version:VERSION,family:FAMILY,id:input.id||'bmo-study',name:input.name||'Silver horizontal office',width:input.width??34,depth:input.depth??28,storeys:input.storeys??25,floorHeight:input.floorHeight??3.65,lobbyHeight:input.lobbyHeight??4.8,bandRatio:input.bandRatio??.58,cornerWidth:input.cornerWidth??1.2,targetBay:input.targetBay??2.4,frontBays:input.frontBays??null,sideBays:input.sideBays??null,capHeight:input.capHeight??4.6,penthouseHeight:input.penthouseHeight??4.8,equipmentCount:input.equipmentCount??2,podium:null};
 if(typeof s.id!=='string'||!s.id||typeof s.name!=='string'||!s.name)throw Error('Stable text id and name required');
 if(input.family&&input.family!==FAMILY)throw Error('Unknown BMO architectural family');
 if(input.version&&input.version!==VERSION)throw Error('Unknown BMO template version');
 finite(s.width,'Tower width',16,68);finite(s.depth,'Tower depth',14,54);finite(s.storeys,'Storeys',8,55);if(!Number.isInteger(s.storeys))throw Error('Whole storeys required');
 finite(s.floorHeight,'Floor height',3.3,4.1);finite(s.lobbyHeight,'Lobby height',4.2,5.8);finite(s.bandRatio,'Band ratio',.46,.62);finite(s.cornerWidth,'Corner width',.9,1.8);finite(s.targetBay,'Target bay',1.8,3.2);finite(s.capHeight,'Cap height',1.8,6.5);finite(s.penthouseHeight,'Penthouse height',3,7);finite(s.equipmentCount,'Equipment count',0,6);if(!Number.isInteger(s.equipmentCount))throw Error('Whole equipment count required');
 if(input.podium){const p=input.podium===true?{}:input.podium;s.podium={storeys:p.storeys??4,width:p.width??s.width+12,depth:p.depth??s.depth+10};finite(s.podium.storeys,'Podium floors',2,6);if(!Number.isInteger(s.podium.storeys)||s.podium.storeys>=s.storeys/3)throw Error('Podium must be a low, whole-storey base');finite(s.podium.width,'Podium width',s.width+4,84);finite(s.podium.depth,'Podium depth',s.depth+4,68);}
 if((s.lobbyHeight+(s.storeys-1)*s.floorHeight)/Math.min(s.width,s.depth)>10)throw Error('Tower is too slender for this studied family');
 resolveGrid(s.width,s.depth,s);if(s.podium)resolveGrid(s.podium.width,s.podium.depth,{...s,frontBays:null,sideBays:null});return s;
}
export function resolveGrid(width,depth,s){
 const resolve=(length,count)=>{const clear=length-s.cornerWidth*2,n=count??Math.round(clear/s.targetBay);if(!Number.isInteger(n)||n<3||n>42)throw Error('Bay count must be a whole number between 3 and 42');const pitch=clear/n;if(pitch<1.8||pitch>3.2)throw Error('Bay count incompatible with footprint: retain 1.8–3.2m pitch');return {count:n,pitch,clear};};
 return {front:resolve(width,s.frontBays),side:resolve(depth,s.sideBays)};
}
export function floorBase(s,f){return f===0?0:s.lobbyHeight+(f-1)*s.floorHeight;}
// Fit the full native envelope, including projecting bands/threshold. Never
// apply Object3D scale. Rebuild dimensions and bay grids, reject cramped lots.
export function fitToLot(input,{width,depth,setback=.3}){
 finite(width,'Lot width',1,150);finite(depth,'Lot depth',1,150);finite(setback,'Setback',0,8);
 const round=n=>Math.floor((n+1e-8)*10)/10,w=round(width-setback*2-1.2),d=round(depth-setback*2-1.2),next={...input,frontBays:null,sideBays:null};
 if(input.podium){const old=normalizeSpecification(input);next.podium={...old.podium,width:w,depth:d};next.width=Math.min(w-4,Math.max(16,w*old.width/old.podium.width));next.depth=Math.min(d-4,Math.max(14,d*old.depth/old.podium.depth));}
 else{next.width=w;next.depth=d;}
 next.width=round(next.width);next.depth=round(next.depth);return normalizeSpecification(next);
}
export function fiveVariations(){return [
 {id:'bmo-narrow-15',name:'01 · Narrow / 15 storeys',width:24,depth:20,storeys:15},
 {id:'bmo-medium-25',name:'02 · Medium / 25 storeys',width:34,depth:28,storeys:25},
 {id:'bmo-broad-35',name:'03 · Broad / 35 storeys',width:50,depth:34,storeys:35},
 {id:'bmo-tall-45',name:'04 · Tall / 45 storeys',width:36,depth:30,storeys:45},
 {id:'bmo-podium-40',name:'05 · Podium / 40 storeys',width:40,depth:30,storeys:40,podium:{storeys:4,width:54,depth:40}}
 ].map(normalizeSpecification);}
