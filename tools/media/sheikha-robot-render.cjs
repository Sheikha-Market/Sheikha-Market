'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { validateDesign } = require('../../core/robotics/sheikha-design-studio.cjs');
const temporaryTools = '/tmp/sheikha-video-tools/root';
function binary(name) {
  const supplied = process.env[name.toUpperCase()];
  return supplied || (fs.existsSync(`${temporaryTools}/usr/bin/${name}`) ? `${temporaryTools}/usr/bin/${name}` : name);
}
function command(name, args) {
  const result = spawnSync(binary(name), args, { encoding: 'utf8', timeout: 120000, maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || `${temporaryTools}/usr/lib/x86_64-linux-gnu` } });
  if (result.error || result.status !== 0) throw Error('MEDIA_TOOL_FAILED');
  return result.stdout;
}
function preflight() {
  const result = { ffmpeg: false, ffprobe: false, browser: false, playwright: false };
  for (const name of ['ffmpeg', 'ffprobe']) { try { command(name, ['-version']); result[name] = true; } catch {} }
  result.browser = fs.existsSync(process.env.CHROME_PATH || '/opt/google/chrome/chrome');
  try { require.resolve(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright'); result.playwright = true; } catch {}
  return { available: Object.values(result).every(Boolean), dependencies: result };
}
async function render(folder, origin) {
  if (!/^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(origin)) throw Error('ORIGIN_REJECTED');
  const blueprint = JSON.parse(fs.readFileSync(path.join(folder, 'blueprint.json'), 'utf8'));
  const parameters = validateDesign(blueprint.parameters);
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
  const frames = fs.mkdtempSync(path.join(folder, 'frames-'));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/google/chrome/chrome', headless: true,
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/workspace/robot-render.html');
    await page.waitForFunction(() => Boolean(window.sheikhaRender));
    await page.evaluate(p => window.sheikhaRender.setDesign(p), parameters);
    for (let index = 0; index < 96; index++) {
      await page.evaluate(t => window.sheikhaRender.frame(t), index / 24);
      await page.screenshot({ path: path.join(frames, String(index).padStart(4, '0') + '.png') });
    }
    if (errors.length) throw Error('SCENE_RENDER_FAILED');
    fs.copyFileSync(path.join(frames, '0024.png'), path.join(folder, 'poster.png'), fs.constants.COPYFILE_EXCL);
    const video = path.join(folder, 'video.partial.mp4');
    command('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-framerate', '24', '-i', path.join(frames, '%04d.png'),
      '-an', '-c:v', 'libx264', '-crf', '21', '-preset', 'fast', '-threads', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      '-metadata', 'title=SHEIKHA Robot Concept Motion', '-metadata', 'comment=LOCAL_PARAMETRIC_RENDER. DRAFT_REQUIRES_REVIEW. Not physical robot footage, dynamics, collision validation, manufacturing approval or a trained generative video model.', video]);
    const data = JSON.parse(command('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', video]));
    const stream = data.streams.find(item => item.codec_type === 'video');
    if (Number(data.format.duration) !== 4 || Number(stream?.nb_frames) !== 96 || stream.width !== 960 || stream.height !== 540 || data.streams.length !== 1) throw Error('RENDER_VERIFICATION_FAILED');
    command('ffmpeg', ['-hide_banner', '-v', 'error', '-xerror', '-threads', '2', '-i', video, '-f', 'null', '-']);
    const evidence = { schema: 'SHEIKHA_ROBOT_RENDER_EVIDENCE_V1', designId: blueprint.id, status: 'DRAFT_REQUIRES_HUMAN_REVIEW',
      provider: 'sheikha-local', method: 'THREEJS_PARAMETRIC_FRAMES_FFMPEG', trainedVideoModel: false, duration: 4, fps: 24, frames: 96,
      width: 960, height: 540, audio: false, fullDecode: 'PASS', sha256: crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex'),
      bytes: fs.statSync(video).size, physicalCommandsSent: false, externalRequestsSent: false, userApproved: false, createdAt: new Date().toISOString() };
    fs.writeFileSync(path.join(folder, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(video, path.join(folder, 'video.mp4'));
  } finally { await browser.close(); fs.rmSync(frames, { recursive: true, force: true }); }
}
if (require.main === module) render(process.argv[2], process.argv[3]).catch(() => { console.error('LOCAL_RENDER_FAILED'); process.exitCode = 1; });
module.exports = { render, preflight };
