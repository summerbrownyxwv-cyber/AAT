import { canonicalAsset } from './asset-urls.js';
import { processIcons } from './products-process-icons.js';

const asset = '../assets/products/figma/';
const services = [
  {
    key: 'oem', title: 'OEM业务', caption: '研发服务',
    copy: '可为您提供产品设计、测试打样、专利申报、批文申报、外观设计、风格优化、人群测试等服务。',
    summary: '查看研发流程',
    phases: [['产品设计', 'design'], ['手板测试', 'test'], ['成品量产', 'production']],
    steps: [
      ['对接需求', '沟通产品设计与服务需求。', 'brief'],
      ['市场调研', '围绕产品定位开展市场调研。', 'research'],
      ['立项审核', '梳理需求，审核研发项目。', 'review'],
      ['设计打样', '开展产品、外观设计与测试打样。', 'design'],
      ['手板测试', '通过手板测试检视设计方案。', 'test'],
      ['客户确认', '沟通并确认样品方案。', 'confirm'],
      ['开模试产', '根据确认方案进入开模试产。', 'sample'],
      ['风险把控', '在生产过程中关注质量与风险。', 'risk'],
      ['客户接收', '交付产品并由客户接收。', 'handshake'],
      ['成品量产', '按确认方案进入成品生产。', 'production']
    ]
  },
  {
    key: 'odm', title: 'ODM业务', caption: '定制生产',
    copy: '可为您提供艾粉、艾叶、艾条、灸贴、艾草精油及其他植物精华提取物，和艾草纤维类纺织品等多种产品的定制生产服务。',
    summary: '查看定制流程',
    phases: [['定制方案', 'odmDesign'], ['打样修改', 'odmModify'], ['下单生产', 'odmProduction']],
    steps: [
      ['定制方案', '围绕产品需求制定生产方案。', 'odmDesign'],
      ['产品报价', '根据定制方案沟通产品报价。', 'quote'],
      ['客户确认', '确认方案与产品需求。', 'odmConfirm'],
      ['打样修改', '通过样品沟通细节并调整。', 'odmModify'],
      ['测试分析', '对样品开展测试与分析。', 'odmTest'],
      ['下单生产', '按确认的样品与方案开展生产。', 'odmProduction']
    ]
  }
];

function icon(name, className) {
  return `<svg class="${className}" viewBox="0 0 100 100" aria-hidden="true">${processIcons[name]}</svg>`;
}

function renderService(service) {
  return `<section class="cooperation-services-story cooperation-services-story-${service.key}" id="cooperation-${service.key}" aria-labelledby="cooperation-${service.key}-title">
    <div class="cooperation-services-story-lead">
      <div class="cooperation-services-copy" data-content-motion>
        <p class="cooperation-services-caption">${service.caption}</p>
        <h3 id="cooperation-${service.key}-title">${service.title}</h3>
        <p class="cooperation-services-description">${service.copy}</p>
      </div>
      <figure class="cooperation-services-illustration" aria-label="${service.caption}流程概览：${service.phases.map(([label]) => label).join('、')}">
        <ol class="cooperation-services-phases" role="list">${service.phases.map(([label, name]) => `<li>${icon(name, 'cooperation-services-phase-icon')}<span>${label}</span></li>`).join('')}</ol>
      </figure>
    </div>
    <details class="cooperation-flow-details">
      <summary><span class="cooperation-services-summary-label">${service.summary}</span><span class="cooperation-services-flow-count">${service.steps.length}个环节</span><span class="cooperation-services-toggle" aria-hidden="true"></span></summary>
      <ol class="cooperation-services-steps" role="list">${service.steps.map(([label, copy, name], index) => `<li class="cooperation-services-step">${icon(name, 'cooperation-services-step-icon')}<div><h4><span class="cooperation-services-step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${label}</h4><p>${copy}</p></div></li>`).join('')}</ol>
    </details>
  </section>`;
}

export function renderCooperationServices() {
  return `<section class="cooperation-services-content" aria-labelledby="cooperation-services-title">
    <div class="cooperation-services-shell">
      <header class="cooperation-services-header" id="cooperation-services" data-content-motion>
        <h2 id="cooperation-services-title">从研发，到生产。</h2>
        <p>选择研发服务或定制生产，了解适合您的合作流程。</p>
      </header>
      ${services.map(renderService).join('')}
      <section class="cooperation-services-quality" id="cooperation-quality" aria-labelledby="cooperation-quality-title">
        <div class="cooperation-services-quality-copy" data-content-motion>
          <h2 id="cooperation-quality-title">完善的代工服务体系</h2>
          <p>通过ISO9001、ISO14001体系认证，稳步推进GMP认证等体系，推行高质量生产管理理念</p>
          <a class="cooperation-services-apply" href="./contact.html#/production/apply">咨询生产合作<span aria-hidden="true">↗</span></a>
        </div>
        <div class="cooperation-services-certificates">
          <h3>国际认证</h3>
          <div class="cooperation-services-certificate-logos">
            <img src="${canonicalAsset(asset + '420b7.webp')}" width="95" height="88" alt="CE认证标识" loading="lazy">
            <img src="${canonicalAsset(asset + 'aa15b.webp')}" width="95" height="88" alt="SGS认证标识" loading="lazy">
            <img src="${canonicalAsset(asset + '59457.webp')}" width="95" height="88" alt="FDA认证标识" loading="lazy">
          </div>
        </div>
      </section>
    </div>
  </section>`;
}
