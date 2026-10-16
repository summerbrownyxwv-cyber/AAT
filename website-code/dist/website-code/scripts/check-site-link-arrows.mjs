import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

class Element {
  constructor(tag, attrs = {}, action = false) { this.tagName = tag; this.attrs = attrs; this.action = action; this.children = []; this.nodeType = 1; this.textContent = ''; this.classList = { add: name => this.attrs.class = `${this.attrs.class || ''} ${name}`.trim() }; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = value; }
  matches(selector) { return selector === '.site-link-arrow' ? this.attrs.class === 'site-link-arrow' : this.action; }
  querySelector() { return this.children.find(child => child.matches('.site-link-arrow')); }
  querySelectorAll() { return this.children.flatMap(child => [...(child.action ? [child] : []), ...child.querySelectorAll()]); }
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
let mutations, pagehide, disconnected = false, created = 0;
const source = await readFile(new URL('../site-link-arrows.js', import.meta.url), 'utf8');
const context = vm.createContext({
  document: { body: root, querySelectorAll: () => root.querySelectorAll(), createElementNS: (_namespace, tag) => { created++; return new Element(tag.toUpperCase()); } },
  window: { addEventListener: (_type, callback) => pagehide = callback },
  MutationObserver: class { constructor(callback) { mutations = callback; } observe() {} disconnect() { disconnected = true; } },
});
vm.runInContext(source.replace(/^export /gm, '') + '\nglobalThis.normalize = normalizeLinkArrows;', context);
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
const container = root.append(new Element('DIV')), routeLink = createLink('SPAN', container);
mutations([{ addedNodes: [container] }]);
assert.equal(routeLink.children[0].tagName, 'SVG', 'New route content receives the same action arrow');
mutations([{ addedNodes: [routeLink.children[0]] }]);
assert.equal(created, 3, 'The observer skips its own inserted SVG');
assert.equal(root.children[0], photo, 'Unrelated photography is untouched');
pagehide({ persisted: true }); assert.equal(disconnected, false);
pagehide({ persisted: false }); assert.equal(disconnected, true);
for (const selector of ['.more-link', '.contact-row', '.xu-detail-link', '.xu-action-link', '.xs-booklet-open', '.cooperation-services-apply', '.xj-all', '.xf-subheading>a', '.xs-products-more>a']) assert.ok(source.includes(selector));
const style = await readFile(new URL('../site-link-arrows.css', import.meta.url), 'utf8');
assert.match(style, /inline-size:\.84em/); assert.match(style, /:hover,:focus-visible/); assert.match(style, /prefers-reduced-motion/);
console.log('PASS: shared original arrow geometry, currentColor, link preservation, static/dynamic idempotence, self-observer filtering and BFCache lifecycle.');
