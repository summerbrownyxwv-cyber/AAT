import { renderProductHero, mountProductHero } from './product-hero.js';
import { productSeries, productSeriesIntro } from '../content/products-data.js';

const escape = value => String(value ?? '').replace(/[&<>\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
const wrap = (index, length) => (index % length + length) % length;
const slotFor = (index, current, length) => wrap(index - current + Math.floor(length / 2), length) - Math.floor(length / 2);

export function renderShowcase() {
  return `${renderProductHero()}
  <section class="products-intro cream" id="products-intro" data-products-intro aria-labelledby="products-intro-title">
    <figure class="products-intro-film"><video src="../assets/products/products-film.mp4" poster="../assets/products/products-film-poster.webp" preload="metadata" autoplay muted playsinline loop aria-label="艾艾贴产品介绍视频"></video></figure>
    <div class="products-intro-copy"><h2 id="products-intro-title">产品系列</h2><p>${escape(productSeriesIntro)}</p></div>
  </section>
  <section class="products-series" id="products-series" data-products-series aria-label="燃萃温植产品系列" aria-roledescription="轮播" tabindex="0" style="--series-color:${escape(productSeries[0].color)}">
    <div class="products-series-headings">${productSeries.map((series, index) => `<h2 class="products-series-heading${index === 0 ? ' is-active' : ''}" data-series-heading="${index}" aria-hidden="${index !== 0}">「${escape(series.name)}」</h2>`).join('')}</div>
    <div class="products-series-viewport"><div class="products-series-track">${productSeries.map((series, index) => `<button type="button" class="products-series-slide" data-series-slide="${index}" aria-label="查看${escape(series.name)}系列" aria-pressed="${index === 0}"><img src="${escape(series.image)}" alt="艾艾贴${escape(series.name)}系列产品" loading="eager" draggable="false"></button>`).join('')}</div></div>
    <div class="products-series-descriptions">${productSeries.map((series, index) => `<p class="products-series-description${index === 0 ? ' is-active' : ''}" data-series-description="${index}" aria-hidden="${index !== 0}">${escape(series.description)}</p>`).join('')}</div>
    <span class="sr-only" data-carousel-status aria-live="polite" aria-atomic="true"></span>
  </section>`;
}

export function createCarouselMotion(render, reduced = () => false, bounds) {
  let position = 0, target = 0, origin = 0, velocity = 0, frame = 0, lastTime = 0, sampleTime = 0, dragging = false;
  const limit = value => Math.max(bounds?.min ?? -Infinity, Math.min(bounds?.max ?? Infinity, value));
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };
  const tick = now => {
    const dt = Math.min(.032, Math.max(.001, (now - lastTime) / 1000)); lastTime = now;
    const displacement = position - target, spring = velocity + 14 * displacement, decay = Math.exp(-14 * dt);
    position = target + (displacement + spring * dt) * decay;
    velocity = (velocity - 14 * spring * dt) * decay;
    if (position !== limit(position)) { position = limit(position); velocity = 0; }
    if (Math.abs(position - target) < .0005 && Math.abs(velocity) < .005) { position = target; velocity = 0; frame = 0; render(position); return; }
    render(position); frame = requestAnimationFrame(tick);
  };
  const settle = () => {
    stop();
    if (reduced()) { position = target; velocity = 0; render(position); return; }
    lastTime = performance.now(); frame = requestAnimationFrame(tick);
  };
  return {
    get position() { return position; },
    begin() { stop(); dragging = true; origin = position; velocity = 0; sampleTime = performance.now(); return position; },
    drag(next) {
      next = limit(next);
      const now = performance.now(), dt = Math.max(8, now - sampleTime);
      velocity = velocity * .25 + (next - position) / dt * 750;
      position = target = next; sampleTime = now; render(position);
    },
    end(minimumStep = 0) {
      if (!dragging) return; dragging = false;
      if (performance.now() - sampleTime > 90) velocity = 0;
      target = Math.round(position + Math.max(-.85, Math.min(.85, velocity * .14)));
      if (minimumStep && (target - Math.round(origin)) * minimumStep < 1) target = Math.round(origin) + minimumStep;
      target = limit(target);
      settle();
    },
    step(direction) { dragging = false; target = limit(Math.round(target) + direction); settle(); },
    refresh() { render(position); },
    dispose: stop
  };
}

export function bindCarouselInput(element, motion, distance, direction = () => 1) {
  const controller = new AbortController();
  const on = (target, type, listener, options = {}) => target.addEventListener(type, listener, { ...options, signal: controller.signal });
  let gesture, wheelTimer = 0, wheelActive = false, wheelTravel = 0, suppressClickUntil = 0;
  const finishWheel = () => { clearTimeout(wheelTimer); if (wheelActive) { wheelActive = false; motion.end(Math.abs(wheelTravel) >= 12 ? Math.sign(wheelTravel) * direction() : 0); } };
  const reset = () => {
    const pointer = gesture; gesture = null;
    element.classList.remove('is-dragging');
    if (pointer && element.hasPointerCapture?.(pointer.id)) element.releasePointerCapture(pointer.id);
  };
  on(element, 'pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) || event.target.closest('[data-carousel-prev],[data-carousel-next],[data-series-select],a,input,textarea,select')) return;
    finishWheel(); gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, type: event.pointerType, axis: null, dx: 0 };
  });
  on(element, 'pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 4) {
      if (Math.abs(dx) > Math.abs(dy) * 1.15) gesture.axis = 'x';
      else if (Math.abs(dy) > Math.abs(dx) * 1.15) gesture.axis = 'y';
      if (gesture.axis === 'x') { gesture.start = motion.begin(); element.setPointerCapture(event.pointerId); element.classList.add('is-dragging'); }
    }
    if (gesture.axis !== 'x') return;
    gesture.dx = dx;
    event.preventDefault(); motion.drag(gesture.start - dx / distance() * direction());
  }, { passive: false });
  const finishPointer = event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (gesture.axis === 'x') {
      const minimum = gesture.type === 'mouse' ? 12 : 18;
      const step = event.type === 'pointercancel' ? 0 : Math.abs(gesture.dx) >= minimum ? -Math.sign(gesture.dx) * direction() : 0;
      suppressClickUntil = Date.now() + 250; motion.end(step);
    }
    reset();
  };
  on(element, 'pointerup', finishPointer); on(element, 'pointercancel', finishPointer);
  on(element, 'lostpointercapture', event => { if (event.target === element) finishPointer(event); });
  on(element, 'click', event => {
    if (Date.now() >= suppressClickUntil) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, { capture: true });
  on(element, 'dragstart', event => event.preventDefault());
  on(element, 'wheel', event => {
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > .5;
    if (!horizontal && !event.shiftKey) return;
    const delta = (horizontal ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1);
    if (!delta) return;
    event.preventDefault();
    if (!wheelActive) { motion.begin(); wheelActive = true; wheelTravel = 0; }
    wheelTravel += delta;
    motion.drag(motion.position + delta / distance() * direction());
    clearTimeout(wheelTimer); wheelTimer = setTimeout(finishWheel, 100);
  }, { passive: false });
  on(element, 'keydown', event => {
    if (event.target.closest('input,textarea,select') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); finishWheel(); motion.step((event.key === 'ArrowRight' ? 1 : -1) * direction());
  });
  element.querySelectorAll('[data-carousel-prev],[data-carousel-next]').forEach(button => on(button, 'click', () => { finishWheel(); motion.step((button.hasAttribute('data-carousel-next') ? 1 : -1) * direction()); }));
  return () => { controller.abort(); clearTimeout(wheelTimer); reset(); motion.dispose(); };
}

