export function coverGeometry(heights, viewport, navigation, reduced = false, desktop = false) {
  return heights.map(height => ({
    pinned: !reduced && height > 0 && (desktop || height <= viewport + 1),
    top: navigation - Math.max(0, height - viewport),
  }));
}

export function coverFollowOffset(offset, movement, elapsed, room) {
  const next = Math.max(-room, Math.min(room, offset + movement)) * Math.exp(-Math.min(64, elapsed) / 110);
  return Math.abs(next) < .05 ? 0 : next;
}

export function mountSectionCover(panels) {
  if (panels.length < 2) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, top = 0, viewport = 0, previous = 0;
  const follow = panels.map(panel => ({top:null, offset:0, translate:panel.style.translate}));
  panels.forEach((panel, index) => {
    panel.classList.add('section-cover-panel');
    panel.style.setProperty('--cover-layer', index + 1);
  });
  const sync = time => {
    frame = 0;
    const elapsed = previous ? time - previous : 16.67;
    previous = time;
    const positions = panels.map((panel, index) => panel.getBoundingClientRect().top - follow[index].offset);
    let reached = 0, moving = false;
    panels.forEach((panel, index) => {
      if (positions[index] <= top + 1) reached = index;
    });
    panels.forEach((panel, index) => {
      const state = follow[index], position = positions[index];
      const room = Math.max(0, Math.min(innerWidth <= 900 ? 32 : 56, position - top, top + viewport - position));
      const movement = state.top === null ? 0 : state.top - position;
      state.offset = reduce.matches || (state.translate && state.translate !== 'none') || !panel.classList.contains('is-cover-fit') || !room || Math.abs(movement) > viewport / 2 ? 0 : coverFollowOffset(state.offset, movement, elapsed, room);
      state.top = position;
      panel.style.translate = state.offset ? `0 ${state.offset}px` : state.translate;
      moving ||= state.offset !== 0;
      panel.inert = panel.classList.contains('is-cover-fit') && index < reached;
      panel.classList.toggle('is-cover-behind', !reduce.matches && index < reached);
    });
    if (moving) frame = requestAnimationFrame(sync);
    else previous = 0;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(sync);
  };
  const measure = () => {
    follow.forEach((state, index) => {
      panels[index].style.translate = state.translate;
      state.top = null; state.offset = 0;
    });
    previous = 0;
    top = document.querySelector('header.site-navigation')?.getBoundingClientRect().height || 0;
    viewport = document.documentElement.clientHeight - top;
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
    panels.forEach((panel, index) => {
      panel.classList.remove('section-cover-panel', 'is-cover-fit', 'is-cover-behind');
      panel.style.removeProperty('--cover-top');
      panel.style.removeProperty('--cover-height');
      panel.style.removeProperty('--cover-layer');
      panel.style.translate = follow[index].translate;
      panel.inert = false;
    });
  };
}
