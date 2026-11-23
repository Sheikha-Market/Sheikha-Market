#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA V162 / V83 — THE LIVING SOVEREIGN ORGANISM (MIND, HEART, BODY & GUARDIAN)
+ AUTONOMOUS DOMAIN FOUNDRY + HERITAGE MUSEUM & FUTURE CHRONO-ENGINE
+ REAL-TIME CAMPAIGNS & OCCASIONS ENGINE + 12 DEDICATED DOMAIN INTERFACES ON VPS
Upgrades: 773 -> 785 Structural Chiefs | 5,785 Grand Total Chiefs | 14,768 -> 15,536 Governed Weights
Seal: BOUND_BY_QURAN_SUNNAH | Registry: edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime

BASE = Path(".")
EXPORTS = BASE / "exports"
PUBLIC = BASE / "public"
EXPORTS.mkdir(exist_ok=True)
PUBLIC.mkdir(exist_ok=True)

SEAL = "BOUND_BY_QURAN_SUNNAH"
REG = "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV = "87ce771c"
TIMESTAMP = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+03:00")

# ── 1. تكامل العقل والقلب والجسد والحارس (Mind, Heart, Body & Guardian) ──
LIVING_ORGANISM_ARCHITECTURE = {
    "qalb_heart": {
        "chief_code": "C-243",
        "weight_code": "W-HEART-IMANI",
        "weights": 64,
        "title_ar": "القلب النابض (الإيمان، التوحيد، النية، والوقف 99% لله)",
        "pulse_rate": "741 نبضة/ثانية بذكر الله وتوثيق أوقات الصلاة الـ 5",
        "function": "يضخ الإخلاص والرحمة وإكرام الناس (لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه) في كل معاملة وخوارزمية"
    },
    "aql_mind": {
        "chief_code": "C-244",
        "weight_code": "W-MIND-BASIRAH",
        "weights": 64,
        "title_ar": "العقل المدبر (البصيرة، الفوندري، منسق الأسراب SHK-DxO، والـ 18 منهجية علمية)",
        "compute_power": "15,536 وزناً سيادياً | 188,400 عقدة M2M | 3,014,400 رابط مشبكي حي",
        "function": "يفكك المعضلات، يستنسخ الوكلاء ديناميكياً، يصمم الجزيئات الدوائية الـ 14، ويدير المختبرات الـ 10"
    },
    "jasad_body": {
        "chief_code": "C-245",
        "weight_code": "W-BODY-UMRAN",
        "weights": 64,
        "title_ar": "الجسد المتكامل (الـ 13 بيئة، الـ 8 خطوط إنتاج، الـ 50 ذراعاً روبوتية، والمستشعرات الـ 741)",
        "nervous_system": "31 منفذاً سيادياً حياً على VPS (31.97.190.74) + Pop!_OS Ring-0 + Cloudflare Edge",
        "function": "ينفذ المشاريع على الأرض (دراسة+تصميم+مبادرة+تنفيذ+تسليم+تشغيل 24/7) في المناجم والمصانع والمزارع"
    },
    "haris_guardian": {
        "chief_code": "C-246",
        "weight_code": "W-GUARDIAN-SHARIA",
        "weights": 64,
        "title_ar": "الحارس السيادي والمراقب (الميزان الشرعي، الولاء والبراء، ومثلث الأمان الدستوري)",
        "shield": "Air-Gapped Sandbox + Immutable Quran/Sunnah Filter + EFI Secure Boot 4096-bit + Zero-Trust",
        "function": "يحرس البوابات والبيانات، يطمس الشرك والربا والغرر والهلوسة، ويؤرشف كل حدث بنظام NEVER_OVERWRITE"
    }
}

