import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

class Element {
  constructor(name='') {
    this.name=name;this.dataset={};this.attributes={};this.listeners=new Map();this.children=[];this.style={setProperty(){},removeProperty(){}};
    const classes=new Set();this.classList={add:(...items)=>items.forEach(item=>classes.add(item)),remove:item=>classes.delete(item),contains:item=>classes.has(item),toggle:(item,on)=>on?classes.add(item):classes.delete(item)};
    this.selectors={};this.offsetLeft=0;this.offsetWidth=300;this.clientWidth=940;this.scrollWidth=1580;this.scrollLeft=0;
  }
  querySelector(selector){return this.selectors[selector];}
  querySelectorAll(selector){return this.selectors[selector]||[];}
  append(...nodes){nodes.forEach(node=>{node.parentElement=this;this.children.push(node);});}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(type,callback,options={}){const listeners=this.listeners.get(type)||[];listeners.push(callback);this.listeners.set(type,listeners);options.signal?.addEventListener('abort',()=>this.listeners.set(type,listeners.filter(item=>item!==callback)),{once:true});}
  emit(type,values={}){const event={target:this,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...values};this.listeners.get(type)?.forEach(callback=>callback(event));return event;}
  scrollTo(options){this.lastScroll=options;this.scrollLeft=Math.max(0,Math.min(options.left,this.scrollWidth-this.clientWidth));}
  focus(){document.activeElement=this;}
  remove(){this.removed=true;}
  setPointerCapture(){}
}
const frames=new Map();let nextFrame=0;
globalThis.requestAnimationFrame=callback=>{frames.set(++nextFrame,callback);return nextFrame;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
const flushFrames=()=>{for(const [id,callback] of frames){frames.delete(id);callback();}};
const observers=[];
globalThis.ResizeObserver=class{constructor(callback){this.callback=callback;observers.push(this);}observe(){this.callback();}disconnect(){this.disconnected=true;}};
globalThis.matchMedia=()=>({matches:false});
globalThis.getComputedStyle=()=>({columnGap:'8px'});
globalThis.document={createElement:()=>new Element(),activeElement:null};
globalThis.window={};
await import('../xunai/brand-figma.js');

const main=new Element('main'),business=new Element('business'),covers=new Element('covers'),viewport=new Element('old detail viewport'),track=new Element('detail track');
const choices=Array.from({length:3},(_,index)=>new Element(`choice ${index}`));
track.children=choices.map(()=>{const article=new Element(),detail=new Element();article.selectors['.xf-stage-content']=detail;return article;});
const create=document.createElement;
document.createElement=()=>{const panel=create();panel.append=(...nodes)=>{nodes.forEach(node=>node.parentElement=panel);panel.children.push(...nodes);panel.selectors['.company-business-detail']=nodes[1];};return panel;};
covers.selectors['[data-stage]']=choices;
business.selectors={'.xf-covers':covers,'.xf-detail-viewport':viewport,'.xf-detail-track':track};
const cards=Array.from({length:5},(_,index)=>{const card=new Element(`card ${index}`);card.offsetLeft=index*320;return card;});
const yearList=new Element('year list');yearList.clientWidth=300;yearList.scrollWidth=500;
const years=cards.map((_,index)=>{const year=new Element(`year ${index}`);year.dataset.year=String(index);year.parentElement=yearList;year.offsetLeft=index*100;year.offsetWidth=100;return year;});
const historyTrack=new Element('history track'),historyViewport=new Element('history viewport');historyTrack.parentElement=historyViewport;
main.classList.add('company-brand-content');
main.selectors={'.xf-brand':new Element(),'[data-business]':business,'.xf-history-track':historyTrack,'[data-history]':cards,'[data-year]':years};
const cleanup=window.XunAiFigmaBrand.mount(main);
assert.equal(business.dataset.active,'-1');
covers.children[0].emit('pointerenter',{pointerType:'mouse'});assert.equal(business.dataset.active,'-1');
choices[0].emit('click');assert.equal(business.dataset.active,'0');assert.equal(choices[0].attributes['aria-expanded'],'true');
business.emit('pointerleave');assert.equal(business.dataset.active,'0');
choices[0].focus();business.emit('keydown',{key:'ArrowRight'});assert.equal(document.activeElement,choices[1]);assert.equal(business.dataset.active,'0');
choices[1].emit('click');assert.equal(business.dataset.active,'1');
business.emit('keydown',{key:'Escape'});assert.equal(business.dataset.active,'-1');
choices[1].emit('click');choices[1].emit('click');assert.equal(business.dataset.active,'-1');
assert.equal(viewport.removed,true);

years[4].emit('click');assert.deepEqual(historyViewport.lastScroll,{left:640,behavior:'smooth'});assert.equal(cards[4].attributes['aria-pressed'],'true');
flushFrames();assert.equal(cards[4].attributes['aria-pressed'],'true');
historyViewport.emit('pointerdown',{isPrimary:true,button:0,pointerType:'mouse',clientX:300,clientY:40});
historyViewport.emit('pointermove',{pointerId:1,clientX:500,clientY:42});assert.equal(historyViewport.scrollLeft,440);
historyViewport.emit('pointerup');assert.deepEqual(historyViewport.lastScroll,{left:320,behavior:'smooth'});assert.equal(cards[1].attributes['aria-pressed'],'true');
assert.equal(historyViewport.emit('click').prevented,true);
historyViewport.emit('wheel');historyViewport.scrollLeft=640;historyViewport.emit('scroll');flushFrames();assert.equal(cards[2].attributes['aria-pressed'],'true');
historyTrack.emit('keydown',{key:'End'});assert.equal(document.activeElement,cards[4]);assert.equal(cards[4].attributes['aria-pressed'],'true');
yearList.emit('keydown',{key:'Home'});assert.equal(historyViewport.lastScroll.left,0);assert.equal(document.activeElement,years[0]);
cleanup();years[3].emit('click');assert.equal(cards[0].attributes['aria-pressed'],'true');assert(observers.every(observer=>observer.disconnected));
assert(readFileSync(new URL('../company.html',import.meta.url),'utf8').includes('让蕲春艾草<br>抵达更多健康生活'));
console.log('PASS: click-only business accordion, keyboard collapse/focus, native history scrolling/drag, year sync, bounds and cleanup.');
