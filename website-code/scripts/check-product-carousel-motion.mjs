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
    const event = { target: { closest: () => null }, isPrimary: true, pointerType: 'touch', pointerId: 1, clientX: 200, clientY: 100, preventDefault() { this.prevented = true; }, stopImmediatePropagation() {}, ...values };
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
console.log('PASS: exact-offset release, spring interruption, rapid retargeting, cyclic continuity, pointer tracking, wheel input and vertical scroll.');
