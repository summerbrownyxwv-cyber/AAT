const header = document.querySelector('header.site-navigation');
const menu = header.querySelector('.menu-toggle');
const nav = header.querySelector('nav');
const mobile = matchMedia('(max-width:1023.98px)');
const reduce = matchMedia('(prefers-reduced-motion:reduce)');
const drawer = document.createElement('dialog');
drawer.id = 'site-navigation-drawer';
drawer.className = 'site-drawer';
drawer.setAttribute('aria-label', '全站导航');
drawer.innerHTML = '<div class="site-drawer-head"><p>MENU / 全站导航</p><button class="site-drawer-close" type="button" aria-label="关闭菜单">×</button></div><nav class="site-drawer-links" aria-label="主导航"></nav>';
for (const link of nav.querySelectorAll('a')) drawer.querySelector('nav').append(link.cloneNode(true));
document.body.append(drawer);
menu.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span>';
menu.setAttribute('aria-label', '打开菜单');
menu.setAttribute('aria-controls', drawer.id);
let overflow = '', closing = false;
function close(animate = true) {
  if (!drawer.open || closing) return;
  closing = true;
  const finish = () => { drawer.close(); document.body.style.overflow = overflow; menu.setAttribute('aria-expanded', 'false'); closing = false; };
  if (!animate || reduce.matches) { finish(); return; }
  const style = getComputedStyle(drawer);
  drawer.animate([{opacity:style.opacity,transform:style.transform},{opacity:0,transform:'translateX(100%)'}],{duration:400,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish = finish;
}
menu.addEventListener('click', () => {
  if (!mobile.matches || drawer.open) return;
  overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  drawer.showModal();
  drawer.querySelector('.site-drawer-close').focus();
  menu.setAttribute('aria-expanded', 'true');
});
drawer.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const targets = [...drawer.querySelectorAll('button,a[href]')];
  if (event.shiftKey && document.activeElement === targets[0]) { event.preventDefault(); targets.at(-1).focus(); }
  else if (!event.shiftKey && document.activeElement === targets.at(-1)) { event.preventDefault(); targets[0].focus(); }
});
drawer.querySelector('.site-drawer-close').addEventListener('click', () => close());
drawer.querySelector('nav').addEventListener('click', event => { if (event.target.closest('a')) close(false); });
drawer.addEventListener('cancel', event => { event.preventDefault(); close(); });
mobile.addEventListener('change', () => { if (!mobile.matches) close(false); });
