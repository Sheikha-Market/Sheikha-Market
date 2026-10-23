import * as THREE from './vendor/three/three.module.min.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';

const GOLD = 0xdab365;
const CYAN = 0x7cdacc;
const vector = (x, y, z) => new THREE.Vector3(x, y, z);

function marbleTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const grain = Math.sin(x * 14.37 + y * 57.29) * Math.cos(y * 12.13 - x * 8.91);
    const vein = Math.pow(Math.abs(Math.sin(x * .12 + y * .16 + Math.sin(y * .06) * 3)), 30);
    const index = (y * size + x) * 4;
    data[index] = 19 + grain * 7 + vein * 18;
    data[index + 1] = 42 + grain * 9 + vein * 23;
    data[index + 2] = 35 + grain * 7 + vein * 19;
    data[index + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function disposeTree(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  root.clear();
}

export function createCoreScene(host, { onSelect, onHover, onUnavailable }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x081713);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'مجسم معماري لمجالات شيخة وعلاقات اعتمادها المسجلة');
  canvas.dataset.state = 'loading';
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 5, -5, .1, 80);
  camera.position.set(10, 9, 12);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.2, 0);
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.minPolarAngle = .35;
  controls.maxPolarAngle = 1.3;
  controls.minZoom = .75;
  controls.maxZoom = 1.65;
  controls.autoRotateSpeed = .45;
  controls.update();
  controls.saveState();

  scene.add(new THREE.HemisphereLight(0xc7e8df, 0x28382d, 2.4));
  const key = new THREE.DirectionalLight(0xffe8b5, 4.2);
  key.position.set(-5, 12, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -8;
  key.shadow.camera.right = key.shadow.camera.top = 8;
  key.shadow.camera.far = 35;
  key.shadow.normalBias = .03;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x91ccbd, 2.5);
  fill.position.set(6, 6, -8);
  scene.add(fill);

  const marble = marbleTexture();
  const stone = () => new THREE.MeshStandardMaterial({ map: marble, roughness: .47, metalness: .3 });
  const gold = () => new THREE.MeshStandardMaterial({ color: GOLD, metalness: .7, roughness: .29, emissive: 0x62431d, emissiveIntensity: .12 });
  const base = new THREE.Group();
  scene.add(base);
  function block(parent, dimensions, position, material, trim = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.position.copy(position);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    if (trim) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .35 }));
      mesh.add(edges);
    }
    return mesh;
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x020806, roughness: .9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.35; floor.receiveShadow = true; base.add(floor);
  const grid = new THREE.GridHelper(22, 22, 0x73633d, 0x263b30);
  grid.position.y = -.32;
  grid.material.transparent = true; grid.material.opacity = .45; base.add(grid);
  block(base, [7.2, .35, 7.2], vector(0, -.1, 0), stone());
  block(base, [6.1, .5, 6.1], vector(0, .3, 0), stone());
  block(base, [4.8, .45, 4.8], vector(0, .78, 0), stone());
  block(base, [3.45, .7, 3.45], vector(0, 1.35, 0), stone());
  block(base, [2.3, .2, 2.3], vector(0, 1.8, 0), gold());
  const core = block(base, [1.6, 1.25, 1.6], vector(0, 2.51, 0), stone());
  block(base, [1.61, .035, 1.61], vector(0, 3.155, 0), gold(), false);
  // Inlays follow the physical tiers; only the separate graph group encodes dependencies.
  for (let i = 0; i < 7; i++) {
    block(base, [.018, .72, .022], vector(-.65 + i * .21, 2.49, .811), gold(), false);
    block(base, [.018, .32, 6.12], vector(-2.65 + i * .22, .3, 0), gold(), false);
  }
  const crest = new THREE.Mesh(new THREE.TorusGeometry(.38, .018, 6, 48), gold());
  crest.rotation.x = -Math.PI / 2; crest.position.set(0, 3.18, 0); base.add(crest);

  let graphRoot = new THREE.Group(); scene.add(graphRoot);
  let graphNodes = [];
  let graphLines = [];
  let selected = 'all';
  let matches = null;
  let frame = 0;
  let running = false;
  let visible = true;
  let disposed = false;
  let contextLost = false;
  let motion = false;
  let ticks = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart = null;
  let lastTime = 0;

  function draw() {
    if (disposed || contextLost || !visible || document.hidden) return;
    renderer.render(scene, camera);
    canvas.dataset.state = 'ready';
    canvas.dataset.frame = String(++ticks);
  }
  function tick(time) {
    if (!running) return;
    controls.update(lastTime ? Math.min((time - lastTime) / 1000, .1) : 0);
    lastTime = time;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    const active = motion && visible && !document.hidden && !disposed && !contextLost;
    if (active && !running) { running = true; lastTime = 0; frame = requestAnimationFrame(tick); }
    if (!active && running) { running = false; cancelAnimationFrame(frame); }
    controls.autoRotate = active;
    draw();
  }
  function resize() {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const span = Math.max(8.8, 11.2 / aspect);
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2;
    camera.top = span / 2; camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  }
  function highlight() {
    for (const item of graphNodes) {
      const active = selected === item.id;
      const matched = !matches || matches.has(item.id);
      item.marker.material.color.setHex(active ? CYAN : GOLD);
      item.marker.material.emissive.setHex(active ? 0x2b8f7b : 0x76541c);
      item.marker.material.emissiveIntensity = matched ? .6 : .05;
      item.marker.scale.setScalar(active ? 1.45 : 1);
      item.body.material.color.setHex(matched ? 0xffffff : 0x66736b);
      item.ring.material.color.setHex(active ? CYAN : GOLD);
      item.ring.material.opacity = active ? 1 : matched ? .6 : .18;
    }
    for (const item of graphLines) {
      const active = selected !== 'all' && [item.from, item.to].includes(selected);
      item.line.material.color.setHex(active ? CYAN : GOLD);
      item.line.material.opacity = active ? .95 : selected === 'all' ? .65 : .16;
      item.arrow.material.color.setHex(active ? CYAN : GOLD);
    }
    canvas.dataset.selectedGroup = selected;
    draw();
  }
  function hit(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(graphNodes.flatMap(item => [item.body, item.marker]), false)[0]?.object.userData.groupId;
  }
  function pointerDown(event) {
    if (event.button !== 0 || !event.isPrimary || pointerStart) { pointerStart = null; return; }
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }
  function pointerUp(event) {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (distance < 6) { const id = hit(event); if (id) onSelect(id); }
  }
  function pointerMove(event) {
    const id = hit(event);
    canvas.style.cursor = id ? 'pointer' : 'grab';
    onHover(graphNodes.find(item => item.id === id)?.name || '');
  }
  function pointerLeave() { pointerStart = null; onHover(''); }
  function lost(event) { event.preventDefault(); contextLost = true; schedule(); canvas.dataset.state = 'unavailable'; onUnavailable(); }
  function visibilityChange() { schedule(); }
  function preferenceChange() { if (reducedMotion.matches) { motion = false; schedule(); } }
  controls.addEventListener('change', draw);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('pointercancel', pointerLeave);
  canvas.addEventListener('webglcontextlost', lost);
  document.addEventListener('visibilitychange', visibilityChange);
  reducedMotion.addEventListener('change', preferenceChange);
  const observer = new ResizeObserver(resize); observer.observe(host);
  resize();

  return {
    setGraph(graph) {
      disposeTree(graphRoot); scene.remove(graphRoot);
      graphRoot = new THREE.Group(); scene.add(graphRoot);
      graphNodes = []; graphLines = [];
      const anchors = new Map();
      graph.groups.forEach((group, index) => {
        const angle = index / graph.groups.length * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 2.85;
        const z = Math.sin(angle) * 2.85;
        const height = .8 + Math.min(group.count, 8) * .22;
        const platform = block(graphRoot, [.92, .14, .92], vector(x, .64, z), gold());
        const body = block(graphRoot, [.65, height, .65], vector(x, .72 + height / 2, z), stone());
        body.userData.groupId = group.id;
        for (let level = 0; level < Math.min(group.count, 8); level++) {
          block(graphRoot, [.66, .022, .66], vector(x, .86 + level * .22, z), gold(), false);
        }
        const anchor = vector(x, .85 + height, z);
        anchors.set(group.id, anchor);
        const marker = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 2), new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: .4, metalness: .5, roughness: .2 }));
        marker.position.copy(anchor); marker.userData.groupId = group.id; graphRoot.add(marker);
        const ring = new THREE.LineSegments(new THREE.EdgesGeometry(platform.geometry), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .7 }));
        ring.position.copy(platform.position); ring.scale.set(1.12, 1.1, 1.12); graphRoot.add(ring);
        graphNodes.push({ id: group.id, name: `${group.name} · ${group.count} طبقات`, body, marker, ring });
      });
      for (const link of graph.links) {
        const start = anchors.get(link.from); const end = anchors.get(link.to);
        if (!start || !end) continue;
        const mid = start.clone().add(end).multiplyScalar(.5); mid.y += .65;
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .65 }));
        graphRoot.add(line);
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(.045, .15, 5), new THREE.MeshBasicMaterial({ color: GOLD }));
        arrow.position.copy(curve.getPoint(.72));
        arrow.quaternion.setFromUnitVectors(vector(0, 1, 0), curve.getTangent(.72).normalize());
        graphRoot.add(arrow);
        graphLines.push({ ...link, line, arrow });
      }
      canvas.dataset.groupCount = String(graph.groups.length);
      canvas.dataset.linkCount = String(graph.links.length);
      core.visible = graph.groups.length > 0;
      highlight();
    },
    setSelection(group, matchedGroups) { selected = group; matches = new Set(matchedGroups); highlight(); },
    setVisible(value) { visible = value; if (value) resize(); schedule(); },
    setMotion(value) { motion = value && !reducedMotion.matches; schedule(); return motion; },
    rotate(angle) {
      const offset = camera.position.clone().sub(controls.target).applyAxisAngle(vector(0, 1, 0), angle);
      camera.position.copy(controls.target).add(offset); controls.update(); draw();
    },
    zoom(factor) { camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom); camera.updateProjectionMatrix(); controls.update(); draw(); },
    reset() { controls.reset(); resize(); },
    dispose() {
      disposed = true; running = false; cancelAnimationFrame(frame); observer.disconnect();
      controls.removeEventListener('change', draw); controls.dispose();
      canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('pointercancel', pointerLeave);
      canvas.removeEventListener('webglcontextlost', lost); document.removeEventListener('visibilitychange', visibilityChange);
      reducedMotion.removeEventListener('change', preferenceChange);
      disposeTree(graphRoot); disposeTree(base); marble.dispose(); key.shadow.map?.dispose(); renderer.dispose(); canvas.remove();
    }
  };
}
