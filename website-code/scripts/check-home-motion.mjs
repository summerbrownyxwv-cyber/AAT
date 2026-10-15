import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../motion.js', import.meta.url), 'utf8');
const functions = ['selectSeries', 'startSeriesLoop', 'showSeries'].map(name => {
  const match = source.match(new RegExp(`^  function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?^  \\}`, 'm'));
  assert.ok(match, `${name} must exist`);
  return match[0];
}).join('\n');
const photo = { style: { setProperty() {} }, parentElement: { classList: { add() {}, remove() {} } } };
const state = {
  motion: { matches: false }, document: { hidden: false }, visible: new Set([photo]), photo,
  playback: { setAttribute() {} }, backdrop: {}, label: {}, selected: -1,
  buttons: ['燃', '温', '植', '萃'].map((label, index) => ({ dataset: { seriesIndex: String(index), label: `${label}-系列`, image: `${index}.webp` } })),
};
let timer;
const clock = { setInterval(callback, delay) { timer = { callback, delay }; return 1; }, setTimeout(callback) { callback(); return 1; } };
const make = new Function('state', 'window', 'Image', 'clearInterval', 'clearTimeout', `
  let seriesTimer = 0, currentSeries = 0, seriesPaused = false, seriesHovered = false, seriesFocused = false;
  let imageRequest = 0, imageTimer = 0, disposed = false;
  const { motion: motionPreference, document, visible, photo: seriesPhoto, playback: seriesPlayback, buttons: seriesButtons, backdrop: seriesBackdrop, label: seriesLabel } = state;
  const seriesDots = [];
  const select = (buttons, index) => { state.selected = index; };
  ${functions}
  return { start: startSeriesLoop, select: showSeries, index: () => currentSeries,
    flags(paused, hovered = false, focused = false) { seriesPaused = paused; seriesHovered = hovered; seriesFocused = focused; startSeriesLoop(); } };
`);
const carousel = make(state, clock, class { set src(value) { this.onload(); } }, () => { timer = undefined; }, () => {});
carousel.start();
assert.equal(timer.delay, 4200);
timer.callback();
assert.equal(carousel.index(), 1, 'Autoplay advances without triggering manual pause');
assert.equal(state.playback.textContent, '暂停轮播');
carousel.select(3, true);
assert.equal(timer, undefined, 'Manual selection stops autoplay');
assert.equal(state.playback.textContent, '继续轮播');
for (const flags of [[false, true], [false, false, true], [true]]) {
  carousel.flags(...flags);
  assert.equal(timer, undefined, 'Hover, focus, and user pause each stop autoplay');
}
carousel.flags(false);
assert.equal(timer.delay, 4200, 'Explicit resume permits autoplay again');
timer.callback();
assert.equal(carousel.index(), 0, 'Autoplay wraps to the first series');
state.visible.clear();
timer.callback();
assert.equal(carousel.index(), 0, 'Offscreen series do not change');
state.motion.matches = true;
carousel.start();
assert.equal(timer, undefined);
assert.equal(state.playback.hidden, true, 'Reduced motion disables automatic playback');
state.motion.matches = false;
state.document.hidden = true;
carousel.start();
assert.equal(timer, undefined, 'A background page stops autoplay');
console.log('PASS: series autoplay, wrap, manual pause, hover, focus, resume, visibility, and reduced motion.');
