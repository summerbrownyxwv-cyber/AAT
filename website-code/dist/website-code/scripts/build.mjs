import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'website-code/dist');
async function walk(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name);
    if (path === output || item.name === '.DS_Store') continue;
    files.push(...(item.isDirectory() ? await walk(path) : [path]));
  }
  return files;
}
const code = await walk(resolve(root, 'website-code'));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const folder of ['assets', 'content']) await cp(resolve(root, folder), resolve(output, folder), { recursive: true });
for (const file of code) {
  const target = resolve(output, relative(root, file));
  await mkdir(dirname(target), { recursive: true }); await cp(file, target);
}
for (const name of ['index', 'company', 'planting', 'products', 'service', 'ai', 'contact', 'franchise']) {
  await writeFile(resolve(output, `${name}.html`), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><script>location.replace('./website-code/${name}.html'+location.search+location.hash)</script><a href="./website-code/${name}.html">打开艾艾贴官网</a></html>`);
}
await cp(resolve(root, 'package.json'), resolve(output, 'package.json'));
console.log('Static deployment built in website-code/dist; notes are excluded.');
