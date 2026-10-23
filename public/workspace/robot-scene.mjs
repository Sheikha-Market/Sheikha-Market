import * as THREE from '/architecture-explorer/vendor/three/three.module.min.js';
import { OrbitControls } from '/architecture-explorer/vendor/three/OrbitControls.js';

export function createRobotScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0xe8eeeb); renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false; controls.minDistance = 3; controls.maxDistance = 11;
  controls.maxPolarAngle = Math.PI / 2.03; controls.target.set(0, 1.05, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8476, 3));
  const light = new THREE.DirectionalLight(0xfff1d5, 4); light.position.set(4, 7, 5); light.castShadow = true; scene.add(light);
  const fill = new THREE.DirectionalLight(0xc8f4ff, 2); fill.position.set(-3, 3, -4); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0xe2e9e4, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(12, 24, 0xb2c2ba, 0xcbd8d0); scene.add(grid);
  let robot, joints = {}, definition, stopped = false;
  function material(color, metalness = 0.45) { return new THREE.MeshStandardMaterial({ color, metalness, roughness: 0.32 }); }
  function box(parent, size, at, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); mesh.position.set(...at); mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function cylinder(parent, radius, length, at, mat, turn = false) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 32), mat);
    mesh.position.set(...at); if (turn) mesh.rotation.x = Math.PI / 2; mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function group(parent, at) { const g = new THREE.Group(); g.position.set(...at); parent.add(g); return g; }
  function removeRobot() {
    if (!robot) return;
    const geometries = new Set(), materials = new Set();
    robot.traverse(obj => { if (obj.geometry) geometries.add(obj.geometry); if (obj.material) materials.add(obj.material); });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); scene.remove(robot);
  }
  function setDesign(parameters) {
    removeRobot(); definition = { ...parameters }; stopped = false; joints = {};
    robot = new THREE.Group(); scene.add(robot); robot.scale.setScalar(parameters.scale);
    const body = material({ emerald: 0x14614f, pearl: 0xd9e1de, graphite: 0x394344 }[parameters.finish]);
    const gold = material(0xd1ae62, 0.75), dark = material(0x202d2c), silver = material(0xb5c5c2, 0.7), glass = material(0x25a4b6, 0.5);
    let mount;
    if (parameters.family === 'mobile') {
      box(robot, [1.25, 0.35, 1.55], [0, 0.43, 0], body);
      box(robot, [1.28, 0.05, 1.58], [0, 0.63, 0], gold);
      joints.wheels = [];
      for (const x of [-0.65, 0.65]) for (const z of [-0.52, 0.52]) {
        const wheel = cylinder(robot, 0.24, 0.18, [x, 0.25, z], dark); wheel.rotation.z = Math.PI / 2; joints.wheels.push(wheel);
        const hub = cylinder(wheel, 0.13, 0.19, [0, 0, 0], silver); box(hub, [0.04, 0.2, 0.18], [0, 0, 0], gold);
      }
      box(robot, [0.62, 0.9, 0.48], [0, 1.08, -0.25], body);
      box(robot, [0.65, 0.08, 0.51], [0, 1.5, -0.25], gold);
      mount = group(robot, [0, 1.65, -0.25]);
      box(robot, [0.8, 0.06, 0.02], [0, 0.43, 0.79], glass);
    } else if (parameters.family === 'arm') {
      box(robot, [1.4, 0.2, 1.2], [0, 0.1, 0], dark);
      joints.base = group(robot, [0, 0.3, 0]); cylinder(joints.base, 0.4, 0.4, [0, 0, 0], body);
      joints.shoulder = group(joints.base, [0, 0.22, 0]); cylinder(joints.shoulder, 0.24, 0.48, [0, 0, 0], gold, true);
      box(joints.shoulder, [0.3, 0.92, 0.34], [0, 0.5, 0], body);
      joints.elbow = group(joints.shoulder, [0, 1, 0]); cylinder(joints.elbow, 0.22, 0.42, [0, 0, 0], gold, true);
      box(joints.elbow, [0.23, 0.8, 0.28], [0, 0.42, 0], silver);
      mount = group(joints.elbow, [0, 0.9, 0]); cylinder(mount, 0.17, 0.2, [0, 0, 0], body);
    } else if (parameters.family === 'reception') {
      cylinder(robot, 0.63, 0.2, [0, 0.1, 0], dark);
      box(robot, [0.72, 1.18, 0.5], [0, 0.85, 0], body);
      box(robot, [0.76, 0.06, 0.54], [0, 1.46, 0], gold);
      joints.head = group(robot, [0, 1.85, 0]);
      box(joints.head, [0.82, 0.52, 0.43], [0, 0, 0], body);
      box(joints.head, [0.66, 0.3, 0.03], [0, 0, 0.23], glass);
      mount = group(robot, [0, 1.15, 0.33]);
    } else {
      cylinder(robot, 0.65, 0.15, [0, 0.08, 0], dark);
      cylinder(robot, 0.52, 0.08, [0, 0.2, 0], gold);
      box(robot, [0.35, 0.65, 0.35], [0, 0.55, 0], silver);
      joints.core = group(robot, [0, 1.25, 0]);
      box(joints.core, [0.85, 0.85, 0.85], [0, 0, 0], body);
      for (const y of [-0.32, 0.32]) box(joints.core, [0.89, 0.05, 0.89], [0, y, 0], gold);
      mount = group(joints.core, [0, 0.1, 0.46]);
    }
    if (parameters.tool === 'camera') {
      box(mount, [0.48, 0.25, 0.3], [0, 0.12, 0], dark);
      cylinder(mount, 0.11, 0.12, [0, 0.12, 0.19], glass, true);
    } else if (parameters.tool === 'tray') {
      box(mount, [0.95, 0.08, 0.8], [0, 0, 0.2], silver);
      box(mount, [0.32, 0.27, 0.32], [0, 0.18, 0.2], gold);
    } else if (parameters.tool === 'display') {
      box(mount, [0.6, 0.4, 0.07], [0, 0, 0], dark);
      box(mount, [0.5, 0.3, 0.02], [0, 0, 0.05], glass);
      for (let i = 0; i < 3; i++) box(mount, [0.3 - i * 0.06, 0.025, 0.01], [0, 0.08 - i * 0.07, 0.07], gold);
    } else {
      joints.fingers = [-1, 1].map(sign => box(mount, [0.08, 0.28, 0.16], [sign * 0.16, 0.22, 0], dark));
    }
    frame(0); return definition;
  }
  function frame(seconds) {
    if (!robot) return;
    const t = stopped ? 0 : seconds, phase = t * Math.PI / 2;
    robot.position.set(0, 0, 0); robot.rotation.y = 0;
    if (definition.motion === 'inspect') robot.rotation.y = phase * 0.25;
    else {
      if (definition.family === 'mobile') { robot.position.x = Math.sin(phase) * 0.75; robot.rotation.y = Math.sin(phase) * 0.15; joints.wheels.forEach(w => { w.rotation.x = phase; }); }
      if (joints.base) { joints.base.rotation.y = Math.sin(phase) * 0.6; joints.shoulder.rotation.z = -0.35 + Math.sin(phase) * 0.15; joints.elbow.rotation.z = 0.85 + Math.cos(phase) * 0.25; }
      if (joints.head) joints.head.rotation.y = Math.sin(phase) * 0.35;
      if (joints.core) joints.core.rotation.y = phase * 0.35;
      if (joints.fingers) joints.fingers.forEach((f, i) => { f.position.x = (i ? 1 : -1) * (0.14 + (1 + Math.sin(phase)) * 0.03); });
    }
    controls.update(); renderer.render(scene, camera);
  }
  function resize() { const rect = canvas.getBoundingClientRect(); renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false); camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1); camera.updateProjectionMatrix(); }
  function resetCamera() { camera.position.set(4.2, 3.1, 5.2); controls.target.set(0, 1.05, 0); controls.update(); }
  resetCamera(); resize();
  return { setDesign, frame, resize, resetCamera, setWireframe(value) { robot?.traverse(obj => { if (obj.material) obj.material.wireframe = value; }); },
    dispose() { removeRobot(); controls.dispose(); floor.geometry.dispose(); floor.material.dispose(); grid.geometry.dispose(); grid.material.dispose(); renderer.dispose(); } };
}
