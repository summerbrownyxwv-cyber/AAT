import { renderCooperationServices } from './products-cooperation-services.js';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = (start, end, value) => { const t = clamp((value - start) / (end - start)); return t * t * (3 - 2 * t); };

// The five circles and brand mark share the homepage loader geometry.
function renderFlower() {
  return `<svg class="cooperation-flower" viewBox="0 0 760 760" aria-hidden="true"><g class="cooperation-flower-diagram"><g class="cooperation-flower-petals"><circle cx="380" cy="225" r="220" pathLength="1"/><circle cx="527.414" cy="332.102" r="220" pathLength="1"/><circle cx="471.107" cy="505.398" r="220" pathLength="1"/><circle cx="288.893" cy="505.398" r="220" pathLength="1"/><circle cx="232.586" cy="332.102" r="220" pathLength="1"/></g><image class="cooperation-flower-emblem" href="../assets/homepage/79f1b.svg" x="355" y="356" width="50" height="48"/></g></svg>`;
}

export function renderCooperation() {
  return `<section class="product-cooperation" id="manufacturing" aria-label="生产合作与代工服务"><div class="cooperation-scroll"><div class="cooperation-stage"><div class="cooperation-intro"><span class="cooperation-gridline cooperation-gridline-left" aria-hidden="true"></span><span class="cooperation-gridline cooperation-gridline-right" aria-hidden="true"></span><h2 class="cooperation-title cooperation-title-left">生产合作</h2><h2 class="cooperation-title cooperation-title-right">代工服务</h2><figure class="cooperation-orbit" aria-label="艾艾贴全产业链协同体系">${renderFlower()}</figure></div></div></div>${renderCooperationServices()}</section>`;
}

export function cooperationState(progress) {
  const flowerProgress=clamp((progress-.36)/.64), pull=ease(.02,.72,flowerProgress);
  return { separate:ease(0,.24,progress), lines:ease(.24,.36,progress), flower:ease(0,.72,flowerProgress), flowerProgress, petals:Array.from({length:5},(_,index)=>ease(index*.075,Math.min(.72,.48+index*.075),flowerProgress)), scale:Math.exp(Math.log(4.8)*(1-pull)), turn:28*ease(0,.28,flowerProgress)*(1-ease(.3,.76,flowerProgress)), orbit:144*ease(.08,1,flowerProgress) };
}

export function mountCooperation(root) {
  const section = root.querySelector('#manufacturing');
  if (!section) return () => {};
  const scroll = section.querySelector('.cooperation-scroll'), stage = section.querySelector('.cooperation-stage');
  const petals = [...stage.querySelectorAll('.cooperation-flower-petals circle')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController(), options = {signal:abort.signal};
  let target=0, progress=0, velocity=0, frame=0, lastTime=0;
  let top=72, travel=1, scrollTop=0;
  const draw = () => {
    const state=cooperationState(progress), still=reduced.matches;
    const stretch=still?0:Math.max(-.025,Math.min(.035,(target-progress)*.28));
    stage.style.setProperty('--cooperation-separate',still?'1':state.separate);
    stage.style.setProperty('--cooperation-lines',still?'1':state.lines);
    stage.style.setProperty('--cooperation-flower',still?'1':state.flower);
    stage.style.setProperty('--cooperation-scale',still?'1':state.scale);
    stage.style.setProperty('--cooperation-stretch',stretch);
    stage.style.setProperty('--cooperation-turn',`${still?0:state.turn}deg`);
    stage.style.setProperty('--cooperation-orbit-turn',`${still?0:state.orbit}deg`);
    petals.forEach((petal,index)=>{
      const item=still?1:state.petals[index];
      petal.style.setProperty('--cooperation-item',item);
    });
    stage.dataset.progress=progress.toFixed(4);
  };
  const animate = time => {
    const dt=Math.min(64,lastTime?time-lastTime:16);lastTime=time;
    if(reduced.matches){progress=target;velocity=0;}
    else {
      const offset=progress-target, impulse=velocity+offset/110, decay=Math.exp(-dt/110);
      const next=target+(offset+impulse*dt)*decay;
      velocity=(velocity-impulse*dt/110)*decay;
      progress=clamp(next);
      if(progress!==next) velocity=0;
      if(Math.abs(target-progress)<.0001&&Math.abs(velocity)<.000001){progress=target;velocity=0;}
    }
    draw(); frame=progress===target&&velocity===0?0:requestAnimationFrame(animate);
  };
  const schedule = () => { if(!frame){lastTime=0;frame=requestAnimationFrame(animate);} };
  const onScroll = () => { target=clamp((scrollY-scrollTop+top)/travel); schedule(); };
  const measure = () => {
    top=parseFloat(getComputedStyle(stage).top)||0;
    scrollTop=scroll.getBoundingClientRect().top+scrollY;
    // The following section covers the final viewport of the pinned intro in normal flow.
    travel=Math.max(1,scroll.offsetHeight-stage.offsetHeight*2);
    onScroll();
  };
  window.addEventListener('scroll',onScroll,{...options,passive:true});window.addEventListener('resize',measure,options);
  reduced.addEventListener('change',measure,options);
  const observer=new ResizeObserver(measure);observer.observe(scroll);observer.observe(stage);
  document.fonts.ready.then(measure);
  measure();progress=target;draw();
  return ()=>{abort.abort();observer.disconnect();cancelAnimationFrame(frame);};
}
