import { productGroups } from '../content/products-data.js';
import { renderShowcase, mountShowcase, bindCarouselInput, createCarouselMotion } from './products-showcase.js';
import { mountContentMotion } from './content-motion.js';
import { mountCatalog } from './products-catalog-motion.js';
import { renderCooperation, mountCooperation } from './products-cooperation.js';

const main = document.querySelector('#main-content');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const wrap = (index, length) => (index % length + length) % length;
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const style = properties => Object.entries(properties).map(([key, value]) => `${key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())}:${value}`).join(';');

function renderCard(product, slot, step) {
  return `<button class="product-detail-card" type="button" data-product-step="${step}" tabindex="-1" aria-label="查看${escape(product.name)}"${slot < 0 ? ' aria-hidden="true"' : ''}>${product.layers.map(layer => `<div class="product-card-layer" style="left:${layer.left / 405 * 100}%;top:${layer.top / 520 * 100}%;width:${layer.width / 405 * 100}%;height:${layer.height / 520 * 100}%"><img src="${layer.src}" alt="${slot === 0 ? escape(product.name) : ''}" loading="lazy" draggable="false" style="${style(layer.imageStyle || {width:'100%',height:'100%',objectFit:'contain',left:0,top:0})}"></div>`).join('')}</button>`;
}
function renderTrack(group, index = 0) {
  return [-1, 0, 1, 2, 3, 4, 5].map(slot => {
    let step = wrap(slot, group.products.length);
    if (step > group.products.length / 2) step -= group.products.length;
    return renderCard(group.products[wrap(index + slot, group.products.length)], slot, step);
  }).join('');
}
function renderCatalog() {
  return `<div class="product-catalog" id="product-catalog"><div class="product-catalog-stage" tabindex="-1" aria-label="燃、萃、温、植系列产品">${productGroups.map(group => `<section class="product-group" id="products-${group.key}" data-product-group="${group.key}" data-product-index="0" style="--product-color:${group.color}" aria-labelledby="products-${group.key}-title"><div class="product-group-sheet"><header class="product-group-heading page-shell"><h2 id="products-${group.key}-title">${group.title}</h2><span>${group.index}</span></header><div class="product-group-layout"><div class="product-detail-copy" aria-live="polite" aria-atomic="true">${group.products.map((product,index)=>`<div class="product-copy-item${index===0?' is-active':''}" aria-hidden="${index!==0}"><h3>${product.name}</h3><p>${product.description}</p></div>`).join('')}</div><div class="product-detail-gallery" tabindex="0" role="region" aria-roledescription="轮播" aria-label="${group.title}，可拖动、点击相邻产品或使用左右方向键切换"><div class="product-detail-track">${renderTrack(group)}</div><output class="sr-only" aria-label="当前产品" aria-live="polite" aria-atomic="true">1 / ${group.products.length}</output></div></div></div></section>`).join('')}</div></div>`;
}
main.innerHTML = renderShowcase() + renderCatalog() + renderCooperation();
const cleanups = [mountShowcase(main), mountCatalog(main), mountCooperation(main)];
main.querySelectorAll('[data-content-motion],[data-products-intro]').forEach(root => cleanups.push(mountContentMotion(root)));

main.querySelectorAll('[data-product-group]').forEach(section => {
  const group = productGroups.find(item => item.key === section.dataset.productGroup);
  const gallery = section.querySelector('.product-detail-gallery'), track = gallery.querySelector('.product-detail-track');
  const copy = section.querySelector('.product-detail-copy');
  const flowDirection = () => getComputedStyle(track).direction === 'rtl' ? -1 : 1;
  let index = 0, base = 0, copyAnimation = null;
  const loadCards = () => track.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
  const nearby = new IntersectionObserver(([entry])=>{
    if(!entry.isIntersecting)return;loadCards();nearby.disconnect();
  },{rootMargin:'600px'});
  nearby.observe(section);
  const update = next => {
    section.dataset.productIndex = String(next);
    copy.querySelectorAll('.product-copy-item').forEach((item,i)=>{
      item.classList.toggle('is-active',i===next);item.setAttribute('aria-hidden',String(i!==next));
      if(i===next)item.querySelectorAll('h3,p').forEach(element=>element.classList.add('is-revealed'));
    });
    gallery.querySelector('output').textContent = `${next + 1} / ${group.products.length}`;
    copyAnimation?.cancel();
    if (!reduce.matches) copyAnimation = copy.animate([{opacity:.65,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
  };
  const distance = () => track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
  const motion = createCarouselMotion(position => {
    const nearest = Math.round(position);
    if (nearest !== base) {
      const shift = nearest - base;
      if (Math.abs(shift) === 1) {
        if (shift > 0) {
          track.firstElementChild.remove();
          track.insertAdjacentHTML('beforeend', renderCard(group.products[wrap(nearest + 5, group.products.length)], 5, 0));
        } else {
          track.lastElementChild.remove();
          track.insertAdjacentHTML('afterbegin', renderCard(group.products[wrap(nearest - 1, group.products.length)], -1, 0));
        }
        [...track.children].forEach((card, item) => {
          const slot = item - 1;
          let step = wrap(slot, group.products.length); if (step > group.products.length / 2) step -= group.products.length;
          card.dataset.productStep = String(step); card.setAttribute('aria-hidden', String(slot < 0));
        });
      } else track.innerHTML = renderTrack(group, wrap(nearest, group.products.length));
      base = nearest; index = wrap(base, group.products.length);
      loadCards(); update(index);
    }
    track.style.transform = `translateX(${-(position - base) * flowDirection() * distance()}px)`;
  }, () => reduce.matches);
  const stopInput = bindCarouselInput(gallery, motion, distance, flowDirection);
  const selectCard = event => {
    const card = event.target.closest('[data-product-step]');
    if (card && Number(card.dataset.productStep)) motion.step(Number(card.dataset.productStep));
  };
  gallery.addEventListener('click', selectCard);
  const resize = () => motion.refresh();
  window.addEventListener('resize', resize);
  cleanups.push(() => { stopInput(); nearby.disconnect(); copyAnimation?.cancel(); gallery.removeEventListener('click', selectCard); window.removeEventListener('resize', resize); });
});

window.addEventListener('pagehide', event => { if (!event.persisted) cleanups.forEach(cleanup => cleanup?.()); });
if (location.hash && !location.hash.startsWith('#products-')) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));
