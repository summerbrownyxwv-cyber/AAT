import { renderCooperationServices } from './products-cooperation-services.js';

export function renderCooperation() {
  return `<section class="product-cooperation" id="manufacturing" aria-label="生产合作与代工服务">${renderCooperationServices()}</section>`;
}
