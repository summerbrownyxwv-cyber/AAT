import { canonicalAsset } from './asset-urls.js';
import { plantingAssets } from '../content/planting-asset-manifest.js';
import { renderPlantingFactory } from './planting-factory.js';
import { mountContentMotion } from './content-motion.js';
import { clamp, smoothstep } from './motion.js';
import { renderPlantingManagement, mountPlantingManagement } from './planting-management.js';

const image = (name, alt, eager = false) => `<img src="${canonicalAsset('../assets/planting/' + name)}" alt="${alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
const landThumbnail = (name, alt) => `<figure>${image(name, alt)}</figure>`;
const rows = items => items.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
const traits = [
  ['种苗培育', '育苗是项目的关键环节。科研团队在蕲春各地考察，选择各方面参数最优的野生艾草，移栽到温棚中，通过有性繁殖的方式优化种质，多次迭代、定向培育。', '4032b.webp'],
  ['形状特征', '蕲优一号的物理形态较普通艾草有明显差异。其植株高且直立、少侧枝、下部有对叶生长，叶片宽大肥厚且对称性好，叶边圆润，叶裂深裂、裂片五裂，枝干呈银白色，有绒毛。', '873e1.webp'],
  ['品质稳定', '研究人员通过连续跟踪考察，发现蕲优一号在稳定性方面也非常卓越。这种稳定性使蕲优一号能够适应多种自然环境，在不同地区、不同气候条件下，种苗可以维持可控的生长状态，收获更高质量、高产量的艾叶。', '701dd.webp'],
  ['有效成分含量高', '通过对蕲优一号有效成分含量及药效的进一步检测，我们发现，蕲优一号在化合物含量方面优越性显著。', 'effective-content.webp']
];
const main = document.querySelector('#main-content');
document.querySelector('#planting-content').innerHTML = `
  <section id="land" class="plant-land"><div class="plant-land-stage">
    <h2 class="plant-land-heading">土地与基地</h2>
    <div class="plant-land-canvas"><figure class="plant-land-photo">${image('28470.webp', '标准化种植基地的艾草田与采收团队')}</figure></div>
    <aside class="plant-land-aside plant-land-field"><h3>标准化种植基地</h3><p>艾艾贴与中国中医科学院中药研究合作，共建标准化艾草种植基地，同时制定艾叶无公害栽培生产规范和无公害技术标准，从源头上确保艾叶基因优良，严格把控原材料品质。该基地是蕲春县最为平整的地块之一，远离城市污染、空气清新、土壤肥沃且富含有机质，为艾草提供了最佳的生长条件。</p></aside>
    <div class="plant-land-gallery"><div class="plant-land-thumbnails">${landThumbnail('f80d1.webp', '种植基地田间作业')}${landThumbnail('3ecaa.webp', '蕲优一号艾草采收')}${landThumbnail('4ba9f.webp', '艾草育苗研究基地')}<figure id="greenhouse">${image('4fb37.webp', '夕阳下的艾草育苗研究所')}</figure>${landThumbnail('bceb2.webp', '恒温玻璃温室')}</div></div>
  </div></section>
  <div class="plant-cultivar cream">
    <div class="plant-cultivar-chapter"><h2 class="plant-cultivar-title plant-shell">从蕲优一号开始</h2>
    <section class="plant-origin plant-shell"><div class="plant-origin-grid"><figure><video autoplay muted loop playsinline preload="metadata" poster="../assets/planting/qiyou-one-poster.webp" width="1920" height="1080" aria-label="蕲优一号品种介绍影片"><source src="../assets/planting/qiyou-one.mp4" type="video/mp4"></video></figure><div><p>「蕲优一号」由艾艾贴联合中国中医科学院中药研究所联合培育，其品种基因稳定性更高，有效成分含量显著提升，其各项数据均超越了此前测验的全国各地艾草数据。</p><p>极大地丰富和优化了蕲艾品种，成功树立起蕲艾品牌的全新标杆。</p></div></div></section>
    <section id="research" class="plant-research plant-shell" data-scroll-story="research"><div class="plant-research-stage"><div class="plant-research-copy"><h3>研发团队</h3><p>「蕲优一号」研发团队由中国工程院院士陈士林领衔，整合了中国中医科学院中药研究所的顶尖科研力量与艾艾贴实验室的创新实践能力。</p></div><figure class="plant-research-main">${image('6c883.webp', '艾艾贴实验室科研人员')}</figure><figure class="plant-research-secondary plant-research-second">${image('ae031.webp', '科研团队进行实验')}</figure><figure class="plant-research-secondary plant-research-third">${image('61bde.webp', '科研人员提取艾草有效成分')}</figure></div></section>
    <section id="traits" class="plant-traits plant-shell" data-scroll-story="traits"><div class="plant-traits-scene"><div class="plant-traits-stage"><h2>品种特性</h2><div class="plant-trait-list">${traits.map(([title, copy, photo], i) => `<article class="${i === 0 ? 'is-active' : ''}"><div class="plant-trait-copy"><img class="plant-flower" src="../assets/planting/1162d.svg" alt=""><h3>${title}</h3><p>${copy}</p></div><figure>${image(photo, title)}</figure></article>`).join('')}</div></div>
    <section id="composition" class="plant-composition" aria-label="蕲优一号植株与成分数据"><div class="plant-composition-stage"><div class="plant-composition-data"><figure class="plant-model">${image('aa6de.webp', '蕲优一号艾草植株与叶片形态')}<div class="plant-model-canvas" aria-label="蕲优一号艾草三维模型"></div></figure><dl>${rows([['平均株高可达','187.4cm'],['单株鲜叶产量','81.6±7.7g'],['单叶叶面积','79.0±18.1cm²']])}</dl></div></div></section></div></section></div>
    ${renderPlantingManagement(image, rows)}
  </div>${renderPlantingFactory()}`;

// Release every preceding sticky chapter before the stable final capacity section.
const capacity = main.querySelector('.pf-capacity');
const coverStack = document.createElement('div');
coverStack.className = 'plant-cover-stack';
capacity.before(coverStack);
coverStack.append(...[...coverStack.parentElement.children].filter(section => section !== coverStack && section !== capacity));
capacity.querySelectorAll('.content-reveal-copy,.content-reveal-media').forEach(element => element.classList.remove('content-reveal-copy','content-reveal-media'));

main.querySelectorAll('img').forEach(img => {
  const asset = plantingAssets[img.getAttribute('src')];
  if (!asset) return;
  img.width = asset.width; img.height = asset.height;
  img.srcset = asset.variants.map(v => `${v.src} ${v.width}w`).join(', ');
  img.sizes = img.closest('.plant-hero') ? '100vw' : img.closest('.plant-mosaic-aside') ? '(max-width:900px) 30vw, (min-width:1920px) 400px, 22vw' : '(max-width:900px) 90vw, (min-width:1920px) 1200px, 65vw';
  img.src = asset.variants.find(v => v.width >= 1440)?.src || asset.variants.at(-1).src;
});
const stopContent = [...main.querySelectorAll('.plant-hero,.plant-origin,.pf-campus,.pf-technology,.pf-lines')].map(mountContentMotion);
stopContent.push(mountPlantingManagement(main.querySelector('.plant-management')));
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
// Research keeps its native scroll story; traits use finite input inside one reading viewport.
const stories = [...main.querySelectorAll('[data-scroll-story]')].map(section => ({section, stage:section.firstElementChild, progress:0, start:0, travel:1}));
const landSection = main.querySelector('#land');
const research = stories.find(item => item.section.dataset.scrollStory === 'research');
const traitsStory = stories.find(item => item.section.dataset.scrollStory === 'traits');
const compositionSection = main.querySelector('#composition');
const composition = {section:compositionSection,stage:compositionSection.firstElementChild,progress:0,start:0,travel:1};
const cultivarChapter = main.querySelector('.plant-cultivar-chapter');
const cultivarTitle = main.querySelector('.plant-cultivar-title');
const traitArticles = [...traitsStory.section.querySelectorAll('article')];
const dataRows = [...composition.section.querySelectorAll('dl>div')];
dataRows.forEach(row => { row.querySelector('dd').dataset.final = row.querySelector('dd').textContent; });
const chapters = [...main.querySelectorAll('.plant-origin,.plant-research,.plant-traits,.plant-management,.pf-campus,.pf-technology,.pf-lines,.pf-capacity')];
// Story scenes manage their own pinning; their outer runway stays in normal flow.
const coverChapters = chapters.filter(section => !section.matches('.plant-origin,.plant-research,.plant-traits,.pf-capacity'));
coverChapters.forEach((section,index) => { section.classList.add('plant-cover'); section.style.zIndex = String(index + 1); });
let frame = 0, last = 0, researchGeometry, plantScene;
let traitCursor = 0, traitFlow = false;
const modelContainer = composition.section.querySelector('.plant-model-canvas');
const modelObserver = new IntersectionObserver(async entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  modelObserver.disconnect();
  try {
    const { createPlantScene } = await import('./planting-model.js');
    plantScene = await createPlantScene(modelContainer);
    composition.section.querySelector('.plant-model').classList.add('model-ready');
    schedule();
  } catch { modelContainer.dataset.status = 'fallback'; }
}, {rootMargin:'100% 0px'});
modelObserver.observe(composition.section);
function measure() {
  const top = document.querySelector('.site-navigation').getBoundingClientRect().height;
  const available = innerHeight - top;
  const unit = Math.max(1,innerWidth / 1440);
  const narrow = innerWidth <= 900;
  traitsStory.section.classList.remove('plant-story-flow');
  traitsStory.stage.style.height = `${available}px`;
  const traitStage = traitsStory.section.querySelector('.plant-traits-stage');
  const traitStyle = getComputedStyle(traitStage);
  const contentHeight = Math.max(...traitArticles.map(article => Math.max(article.querySelector('.plant-trait-copy').scrollHeight,article.querySelector('figure').offsetHeight)));
  const requiredHeight = (parseFloat(traitStyle.paddingTop)||0)+(parseFloat(traitStyle.paddingBottom)||0)+(parseFloat(traitStyle.rowGap)||0)+traitStage.querySelector('h2').offsetHeight+contentHeight;
  traitFlow = reduced.matches || requiredHeight > available;
  traitsStory.section.classList.toggle('plant-story-flow',traitFlow);
  traitsStory.stage.style.height = traitFlow ? 'auto' : `${available}px`;
  if (innerHeight <= 560) research.stage.querySelectorAll('figure').forEach(photo => { photo.style.cssText = ''; });
  stories.forEach(item => {
    const natural = item === traitsStory || reduced.matches || innerHeight <= 560;
    item.travel = natural ? 0 : item.stage.offsetHeight * .55;
    item.section.style.height = natural ? 'auto' : `${item.stage.offsetHeight + item.travel}px`;
  });
  const titleBottom = (parseFloat(getComputedStyle(cultivarChapter).paddingTop) || 0) + cultivarTitle.offsetHeight;
  cultivarChapter.style.setProperty('--cultivar-content-top', `${titleBottom + 24*unit}px`);
  coverChapters.forEach(section => { section.style.setProperty('--cover-top', `${Math.min(top, innerHeight - section.offsetHeight)}px`); });
  const campus = main.querySelector('.pf-campus-inner');
  const description = campus.querySelector('.pf-campus-description');
  const stats = campus.querySelector('.pf-campus-stats');
  campus.style.setProperty('--campus-photo-top', `${description.offsetTop}px`);
  campus.style.setProperty('--campus-photo-height', `${stats.offsetTop + stats.offsetHeight - description.offsetTop}px`);
  let flowTop = top + main.querySelector('.plant-hero').offsetHeight;
  [landSection,...chapters].forEach(section => {
    if (section.classList.contains('plant-origin')) {
      const heading = getComputedStyle(cultivarTitle);
      flowTop += parseFloat(getComputedStyle(cultivarChapter).paddingTop) + cultivarTitle.offsetHeight + (parseFloat(heading.marginBottom) || 0);
    }
    const style = getComputedStyle(section);
    flowTop += parseFloat(style.marginTop) || 0;
    const item = stories.find(item => item.section === section);
    section.dataset.chapterScroll = String(flowTop - top);
    if (item) item.start = flowTop - top;
    flowTop += section.offsetHeight + (parseFloat(style.marginBottom) || 0);
  });
  composition.start = traitsStory.start;
  composition.travel = 0;
  composition.section.dataset.chapterScroll = String(traitsStory.start);
  const researchWidth = research.stage.clientWidth, researchHeight = research.stage.clientHeight, ratio = 361 / 244;
  research.section.style.setProperty('--research-copy-top', `${titleBottom + 24*unit}px`);
  const copyEnd = research.section.querySelector('.plant-research-copy').offsetTop + research.section.querySelector('.plant-research-copy').offsetHeight;
  const photoTop = narrow ? copyEnd + 24 : titleBottom + 24*unit;
  const smallWidth = Math.min(researchWidth * (narrow ? .45 : .28093), Math.max(1,(researchHeight-photoTop-48*unit)*ratio/2));
  researchGeometry = {height:researchHeight,ratio,photoTop,smallWidth,largeWidth:Math.min(researchWidth * (narrow ? 1 : .62),Math.max(1,(researchHeight-photoTop-24*unit)*ratio))};
  schedule();
}
function advanceTraits(delta) {
  if (!delta || reduced.matches || traitFlow || document.querySelector('dialog[open]')) return false;
  const top = document.querySelector('.site-navigation').getBoundingClientRect().height;
  const bounds = traitsStory.section.getBoundingClientRect();
  const available = innerHeight-top, tolerance = Math.min(120,available*.25);
  const pinned = Math.abs(bounds.top-top) <= 2;
  const crossing = delta > 0 ? bounds.top > top && bounds.top-top <= delta : bounds.top < top && top-bounds.top <= -delta;
  const arriving = delta > 0 ? bounds.top < top && bounds.top >= top-tolerance : bounds.top > top && bounds.top <= top+tolerance;
  if (!pinned && !crossing && !arriving) return false;
  const next = clamp(traitCursor + clamp(delta/Math.max(240,available*.55),-1,1),0,7);
  if (next === traitCursor) return false;
  if (!pinned) window.scrollTo({top:scrollY+bounds.top-top,behavior:'instant'});
  traitCursor = next;
  schedule();
  return true;
}
const traitInput = new AbortController();
const editableTarget = target => target?.closest?.('input,textarea,select,button,a,[contenteditable="true"]');
window.addEventListener('wheel',event=>{
  if (!event.cancelable || event.ctrlKey || event.metaKey || editableTarget(event.target) || Math.abs(event.deltaX)>Math.abs(event.deltaY)) return;
  const delta = event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
  if (advanceTraits(delta)) event.preventDefault();
},{passive:false,signal:traitInput.signal});
let traitTouch;
window.addEventListener('touchstart',event=>{traitTouch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true,signal:traitInput.signal});
window.addEventListener('touchmove',event=>{
  if (!traitTouch || event.touches.length!==1 || !event.cancelable || editableTarget(event.target)) return;
  const touch=event.touches[0],dy=traitTouch.y-touch.clientY,dx=traitTouch.x-touch.clientX;
  traitTouch={x:touch.clientX,y:touch.clientY};
  if (Math.abs(dy)>Math.abs(dx) && advanceTraits(dy)) event.preventDefault();
},{passive:false,signal:traitInput.signal});
for (const type of ['touchend','touchcancel']) window.addEventListener(type,()=>{traitTouch=null;},{passive:true,signal:traitInput.signal});
window.addEventListener('keydown',event=>{
  if (event.ctrlKey || event.metaKey || event.altKey || editableTarget(event.target)) return;
  const delta = {ArrowDown:40,ArrowUp:-40,PageDown:innerHeight,PageUp:-innerHeight,' ':event.shiftKey?-innerHeight:innerHeight}[event.key];
  if (delta && advanceTraits(delta)) event.preventDefault();
},{signal:traitInput.signal});
function render(time) {
  frame = 0;
  const follow = last ? 1 - Math.exp(-Math.min(64,time-last)/55) : 1; last = time;
  let moving = false;
  stories.forEach(item => {
    const target = item === traitsStory ? traitCursor / 7 : reduced.matches ? 1 : clamp((scrollY-item.start) / Math.max(1,item.travel));
    item.progress = item === traitsStory ? target : item.progress + (target-item.progress) * follow;
    if (Math.abs(item.progress-target)<.0005) item.progress = target; else moving = true;
    item.section.dataset.progress = item.progress.toFixed(4);
  });
  const compositionPhase = traitFlow || traitCursor >= 4 ? 1 : 0;
  composition.progress = traitFlow ? 1 : clamp((traitCursor - 4) / 3);
  composition.section.dataset.progress = composition.progress.toFixed(4);
  traitsStory.section.dataset.inputProgress = traitCursor.toFixed(4);
  traitsStory.section.style.setProperty('--composition-phase',compositionPhase);
  traitsStory.section.querySelector('.plant-traits-stage').setAttribute('aria-hidden',String(!traitFlow && compositionPhase === 1));
  composition.section.setAttribute('aria-hidden',String(!traitFlow && compositionPhase === 0));
  const researchP = smoothstep(.08,.88,research.progress);
  research.section.style.setProperty('--research-progress',researchP);
  if (innerHeight > 560) {
    const {height:rh,ratio,photoTop,smallWidth,largeWidth} = researchGeometry;
    const mainWidth = largeWidth + (smallWidth-largeWidth)*researchP;
    const secondTop = photoTop + mainWidth/ratio + 24;
    const secondaryWidth = Math.min(smallWidth,Math.max(0,(rh-secondTop-24)*ratio));
    research.section.querySelector('.plant-research-main').style.cssText = `top:${photoTop}px;width:${mainWidth}px`;
    research.section.querySelectorAll('.plant-research-secondary').forEach(photo => { photo.style.cssText = `top:${secondTop}px;width:${secondaryWidth}px;opacity:${researchP};transform:none`; });
  }
  traitArticles.forEach((article,index) => {
    const active = traitFlow || index === Math.min(3,Math.floor(traitCursor));
    article.classList.toggle('is-active',active);
    article.setAttribute('aria-hidden',String(!active));
    article.querySelector('.plant-trait-copy').setAttribute('aria-hidden',String(!active));
  });
  dataRows.forEach((row,index) => {
    const reveal = traitFlow ? 1 : smoothstep(0,.65,traitCursor - 4 - index);
    row.style.cssText = `opacity:${reveal};transform:translateY(${12*(1-reveal)}px);filter:blur(${4*(1-reveal)}px);clip-path:inset(${12*(1-reveal)}% 0 0)`;
    row.setAttribute('aria-hidden',String(reveal === 0));
    const value = row.querySelector('dd');
    value.textContent = value.dataset.final;
    row.dataset.reveal = reveal.toFixed(3);
  });
  plantScene?.setProgress(0);
  if(moving) frame=requestAnimationFrame(render); else last=0;
}
function schedule(){if(!frame)frame=requestAnimationFrame(render);}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',measure);
reduced.addEventListener('change',measure);
measure();
function goToPlantChapter() {
  const target = document.getElementById(location.hash.slice(1));
  if (target === composition.section) traitCursor = 4;
  else if (target === traitsStory.section) traitCursor = 0;
  if (target?.dataset.chapterScroll) window.scrollTo({top:Number(target.dataset.chapterScroll),behavior:'instant'});
  schedule();
}
window.addEventListener('hashchange',goToPlantChapter);
document.addEventListener('click',event=>{
  const link = event.target.closest('.chapter-navigation a');
  if (link?.hash === location.hash) { event.preventDefault(); goToPlantChapter(); }
});
document.fonts.ready.then(()=>{measure();goToPlantChapter();});
const observer=new ResizeObserver(measure);
observer.observe(landSection);
chapters.forEach(section=>observer.observe(section));
stories.forEach(item=>observer.observe(item.stage));
window.addEventListener('pagehide',event=>{if(event.persisted)return;stopContent.forEach(stop=>stop());traitInput.abort();observer.disconnect();modelObserver.disconnect();plantScene?.destroy();cancelAnimationFrame(frame);},{once:true});
