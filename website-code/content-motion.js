const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const easing = 'cubic-bezier(.22,1,.36,1)';
function formatCount(final, progress) {
  if (progress >= 1) return final;
  return final.replace(/\d[\d,]*(?:\.\d+)?/g, part => {
    const decimals = (part.split('.')[1] || '').length;
    const value = (Number(part.replaceAll(',', '')) * progress).toFixed(decimals);
    return part.includes(',') ? Number(value).toLocaleString('zh-CN', { minimumFractionDigits: decimals }) : value;
  });
}
window.XunAiMotion = {
  formatCount,
  panel(group, panels, index, previous) {
    group.dispatchEvent(new Event('xm-select'));
    if (!reduce.matches) panels[index]?.animate(
      [{ opacity: .2, transform: `translateX(${index >= previous ? 12 : -12}px)`, filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'none' }],
      { duration: 720, easing }
    );
  }
};
export function mountContentMotion(root) {
  const removers = [], frames = new Map(), observers = [];
  const on = (element, type, listener, options) => {
    element.addEventListener(type, listener, options);
    removers.push(() => element.removeEventListener(type, listener, options));
  };
  const targets = [...root.querySelectorAll('h1,h2,h3,p,img')].filter(element =>
    !element.closest('dialog,details,[role=tabpanel],.xa-stage,.xa-reports,.xs-service-card,.xj-process,.xj-gallery,.xo-news-track') &&
    !element.matches('[aria-hidden=true]') && !element.querySelector('[data-count]') &&
    !(element.tagName === 'IMG' && (!element.alt || element.src.endsWith('.svg')))
  );
  const reveal = element => {
    if (element.tagName !== 'IMG' || (element.complete && element.naturalWidth)) element.classList.add('is-revealed');
  };
  const media = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      if (entry.target.classList.contains('is-revealed')) media.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -10% 0px' });
  observers.push(media);
  targets.forEach((element, index) => {
    element.classList.add(element.tagName === 'IMG' ? 'content-reveal-media' : 'content-reveal-copy');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
    if (reduce.matches) reveal(element); else media.observe(element);
    if (element.tagName === 'IMG') on(element, 'load', () => {
      if (reduce.matches) reveal(element); else { media.unobserve(element); media.observe(element); }
    });
  });
  on(root, 'focusin', event => targets.filter(element => element.contains(event.target) || event.target.contains(element)).forEach(reveal));
  const counters = [...root.querySelectorAll('[data-count]')];
  const count = element => {
    if (element.dataset.counterDone || frames.has(element)) return;
    if (reduce.matches) { element.textContent = element.dataset.count; element.dataset.counterDone = 'true'; return; }
    const start = performance.now();
    const tick = time => {
      const progress = Math.min(1, (time - start) / 1600);
      element.textContent = formatCount(element.dataset.count, 1 - (1 - progress) ** 3);
      if (progress < 1) frames.set(element, requestAnimationFrame(tick));
      else { frames.delete(element); element.dataset.counterDone = 'true'; }
    };
    frames.set(element, requestAnimationFrame(tick));
  };
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .85) count(entry.target);
      else if (frames.has(entry.target)) {
        cancelAnimationFrame(frames.get(entry.target)); frames.delete(entry.target);
        entry.target.textContent = entry.target.dataset.count;
      }
    });
  }, { threshold: [0, .85], rootMargin: '0px 0px -15% 0px' });
  observers.push(counterObserver);
  counters.forEach(element => counterObserver.observe(element));
  root.querySelectorAll('video').forEach(video => {
    let visible = false;
    const sync = () => {
      const paused = !visible || document.hidden;
      video.muted = true;
      if (paused) video.pause(); else video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .01 });
    observers.push(observer); observer.observe(video);
    on(document, 'visibilitychange', sync);
    removers.push(() => video.pause());
  });
  on(reduce, 'change', () => {
    if (!reduce.matches) return;
    targets.forEach(reveal); frames.forEach(frame => cancelAnimationFrame(frame)); frames.clear();
    counters.forEach(element => { element.textContent = element.dataset.count; });
  });
  return () => {
    observers.forEach(observer => observer.disconnect()); frames.forEach(frame => cancelAnimationFrame(frame));
    removers.forEach(remove => remove()); targets.forEach(element => element.classList.add('is-revealed'));
  };
}
