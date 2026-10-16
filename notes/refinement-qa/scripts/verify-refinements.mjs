import {chromium} from '/Users/dabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../../..'),out=resolve(root,'notes/refinement-qa');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
for(const [width,height] of [[390,844],[1440,900],[3840,2160]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<901,hasTouch:width<901});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const group of ['ran','cui','wen','zhi']){
  await page.goto(`http://127.0.0.1:4196/website-code/products.html#products-${group}`);
  await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(key=>document.querySelector('.product-catalog')?.dataset.activeGroup===key,group);await page.waitForTimeout(180);
  const gallery=page.locator(`#products-${group} .product-detail-gallery`),track=page.locator(`#products-${group} .product-detail-track`);
  const rtl=await track.evaluate(e=>getComputedStyle(e).direction==='rtl');
  const point=async()=>{
   const card=await track.locator(':scope > .product-detail-card').nth(1).boundingBox(),box=await gallery.boundingBox();
   const left=Math.max(24,box.x,card.x),right=Math.min(width-24,box.x+box.width,card.x+card.width);
   return {x:(left+right)/2,y:Math.min(height-45,Math.max(110,card.y+Math.min(150,card.height*.35)))};
  };
  let {x,y}=await point();
  const index=()=>page.locator(`#products-${group}`).getAttribute('data-product-index');
  const before=Number(await index());await page.mouse.move(x,y);await page.mouse.down();
  for(let i=1;i<=4;i++){await page.mouse.move(x+(rtl?16:-16)*i/4,y);await page.waitForTimeout(45)}
  await page.waitForTimeout(140);await page.mouse.up();await page.waitForTimeout(700);
  const after=Number(await index()),count=Number((await page.locator(`#products-${group} output`).textContent()).split('/')[1].trim());
  assert.equal(after,(before+1)%count,`16px mouse swipe: ${width} ${group}`);
  ({x,y}=await point());await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+2,y+2);await page.mouse.up();await page.waitForTimeout(500);
  assert.equal(Number(await index()),after,'Click tremor must not change product');
  await page.mouse.move(x,y);await page.mouse.wheel(rtl?-16:16,0);await page.waitForTimeout(850);
  assert.equal(Number(await index()),(after+1)%count,`16px trackpad: ${width} ${group}`);
  await gallery.press(rtl?'ArrowRight':'ArrowLeft');await page.waitForTimeout(650);
  assert.equal(Number(await index()),after,'Reverse key matches visual direction');
  if(width===390){
   const cdp=await context.newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let i=1;i<=4;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(rtl?20:-20)*i/4,y}]});await page.waitForTimeout(50)}
   await page.waitForTimeout(140);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(750);
   assert.equal(Number(await index()),(after+1)%count,'20px touch swipe');
   ({x,y}=await point());const touchIndex=Number(await index());
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let i=1;i<=4;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+2,y:y-64*i/4}]});await page.waitForTimeout(40)}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
   assert.equal(Number(await index()),touchIndex,'Vertical touch scroll must not change product');await cdp.detach();
  }
  results.push({width,height,group,mouseSwipePixels:16,wheelPixels:16,touchSwipePixels:width===390?20:null,passed:true});
  console.log(`PASS gesture ${width} ${group}`);
 }
 await page.goto('http://127.0.0.1:4196/website-code/products.html#products-series');await page.waitForTimeout(500);
 const series=page.locator('[data-products-series]'),selected=()=>series.locator('[data-series-slide][aria-pressed="true"]').getAttribute('data-series-slide');
 const box=await series.locator('[data-series-slide][aria-pressed="true"]').boundingBox();
 const sx=Math.min(width-45,Math.max(45,box.x+box.width/2)),sy=Math.min(height-50,Math.max(110,box.y+box.height/2));
 const seriesBefore=Number(await selected());await page.mouse.move(sx,sy);await page.mouse.down();
 for(let i=1;i<=4;i++){await page.mouse.move(sx-16*i/4,sy);await page.waitForTimeout(45)}
 await page.waitForTimeout(140);await page.mouse.up();await page.waitForTimeout(700);
 assert.equal(Number(await selected()),(seriesBefore+1)%4,'Series uses the same short gesture');
 await series.press('ArrowLeft');await page.waitForTimeout(650);assert.equal(Number(await selected()),seriesBefore,'Series reverse direction');
 results.push({width,height,group:'series',mouseSwipePixels:16,keyboardReverse:true,passed:true});
 console.log(`PASS gesture ${width} series`);
 await context.close();
}
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});const page=await context.newPage();
await page.goto('http://127.0.0.1:4196/website-code/index.html#collections');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
assert.equal(await page.locator('.series-playback').count(),0);
await page.locator('.series-thumb[data-series-index="1"]').click();
const manual=await page.locator('#series-label').textContent();await page.locator('#series-photo').hover();await page.waitForTimeout(4500);
const automatic=await page.locator('#series-label').textContent();assert.notEqual(automatic,manual,'Manual selection and hover do not permanently stop autoplay');
results.push({page:'index',manualLabel:manual,automaticLabel:automatic,delay:4500,pauseControls:0,passed:true});
await page.screenshot({path:resolve(out,'after/index/1440x900/autoplay-continued.jpg'),type:'jpeg',quality:82});
await context.close();await browser.close();await writeFile(resolve(out,'data/interaction-results.json'),JSON.stringify(results,null,2));console.log(`PASS ${results.length} representative interaction scenarios`);
