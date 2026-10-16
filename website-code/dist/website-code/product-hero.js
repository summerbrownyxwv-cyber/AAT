import { createProductScene } from './product-scene.js';

export const modelProgress = (scroll, top, height, stageHeight) =>
  Math.max(0, Math.min(1, (scroll - top) / Math.max(1, height - stageHeight))) * 4.98;

export function renderProductHero() {
  return `    <section id="products-hero" class="model-hero" aria-label="五款明星产品">
      <div class="model-hero-viewport">
        <div class="hero-layout shell">
          <div class="hero-brand-copy"><h1>从蕲春艾草，到日常养护</h1></div>
          <div class="product-menu">
            <p class="product-kicker">明星产品</p>
            <div class="product-options" aria-label="选择明星产品">
              <button data-product-index="0" data-series="艾艾贴-温系列" class="is-active" aria-pressed="true">精华帖</button>
              <button data-product-index="1" data-series="艾艾贴-温系列" aria-pressed="false">艾灸器</button>
              <button data-product-index="2" data-series="艾艾贴-萃系列" aria-pressed="false">艾草纯露</button>
              <button data-product-index="3" data-series="艾艾贴-萃系列" aria-pressed="false">艾草精油</button>
              <button data-product-index="4" data-series="艾艾贴-燃系列" aria-pressed="false">艾条</button>
            </div>
          </div>
          <div class="product-stage">
            <img class="product-orbit" src="../assets/homepage/ca8d4.svg" alt="" aria-hidden="true">
            <div id="product-canvas" role="img" aria-label="精华帖三维模型"></div>
          </div>
          <p id="product-series" class="product-series" aria-live="polite">艾艾贴-温系列</p>
        </div>
        <img class="hero-rule shell-rule" src="../assets/homepage/dc60b.svg" alt="">
      </div>
    </section>
`;
}

export async function mountProductHero(root) {
  const hero = root.querySelector('#products-hero');
  const stage = hero.querySelector('.model-hero-viewport');
  const buttons = [...hero.querySelectorAll('[data-product-index]')];
  const series = hero.querySelector('#product-series');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = await createProductScene(hero.querySelector('#product-canvas'));
  const abort = new AbortController();
  let frame = 0, active = -1;
  const draw = progress => {
    scene.setProgress(progress);
    hero.querySelector('.product-stage').style.setProperty('--orbit-angle', `${progress % 1 * 360}deg`);
    const index = Math.min(4, Math.floor(progress));
    if (index === active) return;
    active = index;
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    series.textContent = buttons[index].dataset.series;
  };
  const update = () => {
    frame = 0;
    if (reduced.matches) return;
    const start = hero.getBoundingClientRect().top + scrollY - (Number(getComputedStyle(stage).top.replace('px','')) || 0);
    draw(modelProgress(scrollY, start, hero.offsetHeight, stage.offsetHeight));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    if (reduced.matches) { draw(index); return; }
    const top = hero.getBoundingClientRect().top + scrollY - (Number(getComputedStyle(stage).top.replace('px','')) || 0);
    window.scrollTo({ top: top + (index ? index + .05 : 0) / 4.98 * (hero.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    schedule();
  }, {signal:abort.signal}));
  window.addEventListener('scroll', schedule, {passive:true,signal:abort.signal});
  window.addEventListener('resize', schedule, {signal:abort.signal});
  reduced.addEventListener('change', schedule, {signal:abort.signal});
  draw(0); schedule();
  return () => { abort.abort(); cancelAnimationFrame(frame); scene.destroy(); };
}
