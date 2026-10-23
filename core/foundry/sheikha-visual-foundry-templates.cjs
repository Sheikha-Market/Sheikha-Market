'use strict';
const crypto = require('node:crypto');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const componentStyles = `
.sheikha-visual{margin:0;max-width:100%;background:#071e18;color:#fff;font:16px/1.6 Tahoma,Arial,sans-serif;letter-spacing:0}
.sheikha-visual img,.sheikha-visual video{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#071e18}
.sheikha-visual figcaption{padding:12px 16px;border-top:1px solid #ad8842;overflow-wrap:anywhere}
`;
const componentSource = String.raw`export function mountSheikhaVisual(host, asset) {
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
`;

function reviewPage(brief, assets) {
  const script = `const search=document.getElementById('search');let kind='all';
function filter(){let count=0;for(const item of document.querySelectorAll('.asset')){const match=(kind==='all'||item.dataset.kind===kind)&&item.textContent.toLowerCase().includes(search.value.toLowerCase());item.hidden=!match;if(match)count++;}document.getElementById('count').textContent=count;}
search.addEventListener('input',filter);for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{kind=button.dataset.filter;for(const item of document.querySelectorAll('[data-filter]'))item.setAttribute('aria-pressed',String(item===button));filter();});`;
  const scriptHash = crypto.createHash('sha256').update(script).digest('base64');
  const media = assets.map(asset => {
    if (!/^objects\/[a-f0-9]{64}\.(png|jpg|mp4|bin)$/.test(asset.object)) throw Error('INVALID_ARCHIVE_REFERENCE');
    const url = '../../' + asset.object;
    const title = asset.generated ? 'Foundry · تصور جديد للمراجعة' : asset.file.length > 90 ? `مرجع بصري · ${asset.sha256.slice(0, 8)}` : asset.file;
    const visual = asset.kind === 'image' ? `<img src="${url}" alt="${escape(title)}" loading="lazy">`
      : asset.kind === 'video' ? `<video src="${url}" controls playsinline preload="none" aria-label="${escape(title)}"></video>`
        : '<div class="document">وثيقة محفوظة دون تنفيذ</div>';
    return `<article class="asset" data-kind="${escape(asset.kind)}">${visual}<div class="asset-body"><h3>${escape(title)}</h3><p>${asset.generated ? 'توليد داخل جلسة · اعتماد بشري معلق' : 'مرجع أصلي · الحقوق قيد المراجعة'}</p><a href="${url}" download="${escape(asset.kind === 'document' ? asset.file + '.bin' : asset.file)}">تنزيل النسخة المحفوظة</a><details><summary>البصمة والمصدر</summary><code>${asset.sha256}</code><p>${escape(asset.file)}</p></details></div></article>`;
  }).join('');
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' file:; media-src 'self' file:; style-src 'unsafe-inline'; script-src 'sha256-${scriptHash}'; base-uri 'none'; form-action 'none'">
<title>فوندري شيخة | ${escape(brief.date)}</title><style>
*{box-sizing:border-box;letter-spacing:0}body{margin:0;background:#f4f7f6;color:#173e34;font:15px/1.8 Tahoma,Arial,sans-serif}a{color:#165b4b}button,input{font:inherit}header{background:#071e18;color:#f2d18a;border-bottom:2px solid #b5934f;padding:20px 28px}header a{color:#f2d18a}h1{font-size:26px;margin:0}h2{font-size:20px}h3{font-size:15px;margin:0;overflow-wrap:anywhere}main{max-width:1440px;margin:auto;padding:24px}nav,.toolbar,.facts{display:flex;flex-wrap:wrap;gap:12px;align-items:center}nav{margin-top:12px}.facts{padding:16px 0;border-bottom:1px solid #c8d6cf;justify-content:space-between}.facts p{margin:0}.state{color:#704b13;background:#fff2d6;padding:4px 10px}.toolbar{margin:20px 0}.toolbar label{flex:1;min-width:180px}input{width:100%;border:1px solid #a6beb4;padding:9px;background:white;border-radius:4px}button{padding:8px 14px;border:1px solid #8ea79c;background:white;color:#173e34;cursor:pointer}button[aria-pressed=true]{background:#174b3b;color:white}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #a77819;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.asset{border:1px solid #c4d3cb;background:white;border-radius:6px;overflow:hidden;min-width:0}.asset img,.asset video,.document{display:block;width:100%;aspect-ratio:16/10;object-fit:contain;background:#0b241c}.document{display:grid;place-items:center;color:#e2c286}.asset-body{padding:14px}.asset p{font-size:12px;color:#52695e;overflow-wrap:anywhere}code{direction:ltr;display:block;overflow-wrap:anywhere;font-size:11px}details{margin-top:8px;font-size:12px}footer{border-top:1px solid #b8cdc0;padding:18px 28px;font-size:12px}.review{padding:20px 0;border-bottom:1px solid #c8d6cf}.review p{margin:4px 0}.outputs{display:flex;flex-wrap:wrap;gap:16px}small{color:#52695e}[hidden]{display:none!important}@media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){.grid{grid-template-columns:1fr}main{padding:16px}header{padding:18px 16px}h1{font-size:23px}.toolbar label{flex-basis:100%}button{flex:1}}
</style></head><body>
<header><h1>شيخة | Foundry</h1><div>${escape(brief.theme)} · ${escape(brief.date)}</div><nav class="outputs" aria-label="مخرجات الإصدار"><a href="brief.json" download>موجز الإنتاج</a><a href="component.mjs" download>مكون الواجهة</a><a href="component.css" download>تنسيق المكون</a><a href="motion-plan.json" download>خطة الحركة</a><a href="improvements.json" download>قائمة التحسين</a></nav></header>
<main><div class="facts"><p>الأصول: <strong>${assets.length}</strong></p><p>التوقيت: ${escape(brief.timezone)}</p><span class="state">بانتظار المراجعة البشرية</span></div>
<section class="review"><h2>حالة الإنتاج</h2><p>الأرشيف: محفوظ ومفحوص · مكون الواجهة: مسودة محلية · النشر: غير مفعّل</p><p>توليد المرئيات والفيديوهات الجديدة المجدول: بانتظار إعداد المزود والميزانية.</p><small>مرئيات المدن والمنشآت تصورات بصرية وليست إثباتًا لوجود منشآت قائمة.</small></section>
<div class="toolbar"><label><input id="search" type="search" aria-label="بحث في الأصول" placeholder="بحث في الأصول"></label><button data-filter="all" aria-pressed="true">الكل</button><button data-filter="image" aria-pressed="false">المرئيات</button><button data-filter="video" aria-pressed="false">الفيديو</button><button data-filter="document" aria-pressed="false">الوثائق</button><output id="count" aria-live="polite">${assets.length}</output></div>
<section class="grid" aria-label="الأصول والمخرجات">${media}</section></main><footer>SHEIKHA UGIT-RP · إصدار مراجعة محلي · ${escape(brief.id)}</footer><script>${script}</script></body></html>`;
}
module.exports = { reviewPage, componentSource, componentStyles };