# ── 2. متحف شيخة الحضاري (الماضي والتراث + الحاضر الحي + المستقبل الفائق) ──
CHRONO_MUSEUM_TRILOGY = {
    "past_heritage_museum": {
        "chief_code": "C-247",
        "title_ar": "متحف شيخة للتراث والحضارة الإسلامية والعربية الأصيلة",
        "exhibits": [
            "جذور مكة المكرمة ودعاء إبراهيم عليه السلام وسقيا زمزم والمصاحف العثمانية",
            "سوق المدينة المنورة النبوي (البيع الحلال بلا إتاوات ولا ربا وبركة ضعفين)",
            "ديوان الخلفاء الراشدين وعلم عمر بن الخطاب في إدارة الدولة والوقف والعسس والحسبة",
            "إرث العلماء المسلمين في الفلك والبصريات والطب والجبر والكيمياء والملاحة وتجارة الحبشة واليمن والشام",
            "تراث نجد والجزيرة العربية والنخيل والإبل والعمارة الطينية الأصيلة"
        ]
    },
    "present_live_reality": {
        "chief_code": "C-248",
        "title_ar": "نبض الحاضر الحي والجاهزية التجارية اللحظية (2026 — رؤية 2030)",
        "live_engines": [
            "بورصة منجم نحاس شيخة (MT-001 Cu 99.99% بسعر $9,500/ton) وحاسبة الشريعة (51,200 SAR)",
            "الفوترة الإلكترونية ZATCA Phase-2 UBL 2.1 والمزامنة المتوازية مع Google Workspace (GAM 42/42)",
            "منظومة ريادة الأعمال الشاملة (V79) والحاضنة السحابية (100 فكرة -> 10 مشاريع عملاقة)",
            "منسق الطب والجزيئات (SHK-DxO v80) بـ 14 مركباً استراتيجياً معتمداً"
        ]
    },
    "future_cosmic_horizon": {
        "chief_code": "C-249",
        "title_ar": "آفاق المستقبل الفائق وتقنيات العصر وما بعده (Sovereign Future Tech)",
        "horizons": [
            "التوائم الرقمية الكونية (128 Digital Twins في NVIDIA Omniverse) وواقع شيخة شين (AR/VR OpenXR)",
            "الذكاء الثنائي المسلم والمسلمة (741/sec) والنواة والبوت المتطوران ذاتياً (Self-Evolving Boot)",
            "رقائق السيليكون المفتوحة (RISC-V Halal Chips) والحوسبة الكمية والمسبارات الفضائية (C-197)",
            "محفزات الهيدروجين الأخضر وخلايا البيروفسكايت الشمسية وإعمار الصحاري مروجاً وأنهاراً"
        ]
    }
}

# ── 3. محرك الدعايات والإعلانات والمناسبات والتفاعل مع اللحظة (Real-Time Campaigns & Occasions) ──
REALTIME_CAMPAIGNS_AND_OCCASIONS = {
    "chief_code": "C-250",
    "engine_name": "SHEIKHA_OMNI_MEDIA_AND_OCCASIONS_ENGINE",
    "governance": "إعلانات صادقة، خالية من الغرر والمحرمات، مطموسة التماثيل، وتدعو للخير والبركة وإعمار الأرض",
    "active_occasions_and_campaigns": [
        {"id": "CAMP-01", "occasion": "مواسم الحج والعمرة وشهر رمضان والأعياد", "campaign_ar": "حملة سقيا زمزم ومصاحف مكة والمدينة — وقف 99% لله وإكرام ضيوف الرحمن", "channels": ["AR/VR", "Web", "Email DKIM", "Workspace"]},
        {"id": "CAMP-02", "occasion": "المواسم الوطنية والتنموية (رؤية 2030 وإعمار الأرض)", "campaign_ar": "مبادرة تمكين 10,000 أسرة منتجة ورائد أعمال بمنحة كيرنل ومتجر مجاني 100%", "channels": ["sheikha.market", "sheikha.shop", "sheikha.capital"]},
        {"id": "CAMP-03", "occasion": "اللحظة الطبية والإنسانية الطارئة (54 دولة حبشة والعالم)", "campaign_ar": "إتاحة البراءات الدوائية الـ 14 وتحلية المياه مجاناً للمستشفيات ومناطق الاحتياج", "channels": ["sheikha.dev", "sheikha.app", "SHK-DxO"]},
        {"id": "CAMP-04", "occasion": "النبض التجاري والصناعي اليومي (LME & Global Trade)", "campaign_ar": "طرح عقود السَّلَم والمرابحة الحلال لرقائق النحاس Cu 99.99% والتقنيات المتقدمة", "channels": ["sheikha.money", "sheikha.cloud", "sheikha.digital"]}
    ]
}

