import assert from 'node:assert/strict';
import { cooperationState } from '../products-cooperation.js';
import { initCompanyHonors } from '../company-honors.js';

for (const progress of [.8208, .9, 1]) {
  const state = cooperationState(progress);
  assert.equal(state.scale, 1);
  assert.deepEqual(state.petals, [1, 1, 1, 1, 1]);
}
assert.ok(cooperationState(.6).petals.some(value => value > 0 && value < 1));
assert.deepEqual(cooperationState(0).petals, [0, 0, 0, 0, 0]);

function element(id) {
  const listeners = new Map();
  return {
    id, dataset: {}, attributes: {}, classList: { add() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, callback) { listeners.set(type, callback); },
    removeEventListener(type) { listeners.delete(type); },
    emit(type, target = this) { listeners.get(type)?.({ currentTarget:this, target, preventDefault() {} }); },
  };
}
const groups = ['authority', 'certificates', 'responsibility'].map(name => element(`honor-${name}`));
const tabs = groups.map((_, index) => element(String(index)));
const track = element('track'), section = element('honors');
track.querySelectorAll = () => groups;
section.querySelector = () => track;
section.querySelectorAll = () => tabs;
section.getBoundingClientRect = () => ({ top:120 });
let alignments = 0;
section.scrollIntoView = () => alignments++;
globalThis.innerWidth = 1440;
globalThis.document = { querySelector:selector => selector === '.site-navigation' ? {getBoundingClientRect:() => ({height:72})} : section, documentElement:{}, fonts:{ ready:Promise.resolve() } };
globalThis.window = element('window');
globalThis.location = { hash:'' };
globalThis.history = { replaceState(_state, _title, hash) { location.hash = hash; } };
globalThis.getComputedStyle = () => ({ getPropertyValue:() => '72px' });
const refreshed = [];
const cleanup = initCompanyHonors(group => refreshed.push(group));
await document.fonts.ready;
assert.deepEqual(groups.map(group => group.hidden), [false, true, true]);
tabs[2].emit('click');
assert.deepEqual(groups.map(group => group.hidden), [true, true, false]);
assert.equal(tabs[2].attributes['aria-current'], 'true');
assert.equal(alignments, 0);
const other = { open:true }, detail = { open:true, closest:() => ({ querySelectorAll:() => [detail, other] }) };
track.emit('toggle', detail);
assert.equal(other.open, false);
assert.equal(refreshed.at(-1), detail);
location.hash = '#honor-certificates';
window.emit('hashchange');
assert.deepEqual(groups.map(group => group.inert), [true, false, true]);
cleanup();
tabs[0].emit('click');
assert.equal(section.dataset.honorActive, 1);
console.log('PASS: flower closes when scale settles; honor tabs, certificate disclosure, hash navigation and cleanup.');
