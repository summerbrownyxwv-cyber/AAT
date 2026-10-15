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
