import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../motion.js', import.meta.url), 'utf8');
const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.doesNotMatch(markup, /series-playback|暂停轮播|继续轮播/, 'The carousel must not expose playback controls');
assert.doesNotMatch(source, /seriesPaused|seriesHovered|seriesFocused/, 'Hover, focus, and manual selection must not stop automatic playback');
const functions = ['selectSeries', 'startSeriesLoop', 'showSeries'].map(name => {
  const match = source.match(new RegExp(`^  function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?^  \\}`, 'm'));
  assert.ok(match, `${name} must exist`);
  return match[0];
}).join('\n');
const photo = { style: { setProperty() {} }, parentElement: { classList: { add() {}, remove() {} } } };
const state = {
  motion: { matches: false }, document: { hidden: false }, visible: new Set([photo]), photo,
  backdrop: {}, label: {}, selected: -1,
  buttons: ['燃', '温', '植', '萃'].map((label, index) => ({ dataset: { seriesIndex: String(index), label: `${label}-系列`, image: `${index}.webp` } })),
};
let timer;
let starts = 0;
const clock = { setInterval(callback, delay) { timer = { callback, delay }; return ++starts; }, setTimeout(callback) { callback(); return 1; } };
const make = new Function('state', 'window', 'Image', 'clearInterval', 'clearTimeout', `
  let seriesTimer = 0, currentSeries = 0;
  let imageRequest = 0, imageTimer = 0, disposed = false;
  const { motion: motionPreference, document, visible, photo: seriesPhoto, buttons: seriesButtons, backdrop: seriesBackdrop, label: seriesLabel } = state;
  const seriesDots = [];
  const select = (buttons, index) => { state.selected = index; };
  ${functions}
  return { start: startSeriesLoop, select: showSeries, index: () => currentSeries };
`);
const carousel = make(state, clock, class { set src(value) { this.onload(); } }, () => { timer = undefined; }, () => {});
carousel.start();
assert.equal(timer.delay, 4200);
timer.callback();
assert.equal(carousel.index(), 1, 'Autoplay advances without triggering manual pause');
carousel.select(3, true);
assert.equal(starts, 2, 'Manual selection restarts the interval rather than permanently stopping it');
assert.equal(timer.delay, 4200, 'The selected series remains visible for a full interval');
timer.callback();
assert.equal(carousel.index(), 0, 'Autoplay wraps to the first series');
for (const index of [2, 0, 3]) carousel.select(index, true);
assert.equal(starts, 5, 'Rapid manual selections each reset the automatic playback interval');
assert.equal(carousel.index(), 3);
timer.callback();
assert.equal(carousel.index(), 0, 'Autoplay continues after repeated manual selection');
state.visible.clear();
timer.callback();
assert.equal(carousel.index(), 0, 'Offscreen series do not change');
state.motion.matches = true;
carousel.start();
assert.equal(timer, undefined);
state.motion.matches = false;
state.document.hidden = true;
carousel.start();
assert.equal(timer, undefined, 'A background page stops autoplay');
state.document.hidden = false;
carousel.start();
assert.equal(timer.delay, 4200, 'Returning to the foreground resumes autoplay');
state.buttons.length = 1;
carousel.start();
assert.equal(timer, undefined, 'A single series does not need an interval');
console.log('PASS: no pause UI, series autoplay, wrap, repeated manual reset, visibility, and reduced motion.');
