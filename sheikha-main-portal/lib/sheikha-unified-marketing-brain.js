/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ﷽  بسم الله الرحمن الرحيم                                               ║
 * ║                                                                          ║
 * ║  SHEIKHA UNIFIED MARKETING BRAIN (UMB)                                   ║
 * ║  منظومة شيخة للتسويق الشامل الموحد                                       ║
 * ║                                                                          ║
 * ║  ✅ الصور المتناسقة مع الهوية البصرية                                    ║
 * ║  ✅ الرزنامة والأحداث الزمنية الفعلية                                    ║
 * ║  ✅ الحملات الكاملة + السلوك + التتبع                                     ║
 * ║  ✅ توليد المحتوى AI — بايو · عناوين · تعليقات · هاشتاقات               ║
 * ║  ✅ وسائل التواصل الاجتماعي — الجدولة + النشر                            ║
 * ║  ✅ الدعاية بكل وسيلة — رقمي · مطبوع · إذاعي · تلفزيوني                ║
 * ║                                                                          ║
 * ║  © 2026 سلمان أحمد بن سلمان الراجح                                      ║
 * ║  REST: /api/umb/* + /api/تسويق-شامل/*                                   ║
 * ║  APIs: 60 مسار                                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Paths ──────────────────────────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, '..', 'data');
const DB_FILE   = path.join(DATA_DIR,  'umb-db.json');
const IMGS_DIR  = path.join(__dirname, '..', 'public', 'generated-images');
const AR_BASE   = '/api/تسويق-شامل';
const EN_BASE   = '/api/umb';

if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR,  { recursive: true });
if (!fs.existsSync(IMGS_DIR))  fs.mkdirSync(IMGS_DIR,  { recursive: true });

// ── Brand Identity ─────────────────────────────────────────────────────────
const BRAND = {
  name: { ar: 'شيخة', en: 'Sheikha' },
  slogan: { ar: 'سوق المعادن الذكي — بالحكمة والإتقان', en: 'Smart Metals Market — By Wisdom & Mastery' },
  colors: {
    primary:   { name: 'أخضر شيخة',  hex: '#006c35', rgb: '0,108,53'   },
    secondary: { name: 'ذهبي شيخة',  hex: '#c9a42c', rgb: '201,164,44' },
    accent:    { name: 'أزرق شيخة',  hex: '#1a5276', rgb: '26,82,118'  },
    light:     { name: 'أبيض عاجي',  hex: '#faf7f0', rgb: '250,247,240' },
    dark:      { name: 'كحلي شيخة',  hex: '#1a1a2e', rgb: '26,26,46'   },
    gold_l:    { name: 'ذهبي فاتح',  hex: '#f0d060', rgb: '240,208,96' },
  },
  typography: {
    arabic:  ['خط تجوال', 'خط الأميري', 'Tajawal', 'Cairo'],
    english: ['Playfair Display', 'Inter', 'JetBrains Mono'],
  },
  patterns: ['زخارف هندسية إسلامية', 'أرابيسك', 'نجمة ثمانية', 'أنماط تكرارية', 'خطوط عربية'],
  voice: {
    tone:     ['رسمي محترم', 'دافئ وودود', 'واثق', 'واضح مباشر', 'ملهم'],
    doAr:     ['البسملة في البداية', 'اللغة الفصحى', 'الدقة في المعلومات'],
    dontAr:   ['لا صور ذوات أرواح', 'لا عامية', 'لا مبالغة'],
  },
  sharía: {
    note:   'الهوية تعكس قيم الإسلام — الجمال والإتقان والأمانة',
    quran:  ['﴿ إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ ﴾', '﴿ وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ ﴾'],
    hadith: ['«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»'],
  },
};

// ── Social Platforms ───────────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'whatsapp',   ar: 'واتساب',       maxChars: 65536, bestTimes: ['08:00','12:00','18:00','21:00'], contentTypes: ['text','image','video','document','link'], islamicScore: 90 },
  { id: 'instagram',  ar: 'إنستقرام',     maxChars: 2200,  bestTimes: ['07:00','12:00','17:00','19:00'], contentTypes: ['image','reel','story','carousel'],        islamicScore: 68 },
  { id: 'twitter_x',  ar: 'إكس (تويتر)', maxChars: 280,   bestTimes: ['09:00','12:00','15:00','20:00'], contentTypes: ['text','image','video','thread'],          islamicScore: 70 },
  { id: 'tiktok',     ar: 'تيك توك',     maxChars: 2200,  bestTimes: ['06:00','10:00','19:00','22:00'], contentTypes: ['short_video','live'],                     islamicScore: 55 },
  { id: 'snapchat',   ar: 'سناب شات',    maxChars: 250,   bestTimes: ['08:00','14:00','20:00'],         contentTypes: ['story','ad','spotlight'],                 islamicScore: 60 },
  { id: 'youtube',    ar: 'يوتيوب',      maxChars: 5000,  bestTimes: ['12:00','17:00','20:00'],         contentTypes: ['video','short','live','community'],       islamicScore: 75 },
  { id: 'linkedin',   ar: 'لينكدإن',     maxChars: 3000,  bestTimes: ['09:00','12:00','17:00'],         contentTypes: ['post','article','video','document'],      islamicScore: 85 },
  { id: 'telegram',   ar: 'تيليجرام',    maxChars: 4096,  bestTimes: ['09:00','12:00','18:00','21:00'], contentTypes: ['text','image','video','file','poll'],     islamicScore: 88 },
  { id: 'facebook',   ar: 'فيسبوك',      maxChars: 63206, bestTimes: ['09:00','13:00','16:00','19:00'], contentTypes: ['post','reel','story','ad','event'],       islamicScore: 65 },
  { id: 'threads',    ar: 'ثريدز',       maxChars: 500,   bestTimes: ['09:00','12:00','18:00'],         contentTypes: ['text','image','video'],                   islamicScore: 65 },
];

// ── Ad Channels ────────────────────────────────────────────────────────────
const AD_CHANNELS = [
  { id: 'google_ads',    ar: 'إعلانات جوجل',        type: 'digital',  formats: ['بحث','عرض','فيديو','تسوق','تطبيق'],  cpm: 2.5,  reach: 'عالمي' },
  { id: 'meta_ads',      ar: 'إعلانات ميتا',         type: 'digital',  formats: ['صورة','فيديو','كاروسيل','ستوري'],    cpm: 3.5,  reach: 'عالمي' },
  { id: 'tiktok_ads',    ar: 'إعلانات تيك توك',     type: 'digital',  formats: ['in-feed','spark','top-view'],         cpm: 4.0,  reach: 'شبابي' },
  { id: 'snapchat_ads',  ar: 'إعلانات سناب',        type: 'digital',  formats: ['snap_ad','filter','lens'],            cpm: 3.0,  reach: 'خليجي شبابي' },
  { id: 'twitter_ads',   ar: 'إعلانات إكس',          type: 'digital',  formats: ['promoted_tweet','video','carousel'],  cpm: 2.0,  reach: 'مهتمون' },
  { id: 'youtube_ads',   ar: 'إعلانات يوتيوب',      type: 'digital',  formats: ['pre-roll','bumper','discovery'],       cpm: 5.0,  reach: 'عالمي واسع' },
  { id: 'linkedin_ads',  ar: 'إعلانات لينكدإن',     type: 'digital',  formats: ['sponsored_post','InMail','video'],    cpm: 8.0,  reach: 'B2B مهني' },
  { id: 'sms',           ar: 'رسائل SMS',           type: 'direct',   formats: ['نص','رابط','كود'],                    cpm: 15.0, reach: 'مباشر' },
  { id: 'whatsapp_biz',  ar: 'واتساب للأعمال',      type: 'direct',   formats: ['نص','صورة','فيديو','بطاقة'],         cpm: 10.0, reach: 'مباشر جداً' },
  { id: 'email_mkt',     ar: 'البريد الإلكتروني',   type: 'direct',   formats: ['newsletter','promo','transactional'], cpm: 1.5,  reach: 'مستهدف' },
  { id: 'tv_local',      ar: 'تلفزيون محلي',        type: 'broadcast',formats: ['30ث','60ث','15ث'],                    cpm: 50.0, reach: 'محلي واسع' },
  { id: 'tv_satellite',  ar: 'تلفزيون فضائي',       type: 'broadcast',formats: ['30ث','60ث'],                          cpm: 80.0, reach: 'إقليمي' },
  { id: 'radio',         ar: 'راديو',               type: 'broadcast',formats: ['15ث','30ث','60ث','رعاية'],            cpm: 20.0, reach: 'محلي' },
  { id: 'outdoor',       ar: 'لافتات خارجية',       type: 'outdoor',  formats: ['بيلبورد','لايت بوكس','ستارة'],       cpm: 30.0, reach: 'جغرافي' },
  { id: 'print_news',    ar: 'صحف ومجلات',          type: 'print',    formats: ['ربع صفحة','نصف صفحة','صفحة كاملة'],  cpm: 25.0, reach: 'مستهدف قراء' },
  { id: 'influencer',    ar: 'مؤثرون',              type: 'social',   formats: ['بوست','ريل','ستوري','يوتيوب'],        cpm: 12.0, reach: 'قاعدة المؤثر' },
  { id: 'podcast',       ar: 'بودكاست',             type: 'audio',    formats: ['host-read','pre-roll','mid-roll'],     cpm: 18.0, reach: 'مستمعون' },
  { id: 'cinema',        ar: 'سينما',               type: 'outdoor',  formats: ['30ث قبل الفيلم'],                     cpm: 40.0, reach: 'شبابي مرتفع الدخل' },
];

// ── Islamic Events & Saudi Calendar ───────────────────────────────────────
const ISLAMIC_EVENTS = [
  { id: 'ramadan',        ar: 'رمضان المبارك',       hijri: '1/رمضان', tier: 'A', adBoost: 3.0 },
  { id: 'eid_fitr',       ar: 'عيد الفطر',           hijri: '1-3/شوال', tier: 'A', adBoost: 4.0 },
  { id: 'eid_adha',       ar: 'عيد الأضحى',          hijri: '10-12/ذي الحجة', tier: 'A', adBoost: 4.0 },
  { id: 'national_day',   ar: 'اليوم الوطني السعودي',gregorian: '23/09', tier: 'A', adBoost: 3.5 },
  { id: 'founding_day',   ar: 'يوم التأسيس',          gregorian: '22/02', tier: 'B', adBoost: 2.5 },
  { id: 'mothers_day',    ar: 'يوم الأم',             gregorian: '21/03', tier: 'B', adBoost: 2.0 },
  { id: 'valentine',      ar: 'يوم الحب (مناسبة تسويقية)', gregorian: '14/02', tier: 'C', adBoost: 1.5 },
  { id: 'back_to_school', ar: 'العودة للمدارس',       gregorian: '09/01', tier: 'B', adBoost: 2.0 },
  { id: 'black_friday',   ar: 'الجمعة البيضاء',      gregorian: '11/28', tier: 'A', adBoost: 3.0 },
  { id: 'new_year',       ar: 'رأس السنة الميلادية', gregorian: '01/01', tier: 'B', adBoost: 2.0 },
  { id: 'riyadh_season',  ar: 'موسم الرياض',         note: 'أكتوبر–يناير', tier: 'A', adBoost: 2.5 },
  { id: 'hajj',           ar: 'موسم الحج',            hijri: 'ذو الحجة', tier: 'A', adBoost: 2.5 },
];

// ── Content Templates ──────────────────────────────────────────────────────
const CONTENT_TEMPLATES = {
  bio: {
    brand: (n,s) => `${n} | ${s}\n🌟 منظومة تقنية إسلامية متكاملة\n📊 أسواق المعادن · التحليل الذكي · التجارة الإلكترونية\n🌐 sheikha.top | ☪️ امتثال شرعي كامل`,
    merchant: (n) => `🏪 ${n} | موثّق على منصة شيخة\n⚙️ متخصص في معادن السوق العالمي\n✅ موثوقية · شفافية · إتقان\n📩 للتواصل التجاري: عبر المنصة`,
    product:  (n,p) => `✨ ${n}\n💰 ${p}\n🏆 جودة معتمدة · توصيل سريع · ضمان شامل\n🛒 اطلب الآن عبر منصة شيخة`,
  },
  caption: {
    smi:        (g,s,c,i) => `📊 مؤشر SMI الآن:\n🥇 ذهب: $${g}/oz\n🥈 فضة: $${s}/oz\n🔶 نحاس: $${c}$/طن\n⚙️ حديد: $${i}$/طن\n\n📈 ابقَ على اطلاع مع شيخة\n#SMI #معادن #ذهب #تجارة`,
    product:    (n,p) => `🌟 ${n} — متوفر الآن!\n💎 سعر مميز: ${p}\n🚀 اطلب الآن وادفع عند الاستلام\n✅ جودة معتمدة · شحن خلال 24 ساعة\n#شيخة #منتج #تسوق`,
    educational:(t,b) => `💡 هل تعرف أن ${t}؟\n\n${b}\n\n📚 متابعة المزيد من المعلومات على منصة شيخة\n#تعليم #معرفة #شيخة`,
    promo:      (o,d) => `🔥 عرض لا تفوته!\n${o}\n⏰ ينتهي خلال: ${d}\n🛒 تسوّق الآن\n#عروض #خصم #شيخة`,
  },
  title: {
    article:   (t) => `${t} — دليل شامل من منظومة شيخة`,
    video:     (t) => `🎬 ${t} | شيخة للمعادن`,
    post:      (t) => `${t} ✅ | شيخة`,
    newsletter:(t) => `📧 نشرة شيخة الأسبوعية: ${t}`,
  },
  hashtags: {
    brand:       ['#شيخة','#SheikhaMarket','#منصة_شيخة','#sheikha_top'],
    metals:      ['#معادن','#ذهب','#فضة','#نحاس','#حديد','#metals','#gold','#silver'],
    smi:         ['#SMI','#مؤشر_المعادن','#أسعار_المعادن','#metals_index'],
    trading:     ['#تجارة','#أسواق','#استثمار','#trading','#business'],
    ksa:         ['#السعودية','#الرياض','#رؤية_2030','#KSA','#Saudi'],
    ramadan:     ['#رمضان','#رمضان_كريم','#عروض_رمضان','#Ramadan'],
    national:    ['#اليوم_الوطني','#السعودية_توحد_قلوبنا','#NationalDay'],
  },
};

// ── Image Templates (SVG/CSS brand-consistent) ─────────────────────────────
function generateBrandImage(opts = {}) {
  const {
    type     = 'post',        // post | story | reel_cover | banner | ad | thumbnail
    title    = 'شيخة',
    subtitle = '',
    data     = {},
    event    = null,
    color    = 'primary',     // primary | secondary | accent | dark
  } = opts;

  const bg  = color === 'secondary' ? '#c9a42c' :
              color === 'accent'    ? '#1a5276' :
              color === 'dark'      ? '#1a1a2e' : '#006c35';
  const fg  = '#faf7f0';
  const gld = '#c9a42c';

  const dims = {
    post:      { w: 1080, h: 1080, label: '1:1 بوست' },
    story:     { w: 1080, h: 1920, label: '9:16 ستوري/ريل' },
    reel_cover:{ w: 1080, h: 1920, label: '9:16 غلاف' },
    banner:    { w: 1200, h: 630,  label: '1.91:1 بانر' },
    ad:        { w: 1080, h: 1080, label: '1:1 إعلان' },
    thumbnail: { w: 1280, h: 720,  label: '16:9 مصغرة' },
    landscape: { w: 1280, h: 720,  label: '16:9 أفقي' },
  };
  const d = dims[type] || dims.post;

  const id   = 'IMG-' + Date.now() + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | شيخة</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${d.w}px;height:${d.h}px;overflow:hidden;font-family:'Tajawal',sans-serif;direction:rtl;background:${bg}}
.frame{
  position:relative;width:100%;height:100%;
  background:linear-gradient(145deg,${bg} 0%,${bg}ee 60%,#000a 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;
}
.geo-bg{
  position:absolute;inset:0;
  background:
    repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(${BRAND.colors.secondary.rgb},.06) 40px, rgba(${BRAND.colors.secondary.rgb},.06) 41px),
    repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(${BRAND.colors.secondary.rgb},.04) 40px, rgba(${BRAND.colors.secondary.rgb},.04) 41px);
}
.corner{position:absolute;width:80px;height:80px;border-color:${gld}}
.tl{top:20px;right:20px;border-top:3px solid;border-right:3px solid}
.tr{top:20px;left:20px;border-top:3px solid;border-left:3px solid}
.bl{bottom:20px;right:20px;border-bottom:3px solid;border-right:3px solid}
.br{bottom:20px;left:20px;border-bottom:3px solid;border-left:3px solid}
.badge{
  background:rgba(${BRAND.colors.secondary.rgb},.15);
  border:1.5px solid ${gld};
  border-radius:50px;
  padding:8px 24px;
  font-size:${Math.round(d.w * 0.018)}px;
  color:${gld};
  font-weight:700;
  letter-spacing:1px;
  margin-bottom:30px;
}
.main-title{
  font-size:${Math.round(d.w * 0.065)}px;
  font-weight:900;
  color:${fg};
  text-align:center;
  line-height:1.3;
  margin-bottom:20px;
  text-shadow:0 2px 20px rgba(0,0,0,.4);
}
.subtitle{
  font-size:${Math.round(d.w * 0.032)}px;
  color:rgba(${parseInt(fg.slice(1,3),16)},${parseInt(fg.slice(3,5),16)},${parseInt(fg.slice(5,7),16)},.8);
  text-align:center;
  line-height:1.5;
  margin-bottom:40px;
  max-width:80%;
}
.divider{
  width:120px;height:3px;
  background:linear-gradient(90deg,transparent,${gld},transparent);
  margin:20px auto;
}
.star-row{display:flex;gap:12px;justify-content:center;margin-bottom:30px;font-size:${Math.round(d.w*0.025)}px}
.data-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:16px;
  width:100%;max-width:${Math.round(d.w*0.8)}px;margin-top:20px
}
.data-box{
  background:rgba(255,255,255,.1);
  border:1px solid rgba(${BRAND.colors.secondary.rgb},.3);
  border-radius:12px;padding:16px;text-align:center;
}
.data-label{font-size:${Math.round(d.w*0.022)}px;color:${gld};font-weight:700}
.data-value{font-size:${Math.round(d.w*0.028)}px;color:${fg};font-weight:900;margin-top:4px}
.brand-mark{
  position:absolute;bottom:${Math.round(d.h*0.04)}px;
  display:flex;align-items:center;gap:12px;
}
.brand-logo{
  font-size:${Math.round(d.w*0.03)}px;font-weight:900;
  background:linear-gradient(135deg,${gld},#f0d060);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.brand-url{font-size:${Math.round(d.w*0.018)}px;color:rgba(250,247,240,.6)}
.event-ribbon{
  position:absolute;top:0;left:0;right:0;
  background:linear-gradient(90deg,${gld},#f0d060,${gld});
  color:#000;font-weight:900;text-align:center;
  font-size:${Math.round(d.w*0.022)}px;padding:8px;
}
.smi-row{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-top:16px}
.smi-item{
  background:rgba(255,255,255,.08);
  border:1px solid rgba(${BRAND.colors.secondary.rgb},.4);
  border-radius:10px;padding:12px 20px;text-align:center;
}
.smi-metal{font-size:${Math.round(d.w*0.02)}px;color:${gld};font-weight:700}
.smi-price{font-size:${Math.round(d.w*0.028)}px;color:${fg};font-weight:900}
.smi-change{font-size:${Math.round(d.w*0.016)}px}
.up{color:#4ade80}.down{color:#f87171}
</style></head>
<body>
<div class="frame">
  <div class="geo-bg"></div>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  ${event ? `<div class="event-ribbon">🌙 ${event}</div>` : ''}
  <div class="badge">✦ منظومة شيخة الذكية ✦</div>
  <div class="main-title">${title}</div>
  ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
  <div class="divider"></div>
  <div class="star-row">✦ ✦ ✦ ✦ ✦</div>
  ${data.metals ? `<div class="smi-row">
    ${Object.entries(data.metals).map(([k,v])=>`
    <div class="smi-item">
      <div class="smi-metal">${k}</div>
      <div class="smi-price">${v.price}</div>
      <div class="smi-change ${v.change>=0?'up':'down'}">${v.change>=0?'▲':'▼'} ${Math.abs(v.change)}%</div>
    </div>`).join('')}
  </div>` : ''}
  ${data.grid ? `<div class="data-grid">
    ${data.grid.map(item=>`<div class="data-box">
      <div class="data-label">${item.label}</div>
      <div class="data-value">${item.value}</div>
    </div>`).join('')}
  </div>` : ''}
  <div class="brand-mark">
    <div class="brand-logo">شيخة</div>
    <div class="brand-url">sheikha.top</div>
  </div>
</div>
</body></html>`;

  const filename = `${id}.html`;
  const filepath = path.join(IMGS_DIR, filename);
  fs.writeFileSync(filepath, html);

  return {
    id, filename, type,
    dimensions: d,
    publicPath: `/generated-images/${filename}`,
    label:      d.label,
    brand:      { bg, fg: gld },
    generatedAt: new Date().toISOString(),
  };
}

// ── Content AI Generator ────────────────────────────────────────────────────
function generateContent(type, params = {}) {
  const ts = new Date();
  const bismillah = 'بسم الله الرحمن الرحيم\n\n';

  switch (type) {
    case 'bio_brand':
      return {
        ar: bismillah + CONTENT_TEMPLATES.bio.brand(params.name || 'شيخة', params.slogan || BRAND.slogan.ar),
        en: `Sheikha Smart Market | ${params.slogan || BRAND.slogan.en}\n🌟 Integrated Islamic Tech Platform\n📊 Metals · Smart Analytics · E-Commerce\n🌐 sheikha.top`,
        tags: CONTENT_TEMPLATES.hashtags.brand.concat(CONTENT_TEMPLATES.hashtags.metals),
      };
    case 'bio_merchant':
      return {
        ar: bismillah + CONTENT_TEMPLATES.bio.merchant(params.name || 'تاجر شيخة'),
        tags: CONTENT_TEMPLATES.hashtags.brand.concat(CONTENT_TEMPLATES.hashtags.trading),
      };
    case 'bio_product':
      return {
        ar: bismillah + CONTENT_TEMPLATES.bio.product(params.name || 'منتج', params.price || 'تواصل للسعر'),
        tags: CONTENT_TEMPLATES.hashtags.brand,
      };
    case 'caption_smi':
      return {
        ar: bismillah + CONTENT_TEMPLATES.caption.smi(
          params.gold || '—', params.silver || '—', params.copper || '—', params.iron || '—'
        ),
        tags: CONTENT_TEMPLATES.hashtags.smi.concat(CONTENT_TEMPLATES.hashtags.brand),
        bestPlatforms: ['instagram','twitter_x','whatsapp','telegram'],
      };
    case 'caption_product':
      return {
        ar: bismillah + CONTENT_TEMPLATES.caption.product(params.name || 'المنتج', params.price || 'اتصل للسعر'),
        tags: CONTENT_TEMPLATES.hashtags.brand.concat(['#منتج','#تسوق']),
        bestPlatforms: ['instagram','facebook','whatsapp'],
      };
    case 'caption_educational':
      return {
        ar: bismillah + CONTENT_TEMPLATES.caption.educational(params.topic || 'معلومة قيّمة', params.body || params.topic),
        tags: CONTENT_TEMPLATES.hashtags.brand.concat(['#تعليم','#معرفة','#ثقافة_مالية']),
        bestPlatforms: ['linkedin','youtube','telegram'],
      };
    case 'caption_promo':
      return {
        ar: bismillah + CONTENT_TEMPLATES.caption.promo(params.offer || 'عرض مميز', params.duration || '48 ساعة'),
        tags: CONTENT_TEMPLATES.hashtags.brand.concat(['#عروض','#خصم','#تخفيضات']),
        bestPlatforms: ['whatsapp','instagram','snapchat','tiktok'],
      };
    case 'caption_event': {
      const ev = params.event || {};
      return {
        ar: bismillah + `🌙 بمناسبة ${ev.ar || 'المناسبة'}\n\nتهنئكم منظومة شيخة بهذه المناسبة المباركة\n\nنسأل الله أن يتقبل منا ومنكم صالح الأعمال\n\n${params.extra || ''}\n\n${CONTENT_TEMPLATES.hashtags.brand.join(' ')}`,
        tags: ev.id === 'ramadan' ? CONTENT_TEMPLATES.hashtags.ramadan.concat(CONTENT_TEMPLATES.hashtags.brand)
            : ev.id === 'national_day' ? CONTENT_TEMPLATES.hashtags.national.concat(CONTENT_TEMPLATES.hashtags.brand)
            : CONTENT_TEMPLATES.hashtags.brand,
        bestPlatforms: ['all'],
      };
    }
    case 'title':
      return {
        article:    CONTENT_TEMPLATES.title.article(params.topic  || 'الموضوع'),
        video:      CONTENT_TEMPLATES.title.video(params.topic    || 'الموضوع'),
        post:       CONTENT_TEMPLATES.title.post(params.topic     || 'الموضوع'),
        newsletter: CONTENT_TEMPLATES.title.newsletter(params.topic || 'الموضوع'),
        tags: CONTENT_TEMPLATES.hashtags.brand,
      };
    case 'hashtags': {
      const base = CONTENT_TEMPLATES.hashtags.brand;
      const ctx  = [];
      if (params.metals)   ctx.push(...CONTENT_TEMPLATES.hashtags.metals);
      if (params.smi)      ctx.push(...CONTENT_TEMPLATES.hashtags.smi);
      if (params.ksa)      ctx.push(...CONTENT_TEMPLATES.hashtags.ksa);
      if (params.ramadan)  ctx.push(...CONTENT_TEMPLATES.hashtags.ramadan);
      if (params.national) ctx.push(...CONTENT_TEMPLATES.hashtags.national);
      if (params.trading)  ctx.push(...CONTENT_TEMPLATES.hashtags.trading);
      const all = [...new Set([...base, ...ctx])];
      return { hashtags: all, count: all.length, joinedAr: all.join(' '), joinedEn: all.join(' ') };
    }
    default:
      return { error: 'نوع المحتوى غير معروف' };
  }
}

// ── Campaign Full Behavior ─────────────────────────────────────────────────
function createFullCampaign(opts = {}) {
  const id = 'UMB-CAM-' + Date.now().toString(36).toUpperCase();
  const now = new Date();
  const end = new Date(now.getTime() + (opts.durationDays || 30) * 86400000);

  const platforms  = opts.platforms  || PLATFORMS.map(p => p.id);
  const adChannels = opts.adChannels || AD_CHANNELS.map(c => c.id); // كل القنوات الـ 18
  const event      = opts.linkedEvent ? ISLAMIC_EVENTS.find(e => e.id === opts.linkedEvent) : null;
  const boost      = event ? event.adBoost : 1.0;

  // Generate brand images for each content type
  const images = {};
  ['post','story','banner','ad','thumbnail'].forEach(t => {
    images[t] = generateBrandImage({
      type:  t, title: opts.name || 'حملة شيخة',
      subtitle: opts.description || '',
      event: event ? event.ar : null,
      color: opts.color || 'primary',
    });
  });

  // Generate content kit
  const content = {
    bio:     generateContent('bio_brand', { name: opts.name }),
    caption: generateContent(opts.captionType || 'caption_promo', {
      offer: opts.offer || opts.name, duration: opts.durationDays + ' يوم',
    }),
    titles:  generateContent('title', { topic: opts.name }),
    hashtags:generateContent('hashtags', { metals: true, ksa: true, trading: true }),
  };

  // Social schedule — 2 posts/day on each platform
  const schedule = [];
  let d = new Date(now);
  while (d <= end) {
    platforms.slice(0, 5).forEach(pid => {
      const plat = PLATFORMS.find(p => p.id === pid);
      const bestTime = plat ? plat.bestTimes[0] : '09:00';
      const [hh, mm] = bestTime.split(':').map(Number);
      const postDate  = new Date(d);
      postDate.setHours(hh, mm, 0, 0);
      schedule.push({
        id: crypto.randomUUID().slice(0,8),
        date: postDate.toISOString(),
        platform: pid,
        contentType: plat ? plat.contentTypes[0] : 'post',
        status: 'scheduled',
      });
    });
    d.setDate(d.getDate() + 1);
  }

  // Ad plan
  const adPlan = adChannels.map(cid => {
    const ch = AD_CHANNELS.find(c => c.id === cid);
    const budget = ((opts.totalBudget || 10000) / adChannels.length * boost).toFixed(2);
    return {
      channel: cid, nameAr: ch ? ch.ar : cid,
      allocatedBudget: parseFloat(budget),
      formats: ch ? ch.formats : [],
      type: ch ? ch.type : 'digital',
      estimatedReach: ch ? Math.round(parseFloat(budget) / ch.cpm * 1000) : 0,
    };
  });

  const campaign = {
    id, name: opts.name || 'حملة جديدة',
    description: opts.description || '',
    objective: opts.objective || 'brand_awareness',
    status: 'ready', // ready → active → paused → completed
    startDate: now.toISOString(),
    endDate: end.toISOString(),
    durationDays: opts.durationDays || 30,
    targetAudience: opts.audience || { age: '18-45', gender: 'all', geo: 'KSA', interests: ['metals','trading','finance'] },
    totalBudget: opts.totalBudget || 10000,
    spent: 0,
    kpis: { impressions: 0, reach: 0, clicks: 0, conversions: 0, leads: 0, sales: 0, roas: 0 },
    linkedEvent: event || null,
    adBoost: boost,
    platforms,
    adChannels,
    images,
    content,
    schedule: schedule.slice(0, 90), // cap stored schedule
    adPlan,
    behavior: {
      phase:       'launch',  // launch → grow → peak → maintain → wind-down
      phases: [
        { name:'launch',   from: 0,  to: 5,  strategy:'awareness heavy — broad audience' },
        { name:'grow',     from: 5,  to: 15, strategy:'engagement — retargeting begins' },
        { name:'peak',     from: 15, to: 25, strategy:'conversion push — CTA focused' },
        { name:'maintain', from: 25, to: opts.durationDays - 3, strategy:'retention — loyalty' },
        { name:'wind-down',from: opts.durationDays - 3, to: opts.durationDays, strategy:'post-campaign analytics' },
      ],
      triggers: [
        { condition: 'ctr_below_1pct',     action: 'refresh_creatives' },
        { condition: 'budget_50pct_spent', action: 'optimize_adset' },
        { condition: 'event_day',          action: 'boost_budget_20pct' },
        { condition: 'roas_above_4x',      action: 'scale_budget_30pct' },
        { condition: 'frequency_above_5',  action: 'rotate_audience' },
      ],
    },
    createdAt: now.toISOString(),
  };

  return campaign;
}

// ── DB helpers ─────────────────────────────────────────────────────────────
function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { campaigns: [], events: [], images: [], socialPosts: [] };
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { return { campaigns: [], events: [], images: [], socialPosts: [] }; }
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ── Main Class ─────────────────────────────────────────────────────────────
class SheikhaUnifiedMarketingBrain {
  constructor(opts = {}) {
    this.name      = 'Sheikha Unified Marketing Brain';
    this.nameAr    = 'منظومة شيخة للتسويق الشامل الموحد';
    this.version   = '1.0.0';
    this.startedAt = new Date().toISOString();
    console.log(`✅ [UMB v${this.version}] ${this.nameAr} جاهز`);
  }

  // ── getDashboard ──────────────────────────────────────────────────────
  getDashboard() {
    const db = loadDB();
    const campaigns = db.campaigns || [];
    const now = Date.now();
    return {
      overview: {
        totalCampaigns:  campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalBudget:     campaigns.reduce((s,c) => s + (c.totalBudget || 0), 0),
        totalSpent:      campaigns.reduce((s,c) => s + (c.spent || 0), 0),
        totalImpressions:campaigns.reduce((s,c) => s + (c.kpis?.impressions || 0), 0),
        totalLeads:      campaigns.reduce((s,c) => s + (c.kpis?.leads || 0), 0),
        totalImages:     (db.images || []).length,
        totalPosts:      (db.socialPosts || []).length,
      },
      brand: BRAND,
      platforms: PLATFORMS,
      adChannels: AD_CHANNELS,
      upcomingEvents: ISLAMIC_EVENTS,
      recentCampaigns: campaigns.slice(-5),
    };
  }

  // ── registerRoutes ────────────────────────────────────────────────────
  registerRoutes(app) {
    const G = (p, fn) => { app.get(AR_BASE + p, fn); app.get(EN_BASE + p, fn); };
    const P = (p, fn) => { app.post(AR_BASE + p, fn); app.post(EN_BASE + p, fn); };
    const Pu= (p, fn) => { app.put(AR_BASE + p, fn); app.put(EN_BASE + p, fn); };
    const D = (p, fn) => { app.delete(AR_BASE + p, fn); app.delete(EN_BASE + p, fn); };

    // ── Dashboard & Brand ─────────────────────────────────────────────
    G('/dashboard', (req, res) => res.json({ success: true, ...this.getDashboard() }));
    G('/brand', (req, res) => res.json({ success: true, brand: BRAND }));
    G('/brand/colors', (req, res) => res.json({ success: true, colors: BRAND.colors }));
    G('/brand/voice', (req, res) => res.json({ success: true, voice: BRAND.voice, sharia: BRAND.sharía }));
    G('/brand/guidelines', (req, res) => res.json({ success: true, brand: BRAND, platforms: PLATFORMS, adChannels: AD_CHANNELS }));

    // ── Events / Calendar ─────────────────────────────────────────────
    G('/events', (req, res) => {
      const db = loadDB();
      const custom = db.events || [];
      res.json({ success: true, islamicEvents: ISLAMIC_EVENTS, customEvents: custom, total: ISLAMIC_EVENTS.length + custom.length });
    });
    P('/events', (req, res) => {
      const db = loadDB();
      const ev = { id: 'EV-' + Date.now(), ...req.body, createdAt: new Date().toISOString() };
      db.events = db.events || [];
      db.events.push(ev);
      saveDB(db);
      res.json({ success: true, event: ev, message: 'تم إضافة الحدث' });
    });
    D('/events/:id', (req, res) => {
      const db = loadDB();
      db.events = (db.events || []).filter(e => e.id !== req.params.id);
      saveDB(db);
      res.json({ success: true, message: 'تم حذف الحدث' });
    });
    G('/events/calendar', (req, res) => {
      const now   = new Date();
      const year  = now.getFullYear();
      const month = parseInt(req.query.month || now.getMonth() + 1);
      const slots = ISLAMIC_EVENTS.filter(ev => {
        if (ev.gregorian) {
          const [m, _d] = ev.gregorian.split('/').map(Number);
          return m === month;
        }
        return false;
      });
      res.json({ success: true, year, month, slots });
    });

    // ── Image Generation ──────────────────────────────────────────────
    G('/images', (req, res) => {
      const db = loadDB();
      res.json({ success: true, images: db.images || [], total: (db.images || []).length });
    });
    P('/images/generate', (req, res) => {
      const img = generateBrandImage(req.body);
      const db  = loadDB();
      db.images = db.images || [];
      db.images.push(img);
      saveDB(db);
      res.json({ success: true, image: img, message: 'تم توليد الصورة المتناسقة مع الهوية' });
    });
    P('/images/generate-kit', (req, res) => {
      const types = req.body.types || ['post','story','banner','ad','thumbnail'];
      const kit   = {};
      const db    = loadDB();
      db.images = db.images || [];
      types.forEach(t => {
        const img = generateBrandImage({ ...req.body, type: t });
        kit[t] = img;
        db.images.push(img);
      });
      saveDB(db);
      res.json({ success: true, kit, count: types.length, message: `تم توليد ${types.length} صورة متناسقة` });
    });
    D('/images/:id', (req, res) => {
      const db = loadDB();
      db.images = (db.images || []).filter(i => i.id !== req.params.id);
      saveDB(db);
      res.json({ success: true, message: 'تم حذف الصورة' });
    });

    // ── Content AI Generation ─────────────────────────────────────────
    G('/content/templates', (req, res) => {
      res.json({ success: true, templates: Object.keys(CONTENT_TEMPLATES), platforms: PLATFORMS });
    });
    P('/content/generate', (req, res) => {
      const { type, params } = req.body;
      if (!type) return res.status(400).json({ success: false, error: 'نوع المحتوى مطلوب' });
      const result = generateContent(type, params || {});
      res.json({ success: true, type, content: result, generatedAt: new Date().toISOString() });
    });
    P('/content/batch', (req, res) => {
      const requests = req.body.requests || [];
      const results  = requests.map(r => ({ type: r.type, content: generateContent(r.type, r.params || {}) }));
      res.json({ success: true, results, count: results.length });
    });
    G('/content/hashtags', (req, res) => {
      const result = generateContent('hashtags', req.query);
      res.json({ success: true, ...result });
    });

    // ── Campaigns ─────────────────────────────────────────────────────
    G('/campaigns', (req, res) => {
      const db  = loadDB();
      let camps = db.campaigns || [];
      if (req.query.status) camps = camps.filter(c => c.status === req.query.status);
      res.json({ success: true, campaigns: camps, total: camps.length });
    });
    G('/campaigns/:id', (req, res) => {
      const db   = loadDB();
      const camp = (db.campaigns || []).find(c => c.id === req.params.id);
      if (!camp) return res.status(404).json({ success: false, error: 'حملة غير موجودة' });
      res.json({ success: true, campaign: camp });
    });
    P('/campaigns', (req, res) => {
      const camp = createFullCampaign(req.body);
      const db   = loadDB();
      db.campaigns = db.campaigns || [];
      db.campaigns.push(camp);
      saveDB(db);
      res.json({ success: true, campaign: camp, message: `✅ تم إنشاء الحملة الكاملة: ${camp.id}` });
    });
    Pu('/campaigns/:id/status', (req, res) => {
      const db   = loadDB();
      const camp = (db.campaigns || []).find(c => c.id === req.params.id);
      if (!camp) return res.status(404).json({ success: false, error: 'حملة غير موجودة' });
      camp.status     = req.body.status || camp.status;
      camp.updatedAt  = new Date().toISOString();
      saveDB(db);
      res.json({ success: true, campaign: camp, message: `الحالة: ${camp.status}` });
    });
    P('/campaigns/:id/record-kpi', (req, res) => {
      const db   = loadDB();
      const camp = (db.campaigns || []).find(c => c.id === req.params.id);
      if (!camp) return res.status(404).json({ success: false, error: 'حملة غير موجودة' });
      const kpi = req.body;
      Object.keys(kpi).forEach(k => {
        if (camp.kpis.hasOwnProperty(k)) camp.kpis[k] += (parseInt(kpi[k]) || 0);
      });
      if (kpi.spend) camp.spent = (camp.spent || 0) + (parseFloat(kpi.spend) || 0);
      if (camp.spent > 0 && camp.kpis.conversions > 0)
        camp.kpis.roas = +(camp.kpis.sales / camp.spent).toFixed(2);
      saveDB(db);
      res.json({ success: true, kpis: camp.kpis });
    });
    D('/campaigns/:id', (req, res) => {
      const db = loadDB();
      db.campaigns = (db.campaigns || []).filter(c => c.id !== req.params.id);
      saveDB(db);
      res.json({ success: true, message: 'تم حذف الحملة' });
    });

    // ── Social Scheduler ──────────────────────────────────────────────
    G('/social/platforms', (req, res) => res.json({ success: true, platforms: PLATFORMS }));
    G('/social/schedule', (req, res) => {
      const db   = loadDB();
      const posts= db.socialPosts || [];
      res.json({ success: true, posts, total: posts.length });
    });
    P('/social/schedule', (req, res) => {
      const db  = loadDB();
      const post = {
        id: 'SP-' + Date.now().toString(36).toUpperCase(),
        ...req.body,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };
      db.socialPosts = db.socialPosts || [];
      db.socialPosts.push(post);
      saveDB(db);
      res.json({ success: true, post, message: 'تم جدولة المنشور' });
    });
    Pu('/social/schedule/:id/publish', (req, res) => {
      const db   = loadDB();
      const post = (db.socialPosts || []).find(p => p.id === req.params.id);
      if (!post) return res.status(404).json({ success: false, error: 'منشور غير موجود' });
      post.status      = 'published';
      post.publishedAt = new Date().toISOString();
      saveDB(db);
      res.json({ success: true, post, message: '🚀 تم النشر' });
    });
    P('/social/best-time', (req, res) => {
      const plat = PLATFORMS.find(p => p.id === req.body.platform);
      if (!plat) return res.status(404).json({ success: false, error: 'منصة غير موجودة' });
      res.json({ success: true, platform: plat.id, nameAr: plat.ar, bestTimes: plat.bestTimes, contentTypes: plat.contentTypes });
    });
    P('/social/publish-all', (req, res) => {
      const db   = loadDB();
      const scheduled = (db.socialPosts || []).filter(p => p.status === 'scheduled');
      scheduled.forEach(p => { p.status = 'published'; p.publishedAt = new Date().toISOString(); });
      saveDB(db);
      res.json({ success: true, published: scheduled.length, message: `تم نشر ${scheduled.length} منشور` });
    });

    // ── Ad Channels ───────────────────────────────────────────────────
    G('/ad-channels', (req, res) => {
      const type = req.query.type;
      let channels = AD_CHANNELS;
      if (type) channels = channels.filter(c => c.type === type);
      res.json({ success: true, channels, total: channels.length });
    });
    P('/ad/plan', (req, res) => {
      const { channels = AD_CHANNELS.map(c=>c.id), budget = 10000, duration = 30, objective = 'awareness' } = req.body; // كل القنوات
      const plan = channels.map(cid => {
        const ch  = AD_CHANNELS.find(c => c.id === cid);
        const alloc = +(budget / channels.length).toFixed(2);
        return {
          channel: cid, nameAr: ch?.ar || cid,
          type: ch?.type || 'digital',
          formats: ch?.formats || [],
          allocatedBudget: alloc,
          estimatedReach: ch ? Math.round(alloc / ch.cpm * 1000) : 0,
          cpm: ch?.cpm || 0,
        };
      });
      res.json({ success: true, plan, totalBudget: budget, duration, objective, channels: plan.length });
    });

    // ── Unified Quick Actions ─────────────────────────────────────────
    P('/quick/generate-all', (req, res) => {
      const { name, description, event: evId, budget = 5000, platforms: plats, adChannels: adCh, captionType } = req.body;
      const ev    = ISLAMIC_EVENTS.find(e => e.id === evId);
      const camp  = createFullCampaign({ name, description, linkedEvent: evId, totalBudget: budget, platforms: plats, adChannels: adCh, captionType });
      const db    = loadDB();
      db.campaigns = db.campaigns || [];
      db.campaigns.push(camp);
      // Add main social posts to schedule
      db.socialPosts = db.socialPosts || [];
      const mainPost = {
        id: 'SP-' + Date.now().toString(36).toUpperCase(),
        campaignId: camp.id, content: camp.content.caption,
        platforms: camp.platforms, status: 'scheduled',
        scheduledFor: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      db.socialPosts.push(mainPost);
      saveDB(db);
      res.json({
        success: true,
        message:  `✅ تم توليد منظومة التسويق الكاملة: ${camp.id}`,
        campaign: camp,
        images:   camp.images,
        content:  camp.content,
        adPlan:   camp.adPlan,
        socialPost: mainPost,
        event:    ev || null,
        totalPostsScheduled: camp.schedule.length,
      });
    });

    // ── Analytics ─────────────────────────────────────────────────────
    G('/analytics', (req, res) => {
      const db    = loadDB();
      const camps = db.campaigns || [];
      const kpis  = { impressions: 0, reach: 0, clicks: 0, conversions: 0, leads: 0, sales: 0, spent: 0 };
      camps.forEach(c => {
        Object.keys(kpis).forEach(k => { if (k === 'spent') kpis.spent += (c.spent || 0); else kpis[k] += (c.kpis?.[k] || 0); });
      });
      kpis.roas     = kpis.spent > 0 ? +(kpis.sales / kpis.spent).toFixed(2) : 0;
      kpis.ctr      = kpis.impressions > 0 ? +((kpis.clicks / kpis.impressions) * 100).toFixed(2) : 0;
      kpis.cpl      = kpis.leads > 0 ? +(kpis.spent / kpis.leads).toFixed(2) : 0;
      res.json({ success: true, kpis, campaigns: camps.length, period: 'all-time' });
    });
    G('/analytics/:id', (req, res) => {
      const db   = loadDB();
      const camp = (db.campaigns || []).find(c => c.id === req.params.id);
      if (!camp) return res.status(404).json({ success: false, error: 'حملة غير موجودة' });
      const spent = camp.spent || 0;
      const k     = camp.kpis || {};
      res.json({
        success: true, campaign: camp.id, name: camp.name,
        kpis: k, spent,
        roas: spent > 0 ? +(k.sales / spent).toFixed(2) : 0,
        ctr:  k.impressions > 0 ? +((k.clicks / k.impressions) * 100).toFixed(2) : 0,
        cpl:  k.leads > 0 ? +(spent / k.leads).toFixed(2) : 0,
        phaseNow: camp.behavior?.phase || 'launch',
        schedule: camp.schedule?.slice(0, 7) || [],
      });
    });

    console.log(`✅ [UMB v${this.version}] ${AR_BASE}/* + ${EN_BASE}/* — 60 مسار مسجَّل`);
  }

  getStatus() {
    const db = loadDB();
    return {
      name: this.name, nameAr: this.nameAr, version: this.version,
      campaigns: (db.campaigns || []).length,
      images:    (db.images    || []).length,
      socialPosts:(db.socialPosts || []).length,
      platforms: PLATFORMS.length,
      adChannels: AD_CHANNELS.length,
      events:    ISLAMIC_EVENTS.length,
    };
  }
}

module.exports = SheikhaUnifiedMarketingBrain;
module.exports.BRAND         = BRAND;
module.exports.PLATFORMS     = PLATFORMS;
module.exports.AD_CHANNELS   = AD_CHANNELS;
module.exports.ISLAMIC_EVENTS= ISLAMIC_EVENTS;
module.exports.generateContent     = generateContent;
module.exports.generateBrandImage  = generateBrandImage;
module.exports.createFullCampaign  = createFullCampaign;
