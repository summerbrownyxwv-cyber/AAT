import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { clamp, smoothstep } from '../motion.js';

const source = await readFile(new URL('../planting-page.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../planting-page.css', import.meta.url), 'utf8');
const extract = (start, end) => {
  const first = source.indexOf(start), last = source.indexOf(end, first);
  assert(first >= 0 && last > first, start);
  return source.slice(first, last);
};
const make = new Function('state', 'clamp', `
  let traitCursor=state.cursor ?? 0;
  const {reduced,traitFlow,innerHeight,scrollY}=state;
  const traitsStory={section:{getBoundingClientRect:()=>({top:state.sceneTop})}};
  const document={querySelector:selector=>selector==='dialog[open]'?state.dialog:{getBoundingClientRect:()=>({height:state.nav})}};
  const window={scrollTo:options=>{state.aligned=options;state.sceneTop=state.nav;}};
  const schedule=()=>{state.scheduled=true;};
  ${extract('function advanceTraits(delta)', 'const traitInput =')}
  return {advance:advanceTraits,cursor:()=>traitCursor};
`);
const measure = new Function('copyHeight','matches',`
  const innerWidth=986,innerHeight=909,reduced={matches};let traitFlow;
  const document={querySelector:()=>({getBoundingClientRect:()=>({height:64})})};
  const getComputedStyle=()=>({paddingTop:'24',paddingBottom:'24',rowGap:'24'});
  const stage={style:{},offsetHeight:845},section={style:{},classList:{remove(){},toggle(){}},querySelector:()=>({querySelector:()=>({offsetHeight:40})})};
  const traitsStory={section,stage},research={section:{style:{}},stage:{offsetHeight:500,querySelectorAll:()=>[]}};
  const stories=[research,traitsStory],traitArticles=[{querySelector:selector=>selector==='figure'?{offsetHeight:200}:{scrollHeight:copyHeight}}];
  ${extract("  const top = document.querySelector('.site-navigation')",'  const titleBottom')}
  return {traitFlow,height:stage.style.height,travel:traitsStory.travel,researchTravel:research.travel};
`);
assert.deepEqual(measure(300,false),{traitFlow:false,height:'845px',travel:0,researchTravel:275});
assert.deepEqual(measure(800,false),{traitFlow:true,height:'auto',travel:0,researchTravel:275});
assert.deepEqual(measure(300,true),{traitFlow:true,height:'auto',travel:0,researchTravel:0});
for (const [width,height,nav] of [[320,640,64],[390,844,64],[768,1024,64],[986,909,64],[1440,900,72],[1920,1080,96],[3840,2160,192]]) {
  const state={nav,sceneTop:nav,innerHeight:height,scrollY:1000,reduced:{matches:false},traitFlow:false};
  const input=make(state,clamp), visited=new Set([0]);
  assert.equal(input.advance(-40),false,'The first state releases upward scrolling');
  for(let i=0;i<100 && input.cursor()<7;i++){
    assert(input.advance(Math.max(240,(height-nav)*.55)/3));
    visited.add(Math.min(7,Math.floor(input.cursor()+1e-8)));
  }
  assert.equal(input.cursor(),7);
  assert.deepEqual([...visited],[0,1,2,3,4,5,6,7],width+' visits every trait/data stage');
  assert.equal(input.advance(40),false,'After all data is visible the page scrolls downward');
  assert(input.advance(-10000));assert.equal(input.cursor(),6,'A single large event advances at most one state');
  for(let i=0;i<100 && input.cursor()>0;i++) input.advance(-200);
  assert.equal(input.cursor(),0);
  assert.equal(input.advance(-40),false);
}
for(const options of [{reduced:{matches:true}},{traitFlow:true},{dialog:{open:true}},{sceneTop:800}]){
  const state={nav:64,sceneTop:64,innerHeight:909,scrollY:0,reduced:{matches:false},traitFlow:false,...options};
  assert.equal(make(state,clamp).advance(100),false,'Reduced, long-content, modal and offscreen input passes through');
}
const entry={nav:64,sceneTop:114,innerHeight:909,scrollY:1000,reduced:{matches:false},traitFlow:false};
assert(make(entry,clamp).advance(80));assert.deepEqual(entry.aligned,{top:1050,behavior:'instant'});
const reverse={nav:64,sceneTop:14,innerHeight:909,scrollY:1000,cursor:7,reduced:{matches:false},traitFlow:false};
assert(make(reverse,clamp).advance(-80));assert.equal(reverse.aligned.top,950);
const overshoot={nav:64,sceneTop:40,innerHeight:909,scrollY:1000,reduced:{matches:false},traitFlow:false};
assert(make(overshoot,clamp).advance(16),'Line-wheel rounding may enter slightly past the anchor');assert.equal(overshoot.aligned.top,976);

