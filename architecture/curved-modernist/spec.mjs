import * as T from '../engine.js';
// Original experimental architecture. Metres, Y-up, +Z primary frontage.
export const VERSION='0.1.0';
export const ARCHETYPES=Object.freeze(['A','B','C']);
export function normalizeSpecification(a={}){
 if(a.revision!==undefined&&![1,2].includes(a.revision))throw Error('Unknown curved architecture revision');
 const archetype=a.archetype||'A';if(!ARCHETYPES.includes(archetype))throw Error('Unknown curved design');
 const s={family:'original-curved-modernist',version:VERSION,revision:a.revision??(a.family?1:2),id:a.id||'curved-'+archetype,name:a.name||({A:'Arcus Corporate Tower',B:'Crescent Plaza',C:'Facet Point'}[archetype]),seed:String(a.seed??1138),archetype,width:a.width??({A:48,B:67.2,C:55.2}[archetype]),depth:a.depth??({A:40.8,B:43.2,C:43.2}[archetype]),storeys:a.storeys??({A:48,B:34,C:62}[archetype]),floorHeight:3.4,palette:a.palette??({A:0,B:2,C:1}[archetype]),podium:null};
 if(a.family&&a.family!==s.family||a.version&&a.version!==VERSION)throw Error('Unknown curved template version');
 if(!Number.isInteger(s.storeys)||s.storeys<20||s.storeys>70)throw Error('20–70 whole storeys required');
 if(!Number.isInteger(s.palette)||s.palette<0||s.palette>3)throw Error('Unknown coordinated palette');
 for(const k of ['width','depth'])if(!Number.isFinite(s[k])||s[k]<(k==='width'&&archetype==='B'?43.2:28.8)||s[k]>(k==='width'?86.4:67.2)||Math.abs(s[k]/2.4-Math.round(s[k]/2.4))>1e-6)throw Error('Unsupported complete2.4m planning module');
 if(archetype==='B'&&s.width/s.depth<1.15||archetype==='A'&&(s.width/s.depth<1.15||s.width/s.depth>1.7)||s.storeys*3.4/(Math.min(s.width,s.depth)*.8)>8.5)throw Error('Incompatible architectural proportions');return s;
}
function rounded(points,r=.14){const ring=[];for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],v=points[i],c=points[(i+1)%points.length],p=v.map((n,j)=>n+(a[j]-n)*r),q=v.map((n,j)=>n+(c[j]-n)*r);ring.push(p);for(let j=1;j<=12;j++){const t=j/12;ring.push([(1-t)**2*p[0]+2*(1-t)*t*v[0]+t*t*q[0],(1-t)**2*p[1]+2*(1-t)*t*v[1]+t*t*q[1]]);}}return ring;}
// Fillet only genuine crescent end corners. Dense arc stations are retained unchanged.
function roundCrescent(raw,radius){const ring=[...raw.slice(48),...raw.slice(0,48)],n=ring.length,stations=[0];for(let i=0;i<n;i++)stations.push(stations.at(-1)+Math.hypot(ring[(i+1)%n][0]-ring[i][0],ring[(i+1)%n][1]-ring[i][1]));const at=d=>{let i=0;while(stations[i+1]<d)i++;const a=ring[i],c=ring[(i+1)%n],t=(d-stations[i])/(stations[i+1]-stations[i]);return a.map((v,j)=>v+(c[j]-v)*t);},corners=[];for(let i=1;i<n-1;i++){const a=ring[i-1],v=ring[i],c=ring[i+1],u=v.map((x,j)=>x-a[j]),w=c.map((x,j)=>x-v[j]),dot=(u[0]*w[0]+u[1]*w[1])/Math.hypot(...u)/Math.hypot(...w);if(dot<.95)corners.push({v,station:stations[i],weight:Math.tan(Math.acos(Math.max(-1,Math.min(1,dot)))/2)});}for(let i=0;i<corners.length;i++){const a=corners[i],c=corners[(i+1)%corners.length],distance=(c.station-a.station+stations.at(-1))%stations.at(-1);radius=Math.min(radius,.9*distance/(a.weight+c.weight));}for(const e of corners){const cut=radius*e.weight;e.start=e.station-cut;e.end=e.station+cut;}const out=[];let index=0;for(const e of corners){while(index<n&&stations[index]<e.start)out.push(ring[index++]);const a=at(e.start),c=at(e.end);out.push(a);for(let j=1;j<=10;j++){const t=j/10;out.push(a.map((x,k)=>(1-t)**2*x+2*(1-t)*t*e.v[k]+t*t*c[k]));}while(index<n&&stations[index]<=e.end)index++;}while(index<n)out.push(ring[index++]);return out;}
function insetCrescent(ring,w,d,amount){if(!T.insetCurvedPolygon)throw Error('The native polygon inset adapter is required');return T.insetCurvedPolygon(ring,w,d,amount);}
export function footprint(s,scale=1,offset=[0,0]){const w=s.width*scale,d=s.depth*scale;let ring;
 if(s.archetype==='A')ring=Array.from({length:192},(_,i)=>{const t=-i/192*Math.PI*2;return [w*.5*Math.sin(t),d*.5*Math.cos(t)];});
 if(s.archetype==='B'){ring=[];for(let i=0;i<=96;i++){const t=-Math.PI/2+i/96*Math.PI;ring.push([w*.5*Math.sin(t),d*(.22-.72*Math.cos(t))]);}for(let i=0;i<=96;i++){const t=Math.PI/2-i/96*Math.PI,x=w*.4*Math.sin(t);ring.push([x,Math.abs(x)<4?d*.06:d*(.5-.44*Math.cos(t))]);}if(s.revision>=2)ring=roundCrescent(ring,Math.min(w*.055,d*.09));}
 if(s.archetype==='C')ring=rounded([[-w*.48,-d*.35],[-w*.05,-d*.5],[w*.48,-d*.18],[w*.44,d*.36],[w*.16,d*.5],[-w*.32,d*.5],[-w*.5,d*.15]],.18);
 return ring.map(([x,z])=>[x+offset[0],z+offset[1]]);
}
export function massing(input){const s=normalizeSpecification(input),w=s.width,d=s.depth,h=s.storeys,podium=s.archetype==='B'?3:2,sections=[],add=(name,start,end,scale,topScale=scale,offset=[0,0])=>sections.push({name,start,end,ring:footprint(s,scale,offset),topRing:footprint(s,topScale,offset)});
 // The crescent keeps its concave court through the podium and tower, never a filled oval.
 const groundRing=s.archetype==='A'?rounded([[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],.22):footprint(s);
 sections.push({name:'integrated commercial podium',start:0,end:podium,ring:groundRing,topRing:groundRing,podium:true});
 if(s.archetype==='A'){add('elliptical corporate shaft',podium,h-10,.85);add('continuous tapered upper section',h-10,h,.85,.70);}
 if(s.archetype==='B'){add('broad crescent shaft',podium,h-4,.87);if(s.revision===1)add('recessed crescent attic',h-4,h,.82);else{const ring=insetCrescent(footprint(s,.87),w,d,.05);sections.push({name:'recessed crescent attic',start:h-4,end:h,ring,topRing:ring});}}
 if(s.archetype==='C'){add('asymmetric curved-angular shaft',podium,h-10,.88);add('first offset setback',h-10,h-6,.78,.78,[-w*.012,-d*.008]);add('second offset setback',h-6,h-3,.68,.68,[-w*.024,-d*.016]);add('flat architectural crown',h-3,h,.58,.58,[-w*.036,-d*.024]);}
 const entrance={x:s.archetype==='C'?-w*.08:0,z:s.archetype==='B'?d*.06:d/2,width:s.archetype==='B'?9:7.2,doorWidth:s.archetype==='B'?7:5.2,height:5.8};
 return {sections,groundRing,entrance,volumes:[],roof:h*s.floorHeight,roofTop:h*s.floorHeight+(s.archetype==='A'?(s.revision>=2?10.3:3.3):s.archetype==='B'?2.6:2.1),identity:{A:'freestanding ellipse / tapered summit / recessed rectangular plant',B:'crescent court / broad arc / planted podium',C:'asymmetric rounded polygon / offset setbacks / flat blade crown'}[s.archetype]};
}
export function fitToLot(input,{width,depth,setback=.3}){const q=v=>Math.floor((v-2*setback-2.2)/2.4)*2.4,w=q(width),d=input.archetype==='B'?Math.min(q(depth),Math.floor(w/1.4/2.4)*2.4):input.archetype==='A'?Math.min(q(depth),Math.floor(w*.76/2.4)*2.4):q(depth);return normalizeSpecification({...input,width:Math.round(w*10)/10,depth:Math.round(d*10)/10});}
export const curvedTemplate=Object.freeze({id:'original-curved-modernist',version:VERSION,family:'office',maximumLot:{width:88.4,depth:69.2},ratios:()=>[1,.96,.92,.86,.8,.72],envelopeMargin:2.2,normalize:normalizeSpecification,fit:fitToLot,layout:massing});
