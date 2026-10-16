import './site-link-arrows.js';

const mountedVideos = new WeakSet();
function mountFilms() {
  document.querySelectorAll('main video,.company-hero-video').forEach(video => {
    if (mountedVideos.has(video)) return;
    mountedVideos.add(video);
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    video.disablePictureInPicture = true;
  });
}
mountFilms();
const rendered = new MutationObserver(records => {
  if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches('video') || node.querySelector('video'))))) mountFilms();
});
rendered.observe(document.querySelector('main') || document.body, {childList:true,subtree:true});
window.addEventListener('pagehide',()=>rendered.disconnect(),{once:true});
