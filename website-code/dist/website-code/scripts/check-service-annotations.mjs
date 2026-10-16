import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { coverFollowOffset, coverGeometry, mountSectionCover } from '../section-cover.js';

const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const source = await read('xunai/stores-page.js');
const context = vm.createContext({window:{XunAiDesign:{responsiveMarkup:value=>value}},matchMedia:()=>({matches:false,addEventListener(){}})});
vm.runInContext(source.replace(/^import[^\n]+\n/gm, ''), context);
const html = context.window.XunAiStores.render('/stores/standard');
const stack = [], panels = [], stores = [];
for (const [,closing,tag,attributes] of html.matchAll(/<(\/?)(section|article)\b([^>]*)>/g)) {
  if (closing) { assert.equal(stack.pop().tag, tag); continue; }
  const node = {tag,attributes,parent:stack.at(-1)};
  if (tag === 'section' && !node.parent && /\bxs-section\b/.test(attributes)) panels.push(node);
  if (tag === 'article' && /\bxs-type\b/.test(attributes)) stores.push(node);
  stack.push(node);
}
assert.equal(panels.length, 5, 'Competence, locations, both store types and services are sibling cover sheets');
assert.equal(stores.length, 2);
assert.ok(stores.every(store=>panels.includes(store.parent)), 'Store articles cannot become nested sticky panels');
assert.equal((html.match(/id="types"/g)||[]).length, 1, 'The existing store comparison anchor remains');
assert.doesNotMatch(html, /<figcaption>标准店设计参考<\/figcaption>/);
assert.ok(source.includes("main.querySelectorAll('.xs-page > .xs-section')"));
for (const route of ['/stores/black-gold/detail','/stores/standard/detail','/stores/services']) {
  assert.ok(context.window.XunAiStores.render(route).includes('xs-page'), route);
}
const css = await read('service-annotation.css');
assert.match(css, /\.xs-page>\.section-cover-panel\{padding-block:clamp\(40px,4\.5vw,120px\)\}/);
assert.match(css, /\.xs-page>\.section-cover-panel\.is-cover-fit\{min-height:0\}/);
assert.match(css, /#main-content #types>\.xs-type\{padding-block:0;/);
assert.match(css, /\.xf-cta\{background:var\(--cream\);color:#000;min-height:0;padding-block:clamp\(40px,4\.5vw,120px\)\}/);
assert.match(css, /\.xf-cta p\{color:#000;text-shadow:none\}/);
const cta = (await read('service.html')).match(/<section class="xf-cta">[\s\S]*?<\/section>/)[0];
assert.doesNotMatch(cta, /<img\b/);
assert.ok(cta.includes('href="./service.html#/franchise"'));

class Panel {
  constructor(height, position) {
    this.offsetHeight=height; this.position=position; this.inert=false;
    const names=new Set(); this.classList={add:(...values)=>values.forEach(value=>names.add(value)),remove:(...values)=>values.forEach(value=>names.delete(value)),contains:value=>names.has(value),toggle:(value,on)=>on?names.add(value):names.delete(value)};
    this.style={translate:'',setProperty(){},removeProperty(){}};
  }
  getBoundingClientRect(){return {top:this.position+(parseFloat(this.style.translate.split(' ')[1])||0)};}
}
const views = [[320,640],[390,844],[768,1024],[1024,768],[1189,1263],[1440,900],[1920,560],[2560,1440],[3840,2160]];
for (const [width,height] of views) {
  const navigation=(width<=1023.98?64:72)*Math.max(1,width/1440), available=height-navigation;
  const frames=new Map(),events=new Map(), reduce={matches:false,addEventListener(type,callback){this.changed=callback;},removeEventListener(){}};
  let next=0,time=0,disconnected=false;
  globalThis.innerWidth=width;
  globalThis.document={documentElement:{clientHeight:height},querySelector:()=>({getBoundingClientRect:()=>({height:navigation})})};
  globalThis.window={addEventListener:(type,callback)=>events.set(type,callback),removeEventListener:type=>events.delete(type)};
  globalThis.matchMedia=()=>reduce;
  globalThis.requestAnimationFrame=callback=>{frames.set(++next,callback);return next;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  globalThis.ResizeObserver=class{observe(){} disconnect(){disconnected=true;}};
  const flush=()=>{const jobs=[...frames.values()];frames.clear();time+=16.67;jobs.forEach(callback=>callback(time));};
  const position=navigation+available*.6;
  const sheets=[new Panel(available*.75,position-80),new Panel(available*.8,position),new Panel(available*1.4,height+200)];
  const stop=mountSectionCover(sheets);flush();
  sheets[1].position-=24;events.get('scroll')();flush();
  assert.ok(parseFloat(sheets[1].style.translate.split(' ')[1])>0, width+' incoming sheet follows native scroll');
  for(let i=0;i<100&&frames.size;i++)flush();
  assert.equal(sheets[1].style.translate,'',width+' follow settles completely');
  sheets[1].position+=18;events.get('scroll')();flush();
  assert.ok(parseFloat(sheets[1].style.translate.split(' ')[1])<0,width+' reverse movement remains continuous');
  sheets[1].position=navigation;events.get('scroll')();flush();
  assert.equal(sheets[1].style.translate,'',width+' navigation boundary has no residual displacement');
  sheets[1].position=navigation-40;events.get('scroll')();flush();
  assert.equal(sheets[1].style.translate,'',width+' long chapter reading is not delayed');
  reduce.matches=true;reduce.changed();flush();
  assert.ok(sheets.every(sheet=>!sheet.classList.contains('is-cover-fit')&&!sheet.inert&&sheet.style.translate===''),width+' reduced motion stays natural flow');
  stop();assert.ok(disconnected);assert.equal(events.size,0);assert.equal(frames.size,0);
  const geometry=coverGeometry([available*.5,available*1.4],available,navigation,false,width>=901);
  assert.equal(geometry[1].pinned,width>=901,'Long mobile chapters remain readable in natural flow');
}
assert.equal(coverFollowOffset(5,50,16.67,0),0);
assert.ok(coverFollowOffset(10,0,32,56)<coverFollowOffset(10,0,16,56),'Follow is time based');
console.log('PASS: service sibling sheets, content heights, original store routes, image-free CTA, and native cover follow across nine viewport fixtures with reverse/boundary/reduced-motion/cleanup checks. Source and Node simulation only; browser visual QA remains pending.');
