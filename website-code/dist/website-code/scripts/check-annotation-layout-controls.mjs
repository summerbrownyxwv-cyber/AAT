import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { renderCooperationServices } from '../products-cooperation-services.js';

const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const markup = renderCooperationServices();
assert.equal((markup.match(/<summary aria-label="查看(?:研发|定制)流程"><span class="cooperation-services-toggle"/g) || []).length, 2);
assert.doesNotMatch(markup, /cooperation-services-summary-label|cooperation-services-flow-count|\d+个环节/);
assert.equal((markup.match(/class="cooperation-services-step"/g) || []).length, 16, 'The expandable workflows remain complete');
const services = await read('products-cooperation-services.css');
assert.match(services, /\.cooperation-flow-details\{margin-top:calc\(16 \* var\(--wide-u\)\);border:0\}/);
assert.match(services, /\.cooperation-services-copy\{order:0\}/);
assert.match(services, /\.cooperation-flow-details\{order:1\}/);
assert.match(services, /\.cooperation-services-illustration\{order:2;/);
const source = await read('site-navigation.js');
const node = () => ({
  listeners:new Map(), style:{}, attributes:{}, dataset:{}, children:[],
  addEventListener(type, callback){this.listeners.set(type, callback);},
  emit(type,event={}){this.listeners.get(type)?.(event);},
  setAttribute(name,value){this.attributes[name]=value;},
  append(value){this.children.push(value);},
  cloneNode(){return node();},
  focus(){document.activeElement=this;},
  showModal(){this.open=true;},
  close(){this.open=false;this.emit('close');},
});
const menu=node(), mainNav=node(), close=node(), actions=node(), nav=node(), drawer=node(), official=node(), title=node(), description=node(), email=node();
mainNav.querySelectorAll=()=>Array.from({length:6},node);
const header={querySelector:selector=>selector==='.menu-toggle'?menu:mainNav};
drawer.querySelector=selector=>selector==='nav'?nav:selector==='.site-drawer-actions'?actions:close;
drawer.querySelectorAll=()=>[close,...nav.children,...[node(),node()]];
official.querySelector=selector=>selector==='h2'?title:selector==='a[href^="mailto:"]'?email:description;
const created=[drawer,official], mobile={matches:true,addEventListener(){}}, reduce={matches:true};
const document={activeElement:null,body:{style:{overflow:'auto'},append(){}},querySelector:()=>header,createElement:()=>created.shift()};
vm.runInNewContext(source,{document,matchMedia:query=>query.includes('max-width')?mobile:reduce});
assert.equal(nav.children.length,6);
menu.emit('click');
assert.equal(drawer.open,true);
assert.equal(document.body.style.overflow,'hidden');
assert.equal(menu.attributes['aria-expanded'],'true');
for(const type of ['consumer','verify']){
  if(!drawer.open)menu.emit('click');
  actions.emit('click',{target:{closest:()=>({dataset:{siteService:type}})}});
  assert.equal(drawer.open,false);
  assert.equal(official.open,true);
  assert.equal(document.body.style.overflow,'auto');
  assert.equal(menu.attributes['aria-expanded'],'false');
  assert.equal(title.textContent,type==='verify'?'官方验证 / 投诉':'官方服务');
  assert.ok(email.href.startsWith('mailto:aat@dongyuanjt.com'));
  official.close();assert.equal(document.activeElement,menu);
}
assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/,'The menu does not submit or store feedback');
const spacing=await read('page-spacing.css');
assert.match(spacing,/clamp\(40px,4\.5vw,120px\)/);
for(const file of ['contact.html','service.html'])assert.ok((await read(file)).includes('./page-spacing.css'));
const company=await read('company.css');
for(const selector of ['company-intro','honor-section','action-section'])assert.match(company,new RegExp('\\.'+selector+'\\{[^}]*padding-block:clamp\\(40px,4\\.5vw,120px\\)'));
const home=await read('styles.css');
assert.match(home,/@media\(min-width:641px\) and \(max-width:900px\)\{\s*\.planting-layout\{[^}]*min-height:0\}/);
for(const [width,height] of [[320,640],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1189,1263],[1488,1307],[1920,560],[2560,1440],[3840,2160]]){
  const gap=Math.max(40,Math.min(width*.045,120));
  assert(gap>=40&&gap<=120&&gap*2<height);
  const unit=Math.max(1,width/1440), navHeight=(width<1024?64:72)*unit;
  const stage=(height-navHeight)*2/3;
  const oldTravel=Math.max(640*unit,Math.min(height*1.05,1200*unit));
  const travel=Math.max(1280/3*unit,Math.min(height*.7,800*unit));
  assert(Math.abs(travel-oldTravel*2/3)<.001);
  assert(stage>0);
}
console.log('PASS: plus-only accessible OEM/ODM controls, complete workflows, mobile official-service dialogs and scroll/focus restoration, bounded equal chapter spacing, tablet gap removal and proportionally compact flower across eleven viewport fixtures. Node/source checks only.');
