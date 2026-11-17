
export const VERSION='1.0.0';
export function normalizeSpecification(input={}){
 const s={family:'von-badel-international',version:VERSION,id:input.id||'von-badel',name:input.name||'Von Badel International office',seed:String(input.seed??'1138'),width:input.width??42,depth:input.depth??35,storeys:input.storeys??40,floorHeight:input.floorHeight??3.6,targetBay:input.targetBay??3.5,podium:null};
 if(input.family&&input.family!==s.family||input.version&&input.version!==VERSION)throw Error('Unknown Von Badel family/version');
 for(const [k,min,max]of [['width',18,68],['depth',16,54],['storeys',12,52],['floorHeight',3.5,3.8],['targetBay',3.3,3.9]])if(!Number.isFinite(s[k])||s[k]<min||s[k]>max)throw Error('Unsupported Von Badel '+k);
 if(!Number.isInteger(s.storeys)||s.storeys*s.floorHeight/Math.min(s.width,s.depth)>9)throw Error('Unsupported tower proportions');
 if(input.podium){const p=input.podium===true?{}:input.podium;s.podium={width:p.width??s.width+10,depth:p.depth??s.depth+6,storeys:p.storeys??Math.max(3,Math.round(s.storeys*.27))};if(!Number.isInteger(s.podium.storeys)||s.podium.storeys<3||s.podium.storeys>s.storeys*.4||s.podium.width<s.width+4||s.podium.depth<s.depth+4||s.podium.width>82||s.podium.depth>68)throw Error('Unsupported podium');}
 return s;
}
export function bayGrid(length,target){const count=Math.max(3,Math.round((length-1.2)/target)),clear=length-1.2;return {count,pitch:clear/count,clear,windowWidth:1.5};}
export function massing(input){const s=normalizeSpecification(input),volumes=[],p=s.podium;const add=(name,width,depth,start,end)=>volumes.push({name,width,depth,start,end,front:bayGrid(width,s.targetBay),side:bayGrid(depth,s.targetBay)});if(p)add('podium',p.width,p.depth,0,p.storeys);add('straight shaft',s.width,s.depth,p?.storeys||0,s.storeys);return {volumes,roof:{level:s.storeys*s.floorHeight,height:3.6}};}
export function fitToLot(input,{width,depth,setback=.3}){const round=n=>Math.floor((n+1e-8)*10)/10,w=round(width-2*setback-1.8),d=round(depth-2*setback-1.8),next={...input,width:w,depth:d};if(input.podium){next.width=round(w*.75);next.depth=round(d*.83);next.podium={width:w,depth:d,storeys:input.podium.storeys??Math.max(3,Math.round((input.storeys||40)*.27))};}return normalizeSpecification(next);}
export const vonTemplate=Object.freeze({id:'von-badel-lightweight',version:VERSION,family:'office',maximumLot:{width:70.4,depth:56.4},envelopeMargin:1.8,normalize:normalizeSpecification,fit:fitToLot,layout:massing});
