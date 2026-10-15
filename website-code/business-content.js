import { mountFranchiseForm } from './xunai/franchise-form.js';

export function renderBusinessContent(page, route) {
  if (page === 'service' && route.startsWith('/stores/')) return window.XunAiStores.render(route);
  if (page === 'service' && route === '/franchise') {
    return window.XunAiFranchise.render(false);
  }
  if (route === '/franchise/apply' || route === '/production/apply') {
    const template = document.createElement('template');
    template.innerHTML = window.XunAiFranchise.render(true);
    template.content.querySelector('.text-link').href = './service.html#/franchise';
    if (route === '/production/apply') {
      const content = template.content;
      content.querySelector('.text-link').href = './products.html#manufacturing';
      content.querySelector('.text-link').textContent = '返回生产合作';
      content.querySelector('aside h1').textContent = '整理生产合作意向';
      content.querySelector('aside > p').innerHTML = '从一次交流开始，<br>了解产品研发与定制生产服务。';
      content.querySelector('aside img').alt = '艾草产业基地';
      content.querySelector('#apply > h2').textContent = '整理生产合作需求';
      content.querySelector('.xj-official-contact').innerHTML = '生产合作请联系严总：<a href="tel:13476850503">13476850503</a>；企业邮箱：<a href="mailto:aat@dongyuanjt.com">aat@dongyuanjt.com</a>';
    }
    return template.innerHTML;
  }
  if (['/about/careers', '/about/business', '/about/overseas'].includes(route)) {
    const template = document.createElement('template');
    template.innerHTML = window.XunAiAbout.render(route);
    template.content.querySelector('.text-link').textContent = '返回联系我们';
    return template.innerHTML;
  }
  return window.XunAiAbout.render(route);
}

export function mountBusinessContent(main, page, route) {
  if (page === 'service' && route.startsWith('/stores/')) return window.XunAiStores.mount(main, route);
  if (page === 'service' && route === '/franchise') return window.XunAiFranchise.mount(main);
  if (route === '/franchise/apply' || route === '/production/apply') return mountFranchiseForm(main, route === '/production/apply');
  if (main.querySelector('.xo-page')) return window.XunAiAbout.mount(main, route);
  return () => {};
}
