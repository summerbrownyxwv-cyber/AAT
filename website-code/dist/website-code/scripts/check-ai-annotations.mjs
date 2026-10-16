import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
const [html,css,source,shared]=await Promise.all(['ai.html','ai-annotation.css','xunai/ai-page.js','xunai/content.css'].map(read));
assert(html.indexOf('./ai-annotation.css')>html.indexOf('./site-experience.css'), 'AI alignment fixes load after the shared styles');
const window={XunAiOrbit:[]};
runInNewContext(source.replace(/^import[^\n]+\n/,''),{window});
const markup=window.XunAiAI.render();
for(const id of ['value','ai-capabilities','ai-evidence','how-it-works','ai-reports','scenarios']){
  assert(markup.includes(`id="${id}"`),`Preserve the ${id} route`);
}
const video=markup.match(/<video[^>]+class="xa-demo-video"[\s\S]*?<\/video>/)?.[0];
assert(video,'The original demo video remains in the introductory chapter');
for(const attribute of ['autoplay','muted','loop','playsinline','poster='])assert(video.includes(attribute));
assert(!video.includes('controls'));
assert(markup.indexOf('class="xa-intro"')<markup.indexOf(video));
assert(markup.indexOf(video)<markup.indexOf('id="ai-capabilities"'));
assert.doesNotMatch(css,/(?:font(?:-[\w]+)?|line-height|letter-spacing|color|background|object-fit|object-position|aspect-ratio|grid-template-columns)\s*:/,'Layout annotations preserve type, artwork, crops, and grid proportions');
assert.doesNotMatch(css,/\.xa-hero\b|\.xa-stage\b/,'The approved hero remains outside this change');
const declarations=selector=>{
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return css.match(new RegExp(escaped+'\\{([^}]+)\\}'))?.[1]||'';
};
assert.equal(declarations('#main-content .xa-page .xa-content>section.section-cover-panel.is-cover-fit'),'min-height:0');
assert.equal(declarations('#main-content .xa-page .xa-content>section'),'padding-block:var(--xa-section-space)!important');
assert.match(declarations('#main-content .xa-page #value'),/height:auto;min-height:0;align-items:start/);
assert.match(declarations('#main-content .xa-page #value>figure'),/align-self:start;align-items:flex-start/);
assert.match(declarations('#main-content .xa-page #ai-capabilities>div:last-child'),/align-self:end/);
assert(shared.includes('.xa-matrix-aside{display: flex; flex-direction: column; justify-content: space-between; align-self: stretch; gap: 32px;}'));
assert(shared.includes('.xa-matrix-device{margin-top: auto !important;}'));
for(const [width,height] of [[390,844],[768,1024],[1024,768],[1189,1263],[1440,900],[1920,560],[1920,1080],[2560,1440],[3840,2160]]){
  const spacing=Math.max(40,Math.min(width*.045,120));
  assert(spacing*2<height,'Chapter spacing leaves room for the original content at every target viewport');
}
console.log('PASS: original AI routes, silent looping demo and hero preserved; content chapters use natural height and bounded equal padding; video aligns to copy top and capability columns share a bottom edge. Source checks only; browser visual review remains required.');
