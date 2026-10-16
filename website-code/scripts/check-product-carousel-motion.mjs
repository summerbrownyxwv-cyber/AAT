import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

let now = 0, nextFrame = 0, nextTimer = 0;
const frames = new Map(), timers = new Map();
const context = vm.createContext({
  AbortController, Date, Math,
  performance: { now: () => now },
  requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
  cancelAnimationFrame: frame => frames.delete(frame),
  setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; },
  clearTimeout: timer => timers.delete(timer),
});
const source = readFileSync(new URL('../products-showcase.js', import.meta.url), 'utf8');
vm.runInContext(source.replace(/^import[^\n]+\n/gm, '').replace(/^export /gm, '') + '\nglobalThis.carousel = { createCarouselMotion, bindCarouselInput, slotFor };', context);
const { createCarouselMotion, bindCarouselInput, slotFor } = context.carousel;
const advance = (count = 1) => { for (let index = 0; index < count; index++) { now += 16; for (const [frame, callback] of [...frames]) { frames.delete(frame); callback(now); } } };
const positions = [], motion = createCarouselMotion(position => positions.push(position));
motion.begin(); now += 160; motion.drag(.42); const released = motion.position; motion.end();
assert.equal(motion.position, released, 'Release keeps the exact dragged position');
advance(); assert(Math.abs(motion.position - released) < .04, 'First settling frame does not reset to zero');
advance(120); assert.equal(motion.position, 1);
motion.step(1); advance(8); const interrupted = motion.begin();
assert(interrupted > 1 && interrupted < 2); now += 50; motion.drag(interrupted - .2);
assert.equal(motion.position, interrupted - .2, 'A new drag starts from the currently displayed position');
motion.end(); advance(120);
const rapid = createCarouselMotion(() => {}); rapid.step(1); rapid.step(1); rapid.step(1); advance(120); assert.equal(rapid.position, 3, 'Rapid inputs retarget immediately instead of queuing a transition');
rapid.step(-5); advance(120); assert.equal(rapid.position, -2, 'Continuous position crosses the first/last boundary');
for (const base of [0, 3, 4, -1]) {
  const before = slotFor((base + 1 + 4) % 4, (base % 4 + 4) % 4, 4) - .499;
  const after = slotFor((base + 1 + 4) % 4, ((base + 1) % 4 + 4) % 4, 4) + .499;
  assert(Math.abs(before - after) < .003, 'Visible series cards remain continuous when the ring wraps');
}

class Surface {
  constructor() { this.listeners = new Map(); this.clientWidth = 400; this.classList = { add() {}, remove() {} }; }
  addEventListener(type, callback) { const callbacks = this.listeners.get(type) || []; callbacks.push(callback); this.listeners.set(type, callbacks); }
  querySelectorAll() { return []; }
  setPointerCapture() {}
  hasPointerCapture() { return false; }
  emit(type, values = {}) {
    const event = { type, target: { closest: () => null }, isPrimary: true, pointerType: 'touch', pointerId: 1, button: 0, clientX: 200, clientY: 100, preventDefault() { this.prevented = true; }, stopImmediatePropagation() {}, ...values };
    this.listeners.get(type)?.forEach(callback => callback(event)); return event;
  }
}
const surface = new Surface(), input = createCarouselMotion(() => {}), cleanup = bindCarouselInput(surface, input, () => 400);
surface.emit('pointerdown'); surface.emit('pointermove', { clientX: 100 }); assert.equal(input.position, .25, 'Drag follows the full pointer distance');
surface.emit('pointerup'); assert.equal(input.position, .25, 'Pointer release does not clear the visual offset');
advance(120); const beforeWheel = input.position;
surface.emit('wheel', { deltaX: 40, deltaY: 0 }); surface.emit('wheel', { deltaX: 40, deltaY: 0 });
assert(Math.abs(input.position - beforeWheel - .2) < 1e-9, 'Every horizontal wheel delta is applied without a lock');
assert.equal(surface.emit('wheel', { deltaX: 0, deltaY: 100 }).prevented, undefined, 'Vertical page scroll is preserved');
for (const callback of [...timers.values()]) callback(); advance(120);
surface.emit('pointerdown'); const beforeVertical = input.position;
surface.emit('pointermove', { clientX: 195, clientY: 180 }); assert.equal(input.position, beforeVertical, 'Vertical touch movement never starts a carousel drag');
surface.emit('pointercancel'); cleanup(); motion.dispose(); rapid.dispose();

