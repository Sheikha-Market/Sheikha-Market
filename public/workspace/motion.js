'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const player = $('motion-player');
  const base = './media/review-v1/';
  const files = {
    unified: { file: 'unified-web.mp4', poster: 'unified-poster.jpg', download: 'SHEIKHA_UNIFIED_MOTION_REVIEW_01.mp4' },
    cinematic: { file: 'cinematic.mp4', poster: 'cinematic-poster.jpg', download: 'cinematic.mp4' },
    wave: { file: 'wave.mp4', poster: 'wave-poster.jpg', download: 'wave.mp4' }
  };
  let clips = null, active = 'unified', loading = false;
  const visible = () => !document.querySelector('[data-page="motion"]').hidden;
  const status = (message, error = false) => {
    $('motion-status').textContent = message;
    $('motion-status').classList.toggle('error', error);
  };
  function select(id) {
    if (!clips || !Object.hasOwn(files, id)) return;
    active = id;
    const clip = clips.find(item => item.id === id), asset = files[id];
    player.pause();
    player.poster = base + asset.poster;
    player.src = base + asset.file;
    player.load();
    player.playbackRate = Number($('motion-speed').value);
    player.loop = $('motion-loop').checked;
    $('motion-title').textContent = clip.title;
    $('motion-note').textContent = clip.note;
    $('motion-facts').textContent = `${clip.duration} ثانية · ${clip.width} × ${clip.height} · ${clip.fps} إطار/ثانية · ${clip.audio ? 'بمسار صوتي' : 'بلا مسار صوتي'}${id === 'unified' ? ' · معاينة الويب 720p، التنزيل 1080p' : ''}`;
    $('motion-download').href = base + asset.download;
    $('motion-download').download = id === 'unified' ? asset.download : clip.sourceFilename;
    $('motion-download').querySelector('span').textContent = id === 'unified' ? 'تنزيل نسخة المراجعة' : 'تنزيل الأصل';
    $('motion-chapters').hidden = id !== 'unified';
    document.querySelector('.motion-audio').hidden = id !== 'unified';
    for (const button of document.querySelectorAll('[data-clip]')) button.setAttribute('aria-pressed', String(button.dataset.clip === id));
    status('جارٍ تجهيز المقطع');
  }
  async function load() {
    if (loading) return;
    loading = true;
    $('motion-error').hidden = true;
    status('جارٍ قراءة سجل المرئيات');
    try {
      const response = await fetch(base + 'manifest.json', { cache: 'no-cache', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw Error('MANIFEST_UNAVAILABLE');
      const manifest = await response.json();
      if (manifest.schema !== 'SHEIKHA_MOTION_REVIEW_V1' || !Array.isArray(manifest.clips) || manifest.clips.length !== 3 ||
        !Object.keys(files).every(id => manifest.clips.filter(clip => clip.id === id && clip.file === files[id].file &&
          Number.isFinite(clip.duration) && clip.duration > 0 && typeof clip.title === 'string' && typeof clip.note === 'string').length === 1)) throw Error('INVALID_MANIFEST');
      clips = manifest.clips;
      for (const button of document.querySelectorAll('[data-clip]')) button.disabled = false;
      $('motion-content').hidden = false;
      select(active);
    } catch {
      $('motion-error').hidden = false;
      $('motion-content').hidden = true;
      status('سجل المرئيات غير متاح', true);
    } finally { loading = false; }
  }
  for (const button of document.querySelectorAll('[data-clip]')) button.addEventListener('click', () => select(button.dataset.clip));
  for (const button of document.querySelectorAll('[data-seek]')) button.addEventListener('click', () => {
    if (active === 'unified' && player.readyState >= 1) player.currentTime = Number(button.dataset.seek);
  });
  $('motion-speed').addEventListener('change', () => { player.playbackRate = Number($('motion-speed').value); });
  $('motion-loop').addEventListener('change', () => { player.loop = $('motion-loop').checked; });
  $('motion-retry').addEventListener('click', load);
  player.addEventListener('loadedmetadata', () => {
    player.playbackRate = Number($('motion-speed').value);
    status('المقطع جاهز · بانتظار المراجعة');
  });
  player.addEventListener('error', () => status('تعذر تحميل المقطع. أعد اختياره للمحاولة مجددًا.', true));
  player.addEventListener('play', () => { if (!visible() || document.hidden) player.pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); });
  function onRoute() {
    if (!visible()) player.pause();
    else if (!clips) load();
  }
  window.addEventListener('hashchange', onRoute);
  onRoute();
})();
