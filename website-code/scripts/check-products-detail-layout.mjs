import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { productGroups } from '../../content/products-data.js';
import { coverGeometry } from '../section-cover.js';

const page = await readFile(new URL('../products-page.js', import.meta.url), 'utf8');
const renderer = vm.createContext({});
vm.runInContext(page.slice(page.indexOf('const escape ='), page.indexOf('function renderCatalog()')) + '\nglobalThis.render = renderTrack;', renderer);
assert.deepEqual(productGroups.map(group => group.products.length), [6, 6, 4, 3]);
for (const group of productGroups) {
  const markup = renderer.render(group);
  assert.equal((markup.match(/class="product-detail-card"/g) || []).length, group.products.length, 'Every detail product appears exactly once');
  assert.equal((markup.match(/class="product-card-artwork"/g) || []).length, group.products.length, 'One artwork wrapper scales all layers together');
  assert.equal((markup.match(/class="product-card-layer"/g) || []).length, group.products.reduce((sum, product) => sum + product.layers.length, 0));
}
const styles = await readFile(new URL('../products-page.css', import.meta.url), 'utf8');
assert.doesNotMatch(styles, /product-detail-card[^{}]*:[^{}]*(?:hover|active)[^{}]*\{[^{}]*box-shadow/);
assert.match(styles, /\.product-detail-card:hover \.product-card-artwork\{transform:scale\(1\.025\)\}/);
assert.doesNotMatch(styles, /data-transitioning=true[^{}]*\{pointer-events:none/);
assert.doesNotMatch(styles, /\.product-group\s*\{[^}]*\b(?:position\s*:\s*(?:absolute|fixed)|inset\s*:|overflow(?:-[xy])?\s*:\s*(?:clip|hidden))/, 'Natural-height product panels must stay in document flow without stage clipping');
assert.doesNotMatch(styles, /\.product-catalog\.is-pinned/, 'The obsolete synthetic pinned catalog must not retain CSS rules');
assert.match(page, /max:group\.products\.length - 1/);

const source = await readFile(new URL('../products-catalog-motion.js', import.meta.url), 'utf8');
const showcase = await readFile(new URL('../products-showcase.js', import.meta.url), 'utf8');
const showcaseStyles = await readFile(new URL('../products-showcase.css', import.meta.url), 'utf8');
assert.doesNotMatch(showcase, /--series-color/, 'Changing series must not change the white surface');
assert.match(showcaseStyles, /\.products-series\{[^}]*background:#fff;/);
assert.doesNotMatch(source,/catalogTimeline|requestAnimationFrame|style\.height|style\.transform/,'Native covers have no synthetic runway or clipped moving viewport');
assert.match(styles,/\.product-catalog-stage\{display:contents;outline:none\}/);
assert.match(styles,/\.product-catalog \.section-cover-panel\.is-cover-fit\{position:sticky;top:var\(--cover-top\);min-height:0\}/);
const viewports = [[320,640],[390,844],[430,932],[768,1024],[792,945],[997,876],[997,917],[1102,981],[1189,1263],[1440,900],[1515,917],[1920,560],[1920,1080],[2560,1440],[3840,2160]];
for (const [width, viewport] of viewports) {
  const nav=(width<1024?64:72)*Math.max(1,width/1440), available=viewport-nav;
  const heights=[available*.75,available*1.3,available*.8,available*.9];
  const panels=heights.map((offsetHeight,index)=>({id:`products-${index}`,offsetHeight,inert:false}));
  const events=new Map(), clicks=new Map();let mounted=false,stopped=false,scroll;
  const catalog={querySelectorAll:()=>panels,getBoundingClientRect:()=>({top:1000})};
  const context=vm.createContext({
    scrollY:0,scrollTo:value=>scroll=value,location:{hash:''},
    mountSectionCover:targets=>{assert.equal(targets.length,panels.length-1);targets.forEach((panel,index)=>assert.equal(panel,panels[index+1]));assert(!targets.includes(panels[0]),'Overview to first detail remains natural flow');mounted=true;return()=>stopped=true;},
    document:{querySelector:()=>({getBoundingClientRect:()=>({height:nav})}),fonts:{ready:{then:callback=>callback()}},addEventListener:(type,callback)=>clicks.set(type,callback),removeEventListener:type=>clicks.delete(type)},
    window:{addEventListener:(type,callback)=>events.set(type,callback),removeEventListener:type=>events.delete(type)},
  });
  vm.runInContext(source.replace(/^import[^\n]+\n/gm,'').replace(/^export /gm,'')+'\nglobalThis.mount=mountCatalog;',context);
  const cleanup=context.mount({querySelector:()=>catalog});assert(mounted);
  context.location.hash='#products-2';events.get('hashchange')();
  assert.equal(scroll.top,1000+heights[0]+heights[1]-nav,'Hash navigation uses the natural content heights');
  assert(panels.every(panel=>!panel.inert),'Catalog does not block partly visible panels');
  const geometry=coverGeometry(heights,available,nav,false,width>=901);
  assert.equal(geometry[1].pinned,width>=901);
  assert.equal(geometry[1].top+heights[1],viewport,'Long cover reaches the screen bottom after reading');
  cleanup();assert(stopped);assert.equal(events.size,0);assert.equal(clicks.size,0);
}
console.log(`PASS: unique finite 6/6/4/3 cards, white series surface, natural overview/first-detail flow, later covers, original hash routes and cleanup at ${viewports.length} viewport fixtures. Source/Node checks only.`);
