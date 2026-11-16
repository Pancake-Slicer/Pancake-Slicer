// Independent parametric family; approved Lind and all prior generators stay immutable.
export const VERSION='1.0.0',FAMILY='lind-stepped-art-deco';
export function hash(text){let n=2166136261;for(const c of String(text))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
const range=(v,name,min,max)=>{if(!Number.isFinite(v)||v<min||v>max)throw Error(`${name}: supported range ${min}–${max}`);return v;};
export function normalizeSpecification(input={}){
 const seed=String(input.seed??input.id??'lind-study'),s={family:FAMILY,version:VERSION,id:input.id??'lind-study',name:input.name??'Parametric Lind study',seed,variant:input.variant??hash(seed)%3,width:input.width??44.4,depth:input.depth??29.6,storeys:input.storeys??48,floorHeight:input.floorHeight??3.7,targetBay:input.targetBay??3.7,podium:null,roof:'lind-hipped-crown',palette:'catalogue-limestone'};
 if(input.family&&input.family!==FAMILY||input.version&&input.version!==VERSION)throw Error('Unknown Lind family/version');
 if(input.roof&&input.roof!==s.roof||input.palette&&input.palette!==s.palette)throw Error('Unsupported Lind roof/palette');
 if(typeof s.id!=='string'||!s.id||typeof s.name!=='string'||!s.name)throw Error('Stable text id/name required');
 range(s.width,'Width',22,68);range(s.depth,'Depth',20,54);range(s.storeys,'Storeys',18,52);range(s.floorHeight,'Floor height',3.5,3.9);range(s.targetBay,'Bay pitch',3.3,4.1);range(s.variant,'Variant',0,2);
 if(!Number.isInteger(s.storeys)||!Number.isInteger(s.variant))throw Error('Whole storeys and variant required');
 if(s.storeys*s.floorHeight/Math.min(s.width,s.depth)>8.5)throw Error('Lind family too slender for this lot');
 if(input.podium){const p=input.podium===true?{}:input.podium;s.podium={width:p.width??s.width+8,depth:p.depth??s.depth+6,storeys:p.storeys??4};range(s.podium.width,'Podium width',s.width,80);range(s.podium.depth,'Podium depth',s.depth,66);range(s.podium.storeys,'Podium floors',3,5);if(!Number.isInteger(s.podium.storeys))throw Error('Whole podium floors required');}
 return s;
}
export function bayGrid(length,target=3.7){
 if(length<3.1)throw Error('Tier too narrow for a proportional bay');const count=Math.max(1,Math.min(Math.floor(length/3.3),Math.round(length/target))),clear=Math.min(length,count*4.1);return {count,pitch:clear/count,clear,windowWidth:1.93};
}
// Ratios derive from approved Lind: 44.4×29.6m, 48 floor levels,
// 22.2m central shaft and 11.1m wings; upper levels33/38/43/48.
export function massing(input){
 const s=normalizeSpecification(input),w=s.width,d=s.depth,core=w*.5,cd=d*.625,z=-d*.0625,base=s.podium?.storeys??0,wingEnd=Math.round(s.storeys*(.43+s.variant*.012)),shoulder=wingEnd+Math.max(2,Math.round(s.storeys*.0625)),termination=shoulder+1,shaft=Math.round(s.storeys*.69),upper=Math.max(shaft+2,Math.round(s.storeys*.79)),lantern=Math.min(s.storeys-3,Math.max(upper+1,s.storeys-5)),crown=Math.min(core*.583,cd*.7),volumes=[];
 const add=(name,x,z,width,depth,start,end,kind='occupied')=>{if(end<=start)throw Error('Invalid tier allocation');const front=bayGrid(width,s.targetBay),side=bayGrid(depth,s.targetBay);volumes.push({name,x,z,width,depth,start,end,kind,front,side});};
 if(s.podium)add('street podium',0,0,s.podium.width,s.podium.depth,0,base);
 add('central shaft',0,z,core,cd,base,shaft);
 for(const sign of [-1,1]){const side=sign<0?'left':'right';add(side+' main wing',sign*(core/2+w*.125),0,w*.25,d*.875,base,wingEnd);add(side+' shoulder',sign*(core/2+w*.1042),-d*.03125,w*.2084,d*.75,wingEnd,shoulder);add(side+' termination',sign*(core/2+w*.08335),z,w*.1667,d*.625,shoulder,termination);}
 add('upper setback',0,z,Math.max(crown+2.4,core*.833),Math.max(crown+2.4,cd*.9),shaft,upper);
 add('upper lantern',0,z,Math.max(crown+1.2,core*.667),Math.max(crown+1.2,cd*.8),upper,lantern);
 add('crown drum',0,z,crown,crown,lantern,s.storeys,'louvred');
 return {volumes,crown:{width:crown,depth:crown,z,base:s.storeys*s.floorHeight+.9,peak:s.storeys*s.floorHeight+.9+Math.max(3.2,Math.min(5.4,crown*.416))}};
}
export function fitToLot(input,{width,depth,setback=.3}){
 const round=n=>Math.floor((n+1e-8)*10)/10,w=round(width-2*setback-1.8),d=round(depth-2*setback-1.8),next={...input};
 if(input.podium){next.width=round(w-6);next.depth=round(d-4);next.podium={storeys:input.podium.storeys??4,width:w,depth:d};}else{next.width=w;next.depth=d;}
 const s=normalizeSpecification(next);massing(s);return s;
}
export const lindTemplate=Object.freeze({id:'lind-stepped-lightweight',version:VERSION,family:'office',maximumLot:{width:70.4,depth:56.4},envelopeMargin:1.8,normalize:normalizeSpecification,fit:fitToLot,layout:s=>massing(s)});
