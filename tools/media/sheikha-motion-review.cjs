'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const SOURCES = Object.freeze([
  { id: 'cinematic', filename: 'SHEIKHA_CINEMATIC_MOTION_01.mp4', title: 'شيخة · الحركة المعمارية',
    sha256: 'ad5c818d88298a6515b9744e816e8cde505c7c667dae7bcc7ff104ce0ee96eb7', duration: 24, width: 1920, height: 1080, audio: true,
    note: 'تحريك فني من مرئي ثابت؛ ليس توثيقًا لمنشأة قائمة.' },
  { id: 'wave', filename: 'SHEIKHA_WAVE_PHYSICS_DEMO(1).mp4', title: 'شيخة · دراسة الموجة',
    sha256: '084e14de5cd4f445545b5e936bccb266a1af3b1f8b641cca430bdf237a0f67a5', duration: 10, width: 1280, height: 720, audio: false,
    note: 'عرض تعليمي على مجال اصطناعي؛ ليس CFD ولا محاكاة موقع معايرة.' }
]);
const OUTPUT = path.join(ROOT, 'public/workspace/media/review-v1');
const DEFAULT_SOURCE = '/home/sheikha/مستندات/شيخة الهوية';
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 600000, maxBuffer: 8 * 1024 * 1024, ...options });
  if (result.error || result.status !== 0) throw Error(`MEDIA_COMMAND_FAILED: ${result.error?.message || result.stderr?.slice(-4000)}`);
  return result;
}
function probe(file, ffprobe) {
  const data = JSON.parse(run(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]).stdout);
  const video = data.streams.find(s => s.codec_type === 'video'), audio = data.streams.find(s => s.codec_type === 'audio');
  if (!video) throw Error('VIDEO_REQUIRED');
  const [n, d] = video.avg_frame_rate.split('/').map(Number);
  return { duration: Number(data.format.duration), width: video.width, height: video.height, fps: n / d,
    frames: Number(video.nb_frames), codec: video.codec_name, pixelFormat: video.pix_fmt,
    audio: audio ? { codec: audio.codec_name, sampleRate: Number(audio.sample_rate), channels: audio.channels } : null,
    bytes: Number(data.format.size), metadataComment: data.format.tags?.comment || null };
}
function validateSource(file, spec, ffprobe) {
  if (!fs.lstatSync(file).isFile() || digest(file) !== spec.sha256) throw Error('SOURCE_HASH_MISMATCH');
  const data = probe(file, ffprobe);
  if (data.duration !== spec.duration || data.width !== spec.width || data.height !== spec.height || data.fps !== 24 || Boolean(data.audio) !== spec.audio) throw Error('SOURCE_FORMAT_MISMATCH');
  return data;
}
function makeFilter() {
  const normalize = 'fps=24,scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS';
  return `[0:v]${normalize}[a];[1:v]${normalize}[b];[a][b]xfade=transition=fade:duration=1:offset=23,fade=t=out:st=32.5:d=0.5,format=yuv420p[v];[0:a]asetpts=PTS-STARTPTS,afade=t=out:st=23:d=1,apad=pad_dur=9,atrim=duration=33[audio]`;
}
function measuredMotion(file, ffmpeg) {
  const r = run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-threads', '2', '-i', file, '-an', '-vf',
    'fps=6,scale=320:-2,tblend=all_mode=difference,signalstats,metadata=print:file=-', '-f', 'null', '-']);
  const values = [...r.stdout.matchAll(/lavfi\.signalstats\.YAVG=([0-9.]+)/g)].map(match => Number(match[1]));
  if (!values.length || values.some(value => !Number.isFinite(value))) throw Error('MOTION_MEASUREMENT_UNAVAILABLE');
  return { method: 'MEAN_ABSOLUTE_LUMA_FRAME_DIFFERENCE_AT_6FPS_320PX', units: '8-bit luma', samplePairs: values.length,
    mean: values.reduce((sum, n) => sum + n, 0) / values.length, max: Math.max(...values),
    limitation: 'Descriptive temporal change only; not displacement, flow speed or physics validation.' };
}
function build({ sourceDir = DEFAULT_SOURCE, ffmpeg = process.env.FFMPEG || 'ffmpeg', ffprobe = process.env.FFPROBE || 'ffprobe' } = {}) {
  const inputs = SOURCES.map(spec => ({ spec, file: path.join(sourceDir, spec.filename) }));
  const probes = inputs.map(({ spec, file }) => validateSource(file, spec, ffprobe));
  if (fs.existsSync(OUTPUT)) throw Error('OUTPUT_EXISTS_REFUSE_OVERWRITE');
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const stage = fs.mkdtempSync(path.join(path.dirname(OUTPUT), '.motion-build-'));
  const generated = new Date().toISOString();
  const encode = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'];
  const master = path.join(stage, 'SHEIKHA_UNIFIED_MOTION_REVIEW_01.mp4');
  const args = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-threads', '2', '-i', inputs[0].file,
    '-threads', '2', '-i', inputs[1].file, '-filter_complex_threads', '2', '-filter_complex', makeFilter(),
    '-map', '[v]', '-map', '[audio]', '-t', '33', ...encode, '-map_metadata', '-1',
    '-metadata', 'title=SHEIKHA Unified Motion Review 01',
    '-metadata', 'comment=DRAFT_REQUIRES_REVIEW. Complete 24s architectural artwork and 10s educational wave visual, overlapping by 1s. Wave upscaled from 720p; no added detail or physical validation. Original ambience fades to silence. No external publication.', master];
  console.log('Rendering 33-second review master...');
  run(ffmpeg, args);
  const masterInfo = probe(master, ffprobe);
  if (Math.abs(masterInfo.duration - 33) > 0.05 || masterInfo.frames !== 792 || masterInfo.width !== 1920 || masterInfo.height !== 1080) throw Error('OUTPUT_FORMAT_REJECTED');
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-threads', '2', '-i', master,
    '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-threads', '2',
    '-c:a', 'copy', '-movflags', '+faststart', path.join(stage, 'unified-web.mp4')]);
  const clips = [];
  for (const [index, { spec, file }] of inputs.entries()) {
    fs.copyFileSync(file, path.join(stage, `${spec.id}.mp4`), fs.constants.COPYFILE_EXCL);
    run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-ss', spec.id === 'wave' ? '2' : '1', '-i', file,
      '-vf', 'scale=960:540', '-frames:v', '1', '-threads', '1', path.join(stage, `${spec.id}-poster.jpg`)]);
    const samples = spec.id === 'cinematic' ? [24,120,216,312,408,552] : [0,48,96,144,192,239];
    run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-threads', '2', '-i', file,
      '-vf', `select='${samples.map(n => `eq(n,${n})`).join('+')}',scale=480:270,tile=3x2`, '-frames:v', '1', '-threads', '1', path.join(stage, `${spec.id}-contact.png`)]);
    clips.push({ id: spec.id, title: spec.title, file: `${spec.id}.mp4`, poster: `${spec.id}-poster.jpg`,
      sourceFilename: spec.filename, sha256: spec.sha256, note: spec.note, ...probes[index], motion: measuredMotion(file, ffmpeg),
      sampledSeconds: samples.map(n => n / 24) });
  }
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-ss', '1', '-i', master,
    '-vf', 'scale=960:540', '-frames:v', '1', '-threads', '1', path.join(stage, 'unified-poster.jpg')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-threads', '2', '-i', master,
    '-vf', "select='eq(n,540)+eq(n,558)+eq(n,570)+eq(n,582)+eq(n,600)+eq(n,768)',scale=480:270,tile=3x2", '-frames:v', '1', '-threads', '1', path.join(stage, 'join-contact.png')]);
  run(ffmpeg, ['-hide_banner', '-v', 'error', '-xerror', '-threads', '2', '-i', master, '-f', 'null', '-']);
  const audio = run(ffmpeg, ['-hide_banner', '-i', inputs[0].file, '-vn', '-af', 'volumedetect', '-f', 'null', '-']).stderr;
  const manifest = { schema: 'SHEIKHA_MOTION_REVIEW_V1', generatedAt: generated, status: 'DRAFT_REQUIRES_HUMAN_REVIEW',
    noExternalUpload: true, noPaidGeneration: true, originalFilesModified: false,
    tools: { ffmpeg: run(ffmpeg, ['-version']).stdout.split('\n')[0] },
    sourceAudio: { meanVolumeDb: Number(audio.match(/mean_volume: ([-\d.]+)/)?.[1]), peakVolumeDb: Number(audio.match(/max_volume: ([-\d.]+)/)?.[1]),
      listeningReview: 'NOT_PERFORMED', note: 'Signal measurements and stream metadata, not an auditory content assessment.' },
    clips: [{ id: 'unified', title: 'شيخة · المونتاج الموحّد', file: 'unified-web.mp4', master: path.basename(master), poster: 'unified-poster.jpg',
      note: 'مسودة للمراجعة؛ مقطع الموجة مكبّر من 720p، دون توليد تفاصيل جديدة.', ...masterInfo, playback: probe(path.join(stage, 'unified-web.mp4'), ffprobe) }, ...clips],
    timeline: [{ source: 'cinematic', sourceIn: 0, sourceOut: 24, timelineIn: 0, timelineOut: 24 },
      { source: 'wave', sourceIn: 0, sourceOut: 10, timelineIn: 23, timelineOut: 33 }],
    transition: { type: 'crossfade', start: 23, duration: 1 },
    audioPolicy: { originalAmbienceUntil: 24, fadeOutStart: 23, fadeOutDuration: 1, silenceFrom: 24, silenceUntil: 33, musicAdded: false },
    validation: { fullMasterDecode: 'PASS', originalHashesRechecked: false, physicalSimulationValidated: false, userApproved: false }
  };
  for (const { spec, file } of inputs) if (digest(file) !== spec.sha256) throw Error('ORIGINAL_CHANGED');
  manifest.validation.originalHashesRechecked = true;
  manifest.artifacts = fs.readdirSync(stage).sort().map(file => ({ file, bytes: fs.statSync(path.join(stage, file)).size, sha256: digest(path.join(stage, file)) }));
  fs.writeFileSync(path.join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  fs.renameSync(stage, OUTPUT);
  console.log(JSON.stringify({ output: OUTPUT, duration: masterInfo.duration, status: manifest.status }));
  return manifest;
}
if (require.main === module) { try { build(); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = { SOURCES, probe, makeFilter, build, validateSource };
