import { responsiveMarkup } from './responsive-media.js';
import { mountContentMotion } from './content-motion.js';
const main = document.querySelector('#main-content');
const page = document.body.dataset.importPage;
const stores = ['/stores/standard', '/stores/black-gold', '/stores/services', '/stores/standard/detail', '/stores/black-gold/detail', '/franchise'];
const contacts = ['/about/culture', '/about/news', '/about/join', '/about/careers', '/about/business', '/about/overseas', '/franchise/apply', '/production/apply'];
let rendered = '', revision = 0, unmount = () => {}, stopMotion = () => {};
function routeLinks() {
  main.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#/stores/')) link.href = './service.html' + href;
    else if (href === '#/franchise') link.href = './service.html#/franchise';
    else if (href === '#/franchise/apply' || href === '#/production/apply') link.href = './contact.html' + href;
    else if (href.startsWith('#/about/')) link.href = './contact.html' + href;
    else if (href === '#/ai') link.href = './ai.html';
    else if (/^https:\/\/(www\.)?aiaitie\.com\/?$/.test(href)) {
      link.href = './products.html'; link.removeAttribute('target');
      link.setAttribute('aria-label', link.textContent.trim() || '查看艾艾贴产品');
    }
  });
}
async function load(route) {
  if (page === 'ai') {
    await import('./xunai/ai-orbit.js'); await import('./xunai/ai-page.js');
    return { render: () => window.XunAiAI.render(), mount: () => window.XunAiAI.mount(main) };
  }
  if (route.startsWith('/stores/')) {
    await import('./xunai/store-tools.js'); await import('./xunai/stores-page.js');
    return { render: () => window.XunAiStores.render(route), mount: () => window.XunAiStores.mount(main, route) };
  }
  if (route.startsWith('/franchise') || route === '/production/apply') await import('./xunai/franchise-page.js');
  else await import('./xunai/about-page.js');
  const adapter = await import('./business-content.js');
  return { render: () => adapter.renderBusinessContent(page, route), mount: () => adapter.mountBusinessContent(main, page, route) };
}
async function render() {
  const [hashRoute, explicitAnchor] = location.hash.slice(1).split('?anchor=');
  const permitted = page === 'service' ? stores : page === 'contact' ? contacts : ['/ai'];
  const route = permitted.includes(hashRoute) ? hashRoute : page === 'service' ? stores[0] : page === 'contact' ? contacts[0] : '/ai';
  const anchor = explicitAnchor || ({ '/about/news': 'news', '/about/join': 'join' })[hashRoute] || (!hashRoute.startsWith('/') && hashRoute);
  const current = ++revision;
  const cooperation = document.querySelector('#service-cooperation');
  if (cooperation) cooperation.hidden = route === '/franchise';
  if (route !== rendered) {
    const module = await load(route);
    if (current !== revision) return;
    unmount(); stopMotion(); main.innerHTML = responsiveMarkup(module.render());
    unmount = module.mount() || (() => {}); routeLinks(); stopMotion = mountContentMotion(main); rendered = route;
  }
  if (anchor) document.getElementById(decodeURIComponent(anchor))?.scrollIntoView({ behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', render);
window.addEventListener('pagehide', () => { unmount(); stopMotion(); });
render();
