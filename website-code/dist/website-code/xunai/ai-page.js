import { mountSectionCover } from '../section-cover.js';

/* Figma 482:15. Shared navigation, fonts and footer remain unchanged. */
window.XunAiAI=(()=>{
 const base='../assets/xunai/ai/';
 const image=(file,alt,extra='')=>`<img src="${base}${file}.webp" alt="${alt}" width="900" height="900" ${extra||'loading="lazy"'}>`;
 const matrix=[
  ['细分体质','36种','从9型体质扩展到36种细分体质，匹配调理参考方案'],
  ['信息采集','5分钟','病史采集与辨证信息整理，辅助提升服务效率'],
  ['风险模型','9项','精神压力、中风、骨质疏松、脂肪肝等风险评估参考'],
  ['机器人','AI交互','集成血压、体脂等数据采集与语音交互'],
  ['案例库','千万级','自有案例数据库与产学研结合']
 ];
 const stats=[['中医临床数据','1000万+','39'],['常见疾病与慢性病数据','202种','40'],['穴位点识别','499个','41'],['中医体质辨识','9大','43'],['输出检测报告','3–10秒','44']];
 const certificates=[['4','杭州师范大学附属医院','与杭州师范大学附属医院合作完成非侵入式实验，通过两期疾病辨证临床试验'],['5','吉林大学白求恩第一医院','与吉林大学白求恩第一医院完成非侵入式实验，通过两期疾病辨证系统临床试验'],['6','互联网药品信息服务资格证书','互联网药品信息服务资格证书']];
 return {
  stage(){return `<div class="xa-stage" role="img" aria-label="寻艾 AI 中医检测设备与环形功能文字：体质检测、舌象检测、面像检测、脉象检测及经络穴位识别"><div class="xa-orbit" aria-hidden="true">${[0,1,2,3].map(layer=>`<div class="xa-orbit-layer">${window.XunAiOrbit.filter(([name])=>{const n=Number(name.replace('imgVector','')||0);return (n===189?3:n<=64||[180,182,186].includes(n)?0:n<=125||[181,185,187].includes(n)?1:2)===layer}).map(([name,x,y,w,h,r=0])=>`<img src="${base}${name}.svg" alt="" width="${w}" height="${h}" style="left:${x/617*100}%;top:${y/599*100}%;width:${w/617*100}%;height:${h/599*100}%;${r?`transform:rotate(${r}deg)`:''}">`).join('')}</div>`).join('')}</div><div class="xa-device-shadow" aria-hidden="true"></div><div class="xa-device" aria-hidden="true">${image('imgRectangle','')}</div></div>`;},
  render(){return `<div class="xa-page">
   <section class="xa-hero" aria-labelledby="xa-title">
    <div class="xa-light" aria-hidden="true"></div><div class="xa-star-trails" aria-hidden="true"><i></i><i></i><i></i></div>
    ${this.stage()}
    <div class="xa-hero-bottom"><h1 id="xa-title">AI中医师<br>辅助体质辨识与门店服务</h1><p>通过舌象、面像等信息采集，辅助体质分析与报告整理，连接门店日常养护服务。</p><nav class="xa-hero-actions" aria-label="了解AI中医师"><a href="./contact.html#/about/business">咨询设备与应用</a></nav></div>
   </section>
   <div class="xa-content">
    <section class="xa-intro" id="value"><div class="xa-intro-copy"><h2>行业先行的现代化中医养生智慧<br>让传统可进化 让体验再升级</h2><p>根据用户体质、健康状况及检测结果，提供艾灸方案参考；记录用户艾灸过程中的健康变化动态，辅助服务人员调整养生方案。</p></div><figure><video class="xa-demo-video" data-demo-video autoplay muted loop playsinline preload="none" poster="../assets/xunai/ai/ai-demo-poster.webp" width="1920" height="1080" aria-label="AI中医问诊仪操作演示，静音循环播放"><source src="../assets/xunai/ai/ai-demo.mp4" type="video/mp4">您的浏览器不支持视频播放。</video></figure></section>
    <section class="xa-matrix" id="ai-capabilities"><div class="xa-matrix-aside"><h2>能力矩阵</h2><figure class="xa-matrix-device" aria-hidden="true">${image('imgRectangle','')}</figure></div><div><dl>${matrix.map(([label,value,desc])=>`<div class="xa-matrix-row"><dt>${label}</dt><dd class="xa-number" aria-label="${value}"><span data-count="${value}" aria-hidden="true">${value}</span></dd><dd>${desc}</dd></div>`).join('')}</dl></div></section>
    <section class="xa-evidence" id="ai-evidence"><h2>合作与资质</h2><div class="xa-evidence-stage" aria-label="左右滑动切换认证"><div class="xa-arch" aria-hidden="true">${Array.from({length:121},(_,i)=>`<i style="--angle:${i*1.5-90}deg" class="${i%10===0?'major':''}"></i>`).join('')}${['春分','夏至','秋分','冬至'].map((label,i)=>`<span class="xa-season" style="--season:${i*48-72}deg"><span>${label}</span></span>`).join('')}<b class="xa-dial-pointer"></b></div>${image('device','寻艾 AI 检测设备')}</div><div class="xa-certificates" role="tablist" aria-label="认证与合作">${certificates.map(([n,title],i)=>`<button type="button" role="tab" id="xa-cert-${i}" aria-controls="xa-cert-copy" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${image('imgRectangle'+n,'')}<span>${title}</span></button>`).join('')}</div><div id="xa-cert-copy" role="tabpanel" aria-labelledby="xa-cert-0" tabindex="0"><p>${certificates[0][2]}</p></div></section>
    <section class="xa-values" id="how-it-works"><h2>寻艾AI中医师<br>核心价值</h2><div class="xa-values-layout"><div><p class="xa-value-copy">以智能舌诊和面诊为核心，辅助整理健康信息与分析报告，形成涵盖穴位、饮食、运动、情志、起居、音乐等方面的个性化健康调理参考。</p><dl class="xa-stats">${stats.map(([label,value,icon])=>`<div><dt>${label}</dt><dd aria-label="${value}"><span data-count="${value}" aria-hidden="true">${value}</span><img src="${base}imgGroup${icon}.svg" alt="" width="48" height="48" loading="lazy"></dd></div>`).join('')}</dl></div><figure>${image('device','AI 中医检测系统界面')}</figure></div></section>
    <section class="xa-reports" id="ai-reports"><h2>寻艾AI中医师<br>报告组成</h2><p class="data-source-note">以下为报告界面示例，展示各部分内容。</p><div class="xa-report-grid" tabindex="0" aria-label="报告组成，左右拖动或使用方向键浏览">${['舌诊、体质检测结果','舌诊分析','脉诊分析','健康风险评估','24节气风险分析','产品服务推荐'].map((title,i)=>`<figure>${image(i<3?'imgRectangle'+(i+1):'report-extra-'+(i-3),title+'，报告示例')}<figcaption>${title}</figcaption></figure>`).join('')}</div></section>
    <section class="xa-scenarios" id="scenarios"><header class="xa-scenario-heading"><h2>寻艾AI中医师<br>场景赋能</h2><a class="xu-detail-link" href="https://www.xun-ai.cn/home" target="_blank" rel="noopener noreferrer" aria-label="前往寻艾AI官网（新窗口打开）">寻艾AI官网<span aria-hidden="true">↗</span></a></header><div class="xa-scenario-layout"><div class="xa-scenario-photos"><figure>${image('imgRectangle8','用户在门店使用寻艾 AI 设备')}</figure><figure>${image('imgRectangle10','寻艾门店养生服务空间')}</figure></div><div class="xa-scenario-copy"><h3>真实门店营运组成体系</h3><ul><li>连锁健康门店</li><li>康养产业</li><li>居家场所</li></ul></div></div></section>
    <div id="experience" aria-hidden="true"></div>
   </div>
  </div>`},
  mount(main){
   const hero=main.querySelector('.xa-hero');if(!hero)return;
   hero.querySelector('.xa-stage').prepend(hero.querySelector('.xa-star-trails'));
   const page=main.querySelector('.xa-page');
   const stopCover=mountSectionCover([hero,...main.querySelectorAll('.xa-content > section')]);
   const reduce=matchMedia('(prefers-reduced-motion: reduce)');
   const resize=()=>page.style.setProperty('--xa-wash-height',hero.offsetHeight+main.querySelector('.xa-intro').offsetHeight+'px');
   resize();window.addEventListener('resize',resize);
   const evidence=main.querySelector('.xa-evidence'),tabs=[...evidence.querySelectorAll('[role="tab"]')],dial=evidence.querySelector('.xa-evidence-stage');
   let selected=0,swipe=null;
   const select=(index,focus=false)=>{
    selected=(index+tabs.length)%tabs.length;
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',i===selected);tab.tabIndex=i===selected?0:-1});
    const panel=evidence.querySelector('[role="tabpanel"]');
    panel.setAttribute('aria-labelledby',tabs[selected].id);panel.querySelector('p').textContent=certificates[selected][2];
    dial.style.setProperty('--dial-angle',`${(selected-1)*54}deg`);

    if(focus)tabs[selected].focus();
   };
   tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(i));
    tab.addEventListener('keydown',event=>{
     if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
     event.preventDefault();select(event.key==='Home'?0:event.key==='End'?2:selected+(event.key==='ArrowRight'?1:-1),true);
    });
   });
   dial.addEventListener('pointerdown',event=>{if(event.button!==0||!event.isPrimary)return;swipe={x:event.clientX,y:event.clientY};dial.setPointerCapture(event.pointerId)});
   dial.addEventListener('pointerup',event=>{if(!swipe)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))select(selected+(dx<0?1:-1))});
   dial.addEventListener('pointercancel',()=>swipe=null);
   dial.addEventListener('lostpointercapture',()=>swipe=null);
   select(0);
   const report=main.querySelector('.xa-report-grid');let drag=null;
   report.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0||!event.isPrimary)return;drag={x:event.clientX,left:report.scrollLeft};report.setPointerCapture(event.pointerId)});
   report.addEventListener('pointermove',event=>{if(drag)report.scrollLeft=drag.left+drag.x-event.clientX});
   const release=()=>drag=null;report.addEventListener('pointerup',release);report.addEventListener('pointercancel',release);report.addEventListener('lostpointercapture',release);
   report.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();report.scrollBy({left:report.clientWidth*(event.key==='ArrowRight'?1:-1),behavior:reduce.matches?'instant':'smooth'})}});
   return ()=>{stopCover();window.removeEventListener('resize',resize)};
  }
 };
})();