const handlers={};let advances=[];
const attach = new Function('window','advanceTraits','innerHeight',`${extract('const traitInput =','function render(time)')}return traitInput;`);
const controller=attach({addEventListener:(type,callback)=>handlers[type]=callback},delta=>{advances.push(delta);return true;},900);
const event=extra=>({cancelable:true,deltaMode:0,deltaX:0,deltaY:40,target:{closest:()=>null},preventDefault(){this.prevented=true;},...extra});
for(const extra of [{ctrlKey:true},{metaKey:true},{deltaX:100},{cancelable:false},{target:{closest:()=>({})}}]) handlers.wheel(event(extra));
assert.deepEqual(advances,[]);
const wheel=event({deltaMode:1});handlers.wheel(wheel);assert.equal(wheel.prevented,true);assert.equal(advances.at(-1),640);
const key=event({key:' ',shiftKey:true});handlers.keydown(key);assert.equal(advances.at(-1),-900);
handlers.touchstart({touches:[{clientX:100,clientY:300}]});
const touch=event({touches:[{clientX:102,clientY:240}]});handlers.touchmove(touch);assert.equal(touch.prevented,true);assert.equal(advances.at(-1),60);
handlers.touchend();const calls=advances.length;handlers.touchmove(touch);assert.equal(advances.length,calls);
controller.abort();assert.equal(controller.signal.aborted,true);

const node=()=>({dataset:{},style:{setProperty(key,value){this[key]=value;}},attrs:{},setAttribute(key,value){this.attrs[key]=value;},classList:{toggle(){}},querySelector(){return node();}});
const renderStates = new Function('traitCursor','traitFlow','clamp','smoothstep',`
  const traitsStory={section:node()},composition={section:node()};
  const stage=node();traitsStory.section.querySelector=()=>stage;
  const traitArticles=Array.from({length:4},()=>node());
  const dataRows=Array.from({length:3},()=>{const row=node(),value=node();value.dataset.final='original data';row.querySelector=()=>value;return row;});
  let rotation;const plantScene={setProgress:value=>rotation=value};
  ${extract('  const compositionPhase =','  const researchP =')}
  ${extract('  traitArticles.forEach((article,index) => {','  if(moving)')}
  return {stage,traitsStory,composition,traitArticles,dataRows,rotation};
`.replace('const traitsStory=','const node='+node.toString()+';const traitsStory='));
for(const cursor of [0,1,2,3,4,5,6,7]){
  const result=renderStates(cursor,false,clamp,smoothstep);
  assert.equal(result.rotation,0,'Leaf rotation stays fixed for every stage');
  assert.equal(result.stage.attrs['aria-hidden'],String(cursor>=4));
  for(let index=0;index<3;index++) assert.equal(Number(result.dataRows[index].dataset.reveal),cursor>=5+index?1:0);
}
const all=renderStates(0,true,clamp,smoothstep);
assert(all.dataRows.every(row=>row.dataset.reveal==='1.000'));
assert(all.traitArticles.every(article=>article.attrs['aria-hidden']==='false'));
assert.doesNotMatch(source,/rotateX|landGeometry|--land-shrink|scrollStory:land/);
assert.match(source,/const natural = item === traitsStory \|\| reduced\.matches/);
assert.match(css,/\.plant-land-stage\{position:relative;display:grid/);
assert.match(css,/\.plant-traits-scene\{position:relative;height:calc\(100svh - var\(--site-navigation-height\)\)\}/);
assert.match(css,/\.plant-story-flow \.plant-trait-list article\{position:relative/);
console.log('PASS: compact planting input, forward/reverse/entry/exit, wheel/touch/keyboard exceptions, every data stage and fixed leaf. Node simulations, not browser screenshots.');
