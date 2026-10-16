import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { coverGeometry, mountSectionCover } from '../section-cover.js';

for (const viewport of [504, 738, 1312, 1968]) {
  const heights = [viewport - 80, viewport, viewport + 32];
  const mobile = coverGeometry(heights, viewport, 72);
  assert.deepEqual(mobile.map(panel => panel.pinned), [true, true, false]);
  assert.deepEqual(coverGeometry(heights, viewport, 72, true, true).map(panel => panel.pinned), [false, false, false]);
  const desktop = coverGeometry(heights, viewport, 72, false, true);
  assert.deepEqual(desktop.map(panel => panel.pinned), [true, true, true]);
  assert.deepEqual(desktop.map(panel => panel.top), [72, 72, 40]);
  for (const height of [viewport + 180, viewport * 2.2]) {
    const [panel] = coverGeometry([height], viewport, 72, false, true);
    assert.equal(height + panel.top, viewport + 72, 'Long chapter pins only after its bottom reaches the viewport bottom');
  }
}
assert.deepEqual(coverGeometry([0, 420, 900], 580, 64).map(panel => panel.pinned), [false, true, false]);
const source = await readFile(new URL('../section-cover.js', import.meta.url), 'utf8');
assert.doesNotMatch(source,/coverFollowOffset|style\.translate|Math\.exp|moving|previous/,'Native covers never add whole-panel follow displacement or settling frames');
class Panel {
  constructor(height, position) {
    this.offsetHeight=height;this.position=position;this.inert=false;
    const names=new Set(),properties=new Map();
    this.classList={add:(...values)=>values.forEach(value=>names.add(value)),remove:(...values)=>values.forEach(value=>names.delete(value)),contains:value=>names.has(value),toggle:(value,on)=>on?names.add(value):names.delete(value)};
    this.style={translate:'3px 2px',transform:'scale(1)',setProperty:(name,value)=>properties.set(name,value),removeProperty:name=>properties.delete(name),getPropertyValue:name=>properties.get(name)||''};
  }
  getBoundingClientRect(){return {top:this.position};}
}
const views=[[320,640],[360,800],[390,844],[430,932],[768,1024],[792,945],[997,876],[997,917],[1024,768],[1102,981],[1189,1263],[1280,800],[1440,900],[1515,917],[1920,560],[1920,1080],[2560,1440],[3840,2160]];
for(const [width,height] of views){
  const navigation=(width<=1023.98?64:72)*Math.max(1,width/1440),available=height-navigation;
  const frames=new Map(),events=new Map(),reduce={matches:false,addEventListener(type,callback){this.changed=callback;},removeEventListener(){this.changed=null;}};
  let next=0,disconnected=false,resized;
  globalThis.innerWidth=width;
  globalThis.document={documentElement:{clientHeight:height},querySelector:()=>({getBoundingClientRect:()=>({height:navigation})})};
  globalThis.window={addEventListener:(type,callback)=>events.set(type,callback),removeEventListener:type=>events.delete(type)};
  globalThis.matchMedia=()=>reduce;
  globalThis.requestAnimationFrame=callback=>{frames.set(++next,callback);return next;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  globalThis.ResizeObserver=class{constructor(callback){resized=callback;}observe(){}disconnect(){disconnected=true;}};
  const flush=()=>{const jobs=[...frames.values()];frames.clear();jobs.forEach(callback=>callback());assert.equal(frames.size,0,width+' no follow/settling animation runs after a scroll frame');};
  const sheets=[new Panel(available*.75,navigation),new Panel(available*.8,navigation+available*.6),new Panel(available*1.4,height+200)];
  const stop=mountSectionCover(sheets);flush();
  assert(sheets.every(sheet=>!sheet.inert&&!sheet.classList.contains('is-cover-behind')),width+' incoming cover leaves the current chapter readable');
  const scroll=()=>{for(let i=0;i<6;i++)events.get('scroll')();assert.equal(frames.size,1,width+' repeated native scroll events coalesce into one frame');flush();};
  for(const delta of [-24,-18,12,30]){sheets[1].position+=delta;scroll();assert(sheets.every(sheet=>sheet.style.translate==='3px 2px'&&sheet.style.transform==='scale(1)'),width+' no extra translation, scale or bounce at any direction');}
  sheets[1].position=navigation;scroll();
  assert(sheets[0].inert&&sheets[0].classList.contains('is-cover-behind'),width+' previous sheet retires at the cover boundary');
  sheets[1].position=navigation+2;scroll();
  assert(!sheets[0].inert&&!sheets[0].classList.contains('is-cover-behind'),width+' reverse scroll immediately restores the previous sheet');
  sheets[2].position=navigation;scroll();
  assert(sheets[0].classList.contains('is-cover-behind')&&sheets[1].classList.contains('is-cover-behind'),width+' only reached earlier sheets are hidden');
  sheets[1].offsetHeight=available*1.5;resized();flush();
  assert.equal(sheets[1].classList.contains('is-cover-fit'),width>=901,width+' resized long mobile chapters return to natural flow');
  assert.equal(parseFloat(sheets[1].style.getPropertyValue('--cover-top')),navigation-available*.5,width+' long chapter bottom remains fully readable before pinning');
  reduce.matches=true;reduce.changed();flush();
  assert(sheets.every(sheet=>!sheet.classList.contains('is-cover-fit')&&!sheet.classList.contains('is-cover-behind')&&!sheet.inert),width+' reduced motion releases every sheet');
  events.get('scroll')();stop();
  assert(disconnected);assert.equal(events.size,0);assert.equal(frames.size,0);assert.equal(reduce.changed,null);
  assert(sheets.every(sheet=>!sheet.classList.contains('section-cover-panel')&&!sheet.inert&&sheet.style.translate==='3px 2px'&&sheet.style.transform==='scale(1)'&&sheet.style.getPropertyValue('--cover-top')===''),width+' cleanup releases cover state without modifying existing transforms');
}
const styles = await readFile(new URL('../xunai/content.css', import.meta.url), 'utf8');
assert.match(styles, /\.section-cover-panel\.is-cover-fit\{position:sticky;top:var\(--cover-top\);min-height:var\(--cover-height\)\}/);
assert.match(styles, /\.xa-page \.xa-content\{display:contents\}/);
assert.match(styles, /\.xa-page \.xa-content>section\{width:100%;max-width:none;padding-inline:var\(--x-page-gutter\)\}/);
assert.match(styles, /\.section-cover-panel\.is-cover-behind\{visibility:hidden\}/);
assert.match(styles, /\.xa-page section\{border-top:0;border-bottom:0\}/);
for (const file of ['stores-page.js', 'ai-page.js']) {
  const source = await readFile(new URL('../xunai/' + file, import.meta.url), 'utf8');
  assert.ok(source.includes("import { mountSectionCover } from '../section-cover.js'"));
  assert.ok(source.includes('stopCover()') || source.includes('return stopCover'));
}
console.log(`PASS: native covers at ${views.length} viewport fixtures; no added translate or settle frames; coalesced scroll, forward/reverse boundary, resized long chapters, reduced motion and cleanup. Node/source checks only.`);