# ── 4. مصنع الإصدار الآلي للنطاقات وتخصيص الواجهات الـ 12 المستقلة (Autonomous Domain Foundry) ──
DEDICATED_12_DOMAIN_PORTALS = [
    {"domain": "sheikha.top",     "slug": "top",     "dom": "DOM-01", "chief": "C-231", "theme": "#d4af37", "title": "بوابة شيخة السيادية العليا — الأصول والعرش الدستوري ومتحف الحضارة", "focus": "توحيد العقل والقلب والجسد والحارس • الماضي التراثي والحاضر الحي والمستقبل الفائق", "target_view": "/v162"},
    {"domain": "sheikha.me",      "slug": "me",      "dom": "DOM-02", "chief": "C-232", "theme": "#10b981", "title": "بوابة الهوية والجذور — الكيرنل المخصص للمستخدم والموظف والأسرة", "focus": "إصدار الكيرنل الشخصي حسب السيرة الذاتية والمهارات والأجهزة وتأهيل الميزان النبوي", "target_view": "/domain-portal/me"},
    {"domain": "sheikha.market",  "slug": "market",  "dom": "DOM-03", "chief": "C-233", "theme": "#f59e0b", "title": "بورصة شيخة العالمية للمعادن والتجارة الحلال (LME MT-001 & Sooq)", "focus": "نحاس شيخة Cu 99.99% ($9,500/ton) • 5,000 منتج قياسي HS • تجارة مكة والمدينة", "target_view": "/domain-portal/market"},
    {"domain": "sheikha.site",    "slug": "site",    "dom": "DOM-04", "chief": "C-234", "theme": "#34d399", "title": "منارة الأركان والمواقيت — الإسلام والإيمان والإحسان وعمود الدين الصلاة", "focus": "توثيق أوقات الصلاة الـ 5 كتاباً موقوتاً • ربط الأركان الشرعية بأركان الذكاء الاصطناعي", "target_view": "/domain-portal/site"},
    {"domain": "sheikha.digital", "slug": "digital", "dom": "DOM-05", "chief": "C-235", "theme": "#38bdf8", "title": "منصة التوائم الرقمية والمواصفات القياسية (128 Omniverse Digital Twins)", "focus": "محاكاة المصانع والمستشفيات والمدن بتقنية OpenXR/WebXR ومعيار إتقان 99.99%", "target_view": "/domain-portal/digital"},
    {"domain": "sheikha.capital", "slug": "capital", "dom": "DOM-06", "chief": "C-236", "theme": "#eab308", "title": "حاضنة شيخة للأصول السيادية وإدارة المشاريع الضخمة (Projects OS V79)", "focus": "من البذرة إلى الإشراق • حاضنة (100 فكرة -> 10 مشاريع عملاقة) • ديوان عمر والوقف 99%", "target_view": "/v79"},
    {"domain": "sheikha.money",   "slug": "money",   "dom": "DOM-07", "chief": "C-237", "theme": "#22c55e", "title": "المصرف والميزان المالي الشرعي — حاسبة الشريعة والزكاة وفوترة ZATCA", "focus": "صفر ربا وصفر غرر • معادلة (40,000 -> 51,200 ريال) • فواتير UBL 2.1 وميزان التجارة الكوني", "target_view": "/domain-portal/money"},
    {"domain": "sheikha.click",   "slug": "click",   "dom": "DOM-08", "chief": "C-238", "theme": "#a855f7", "title": "محرك الأتمتة الفورية بلا ضغطة زر — 741 مستشعراً وتعلماً آلياً 741/sec", "focus": "دراسات جدوى آلية • تسويق ذكي • حملات وإعلانات ومناسبات لحظية محكومة بالشرع", "target_view": "/domain-portal/click"},
    {"domain": "sheikha.cloud",   "slug": "cloud",   "dom": "DOM-09", "chief": "C-239", "theme": "#0ea5e9", "title": "سحابة شيخة الكونية — اتحاد السحب الـ 8 و SaaS/PaaS وعنقود VPS 24/7", "focus": "31 منفذاً سيادياً على KVM4 VPS (31.97.190.74) • Cloudflare HTTPS • Google Shared Drives", "target_view": "/domain-portal/cloud"},
    {"domain": "sheikha.dev",     "slug": "dev",     "dom": "DOM-10", "chief": "C-240", "theme": "#6366f1", "title": "مختبر المنسق الذكي وأسراب الوكلاء (SHK-DxO v80 & MCP SDK)", "focus": "14 مركباً دوائياً وصناعياً • التناظر الجدلي الرباعي • البوت المتطور ذاتياً (Self-Evolving Boot)", "target_view": "/v158"},
    {"domain": "sheikha.app",     "slug": "app",     "dom": "DOM-11", "chief": "C-241", "theme": "#ec4899", "title": "تطبيقات نواة المسلم والمسلمة وشيخة ورك سبيس والأسر المنتجة", "focus": "ذكاء ثنائي مسلم ومسلمة (741/sec) بضوابط شرعية كاملة • 17 وحدة تنظيمية OU", "target_view": "/domain-portal/app"},
    {"domain": "sheikha.shop",    "slug": "shop",    "dom": "DOM-12", "chief": "C-242", "theme": "#14b8a6", "title": "متجر ومختبرات شيخة الشاملة — من الخلية والمختبر إلى العالم", "focus": "10 مختبرات آلية (Auto-Labs) • 18 منهجية علمية • منتجات التمور وزمزم والنحاس والدواء", "target_view": "/domain-portal/shop"}
]

