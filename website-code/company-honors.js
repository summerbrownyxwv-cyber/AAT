export function initCompanyHonors(refreshImages) {
  const section = document.querySelector('#honors');
  if (!section) return () => {};
  const track = section.querySelector('.honor-groups');
  const groups = [...track.querySelectorAll('.honor-group')];
  const tabs = [...section.querySelectorAll('[data-honor-tab]')];
  section.classList.add('honor-story');
  let active = -1;

  function select(index, align = false) {
    if (index < 0) return;
    const top = document.querySelector('.site-navigation').getBoundingClientRect().height + 24 * Math.max(1,innerWidth / 1440);
    if (index !== active) {
      active = index;
      groups.forEach((group, item) => {
        const selected = item === active;
        group.hidden = !selected;
        group.inert = !selected;
        group.setAttribute('aria-hidden', String(!selected));
        tabs[item].setAttribute('aria-current', String(selected));
      });
      refreshImages(groups[active]);
      section.dataset.honorActive = active;
    }
    if (align && section.getBoundingClientRect().top < top) section.scrollIntoView({ behavior:'instant', block:'start' });
  }

  function onTab(event) {
    event.preventDefault();
    const index = tabs.indexOf(event.currentTarget);
    history.replaceState(null, '', `#${groups[index].id}`);
    select(index, true);
  }
  function onHash() {
    const index = groups.findIndex(group => `#${group.id}` === location.hash);
    if (index >= 0) select(index, true);
  }
  function onToggle(event) {
    const detail = event.target;
    if (!detail.open) return;
    detail.closest('.honor-group').querySelectorAll('details[open]').forEach(other => { if (other !== detail) other.open = false; });
    refreshImages(detail);
  }
  tabs.forEach(tab => tab.addEventListener('click', onTab));
  track.addEventListener('toggle', onToggle, true);
  window.addEventListener('hashchange', onHash);
  select(Math.max(0, groups.findIndex(group => `#${group.id}` === location.hash)));
  document.fonts.ready.then(onHash);
  return () => {
    tabs.forEach(tab => tab.removeEventListener('click', onTab));
    track.removeEventListener('toggle', onToggle, true);
    window.removeEventListener('hashchange', onHash);
  };
}