// A deliberate short gesture must work at both phone and 4K card widths.
for (const cardWidth of [280, 1100]) {
  const shortSurface = new Surface(), shortMotion = createCarouselMotion(() => {});
  const stop = bindCarouselInput(shortSurface, shortMotion, () => cardWidth);
  shortSurface.emit('pointerdown', { pointerType: 'mouse' }); now += 200;
  shortSurface.emit('pointermove', { pointerType: 'mouse', clientX: 184 }); now += 140;
  shortSurface.emit('pointerup', { pointerType: 'mouse', clientX: 184 }); advance(120);
  assert.equal(shortMotion.position, 1, 'A slow 16px mouse swipe changes a product regardless of card width');
  shortSurface.emit('pointerdown'); now += 200;
  shortSurface.emit('pointermove', { clientX: 205 });
  shortSurface.emit('lostpointercapture', { target: { closest: () => null } });
  shortSurface.emit('pointermove', { clientX: 220 });
  assert.equal(shortMotion.position, 1 - 20 / cardWidth, 'Transferring implicit touch capture from the card to the gallery does not end the gesture');
  now += 140;
  shortSurface.emit('pointerup', { clientX: 220 }); advance(120);
  assert.equal(shortMotion.position, 0, 'A slow 20px touch swipe reverses immediately');
  shortSurface.emit('wheel', { deltaX: 16, deltaY: 0 }); now += 140;
  for (const callback of [...timers.values()]) callback(); advance(120);
  assert.equal(shortMotion.position, 1, 'A short horizontal trackpad gesture changes one product');
  shortSurface.emit('pointerdown'); shortSurface.emit('pointermove', { clientX: 202, clientY: 102 });
  shortSurface.emit('pointerup', { clientX: 202, clientY: 102 }); advance(120);
  assert.equal(shortMotion.position, 1, 'A 2px click tremor does not change the product');
  stop();
}
const mirroredSurface = new Surface(), mirroredMotion = createCarouselMotion(() => {});
const stopMirrored = bindCarouselInput(mirroredSurface, mirroredMotion, () => 600, () => -1);
mirroredSurface.emit('pointerdown', { pointerType: 'mouse' }); now += 200;
mirroredSurface.emit('pointermove', { pointerType: 'mouse', clientX: 216 }); now += 140;
mirroredSurface.emit('pointerup', { pointerType: 'mouse', clientX: 216 }); advance(120);
assert.equal(mirroredMotion.position, 1, 'Mirrored galleries respond to a short gesture in their visual direction');
stopMirrored();
for (const length of [6, 4, 3]) {
  const seen = [], bounded = createCarouselMotion(position => seen.push(position), () => false, { min: 0, max: length - 1 });
  bounded.step(-1); advance(120); assert.equal(bounded.position, 0, 'The first detail product cannot wrap backwards');
  for (let index = 1; index < length; index++) { bounded.step(1); advance(120); assert.equal(bounded.position, index); }
  bounded.step(1); advance(120); assert.equal(bounded.position, length - 1, 'The last detail product cannot wrap forwards');
  bounded.begin(); now += 20; bounded.drag(length + .7); bounded.end(1); advance(120);
  assert.equal(bounded.position, length - 1, 'Dragging beyond the last product stays at the end');
  bounded.begin(); now += 20; bounded.drag(-.7); bounded.end(-1); advance(120);
  assert.equal(bounded.position, 0, 'Dragging beyond the first product stays at the beginning');
  assert.ok(seen.every(position => position >= 0 && position <= length - 1), 'No rendered frame crosses a detail boundary');
  bounded.dispose();
}
console.log('PASS: exact-offset release, interruption, overview cyclic continuity, detail bounds, short mouse/touch/wheel gestures, click tremor, mirrored direction and native vertical scroll.');
