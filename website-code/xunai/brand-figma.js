/* Brand overview reconstructed from Figma 216:286. Shared shell stays outside. */
(() => {
  const base='../assets/xunai/brand/';
  const replacementPhotos={
    imgRectangle3:['company-downstream-cover',6720,4480,'(max-width:1023.98px) calc(100vw - 40px), 30vw'],
    imgRectangle6:['company-service-detail',4480,6720,'(max-width:1023.98px) calc(100vw - 40px), 60vw'],
    companyProductFamily:['company-product-family',9207,6138,'(max-width:767px) calc(100vw - 40px), 90vw'],
  };
  const image=(name,alt,extra='')=>{
    const photo=replacementPhotos[name];
    const photoPath=photo?`../assets/company/${photo[0]}`:'';
    const src=photo?`${photoPath}-1920.webp`:`${base}${name}.webp`;
    const dimensions=photo?`width="${photo[1]}" height="${photo[2]}" decoding="async" srcset="${[960,1920,3840].map(width=>`${photoPath}-${width}.webp ${width}w`).join(', ')}, ${photoPath}.webp ${photo[1]}w" sizes="${photo[3]}"`:'width="1440" height="960"';
    return `<img src="${src}" alt="${alt}" ${dimensions} ${extra||'loading="lazy"'}>`;
  };
  const icon=name=>name==='imgPlus'?`<svg class="xf-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"/><path class="xf-plus-vertical" d="M12 5v14"/></svg>`:`<img class="xf-icon" src="${base}${name}.svg" width="24" height="24" alt="">`;
  const stages=[
    ['上游','掌握原材品质','imgDsc13822','imgDji04701','我们的品质','道地','大别山南麓<br>北纬30度的自然馈赠','《本草纲目》记载:「自成化以来，则以蕲州者胜，用充方物，天下重之，谓之蕲艾。」蕲艾之所以为艾草之王，得益于得天独厚的气候条件。北纬30度穿过大别山南麓，留下了骄阳沃土，为艾草的生长提供了最佳环境。寻艾坚持选用道地蕲艾，并恪守天时，于每年端午前后采收第一茬。此时艾草内挥发油、总黄酮和鞣酸含量更为充沛，方得以将这份自然馈赠，转化为每一缕艾灸中的温暖体验。'],
    ['中游','务实研发与生产','research-replacement','imgRectangle5','我们的规模','求新','以现代科技<br>激活传统艾草文化','配备分析设备，可全面满足艾草产品开发工艺研究，质量标准研究及质量检测跟踪和微生物技术研究等多方面的深度探索实践。采用 InPlant 自动化智能自控系统，实现精准投料、沸腾、提取、浓缩、冷却、收集、排渣全自动流程作业，从而能获得更天然、纯净、品质更加稳定的艾草精华。'],
    ['下游','运营服务与连锁','imgRectangle3','imgRectangle6','我们的服务','寻艾','革新传统艾灸服务','以数据驱动基于用户关系经营的全渠道经营企业，创立商品+服务+社交模式，以艾灸师服务模式替代传统卖货模式，并在已经建立了育种、种植、生产、研发、线上APP自有小程序、社群、线下标准化数字化门店一体的全渠道前提下，提供一站式艾灸养生产品、艾灸调理服务以及养生交互个性化服务。寻艾以用户为中心，深耕垂直人群，致力于打造重度会员模式下的单客经济模型，努力成为中国艾灸行业的万店榜首，全球艾灸首选服务商。']
  ];
  const businesses=()=>`<section class="xf-section" id="business"><header class="xf-heading"><h2>新商业范式</h2></header><div class="xf-business" data-business><div class="xf-covers">${stages.map(([title,sub,cover],i)=>`<button type="button" data-stage="${i}" aria-expanded="false" aria-controls="xf-stage-${i}">${image(cover,sub)}<span><strong>${title}</strong><span>${sub}</span></span></button>`).join('')}</div><div class="xf-detail-viewport" hidden><div class="xf-detail-track">${stages.map(([title,sub,cover,photo,label,heading,tag,copy],i)=>`<article id="xf-stage-${i}" class="xf-stage" inert><button type="button" class="xf-stage-cover" data-stage-close aria-label="收起${title}详情" aria-expanded="true">${image(cover,sub)}<span><strong>${title}</strong><span>${sub}</span></span></button><div class="xf-stage-content">${image(photo,tag.replaceAll('<br>','，'))}<h3>${label}</h3>${i===0?`<img class="xf-origin" src="${base}imgGroup5.svg" alt="蕲艾产区示意" width="377" height="342">`:''}<div class="xf-stage-copy"><h4>${heading}</h4><p>${tag}</p><p>${copy}</p></div></div></article>`).join('')}</div></div></div></section>`;
  const timeline=history=>`<section class="xf-section xf-history" id="history"><header class="xf-heading"><div><h2>企业历程</h2><p>让积累，成为下一步的基础。</p></div></header><div class="xf-years" aria-label="企业发展年份">${history.map(([year])=>{const index=history.findIndex(item=>item[0]===year);return `<button type="button" data-year="${index}" ${index<0?'disabled title="设计稿未提供该年事件"':''} aria-pressed="${index===0}">${year}</button>`;}).join('')}</div><div class="xf-history-viewport" aria-describedby="history-hint"><div class="xf-history-track">${history.map(([year,,copy],i)=>`<button class="xf-history-card ${i===0?'is-active':''}" type="button" data-history="${i}" aria-pressed="${i===0}"><span class="xf-history-visual">${year==='2026'?'<span class="xf-history-placeholder" aria-hidden="true">2026</span>':i===0?image('imgKhp016632','2015年艾灸器1.0'):`<img src="../assets/xunai/shared/history-${year}.webp" alt="${year}年企业历程" width="1200" height="720" loading="lazy">`}</span><span class="xf-history-copy"><time>${year}</time><span>${copy}</span></span></button>`).join('')}</div></div><p class="xf-history-hint" id="history-hint">向右滑动，查看更多企业历程</p></section>`;
  const group=()=>`<section class="xf-section xf-group"><h2>东元集团</h2><p class="xf-group-sub">寻艾X艾艾贴</p><div class="xf-group-grid"><figure>${image('imgRectangle','寻艾艾灸馆品牌标识')}<figcaption>「东元集团」旗下终端品牌 革新传统艾灸服务</figcaption></figure><figure><figcaption>「东元集团」旗下自有供应链品牌<br>艾灸行业十年深度耕耘</figcaption><img src="../assets/xunai/shared/group.webp" alt="艾艾贴育苗研究基地品牌标识" width="1000" height="1100" loading="lazy"></figure></div></section>`;
  const products=()=>`<section class="xf-section" id="products"><div class="xf-subheading"><h3>自研产品</h3></div><div class="xf-products"><figure class="company-product-family"><a href="./products.html" aria-label="查看全部自研产品">${image('companyProductFamily','艾艾贴四大系列产品全家福')}</a><figcaption>全家福</figcaption></figure>${[['imgFrame21','燃系列','ran'],['imgFrame68','温系列','wen'],['imgFrame70','萃系列','cui'],['imgFrame69','植系列','zhi']].map(([img,title,key])=>`<figure><a href="./products.html#products-${key}" aria-label="查看${title}产品">${image(img,title)}</a><figcaption>${title}</figcaption></figure>`).join('')}</div></section>`;
  const terminal=()=>`<section class="xf-section" id="stores"><header class="xf-heading"><h2>终端服务</h2><p>艾灸养生，<br>连接日常。</p></header><div class="xf-subheading"><h3>寻艾</h3><a class="route-link" href="#/stores/standard">查看所有${icon('imgArrowNarrowUpRight')}</a></div><div class="xf-terminal"><a class="route-link" href="#/stores/black-gold">${image('imgFrame72','寻艾艾灸馆黑金店')}<p class="xf-muted">寻艾艾灸馆黑金店</p><p>寻艾以艾草产业为基础，将产品、线下服务与数字化能力连接起来。从原材品质到到店体验，为长期经营建立可持续的服务体系。</p></a><figure>${image('imgFrame73','服务场景')}<figcaption><span>服务场景</span>到店体验与居家养护</figcaption></figure><figure>${image('imgFrame74','产品销售')}<figcaption><span>产品销售</span>从艾草育种到终端服务</figcaption></figure></div></section>`;
  const mountCompanyBusiness=(main,business,covers,viewport,track)=>{
    const buttons=[...covers.querySelectorAll('[data-stage]')];
    const panels=buttons.map((button,i)=>{
      const panel=document.createElement('article'),detail=track.children[i].querySelector('.xf-stage-content');
      panel.className='company-business-panel';button.classList.add('company-business-choice');button.id=`company-business-choice-${i}`;
      detail.classList.add('company-business-detail');detail.id=`xf-stage-${i}`;detail.tabIndex=0;detail.setAttribute('role','region');detail.setAttribute('aria-labelledby',button.id);
      panel.append(button,detail);covers.append(panel);return panel;
    });
    viewport.remove();business.classList.add('company-business-hover');business.dataset.active='-1';
    const controller=new AbortController();
    let active=-1,lastChoice=null;
    const listen=(node,type,handler)=>node.addEventListener(type,handler,{signal:controller.signal});
    const setActive=index=>{
      if(active===index)return;active=index;business.dataset.active=String(index);business.classList.toggle('has-active',index>=0);
      panels.forEach((panel,i)=>{const selected=i===index,detail=panel.querySelector('.company-business-detail');panel.classList.toggle('is-active',selected);buttons[i].setAttribute('aria-expanded',String(selected));detail.inert=!selected;detail.setAttribute('aria-hidden',String(!selected));});
      if(index>=0)lastChoice=buttons[index];
    };
    panels.forEach((panel,i)=>{
      const detail=panel.querySelector('.company-business-detail');detail.inert=true;detail.setAttribute('aria-hidden','true');
      listen(buttons[i],'click',()=>setActive(active===i?-1:i));
    });
    listen(business,'keydown',event=>{
      const current=buttons.indexOf(document.activeElement);
      if(event.key==='Escape'){event.preventDefault();lastChoice?.focus({preventScroll:true});setActive(-1);return;}
      if(current<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,current+(event.key==='ArrowRight'?1:-1)));
      buttons[next].focus({preventScroll:true});
    });
    const resize=new ResizeObserver(()=>{const gap=parseFloat(getComputedStyle(covers).columnGap)||0;business.style.setProperty('--business-height',`${(business.clientWidth-gap*2)/3}px`);});resize.observe(business);
    return ()=>{controller.abort();resize.disconnect();};
  };
  window.XunAiFigmaBrand={
    businesses,
    render(){
      const events={2015:'售出第一盒艾灸器1.0；自此成为品牌纪念',2016:'在艾都蕲春成立生产基地',2017:'艾灸器2.0正式发布',2019:'研发、生产、仓储、一体化新园区正式落成',2020:'与中国中医科学院中药研究所签约启动，艾草种苗及基因稳定性研究',2021:'艾草行业领先的智能化提取产线正式投产',2022:'与蕲春政府及行业协会，共同成立蕲艾产业技术研究院为行业赋能',2023:'艾草新品种[蕲优一号]培育并注册成功',2024:'获得全国首张《品质中药材 艾叶》认证证书',2025:'寻艾升级，推进门店服务与连锁体系建设',2026:'内容待补充'};
      const history=Object.entries(events).map(([year,copy])=>[year,'',copy]);
      return `<div class="xf-brand">${businesses()}<div class="xf-dark">${timeline(history)}${group()}</div>${products()}${terminal()}</div>`;
    },
    mount(main){
      if(!main.querySelector('.xf-brand'))return;
      const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
      const business=main.querySelector('[data-business]'),covers=business.querySelector('.xf-covers'),viewport=business.querySelector('.xf-detail-viewport'),track=business.querySelector('.xf-detail-track');
      let closing=null,stopBusiness=()=>{};
      if(main.classList.contains('company-brand-content'))stopBusiness=mountCompanyBusiness(main,business,covers,viewport,track);
      else {
      let active=-1;
      const select=index=>{
        closing?.cancel();closing=null;const opening=viewport.hidden;
        active=Math.max(0,Math.min(stages.length-1,index));viewport.hidden=false;covers.inert=true;business.classList.add('is-expanded');
        track.style.transition=opening?'none':'';track.style.transform=`translateX(${-active*100}%)`;
        [...track.children].forEach((slide,i)=>slide.inert=i!==active);
        covers.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-expanded',String(i===active)));
        const slide=track.children[active];slide.querySelector('[data-stage-close]').focus({preventScroll:true});
        main.dispatchEvent(new CustomEvent('company-brand-change',{detail:slide,bubbles:true}));
      };
      covers.querySelectorAll('[data-stage]').forEach((button,i)=>button.addEventListener('click',()=>select(i)));
      const close=()=>{
        closing?.cancel();business.classList.remove('is-expanded');const finish=()=>{viewport.hidden=true;business.classList.remove('is-expanded');covers.inert=false;covers.querySelectorAll('button').forEach(button=>button.setAttribute('aria-expanded','false'));covers.children[active]?.focus({preventScroll:true});};
        if(reduced()){finish();return;}
        closing=viewport.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-8px)'}],{duration:280,easing:'ease-out'});closing.onfinish=finish;
      };
      business.querySelectorAll('[data-stage-close]').forEach(button=>button.addEventListener('click',close));
      business.addEventListener('keydown',event=>{if(active<0||viewport.hidden)return;if(event.key==='Escape'){close();event.preventDefault();}if(['ArrowLeft','ArrowRight'].includes(event.key)){select(active+(event.key==='ArrowRight'?1:-1));event.preventDefault();}});
      let pointer=null,swiped=false;
      viewport.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;pointer=[event.clientX,event.clientY];swiped=false;});
      viewport.addEventListener('pointerup',event=>{if(!pointer)return;const dx=event.clientX-pointer[0],dy=event.clientY-pointer[1];pointer=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3){swiped=true;select(active+(dx>0?1:-1));}});
      viewport.addEventListener('pointercancel',()=>{pointer=null;});
      viewport.addEventListener('click',event=>{if(swiped){event.preventDefault();event.stopPropagation();swiped=false;}},true);
      viewport.addEventListener('dragstart',event=>event.preventDefault());
      }
      const cards=[...main.querySelectorAll('[data-history]')],years=[...main.querySelectorAll('[data-year]')],historyTrack=main.querySelector('.xf-history-track');
      if(!historyTrack)return ()=>{stopBusiness();closing?.cancel();};
      const historyViewport=historyTrack.parentElement,yearList=years[0].parentElement,controller=new AbortController();
      const listen=(node,type,handler,options={})=>node.addEventListener(type,handler,{...options,signal:controller.signal});
      let selectedYear=0,drag=null,suppressClick=false,manualScroll=false,scrollFrame=0;
      const offset=index=>cards[index].offsetLeft-cards[0].offsetLeft;
      const nearest=()=>cards.reduce((best,card,index)=>Math.abs(offset(index)-historyViewport.scrollLeft)<Math.abs(offset(best)-historyViewport.scrollLeft)?index:best,0);
      const updateYear=index=>{selectedYear=index;cards.forEach((card,i)=>{card.classList.toggle('is-active',i===index);card.setAttribute('aria-pressed',String(i===index));});years.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.year)===index)));};
      const positionYear=behavior=>historyViewport.scrollTo({left:Math.min(offset(selectedYear),Math.max(0,historyViewport.scrollWidth-historyViewport.clientWidth)),behavior});
      const revealYear=()=>{const button=years[selectedYear];if(yearList.scrollWidth>yearList.clientWidth)yearList.scrollTo({left:button.offsetLeft-yearList.offsetLeft-(yearList.clientWidth-button.offsetWidth)/2,behavior:reduced()?'instant':'smooth'});};
      const setYear=index=>{manualScroll=false;updateYear(Math.max(0,Math.min(cards.length-1,index)));positionYear(reduced()?'instant':'smooth');revealYear();};
      years.filter(button=>!button.disabled).forEach(button=>listen(button,'click',()=>setYear(Number(button.dataset.year))));
      cards.forEach((card,index)=>listen(card,'click',()=>setYear(index)));
      const onKey=(event,targets)=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?cards.length-1:selectedYear+(event.key==='ArrowRight'?1:-1);
        setYear(next);targets[selectedYear].focus({preventScroll:true});
      };
      listen(historyTrack,'keydown',event=>onKey(event,cards));listen(yearList,'keydown',event=>onKey(event,years));
      listen(historyViewport,'pointerdown',event=>{
        manualScroll=true;suppressClick=false;
        if(!event.isPrimary||event.button!==0||event.pointerType!=='mouse')return;
        drag={x:event.clientX,y:event.clientY,left:historyViewport.scrollLeft,active:false};
      });
      listen(historyViewport,'pointermove',event=>{
        if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
        if(!drag.active){if(Math.abs(dx)<=6)return;if(Math.abs(dy)>Math.abs(dx)){drag=null;return;}drag.active=true;historyViewport.classList.add('is-dragging');historyViewport.setPointerCapture(event.pointerId);}
        event.preventDefault();historyViewport.scrollLeft=drag.left-dx;
      });
      const finishDrag=()=>{const moved=drag?.active;drag=null;historyViewport.classList.remove('is-dragging');if(moved){suppressClick=true;setYear(nearest());}};
      listen(historyViewport,'pointerup',finishDrag);listen(historyViewport,'pointercancel',finishDrag);
      listen(historyViewport,'click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},{capture:true});
      listen(historyViewport,'dragstart',event=>event.preventDefault());
      listen(historyViewport,'wheel',()=>{manualScroll=true;},{passive:true});
      listen(historyViewport,'scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{if(!manualScroll||drag?.active)return;const index=nearest();if(index!==selectedYear){updateYear(index);revealYear();}});},{passive:true});
      const resize=new ResizeObserver(()=>positionYear('instant'));resize.observe(historyViewport);
      return ()=>{controller.abort();cancelAnimationFrame(scrollFrame);resize.disconnect();closing?.cancel();stopBusiness();};
    }
  };
})();
