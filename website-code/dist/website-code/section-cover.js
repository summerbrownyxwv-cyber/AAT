export function coverGeometry(heights, viewport, navigation, reduced = false, desktop = false) {
  return heights.map(height => ({
    pinned: !reduced && height > 0 && (desktop || height <= viewport + 1),
    top: navigation - Math.max(0, height - viewport),
  }));
}

export function mountSectionCover(panels) {
  if (panels.length < 2) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, top = 0;
  panels.forEach((panel, index) => {
    panel.classList.add('section-cover-panel');
    panel.style.setProperty('--cover-layer', index + 1);
  });
  const sync = () => {
    frame = 0;
    let reached = 0;
    panels.forEach((panel, index) => {
      if (panel.getBoundingClientRect().top <= top + 1) reached = index;
    });
    panels.forEach((panel, index) => {
      panel.inert = panel.classList.contains('is-cover-fit') && index < reached;
      panel.classList.toggle('is-cover-behind', !reduce.matches && index < reached);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(sync);
  };
  const measure = () => {
    top = document.querySelector('header.site-navigation')?.getBoundingClientRect().height || 0;
    const viewport = document.documentElement.clientHeight - top;
    panels.forEach(panel => panel.classList.remove('is-cover-fit'));
    const geometry = coverGeometry(panels.map(panel => panel.offsetHeight), viewport, top, reduce.matches, innerWidth >= 901);
    panels.forEach((panel, index) => {
      panel.style.setProperty('--cover-top', `${geometry[index].top}px`);
      panel.style.setProperty('--cover-height', `${viewport}px`);
      panel.classList.toggle('is-cover-fit', geometry[index].pinned);
    });
    schedule();
  };
  const resized = new ResizeObserver(measure);
  panels.forEach(panel => resized.observe(panel));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  reduce.addEventListener('change', measure);
  measure();
  return () => {
    cancelAnimationFrame(frame);
    resized.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', measure);
    reduce.removeEventListener('change', measure);
    panels.forEach(panel => {
      panel.classList.remove('section-cover-panel', 'is-cover-fit', 'is-cover-behind');
      panel.style.removeProperty('--cover-top');
      panel.style.removeProperty('--cover-height');
      panel.style.removeProperty('--cover-layer');
      panel.inert = false;
    });
  };
}
