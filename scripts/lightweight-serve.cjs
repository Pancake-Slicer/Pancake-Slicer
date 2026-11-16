const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../.tools/modernist-lab'),reports=path.resolve(__dirname,'../.tools/lightweight-reports');fs.mkdirSync(reports,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4195');
 if(req.method==='POST'&&['/report-game','/report-lab','/capture'].includes(url.pathname)){
  let data='';req.on('data',d=>{data+=d;if(data.length>20e6)req.destroy();});req.on('end',()=>{try{
   const payload=JSON.parse(data);if(url.pathname==='/capture'){if(!/^data:image\/png;base64,/.test(payload.image))throw Error('PNG required');const name=['lineup','inspect','front','roof'].includes(payload.name)?payload.name:'inspect';fs.writeFileSync(path.join(reports,name+'.png'),Buffer.from(payload.image.split(',')[1],'base64'));}
   else fs.writeFileSync(path.join(reports,url.pathname.slice(1)+'.json'),JSON.stringify(payload,null,2));res.end('saved');
  }catch{res.writeHead(400);res.end('Invalid report');}});return;
 }
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/lightweight.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);});
}).on('error',error=>{if(error.code==='EADDRINUSE')console.error('Port 4195 is already occupied. If this review server is running, open http://127.0.0.1:4195/lightweight.html. Otherwise ask Codex to check the existing service. No process was stopped.');else console.error(error);process.exitCode=1;}).listen(4195,'127.0.0.1',()=>console.log('Lightweight review: http://127.0.0.1:4195/lightweight.html\nCurrent-game baseline: http://127.0.0.1:4195/game-baseline.html'));
