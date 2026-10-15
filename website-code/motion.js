export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smoothstep = (edge0, edge1, value) => {
  const low = Math.min(edge0, edge1);
  const high = Math.max(edge0, edge1);
  const t = clamp((value - low) / Math.max(0.0001, high - low));
  const eased = t * t * (3 - 2 * t);
  return edge1 >= edge0 ? eased : 1 - eased;
};
export const scrollHoldOffset = (naturalTop, height, end, viewport) =>
  clamp(viewport * 0.44 - naturalTop, 0, Math.max(0, end - naturalTop - height - 32));

export function mountMotion() {
  const hero = document.querySelector('#hero-story');
  const openingSticky = document.querySelector('.opening-sticky');
  const planting = document.querySelector('#planting');
  const plantLayout = planting.querySelector('.planting-layout');
  const photos = [...document.querySelectorAll('.plant-photo[data-step]')];
  const plantButtons = [...document.querySelectorAll('[data-plant-step]')];
  const plantDetails = [...document.querySelectorAll('.plant-detail[data-step]')];
  const holds = [...document.querySelectorAll('[data-scroll-hold]')];
  const seriesButtons = [...document.querySelectorAll('.series-thumb[data-series-index]')];
  const seriesDots = [...document.querySelectorAll('[data-series-dot]')];
  const seriesPhoto = document.querySelector('#series-photo');
  const seriesBackdrop = document.querySelector('.series-backdrop');
  const seriesLabel = document.querySelector('#series-label');
  const company = document.querySelector('#company');
  const companyCopy = company.querySelector('.company-copy');
  const growth = document.querySelector('#growth');
  const collections = document.querySelector('#collections');
  const service = document.querySelector('#service');
  const serviceImage = service.querySelector('.service-image');
  const serviceCopyTargets = [...service.querySelectorAll('.service-body h2, .service-body p, .service-copy > .more-link')];
  const ai = document.querySelector('#ai');
  const aiImage = ai.querySelector('.ai-image');
  const aiRows = [...ai.querySelectorAll('.stat-row')];
  const counters = [...ai.querySelectorAll('[data-counter]')];
  const counterFrames = new Map();
  const visibleCounters = new Set();
  const contactButtons = [...document.querySelectorAll('[data-contact-index]')];
  const contactDetails = document.querySelector('#contact-details');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = [];
  const visible = new Set();
  const holdOffsets = new Map();
  let revealObserver;
  let counterObserver;
  let frame = 0;
  let imageTimer = 0;
  let imageRequest = 0;
  let seriesTimer = 0;
  let currentSeries = 0;
  let disposed = false;
  let plantStep = 0;
  let selectedPlant = null;

  function on(target, event, callback, options) {
    target.addEventListener(event, callback, options);
    listeners.push(() => target.removeEventListener(event, callback, options));
  }

  function select(buttons, index, attribute) {
    for (const button of buttons) {
      const active = Number(button.dataset[attribute]) === index;
      button.classList.toggle('is-active', active);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  function selectSeries(index) {
    currentSeries = index;
    for (const dot of seriesDots) dot.setAttribute('aria-current', String(Number(dot.dataset.seriesDot) === index));
  }

  function startSeriesLoop() {
    clearInterval(seriesTimer);
    if (motionPreference.matches || document.hidden || seriesButtons.length < 2) return;
    seriesTimer = window.setInterval(() => {
      if (document.hidden || !visible.has(seriesPhoto)) return;
      showSeries((currentSeries + 1) % seriesButtons.length);
    }, 4200);
  }

  function showSeries(index, manual = false) {
    const button = seriesButtons[index];
    const request = ++imageRequest;
    clearTimeout(imageTimer);
    select(seriesButtons, index, 'seriesIndex');
    selectSeries(index);
    if (manual) startSeriesLoop();
    seriesLabel.textContent = button.dataset.label;
    const next = new Image();
    next.onload = () => {
      if (disposed || request !== imageRequest) return;
      seriesPhoto.style.transition = motionPreference.matches ? 'none' : 'opacity 180ms ease';
      seriesPhoto.style.opacity = motionPreference.matches ? '1' : '0';
      seriesPhoto.parentElement.classList.add('is-swapping');
      imageTimer = window.setTimeout(() => {
        seriesPhoto.src = button.dataset.image;
        seriesPhoto.style.setProperty('--series-crop', button.dataset.crop || 'inset(0)');
        seriesBackdrop.src = button.dataset.image;
        seriesPhoto.alt = `艾艾贴${button.dataset.label.replace('-', '')}产品`;
        seriesPhoto.style.opacity = '1';
        seriesPhoto.parentElement.classList.remove('is-swapping');
      }, motionPreference.matches ? 0 : 90);
    };
    next.src = button.dataset.image;
  }

  function animateCounter(element) {
    if (!element || element.dataset.counterAnimated === 'true') return;
    const finalText = element.dataset.counter || element.textContent.trim();
    const matches = [...finalText.matchAll(/\d+(?:\.\d+)?/g)];
    element.dataset.counterAnimated = 'true';
    if (!matches.length || motionPreference.matches) {
      element.textContent = finalText;
      return;
    }
    const values = matches.map(match => Number(match[0]));
    const row = element.closest('.stat-row');
    const startedAt = performance.now() + (Number(getComputedStyle(row).opacity) < .95 ? 750 : 120);
    const duration = 1600;
    element.setAttribute('aria-label', finalText);
    const tick = now => {
      if (disposed) return;
      const progress = clamp((now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      let index = 0;
      element.textContent = finalText.replace(/\d+(?:\.\d+)?/g, () => String(Math.round(values[index++] * eased)));
      if (progress < 1) counterFrames.set(element, requestAnimationFrame(tick));
      else { element.textContent = finalText; counterFrames.delete(element); }
    };
    counterFrames.set(element, requestAnimationFrame(tick));
  }

  function schedule() {
    if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(update);
  }

  function setupReveals() {
    const mediaTargets = [
      company?.querySelector('.company-image img'),
      ...photos.map(photo => photo.querySelector('img')),
      growth?.querySelector('.growth-figure > img'),
      seriesPhoto,
      service?.querySelector('.service-image > img:first-child'),
      ai?.querySelector('.ai-image img'),
    ].filter(Boolean);
    const copyTargets = [
      company.querySelector('.company-introduction'),
      ...company?.querySelectorAll('.company-copy h2, .company-copy p'),
      ...document.querySelectorAll('.planting-heading, .growth-section > h2, .collection-heading h2, .collection-heading p, .service-layout > h2, .ai-next, .contact-section > h2'),
      growth?.querySelector('.growth-figure figcaption'),
      ...serviceCopyTargets,
      ...ai?.querySelectorAll('.ai-copy h2, .ai-copy p'),
      ...aiRows,
      ...contactButtons,
    ].filter(Boolean);
    const targets = [...new Set([...mediaTargets, ...copyTargets])];
    targets.forEach((element, index) => {
      element.classList.add(mediaTargets.includes(element) ? 'reveal-media' : 'reveal-copy');
      element.style.setProperty('--reveal-delay', mediaTargets.includes(element) ? `${Math.min(index % 6, 5) * 55}ms` : '0ms');
    });
    if (motionPreference.matches) {
      targets.forEach(element => element.classList.add('is-revealed'));
      counters.forEach(animateCounter);
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.14 });
    targets.filter(element => !serviceCopyTargets.includes(element) && !aiRows.includes(element)).forEach(element => revealObserver.observe(element));
    counterObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= .85) {
          visibleCounters.add(entry.target);
          if (entry.target.closest('.stat-row').classList.contains('is-revealed')) animateCounter(entry.target);
        } else visibleCounters.delete(entry.target);
        if (!entry.isIntersecting) {
          cancelAnimationFrame(counterFrames.get(entry.target));
          counterFrames.delete(entry.target);
          delete entry.target.dataset.counterAnimated;
          entry.target.textContent = entry.target.dataset.counter;
        }
      }
    }, { rootMargin: '0px 0px -15% 0px', threshold: [0, .85] });
    counters.forEach(element => counterObserver.observe(element));
  }

  function measure() {
    if (disposed) return;
    schedule();
  }

  function showPlant(index) {
    plantStep = index;
    select(plantButtons, index, 'plantStep');
    for (const photo of photos) photo.classList.toggle('is-active', Number(photo.dataset.step) === index);
    for (const detail of plantDetails) detail.classList.toggle('is-active', Number(detail.dataset.step) === index);
  }

  function plantProgress(viewport) {
    const start = plantLayout.getBoundingClientRect().top + window.scrollY - viewport * 0.56;
    const travel = Math.max(160, Math.min(420, plantLayout.offsetHeight * .55));
    return clamp((window.scrollY - start) / travel);
  }

  function updatePlantMotion(viewport) {
    const progress = plantProgress(viewport);
    const cross = selectedPlant ?? smoothstep(0.34, 0.66, progress);
    planting.style.setProperty('--plant-progress', progress.toFixed(4));
    planting.style.setProperty('--plant-cross', cross.toFixed(4));
    for (const photo of photos) {
      const step = Number(photo.dataset.step);
      const opacity = step === 0 ? 1 - cross : cross;
      photo.style.opacity = opacity.toFixed(3);
      photo.style.setProperty('--plant-blur', `${((1 - opacity) * 6).toFixed(2)}px`);
      photo.style.setProperty('--plant-clip', `${((1 - opacity) * 14).toFixed(2)}%`);
      photo.style.setProperty('--plant-image-y', `${((1 - opacity) * 3).toFixed(2)}%`);
      photo.style.setProperty('--plant-scale', (1 + (1 - opacity) * .035).toFixed(4));
    }
    for (const detail of plantDetails) {
      const step = Number(detail.dataset.step);
      const opacity = step === 0 ? 1 - smoothstep(.08, .42, cross) : smoothstep(.58, .9, cross);
      detail.style.opacity = opacity.toFixed(3);
    }
    const active = cross >= 0.5 ? 1 : 0;
    if (active !== plantStep) showPlant(active);
  }

  function updateImageStory(section, viewport) {
    if (!section || motionPreference.matches) return;
    const bounds = section.getBoundingClientRect();
    const progress = clamp((viewport - bounds.top) / Math.max(1, viewport + bounds.height));
    const offset = (0.5 - progress) * 14;
    const blur = 2.4 * (1 - smoothstep(0.04, 0.36, progress));
    const scale = 1 + (1 - smoothstep(0, 0.72, progress)) * 0.035;
    for (const image of section.querySelectorAll('.reveal-media')) {
      image.style.setProperty('--parallax-y', `${(image === seriesPhoto ? offset * 0.12 : offset).toFixed(2)}%`);
      image.style.setProperty('--parallax-blur', `${blur.toFixed(2)}px`);
      image.style.setProperty('--parallax-scale', (image === seriesPhoto ? scale + 0.02 : scale).toFixed(4));
    }
  }

  function updateSectionReveal(element, viewport) {
    if (!element) return;
    const progress = smoothstep(0.95, 0.25, element.getBoundingClientRect().top / viewport);
    element.style.setProperty('--section-progress', progress.toFixed(4));
    const opacity = '1';
    for (const child of element.querySelectorAll('.growth-figure,.service-image,.service-body,.ai-image,.ai-copy,.ai-stats,.ai-cta')) {
      child.style.opacity = opacity;
    }
  }

  function update() {
    frame = 0;
    const viewport = window.innerHeight;
    if (visible.has(planting) && window.innerWidth > 640 && !motionPreference.matches) {
      updatePlantMotion(viewport);
    } else if (window.innerWidth <= 640 || motionPreference.matches) {
      for (const photo of photos) {
        photo.style.opacity = '';
        for (const property of ['--plant-blur', '--plant-clip', '--plant-image-y', '--plant-scale']) photo.style.removeProperty(property);
      }
      for (const detail of plantDetails) {
        detail.style.opacity = '';
      }
    }
    if (visible.has(growth)) updateSectionReveal(growth, viewport);
    if (visible.has(service)) updateSectionReveal(service, viewport);
    if (visible.has(ai)) updateSectionReveal(ai, viewport);
    if (visible.has(growth)) updateImageStory(growth, viewport);
    if (visible.has(collections)) updateImageStory(collections, viewport);
    if (visible.has(service)) updateImageStory(service, viewport);
    if (visible.has(ai)) updateImageStory(ai, viewport);
    for (const element of holds) {
      const bounds = element.getBoundingClientRect();
      const naturalTop = bounds.top - (holdOffsets.get(element) || 0);
      const boundary = document.querySelector(element.dataset.scrollHold).getBoundingClientRect().bottom;
      const next = element.dataset.holdStop && document.querySelector(element.dataset.holdStop);
      const nextEdge = element === aiImage ? next?.getBoundingClientRect().bottom + 32 : next?.getBoundingClientRect().top;
      const end = next ? Math.min(boundary, nextEdge) : boundary;
      const target = element === companyCopy && viewport < 1100 ? viewport * 0.22 : element.closest('#growth') ? viewport * 0.30 : viewport * 0.44;
      const maxOffset = Math.max(0, end - naturalTop - bounds.height - 32);
      const offset = motionPreference.matches || window.innerWidth <= 640
        ? 0
        : clamp(target - naturalTop, 0, maxOffset);
      holdOffsets.set(element, offset);
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
      if (element === serviceImage) service.style.setProperty('--service-image-progress', maxOffset > 0 ? (offset / maxOffset).toFixed(4) : '1');
      if (element === aiImage) ai.style.setProperty('--ai-image-progress', maxOffset > 0 ? (offset / maxOffset).toFixed(4) : '1');
    }
    if (visible.has(service)) {
      const positioned = motionPreference.matches || window.innerWidth <= 900 || Number(service.style.getPropertyValue('--service-image-progress')) >= .72;
      for (const element of serviceCopyTargets) {
        const bounds = element.getBoundingClientRect();
        if (positioned && bounds.top < viewport * .88 && bounds.bottom > 0) element.classList.add('is-revealed');
      }
    }
    if (visible.has(ai)) {
      const positioned = motionPreference.matches || window.innerWidth <= 900 || Number(ai.style.getPropertyValue('--ai-image-progress')) >= .72;
      for (const row of aiRows) {
        const bounds = row.getBoundingClientRect();
        if (positioned && bounds.top < viewport * .88 && bounds.bottom > 0) {
          row.classList.add('is-revealed');
          for (const counter of row.querySelectorAll('[data-counter]')) if (visibleCounters.has(counter)) animateCounter(counter);
        }
      }
    }
  }

  for (const button of plantButtons) {
    on(button, 'click', () => {
      const index = Number(button.dataset.plantStep);
      selectedPlant = index;
      showPlant(index);
      if (window.innerWidth > 640 && !motionPreference.matches) updatePlantMotion(window.innerHeight);
    });
  }
  for (const button of seriesButtons) {
    on(button, 'click', () => showSeries(Number(button.dataset.seriesIndex), true));
  }
  for (const dot of seriesDots) {
    on(dot, 'click', () => showSeries(Number(dot.dataset.seriesDot), true));
  }
  for (const button of contactButtons) {
    on(button, 'click', () => {
      if (button.dataset.contactLink) { location.href = button.dataset.contactLink; return; }
      select(contactButtons, Number(button.dataset.contactIndex), 'contactIndex');
      contactDetails.textContent = button.dataset.contact;
      contactDetails.hidden = false;
    });
  }
  for (const link of document.querySelectorAll('a[href="#company"]')) {
    on(link, 'click', event => {
      event.preventDefault();
      measure();
      company.scrollIntoView({ behavior: 'instant', block: 'start' });
      history.replaceState(null, '', '#company');
    });
  }
  on(window, 'scroll', () => { selectedPlant = null; schedule(); }, { passive: true });
  on(window, 'resize', measure, { passive: true });
  on(window, 'load', measure);
  on(motionPreference, 'change', () => { startSeriesLoop(); measure(); });
  on(document, 'visibilitychange', () => {
    startSeriesLoop();
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else measure();
  });

  const observed = [hero, company, planting, growth, collections, seriesPhoto, service, ai];
  const intersection = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    schedule();
  }, { rootMargin: '15% 0px' });
  for (const element of observed) {
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom >= 0 && bounds.top <= window.innerHeight) visible.add(element);
    intersection.observe(element);
  }
  const resize = new ResizeObserver(measure);
  resize.observe(openingSticky);
  setupReveals();
  measure();
  selectSeries(Number(seriesButtons.find(button => button.classList.contains('is-active'))?.dataset.seriesIndex || 0));
  startSeriesLoop();
  document.fonts?.ready.then(measure);

  return () => {
    disposed = true;
    imageRequest++;
    cancelAnimationFrame(frame);
    clearTimeout(imageTimer);
    clearInterval(seriesTimer);
    revealObserver?.disconnect();
    counterObserver?.disconnect();
    for (const counterFrame of counterFrames.values()) cancelAnimationFrame(counterFrame);
    intersection.disconnect();
    resize.disconnect();
    for (const remove of listeners) remove();
  };
}
