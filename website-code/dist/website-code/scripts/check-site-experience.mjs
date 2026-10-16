import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { productGroups } from '../../content/products-data.js';
import { canonicalMediaMarkup } from '../asset-urls.js';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const pages = ['index', 'company', 'planting', 'products', 'service', 'ai', 'contact'];
const sources = Object.fromEntries(await Promise.all(pages.map(async page => [page, await read(page + '.html')])));
const channels = ['tel:4009315728', 'tel:13476850503', 'tel:075522664794', 'mailto:Ijh1@aiaitie.com'];
const context = vm.createContext({
  window: { XunAiOrbit: [], XunAiDesign: { responsiveMarkup: value => value } },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
});
for (const file of ['about-page.js', 'franchise-page.js', 'stores-page.js', 'ai-page.js']) vm.runInContext((await read('xunai/' + file)).replace(/^import[^\n]+\n/gm, ''), context, { filename: file });

const contact = context.window.XunAiAbout.render('/about/culture');
assert.ok(contact.includes('xo-hero-photo') && contact.includes('imgRectangle53.webp'), 'Original culture image remains');
assert.ok(contact.indexOf('xo-hero') < contact.indexOf('id="news"') && contact.indexOf('id="news"') < contact.indexOf('id="join"'));
assert.equal((contact.match(/class="xo-join-card route-link"/g) || []).length, 3);
for (const entry of ['#/franchise', '#/production/apply', '#/about/business']) assert.ok(contact.includes(`href="${entry}"`), entry);
assert.doesNotMatch(contact, /xo-contact-grid|xo-contact-card|xo-join-contact|xo-company-line|待补充|占位/);
const news = context.window.XunAiAbout.render('/about/news');
assert.equal((news.match(/class="xo-story"/g) || []).length, 4, 'Only four original brand stories are shown');
assert.doesNotMatch(news, /待补充|占位/);
for (const route of ['careers', 'business', 'overseas']) {
  const html = context.window.XunAiAbout.render('/about/' + route);
  assert.ok(html.includes('尚未发送') && html.includes('不会上传或保存'), route);
  assert.ok(html.includes('data-copy-ready') && html.includes('mailto:'), route);
  assert.doesNotMatch(html, /提交成功|提交完成|模拟提交|ljh1@/);
}

const formSource = await read('xunai/franchise-form.js');
vm.runInContext(formSource.replace('export function mountFranchiseForm', 'function mountFranchiseForm'), context);
for (const production of [false, true]) {
  vm.runInContext(`productionForm = ${production}`, context);
  const summary = vm.runInContext('formTemplate(3)', context);
  assert.ok(summary.includes('尚未发送') && summary.includes('不会发送或保存'));
  assert.ok(summary.includes(production ? 'tel:13476850503' : 'tel:4009315728'));
  assert.ok(summary.includes('mailto:aat@dongyuanjt.com') && summary.includes('data-form-copy'));
  assert.doesNotMatch(summary, /提交成功|提交完成|模拟提交/);
}
assert.doesNotMatch(formSource, /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/, 'Enquiries have no network or persistent storage receiver');
vm.runInContext('productionForm = false', context);
const storeOptions = vm.runInContext('formTemplate(2)', context);
assert.ok(storeOptions.includes('<option>标准店</option>') && storeOptions.includes('<option>黑金店</option>'));
assert.doesNotMatch(storeOptions, /轻享店/);

const franchise = context.window.XunAiFranchise.render();
assert.ok(franchise.includes('standard-imgRectangle1.webp') && franchise.includes('black-gold-imgRectangle1.webp'));
assert.ok(franchise.includes('href="#/franchise/apply"'));
assert.doesNotMatch(franchise, /store-light|轻享店|最低6万|80–120|30–60/);
for (const route of ['/stores/standard', '/stores/black-gold', '/stores/standard/detail', '/stores/black-gold/detail']) assert.doesNotMatch(context.window.XunAiStores.render(route), /待补充|占位/, route);
for (const html of [contact, news, franchise]) {
  for (const [, ref] of canonicalMediaMarkup(html).matchAll(/(?:src|poster)="(\.\.\/assets\/[^"?]+)"/g)) assert.ok((await stat(new URL('../' + ref, import.meta.url))).size > 0, ref);
}

