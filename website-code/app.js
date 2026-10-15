document.documentElement.classList.add('motion-ready');
import { mountMotion } from './motion.js';
import { mountContentMotion } from './content-motion.js';
const disposeMotion = mountMotion();
const disposeFilm = mountContentMotion(document.querySelector('#hero-story'));
window.addEventListener('pagehide', event => {
  if (!event.persisted) { disposeMotion(); disposeFilm(); }
});
