// Decode BC1/BC2 texture blocks. Palette entries 0/1 are opaque; only BC1's
// fourth entry in three-colour mode is transparent. No original files are edited.
function rgb565(value){return [Math.round((value>>>11)*255/31),Math.round((value>>>5&63)*255/63),Math.round((value&31)*255/31)];}
function decodeBlocks(data,width,height,explicitAlpha=false){
 if(width%4||height%4)throw Error('BC texture dimensions must be multiples of four');
 const stride=explicitAlpha?16:8,expected=width*height/16*stride;
 if(data.length<expected)throw Error('Truncated BC texture');
 const result=Buffer.alloc(width*height*4);let offset=0;
 for(let y=0;y<height;y+=4)for(let x=0;x<width;x+=4,offset+=stride){
  const c=offset+(explicitAlpha?8:0),v0=data[c]|data[c+1]<<8,v1=data[c+2]|data[c+3]<<8,a=rgb565(v0),b=rgb565(v1),opaque=explicitAlpha||v0>v1;
  const palette=[[...a,255],[...b,255],opaque?a.map((v,k)=>Math.floor((v*2+b[k])/3)).concat(255):a.map((v,k)=>Math.floor((v+b[k])/2)).concat(255),opaque?a.map((v,k)=>Math.floor((v+b[k]*2)/3)).concat(255):[0,0,0,0]];
  const selectors=(data[c+4]|data[c+5]<<8|data[c+6]<<16|data[c+7]<<24)>>>0;
  for(let p=0;p<16;p++){
   const colour=palette[selectors>>>(p*2)&3],index=((y+(p>>>2))*width+x+(p&3))*4;
   result[index]=colour[0];result[index+1]=colour[1];result[index+2]=colour[2];
   result[index+3]=explicitAlpha?((data[offset+(p>>>1)]>>>((p&1)*4))&15)*17:colour[3];
  }
 }
 return result;
}
function decodeImage(image){
 if(image.code===0x60)return decodeBlocks(image.data,image.width,image.height);
 if(image.code===0x61)return decodeBlocks(image.data,image.width,image.height,true);
 if(image.code===0x78){const result=Buffer.alloc(image.width*image.height*4);for(let p=0;p<image.width*image.height;p++){const rgb=rgb565(image.data[p*2]|image.data[p*2+1]<<8);for(let c=0;c<3;c++)result[p*4+c]=rgb[c];result[p*4+3]=255;}return result;}
 return Buffer.from(image.decompress());
}
module.exports={decodeBlocks,decodeImage,rgb565};
