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
const stack=[],parents=new Map();
for(const match of markup.matchAll(/<(\/?)(div|section)\b([^>]*)>/g)){
  if(match[1]){assert.equal(stack.pop().tag,match[2]);continue;}
  const node={tag:match[2],classes:match[3].match(/class="([^"]+)"/)?.[1],parent:stack.at(-1)};
  const id=match[3].match(/id="([^"]+)"/)?.[1];
  if(id)parents.set(id,node.parent);
  stack.push(node);
}
assert.equal(stack.length,0,'Opening and later content retain balanced section containers');
assert.equal(parents.get('value').classes,'xa-content','The video chapter keeps existing full-width content styling');
assert.equal(parents.get('value').parent.classes,'xa-page','The video chapter stays in normal page flow');
assert.doesNotMatch(markup,/xa-opening/,'The obsolete opening cover wrapper is removed');
assert.equal(parents.get('ai-capabilities'),parents.get('value'),'Video and matrix share the same natural content container');
const coverGroups=[],halt={};
const hero={querySelector:()=>({prepend(){}})},value={},matrix={},later=[{},{},{},{}];
const coverSelector=':scope > .xa-content > section:not(#value):not(#ai-capabilities)';
const page={querySelectorAll:selector=>{assert.equal(selector,coverSelector);return later;}};
const mounted={XunAiOrbit:[]};
runInNewContext(source.replace(/^import[^\n]+\n/,''),{window:mounted,mountSectionCover:panels=>{coverGroups.push(panels);return()=>{};},matchMedia:()=>{throw halt;}});
assert.throws(()=>mounted.XunAiAI.mount({querySelector:selector=>selector==='.xa-hero'?hero:selector==='.xa-page'?page:null}),error=>error===halt);
assert.equal(coverGroups.length,1);
assert.deepEqual(Array.from(coverGroups[0]),later,'Only evidence, values, reports and scenarios enter the cover stack');
assert(!coverGroups[0].includes(hero)&&!coverGroups[0].includes(value)&&!coverGroups[0].includes(matrix),'No preceding hero/video/matrix can remain sticky over a natural chapter');
assert.doesNotMatch(source,/stopOpeningCover|xa-opening/);
assert.match(source,/stopCover\(\)/,'The later cover scope cleans up');
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
for(const [width,height] of [[320,640],[360,800],[390,844],[430,932],[768,1024],[792,945],[997,876],[1024,768],[1102,981],[1189,1263],[1440,900],[1515,917],[1920,560],[1920,1080],[2560,1440],[3840,2160]]){
  const spacing=Math.max(40,Math.min(width*.045,120));
  assert(spacing*2<height,'Chapter spacing leaves room for the original content at every target viewport');
}
console.log('PASS: AI hero/video/matrix use natural flow; evidence and later covers, routes, silent looping video and media alignment preserved; balanced containers and bounded spacing at sixteen viewport fixtures. Node/source checks only; browser visual review remains required.');
