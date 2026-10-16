import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { productGroups } from '../../content/products-data.js';
import { catalogTimeline } from '../products-catalog-motion.js';

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
assert.doesNotMatch(styles, /\.product-catalog\.is-pinned \.product-group-sheet\{[^}]*min-height/);
assert.match(page, /max:group\.products\.length - 1/);

const source = await readFile(new URL('../products-catalog-motion.js', import.meta.url), 'utf8');
for (const [width, viewport] of [[390,844],[768,1024],[1189,1263],[1440,900],[1920,1080],[2560,1440],[3840,2160]]) {
  const nav = (width <= 900 ? 64 : 72) * Math.max(1, width / 1440);
  const content = Math.min(viewport - nav, 600 * Math.max(1, width / 1440));
  const heights = [content, content, content, content];
  const context = vm.createContext({ Math, performance: { now: () => 1 }, innerHeight: viewport, scrollY: 0 });
  const frames = new Map(), events = new Map();
  let frame = 0, focus = 0;
  const store = new Map();
  const stage = {
    style: { setProperty: (key, value) => store.set(key, value), removeProperty: key => store.delete(key) }, dataset: {},
    get clientHeight() { return Math.min(viewport - nav, parseFloat(store.get('--catalog-content-height')) || viewport); },
    getBoundingClientRect: () => ({ top: Math.max(nav, 1000 - context.scrollY) }),
    focus: () => focus++,
  };
  const panels = heights.map((height, index) => ({
    dataset: { productGroup: String(index) }, style: {},
    firstElementChild: { scrollHeight: height, style: {} },
    contains: () => false, setAttribute() {}, removeAttribute() {},
  }));
  stage.querySelectorAll = () => panels;
  const catalog = { querySelector: () => stage, classList: { toggle() {} }, style: {}, dataset: {}, getBoundingClientRect: () => ({ top: 1000 - context.scrollY }) };
  Object.assign(context, {
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    requestAnimationFrame: callback => { frames.set(++frame, callback); return frame; }, cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    getComputedStyle: () => ({ top: `${nav}px` }),
    location: { hash: '' },
    document: { activeElement: null, fonts: { ready: { then: callback => callback() } }, addEventListener() {}, removeEventListener() {} },
    window: { addEventListener: (type, callback) => events.set(type, callback), removeEventListener() {} },
  });
  vm.runInContext(source.replace(/^export /gm, '') + '\nglobalThis.mount = mountCatalog;', context);
  const cleanup = context.mount({ querySelector: () => catalog });
  assert.equal(stage.clientHeight, content, 'The stage is bounded by actual content, not forced to a full viewport');
  const timeline = catalogTimeline(heights, content);
  assert.equal(timeline.panels[0].departure, 0, 'No empty waiting interval follows a fully visible group');
  assert.equal(parseFloat(catalog.style.height), content + timeline.distance);
  context.scrollY = 1000 - nav + timeline.cover / 2;
  events.get('scroll')();
  for (let tick = 1; tick <= 120; tick++) for (const [id, callback] of [...frames]) { frames.delete(id); callback(tick * 16); }
  assert.equal(panels[0].inert, false);
  assert.equal(panels[1].inert, false, 'A partly exposed group accepts input before reaching the top');
  assert.equal(panels[2].inert, true, 'A fully hidden group stays outside keyboard navigation');
  assert.equal(focus, 0, 'The incoming group must not steal focus while both groups remain visible');
  cleanup();
}
const long = catalogTimeline([600, 1100, 600], 800);
assert.equal(long.panels[1].read, 300, 'Long content is read fully before the next cover begins');
console.log('PASS: unique 6/6/4/3 detail cards, shared artwork hover, compact content geometry, partial-visibility input and long-content reading across seven sizes.');
