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
  let scene, frame = 0, active = 0, visible = false, lastTime = 0, rotation = 0;
  const draw = index => {
    active = index;
    scene?.setProgress(index);
    fallback.src = products[index].image;
    fallback.alt = products[index].label;
    hero.querySelector('#product-canvas').setAttribute('aria-label', `${products[index].label}${scene ? '三维模型' : '产品图片'}`);
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    series.textContent = buttons[index].dataset.series;
  };
  const tick = now => {
    frame = 0;
    if (!lastTime || now - lastTime >= 32) {
      if (lastTime) rotation = (rotation + Math.min(64, now - lastTime) * Math.PI / 18000) % (Math.PI * 2);
      lastTime = now;
      scene.setRotation(rotation);
      stage.style.setProperty('--orbit-angle', `${rotation * 180 / Math.PI}deg`);
    }
    frame = requestAnimationFrame(tick);
  };
  const updateMotion = () => {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (reduced.matches) {
      rotation = 0;
      scene?.setRotation(0);
      stage.style.setProperty('--orbit-angle', '0deg');
    }
    if (scene && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => draw(index), {signal:abort.signal}));
  document.addEventListener('visibilitychange', updateMotion, {signal:abort.signal});
  reduced.addEventListener('change', updateMotion, {signal:abort.signal});
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateMotion(); });
  observer.observe(hero);
  draw(0);
  try {
    scene = await createProductScene(hero.querySelector('#product-canvas'));
    draw(active); updateMotion();
  } catch { /* The existing product image remains available without WebGL. */ }
  return () => { abort.abort(); observer.disconnect(); cancelAnimationFrame(frame); scene?.destroy(); };
}
