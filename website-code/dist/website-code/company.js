import { responsiveMarkup } from './responsive-media.js';
import './xunai/brand-figma.js';
import { initCompanyHonors } from './company-honors.js';
import { mountSectionCover } from './section-cover.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const brandContent = document.querySelector('#company-brand-content');
if (brandContent && window.XunAiFigmaBrand) {
  brandContent.innerHTML = responsiveMarkup(window.XunAiFigmaBrand.render());
  brandContent.querySelector('.xf-group')?.remove();
  brandContent.querySelector('#stores > .xf-heading p').textContent = '艾艾贴终端业务';
  brandContent.querySelector('#stores > .xf-subheading h3').textContent = '寻艾艾灸馆';
  brandContent.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#/stores/')) link.href = './service.html' + href;
    else if (href === 'https://www.aiaitie.com') { link.href = './products.html'; link.removeAttribute('target'); }
  });
  const stopBrand = window.XunAiFigmaBrand.mount(brandContent);
  const brandReveal = element => {
    if (element.tagName !== 'IMG' || element.complete && element.naturalWidth) element.classList.add('is-revealed');
  };
  const brandObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    brandReveal(entry.target);
    if (entry.target.classList.contains('is-revealed')) brandObserver.unobserve(entry.target);
  }), { threshold: .08 });
  brandContent.querySelectorAll('.xf-brand img, .xf-brand h2, .xf-brand h3, .xf-brand p, .xf-brand figcaption').forEach(element => {
    if (!element.matches('.xf-stage-cover img,.xf-stage-content>img')) {
      element.classList.add('company-brand-reveal');
      brandObserver.observe(element);
      if (element.tagName === 'IMG') element.addEventListener('load', () => { brandObserver.unobserve(element); brandObserver.observe(element); });
    }
  });
  brandContent.addEventListener('company-brand-change', event => {
    event.detail?.querySelectorAll('img,h3,p,h4')?.forEach(element => { element.classList.remove('is-revealed'); brandObserver.unobserve(element); brandObserver.observe(element); });
  });
  window.addEventListener('pagehide', event => { if(event.persisted)return;stopBrand?.();brandObserver.disconnect(); });
  if (location.hash) {
    const anchor = document.getElementById(location.hash.slice(1));
    if (anchor && brandContent.contains(anchor)) anchor.scrollIntoView({ behavior:'instant' });
  }
}
const mediaObserver = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => target.classList.toggle('is-revealed', isIntersecting && target.complete && target.naturalWidth > 0));
}, { threshold: .08 });
document.querySelectorAll('.company-media').forEach(image => {
  mediaObserver.observe(image);
  image.addEventListener('load', () => {
    mediaObserver.unobserve(image);
    mediaObserver.observe(image);
  });
});
document.documentElement.classList.add('company-motion-ready');

const stopHonors = initCompanyHonors(container => {
  container.querySelectorAll('.company-media').forEach(image => {
    image.classList.remove('is-revealed');
    mediaObserver.unobserve(image);
    mediaObserver.observe(image);
  });
});
const companyMain = document.querySelector('#main');
companyMain.classList.add('company-cover-main');
// The introduction, business and history read in normal flow; covering starts at products.
const stopCover = mountSectionCover([...companyMain.querySelectorAll('#company-brand-content .xf-brand>.xf-section:not(#business),:scope>.honor-section,:scope>.action-section')]);
window.addEventListener('pagehide', event => { if (!event.persisted) { stopHonors(); stopCover(); } }, { once:true });

const heroVideo = document.querySelector('.company-hero-video');
let videoInView = true;
function syncHeroVideo() {
  if (!videoInView || document.hidden) heroVideo.pause();
  else heroVideo.play().catch(() => {});
}
new IntersectionObserver(entries => {
  videoInView = entries[0].isIntersecting;
  syncHeroVideo();
}, { threshold: .01 }).observe(heroVideo);
document.addEventListener('visibilitychange', syncHeroVideo);
syncHeroVideo();

function animateStats() {
  document.querySelectorAll('.action-stats b').forEach(element => {
    if (element.dataset.done || reduceMotion.matches) return;
    const final = element.textContent.trim();
    const number = Number(final.replace(/\D/g, ''));
    if (!Number.isFinite(number)) return;
    element.dataset.done = 'true';
    const start = performance.now();
    const duration = 1300;
    const tick = now => {
      const progress = clamp((now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(number * eased).toLocaleString('zh-CN');
      if (progress < 1) requestAnimationFrame(tick); else element.textContent = final;
    };
    requestAnimationFrame(tick);
  });
}
const stats = document.querySelector('.action-stats');
if (stats) new IntersectionObserver(entries => entries[0].isIntersecting && animateStats(), { threshold: .4 }).observe(stats);

if (reduceMotion.matches) document.documentElement.classList.add('reduce-motion');
