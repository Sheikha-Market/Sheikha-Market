export function mountSheikhaVisual(host, asset) {
  if (!(host instanceof HTMLElement)) throw new TypeError('HOST_REQUIRED');
  if (!/^objects\/[a-f0-9]{64}\.(png|jpg|mp4)$/.test(asset.object)) throw new TypeError('ARCHIVED_MEDIA_REQUIRED');
  const figure = document.createElement('figure'); figure.className = 'sheikha-visual'; figure.dir = 'rtl';
  const media = document.createElement(asset.object.endsWith('.mp4') ? 'video' : 'img');
  media.src = '../../' + asset.object;
  if (media instanceof HTMLVideoElement) { media.controls = true; media.preload = 'none'; media.playsInline = true; }
  else { media.alt = asset.alt || 'تصور بصري لشيخة'; media.loading = 'lazy'; }
  const caption = document.createElement('figcaption'); caption.textContent = asset.caption || 'شيخة | تصور للمراجعة';
  figure.append(media, caption); host.replaceChildren(figure); return figure;
}
