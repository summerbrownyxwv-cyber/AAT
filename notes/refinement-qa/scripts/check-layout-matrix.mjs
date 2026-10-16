import {chromium} from '/Users/dabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../../..'),out=resolve(root,'notes/refinement-qa');
const inventory=JSON.parse(await readFile(resolve(root,'notes/prelaunch-qa/data/motion-routes.json'),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const results=[];
for(const [width,height]of inventory.viewports_css_pixels){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=1024,hasTouch:width<=1024});
 const page=await context.newPage();let errors=[];const documentStatuses=new Map();page.on('pageerror',e=>errors.push(String(e)));
 for(const route of inventory.routes){
  errors=[];const response=await page.goto('http://127.0.0.1:4196'+route.route);await page.waitForFunction(()=>document.querySelector('main')?.children.length>0);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
  const documentURL=page.url().split('#')[0];if(response)documentStatuses.set(documentURL,response.status());
  results.push({slug:route.slug,route:route.route,status:documentStatuses.get(documentURL),navigation:response?'document':'same-document-hash',errors:[...errors],...await page.evaluate(()=>({w:innerWidth,h:innerHeight,dpr:devicePixelRatio,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,broken:[...document.images].filter(e=>e.complete&&e.currentSrc&&!e.naturalWidth).map(e=>e.currentSrc),pauseControls:[...document.querySelectorAll('button')].filter(e=>/暂停|继续轮播/.test(e.textContent+' '+e.getAttribute('aria-label'))).map(e=>e.outerHTML),videos:[...document.querySelectorAll('video')].map(v=>({loop:v.loop,muted:v.muted,autoplay:v.autoplay,controls:v.controls,error:v.error?.code||0})),remainingColoredUI:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>!e.closest('svg')).map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(),m=s.backgroundColor.match(/[\d.]+/g),t=s.color.match(/[\d.]+/g);return {element:e.tagName+'.'+e.className,area:r.width*r.height,bg:s.backgroundColor,c:s.color,channels:m?.map(Number),text:t?.map(Number)}}).filter(e=>e.area>100&&e.channels?.length===3&&((e.channels[1]>e.channels[0]+12&&e.channels[1]>e.channels[2]+12)||(e.channels[0]>e.channels[1]+15&&e.channels[1]>e.channels[2]+10))).slice(0,15)}))});
 }
 console.log(`CHECK ${width}x${height} ${results.length} routes`);await context.close();await writeFile(resolve(out,'data/layout-matrix.json'),JSON.stringify({browser:browser.version(),scope:'22 route URLs x 11 actual CSS viewports',records:results},null,2));
}
await browser.close();console.log(JSON.stringify({count:results.length,failures:results.filter(r=>r.status!==200||r.overflow>1||r.broken.length||r.pauseControls.length||r.errors.length||r.videos.some(v=>v.controls||!v.autoplay||!v.loop||!v.muted||v.error)),remainingColoredUI:results.filter(r=>r.remainingColoredUI.length).map(r=>({slug:r.slug,w:r.w,colors:r.remainingColoredUI}))}));
