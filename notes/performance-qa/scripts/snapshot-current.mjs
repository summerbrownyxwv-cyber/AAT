import {readdir,stat,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const walk=async directory=>{const files=[];for(const entry of await readdir(directory,{withFileTypes:true})){const f=path.join(directory,entry.name);if(entry.name==='.DS_Store'||f==='website-code/dist')continue;if(entry.isDirectory())files.push(...await walk(f));else files.push({path:f,bytes:(await stat(f)).size,type:path.extname(f).slice(1)||'other'});}return files;};
const files=(await Promise.all(['assets','content','website-code'].map(walk))).flat();
const built=[];
const builtWalk=async directory=>{for(const e of await readdir(directory,{withFileTypes:true})){const f=path.join(directory,e.name);if(e.name==='.DS_Store')continue;if(e.isDirectory())await builtWalk(f);else built.push({path:f,bytes:(await stat(f)).size});}};
await builtWalk('website-code/dist');
const byType={};for(const f of files){const t=byType[f.type]??={files:0,bytes:0};t.files++;t.bytes+=f.bytes;}
const fontFiles=await Promise.all(['oppo-sans','tsukushi-mincho-r','crimson-regular'].map(async name=>{const [a,b]=await Promise.all(['assets/fonts/','assets/xunai/fonts/'].map(async dir=>readFile(dir+name+'.woff2')));return{name,bytes:a.length,identical:a.equals(b),sha256:createHash('sha256').update(a).digest('hex')};}));
const report={createdAt:new Date().toISOString(),baseline:'87fdb492',measurement:'Filesystem bytes and source changes, not actual browser transfer or memory',sourceFiles:files.length,sourceBytes:files.reduce((n,f)=>n+f.bytes,0),builtFiles:built.length,builtBytes:built.reduce((n,f)=>n+f.bytes,0),byType,fontFiles,largest:files.toSorted((a,b)=>b.bytes-a.bytes).slice(0,30),builtDeveloperFiles:built.filter(f=>f.path.startsWith('website-code/dist/website-code/scripts/')),browserMetrics:{lighthouse:null,lcp:null,fcp:null,cls:null,inp:null,ttfb:null,transfer:null,reason:'Local browser access was rejected by policy; no bypass. Prior interrupted run is not a reliable full baseline.'}};
await writeFile('notes/performance-qa/data/20261016-resource-snapshot.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceFiles:report.sourceFiles,sourceBytes:report.sourceBytes,builtFiles:report.builtFiles,builtBytes:report.builtBytes,byType:report.byType,largest:report.largest.slice(0,8)},null,2));
