import http from 'node:http';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const previewURL = `http://127.0.0.1:${process.env.PORT || 4196}/`;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const pages = new Set(['index', 'company', 'planting', 'products', 'service', 'ai', 'contact', 'franchise'].map(name => `/${name}.html`));
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pages.has(pathname)) {
      res.writeHead(302, { Location: `/website-code${pathname === '/' ? '/index.html' : pathname}${url.search}` });
      return res.end();
    }
    if (!['/assets/', '/content/', '/website-code/'].some(prefix => pathname.startsWith(prefix))) { res.writeHead(404); return res.end(); }
    const file = resolve(root, '.' + pathname);
    const allowed = resolve(root, pathname.split('/')[1]);
    if (!file.startsWith(allowed + sep)) { res.writeHead(403); return res.end(); }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404); return res.end(); }
    const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Accept-Ranges': 'bytes' };
    let start = 0, end = info.size - 1;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (range) { start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2])); end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end; }
      if (!range || (!range[1] && !range[2]) || start > end || start >= info.size) { res.writeHead(416, { ...headers, 'Content-Length': 0, 'Content-Range': `bytes */${info.size}` }); return res.end(); }
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`; headers['Content-Length'] = end - start + 1;
    }
    res.writeHead(req.headers.range ? 206 : 200, headers);
    if (req.method === 'HEAD') return res.end();
    createReadStream(file, req.headers.range ? { start, end } : undefined).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 4196), '127.0.0.1', () => {
  console.log('Preview: ' + previewURL);
  if (process.argv.includes('--open')) spawn('open', [previewURL], { stdio: 'ignore' });
});
server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    try {
      const page = await fetch(previewURL + 'website-code/index.html');
      if (page.ok && (await page.text()).includes('艾艾贴')) {
        console.log('预览已运行：' + previewURL);
        if (process.argv.includes('--open')) spawn('open', [previewURL], { stdio: 'ignore' });
        return;
      }
    } catch {}
  }
  console.error('预览未能启动：' + error.message); process.exitCode = 1;
});
