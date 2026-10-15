import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'../../../website-code/dist');
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.glb':'model/gltf-binary','.json':'application/json'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const info=await stat(file);if(!info.isFile())throw Error('not file');
  const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':info.size,'Accept-Ranges':'bytes','Cache-Control':'public,max-age=0,must-revalidate','ETag':'"'+info.size+'-'+Math.round(info.mtimeMs)+'"'};
  if(req.headers['if-none-match']===headers.ETag&&!req.headers.range){res.writeHead(304,headers);res.end();return}
  let start=0,end=info.size-1;
  if(req.headers.range){const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!m){res.writeHead(416);res.end();return}start=Number(m[1]);end=m[2]?Math.min(end,Number(m[2])):end;if(start>end){res.writeHead(416);res.end();return}headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;headers['Content-Length']=end-start+1}
  res.writeHead(req.headers.range?206:200,headers);if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
 }catch{res.writeHead(404);res.end('Not found')}
}).listen(4197,'127.0.0.1',()=>console.log('Built-output test server: http://127.0.0.1:4197 (raw text; ETag revalidation; Range)'));
