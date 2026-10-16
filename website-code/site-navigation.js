const header = document.querySelector('header.site-navigation');
const menu = header.querySelector('.menu-toggle');
const nav = header.querySelector('nav');
const mobile = matchMedia('(max-width:1023.98px)');
const reduce = matchMedia('(prefers-reduced-motion:reduce)');
const drawer = document.createElement('dialog');
drawer.id = 'site-navigation-drawer';
drawer.className = 'site-drawer';
drawer.setAttribute('aria-label', '全站导航');
drawer.innerHTML = '<div class="site-drawer-head"><p>MENU / 全站导航</p><button class="site-drawer-close" type="button" aria-label="关闭菜单">×</button></div><nav class="site-drawer-links" aria-label="主导航"></nav><div class="site-drawer-actions"><button type="button" data-site-service="consumer">官方服务</button><button type="button" data-site-service="verify">投诉通道</button></div>';
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

// Reuse the previous XunAi official-service entry points with its published contacts.
const official = document.createElement('dialog');
official.className = 'site-official-service';
official.setAttribute('aria-labelledby', 'site-official-title');
official.innerHTML = '<form method="dialog"><div class="site-drawer-head"><p>OFFICIAL / SERVICE</p><button class="site-drawer-close" value="close" aria-label="关闭服务窗口">×</button></div><h2 id="site-official-title"></h2><p class="site-official-description"></p><div class="site-official-links"><a href="tel:07133671098">服务热线：0713-3671098</a><a href="mailto:aat@dongyuanjt.com">邮件联系官方服务</a></div></form>';
document.body.append(official);
drawer.querySelector('.site-drawer-actions').addEventListener('click', event => {
  const button = event.target.closest('[data-site-service]');
  if (!button) return;
  const complaint = button.dataset.siteService === 'verify';
  official.querySelector('h2').textContent = complaint ? '官方验证 / 投诉' : '官方服务';
  official.querySelector('.site-official-description').textContent = complaint ? '请通过官方邮箱反馈门店名称、所在城市与情况说明。' : '产品及门店服务问题，可通过以下官方渠道咨询。';
  const email = official.querySelector('a[href^="mailto:"]');
  email.textContent = complaint ? '通过官方邮箱反馈' : '邮件联系官方服务';
  email.href = 'mailto:aat@dongyuanjt.com' + (complaint ? '?subject=' + encodeURIComponent('官方验证 / 投诉') : '');
  close(false);
  official.showModal();
});
official.addEventListener('close', () => menu.focus({preventScroll:true}));
