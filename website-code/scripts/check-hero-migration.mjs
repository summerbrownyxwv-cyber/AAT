import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const source = await readFile(new URL('../product-hero.js', import.meta.url), 'utf8');
const { renderProductHero, modelProgress } = await import('data:text/javascript,' + encodeURIComponent(source.replace(/^import[^\n]+\n/, '').replace('export async function mountProductHero', 'async function mountProductHero')));
const markup = renderProductHero();
assert.equal((markup.match(/data-product-index=/g) || []).length, 5);
assert.ok(markup.includes('id="products-hero"') && markup.includes('id="product-canvas"'));
for (const stage of [504, 828, 1368]) {
  const height = stage + 1200, top = 72;
  assert.equal(modelProgress(top - 50, top, height, stage), 0);
  assert.equal(modelProgress(top + 1500, top, height, stage), 4.98);
  for (let index = 0; index < 5; index++) {
    const scroll = top + (index ? index + .05 : 0) / 4.98 * (height - stage);
    assert.equal(Math.floor(modelProgress(scroll, top, height, stage)), index);
  }
}
const styles = await readFile(new URL('../product-hero.css', import.meta.url), 'utf8');
assert.match(styles, /height:calc\(var\(--model-height\) \+ 80svh\)/);
for (const [width, height] of [[390,844],[768,1024],[1189,1263],[1440,900],[1920,1080],[2560,1440],[3840,2160]]) {
  const unit = width / 1440, wide = Math.max(1, unit), mobile = width <= 900;
  const available = height - (mobile ? 64 : 72) * wide;
  const content = mobile ? Math.min(width - 40 * wide, 440 * wide) * 603 / 592 + 300 * wide : 603 * unit + 40 * wide;
  const compact = available - Math.max(0, available - content) / 3;
  const stageWidth = space => mobile ? Math.min(width - 40 * wide, 440 * wide, (space - 300 * wide) * 592 / 603) : Math.min(592 * unit, (space - 56 * wide) * 592 / 603);
  assert.ok(compact > 0 && compact <= available);
  assert.ok(Math.abs(stageWidth(compact) - stageWidth(available)) < .01, 'Compacting whitespace must not shrink the model stage');
  for (let index = 0; index < 5; index++) {
    const travel = height * .8, scroll = (index ? index + .05 : 0) / 4.98 * travel;
    assert.equal(Math.floor(modelProgress(scroll, 0, compact + travel, compact)), index, `${width}x${height} must retain all five scroll selections`);
  }
}
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(home.includes('home-hero.mp4') && home.includes('home-hero-poster.webp'));
assert.doesNotMatch(home, /id="product-canvas"|data-product-index=/);
const showcase = await readFile(new URL('../products-showcase.js', import.meta.url), 'utf8');
assert.ok(showcase.includes('${renderProductHero()}'));
assert.doesNotMatch(showcase, /products-hero-items|bindHeroInput/);
const media = new URL('../../assets/homepage/home-hero.mp4', import.meta.url);
const bytes = await readFile(media);
assert.equal(createHash('sha256').update(bytes).digest('hex'), 'b8b356cafb948cbd1bfe7c5e9c6d3901c020ccf5bfc6d4c437120adbdc1bf7e3');
console.log('PASS: model hero moved to products, five native-scroll selections, homepage video and media checksum.');
