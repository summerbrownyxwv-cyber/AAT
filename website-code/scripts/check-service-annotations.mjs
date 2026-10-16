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

vm.runInContext(await read('xunai/franchise-page.js'), context);
const franchise = context.window.XunAiFranchise.render();
assert.equal((franchise.match(/\bxj-dark\b/g)||[]).length, 4, 'Store models, output sheet/output content and process are the dark surface targets');
assert.ok(franchise.includes('src="../assets/xunai/franchise/imgRectangle1.webp"'), 'The franchise hero retains its original photograph');
assert.equal((franchise.match(/href="#\/franchise\/apply"/g)||[]).length, 2, 'Both existing intent links remain');
assert.equal((franchise.match(/data-process-step=/g)||[]).length, 6, 'All six franchise process steps remain');
const franchiseStart = css.indexOf('/* Franchise annotations');
assert.ok(franchiseStart >= 0, 'Franchise annotations have a local page theme');
const franchiseCss = css.slice(franchiseStart, css.indexOf('/* Each store', franchiseStart));
assert.match(franchiseCss, /\.xj-page:not\(\.xj-application\)\{--xj-muted:var\(--muted\);--xj-line:var\(--line\)\}/);
assert.match(franchiseCss, /\.xj-dark\{background:var\(--cream\);color:var\(--ink\)\}/);
assert.match(franchiseCss, /\.xj-hero::after\{display:none;background:none\}/, 'The hero color mask is removed');
assert.match(franchiseCss, /\.pill-button:not\(:disabled\):not\(\[aria-disabled="true"\]\):is\(:hover,:focus-visible,:active\)\{background:var\(--cream\);color:var\(--ink\);border-color:var\(--line-strong\)\}/);
assert.match(franchiseCss, /\.xj-contact-cta \.pill-button\{background:transparent;color:#000;border-color:var\(--line\)\}/);
assert.match(franchiseCss, /\.xj-process li button\{color:var\(--muted\)\}/);
assert.match(franchiseCss, /\.xj-process li button:is\(:hover,:focus-visible\)\{color:var\(--ink\)\}/, 'Active and focused steps stay readable on cream');
assert.match(franchiseCss, /\.xj-dark :is\(a,summary\):focus-visible\{outline-color:var\(--ink\)\}/);
assert.doesNotMatch(franchiseCss, /\b(?:width|height|padding|margin|font|object-fit|filter)\s*:/, 'Franchise color annotations do not change layout or photography');

console.log('PASS: natural service opening, sibling store/service covers, white CTA; franchise cream surfaces, unmasked original hero, readable process states and transparent intent CTA with original routes/content. Shared multi-screen boundary/scroll tests are in check-section-cover.mjs; browser visual review remains pending.');
