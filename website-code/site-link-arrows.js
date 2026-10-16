const links = '.more-link,.contact-row,.xu-detail-link,.xu-action-link,.xs-booklet-open,.cooperation-services-apply,.xj-all,.xf-subheading>a,.xs-products-more>a';
const disclosures = '.site-disclosure>summary,.xs-service-steps>summary,.xb-disclosure>summary,.xf-certificate>summary';
const geometry = 'M2.91165 8.73495L8.73495 2.91165M8.73495 6.79385V2.91165H4.85275';

export function normalizeLinkArrows(root) {
  const targets = [...(root.matches?.(links) ? [root] : []), ...root.querySelectorAll(links)];
  for (const link of targets) {
    if (link.querySelector(':scope > .site-link-arrow')) continue;
    const original = [...link.children].find(child =>
      child.tagName === 'IMG' && !child.getAttribute('alt') ||
      child.tagName === 'SPAN' && child.getAttribute('aria-hidden') === 'true' && child.textContent.trim() === '↗'
    );
    if (!original) continue;
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('class', 'site-link-arrow');
    arrow.setAttribute('viewBox', '0 0 11.6466 11.6466');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.setAttribute('focusable', 'false');
    arrow.innerHTML = `<path d="${geometry}" fill="none" stroke="currentColor" stroke-width="1.05878" stroke-linecap="round" stroke-linejoin="round"/>`;
    link.classList.add('site-link-arrow-host');
    original.replaceWith(arrow);
  }
}

export function normalizeDisclosureIcons(root) {
  const targets = [...(root.matches?.(disclosures) ? [root] : []), ...root.querySelectorAll(disclosures)];
  for (const summary of targets) {
    summary.classList.add('site-disclosure-summary');
    let icon = summary.querySelector(':scope > .xu-toggle-icon');
    if (!icon) {
      const original = [...summary.children].find(child =>
        child.tagName === 'IMG' && child.getAttribute('src')?.endsWith('/imgGroup20.svg') ||
        child.tagName.toLowerCase() === 'svg' && child.querySelector('.xf-plus-vertical')
      );
      icon = document.createElement('span');
      icon.setAttribute('class', 'xu-toggle-icon');
      icon.setAttribute('aria-hidden', 'true');
      if (original) original.replaceWith(icon); else summary.append(icon);
    }
    icon.classList.add('site-disclosure-toggle');
  }
}

normalizeLinkArrows(document);
normalizeDisclosureIcons(document);
const observer = new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType === 1 && !node.matches('.site-link-arrow,.site-disclosure-toggle')) {
      normalizeLinkArrows(node);
      normalizeDisclosureIcons(node);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('pagehide', event => { if (!event.persisted) observer.disconnect(); });
