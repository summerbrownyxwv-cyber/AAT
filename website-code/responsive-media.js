import { canonicalMediaMarkup } from './asset-urls.js';
import './xunai/responsive-images.js';

export function responsiveMarkup(html) {
  html = canonicalMediaMarkup(html);
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('img').forEach(image => {
    const item = window.XunAiImages?.[image.getAttribute('src')];
    if (!item) return;
    image.width = item.width;
    image.height = item.height;
    image.srcset = item.variants.map(([src, width]) => `${src} ${width}w`).join(', ');
    const hero = !!image.closest('[data-immersive-hero],.xj-hero,.xo-hero,.xa-hero');
    image.sizes = hero ? '100vw' : '(max-width:900px) 90vw, (min-width:1920px) 856px, 50vw';
    image.src = item.variants.at(-1)[0];
    image.decoding = 'async';
    if (hero) { image.loading = 'eager'; image.fetchPriority = 'high'; }
  });
  return template.innerHTML;
}

window.XunAiDesign = { responsiveMarkup };
