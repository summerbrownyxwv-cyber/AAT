import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { RoomEnvironment } from './vendor/environments/RoomEnvironment.js';

export const products = [
  { label: '精华帖', url: '../assets/models/five-petal.glb', series: '艾艾贴-温系列' },
  { label: '艾灸器', url: '../assets/models/moxibustion-device.glb', series: '温系列' },
  { label: '艾草纯露', url: '../assets/models/hydrosol-98ml.glb', series: '萃系列' },
  { label: '艾草精油', url: '../assets/models/essential-oil-30ml.glb', series: '萃系列' },
  { label: '艾条', url: '../assets/models/moxa-stick-40mm.glb', series: '燃系列' },
];

/**
 * Adds the small moving light band seen on the reference product stage.
 * The source SVG stays untouched; this is only a masked duplicate layered
 * behind the WebGL canvas, so the model remains the visual foreground.
 */
function createOrbitEffect(container, motionPreference) {
  const source = container.parentElement?.querySelector('.product-orbit');
  if (!source) return null;
  const stage = source.parentElement;
  const highlight = source.cloneNode(false);
  highlight.className = `${source.className} product-orbit-highlight`;
  highlight.removeAttribute('id');
  highlight.alt = '';
  highlight.setAttribute('aria-hidden', 'true');
  Object.assign(highlight.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    pointerEvents: 'none',
    zIndex: '1',
    opacity: '0.16',
    filter: 'brightness(1.65) saturate(0.7)',
    mixBlendMode: 'screen',
    transition: 'opacity 100ms linear',
  });
  stage.insertBefore(highlight, container);

  function setRotation(turn) {
    const angle = ((turn / (Math.PI * 2)) * 360).toFixed(2);
    // A feathered 110° light band follows the same yaw as the product.
    const mask = `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, rgba(255,255,255,.08) 22deg, #fff 55deg, #fff 92deg, rgba(255,255,255,.08) 124deg, transparent 160deg)`;
    highlight.style.maskImage = mask;
    highlight.style.webkitMaskImage = mask;
    const strength = motionPreference.matches ? 0.16 : 0.16 + Math.abs(Math.sin(turn * 0.5)) * 0.34;
    highlight.style.opacity = strength.toFixed(3);
  }

  return {
    setRotation,
    destroy() {
      highlight.remove();
    },
  };
}

export async function createProductScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
  camera.position.set(0, 0, 3);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xf4f1e7, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.style.cssText = 'display:block;width:100%;height:100%;';
  container.appendChild(canvas);

  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.65;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe1d4b6, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(-2, 3, 4);
  scene.add(keyLight);

  const loader = new GLTFLoader();
  const models = Array(products.length).fill(null);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let progress = 0;
  let aspect = 1;
  let frame = 0;
  let destroyed = false;
  let feedback;
  const orbit = createOrbitEffect(container, motionPreference);

  function requestRender() {
    if (destroyed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!destroyed) renderer.render(scene, camera);
    });
  }

  function update() {
    const index = Math.min(Math.floor(progress), products.length - 1);
    const fraction = progress - index;
    const turn = motionPreference.matches ? 0 : fraction * Math.PI * 2;
    models.forEach((model, i) => {
      if (!model) return;
      model.visible = i === index;
      model.rotation.y = i === index ? turn : 0;
    });
    canvas.dataset.product = products[index].label;
    canvas.dataset.productIndex = String(index);
    canvas.dataset.progress = progress.toFixed(4);
    canvas.dataset.rotation = turn.toFixed(6);
    canvas.dataset.blend = '0';
    canvas.setAttribute('aria-label', `${products[index].label}三维模型`);
    container.setAttribute('aria-label', `${products[index].label}三维模型`);
    orbit?.setRotation(turn);
    requestRender();
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    aspect = width / height;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    models.forEach((model, index) => {
      if (!model) return;
      const size = model.userData.size;
      const scale = index === 0 ? (2 * aspect * 0.415) / size.x : (2 * 0.55) / size.y;
      model.scale.set(scale, index === 0 ? scale * (244 / 246) * (size.x / size.z) : scale, scale);
    });
    requestRender();
  }

  function showFeedback(failed) {
    feedback?.remove();
    feedback = document.createElement('div');
    feedback.setAttribute('role', 'status');
    feedback.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;flex-direction:column;font:inherit;font-size:14px;color:inherit;';
    const message = document.createElement('span');
    message.textContent = failed ? '模型暂未加载成功' : '正在加载产品模型…';
    feedback.appendChild(message);
    if (failed) {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = '重新加载';
      retry.style.cssText = 'min-height:44px;padding:8px 20px;background:transparent;border:1px solid currentColor;border-radius:24px;font:inherit;color:inherit;cursor:pointer;';
      retry.addEventListener('click', loadModels, { once: true });
      feedback.appendChild(retry);
    }
    container.appendChild(feedback);
  }

  async function loadModel(index) {
    if (models[index]) return;
    const { scene: model } = await loader.loadAsync(new URL(products[index].url, import.meta.url).href);
    if (destroyed) {
      disposeModel(model);
      return;
    }
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    model.position.sub(bounds.getCenter(new THREE.Vector3()));
    const pose = new THREE.Group();
    pose.add(model);
    if (index === 0) pose.rotation.x = Math.PI / 2;
    const group = new THREE.Group();
    group.add(pose);
    if (index === 0) group.position.y = -25 / 603;
    group.userData.size = size;
    model.traverse((object) => {
      if (object.isMesh) {
        if (index === 0 && object.material.name === '正面 · 原始图案未重绘') {
          const original = object.material;
          object.material = new THREE.MeshBasicMaterial({
            map: original.map, side: original.side, toneMapped: false,
          });
          object.material.name = original.name;
          original.dispose();
        }
      }
    });
    models[index] = group;
    scene.add(group);
    resize();
    update();
  }

  async function loadModels() {
    showFeedback(false);
    canvas.dataset.status = 'loading';
    const results = await Promise.allSettled(products.map((_, index) => loadModel(index)));
    if (destroyed) return false;
    const failed = results.some((result) => result.status === 'rejected');
    canvas.dataset.status = failed ? 'error' : 'ready';
    if (failed) showFeedback(true);
    else feedback?.remove();
    update();
    return !failed;
  }

  function disposeModel(model) {
    const resources = new Set();
    model.traverse((object) => {
      if (!object.isMesh) return;
      resources.add(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        resources.add(material);
        Object.values(material).forEach((value) => { if (value?.isTexture) resources.add(value); });
      });
    });
    resources.forEach((resource) => resource.dispose());
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  motionPreference.addEventListener('change', update);
  resize();
  update();
  const ready = loadModels();

  return {
    ready,
    setProgress(value) {
      const next = THREE.MathUtils.clamp(Number(value) || 0, 0, 4.98);
      if (next === progress) return;
      progress = next;
      update();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      motionPreference.removeEventListener('change', update);
      models.forEach((model) => { if (model) disposeModel(model); });
      environmentTarget.dispose();
      renderer.dispose();
      canvas.remove();
      feedback?.remove();
      orbit?.destroy();
    },
  };
}
