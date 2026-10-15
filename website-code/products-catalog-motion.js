const clamp = value => Math.max(0, Math.min(1, value));

export function catalogTimeline(heights, viewport) {
  let distance = 0;
  const cover = viewport * .85;
  const panels = heights.map((height, index) => {
    const arrival = distance;
    const read = Math.max(0, height - viewport);
    distance += read + Math.max(96, viewport * .22);
    const departure = distance;
    if (index < heights.length - 1) distance += cover;
    return {arrival, read, departure};
  });
  return {panels, cover, distance};
}

export function mountCatalog(root) {
  const catalog = root.querySelector('.product-catalog');
  const stage = catalog.querySelector('.product-catalog-stage');
  const panels = [...stage.querySelectorAll('.product-group')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let timeline, height = 0, start = 0, target = 0, current = 0, frame = 0, previous = 0, active = -1;
  const position = () => Math.max(0, Math.min(timeline.distance, scrollY - start));
  const draw = time => {
    frame = 0;
    const delta = previous ? Math.min(64, time - previous) : 16;
    previous = time;
    current += (target - current) * (1 - Math.exp(-delta / 110));
    if (Math.abs(target - current) < .15) current = target;
    let next = 0, transitioning = false;
    panels.forEach((panel, index) => {
      const item = timeline.panels[index];
      const cover = index ? clamp((current - timeline.panels[index - 1].departure) / timeline.cover) : 1;
      const read = Math.max(0, Math.min(item.read, current - item.arrival));
      panel.style.transform = `translate3d(0,${(1 - cover) * height}px,0)`;
      panel.firstElementChild.style.transform = `translate3d(0,${-read}px,0)`;
      if (cover > .001 && cover < .999) transitioning = true;
      if (cover >= .99) next = index;
    });
    stage.dataset.transitioning = String(transitioning);
    if (active !== next) {
      if (panels[active]?.contains(document.activeElement)) stage.focus({preventScroll:true});
      active = next;
      panels.forEach((panel, index) => {
        panel.inert = index !== active;
        panel.setAttribute('aria-hidden', String(index !== active));
      });
      catalog.dataset.activeGroup = panels[active].dataset.productGroup;
    }
    catalog.dataset.distance = current.toFixed(2);
    if (current !== target) frame = requestAnimationFrame(draw);
    else previous = 0;
  };
  const schedule = () => {
    if (reduce.matches || !timeline) return;
    target = position();
    if (scrollY < start || scrollY > start + timeline.distance) current = target;
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const measure = () => {
    cancelAnimationFrame(frame); frame = 0;
    catalog.classList.toggle('is-pinned', !reduce.matches);
    if (reduce.matches) {
      catalog.style.height = '';
      panels.forEach(panel => {
        panel.style.transform = ''; panel.firstElementChild.style.transform = '';
        panel.inert = false; panel.removeAttribute('aria-hidden');
      });
      active = -1;
      return;
    }
    height = stage.clientHeight;
    timeline = catalogTimeline(panels.map(panel => panel.firstElementChild.scrollHeight), height);
    catalog.style.height = `${height + timeline.distance}px`;
    start = scrollY + catalog.getBoundingClientRect().top - parseFloat(getComputedStyle(stage).top);
    target = current = position(); previous = 0;
    draw(performance.now());
  };
  const goToHash = () => {
    const index = panels.findIndex(panel => `#${panel.id}` === location.hash);
    if (index < 0) return;
    if (reduce.matches) { panels[index].scrollIntoView({behavior:'instant'}); return; }
    if (!timeline) return;
    scrollTo({top:start + timeline.panels[index].arrival, behavior:'instant'});
    current = target = position();
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const repeatHash = event => {
    const link = event.target.closest('a[href^="#products-"]');
    if (!link || link.hash !== location.hash || !panels.some(panel => `#${panel.id}` === link.hash)) return;
    event.preventDefault();
    goToHash();
  };
  const resized = new ResizeObserver(measure);
  panels.forEach(panel => resized.observe(panel.firstElementChild));
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', measure);
  window.addEventListener('hashchange', goToHash);
  document.addEventListener('click', repeatHash);
  reduce.addEventListener('change', measure);
  measure();
  document.fonts.ready.then(() => { measure(); goToHash(); });
  return () => {
    cancelAnimationFrame(frame); resized.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', measure);
    window.removeEventListener('hashchange', goToHash);
    document.removeEventListener('click', repeatHash);
    reduce.removeEventListener('change', measure);
  };
}
