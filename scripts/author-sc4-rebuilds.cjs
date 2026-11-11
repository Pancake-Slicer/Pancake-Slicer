// Reference survey -> authored volumetric recipes. No source triangles, UVs or
// image pixels are retained in the output. Normal builds only need the JSON.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=read('original/Pancake (52).html');assert.equal(createHash('sha256').update(original).digest('hex'),'c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c');
const baseline=original.match(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/i)[1];
const context=vm.createContext({console,performance,document:{createElement:()=>({relList:{supports:()=>true},getContext:()=>({fillRect(){}})})}});
vm.runInContext(baseline.slice(0,baseline.indexOf('const LP='))+';globalThis.clipper={Te,ve,xn,Bo,sn};',context);
const {Te,ve,xn,Bo,sn}=context.clipper;
const artwork=read('web/assets/sc4-originals.local.js').trim();assert.ok(artwork.startsWith('globalThis.pcSC4Originals='));
const sources=JSON.parse(artwork.slice('globalThis.pcSC4Originals='.length,-1)).models;
const {PNG}=require(path.join(root,'.tools/sc4-import/node_modules/pngjs'));
const catalogue=require('../reference/sc4-commercial-wealth3.json').entries;
const round=n=>Math.round(n*4)/4,area=ring=>Math.abs(ring.reduce((s,p,i)=>s+p[0]*ring[(i+1)%ring.length][1]-ring[(i+1)%ring.length][0]*p[1],0))/2;
function hull(points){const unique=[...new Map(points.map(p=>[p.x.toFixed(3)+':'+p.z.toFixed(3),p])).values()].sort((a,b)=>a.x-b.x||a.z-b.z);if(unique.length<3)return null;const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x),lower=[],upper=[];for(const p of unique){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}for(const p of [...unique].reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}return [...lower.slice(0,-1),...upper.slice(0,-1)];}
function survey(model,y){
 const strips=[],samples=[];
 for(const variant of model.variants){const p=variant.positions;for(let i=0;i<p.length;i+=9){const points=[];for(let edge=0;edge<3;edge++){const a=i+edge*3,b=i+(edge+1)%3*3,dy=p[b+1]-p[a+1];if(Math.abs(dy)<1e-5||y<Math.min(p[a+1],p[b+1])||y>Math.max(p[a+1],p[b+1]))continue;const t=(y-p[a+1])/dy;points.push({x:p[a]+t*(p[b]-p[a]),z:p[a+2]+t*(p[b+2]-p[a+2])});}if(points.length<2)continue;samples.push(...points);const [a,b]=points,length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.05)continue;const dx=(b.x-a.x)/length,dz=(b.z-a.z)/length,r=.35;strips.push(...Te([{x:a.x-dx*r-dz*r,z:a.z-dz*r+dx*r},{x:b.x+dx*r-dz*r,z:b.z+dz*r+dx*r},{x:b.x+dx*r+dz*r,z:b.z+dz*r-dx*r},{x:a.x-dx*r+dz*r,z:a.z-dz*r-dx*r}]));}}
 const convex=hull(samples);if(!convex)return null;
 const parts=strips.length?xn(ve(strips)).sort((a,b)=>sn(Te(b.outer))-sn(Te(a.outer))):[],outer=parts[0]?.outer;
 let outline=outer&&sn(Te(outer))>=sn(Te(convex))*.6?xn(Bo(Te(outer),-.35))[0]?.outer:convex;
 if(!outline||outline.length<3)outline=convex;
 const x=samples.map(p=>p.x),z=samples.map(p=>p.z);return {outline,w:Math.max(...x)-Math.min(...x),d:Math.max(...z)-Math.min(...z),cx:(Math.min(...x)+Math.max(...x))/2,cz:(Math.min(...z)+Math.max(...z))/2};
}
function plan(shape,w,d,cx=0,cz=0){
 let p=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
 if(['oval','oval-core'].includes(shape))p=Array.from({length:32},(_,i)=>[Math.cos(i*Math.PI/16)*.5,Math.sin(i*Math.PI/16)*.5]);
 if(['bow','round-front','showroom'].includes(shape))p=[[-.5,.5],[.5,.5],...Array.from({length:25},(_,i)=>[Math.cos(i*Math.PI/24)*.5,-.1-Math.sin(i*Math.PI/24)*.4])];
 if(shape==='round-corner')p=[[-.5,-.5],[.2,-.5],...Array.from({length:9},(_,i)=>[.2+.3*Math.cos(-Math.PI/2+i*Math.PI/16),-.2+.3*Math.sin(-Math.PI/2+i*Math.PI/16)]),[.5,.5],[-.5,.5]];
 if(shape==='octagon')p=[[-.3,-.5],[.3,-.5],[.5,-.3],[.5,.3],[.3,.5],[-.3,.5],[-.5,.3],[-.5,-.3]];
 if(['cross','hotel-wings','twin-notch'].includes(shape))p=[[-.5,-.5],[-.25,-.5],[-.25,-.18],[.25,-.18],[.25,-.5],[.5,-.5],[.5,.5],[.25,.5],[.25,.18],[-.25,.18],[-.25,.5],[-.5,.5]];
 if(['court','u-court'].includes(shape))p=[[-.5,-.5],[.5,-.5],[.5,.5],[.18,.5],[.18,-.1],[-.18,-.1],[-.18,.5],[-.5,.5]];
 if(['notch','notched','recessed'].includes(shape))p=[[-.5,-.5],[-.13,-.5],[-.13,-.3],[.13,-.3],[.13,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
 if(shape==='l-shape'||shape==='mall')p=[[-.5,-.5],[.2,-.5],[.2,-.12],[.5,-.12],[.5,.5],[-.5,.5]];
 if(shape==='wedge')p=[[-.5,.5],[.5,.5],[.12,-.5],[-.12,-.5]];
 if(shape==='twin-core')p=[[-.5,-.5],[-.15,-.5],[-.15,-.2],[.15,-.2],[.15,-.5],[.5,-.5],[.5,.5],[.15,.5],[.15,.2],[-.15,.2],[-.15,.5],[-.5,.5]];
 return p.map(([x,z])=>[Math.round((cx+x*w)*100)/100,Math.round((cz+z*d)*100)/100]);
}
function colourSurvey(model,entry){
 const v=model.variants[0],image=PNG.sync.read(Buffer.from(v.png,'base64')),colours=[];
 for(let i=0;i<v.positions.length;i+=9){const p=v.positions,ax=p[i+3]-p[i],ay=p[i+4]-p[i+1],az=p[i+5]-p[i+2],bx=p[i+6]-p[i],by=p[i+7]-p[i+1],bz=p[i+8]-p[i+2],nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx,size=Math.hypot(nx,ny,nz);if(size<3||Math.abs(ny)/size>.3)continue;for(const weights of [[.34,.33,.33],[.6,.2,.2],[.2,.6,.2],[.2,.2,.6]]){const j=i/3*2,u=weights.reduce((s,t,k)=>s+t*v.uv[j+k*2],0),w=weights.reduce((s,t,k)=>s+t*v.uv[j+k*2+1],0),offset=(Math.min(image.height-1,Math.floor(w*image.height))*image.width+Math.min(image.width-1,Math.floor(u*image.width)))*4;if(image.data[offset+3]<240)continue;const c=[...image.data.subarray(offset,offset+3)];if(c.reduce((s,v)=>s+v,0)<45||c.reduce((s,v)=>s+v,0)>735)continue;colours.push(c);}}
 const lum=c=>c[0]*.2126+c[1]*.7152+c[2]*.0722;colours.sort((a,b)=>lum(a)-lum(b));
 let centres=[.18,.5,.82].map(q=>colours[Math.floor((colours.length-1)*q)]||[160,155,145]);
 for(let iteration=0;iteration<6;iteration++){const buckets=[[],[],[]];for(const c of colours){let k=0,score=Infinity;centres.forEach((x,i)=>{const s=x.reduce((s,v,j)=>s+(v-c[j])**2,0);if(s<score){score=s;k=i;}});buckets[k].push(c);}centres=buckets.map((bucket,i)=>bucket.length?[0,1,2].map(k=>bucket.reduce((s,c)=>s+c[k],0)/bucket.length):centres[i]);}
 centres.sort((a,b)=>lum(a)-lum(b));const hex=c=>'#'+c.map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');
 const manual=entry.colour.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16)),masonry=['classic','deco','brick'].includes(entry.facade);
 const stone=centres[entry.facade==='brick'?1:2].map((c,i)=>c*.35+manual[i]*.65),glass=masonry?centres[0].map(c=>c*1.05+18):centres[1].map((c,i)=>c*.5+manual[i]*.5);
 // Reference pixels contain baked shadow. Preserve hue while lifting the
 // non-masonry glass albedo to a neutral daylight range, not a fixed sun side.
 if(!masonry){const gain=Math.max(115,Math.min(150,lum(glass)+12))/Math.max(1,lum(glass));for(let i=0;i<3;i++)glass[i]*=gain;}
 return {stone:hex(stone),glass:hex(glass),trim:hex(stone.map(c=>Math.min(231,c+17))),sampleCount:colours.length};
}
function make(entry){
 const model=sources[entry.id];if(!model)throw Error('Missing reference '+entry.id);
 const h=model.size[1],roundedRoof=/gable|mansard|hip|barrel|sail|domes|gothic|crown|portal|notch|angled|pediment/.test(entry.roof),roofHeight=entry.id===413?20:entry.id===304?6.8:Math.min(h*.22,roundedRoof?Math.min(14,Math.max(2.4,h*.055)):Math.min(2.5,h*.06)),bodyHeight=h-roofHeight;
 const step=h<30?1.25:3.5,cx=(model.bounds.minX+model.bounds.maxX)/2,cz=(model.bounds.minZ+model.bounds.maxZ)/2,sections=[];
 for(let y=.6;y<bodyHeight;y+=step){const section=survey(model,model.bounds.minY+y*(model.bounds.maxY-model.bounds.minY)/h);if(section&&section.w>1&&section.d>1)sections.push({...section,y});}
 if(!sections.length)throw Error('No reference sections '+entry.id);
 const bands=[];let previous;
 for(let i=0;i<sections.length;i++){
  const s=sections[i],next=sections[Math.min(i+1,sections.length-1)];
  let shape=s.y<bodyHeight*.08?'box':entry.shape;
  if(['steps','pencil','slab','stepped-slab','slab-core','box-top','theatre','fluted','garage','spa'].includes(shape))shape='box';
  const changed=!previous||shape!==previous.shape||Math.abs(s.w-previous.w)>Math.max(1,previous.w*.055)||Math.abs(s.d-previous.d)>Math.max(1,previous.d*.055)||Math.hypot(s.cx-previous.cx,s.cz-previous.cz)>1.2;
  const stable=!previous||shape!==previous.shape||Math.abs(next.w-previous.w)>Math.max(.8,previous.w*.035)||Math.abs(next.d-previous.d)>Math.max(.8,previous.d*.035);
  if(!changed||!stable||bands.length&&s.y-bands.at(-1).y<Math.min(2,h*.06))continue;
  const y=bands.length?round(Math.max(bands.at(-1).y+.75,s.y-step*.5)):0;
  const ring=plan(shape,round(s.w),round(s.d),round(s.cx-cx),round(s.cz-cz));
  bands.push({y,parts:[ring]});previous={...s,shape};
 }
 while(bands.length>14){let k=1,score=Infinity;for(let i=1;i<bands.length;i++){const difference=Math.abs(area(bands[i].parts[0])-area(bands[i-1].parts[0]));if(difference<score){score=difference;k=i;}}bands.splice(k,1);}
 if(bodyHeight-bands.at(-1).y<.75&&bands.length>1)bands.pop();
 for(let i=0;i<bands.length;i++)bands[i].top=i+1<bands.length?bands[i+1].y:Math.round(bodyHeight*100)/100;
 // These compound forms need distinct volumes, not a shared generic box.
 if(entry.id===413){const w=43,d=29;bands.splice(0,bands.length,{y:0,top:7,parts:[plan('box',47,31)]},{y:7,top:bodyHeight,parts:[plan('oval',w,d)],upper:[plan('oval',w*1.035,d*1.025,.6,0)]});}
 if(entry.id===429){const merge=polys=>xn(ve(polys.flatMap(r=>Te(r.map(([x,z])=>({x,z})))))).map(p=>p.outer.map(p=>[p.x,p.z]));bands.splice(0,bands.length,{y:0,top:12,parts:[plan('box',56,56)]},{y:12,top:Math.round(h*.77),parts:merge([plan('oval',36,50,-8,-3),plan('box',30,36,11,10)])},{y:Math.round(h*.77),top:bodyHeight,parts:[plan('box',30,36,11,10)]});}
 if(entry.id===424){bands.splice(0,bands.length,{y:0,top:72,parts:[plan('box',56,56)]},{y:72,top:114,parts:[plan('box',49,52)]},{y:114,top:155,parts:[plan('box',40,40)]},{y:155,top:294,parts:[plan('box',25,25)]});}
 const points=bands.flatMap(b=>[...b.parts,...(b.upper||[])].flat()),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),width=Math.max(...xs)-Math.min(...xs),depth=Math.max(...zs)-Math.min(...zs);
 const colours=colourSurvey(model,entry),bays=entry.facade==='glass'?2.8:entry.facade==='shop'?4.5:entry.facade==='ribbon'?3:2.65;
 const body=entry.id===424?294:Math.round(bodyHeight*100)/100,floors=Math.max(1,Math.min(80,Math.round(body/(entry.type==='services'?4.4:4))));
 return {id:entry.id,name:entry.name,type:entry.type,style:entry.style,facade:entry.facade,shape:entry.shape,roof:entry.id===424?'deco-platform':entry.id===304?'theatre-copper':entry.roof,height:h,bodyHeight:body,roofHeight:Math.round((h-body)*100)/100,size:[Math.round(width*100)/100,h,Math.round(depth*100)/100],bounds:{minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs),minY:0,maxY:h},floors,floorHeight:body/floors,bayWidth:bays,colours,bands,source:'Authored solid volumes and facade grammar; source dimensions, cross-section surveys and colour statistics are references only.'};
}
const entries=catalogue.map(make);fs.writeFileSync(path.join(root,'reference/sc4-rebuilt-designs.json'),JSON.stringify({version:1,entries},null,2)+'\n');
console.log(`Authored ${entries.length} volumetric recipes; no source triangle buffers, UV buffers or raster images retained.`);
