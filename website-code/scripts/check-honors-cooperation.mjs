import assert from 'node:assert/strict';
import { renderCooperation } from '../products-cooperation.js';
import { initCompanyHonors } from '../company-honors.js';

const cooperation = renderCooperation();
assert.doesNotMatch(cooperation, /cooperation-(?:scroll|stage|intro|flower)/, 'Removed manufacturing intro must not leave a visual stage or scroll runway');
assert.match(cooperation, /id="manufacturing"/);
assert.match(cooperation, /id="cooperation-oem"/);
assert.match(cooperation, /id="cooperation-odm"/);
assert.equal((cooperation.match(/class="cooperation-services-step"/g) || []).length,16, 'All manufacturing service steps remain');

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
console.log('PASS: removed manufacturing intro retains OEM/ODM and all16 steps; honor tabs, certificate disclosure, hash navigation and cleanup.');
