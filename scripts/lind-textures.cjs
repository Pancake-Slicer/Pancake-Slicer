// Build-time crop of the approved source; no runtime image decoding or fetch.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
module.exports=function lindTextures(){
 const root=path.resolve(__dirname,'..'),source=path.join(root,'Assets/Architecture/Art Deco/Art Deco Limestone Window Facade.png'),sha=crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),cache=path.join(root,'.tools/lind-textures/rgba.json');
 const packaged=path.join(root,'Assets/procedural-templates/lind-stepped-lightweight@1.0.0/textures.rgba.json');if(fs.existsSync(packaged)){const data=JSON.parse(fs.readFileSync(packaged));if(data.sourceSha256!==sha||data.version!==1)throw Error('Packaged Lind crop does not match its approved source');return data;}
 if(fs.existsSync(cache)){const data=JSON.parse(fs.readFileSync(cache));if(data.sourceSha256===sha&&data.version===1)return data;}
 const quote=s=>"'"+s.replace(/'/g,"''")+"'",command=`Add-Type -AssemblyName System.Drawing
$pcImage=[Drawing.Bitmap]::FromFile(${quote(source)})
try {
 if ($pcImage.Width -ne 1254 -or $pcImage.Height -ne 1254) { throw 'Approved Lind image dimensions changed' }
 $pcResult=@{}
 foreach ($pcKey in @('bay','stone')) {
  if ($pcKey -eq 'bay') { $pcW=256; $pcH=512; $pcSrc=[Drawing.Rectangle]::new(134,92,173,310); $pcDest=[Drawing.Rectangle]::new(0,16,256,480) } else { $pcW=128; $pcH=256; $pcSrc=[Drawing.Rectangle]::new(343,20,59,193); $pcDest=[Drawing.Rectangle]::new(0,0,128,256) }
  $pcBitmap=[Drawing.Bitmap]::new($pcW,$pcH,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $pcGraphics=[Drawing.Graphics]::FromImage($pcBitmap)
  try { $pcGraphics.Clear([Drawing.ColorTranslator]::FromHtml('#71695c')); $pcGraphics.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; $pcGraphics.DrawImage($pcImage,$pcDest,$pcSrc,[Drawing.GraphicsUnit]::Pixel) } finally { $pcGraphics.Dispose() }
  $pcLock=$pcBitmap.LockBits([Drawing.Rectangle]::new(0,0,$pcW,$pcH),[Drawing.Imaging.ImageLockMode]::ReadOnly,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try { $pcBytes=New-Object byte[] ([Math]::Abs($pcLock.Stride)*$pcH); [Runtime.InteropServices.Marshal]::Copy($pcLock.Scan0,$pcBytes,0,$pcBytes.Length); $pcResult[$pcKey]=@{width=$pcW;height=$pcH;stride=$pcLock.Stride;bgra=[Convert]::ToBase64String($pcBytes)} } finally { $pcBitmap.UnlockBits($pcLock); $pcBitmap.Dispose() }
 }
 $pcResult | ConvertTo-Json -Compress
} finally { $pcImage.Dispose() }`;
 const process=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{encoding:'utf8',windowsHide:true,maxBuffer:4e6});if(process.status!==0)throw Error('Lind texture crop failed: '+process.stderr);
 const raw=JSON.parse(process.stdout.trim()),data={version:1,sourceSha256:sha};for(const key of ['bay','stone']){const r=raw[key],input=Buffer.from(r.bgra,'base64'),pixels=Buffer.alloc(r.width*r.height*4);if(r.stride<=0)throw Error('Unsupported bitmap row orientation');for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++){const a=y*r.stride+x*4,b=((r.height-1-y)*r.width+x)*4;pixels[b]=input[a+2];pixels[b+1]=input[a+1];pixels[b+2]=input[a];pixels[b+3]=255;}data[key]={width:r.width,height:r.height,pixels:pixels.toString('base64')};}
 fs.mkdirSync(path.dirname(cache),{recursive:true});fs.writeFileSync(cache,JSON.stringify(data));return data;
};
