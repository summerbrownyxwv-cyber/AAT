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
assert.doesNotMatch(source, /scrollTo|scrollY|(?:window|document)\.addEventListener\('(?:scroll|wheel)'/, 'Hero must not move page scroll or capture wheel outside its model stage');
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
const frames = new Map(); let nextFrame = 0;
globalThis.requestAnimationFrame = callback => {frames.set(++nextFrame, callback); return nextFrame;};
globalThis.cancelAnimationFrame = id => frames.delete(id);
const reduced = new EventTarget(); reduced.matches = false;
globalThis.matchMedia = () => reduced;
const buttons = products.map(product => Object.assign(new EventTarget(), {
  dataset: {series:product.series}, classList:{toggle(){}}, attrs:{},
  setAttribute(name,value) {this.attrs[name]=value;}
}));
const fallback = {}, series = {}, stage = Object.assign(new EventTarget(),{clientWidth:592,clientHeight:600,style:{setProperty(){}}}), canvas = {setAttribute(){}};
const elements = {'.product-stage':stage, '#product-series':series, '.product-fallback':fallback, '#product-canvas':canvas};
const hero = Object.assign(new EventTarget(),{querySelector:selector=>elements[selector], querySelectorAll:()=>buttons});
const progress = []; let destroyed = false;
const scene = {setProgress:value=>progress.push(value), destroy:()=>{destroyed=true;}};
sceneFactory = async () => scene;
const cleanup = await mountProductHero({querySelector:()=>hero});
assert.equal(frames.size, 0, 'Mount remains idle until explicit model input');
for (let index = 0; index < 5; index++) {
  buttons[index].dispatchEvent(new Event('click'));
  assert.equal(progress.at(-1), index); assert.equal(fallback.src,products[index].image);
  assert.equal(buttons[index].attrs['aria-pressed'],'true');
  assert.equal(buttons.filter(button=>button.attrs['aria-pressed']==='true').length,1);
}
const wheel = (deltaY, options={}, target=stage) => {
  const event=Object.assign(new Event('wheel',{cancelable:true}),{deltaX:0,deltaY,deltaMode:0,ctrlKey:false,...options});
  target.dispatchEvent(event); return event;
};
buttons[0].dispatchEvent(new Event('click'));
assert.equal(wheel(1).defaultPrevented,true,'A one-pixel wheel inside the model stage must rotate immediately');
assert.equal(progress.at(-1),1/240);
wheel(119); assert.equal(progress.at(-1),.5,'Pixel wheel drives the model fraction continuously');
wheel(-120); assert.equal(progress.at(-1),0,'Reverse input immediately returns to the first product');
assert.equal(wheel(-1).defaultPrevented,false,'Backward wheel at the first boundary scrolls the page');
assert.equal(wheel(240,{},hero).defaultPrevented,false); assert.equal(progress.at(-1),0,'Wheel outside the model stage remains native page scrolling');
wheel(1,{deltaMode:1}); assert.equal(progress.at(-1),16/240,'Line input converts to CSS pixels');
buttons[0].dispatchEvent(new Event('click')); wheel(1,{deltaMode:2}); assert.equal(progress.at(-1),600/240,'Page input uses the model stage height');
buttons[0].dispatchEvent(new Event('click')); wheel(0,{deltaX:1,deltaMode:2}); assert.equal(progress.at(-1),592/240,'Horizontal page input uses the model stage width');
buttons[0].dispatchEvent(new Event('click')); wheel(0,{deltaX:240}); assert.equal(progress.at(-1),1,'Horizontal wheel selects the next product');
assert.equal(buttons[1].attrs['aria-pressed'],'true');
wheel(-12,{deltaX:24}); assert.equal(progress.at(-1),1.1,'The dominant wheel axis decides direction');
const beforeZoom=progress.at(-1); assert.equal(wheel(100,{ctrlKey:true}).defaultPrevented,false); assert.equal(progress.at(-1),beforeZoom,'Pinch/browser zoom is not intercepted');
wheel(10000); assert.equal(progress.at(-1),4.98,'The final model clamps to its finite end');
assert.equal(wheel(1).defaultPrevented,false,'Forward wheel at the last boundary scrolls the page');
wheel(-240); assert.ok(Math.abs(progress.at(-1)-3.98)<1e-12,'Reverse input immediately leaves the end without cooldown');
assert.equal(buttons[3].attrs['aria-pressed'],'true');
assert.equal(wheel(0).defaultPrevented,false,'Zero input never consumes page scroll');
reduced.matches=true; reduced.dispatchEvent(new Event('change')); assert.equal(frames.size,0);
buttons[2].dispatchEvent(new Event('click')); assert.equal(progress.at(-1),2,'Reduced motion retains direct model selection');
wheel(240); assert.equal(progress.at(-1),3,'Reduced motion retains wheel product selection');
assert.match(sceneSource,/const turn = motionPreference\.matches \? 0 : fraction \* Math\.PI \* 2/,'Reduced motion keeps selected models static');
assert.equal(frames.size,0,'Model wheel input schedules no persistent hero animation');
cleanup(); assert.equal(frames.size,0); assert.ok(destroyed);
const stopped=progress.at(-1); buttons[0].dispatchEvent(new Event('click')); assert.equal(progress.at(-1),stopped,'Unmount removes product input listeners');
assert.equal(wheel(240).defaultPrevented,false); assert.equal(progress.at(-1),stopped,'Unmount removes wheel input');
sceneFactory = async()=>{throw new Error('No WebGL');};
const cleanupFallback = await mountProductHero({querySelector:()=>hero});
buttons[3].dispatchEvent(new Event('click')); assert.equal(fallback.src,products[3].image); assert.equal(frames.size,0);
wheel(240); assert.equal(fallback.src,products[4].image,'No-WebGL fallback also follows local wheel selection');
cleanupFallback();
assert.doesNotMatch(source,/requestAnimationFrame|setRotation|IntersectionObserver|visibilitychange/,'Hero rotation must depend only on explicit model-stage input');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(home.includes('home-hero.mp4') && home.includes('home-hero-poster.webp'));
assert.doesNotMatch(home, /id="product-canvas"|data-product-index=/);
const showcase = await readFile(new URL('../products-showcase.js', import.meta.url), 'utf8');
assert.ok(showcase.includes('${renderProductHero()}'));
assert.doesNotMatch(showcase, /products-hero-items|bindHeroInput/);
const media = new URL('../../assets/homepage/home-hero.mp4', import.meta.url);
const bytes = await readFile(media);
assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b8b356cafb948cbd1bfe7c5e9c6d3901c020ccf5bfc6d4c437120adbdc1bf7e3');
console.log('PASS: five direct/keyboard-native selections and local continuous wheel rotation, pixel/line/page and either axis, finite page-scroll release and zoom preservation, reduced/static fallback and cleanup; compact non-sticky hero across 17 viewport geometries; homepage video checksum unchanged. Node checks are not browser screenshots.');