export function mountShowcase(root) {
  const seriesRoot = root.querySelector('[data-products-series]');
  const controller = new AbortController(), stop = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const on = (element, type, listener) => element.addEventListener(type, listener, { signal: controller.signal });
  let seriesIndex = 0;
  const reveal = element => {
    element.getAnimations().forEach(animation => animation.cancel());
    if (!reduced.matches) element.animate([{ opacity: .65, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
  };
  const setCopy = (elements, index, animate) => elements.forEach((element, itemIndex) => {
    element.classList.toggle('is-active', itemIndex === index); element.setAttribute('aria-hidden', String(itemIndex !== index));
    if (animate && itemIndex === index) reveal(element);
  });
  const slides = [...seriesRoot.querySelectorAll('[data-series-slide]')];
  const track = seriesRoot.querySelector('.products-series-track');
  const distance = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  const motion = createCarouselMotion(position => {
    const base = Math.round(position), index = wrap(base, productSeries.length), fraction = position - base;
    slides.forEach((element, itemIndex) => {
      const slot = slotFor(itemIndex, index, productSeries.length) - fraction;
      element.style.setProperty('--slot', slot);
      element.style.opacity = Math.abs(slot) < 1 ? 1 - Math.abs(slot) * .4 : .6;
      element.style.filter = `blur(${Math.min(1, Math.abs(slot))}px)`;
      element.setAttribute('aria-pressed', String(itemIndex === index)); element.tabIndex = itemIndex === index ? 0 : -1;
      element.classList.toggle('is-active', itemIndex === index);
    });
    track.style.transform = 'none';
    if (index === seriesIndex) return;
    seriesIndex = index; seriesRoot.style.setProperty('--series-color', productSeries[index].color);
    setCopy([...seriesRoot.querySelectorAll('[data-series-heading]')], index, true);
    setCopy([...seriesRoot.querySelectorAll('[data-series-description]')], index, true);
    seriesRoot.querySelector('[data-carousel-status]').textContent = `${productSeries[index].name}系列，${index + 1}/${productSeries.length}`;
  }, () => reduced.matches);
  motion.refresh();
  let disposed = false;
  mountProductHero(root).then(cleanup => { if (disposed) cleanup(); else stop.push(cleanup); });
  stop.push(bindCarouselInput(seriesRoot, motion, distance));
  seriesRoot.querySelectorAll('[data-series-slide]').forEach(button => on(button, 'click', () => { const index = Number(button.dataset.seriesSlide); if (index !== seriesIndex) motion.step(slotFor(index, seriesIndex, productSeries.length)); }));
  return () => { disposed = true; controller.abort(); stop.forEach(cleanup => cleanup()); root.querySelectorAll('[data-series-heading],[data-series-description]').forEach(element => element.getAnimations().forEach(animation => animation.cancel())); };
}
