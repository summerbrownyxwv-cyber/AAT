import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(process.argv[2] || resolve(import.meta.dirname, '../..'));
const code = resolve(root, 'website-code');
const { canonicalAsset } = await import(pathToFileURL(resolve(code, 'asset-urls.js')));
async function walk(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.name === 'dist' || item.name === '.DS_Store') continue;
    const path = resolve(directory, item.name);
    files.push(...(item.isDirectory() ? await walk(path) : [path]));
  }
  return files;
}
const failures = [];
let references = 0;
async function checkReference(ref, base, owner) {
  if (!ref || /^(?:[a-z]+:|#|\/\/)/i.test(ref) || ref.includes('${')) return;
  ref = canonicalAsset(ref);
  const file = resolve(base, decodeURIComponent(ref.split(/[?#]/)[0]));
  try { assert.ok((await stat(file)).size > 0); references++; }
  catch { failures.push(`${owner}: ${ref}`); }
}
for (const path of await walk(code)) {
  const name = relative(code, path);
  if (name.startsWith('scripts/') || name.startsWith('vendor/')) continue;
  const text = await readFile(path, 'utf8');
  for (const [, ref] of text.matchAll(/(?:from\s*|import\s*\(|import\s*)['"](\.[^'"]+)['"]/g)) await checkReference(ref, dirname(path), name);
  if (extname(path) === '.html') {
    for (const [, ref] of text.matchAll(/(?:src|href|poster|data-image)=["']([^"']+)["']/g)) await checkReference(ref, code, name);
  }
  if (extname(path) === '.css') {
    for (const [, ref] of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) await checkReference(ref, dirname(path), name);
  } else {
    for (const [, ref] of text.matchAll(/["'`](\.\.\/assets\/[^"'`<>\s$]+)["'`]/g)) await checkReference(ref, code, name);
  }
  assert.ok(!text.includes('__PACKAGE_MEDIA_'), `${name}: unresolved path placeholder`);
}
assert.deepEqual(failures, [], 'Every local page/module/media reference must resolve');
const data = await import(pathToFileURL(resolve(root, 'content/products-data.js')));
const productImages = new Set(data.heroProducts.map(item => item.image).concat(data.productSeries.map(item => item.image), data.productGroups.flatMap(group => group.products.flatMap(product => product.layers.map(layer => layer.src)))));
for (const src of productImages) await checkReference(src, code, 'product content');
assert.deepEqual(failures, []);
assert.equal(data.heroProducts.length, 5); assert.equal(data.productGroups.length, 4);
const planting = await import(pathToFileURL(resolve(root, 'content/planting-asset-manifest.js')));
for (const [key, item] of Object.entries(planting.plantingAssets)) {
  await checkReference(key, code, 'planting catalog');
  for (const variant of item.variants || []) await checkReference(variant.src, code, 'planting variant');
}
assert.deepEqual(failures, []);
const manifest = JSON.parse(await readFile(resolve(root, 'content/asset-map.json'), 'utf8'));
for (const record of manifest.files) {
  const bytes = await readFile(resolve(root, record.target));
  assert.equal(bytes.length, record.after, record.target);
  if (record.raster) {
    assert.equal(extname(record.target), '.webp'); assert.equal(record.pixelsIdentical, true);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.outputSha256, record.target);
  } else assert.equal(createHash('sha256').update(bytes).digest('hex'), record.outputSha256 || record.sourceSha256, record.target);
}
const oldRaster = (await walk(resolve(root, 'assets'))).filter(path => /\.(png|jpe?g|gif)$/i.test(path));
assert.deepEqual(oldRaster, [], 'Published standalone bitmap assets must use WebP');
for (const name of ['index', 'company', 'planting', 'products', 'service', 'ai', 'contact', 'franchise']) assert.ok((await stat(resolve(code, `${name}.html`))).size > 0);
assert.ok((await readFile(resolve(code, 'franchise.html'), 'utf8')).includes('franchise-redirect.js'));
assert.ok((await readFile(resolve(code, 'xunai/about-page.js'), 'utf8')).includes('return cleanup;'));
assert.equal((await readFile(resolve(code, 'products-cooperation.js'), 'utf8')).includes('cooperation-caption'), false);
await import('./check-product-catalog.mjs');
console.log(`PASS: eight pages, ${references} resolved references, ${productImages.size} product images, ${manifest.summary.bitmaps} pixel-verified WebP assets; original models/SVG preserved.`);
