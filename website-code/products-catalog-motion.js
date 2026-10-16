import { mountSectionCover } from './section-cover.js';

export function mountCatalog(root) {
  const catalog = root.querySelector('.product-catalog');
  const panels = [...catalog.querySelectorAll('.product-group')];
  // Each incoming series covers the previous one and rests at the native sticky boundary.
  const stopCover = mountSectionCover(panels);
  const goToHash = () => {
    const index = panels.findIndex(panel => `#${panel.id}` === location.hash);
    if (index < 0) return;
    const navigation = document.querySelector('header.site-navigation').getBoundingClientRect().height;
    const top = catalog.getBoundingClientRect().top + scrollY + panels.slice(0,index).reduce((sum,panel) => sum + panel.offsetHeight,0) - navigation;
    scrollTo({top,behavior:'instant'});
  };
  const repeatHash = event => {
    const link = event.target.closest('a[href^="#products-"]');
    if (!link || link.hash !== location.hash || !panels.some(panel => `#${panel.id}` === link.hash)) return;
    event.preventDefault(); goToHash();
  };
  window.addEventListener('hashchange',goToHash);
  document.addEventListener('click',repeatHash);
  document.fonts.ready.then(goToHash);
  return () => {
    stopCover();
    window.removeEventListener('hashchange',goToHash);
    document.removeEventListener('click',repeatHash);
  };
}
