import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { productGroups } from '../../content/products-data.js';

const root = new URL('../../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('content/product-catalog-assets.json', root)));
assert.deepEqual(productGroups.map(group => group.products.length), [6, 6, 4, 3]);
assert.equal(productGroups.at(-1).products.at(-1).id, 'daily-tea');
const products = productGroups.flatMap(group => group.products);
assert.equal(new Set(products.map(product => product.id)).size, 19);
const catalogSources = new Set();
for (const product of products) {
  assert.deepEqual(product.frame, { width: 405, height: 520 });
  const layers = product.layers.filter(layer => layer.src.includes('/catalog/'));
  if (!layers.length) continue;
  const minX = Math.min(...layers.map(layer => layer.left));
  const minY = Math.min(...layers.map(layer => layer.top));
  const maxX = Math.max(...layers.map(layer => layer.left + layer.width));
  const maxY = Math.max(...layers.map(layer => layer.top + layer.height));
  assert.ok(minX >= 0 && maxX <= 405 && minY >= 0 && maxY <= 520, product.id + ' remains inside its card');
  assert.ok(Math.abs((minX + maxX) / 2 - 202.5) < 1 && Math.abs((minY + maxY) / 2 - 260) < 1, product.id + ' is centered');
  for (const layer of layers) {
    assert.equal(layer.imageStyle.objectFit, 'contain');
    assert.ok(!layer.imageStyle.transform, 'Product art remains unflipped');
    catalogSources.add(layer.src.replace('../', ''));
  }
}
assert.equal(catalogSources.size, 20);
assert.equal(manifest.summary.assets, 20);
for (const record of manifest.files) {
  assert.ok(catalogSources.has(record.target), record.target + ' is used by the current catalog');
  const bytes = await readFile(new URL(record.target, root));
  assert.equal(bytes.length, record.after);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.outputSha256);
  assert.equal(record.pixelsIdentical, true);
  assert.equal(record.transparentMarginOnly, true);
  assert.equal(record.width, record.sourceBounds[2] - record.sourceBounds[0]);
  assert.equal(record.height, record.sourceBounds[3] - record.sourceBounds[1]);
  assert.ok((await stat(new URL(record.target, root))).size > 0);
}
console.log('PASS: 19 products across 6/6/4/3 series; 20 current lossless alpha assets; centered contain-fit compositions inside shared card bounds.');
