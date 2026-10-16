import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

class Element {
  constructor(tag, attrs = {}, action = false) { this.tagName = tag; this.attrs = attrs; this.action = action; this.children = []; this.nodeType = 1; this.textContent = ''; this.classList = { add: name => this.attrs.class = [...new Set(`${this.attrs.class || ''} ${name}`.trim().split(/\s+/))].join(' ') }; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = value; }
  matches(selector) {
    return selector.split(',').some(part => part.includes('>summary') ? this.tagName === 'SUMMARY' : part.includes('>a') || ['.more-link','.contact-row','.xu-detail-link','.xu-action-link','.xs-booklet-open','.cooperation-services-apply','.xj-all'].includes(part) ? this.action : (this.attrs.class || '').split(' ').includes(part.replace(/^\./,'')));
  }
  querySelector(selector) { return this.children.find(child => child.matches(selector.replace(':scope > ',''))); }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  append(child) { child.parent = this; this.children.push(child); return child; }
  replaceWith(next) { next.parent = this.parent; this.parent.children.splice(this.parent.children.indexOf(this), 1, next); }
}
const root = new Element('BODY');
const photo = root.append(new Element('IMG', { alt: '产品摄影', src: 'product.webp' }));
const createLink = (kind, parent = root) => {
  const link = parent.append(new Element('A', { href: './products.html#manufacturing' }, true));
  const original = link.append(new Element(kind, kind === 'IMG' ? { alt: '', src: 'arrow.svg' } : { 'aria-hidden': 'true' }));
  original.textContent = kind === 'SPAN' ? '↗' : '';
  return link;
};
const imageLink = createLink('IMG'), textLink = createLink('SPAN');
const store = root.append(new Element('DETAILS', { open: '', 'data-store-id': 'store-1' }));
const storeSummary = store.append(new Element('SUMMARY'));
const storeName = storeSummary.append(new Element('SPAN')); storeName.textContent = '门店名称';
storeSummary.append(new Element('IMG', { src: '../assets/xunai/stores/imgGroup20.svg', alt: '' }));
const service = root.append(new Element('DETAILS'));
const serviceSummary = service.append(new Element('SUMMARY')); serviceSummary.textContent = '服务流程';
const city = root.append(new Element('DETAILS'));
const citySummary = city.append(new Element('SUMMARY'));
const cityIcon = citySummary.append(new Element('SPAN', { class: 'xu-toggle-icon', 'aria-hidden': 'true' }));
let mutations, pagehide, disconnected = false, created = 0;
const source = await readFile(new URL('../site-link-arrows.js', import.meta.url), 'utf8');
const context = vm.createContext({
  document: { body: root, querySelectorAll: selector => root.querySelectorAll(selector), createElement: tag => new Element(tag.toUpperCase()), createElementNS: (_namespace, tag) => { created++; return new Element(tag.toUpperCase()); } },
  window: { addEventListener: (_type, callback) => pagehide = callback },
  MutationObserver: class { constructor(callback) { mutations = callback; } observe() {} disconnect() { disconnected = true; } },
});
vm.runInContext(source.replace(/^export /gm, '') + '\nglobalThis.normalize = normalizeLinkArrows;globalThis.normalizeDisclosures = normalizeDisclosureIcons;', context);
const geometry = (await readFile(new URL('../../assets/homepage/6d5b4.svg', import.meta.url), 'utf8')).match(/ d="([^"]+)"/)[1];
for (const link of [imageLink, textLink]) {
  assert.equal(link.children.length, 1);
  assert.equal(link.children[0].tagName, 'SVG');
  assert.ok(link.children[0].innerHTML.includes(`d="${geometry}"`));
  assert.ok(link.children[0].innerHTML.includes('stroke="currentColor"'));
  assert.equal(link.children[0].getAttribute('aria-hidden'), 'true');
  assert.equal(link.getAttribute('href'), './products.html#manufacturing');
}
context.normalize(root); assert.equal(created, 2, 'Repeated initialization is idempotent');
for (const summary of [storeSummary, serviceSummary, citySummary]) {
  assert(summary.matches('.site-disclosure-summary'));
  const icon = summary.querySelector(':scope > .site-disclosure-toggle');
  assert.equal(icon.tagName, 'SPAN');
  assert.equal(icon.getAttribute('aria-hidden'), 'true');
  assert.equal(summary.children.filter(child => child.matches('.site-disclosure-toggle')).length, 1);
}
assert.equal(storeSummary.children[0], storeName, 'Store labels stay in place');
assert.equal(store.getAttribute('open'), '', 'Native open state is preserved');
assert.equal(citySummary.children[0], cityIcon, 'Existing thin icons are reused');
context.normalizeDisclosures(root);
assert.equal(serviceSummary.children.length, 1, 'Repeated disclosure initialization is idempotent');
const container = root.append(new Element('DIV')), routeLink = createLink('SPAN', container);
mutations([{ addedNodes: [container] }]);
assert.equal(routeLink.children[0].tagName, 'SVG', 'New route content receives the same action arrow');
mutations([{ addedNodes: [routeLink.children[0]] }]);
assert.equal(created, 3, 'The observer skips its own inserted SVG');
const routeSummary = container.append(new Element('SUMMARY'));
mutations([{ addedNodes: [routeSummary] }]);
assert.equal(routeSummary.children[0].getAttribute('class'), 'xu-toggle-icon site-disclosure-toggle');
mutations([{ addedNodes: [routeSummary.children[0]] }]);
assert.equal(routeSummary.children.length, 1, 'The observer skips its own disclosure icon');
assert.equal(root.children[0], photo, 'Unrelated photography is untouched');
pagehide({ persisted: true }); assert.equal(disconnected, false);
pagehide({ persisted: false }); assert.equal(disconnected, true);
for (const selector of ['.more-link', '.contact-row', '.xu-detail-link', '.xu-action-link', '.xs-booklet-open', '.cooperation-services-apply', '.xj-all', '.xf-subheading>a', '.xs-products-more>a']) assert.ok(source.includes(selector));
const style = await readFile(new URL('../site-link-arrows.css', import.meta.url), 'utf8');
assert.match(style, /inline-size:\.84em/); assert.match(style, /:hover,:focus-visible/); assert.match(style, /prefers-reduced-motion/);
assert.match(style, /\.more-link,\.xu-detail-link\.site-link-arrow-host\{[^}]*align-items:flex-end[^}]*min-height:calc\(44 \* var\(--wide-u\)\)[^}]*padding:0 0 calc\(4 \* var\(--wide-u\)\)[^}]*font:400[^}]*\/1\.2 var\(--display\)/);
assert.match(style, /\.more-link>\.site-link-arrow,\.xu-detail-link\.site-link-arrow-host>\.site-link-arrow\{align-self:flex-end;margin-bottom:\.18em\}/);
const experience = await readFile(new URL('../site-experience.css', import.meta.url), 'utf8');
assert.match(experience, /summary>\.site-disclosure-toggle::before[^}]*height:1px/);
assert.match(experience, /details\[open\]>summary>\.site-disclosure-toggle::after\{opacity:0\}/);
assert.doesNotMatch(source, /site-drawer-close|data-xr-close|menu-toggle/);
console.log('PASS: shared homepage text-link typography/rule spacing, original arrow geometry, thin native disclosure states, preserved links/content, static/dynamic idempotence, self-observer filtering and BFCache lifecycle.');
