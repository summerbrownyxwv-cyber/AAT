import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { coverGeometry } from '../section-cover.js';

for (const viewport of [504, 738, 1312, 1968]) {
  const heights = [viewport - 80, viewport, viewport + 32];
  const mobile = coverGeometry(heights, viewport, 72);
  assert.deepEqual(mobile.map(panel => panel.pinned), [true, true, false]);
  assert.deepEqual(coverGeometry(heights, viewport, 72, true, true).map(panel => panel.pinned), [false, false, false]);
  const desktop = coverGeometry(heights, viewport, 72, false, true);
  assert.deepEqual(desktop.map(panel => panel.pinned), [true, true, true]);
  assert.deepEqual(desktop.map(panel => panel.top), [72, 72, 40]);
  for (const height of [viewport + 180, viewport * 2.2]) {
    const [panel] = coverGeometry([height], viewport, 72, false, true);
    assert.equal(height + panel.top, viewport + 72, 'Long chapter pins only after its bottom reaches the viewport bottom');
  }
}
assert.deepEqual(coverGeometry([0, 420, 900], 580, 64).map(panel => panel.pinned), [false, true, false]);
const styles = await readFile(new URL('../xunai/content.css', import.meta.url), 'utf8');
assert.match(styles, /\.section-cover-panel\.is-cover-fit\{position:sticky;top:var\(--cover-top\);min-height:var\(--cover-height\)\}/);
assert.match(styles, /\.xa-page \.xa-content\{display:contents\}/);
assert.match(styles, /\.xa-page \.xa-content>section\{width:100%;max-width:none;padding-inline:var\(--x-page-gutter\)\}/);
assert.match(styles, /\.section-cover-panel\.is-cover-behind\{visibility:hidden\}/);
assert.match(styles, /\.xa-page section\{border-top:0;border-bottom:0\}/);
for (const file of ['stores-page.js', 'ai-page.js']) {
  const source = await readFile(new URL('../xunai/' + file, import.meta.url), 'utf8');
  assert.ok(source.includes("import { mountSectionCover } from '../section-cover.js'"));
  assert.ok(source.includes('stopCover()') || source.includes('return stopCover'));
}
console.log('PASS: desktop long chapters fully read before bottom pinning, mobile long/reduced-motion natural flow, full-width cover and cleanup.');
