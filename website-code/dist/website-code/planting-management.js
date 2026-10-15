import { mountContentMotion } from './content-motion.js';

const management = [
  ['科学栽培', 'e252d.webp', '规范行距的艾草种植基地', '从播种开始，按照一定的行距和株距将艾苗种根单根纵排沟底，确保每一株艾草都能得到充足的阳光照射和养分吸收。', [['垄栽', '30~40cm'], ['种植间距', '10cm'], ['亩用根状茎重量', '40~50kg']]],
  ['精细管理', '33058.webp', '艾草田间精细管理', '在整个生长期，艾艾贴坚持使用有机肥料、科学追肥、灌溉，同时减少化学农药的使用，致力于绿色无公害栽培。此外，通过定期的田间管理和病虫害防治，确保艾草能够在自然环境中茁壮成长。', [['灌溉水PH值', '5.5~8.5'], ['人工除草，适当深锄', '10cm'], ['人工施肥，追苗施肥用量', '每亩6~8kg']]],
  ['适时采收', '33694.webp', '艾草适时采收', '在端午节前后，当艾草中的有效成分达到顶峰时进行人工收割。收割后，采用自然阴干的方式进行初步处理，最大程度保留艾草药性，再通过人工净选去除不合格艾叶，按批次进行封仓陈化。', [['采收要求留兜高', '&lt; 10cm'], ['艾叶水份', '≤14%']]]
];

export function renderPlantingManagement(image) {
  return `<section id="management" class="plant-management plant-shell"><h2>规范管理</h2><div class="plant-management-grid" data-active="0">${management.map(([title, photo, alt, copy, data], index) => `<article class="${index === 0 ? 'plant-cultivation is-active' : ''}"><button type="button" class="plant-management-choice" aria-expanded="${index === 0}" aria-controls="plant-management-detail-${index}"><figure>${image(photo, alt)}</figure><h3>${title}</h3></button><div id="plant-management-detail-${index}" class="plant-management-detail"${index === 0 ? '' : ' hidden'}><p>${copy}</p><dl>${data.map(([label, value]) => `<div><dt>${label}</dt><dd data-count="${value}">${value}</dd></div>`).join('')}</dl></div></article>`).join('')}</div></section>`;
}

export function mountPlantingManagement(root) {
  const grid = root.querySelector('.plant-management-grid');
  const articles = [...grid.children];
  let measuredWidth = 0, swapTimer = 0, destroyed = false;
  const reserveHeight = (force = false) => {
    const width = grid.getBoundingClientRect().width;
    if (!width || (!force && Math.abs(width - measuredWidth) < .5)) return;
    measuredWidth = width;
    const clone = grid.cloneNode(true);
    clone.classList.add('plant-management-measure');
    clone.classList.remove('is-switching');
    clone.style.width = `${width}px`;
    clone.style.removeProperty('--management-grid-height');
    clone.setAttribute('aria-hidden', 'true'); clone.inert = true;
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    clone.querySelectorAll('[data-count]').forEach(element => { element.textContent = element.dataset.count; });
    root.append(clone);
    let height = 0;
    [...clone.children].forEach((selected, index) => {
      clone.dataset.active = index;
      [...clone.children].forEach(article => {
        const active = article === selected;
        article.classList.toggle('is-active', active);
        article.classList.toggle('plant-cultivation', active);
        article.querySelector('.plant-management-detail').hidden = !active;
      });
      height = Math.max(height, clone.getBoundingClientRect().height);
    });
    clone.remove();
    grid.style.setProperty('--management-grid-height', `${Math.ceil(height)}px`);
  };
  reserveHeight();
  const sizeObserver = new ResizeObserver(() => reserveHeight());
  sizeObserver.observe(grid);
  document.fonts.ready.then(() => { if (!destroyed) reserveHeight(true); });
  let stopDetail = mountContentMotion(articles[0].querySelector('.plant-management-detail'));
  const stopChoices = articles.map(article => mountContentMotion(article.querySelector('button')));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
  }), { threshold: .14, rootMargin: '0px 0px -10% 0px' });
  const revealRows = panel => panel.querySelectorAll('dl>div').forEach((row, index) => {
    row.classList.add('content-reveal-copy');
    row.style.setProperty('--reveal-delay', `${index * 55}ms`);
    if (reduce.matches) row.classList.add('is-revealed'); else observer.observe(row);
  });
  revealRows(articles[0].querySelector('.plant-management-detail'));
  const finish = () => {
    clearTimeout(swapTimer);
    if (!grid.classList.contains('is-switching')) return;
    grid.classList.remove('is-switching');
    const panel = articles[Number(grid.dataset.active)].querySelector('.plant-management-detail');
    stopDetail = mountContentMotion(panel);
    revealRows(panel);
    root.dispatchEvent(new Event('plant-management-settled'));
  };
  const settled = event => { if (event.target === grid && event.propertyName === 'grid-template-columns') finish(); };
  const select = event => {
    const button = event.target.closest('.plant-management-choice');
    if (!button || grid.dataset.active === String(articles.indexOf(button.parentElement))) return;
    clearTimeout(swapTimer);
    stopDetail();
    grid.classList.add('is-switching');
    articles.forEach((article, index) => {
      const active = article === button.parentElement;
      article.classList.toggle('is-active', active);
      article.classList.toggle('plant-cultivation', active);
      article.querySelector('button').setAttribute('aria-expanded', String(active));
      const panel = article.querySelector('.plant-management-detail');
      panel.hidden = !active;
      if (active) {
        grid.dataset.active = index;
        panel.querySelectorAll('[data-count]').forEach(counter => delete counter.dataset.counterDone);
        panel.querySelectorAll('.content-reveal-copy').forEach(copy => copy.classList.remove('is-revealed'));
      }
    });
    if (reduce.matches || innerWidth <= 900) finish();
    else swapTimer = setTimeout(finish, 800);
  };
  grid.addEventListener('click', select);
  grid.addEventListener('transitionend', settled);
  reduce.addEventListener('change', finish);
  return () => { destroyed = true; clearTimeout(swapTimer); grid.removeEventListener('click', select); grid.removeEventListener('transitionend', settled); reduce.removeEventListener('change', finish); sizeObserver.disconnect(); observer.disconnect(); stopDetail(); stopChoices.forEach(stop => stop()); };
}
