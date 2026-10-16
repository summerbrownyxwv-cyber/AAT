import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

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
assert.equal(panels.length, 5, 'Competence, locations, both store types and services remain sibling sections');
assert.equal(stores.length, 2);
assert.ok(stores.every(store=>panels.includes(store.parent)), 'Store articles cannot become nested sticky panels');
assert.equal((html.match(/id="types"/g)||[]).length, 1, 'The existing store comparison anchor remains');
assert.doesNotMatch(html, /<figcaption>标准店设计参考<\/figcaption>/);
const coverSelector='.xs-page > .xs-section:not(.xs-competence):not(#locations)';
assert.ok(source.includes(`main.querySelectorAll('${coverSelector}')`), 'Hero, competence and locations scroll naturally before later covers');
let coverTargets,coverStopped=false;
context.window.XunAiReview={mount(){}};
context.mountSectionCover=targets=>{coverTargets=targets;return()=>coverStopped=true;};
const laterPanels=panels.filter(panel=>!/xs-competence|id="locations"/.test(panel.attributes));
const stop=context.window.XunAiStores.mount({querySelectorAll:selector=>{assert.equal(selector,coverSelector);return laterPanels;},querySelector:()=>null});
assert.deepEqual(Array.from(coverTargets),laterPanels,'Only both store types and services enter the cover stack');
assert.equal(coverTargets.length,3);
stop();assert(coverStopped,'Later cover lifecycle is retained');
for (const route of ['/stores/black-gold/detail','/stores/standard/detail','/stores/services']) {
  assert.ok(context.window.XunAiStores.render(route).includes('xs-page'), route);
}
const css = await read('service-annotation.css');
assert.match(css, /\.xs-page>\.xs-section\{padding-block:clamp\(40px,4\.5vw,120px\)\}/);
assert.match(css, /\.xs-page>\.section-cover-panel\.is-cover-fit\{min-height:0\}/);
assert.match(css, /#main-content #types>\.xs-type\{padding-block:0;/);
assert.match(css, /\.xf-cta\{background:#fff;color:#000;min-height:0;padding-block:clamp\(40px,4\.5vw,120px\)\}/);
assert.match(css, /\.xf-cta p\{color:#000;text-shadow:none\}/);
const cta = (await read('service.html')).match(/<section class="xf-cta">[\s\S]*?<\/section>/)[0];
assert.doesNotMatch(cta, /<img\b/);
assert.ok(cta.includes('href="./service.html#/franchise"'));

console.log('PASS: hero, competence and locations use natural flow before sibling store/service covers; white CTA, preserved routes and later-cover cleanup. Shared multi-screen boundary/scroll tests are in check-section-cover.mjs; browser visual review remains pending.');