const products = productGroups.flatMap(group => group.products);
assert.equal(products.length, 19);
assert.equal(new Set(products.map(product => product.id)).size, 19);
assert.equal(new Set(products.map(product => product.description)).size, 19, 'Each product has its own description');
for (const product of products) {
  assert.ok(product.description.trim().length >= 24, product.id);
  assert.doesNotMatch(product.description, /待补充|占位/, product.id);
}
assert.ok((await read('products-page.js')).includes('${product.description}'), 'Catalog renders each selected product description');
const ai = context.window.XunAiAI.render();
assert.doesNotMatch(ai + sources.index, /92\s*[%％]/, 'Unverified accuracy percentage remains hidden');
assert.ok(ai.includes('报告界面示例'));
assert.doesNotMatch(ai, /了解产品<\/a>|数据摘自现有品牌介绍资料/);

let sharedFooter;
for (const [page, html] of Object.entries(sources)) {
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer, page + ' footer');
  const normalized = footer.replace('href="#hero-story"', 'href="./index.html#hero-story"').replace(/\s+/g, ' ').trim();
  if (!sharedFooter) sharedFooter = normalized;
  assert.equal(normalized, sharedFooter, page + ' uses the current shared footer');
  for (const channel of channels) assert.ok(footer.includes(`href="${channel}"`), page + ' ' + channel);
  for (const entry of ['./company.html', './planting.html', './products.html', './service.html', './ai.html', './contact.html', './contact.html#/about/news', './service.html#/franchise']) assert.ok(footer.includes(`href="${entry}"`), page + ' ' + entry);
  assert.doesNotMatch(footer, /置顶公告|隐私政策|用户协议|正品查询|举报通道|中文 \/ EN/, page + ' has no unconfigured footer items');
  assert.ok(html.includes('./site-experience.css') && html.includes('./site-experience.js'), page + ' loads shared site experience');
  for (const [, href] of footer.matchAll(/href="(\.[^"]+)"/g)) {
    const url = new URL(href, new URL('../' + page + '.html', import.meta.url));
    url.hash = ''; url.search = '';
    assert.ok((await stat(fileURLToPath(url))).size > 0, page + ' ' + href);
  }
}
const redirect = await read('franchise-redirect.js');
assert.ok(redirect.includes('./service.html#/franchise') && redirect.includes('./contact.html#/franchise/apply'));
assert.ok((await read('products-cooperation-services.js')).includes('./contact.html#/production/apply'));

const videos = [{}];
let addedVideos;
vm.runInNewContext((await read('site-experience.js')).replace(/^import[^\n]+\n/gm, ''), {
  document: { querySelectorAll: () => videos, querySelector: () => ({}) },
  window: { addEventListener() {} },
  MutationObserver: class { constructor(callback) { addedVideos = callback; } observe() {} },
});
videos.push({});
addedVideos([{ addedNodes: [{ nodeType: 1, matches: () => true }] }]);
for (const video of videos) {
  for (const property of ['muted', 'defaultMuted', 'autoplay', 'loop', 'playsInline', 'disablePictureInPicture']) assert.equal(video[property], true, property);
  assert.equal(video.controls, false);
}
assert.doesNotMatch(await read('site-experience.js'), /film-toggle|createElement/);
for (const html of [...Object.values(sources), ai, await read('products-showcase.js'), await read('planting-page.js'), await read('xunai/stores-page.js')]) {
  for (const [tag] of html.matchAll(/<video\b[^>]*>/g)) {
    for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline']) assert.match(tag, new RegExp(`\\b${attribute}\\b`));
    assert.doesNotMatch(tag, /\bcontrols(?:\s|=|>)/);
  }
}
console.log('PASS: simplified contact layout, honest enquiries, real stories, official channels, product descriptions, shared footers, and static/dynamic silent looping videos without playback controls.');
