// Audit-only browser harness. Never changes the served website or updates an existing baseline.
import { chromium } from '/Users/dabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
const root = resolve(import.meta.dirname, '../../..');
const out = resolve(root, 'notes/prelaunch-qa');
const base = 'http://127.0.0.1:4196';
const revision = '48886fa39b059a88e01bc75ab99dba7acc935db8';
const inventory = JSON.parse(await readFile(resolve(out, 'data/motion-routes.json'), 'utf8'));
const sizes = inventory.viewports_css_pixels;
const routes = inventory.routes;
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const selected = process.argv.slice(2);
const recordsPath = resolve(out, 'data/browser-layouts.json');
let records = [];
try { records = JSON.parse(await readFile(recordsPath, 'utf8')); } catch {}
if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() !== revision) throw Error('Baseline revision changed. Review before capture.');
const browser = await chromium.launch({ executablePath: chrome, headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
await writeFile(resolve(out, 'data/browser-environment.json'), JSON.stringify({
  revision, tag: 'qa-prelaunch-baseline-20261015', branch: 'qa/prelaunch-20261015-phase01',
  os: { platform: os.platform(), release: os.release(), architecture: os.arch(), macOS: execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim() },
  browser: { name: 'Google Chrome', version: browser.version(), executable: chrome, headless: true },
  playwright: JSON.parse(await readFile('/Users/dabao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json', 'utf8')).version,
  baseURL: base, viewportUnit: 'CSS px', baselineDPR: 1, locale: 'zh-CN', timezone: 'Asia/Shanghai',
  screenshot: { format: 'JPEG', quality: 78, fullPage: true, animations: 'current normal state; not disabled', videos: 'actual live frame, time recorded' },
  limitations: ['Before-change evidence, not approved visual truth', 'Headless Chromium emulation is not physical mobile/Safari testing', 'Pinned chapters need supplemental scroll states; a full document screenshot cannot expose every overlapping panel'],
}, null, 2));

async function layout(page) {
  return page.evaluate(() => {
    const rect = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }; };
    const shown = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.display !== 'none' && s.visibility !== 'hidden'; };
    const text = [...document.querySelectorAll('main h1,main h2,main h3,main p,main button,main a,footer a,header a')].filter(shown).slice(0, 180).map(e => {
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      return { tag: e.tagName.toLowerCase(), id: e.id, class: e.className, text: e.textContent.trim().slice(0, 90), ...rect(e), visibleInViewport: r.bottom > 0 && r.top < innerHeight, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textAlign: s.textAlign, overflowX: s.overflowX, overflowY: s.overflowY, clientWidth: e.clientWidth, scrollWidth: e.scrollWidth, clientHeight: e.clientHeight, scrollHeight: e.scrollHeight };
    });
    const overflow = [...document.querySelectorAll('main *,header *,footer *')].filter(shown).filter(e => { const r = e.getBoundingClientRect(); return (r.left < -2 || r.right > innerWidth + 2) && getComputedStyle(e).position !== 'fixed'; }).slice(0, 50).map(e => ({ tag: e.tagName, id: e.id, class: e.className, text: e.textContent.trim().slice(0, 40), ...rect(e) }));
    return {
      url: location.href, title: document.title, w: innerWidth, h: innerHeight, dpr: devicePixelRatio,
      visualViewport: { width: visualViewport.width, height: visualViewport.height, scale: visualViewport.scale },
      documentWidth: document.documentElement.clientWidth, documentHeight: document.documentElement.scrollHeight,
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      scrollY, fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status, weight: f.weight })),
      brokenImages: [...document.images].filter(e => e.complete && e.currentSrc && !e.naturalWidth).map(e => e.currentSrc),
      pendingImages: [...document.images].filter(e => !e.complete).map(e => e.currentSrc || e.src),
      videos: [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc, time: v.currentTime, duration: Number.isFinite(v.duration) ? v.duration : null, width: v.videoWidth, height: v.videoHeight, error: v.error?.code || 0, paused: v.paused, loop: v.loop, muted: v.muted, controls: v.controls })),
      sections: [...document.querySelectorAll('main section')].filter(shown).map(e => ({ id: e.id, class: e.className, ...rect(e), position: getComputedStyle(e).position })),
      text, outOfViewportElements: overflow,
      activeElement: document.activeElement?.outerHTML.slice(0, 300),
      finiteAnimations: document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).length,
    };
  });
}
for (const [width, height] of sizes) {
  if (selected.length && !selected.includes(String(width))) continue;
  const mobile = width <= 1024;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'zh-CN', timezoneId: 'Asia/Shanghai', reducedMotion: 'no-preference' });
  for (const route of routes) {
    const key = `${route.slug}-${width}x${height}`;
    if (records.some(r => r.key === key && r.status === 'captured')) continue;
    const page = await context.newPage();
    const errors = [], responses = [], failedRequests = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('response', r => { if (r.status() >= 400) responses.push({ url: r.url(), status: r.status() }); });
    page.on('requestfailed', r => failedRequests.push({ url: r.url(), error: r.failure()?.errorText }));
    const started = new Date().toISOString();
    const folder = resolve(out, `baseline/${route.slug}/${width}x${height}`);
    const stateFolder = resolve(out, `states/${route.slug}/${width}x${height}`);
    await mkdir(folder, { recursive: true });
    const states = [];
    try {
      const response = await page.goto(base + route.route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => document.querySelector('main')?.children.length > 0, { timeout: 15000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(450);
      const initial = await layout(page);
      if (initial.w !== width || initial.h !== height || initial.dpr !== 1) throw Error('Actual CSS viewport/DPR mismatch');
      let priorY = -1, lastSignature = '';
      const canonical = [390, 1440, 3840].includes(width);
      for (let step = 0; step < 90; step++) {
        const here = await page.evaluate(() => ({ y: scrollY, end: document.documentElement.scrollHeight - innerHeight, signature: [document.querySelector('.product-catalog')?.dataset.activeGroup || '', ...[...document.querySelectorAll('main section[id]')].filter(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight * .4; }).map(e => e.id)].join('|') }));
        if (canonical && here.signature && here.signature !== lastSignature && states.length < 16) {
          lastSignature = here.signature; await mkdir(stateFolder, { recursive: true });
          await page.waitForTimeout(180);
          const name = `scroll-${String(step).padStart(3, '0')}.jpg`;
          await page.screenshot({ path: resolve(stateFolder, name), type: 'jpeg', quality: 78, timeout: 30000 });
          states.push({ step, scrollY: here.y, signature: here.signature, screenshot: relative(out, resolve(stateFolder, name)) });
        }
        if (here.y >= here.end - 2 || (here.y === priorY && step > 2)) break;
        priorY = here.y;
        await page.mouse.wheel(0, height * .88);
        await page.waitForTimeout(65);
      }
      await page.waitForTimeout(250);
      const bottom = await layout(page);
      await page.mouse.wheel(0, -1e7);
      await page.waitForTimeout(750);
      const beforeScreenshot = await layout(page);
      const image = resolve(folder, 'full-page.jpg');
      try { await stat(image); throw Error('Existing baseline file must not be overwritten'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      await page.screenshot({ path: image, fullPage: true, type: 'jpeg', quality: 78, timeout: 45000 });
      const record = { key, slug: route.slug, route: route.route, revision, started, completed: new Date().toISOString(), status: 'captured', responseStatus: response?.status(), screenshot: relative(out, image), viewport: { width, height, dpr: 1, mobile }, initial, bottom, beforeScreenshot, scrollStates: states, errors, responses, failedRequests };
      await writeFile(resolve(folder, 'metadata.json'), JSON.stringify(record, null, 2));
      records = records.filter(r => r.key !== key); records.push(record);
      console.log(`CAPTURE ${records.length}/242 ${key} document=${beforeScreenshot.documentHeight} overflow=${initial.horizontalOverflow} errors=${errors.length}`);
    } catch (error) {
      records = records.filter(r => r.key !== key); records.push({ key, slug: route.slug, route: route.route, revision, started, status: 'failed', error: String(error), errors, responses, failedRequests });
      console.log(`FAIL ${key} ${String(error).slice(0, 300)}`);
    } finally {
      await page.close();
      await writeFile(recordsPath, JSON.stringify(records, null, 2));
    }
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify({ captured: records.filter(r => r.status === 'captured').length, failed: records.filter(r => r.status !== 'captured').length }));
