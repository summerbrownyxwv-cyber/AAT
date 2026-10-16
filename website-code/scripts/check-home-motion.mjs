import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { clamp, smoothstep } from '../motion.js';

const source = await readFile(new URL('../motion.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
assert.match(css, /\.ai-image\{[^}]*grid-row:3;[^}]*align-self:end;[^}]*margin-bottom:0/, 'The stationary home AI image ends on the data table baseline');
assert.match(css, /\.ai-stats\{[^}]*grid-row:3;align-self:end/, 'Image and table share the same bottom-aligned grid row');
const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.doesNotMatch(css, /\.base-link:first-child \.base-number/, 'Filled number styling must follow the selected base, not its DOM order');
assert.match(css, /\.base-link\.is-active \.base-number\{color:#fff\}/);
assert.doesNotMatch(markup, /series-playback|暂停轮播|继续轮播/, 'The carousel must not expose playback controls');
assert.doesNotMatch(source, /seriesPaused|seriesHovered|seriesFocused/, 'Hover, focus, and manual selection must not stop automatic playback');
assert.doesNotMatch(markup + source + css, /series-dots|data-series-dot|seriesDots/, 'Removed series dots must not retain markup, listeners, or a layout slot');
assert.doesNotMatch(css.match(/\.collection-heading\{[^}]*\}/)?.[0] || '', /min-height|height:/, 'The collection heading must not reserve the removed dot row');
assert.match(markup, /data-plant-step="2"[^>]*>[\s\S]*?生产基地/, 'The production directory item must select the actual production state');
assert.match(markup, /data-step="2"><h3>产业园区<\/h3>[\s\S]*?<li>多个功能区域<\/li><li>自动化、智能化、数字化转型<\/li><li>精进生产研发<\/li>/, 'The production intro keeps the supplied heading and copy');
assert.match(markup, /plant-photo-production[^>]*data-step="2"><img src="\.\.\/assets\/company\/company-hero-poster\.webp"/, 'The production state reuses the existing factory aerial asset');
for (const target of ['company-copy', 'growth-figure', 'service-image', 'ai-image']) {
  const element = markup.match(new RegExp(`<[^>]+class="${target}"[^>]*>`))?.[0];
  assert.ok(element, `${target} must retain its existing layout element`);
  assert.doesNotMatch(element, /data-scroll-hold|data-hold-stop/, `${target} must scroll naturally with the document`);
}
const mediaTargets = source.match(/const mediaTargets = \[([\s\S]*?)\]\.filter\(Boolean\)/)?.[1];
assert.ok(mediaTargets);
assert.doesNotMatch(mediaTargets, /growth|service|ai/, 'The specified static images must not receive reveal or parallax motion');
assert.match(mediaTargets, /company[\s\S]*photos[\s\S]*seriesPhoto/, 'Unrelated company, planting, and series image motion must remain');
const update = source.match(/^  function update\(\) \{[\s\S]*?^  \}/m)?.[0];
assert.ok(update);
for (const [width, height] of [[390, 844], [768, 1024], [1189, 1263], [1440, 900], [2560, 1440], [3840, 2160]]) {
  const revealed = new Set();
  const target = name => ({ getBoundingClientRect: () => ({ top: height * .5, bottom: height * .6 }), classList: { add: () => revealed.add(name) }, querySelectorAll: () => [] });
  new Function('window', 'copy', 'row', `
    let frame;
    const planting = {}, growth = {}, collections = {};
    const style = { getPropertyValue: () => '' };
    const service = { style }, ai = { style };
    const serviceImage = { hasAttribute: () => false }, aiImage = serviceImage;
    const visible = new Set([service, ai]);
    const motionPreference = { matches: false };
    const photos = [], plantDetails = [], holds = [];
    const serviceCopyTargets = [copy], aiRows = [row], visibleCounters = new Set();
    const updateSectionReveal = () => {}, updateImageStory = () => {};
    ${update}
    update();
  `)({ innerWidth: width, innerHeight: height }, target('copy'), target('row'));
  assert.deepEqual([...revealed], ['copy', 'row'], `Service copy and AI rows must remain visible without a moving image at ${width}x${height}`);
}
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

const plantFunctions = ['select', 'showPlant', 'plantProgress', 'updatePlantMotion'].map(name => {
  const match = source.match(new RegExp(`^  function ${name}\\([^\\n]*\\) \\{[\\s\\S]*?^  \\}`, 'm'));
  assert.ok(match, `${name} must exist`);
  return match[0];
}).join('\n');
const makeElement = step => ({
  dataset: { step: String(step), plantStep: String(step) },
  style: { opacity: '', values: new Map(), setProperty(name, value) { this.values.set(name, value); }, removeProperty(name) { this.values.delete(name); } },
  classes: new Set(), attributes: {},
  classList: { toggle(name, enabled) { enabled ? this.owner.classes.add(name) : this.owner.classes.delete(name); }, contains(name) { return this.owner.classes.has(name); } },
  setAttribute(name, value) { this.attributes[name] = value; },
});
for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [997, 917], [1440, 900], [1920, 1080], [2560, 1440], [3840, 2160]]) {
  for (const reduced of [false, true]) {
    const fixture = { innerWidth: width, innerHeight: height, scrollY: 0 };
    const photos = [0, 1, 2].map(makeElement), details = [0, 1, 2].map(makeElement), buttons = [0, 2].map(makeElement);
    [...photos, ...details, ...buttons].forEach(element => { element.classList.owner = element; });
    buttons.forEach(button => { button.icon = { getAttribute() { return this.src; } }; button.querySelector = () => button.icon; });
    const cta = {}, planting = makeElement(0);
    const layout = { offsetHeight: 400, getBoundingClientRect: () => ({ top: 1000 - fixture.scrollY }) };
    const flow = new Function('window', 'clamp', 'smoothstep', 'photos', 'plantDetails', 'plantButtons', 'plantCta', 'planting', 'plantLayout', 'motionPreference', `
      let plantStep = 0, selectedPlant = null;
      ${plantFunctions}
      showPlant(0);
      return { update: () => updatePlantMotion(window.innerHeight), select: index => { selectedPlant = index; updatePlantMotion(window.innerHeight); }, release: () => { selectedPlant = null; }, step: () => plantStep };
    `)(fixture, clamp, smoothstep, photos, details, buttons, cta, planting, layout, { matches: reduced });
    for (const [progress, expected] of [[0, 0], [.5, 1], [1, 2], [.5, 1], [0, 0]]) {
      fixture.scrollY = 1000 - height * .56 + 220 * progress;
      flow.update();
      assert.equal(flow.step(), expected, `Scroll must reach and reverse all three states at ${width}x${height}, reduced=${reduced}`);
      assert.equal(cta.href, expected === 2 ? './planting.html#factory' : './planting.html');
      assert.equal(buttons[expected < 2 ? 0 : 1].attributes['aria-pressed'], 'true');
      for (const [index,button] of buttons.entries()) assert.equal(button.icon.src, (expected < 2) === (index === 0) ? '../assets/homepage/7e7ee.svg' : '../assets/homepage/ee015.svg', 'The filled base emblem follows visible planting/production content in both scroll directions');
      assert.equal(details.filter(detail => detail.attributes['aria-hidden'] === 'false').length, 1);
      if (width > 640 && !reduced) assert.equal(photos[expected].style.opacity, '1.000');
    }
    if (width > 640 && !reduced) {
      for (let sample = 0; sample <= 100; sample++) {
        fixture.scrollY = 1000 - height * .56 + 220 * sample / 100;
        flow.update();
        const total = photos.reduce((sum, photo) => sum + Number(photo.style.opacity), 0);
        assert.ok(Math.abs(total - 1) < .002, 'Adjacent planting/production crossfades must not introduce an empty gallery');
      }
    }
    flow.select(2);
    assert.equal(flow.step(), 2, 'Production menu selection works independently of scroll position');
    assert.equal(cta.href, './planting.html#factory');
    flow.release();
    fixture.scrollY = 1000 - height * .56;
    flow.update();
    assert.equal(flow.step(), 0, 'Native scroll takes over again after manual selection');
  }
}
console.log('PASS: static home content, removed dots and reserved row, autoplay unchanged, and three planting/production states with reversible scroll, menu/CTA mapping, mobile and reduced motion across eight sizes (Node fixtures, not browser screenshots).');
