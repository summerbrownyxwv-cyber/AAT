import {chromium} from '/Users/dabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'../../..'),out=resolve(root,'notes/refinement-qa'),phase=process.argv[2]||'before';
const sizes=[[390,844],[1440,900],[3840,2160]];
const routes=['index','company','planting','products','service','ai','contact'];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const records=[];
for(const [width,height] of sizes){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<901,hasTouch:width<901,locale:'zh-CN'});
 const page=await context.newPage();
 for(const name of routes){
  await page.goto(`http://127.0.0.1:4196/website-code/${name}.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('main')?.children.length>0);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
  let prev=-1;
  for(let i=0;i<70;i++){const s=await page.evaluate(()=>({y:scrollY,end:document.documentElement.scrollHeight-innerHeight}));if(s.y>=s.end-2||s.y===prev&&i>2)break;prev=s.y;await page.mouse.wheel(0,height*.9);await page.waitForTimeout(35)}
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(450);
  const folder=resolve(out,phase,name,`${width}x${height}`);await mkdir(folder,{recursive:true});
  await page.screenshot({path:resolve(folder,'full-page.jpg'),fullPage:true,type:'jpeg',quality:75});
  records.push(await measure(page,name,folder));
  if(name==='products'){
   for(const id of ['products-series','products-ran','products-cui','products-wen','products-zhi','cooperation-oem']){
    await page.goto(`http://127.0.0.1:4196/website-code/products.html#${id}`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(450);
    await page.screenshot({path:resolve(folder,`${id}.jpg`),type:'jpeg',quality:82});
    records.push({...await measure(page,name,folder),state:id,screenshot:relative(out,resolve(folder,`${id}.jpg`))});
   }
  }
  if(name==='index'){await page.goto('http://127.0.0.1:4196/website-code/index.html#collections');await page.waitForTimeout(450);await page.screenshot({path:resolve(folder,'collections.jpg'),type:'jpeg',quality:82});records.push({...await measure(page,name,folder),state:'collections',screenshot:relative(out,resolve(folder,'collections.jpg'))})}
  console.log(`${phase} ${name} ${width}x${height}`);
 }
 await context.close();
}
await browser.close();
await writeFile(resolve(out,`data/${phase}-layouts.json`),JSON.stringify({phase,browser:'Chrome',version:browser.version(),records},null,2));
async function measure(page,name,folder){return {name,screenshot:relative(out,resolve(folder,'full-page.jpg')),...await page.evaluate(()=>({url:location.href,w:innerWidth,h:innerHeight,dpr:devicePixelRatio,overflow:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth,sections:[...document.querySelectorAll('main section')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {id:e.id,class:e.className,x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height,bg:s.backgroundColor,color:s.color}}),controls:[...document.querySelectorAll('button')].filter(e=>/暂停|继续轮播/.test(e.textContent)).map(e=>e.textContent),videos:[...document.querySelectorAll('video')].map(e=>({loop:e.loop,autoplay:e.autoplay,controls:e.controls,muted:e.muted,error:e.error?.code||0})),active:document.querySelector('.product-catalog')?.dataset.activeGroup}))}}
