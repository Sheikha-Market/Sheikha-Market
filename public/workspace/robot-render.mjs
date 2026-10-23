import { createRobotScene } from './robot-scene.mjs';
const scene = createRobotScene(document.getElementById('render-canvas'));
window.sheikhaRender = { setDesign: value => scene.setDesign(value), frame: seconds => scene.frame(seconds) };
