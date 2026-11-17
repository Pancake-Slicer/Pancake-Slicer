
export const VERSION='1.0.0';
export function normalizeSpecification(input={}){
 const s={family:'brick-commercial-office',version:VERSION,id:input.id||'brick-office',name:input.name||'Brick Commercial Office',seed:String(input.seed??'1138'),width:input.width??34,depth:input.depth??28,storeys:input.storeys??26,floorHeight:input.floorHeight??3.65,targetBay:input.targetBay??3.2,podium:null};
 if(input.family&&input.family!==s.family||input.version&&input.version!==VERSION)throw Error('Unknown brick office family/version');
 for(const [k,min,max]of [['width',18,60],['depth',16,54],['storeys',12,42],['floorHeight',3.6,3.8],['targetBay',3.1,3.5]])if(!Number.isFinite(s[k])||s[k]<min||s[k]>max)throw Error('Unsupported brick office '+k);
 if(!Number.isInteger(s.storeys)||s.storeys*s.floorHeight/Math.min(s.width,s.depth)>7.5)throw Error('Unsupported brick tower proportions');return s;
}
export function bayGrid(length,target){const clear=length-1.5,count=Math.max(4,Math.round(clear/target));return {count,pitch:clear/count,clear,windowWidth:1.65};}
export function massing(input){const s=normalizeSpecification(input),cut=s.storeys-3,volume=(name,width,depth,start,end)=>({name,x:0,z:0,width,depth,start,end,front:bayGrid(width,s.targetBay),side:bayGrid(depth,s.targetBay)});return {volumes:[volume('brick shaft',s.width,s.depth,0,cut),volume('recessed crown',s.width-1.6,s.depth-1.6,cut,s.storeys)],roof:{level:s.storeys*s.floorHeight,height:3.4}};}
export function fitToLot(input,{width,depth,setback=.3}){const round=n=>Math.floor((n+1e-8)*10)/10;return normalizeSpecification({...input,width:round(width-2*setback-2),depth:round(depth-2*setback-2)});}
export const brickTemplate=Object.freeze({id:'brick-commercial-lightweight',version:VERSION,family:'office',maximumLot:{width:62.6,depth:56.6},envelopeMargin:2,normalize:normalizeSpecification,fit:fitToLot,layout:massing});
