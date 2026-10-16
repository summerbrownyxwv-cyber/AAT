import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const source = await readFile(new URL('../product-hero.js', import.meta.url), 'utf8');
const sceneSource = await readFile(new URL('../product-scene.js', import.meta.url), 'utf8');
const products = new Function(sceneSource.match(/export const products = ([\s\S]*?\n\]);/)[0].replace('export const products = ', 'return '))();
let sceneFactory;
globalThis.__heroScene = {products,createProductScene:container=>sceneFactory(container)};
const { renderProductHero, mountProductHero } = await import('data:text/javascript,' + encodeURIComponent(source.replace(/^import[^\n]+\n/, 'const {createProductScene, products} = globalThis.__heroScene;\n')));
const markup = renderProductHero();
assert.equal((markup.match(/data-product-index=/g) || []).length, 5);
assert.ok(markup.includes('id="products-hero"') && markup.includes('id="product-canvas"'));
assert.equal((markup.match(/type="button"/g) || []).length, 5, 'Product selection remains native keyboard-operable buttons');
assert.match(markup, /class="product-fallback"/);
assert.doesNotMatch(source, /scrollTo|scrollY|addEventListener\('(?:scroll|wheel)'|preventDefault/, 'Hero selection and rotation must not move or intercept page scroll');
for (const product of products) await access(new URL('../' + product.image, import.meta.url));
const styles = await readFile(new URL('../product-hero.css', import.meta.url), 'utf8');
assert.match(styles, /\.model-hero\{position:relative;height:var\(--model-height\)/);
assert.match(styles, /\.model-hero-viewport\{position:relative/);
assert.doesNotMatch(styles, /position:sticky|80svh/);
for (const [width, height] of [[320,568],[390,844],[430,932],[568,320],[667,375],[844,390],[768,1024],[900,981],[901,981],[997,917],[1030,981],[1076,981],[1189,1263],[1440,900],[1920,1080],[2560,1440],[3840,2160]]) {
  const unit = width / 1440, wide = Math.max(1, unit), mobile = width <= 900;
  const available = height - (mobile ? 64 : 72) * wide;
  const content = mobile ? Math.min(width - 40 * wide, 440 * wide) * 603 / 592 + 300 * wide : 603 * unit + 112 * wide;
  const compact = Math.min(available, content), landscape = (height <= 560 && width > height) || (!mobile && width / height >= 2);
  const stageWidth = landscape ? Math.min(width * .38, (compact - 48 * wide) * 592 / 603) : mobile ? Math.min(width - 40 * wide, 440 * wide, (compact - 300 * wide) * 592 / 603) : Math.min(592 * unit, (compact - 112 * wide) * 592 / 603);
  const stageHeight = stageWidth * 603 / 592;
  assert.ok(compact > 0 && compact <= available, `${width}x${height}: the entire hero stays within one available viewport`);
  assert.ok(stageWidth > 0 && stageWidth < width && stageHeight <= compact, `${width}x${height}: model stays inside its stage`);
  if (mobile && !landscape) {
    const menuTop = compact - 24 * wide - 36 * wide - 121 * wide;
    assert.ok(100 * wide + stageHeight <= menuTop, `${width}x${height}: model and two-row menu do not overlap`);
  }
}
const frames = new Map(); let nextFrame = 0, visibleCallback;
globalThis.requestAnimationFrame = callback => {frames.set(++nextFrame, callback); return nextFrame;};
globalThis.cancelAnimationFrame = id => frames.delete(id);
const document = globalThis.document = new EventTarget(); document.hidden = false;
const reduced = new EventTarget(); reduced.matches = false;
globalThis.matchMedia = () => reduced;
globalThis.IntersectionObserver = class {
  constructor(callback) {visibleCallback = callback;}
  observe() {}
  disconnect() {this.disconnected = true;}
};
const buttons = products.map(product => Object.assign(new EventTarget(), {
  dataset: {series:product.series}, classList:{toggle(){}}, attrs:{},
  setAttribute(name,value) {this.attrs[name]=value;}
}));
const fallback = {}, series = {}, stage = {style:{setProperty(){}}}, canvas = {setAttribute(){}};
const elements = {'.product-stage':stage, '#product-series':series, '.product-fallback':fallback, '#product-canvas':canvas};
const hero = {querySelector:selector=>elements[selector], querySelectorAll:()=>buttons};
const progress = [], rotation = []; let destroyed = false;
const scene = {setProgress:value=>progress.push(value), setRotation:value=>rotation.push(value), destroy:()=>{destroyed=true;}};
sceneFactory = async () => scene;
const cleanup = await mountProductHero({querySelector:()=>hero});
assert.equal(frames.size, 0, 'No animation before the hero intersects the viewport');
for (let index = 0; index < 5; index++) {
  buttons[index].dispatchEvent(new Event('click'));
  assert.equal(progress.at(-1), index); assert.equal(fallback.src,products[index].image);
  assert.equal(buttons[index].attrs['aria-pressed'],'true');
  assert.equal(buttons.filter(button=>button.attrs['aria-pressed']==='true').length,1);
}
visibleCallback([{isIntersecting:true}]);
const flush = time => {const entries=[...frames];frames.clear();entries.forEach(([,callback])=>callback(time));};
flush(100); flush(116); assert.equal(rotation.length,1,'Slow rotation renders at most once per 32ms');
flush(132); assert.ok(rotation.at(-1)>0 && rotation.at(-1)<.01);
assert.equal(progress.at(-1),4,'Ambient rotation must not automatically switch the chosen product');
visibleCallback([{isIntersecting:false}]); assert.equal(frames.size,0,'Offscreen rotation stops');
visibleCallback([{isIntersecting:true}]); document.hidden=true; document.dispatchEvent(new Event('visibilitychange'));
assert.equal(frames.size,0,'Background rotation stops');
document.hidden=false; document.dispatchEvent(new Event('visibilitychange')); assert.equal(frames.size,1);
reduced.matches=true; reduced.dispatchEvent(new Event('change')); assert.equal(frames.size,0); assert.equal(rotation.at(-1),0);
buttons[2].dispatchEvent(new Event('click')); assert.equal(progress.at(-1),2,'Reduced motion retains model selection');
reduced.matches=false; reduced.dispatchEvent(new Event('change')); assert.equal(frames.size,1);
cleanup(); assert.equal(frames.size,0); assert.ok(destroyed);
buttons[0].dispatchEvent(new Event('click')); assert.equal(progress.at(-1),2,'Unmount removes product input listeners');
sceneFactory = async()=>{throw new Error('No WebGL');};
const cleanupFallback = await mountProductHero({querySelector:()=>hero});
buttons[3].dispatchEvent(new Event('click')); assert.equal(fallback.src,products[3].image); assert.equal(frames.size,0);
cleanupFallback();
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(home.includes('home-hero.mp4') && home.includes('home-hero-poster.webp'));
assert.doesNotMatch(home, /id="product-canvas"|data-product-index=/);
const showcase = await readFile(new URL('../products-showcase.js', import.meta.url), 'utf8');
assert.ok(showcase.includes('${renderProductHero()}'));
assert.doesNotMatch(showcase, /products-hero-items|bindHeroInput/);
const media = new URL('../../assets/homepage/home-hero.mp4', import.meta.url);
const bytes = await readFile(media);
assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b8b356cafb948cbd1bfe7c5e9c6d3901c020ccf5bfc6d4c437120adbdc1bf7e3');
console.log('PASS: five direct/keyboard-native product selections and existing image fallbacks; compact non-sticky hero across 17 viewport geometries; slow selected-model rotation pauses offscreen/in background/reduced motion and cleans up; homepage video checksum unchanged. Node checks are not browser screenshots.');