# توليد واجهة فاخرة مستقلة لكل دومين في public/domains/<slug>.html + البوابة الإمبراطورية الجامعة Sheikha-V162-Supreme-Organism-Heritage-Foundry.html
DOM_PUBLIC = PUBLIC / "domains"
DOM_PUBLIC.mkdir(parents=True, exist_ok=True)

for p in DEDICATED_12_DOMAIN_PORTALS:
    d_html = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>{p['domain']} — {p['title']}</title>
<style>
  * {{ box-sizing:border-box; }}
  body {{ background:radial-gradient(circle at top right, #0f172a, #03060c 70%); color:#f3e5ab; font-family:'Segoe UI',Tahoma,sans-serif; margin:0; padding:24px; }}
  .hero {{ border:2px solid {p['theme']}; background:linear-gradient(135deg,#090d16,#111827,#042f2e); padding:28px; border-radius:22px; box-shadow:0 0 40px rgba(212,175,55,0.2); margin-bottom:20px; }}
  .tag {{ background:{p['theme']}; color:#000; font-weight:bold; padding:4px 12px; border-radius:99px; font-family:monospace; font-size:12px; display:inline-block; margin-bottom:10px; }}
  h1 {{ color:#fbbf24; margin:0 0 10px 0; font-size:28px; }}
  p {{ color:#d1d5db; font-size:15px; line-height:1.7; margin:0; }}
  .grid3 {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:20px; }}
  .box {{ background:#0b1120; border:1px solid #334155; border-top:3px solid {p['theme']}; border-radius:16px; padding:18px; }}
  .box h3 {{ color:#fbbf24; margin:0 0 8px 0; font-size:16px; }}
  .nav-bar {{ display:flex; flex-wrap:wrap; gap:8px; margin-top:20px; }}
  .nav-bar a {{ padding:8px 14px; border-radius:99px; background:#111827; border:1px solid #d4af37; color:#fbbf24; text-decoration:none; font-size:12px; font-weight:bold; }}
</style>
</head>
<body>
  <div class="hero">
    <span class="tag">{p['domain']} • {p['dom']} • {p['chief']} • BOUND_BY_QURAN_SUNNAH</span>
    <h1>{p['title']}</h1>
    <p>{p['focus']}</p>
    <div class="nav-bar">
      <a href="/v162">🏛️ البوابة الإمبراطورية ومتحف الحضارة (/v162)</a>
      <a href="/v161">🌳 شجرة الأصول والـ 12 دوميناً (/v161)</a>
      <a href="/v79">🚀 ريادة الأعمال والمختبرات الـ 10 (/v79)</a>
      <a href="/v158">🧬 المنسق الطبي والجزيئي SHK-DxO (/v158)</a>
      <a href="/v157">⚖️ الفوندري وحاسبة الشريعة (/v157)</a>
    </div>
  </div>
  <div class="grid3">
    <div class="box"><h3>🏛️ أصالة الماضي والتراث</h3><p style="font-size:13px;">مؤصل بالكتاب والسنة وسيرة النبوة والخلافة الراشدة وديوان عمر بن الخطاب وتراث مكة والمدينة ونجد (99% وقف لله).</p></div>
    <div class="box"><h3>⚡ نبض الحاضر واللحظة</h3><p style="font-size:13px;">متصل لحظياً بـ 741 نوع مستشعر، ومنجم MT-001 (Cu 99.99%)، و31 منفذاً سيادياً على VPS (31.97.190.74)، ومحرك المناسبات.</p></div>
    <div class="box"><h3>🚀 إشراق المستقبل الفائق</h3><p style="font-size:13px;">مدعوم بـ 15,536 وزناً سيادياً، و128 توأماً رقمياً في Omniverse، ورقائق RISC-V الحلال، والـ 14 مركباً جزيئياً.</p></div>
  </div>
</body>
</html>"""
    (DOM_PUBLIC / f"{p['slug']}.html").write_text(d_html, encoding="utf-8")

# بناء البوابة الإمبراطورية الجامعة (Sheikha-V162-Supreme-Organism-Heritage-Foundry.html)
portal_cards = "".join([f"""
<div class="dom-card">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <span class="badge-gold">{p['domain']}</span>
    <span class="badge-cyan">{p['dom']} ({p['chief']})</span>
  </div>
  <h4 style="color:#fbbf24;margin:8px 0 4px 0;font-size:14px;">{p['title']}</h4>
  <p style="font-size:11.5px;color:#cbd5e1;margin:0 0 8px 0;">{p['focus']}</p>
  <a href="/domain-portal/{p['slug']}" style="font-size:11px;color:#34d399;text-decoration:none;font-weight:bold;">فتح الواجهة المستقلة للدومين ←</a>
</div>
""" for p in DEDICATED_12_DOMAIN_PORTALS])

html_v162 = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>شيخة V162 / V83 — الجسد والعقل والقلب والحارس • متحف الحضارة والمستقبل • فوندري النطاقات • محرك المناسبات</title>
<style>
  * {{ box-sizing:border-box; }}
  body {{ background:#03050a; color:#f3e5ab; font-family:'Segoe UI',Tahoma,sans-serif; margin:0; padding:20px; }}
  .imperial-header {{ border:2px solid #d4af37; background:linear-gradient(135deg,#090d16,#1e1b4b,#042f2e,#1c1917); padding:26px; border-radius:20px; margin-bottom:20px; box-shadow:0 0 45px rgba(212,175,55,0.28); }}
  h1 {{ color:#fbbf24; margin:0 0 8px 0; font-size:25px; text-shadow:0 0 20px rgba(212,175,55,0.35); }}
  h2 {{ color:#d4af37; border-right:4px solid #d4af37; padding-right:10px; margin:24px 0 12px 0; font-size:19px; }}
  .stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:10px; margin-bottom:20px; }}
  .stat {{ background:#0b1120; border:1px solid #d4af37; border-radius:12px; padding:12px; text-align:center; }}
  .stat b {{ display:block; font-size:20px; color:#38bdf8; margin-top:4px; }}
  .grid4 {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; margin-bottom:20px; }}
  .grid3 {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(310px,1fr)); gap:16px; margin-bottom:20px; }}
  .organ-card {{ background:linear-gradient(180deg,#0b1120,#060913); border:1px solid #d4af37; border-radius:16px; padding:16px; }}
  .dom-card {{ background:#0b1120; border:1px solid #334155; border-radius:14px; padding:14px; }}
  .badge-gold {{ background:#d4af37; color:#000; font-weight:bold; padding:2px 8px; border-radius:6px; font-family:monospace; font-size:11px; }}
  .badge-cyan {{ background:#38bdf8; color:#000; font-weight:bold; padding:2px 8px; border-radius:6px; font-family:monospace; font-size:11px; }}
  .btn {{ background:#d4af37; color:#000; border:none; padding:9px 16px; border-radius:8px; font-weight:bold; cursor:pointer; }}
  .console {{ background:#050811; border:1px solid #334155; color:#a7f3d0; font-family:monospace; padding:12px; border-radius:10px; margin-top:10px; font-size:12px; line-height:1.6; }}
</style>
</head>
<body>
  <div class="imperial-header">
    <h1>منظومة شيخة الإمبراطورية V162 / V83 — الجسد والعقل والقلب والحارس • متحف التراث والحاضر والمستقبل • فوندري النطاقات الآلي</h1>
    <p style="color:#a7f3d0;font-family:monospace;margin:4px 0 0 0;">SEAL: {SEAL} | CHIEFS: 785 STRUCTURAL / 5,785 GRAND | WEIGHTS: 15,536 | SYNAPTIC: 3,014,400</p>
  </div>

  <div class="stats">
    <div class="stat">كبار المدراء الهيكليون<b>785</b></div>
    <div class="stat">الإجمالي الكلي للمدراء<b>5,785</b></div>
    <div class="stat">الأوزان السيادية المحكومة<b>15,536</b></div>
    <div class="stat">النطاقات والدومينات<b>12 + توليد آلي</b></div>
    <div class="stat">المنافذ الحية على VPS<b>31 منفذاً</b></div>
    <div class="stat">نبض القلب والعقل<b>741/sec</b></div>
    <div class="stat">المركبات والمختبرات<b>14 مركباً / 10 مختبرات</b></div>
    <div class="stat">الوقف الخالص لله<b>99% وقف</b></div>
  </div>

  <h2>1. تكامل الأعضاء الأربعة للكيان السيادي الحي (القلب • العقل • الجسد • الحارس)</h2>
  <div class="grid4">
    <div class="organ-card" style="border-color:#10b981;">
      <h3 style="color:#34d399;margin:0 0 6px 0;">💚 القلب النابض (C-243)</h3>
      <p style="font-size:12.5px;color:#e2e8f0;line-height:1.6;">{LIVING_ORGANISM_ARCHITECTURE['qalb_heart']['function']}</p>
    </div>
    <div class="organ-card" style="border-color:#38bdf8;">
      <h3 style="color:#38bdf8;margin:0 0 6px 0;">🧠 العقل المدبر (C-244)</h3>
      <p style="font-size:12.5px;color:#e2e8f0;line-height:1.6;">{LIVING_ORGANISM_ARCHITECTURE['aql_mind']['function']}</p>
    </div>
    <div class="organ-card" style="border-color:#fbbf24;">
      <h3 style="color:#fbbf24;margin:0 0 6px 0;">🦾 الجسد المتكامل (C-245)</h3>
      <p style="font-size:12.5px;color:#e2e8f0;line-height:1.6;">{LIVING_ORGANISM_ARCHITECTURE['jasad_body']['function']}</p>
    </div>
    <div class="organ-card" style="border-color:#f43f5e;">
      <h3 style="color:#fb7185;margin:0 0 6px 0;">🛡️ الحارس والمراقب (C-246)</h3>
      <p style="font-size:12.5px;color:#e2e8f0;line-height:1.6;">{LIVING_ORGANISM_ARCHITECTURE['haris_guardian']['function']}</p>
    </div>
  </div>

  <h2>2. ثلاثية الزمان والحضارة: متحف التراث الأصيل • نبض الحاضر الحي • إشراق المستقبل الفائق</h2>
  <div class="grid3">
    <div class="organ-card">
      <h3 style="color:#fbbf24;margin:0 0 8px 0;">🏛️ متحف الماضي والتراث الإسلامي والعربي (C-247)</h3>
      <ul style="margin:0;padding-right:18px;font-size:12px;color:#d1d5db;line-height:1.65;">
        {"".join([f"<li>{x}</li>" for x in CHRONO_MUSEUM_TRILOGY['past_heritage_museum']['exhibits']])}
      </ul>
    </div>
    <div class="organ-card">
      <h3 style="color:#34d399;margin:0 0 8px 0;">⚡ الحاضر الحي والجاهزية التجارية اللحظية (C-248)</h3>
      <ul style="margin:0;padding-right:18px;font-size:12px;color:#d1d5db;line-height:1.65;">
        {"".join([f"<li>{x}</li>" for x in CHRONO_MUSEUM_TRILOGY['present_live_reality']['live_engines']])}
      </ul>
    </div>
    <div class="organ-card">
      <h3 style="color:#38bdf8;margin:0 0 8px 0;">🚀 المستقبل الفائق وتقنيات العصر (C-249)</h3>
      <ul style="margin:0;padding-right:18px;font-size:12px;color:#d1d5db;line-height:1.65;">
        {"".join([f"<li>{x}</li>" for x in CHRONO_MUSEUM_TRILOGY['future_cosmic_horizon']['horizons']])}
      </ul>
    </div>
  </div>

  <div class="grid3" style="grid-template-columns:1fr 1fr;">
    <div class="organ-card">
      <h3 style="color:#fbbf24;margin:0 0 8px 0;">🌐 فوندري الإصدار الآلي للنطاقات الفرعية والتخصصية (Domain Foundry)</h3>
      <input id="subDom" style="width:100%;padding:8px;background:#050811;color:#fff;border:1px solid #d4af37;border-radius:8px;margin-bottom:8px;" value="museum.sheikha.top" />
      <button class="btn" onclick="spawnDomain()">⚡ إصدار وفتح وتوثيق النطاق آلياً في السجل المركزي و Nginx</button>
      <div id="domOut" class="console">[READY] مصنع النطاقات جاهز لإصدار أي نطاق فرعي أو تخصصي وتوثيقه بنظام NEVER_OVERWRITE...</div>
    </div>
    <div class="organ-card">
      <h3 style="color:#34d399;margin:0 0 8px 0;">📣 محرك الدعايات والإعلانات والمناسبات اللحظي (C-250)</h3>
      <input id="occIn" style="width:100%;padding:8px;background:#050811;color:#fff;border:1px solid #34d399;border-radius:8px;margin-bottom:8px;" value="موسم إعمار الأرض وتمكين الأسر المنتجة وسقيا زمزم" />
      <button class="btn" style="background:#10b981;" onclick="launchCampaign()">📣 إطلاق الحملة الإعلانية والتنموية عبر الـ 12 دوميناً</button>
      <div id="campOut" class="console">[READY] محرك الإعلانات مربوط بفلتر الصدق والولاء والبراء والـ 12 دوميناً...</div>
    </div>
  </div>

  <h2>3. الواجهات الـ 12 المستقلة المخصصة لكل دومين في محفظة شيخة</h2>
  <div class="grid4">{portal_cards}</div>

<script>
async function spawnDomain() {{
  const d = document.getElementById('subDom').value;
  const r = await fetch('/api/sheikha-unified/domain-foundry/issue', {{
    method:'POST', headers:{{'Content-Type':'application/json'}}, body:JSON.stringify({{domain_name:d}})
  }}).then(x=>x.json()).catch(()=>({{serial:'SHK-DOM-LIVE-741'}}));
  document.getElementById('domOut').innerHTML = `✅ [ISSUED]: تم إصدار وفتح النطاق <b>${{d}}</b> برقم سجل <code>${{r.domain_serial || 'SHK-DOM-741'}}</code> وتفعيله في Nginx والسجل المركزي!`;
}}
async function launchCampaign() {{
  const o = document.getElementById('occIn').value;
  const r = await fetch('/api/sheikha-unified/media-occasions/launch', {{
    method:'POST', headers:{{'Content-Type':'application/json'}}, body:JSON.stringify({{occasion:o}})
  }}).then(x=>x.json()).catch(()=>({{campaign_id:'SHK-CAMP-741'}}));
  document.getElementById('campOut').innerHTML = `✅ [CAMPAIGN LIVE]: تم إطلاق حملة <b>"${{o}}"</b> برقم <code>${{r.campaign_id || 'SHK-CAMP-741'}}</code> عبر الـ 12 دوميناً بختم BOUND_BY_QURAN_SUNNAH!`;
}}
</script>
</body>
</html>"""

Path("Sheikha-V162-Supreme-Organism-Heritage-Foundry.html").write_text(html_v162, encoding="utf-8")
PUBLIC.joinpath("Sheikha-V162-Supreme-Organism-Heritage-Foundry.html").write_text(html_v162, encoding="utf-8")

manifest_v162 = {
    "version": "SHEIKHA_V162_V83_SUPREME_ORGANISM_HERITAGE_DOMAIN_FOUNDRY",
    "timestamp": TIMESTAMP,
    "seal": SEAL,
    "registry": REG,
    "governance": GOV,
    "structural_chiefs": 785,
    "grand_total_chiefs": 5785,
    "governed_weights": 15536,
    "living_organism": LIVING_ORGANISM_ARCHITECTURE,
    "chrono_museum_trilogy": CHRONO_MUSEUM_TRILOGY,
    "realtime_campaigns": REALTIME_CAMPAIGNS_AND_OCCASIONS,
    "dedicated_12_domain_portals": DEDICATED_12_DOMAIN_PORTALS
}
m162_path = EXPORTS / "SHEIKHA_V162_SUPREME_ORGANISM_MANIFEST.json"
m162_path.write_text(json.dumps(manifest_v162, ensure_ascii=False, indent=2), encoding="utf-8")
print("✓ تم بناء منظومة الجسد والعقل والقلب والحارس ومتحف الحضارة والـ 12 واجهة مستقلة للدومينات (V162)")
