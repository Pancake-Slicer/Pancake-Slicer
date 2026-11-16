const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
exports.host=function(){
 const source=fs.readFileSync(path.join(__dirname,'../web/assets/game.bundle.js'),'utf8');
 const context=vm.createContext({console,performance,structuredClone,atob,URL,location:{href:'http://localhost/'},document:{createElement:()=>({relList:{supports:()=>true}})}});
 const stop=source.indexOf('const LP=');if(stop<0)throw Error('Recovered runtime boundary changed');
 vm.runInContext(source.slice(0,stop)+';globalThis.api={Te,je,sn,Bo,cS,facing:pcGrowableFacing,zb,qb,pcOfficePlots};',context);
 return context.api;
};
exports.lots=function(){
 const rect=(w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
 return [['Narrow',24,26,0,rect(24,26)],['Wide podium',64,34,0,rect(64,34)],['Deep',32,56,0,rect(32,56)],['Rotated',42,32,.43,rect(42,32)],['Irregular',58,44,0,[[-29,-22],[28,-22],[22,22],[-24,22]]]].map(([name,w,d,angle,ring],i)=>({id:'lightweight-lot-'+i,name,zone:'offices',x:0,z:0,y:0,rotation:angle,towardRoad:{x:Math.sin(angle),z:Math.cos(angle)},footprint:ring.map(([x,z])=>({x:x*Math.cos(angle)+z*Math.sin(angle),z:z*Math.cos(angle)-x*Math.sin(angle)})),entrance:{x:Math.sin(angle)*d/2,z:Math.cos(angle)*d/2},parameters:{id:'phase1-'+i,name,storeys:[18,30,25,25,25][i],...(i===1?{podium:{storeys:4,width:54,depth:32},width:40,depth:24}:{})}}));
};
