import * as T from './engine.js';

// Model-authoring helper: bake repeated solid detail and textured quads into
// shared indexed geometry, retaining component ranges for geometric audits.
export class ArchitectureBatch {
  constructor(){this.buckets=new Map;this.unit=new T.BoxGeometry(1,1,1);this.ranges=[];this.boxes=0;this.windowBays=0;}
  bucket(key){if(!this.buckets.has(key))this.buckets.set(key,{p:[],uv:[],i:[]});return this.buckets.get(key);}
  begin(label){return {label,starts:new Map([...this.buckets].map(([key,b])=>[key,b.p.length/3]))};}
  end(part){for(const [key,b] of this.buckets){const start=part.starts.get(key)||0,end=b.p.length/3;if(end>start)this.ranges.push({label:part.label,material:key,start,end});}}
  box(key,x,y,z,w,h,d){
    if(![x,y,z,w,h,d].every(Number.isFinite)||Math.min(w,h,d)<=0)throw Error('Invalid architectural box');
    const b=this.bucket(key),base=b.p.length/3,a=this.unit.attributes;
    for(let i=0;i<a.position.count;i++){
      b.p.push(a.position.getX(i)*w+x,a.position.getY(i)*h+y,a.position.getZ(i)*d+z);
      const nx=Math.abs(a.normal.getX(i)),ny=Math.abs(a.normal.getY(i));
      b.uv.push(a.uv.getX(i)*(key==='stone'?(nx?d:w)/1.5:1),a.uv.getY(i)*(key==='stone'?(ny?d:h)/3.6:1));
    }
    for(const i of this.unit.index.array)b.i.push(base+i);this.boxes++;
  }
  quad(key,points,uv=[0,0,1,0,1,1,0,1]){
    const b=this.bucket(key),base=b.p.length/3;b.p.push(...points.flat());b.uv.push(...uv);b.i.push(base,base+1,base+2,base,base+2,base+3);
  }
  triangle(key,points){const b=this.bucket(key),start=b.p.length/3;b.p.push(...points.flat());b.uv.push(0,0,1,0,.5,1);b.i.push(start,start+1,start+2);}
  beam(key,start,end,width,depth){
    const b=this.bucket(key),base=b.p.length/3,a=this.unit.attributes;
    const delta=end.map((v,i)=>v-start[i]),length=Math.hypot(...delta),axis=delta.map(v=>v/length);
    const flat=Math.hypot(axis[0],axis[2]);if(flat<1e-6)throw Error('Sloping beam needs a horizontal span');
    const u=[axis[2]/flat,0,-axis[0]/flat],v=[-u[2]*axis[1],u[2]*axis[0]-u[0]*axis[2],u[0]*axis[1]];
    const center=start.map((x,i)=>(x+end[i])/2);
    for(let i=0;i<a.position.count;i++){
      const x=a.position.getX(i)*width,y=a.position.getY(i)*length,z=a.position.getZ(i)*depth;
      b.p.push(...center.map((c,j)=>c+u[j]*x+axis[j]*y+v[j]*z));b.uv.push(a.uv.getX(i),a.uv.getY(i));
    }
    for(const i of this.unit.index.array)b.i.push(base+i);this.boxes++;
  }
  chamferedPier(key,x,y,z,w,h,d,bevel=.065){
    const a=w/2,c=d/2,r=Math.min(bevel,a/3,c/3),ring=[[-a+r,-c],[a-r,-c],[a,-c+r],[a,c-r],[a-r,c],[-a+r,c],[-a,c-r],[-a,-c+r]];
    const p=(i,yy)=>[x+ring[i][0],yy,z+ring[i][1]];
    for(let i=0;i<8;i++){const j=(i+1)%8;this.quad(key,[p(j,y-h/2),p(i,y-h/2),p(i,y+h/2),p(j,y+h/2)],[0,0,1,0,1,h/3.6,0,h/3.6]);}
    const b=this.bucket(key);for(let i=1;i<7;i++)for(const [yy,order] of [[y+h/2,[0,i+1,i]],[y-h/2,[0,i,i+1]]]){const start=b.p.length/3;for(const j of order){b.p.push(...p(j,yy));b.uv.push(ring[j][0],ring[j][1]);}b.i.push(start,start+1,start+2);}
    this.boxes++;
  }
  finish(materials,name){
    const group=new T.Group;group.name=name;
    for(const [key,b] of this.buckets){
      const geometry=new T.BufferGeometry;geometry.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));geometry.setIndex(b.i);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
      const mesh=new T.Mesh(geometry,materials[key]);mesh.name=key;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
    }
    this.unit.dispose();group.userData={boxes:this.boxes,windowBays:this.windowBays,materialBatches:this.buckets.size,partRanges:this.ranges};return group;
  }
}
export function croppedTexture(image,rect,width,height){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,...rect,0,0,width,height);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;return map;
}
