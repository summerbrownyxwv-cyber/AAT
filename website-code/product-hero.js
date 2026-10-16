import { createProductScene, products } from './product-scene.js';

export function renderProductHero() {
  return `    <section id="products-hero" class="model-hero" aria-label="五款明星产品">
      <div class="model-hero-viewport">
        <div class="hero-layout shell">
          <div class="hero-brand-copy"><h1>从蕲春艾草，到日常养护</h1></div>
          <div class="product-menu">
            <p class="product-kicker">明星产品</p>
            <div class="product-options" aria-label="选择明星产品">
              <button type="button" data-product-index="0" data-series="艾艾贴-温系列" class="is-active" aria-pressed="true">精华帖</button>
              <button type="button" data-product-index="1" data-series="艾艾贴-温系列" aria-pressed="false">艾灸器</button>
              <button type="button" data-product-index="2" data-series="艾艾贴-萃系列" aria-pressed="false">艾草纯露</button>
              <button type="button" data-product-index="3" data-series="艾艾贴-萃系列" aria-pressed="false">艾草精油</button>
              <button type="button" data-product-index="4" data-series="艾艾贴-燃系列" aria-pressed="false">艾条</button>
            </div>
          </div>
          <div class="product-stage">
            <img class="product-orbit" src="../assets/homepage/ca8d4.svg" alt="" aria-hidden="true">
            <div id="product-canvas" role="img" aria-label="精华帖三维模型"><img class="product-fallback" src="../assets/models/five-petal-front.webp" alt="精华帖" width="1024" height="1024"></div>
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
  const stage = hero.querySelector('.product-stage');
  const buttons = [...hero.querySelectorAll('[data-product-index]')];
  const series = hero.querySelector('#product-series');
  const fallback = hero.querySelector('.product-fallback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  let scene, progress = 0, active = -1;
  const draw = value => {
    progress = value;
    scene?.setProgress(progress);
    stage.style.setProperty('--orbit-angle', `${reduced.matches ? 0 : progress % 1 * 360}deg`);
    const index = Math.min(products.length - 1, Math.floor(progress));
    if (index === active) return;
    active = index;
    fallback.src = products[index].image;
    fallback.alt = products[index].label;
    hero.querySelector('#product-canvas').setAttribute('aria-label', `${products[index].label}${scene ? '三维模型' : '产品图片'}`);
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    series.textContent = buttons[index].dataset.series;
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => draw(index), {signal:abort.signal}));
  stage.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = (horizontal ? event.deltaX : event.deltaY)
      * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? horizontal ? stage.clientWidth : stage.clientHeight : 1);
    const next = Math.max(0, Math.min(4.98, progress + delta / 240));
    if (!delta || next === progress) return;
    event.preventDefault();
    draw(next);
  }, {passive:false,signal:abort.signal});
  reduced.addEventListener('change', () => draw(progress), {signal:abort.signal});
  draw(0);
  try {
    scene = await createProductScene(hero.querySelector('#product-canvas'));
    draw(progress);
  } catch { /* The existing product image remains available without WebGL. */ }
  return () => { abort.abort(); scene?.destroy(); };
}
