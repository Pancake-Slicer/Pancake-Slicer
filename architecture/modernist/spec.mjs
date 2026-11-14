// Architectural rules and reproducible data only; independent of Three.js.
export const VERSION='1.0.0';
export const FAMILY='ohneeohnee-international';
export const PRESETS=Object.freeze([
 {name:'Compact court',storeys:8,bays:[14,10],roof:'parapet'},
 {name:'Broad commercial slab',storeys:12,bays:[24,14],roof:'recessed'},
 {name:'Slender urban office',storeys:18,bays:[12,10],roof:'screened'},
 {name:'Lobby and low podium',storeys:22,bays:[16,12],podium:3,roof:'parapet'},
 {name:'Rectangular curtain tower',storeys:26,bays:[20,14],roof:'recessed'},
 {name:'Mechanical penthouse',storeys:30,bays:[16,12],roof:'penthouse'},
 {name:'Broad podium tower',storeys:35,bays:[18,14],podium:4,roof:'screened'},
 {name:'Slender high-rise',storeys:40,bays:[12,12],roof:'penthouse'},
 {name:'Restrained upper setbacks',storeys:45,bays:[18,14],setback:34,roof:'recessed'},
 {name:'Paired-bay headquarters',storeys:25,bays:[22,12],roof:'screened',rhythm:'paired'}
]);
function random(seed){let a=2166136261;for(const c of String(seed))a=Math.imul(a^c.charCodeAt(0),16777619);return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function identifier(seed){let h=14695981039346656037n;for(const c of String(seed))h=BigInt.asUintN(64,(h^BigInt(c.codePointAt(0)))*1099511628211n);return h.toString(16).padStart(16,'0');}
export function createSpecification(seed='1138',index=0,revision=0){
 const preset=PRESETS[index];if(!preset)throw Error('Choose one of the ten benchmark archetypes');
 const rand=random(seed+':'+index+':'+revision),pick=a=>a[Math.floor(rand()*a.length)],bays=preset.bays.map(n=>n+pick([-2,0,2])),bay=pick([1.9,2,2.1]),floorHeight=pick([3.45,3.6,3.75]);
 const s={schemaVersion:1,generatorVersion:VERSION,family:FAMILY,id:`ohnee-family-${identifier(seed)}-${index+1}-${revision}`,seed:String(seed),archetype:index,revision,name:preset.name,storeys:preset.storeys,floorHeight,lobbyHeight:pick([4.6,4.8,5]),bay,widthBays:bays[0],depthBays:bays[1],structuralBays:preset.rhythm==='paired'?2:pick([2,3]),mullion:pick([.05,.055,.06]),spandrel:Math.round(floorHeight*pick([.29,.31,.33])*100)/100,visionRail:pick([true,false]),rhythm:preset.rhythm||'continuous',palette:pick(['silver','blue-grey','warm-grey','graphite']),podium:preset.podium?{storeys:preset.podium,widthBays:bays[0]+(index===6?6:4),depthBays:bays[1]+4}:null,setback:preset.setback?{atStorey:preset.setback,widthBays:bays[0]-4,depthBays:bays[1]-2}:null,roof:preset.roof,entrance:pick(['flush','recessed','canopy']),columns:!!preset.podium};
 validateSpecification(s);return s;
}
export function validateSpecification(s){
 const fail=m=>{throw Error('Architectural rule: '+m);};
 if(s.family!==FAMILY||s.generatorVersion!==VERSION)fail('unknown family/version');
 for(const k of ['storeys','widthBays','depthBays','structuralBays'])if(!Number.isInteger(s[k]))fail(k+' must be whole modules');
 if(s.storeys<6||s.storeys>50||s.widthBays<8||s.depthBays<8||s.widthBays>32||s.depthBays>24)fail('massing outside studied range');
 if(!(s.floorHeight>=3.3&&s.floorHeight<=3.9&&s.lobbyHeight>=4.3&&s.lobbyHeight<=5.4&&s.bay>=1.8&&s.bay<=2.2))fail('floor/bay module outside range');
 if(!(s.spandrel>=.8&&s.spandrel<=1.35&&s.mullion>=.045&&s.mullion<=.075&&s.structuralBays>=2&&s.structuralBays<=3))fail('curtain-wall module outside range');
 const vision=s.floorHeight-s.spandrel-.2;if((s.bay-.08)/vision<.68||(s.bay-.08)/vision>1.15)fail('vision-pane proportions');
 if(!['parapet','recessed','penthouse','screened'].includes(s.roof)||!['flush','recessed','canopy'].includes(s.entrance)||!['silver','blue-grey','warm-grey','graphite'].includes(s.palette)||!['continuous','paired'].includes(s.rhythm))fail('incompatible system');
 if(s.podium){const p=s.podium;if(!Number.isInteger(p.storeys)||p.storeys<2||p.storeys>5||p.storeys>=s.storeys/3)fail('podium height');for(const k of ['widthBays','depthBays'])if(!Number.isInteger(p[k])||p[k]<s[k]||p[k]>s[k]*1.65||(p[k]-s[k])%2)fail('podium must meet the tower grid');}
 if(s.setback){const t=s.setback;if(!Number.isInteger(t.atStorey)||t.atStorey<s.storeys*.6||t.atStorey>s.storeys-3)fail('setback position');for(const k of ['widthBays','depthBays'])if(!Number.isInteger(t[k])||t[k]<8||t[k]>=s[k]||(s[k]-t[k])%2)fail('setback must resolve on whole structural modules');}
 if((s.lobbyHeight+(s.storeys-1)*s.floorHeight)/Math.min(s.widthBays*s.bay,s.depthBays*s.bay)>8)fail('excessive slenderness');return s;
}
export function floorBase(s,floor){return floor===0?0:s.lobbyHeight+(floor-1)*s.floorHeight;}
export function tiers(s){
 validateSpecification(s);const result=[],pod=s.podium?.storeys||0;
 if(pod)result.push({start:0,end:pod,widthBays:s.podium.widthBays,depthBays:s.podium.depthBays});
 result.push({start:pod,end:s.setback?.atStorey||s.storeys,widthBays:s.widthBays,depthBays:s.depthBays});
 if(s.setback)result.push({start:s.setback.atStorey,end:s.storeys,widthBays:s.setback.widthBays,depthBays:s.setback.depthBays});return result;
}
export function benchmark(seed='1138'){return PRESETS.map((_,i)=>createSpecification(seed,i));}
