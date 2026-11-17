
export const VERSION='1.0.0';
export function normalizeSpecification(input={}){
 const s={family:'brick-commercial-office',version:VERSION,architectureRevision:2,id:input.id||'brick-office',name:input.name||'Brick Commercial Office',seed:String(input.seed??'1138'),width:input.width??34,depth:input.depth??28,storeys:input.storeys??26,floorHeight:input.floorHeight??3.65,targetBay:input.targetBay??3.2,podium:null};
 if(input.family&&input.family!==s.family||input.version&&input.version!==VERSION)throw Error('Unknown brick office family/version');
 for(const [k,min,max]of [['width',18,60],['depth',16,54],['storeys',12,42],['floorHeight',3.6,3.8],['targetBay',3.1,3.5]])if(!Number.isFinite(s[k])||s[k]<min||s[k]>max)throw Error('Unsupported brick office '+k);
 if(!Number.isInteger(s.storeys)||s.storeys*s.floorHeight/Math.min(s.width,s.depth)>7.5)throw Error('Unsupported brick tower proportions');return s;
}

export function bayGrid(length,target){const clear=length-1.1,count=Math.max(1,Math.round(clear/target));if(clear/count<2.5)throw Error('H-plan face too narrow for masonry bays');return {count,pitch:clear/count,clear,windowWidth:1.65};}
export function massing(input){
 const s=normalizeSpecification(input),w=s.width,d=s.depth,wingWidth=Math.round(w*.28*10)/10,gap=w-2*wingWidth,coreDepth=Math.round(d*.46*10)/10,cut=s.storeys-Math.max(3,Math.min(9,Math.round(s.storeys*.22))),baseFloors=Math.max(2,Math.min(5,Math.round(s.storeys*.12))),volumes=[];
 const add=(name,x,width,depth,start,end)=>volumes.push({name,x,z:0,width,depth,start,end,front:bayGrid(width,s.targetBay),side:bayGrid(depth,s.targetBay)});
 for(const [name,x,width,depth,end]of [['left wing',-(w-wingWidth)/2,wingWidth,d,s.storeys],['recessed connector',0,gap,coreDepth,s.storeys-1],['right wing',(w-wingWidth)/2,wingWidth,d,s.storeys]]){add(name,x,width,depth,0,cut);add(name+' limestone crown',x,width,depth,cut,end);}
 const outline=[[-w/2,-d/2],[-gap/2,-d/2],[-gap/2,-coreDepth/2],[gap/2,-coreDepth/2],[gap/2,-d/2],[w/2,-d/2],[w/2,d/2],[gap/2,d/2],[gap/2,coreDepth/2],[-gap/2,coreDepth/2],[-gap/2,d/2],[-w/2,d/2]].map(([x,z])=>({x,z}));
 return {volumes,outline,wingWidth,gap,coreDepth,recess:(d-coreDepth)/2,baseFloors,crownStart:cut,roof:{level:s.storeys*s.floorHeight,height:2.2},entrance:{x:0,z:coreDepth/2}};
}
export function fitToLot(input,{width,depth,setback=.3}){const round=n=>Math.floor((n+1e-8)*10)/10,s=normalizeSpecification({...input,width:round(width-2*setback-2),depth:round(depth-2*setback-2)});if(s.width<28||s.depth<24||s.width/s.depth>1.9||s.depth/s.width>1.6)throw Error('Lot cannot preserve both H-plan wings and recessed connector');massing(s);return s;}
export const brickTemplate=Object.freeze({id:'brick-commercial-lightweight',version:VERSION,family:'office',maximumLot:{width:62.6,depth:56.6},envelopeMargin:2,normalize:normalizeSpecification,fit:fitToLot,layout:massing});
