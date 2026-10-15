(() => {
  const loader = document.querySelector('[data-site-loader]');
  if (!loader) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sticky = loader.querySelector('.loader-sticky');
  const flower = loader.querySelector('.loader-flower');
  const diagram = loader.querySelector('.loader-diagram');
  const petals = loader.querySelector('.loader-petals');
  const circles = [...loader.querySelectorAll('.loader-petals circle')];
  const welcome = loader.querySelector('.loader-welcome');
  const welcomeShape = loader.querySelector('.loader-welcome-shape');
  const seed = loader.querySelector('.loader-seed');
  const seedBrand = loader.querySelector('.loader-seed-brand');
  const orbitGuide = loader.querySelector('.loader-orbit-guide');
  const orbitStrokes = loader.querySelector('.loader-orbit-strokes');
  const homeLinks = [...document.querySelectorAll('a[href="#hero-story"]')];
  const pageContent = [...document.querySelectorAll('body > main, body > footer, body > header.site-header')];
  const previousInert = pageContent.map(element => element.inert);
  const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  if (reload && location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  const plainHome = reload || !location.hash;
  const previousRestoration = history.scrollRestoration;
  if (plainHome) history.scrollRestoration = 'manual';
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = (start, end, value) => {
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };
  let progress = 0;
  let target = 0;
  let velocity = 0;
  let frame = 0;
  let orbitFrame = 0;
  let lastTime = 0;
  let orbitTime = 0;
  let hover = 0;
  let hoverTarget = 0;
  let hoverAngle = 0;
  let removed = false;
  let scrollStarted = false;
  let committed = false;
  let active;
  let travel = 1;
  let top = 0;
  let width = 1;
  let height = 1;
  let markSize = 1;
  let seedSize = 1;
  const orbitLength = orbitGuide.getTotalLength();
  const strokes = Array.from({ length: 180 }, (_, index) => {
    const point = orbitGuide.getPointAtLength(orbitLength * index / 180);
    const radius = Math.hypot(point.x - 296, point.y - 301.5);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', point.x);
    line.setAttribute('y1', point.y);
    orbitStrokes.append(line);
    return { line, point, x: (point.x - 296) / radius, y: (point.y - 301.5) / radius, angle: Math.atan2(point.y - 301.5, point.x - 296) };
  });

  function drawOrbit(time = 0) {
    const dt = Math.min(64, orbitTime ? time - orbitTime : 16);
    orbitTime = time;
    hover += (hoverTarget - hover) * (1 - Math.exp(-dt / 120));
    if (reduced.matches) hover = 0;
    const phase = reduced.matches ? 0 : time / 7600 * Math.PI * 2;
    for (const { line, point, x, y, angle } of strokes) {
      const light = (.5 + .5 * Math.cos(angle + Math.PI / 2 - phase)) ** 6;
      line.style.opacity = reduced.matches ? '.58' : .24 + .64 * light;
      const distance = Math.acos(Math.cos(angle - hoverAngle));
      const emphasis = .25 + .75 * Math.exp(-distance * distance / .65);
      const wave = 5 + 9 * (.5 + .5 * Math.sin(angle * 13 - time / 420)) + 5 * (.5 + .5 * Math.sin(angle * 29 - time / 270));
      const length = 11 + hover * emphasis * wave;
      line.setAttribute('x2', point.x - x * length);
      line.setAttribute('y2', point.y - y * length);
    }
  }

  function animateOrbit(time) {
    orbitFrame = 0;
    if (removed || document.hidden || progress >= .94) return;
    drawOrbit(time);
    if (!reduced.matches) orbitFrame = requestAnimationFrame(animateOrbit);
  }

  function startOrbit() {
    if (!orbitFrame && !removed && !document.hidden && progress < .94) {
      orbitTime = 0;
      orbitFrame = requestAnimationFrame(animateOrbit);
    }
  }

  function onPointer(event) {
    hoverTarget = event.type === 'pointerleave' ? 0 : 1;
    if (event.type !== 'pointerleave') {
      const bounds = seed.getBoundingClientRect();
      hoverAngle = Math.atan2(event.clientY - bounds.top - bounds.height / 2, event.clientX - bounds.left - bounds.width / 2);
    }
    startOrbit();
  }

  function setActive(value) {
    if (active === value) return;
    active = value;
    sticky.inert = !value;
    document.body.classList.toggle('loader-active', value);
    pageContent.forEach((element, index) => { element.inert = value || previousInert[index]; });
  }

  function dispose() {
    if (removed) return;
    removed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(orbitFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', onHashChange);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('wheel', onScrollIntent);
    window.removeEventListener('touchmove', onScrollIntent);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reduced.removeEventListener('change', measure);
    ['pointerenter', 'pointermove', 'pointerleave'].forEach(event => seed.removeEventListener(event, onPointer));
    homeLinks.forEach(link => link.removeEventListener('click', onHomeLink));
    if (plainHome) history.scrollRestoration = previousRestoration;
    setActive(false);
  }

  function complete() {
    if (removed) return;
    const scroll = scrollY;
    const flow = loader.getBoundingClientRect().height + parseFloat(getComputedStyle(loader).marginBottom);
    loader.remove();
    dispose();
    window.scrollTo({ top: Math.max(0, scroll - flow), behavior: 'instant' });
    window.dispatchEvent(new Event('resize'));
  }

  function draw() {
    const pull = ease(.02, .72, progress);
    const turn = reduced.matches ? 0 : 28 * ease(0, .28, progress) * (1 - ease(.3, .76, progress));
    const scale = reduced.matches ? 1 : Math.exp(Math.log(4.8) * (1 - pull));
    const stretch = reduced.matches ? 0 : Math.max(-.025, Math.min(.035, (target - progress) * .28));
    diagram.setAttribute('transform', `translate(380 380) rotate(${turn}) scale(${scale * (1 + stretch)} ${scale * (1 - stretch)}) translate(-380 -380)`);
    const diagramOut = ease(.79, .94, progress);
    flower.style.opacity = 1 - diagramOut;
    flower.style.filter = reduced.matches ? 'none' : `blur(${diagramOut * 6}px)`;
    petals.setAttribute('transform', `rotate(${reduced.matches ? 0 : 144 * ease(.08, 1, progress)} 380 380)`);
    circles.forEach((circle, index) => circle.style.setProperty('--loader-item', reduced.matches ? '1' : ease(index * .075, .48 + index * .075, progress)));
    const welcomeSize = reduced.matches ? Math.hypot(width, height) * 1.55 : Math.exp(Math.log(Math.hypot(width, height) * 1.55) * (1 - pull) + Math.log(markSize * .17) * pull);
    welcomeShape.setAttribute('transform', `translate(${width / 2} ${height / 2}) rotate(${turn}) scale(${welcomeSize / 31.5337}) translate(-15.76685 -15.2991)`);
    const seedScale = reduced.matches ? 1 : 1 + (markSize * .11 / seedSize - 1) * pull;
    seed.style.transform = `translate(-50%, -50%) rotate(${turn}deg) scale(${seedScale * (1 + stretch)}, ${seedScale * (1 - stretch)})`;
    seedBrand.style.transform = `scale(${1 / seedScale})`;
    seed.style.opacity = 1 - ease(.78, .94, progress);
    welcome.style.opacity = reduced.matches ? 1 - ease(.25, .5, progress) : 1 - diagramOut;
    sticky.style.opacity = 1 - ease(.83, 1, progress);
    sticky.style.pointerEvents = progress >= .999 ? 'none' : '';
    sticky.style.setProperty('--loader-head', ease(.22, .55, progress));
    sticky.style.setProperty('--loader-progress', progress);
    const handoff = ease(.76, 1, progress);
    document.body.style.setProperty('--intro-hero-opacity', handoff);
    document.body.style.setProperty('--intro-hero-y', `${reduced.matches ? 0 : (1 - handoff) * 28}px`);
    document.body.style.setProperty('--intro-hero-blur', `${reduced.matches ? 0 : (1 - handoff) * 6}px`);
    document.body.style.setProperty('--intro-hero-clip', `${reduced.matches ? 0 : (1 - handoff) * 14}%`);
    setActive(progress < 1);
    loader.dataset.progress = progress.toFixed(4);
    if (progress >= 1) complete();
    else startOrbit();
  }

  function update(time) {
    frame = 0;
    if (removed) return;
    const dt = Math.min(64, lastTime ? time - lastTime : 16);
    lastTime = time;
    if (reduced.matches) {
      progress = target;
      velocity = 0;
    } else {
      const offset = progress - target;
      const impulse = velocity + offset / 110;
      const decay = Math.exp(-dt / 110);
      const next = target + (offset + impulse * dt) * decay;
      velocity = (velocity - impulse * dt / 110) * decay;
      progress = clamp(next);
      if (progress !== next) velocity = 0;
    }
    const settled = Math.abs(target - progress) < .0001 && Math.abs(velocity) < .000001;
    if (settled) { progress = target; velocity = 0; }
    draw();
    if (!removed && !settled) frame = requestAnimationFrame(update);
  }

  function onScroll() {
    if (removed) return;
    if (scrollY >= top + travel) committed = true;
    target = committed ? 1 : clamp((scrollY - top) / travel);
    if (committed && scrollY < top + travel) window.scrollTo({ top: top + travel, behavior: 'instant' });
    if (!frame) { lastTime = 0; frame = requestAnimationFrame(update); }
  }

  function measure() {
    if (removed) return;
    width = innerWidth;
    height = sticky.clientHeight;
    travel = Math.max(height, Math.min(1400, height * 1.55));
    loader.style.setProperty('--loader-travel', `${travel}px`);
    top = loader.getBoundingClientRect().top + scrollY;
    markSize = flower.clientWidth;
    seedSize = seed.clientWidth;
    if (reduced.matches) velocity = 0;
    welcome.setAttribute('viewBox', `0 0 ${width} ${height}`);
    drawOrbit();
    onScroll();
    startOrbit();
  }

  function enter() { window.scrollTo({ top: top + travel, behavior: 'instant' }); }
  function onScrollIntent() { scrollStarted = true; }
  function onKey(event) {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) onScrollIntent();
    if (active && event.key === 'Escape') enter();
  }
  function onHomeLink(event) {
    event.preventDefault();
    enter();
    history.replaceState(null, '', '#hero-story');
  }
  function onHashChange() {
    if (location.hash === '#hero-story') enter();
    onScroll();
  }
  function onVisibilityChange() {
    if (document.hidden) { cancelAnimationFrame(orbitFrame); orbitFrame = 0; }
    else startOrbit();
  }
  function onPageHide(event) { if (!event.persisted) dispose(); }
  function onPageShow(event) {
    if (!event.persisted && plainHome && !scrollStarted) {
      committed = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
      progress = target = 0;
      velocity = 0;
      draw();
    } else onScroll();
  }

  loader.hidden = false;
  if (plainHome) window.scrollTo({ top: 0, behavior: 'instant' });
  homeLinks.forEach(link => link.addEventListener('click', onHomeLink));
  ['pointerenter', 'pointermove', 'pointerleave'].forEach(event => seed.addEventListener(event, onPointer));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', onHashChange);
  reduced.addEventListener('change', measure);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('wheel', onScrollIntent, { passive: true });
  window.addEventListener('touchmove', onScrollIntent, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  measure();
  if (location.hash) {
    const anchor = document.getElementById(location.hash.slice(1));
    if (anchor) {
      const padding = location.hash === '#hero-story' ? 0 : parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      window.scrollTo({ top: location.hash === '#hero-story' ? top + travel : anchor.getBoundingClientRect().top + scrollY - padding, behavior: 'instant' });
      target = location.hash === '#hero-story' ? 1 : clamp((scrollY - top) / travel);
    }
  }
  progress = target;
  velocity = 0;
  draw();
})();
