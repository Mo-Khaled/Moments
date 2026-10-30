// Source of assets/hero-bottle-3d.js (built by scripts/build-hero-3d.mjs: three.js, the glTF loader, the meshopt decoder and the room
// environment in one minified module). The gift-box hero imports it on desktop only, after the page has loaded and the browser is idle.
// It draws the 3D bottle into a canvas inside .hgb-bottle and turns it with the hero's scroll progress (--p); it renders only when --p
// changes and only while the hero is on screen. If WebGL or the model fails, nothing changes: the still images stay.
import { WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, Box3, Vector3, ACESFilmicToneMapping } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// The turn: from START to START + SWEEP radians as the bottle rises (progress 0.2 to 0.85). The still images are rendered at these two angles.
export const START = -0.5;
export const SWEEP = Math.PI * 1.15;
export const angleAt = (p) => START + SWEEP * Math.min(1, Math.max(0, (p - 0.2) / 0.65));

/** Renderer, scene and a camera that fits the model's height in the canvas, its base on the bottom edge. */
export async function setup(canvas, url, width, height, ratio = 2) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
  renderer.setPixelRatio(ratio);
  renderer.setSize(width, height, false);
  renderer.toneMapping = ACESFilmicToneMapping;
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  const model = gltf.scene;
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const centre = box.getCenter(new Vector3());
  model.position.set(-centre.x, -box.min.y, -centre.z); // base at y = 0, centred on the axis it turns around
  const pivot = new Scene();
  pivot.add(model);
  scene.add(pivot);

  const camera = new PerspectiveCamera(24, width / height, 0.01, 50);
  const fit = () => {
    camera.aspect = width / height;
    // fit the height (and the width when the canvas is narrow) with a small margin; look slightly down at the bottle
    const fov = (camera.fov * Math.PI) / 180;
    const byHeight = (size.y * 1.04) / 2 / Math.tan(fov / 2);
    // the widest silhouette while turning is the diagonal of the footprint
    const byWidth = (Math.hypot(size.x, size.z) * 1.08) / 2 / Math.tan(fov / 2) / camera.aspect;
    const distance = Math.max(byHeight, byWidth) + Math.max(size.x, size.z) / 2;
    camera.position.set(0, size.y * 0.5 + distance * 0.08, distance);
    camera.lookAt(0, size.y * 0.5, 0);
    camera.updateProjectionMatrix();
  };
  fit();

  return {
    renderer,
    render(p, tilt = { x: 0, y: 0 }) {
      pivot.rotation.y = angleAt(p) + tilt.y;
      pivot.rotation.x = tilt.x;
      renderer.render(scene, camera);
    },
    resize(w, h) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      fit();
    },
  };
}

/** Mounts the live bottle in the hero. */
export async function mount(hero) {
  const holder = hero.querySelector('.hgb-bottle');
  const stage = hero.querySelector('.hgb__stage');
  if (!holder || !stage || !hero.dataset.model) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'hgb-bottle__3d';
  canvas.setAttribute('aria-hidden', 'true');
  let view;
  try {
    view = await setup(canvas, hero.dataset.model, holder.clientWidth, holder.clientHeight, Math.min(devicePixelRatio || 1, 2));
  } catch {
    return; // no WebGL or the model failed: the still images stay
  }
  holder.append(canvas);

  let last = -1;
  let visible = true;
  let frame = 0;
  // the bottle leans a little toward the mouse (up to about 7 degrees), eased, so it answers the visitor; it settles when the mouse rests
  const tilt = { x: 0, y: 0 };
  const aim = { x: 0, y: 0 };
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    aim.y = ((event.clientX - r.left) / r.width - 0.5) * 0.24;
    aim.x = ((event.clientY - r.top) / r.height - 0.5) * 0.12;
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { aim.x = 0; aim.y = 0; }, { passive: true });
  const progress = () => parseFloat(getComputedStyle(stage).getPropertyValue('--p')) || 0;
  const tick = () => {
    frame = 0;
    const p = progress();
    const moving = Math.abs(aim.x - tilt.x) > 0.0005 || Math.abs(aim.y - tilt.y) > 0.0005;
    if (moving) {
      tilt.x += (aim.x - tilt.x) * 0.12;
      tilt.y += (aim.y - tilt.y) * 0.12;
    }
    if (moving || Math.abs(p - last) > 0.0005) {
      last = p;
      view.render(p, tilt);
    }
    if (visible) frame = requestAnimationFrame(tick);
  };
  view.render(progress(), tilt);
  hero.classList.add('has-3d');
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) frame = requestAnimationFrame(tick);
  }).observe(stage);
  new ResizeObserver(() => {
    view.resize(holder.clientWidth, holder.clientHeight);
    last = -1;
  }).observe(holder);
}
