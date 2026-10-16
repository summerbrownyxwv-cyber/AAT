import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

export async function createPlantScene(container) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,.01,20);
  camera.position.set(0,0,8);
  scene.add(new THREE.HemisphereLight(0xffffff,0xc1b8a0,2));
  const light = new THREE.DirectionalLight(0xffffff,2);
  light.position.set(-3,4,5); scene.add(light);
  let model, frame = 0, destroyed = false, lastRotation;
  const requestRender = () => {
    if (frame || destroyed) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!destroyed) renderer.render(scene,camera); });
  };
  const resize = () => {
    const width = Math.max(container.clientWidth,1), height = Math.max(container.clientHeight,1), aspect = width/height;
    camera.left = -aspect; camera.right = aspect; camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
    if (model) model.scale.setScalar(Math.min(1.92/model.userData.size.y,1.92*aspect/Math.hypot(model.userData.size.x,model.userData.size.z)));
    requestRender();
  };
  try {
    const gltf = await new GLTFLoader().loadAsync(new URL('../assets/models/planting-mugwort.glb',import.meta.url).href);
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    model.userData.size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    scene.add(model);
    renderer.domElement.setAttribute('role','img');
    renderer.domElement.setAttribute('aria-label','蕲优一号艾草三维模型');
    container.append(renderer.domElement); container.dataset.status = 'ready';
  } catch(error) { renderer.dispose(); throw error; }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  return {
    setProgress(progress) {
      const rotation = Math.max(0,Math.min(1,progress))*Math.PI*2;
      if (rotation === lastRotation) return;
      lastRotation = rotation;
      model.rotation.y = rotation;
      renderer.domElement.dataset.rotation = rotation.toFixed(5);
      requestRender();
    },
    destroy() {
      destroyed = true; cancelAnimationFrame(frame); observer.disconnect();
      const resources = new Set();
      model.traverse(object => {
        if (!object.isMesh) return;
        resources.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          resources.add(material);
          Object.values(material).forEach(value => { if(value?.isTexture) resources.add(value); });
        }
      });
      resources.forEach(resource => resource.dispose()); renderer.dispose(); renderer.domElement.remove();
    }
  };
}
