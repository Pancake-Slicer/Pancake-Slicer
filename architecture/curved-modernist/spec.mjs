// Original experimental architecture. Metres, Y-up, +Z primary frontage.
export const VERSION='0.1.0';
export const ARCHETYPES=Object.freeze(['A','B','C']);
export function normalizeSpecification(a={}){
 const archetype=a.archetype||'A';if(!ARCHETYPES.includes(archetype))throw Error('Unknown curved design');
 const s={family:'original-curved-modernist',version:VERSION,id:a.id||'curved-'+archetype,name:a.name||({A:'Arcus Corporate Tower',B:'Crescent Plaza',C:'Facet Point'}[archetype]),seed:String(a.seed??1138),archetype,width:a.width??({A:48,B:67.2,C:55.2}[archetype]),depth:a.depth??({A:40.8,B:43.2,C:43.2}[archetype]),storeys:a.storeys??({A:48,B:34,C:62}[archetype]),floorHeight:3.4,palette:a.palette??({A:0,B:2,C:1}[archetype]),podium:null};
 if(a.family&&a.family!==s.family||a.version&&a.version!==VERSION)throw Error('Unknown curved template version');
 if(!Number.isInteger(s.storeys)||s.storeys<20||s.storeys>70)throw Error('20–70 whole storeys required');
 if(!Number.isInteger(s.palette)||s.palette<0||s.palette>3)throw Error('Unknown coordinated palette');
 for(const k of ['width','depth'])if(!Number.isFinite(s[k])||s[k]<(k==='width'&&archetype==='B'?43.2:28.8)||s[k]>(k==='width'?86.4:67.2)||Math.abs(s[k]/2.4-Math.round(s[k]/2.4))>1e-6)throw Error('Unsupported complete2.4m planning module');
 if(archetype==='B'&&s.width/s.depth<1.15||archetype==='A'&&(s.width/s.depth<1.15||s.width/s.depth>1.7)||s.storeys*3.4/(Math.min(s.width,s.depth)*.8)>8.5)throw Error('Incompatible architectural proportions');return s;
}
function rounded(points,r=.14){const ring=[];for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],v=points[i],c=points[(i+1)%points.length],p=v.map((n,j)=>n+(a[j]-n)*r),q=v.map((n,j)=>n+(c[j]-n)*r);ring.push(p);for(let j=1;j<=12;j++){const t=j/12;ring.push([(1-t)**2*p[0]+2*(1-t)*t*v[0]+t*t*q[0],(1-t)**2*p[1]+2*(1-t)*t*v[1]+t*t*q[1]]);}}return ring;}
export function footprint(s,scale=1,offset=[0,0]){const w=s.width*scale,d=s.depth*scale;let ring;
 if(s.archetype==='A')ring=Array.from({length:192},(_,i)=>{const t=-i/192*Math.PI*2;return [w*.5*Math.sin(t),d*.5*Math.cos(t)];});
 if(s.archetype==='B'){ring=[];for(let i=0;i<=96;i++){const t=-Math.PI/2+i/96*Math.PI;ring.push([w*.5*Math.sin(t),d*(.22-.72*Math.cos(t))]);}for(let i=0;i<=96;i++){const t=Math.PI/2-i/96*Math.PI,x=w*.4*Math.sin(t);ring.push([x,Math.abs(x)<4?d*.06:d*(.5-.44*Math.cos(t))]);}}
 if(s.archetype==='C')ring=rounded([[-w*.48,-d*.35],[-w*.05,-d*.5],[w*.48,-d*.18],[w*.44,d*.36],[w*.16,d*.5],[-w*.32,d*.5],[-w*.5,d*.15]],.18);
 return ring.map(([x,z])=>[x+offset[0],z+offset[1]]);
}
export function massing(input){const s=normalizeSpecification(input),w=s.width,d=s.depth,h=s.storeys,podium=s.archetype==='B'?3:2,sections=[],add=(name,start,end,scale,topScale=scale,offset=[0,0])=>sections.push({name,start,end,ring:footprint(s,scale,offset),topRing:footprint(s,topScale,offset)});
 // The crescent keeps its concave court through the podium and tower, never a filled oval.
 const groundRing=s.archetype==='A'?rounded([[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],.22):footprint(s);
 sections.push({name:'integrated commercial podium',start:0,end:podium,ring:groundRing,topRing:groundRing,podium:true});
 if(s.archetype==='A'){add('elliptical corporate shaft',podium,h-10,.85);add('continuous tapered upper section',h-10,h,.85,.70);}
 if(s.archetype==='B'){add('broad crescent shaft',podium,h-4,.87);add('recessed crescent attic',h-4,h,.82);}
 if(s.archetype==='C'){add('asymmetric curved-angular shaft',podium,h-10,.88);add('first offset setback',h-10,h-6,.78,.78,[-w*.012,-d*.008]);add('second offset setback',h-6,h-3,.68,.68,[-w*.024,-d*.016]);add('flat architectural crown',h-3,h,.58,.58,[-w*.036,-d*.024]);}
 const entrance={x:s.archetype==='C'?-w*.08:0,z:s.archetype==='B'?d*.06:d/2,width:s.archetype==='B'?9:7.2,doorWidth:s.archetype==='B'?7:5.2,height:5.8};
 return {sections,groundRing,entrance,volumes:[],roof:h*s.floorHeight,roofTop:h*s.floorHeight+(s.archetype==='A'?3.3:s.archetype==='B'?2.6:2.1),identity:{A:'freestanding ellipse / tapered summit / recessed rectangular plant',B:'crescent court / broad arc / planted podium',C:'asymmetric rounded polygon / offset setbacks / flat blade crown'}[s.archetype]};
}
export function fitToLot(input,{width,depth,setback=.3}){const q=v=>Math.floor((v-2*setback-2.2)/2.4)*2.4,w=q(width),d=input.archetype==='B'?Math.min(q(depth),Math.floor(w/1.4/2.4)*2.4):input.archetype==='A'?Math.min(q(depth),Math.floor(w*.76/2.4)*2.4):q(depth);return normalizeSpecification({...input,width:Math.round(w*10)/10,depth:Math.round(d*10)/10});}
export const curvedTemplate=Object.freeze({id:'original-curved-modernist',version:VERSION,family:'office',maximumLot:{width:88.4,depth:69.2},ratios:()=>[1,.96,.92,.86,.8,.72],envelopeMargin:2.2,normalize:normalizeSpecification,fit:fitToLot,layout:massing});
