import {chromium} from '/Users/dabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {arch} from 'node:os';
const output=resolve(import.meta.dirname,'../data/media-zoom-results.json');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={created:new Date().toISOString(),browser:browser.version(),platform:process.platform,os:{name:'macOS',version:execFileSync('sw_vers',['-productVersion'],{encoding:'utf8'}).trim(),build:execFileSync('sw_vers',['-buildVersion'],{encoding:'utf8'}).trim(),arch:arch()},method:'Real Chrome headless; normal motion; no video.play() invocation by test; native autoplay plus existing visibility management. Loop tested by seeking near the end in test runtime only.',zoom:{status:'not-tested',reason:'Headless Chrome has no browser chrome zoom control in this harness. CSS zoom, CDP pageScale and deviceScaleFactor are not treated as browser zoom. True 200% browser zoom remains a manual check.'},limitations:['DPR values are browser device emulation, not physical hardware/browser compatibility coverage.','Tests prove visible playback advances and one loop restart in this local Chrome session, not every network condition or long-run playback.'],records:[]};
const cases=[['index','hero-story','#hero-story video'],['company','','.company-hero-video'],['planting','','.plant-hero video'],['planting','','.plant-origin video'],['products','products-intro','#products-intro video'],['service','','.xs-hero video'],['ai','value','#value video']];
try {
 for(const [width,height,dpr] of [[390,844,3],[1920,1080,2]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,isMobile:width<901,hasTouch:width<901,reducedMotion:'no-preference',locale:'zh-CN'});
  const page=await context.newPage();
  for(const [route,hash,selector] of cases){
   const record={route:`${route}.html${hash?'#'+hash:''}`,selector,requestedViewport:{width,height,dpr}};
   result.records.push(record);
   try {
    await page.goto(`http://127.0.0.1:4196/website-code/${record.route}`,{waitUntil:'domcontentloaded'});
    const video=page.locator(selector);await video.waitFor({state:'attached'});
    await page.evaluate(()=>document.fonts.ready);
    await video.evaluate(v=>v.scrollIntoView({block:'center',behavior:'instant'}));
    await page.waitForTimeout(700);
    await video.evaluate(v=>v.scrollIntoView({block:'center',behavior:'instant'}));
    await page.waitForFunction(s=>{const v=document.querySelector(s);return v&&!v.paused&&v.readyState>=2&&v.currentTime>.05},selector,{timeout:15000}).catch(()=>{});
    const start=await state(video);await page.waitForTimeout(1200);const end=await state(video);
    record.environment=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,visualViewportScale:visualViewport?.scale,rootFont:getComputedStyle(document.documentElement).fontSize,bodyFont:getComputedStyle(document.body).fontSize,h1Font:document.querySelector('h1')?getComputedStyle(document.querySelector('h1')).fontSize:null,documentWidth:document.documentElement.scrollWidth,fonts:{status:document.fonts.status,faces:[...document.fonts].map(f=>({family:f.family,weight:f.weight,style:f.style,status:f.status}))}}));
    record.start=start;record.end=end;
    record.attributesPass=end.autoplay&&end.muted&&end.loop&&end.playsInline&&!end.controls;
    record.autoplayPass=!end.paused&&end.visibleRatio>0&&(end.time>start.time+.3||start.time>end.time&&end.time>.3);
    if(Number.isFinite(end.duration)&&end.duration>.5&&record.autoplayPass){
     await video.evaluate(v=>{v.currentTime=v.duration-.35});
     await page.waitForTimeout(1800);
     const loop=await state(video);record.loopState=loop;
     record.loopPass=!loop.paused&&loop.time<loop.duration-1&&loop.time>.2;
    }else record.loopPass=false;
    record.pass=record.attributesPass&&record.autoplayPass&&record.loopPass;
    console.log(`${record.pass?'PASS':'FAIL'} ${route} ${selector} ${width} DPR${dpr} autoplay=${record.autoplayPass} loop=${record.loopPass}`);
   }catch(error){record.pass=false;record.error=error.message;console.log(`ERROR ${route} ${width}: ${error.message.slice(0,180)}`)}
   await writeFile(output,JSON.stringify(result,null,2));
  }
  await context.close();
 }
}finally{await browser.close();result.summary={total:result.records.length,passed:result.records.filter(r=>r.pass).length,failed:result.records.filter(r=>!r.pass).length};await writeFile(output,JSON.stringify(result,null,2))}
if(result.summary.failed)process.exitCode=1;
async function state(video){return video.evaluate(v=>{const r=v.getBoundingClientRect(),intersection=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0))*Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));return {time:v.currentTime,duration:v.duration,paused:v.paused,readyState:v.readyState,autoplay:v.autoplay,muted:v.muted,loop:v.loop,playsInline:v.playsInline,controls:v.controls,error:v.error?.code||0,source:v.currentSrc,visibleRatio:r.width*r.height?intersection/(r.width*r.height):0,rect:{x:r.x,y:r.y,width:r.width,height:r.height},scrollY}})}
