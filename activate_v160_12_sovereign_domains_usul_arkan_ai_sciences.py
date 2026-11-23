#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA V160 / V81 — THE 12 SOVEREIGN DOMAINS ENGINE
(Usul, Roots, Foundations, Pillars, Specs, Administration, Laws, Properties,
Architecture, AI Integration, Muslim & Muslimah Kernel by Quran & Sunnah, All Sciences)
Upgrades: 761 -> 773 Structural Chiefs | 5,773 Grand Total Chiefs | 14,000 -> 14,768 Governed Weights
Seal: BOUND_BY_QURAN_SUNNAH | Registry: edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime

BASE = Path(".")
EXPORTS = BASE / "exports"
EXPORTS.mkdir(exist_ok=True)

SEAL = "BOUND_BY_QURAN_SUNNAH"
REG = "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV = "87ce771c"
TIMESTAMP = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+03:00")

TWELVE_SOVEREIGN_DOMAINS = [
    {
        "domain_id": "DOM-01",
        "chief_code": "C-231",
        "weight_code": "W-USUL",
        "weights_allocated": 64,
        "title_ar": "نطاق الأصول (Usul & Reference Origins)",
        "title_en": "Domain of Origins & Supreme Reference (Quran, Sunnah, Tawhid & Fitrah)",
        "usul_and_furu_rule": "كل أصل يتفرع منه فروع، وكل فرع يصبح أصلاً لفروع جديدة مؤصلة بالكتاب والسنة",
        "specifications": "التوحيد الخالص (ربوبية، ألوهية، أسماء وصفات) | عدم الشرك بالله | الإسناد والبرهان C-190",
        "ai_and_sciences_integration": "المرجع الدستوري الأعلى (Constitutional AI) لجميع النماذج والوكلاء؛ لا يمر أي قرار إلا بموافقة الأصول الشرعية",
        "port": 18082
    },
    {
        "domain_id": "DOM-02",
        "chief_code": "C-232",
        "weight_code": "W-ROOTS",
        "weights_allocated": 64,
        "title_ar": "نطاق الجذور (Deep Roots & Gharas)",
        "title_en": "Domain of Deep Roots, Gharas Min Sheikha, Prophetic Duas & Historical Lineage",
        "usul_and_furu_rule": "شجرة طيبة أصلها ثابت وفرعها في السماء — غرسها من شيخه وباسم شيخه لله 99% وقف",
        "specifications": "جذور مكة المكرمة (دعاء إبراهيم عليه السلام) | المدينة المنورة (بركة ضعفين) | اليمن والشام |54 دولة حبشة",
        "ai_and_sciences_integration": "حقن الهوية والذاكرة الجذرية في Kernel Header و EFI Boot و System Prompts لكل ذكاء اصطناعي",
        "port": 18101
    },
    {
        "domain_id": "DOM-03",
        "chief_code": "C-233",
        "weight_code": "W-FOUNDATIONS",
        "weights_allocated": 64,
        "title_ar": "نطاق الأساسات (12 Market & Earth Foundations)",
        "title_en": "Domain of the 12 Foundations of Sooq Sheikha & Earth Reconstruction",
        "usul_and_furu_rule": "هو أنشأكم من الأرض واستعمركم فيها — إعمار السماوات والأرض وما بينهما",
        "specifications": "أساسات التجارة الحلال | الصناعة (8 خطوط و 50 مصنعاً) | التعدين (MT-001 Cu 99.99%) | سقيا زمزم | الزراعة والمراعي الحية",
        "ai_and_sciences_integration": "ربط الأساسات الاقتصادية بـ 741 نوع مستشعر وحاسبة الشريعة (40,000 -> 51,200 ريال) وميزان التجارة الكوني",
        "port": 18120
    },
    {
        "domain_id": "DOM-04",
        "chief_code": "C-234",
        "weight_code": "W-ARKAN",
        "weights_allocated": 64,
        "title_ar": "نطاق الأركان (Arkan of Islam, Iman, Ihsan & AI Pillars)",
        "title_en": "Domain of Pillars (5 Islam, 6 Iman, Ihsan, Salah Amud Al-Din & 4 AI Pillars)",
        "usul_and_furu_rule": "أركان الإسلام (5) والإيمان (6) والإحسان (مراقبة الله) + عمود الدين الصلاة وتوثيق أوقاتها الـ 5",
        "specifications": "دمج الأركان الشرعية مع أركان الذكاء الاصطناعي الـ 4: البيانات والمتجهات (Vectors)، الخوارزميات (Transformers)، العتاد (CUDA/NPU)، والبيئة (DAGs)",
        "ai_and_sciences_integration": "محرك توثيق أوقات الصلاة والأمر بالمعروف والنهي عن المنكر + توجيه الأسراب بالمتجهات الرياضية",
        "port": 18131
    },
    {
        "domain_id": "DOM-05",
        "chief_code": "C-235",
        "weight_code": "W-SPECS",
        "weights_allocated": 64,
        "title_ar": "نطاق المواصفات والمعايير القياسية (Specifications & Standards)",
        "title_en": "Domain of Sovereign Specifications, Quality Benchmarks & Global Standards",
        "usul_and_furu_rule": "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — معيار الإتقان 99.99%",
        "specifications": "LME Grade-A Cu 99.99% | ZATCA Phase-2 UBL 2.1 | ISO-9001/14001/45001/27001/42001 | IEC-62443 | DO-178C DAL-A | HIPAA",
        "ai_and_sciences_integration": "فحص آلي لحظي للمواصفات الهندسية والدوائية (89.4%+ إلى 97.1% في SHK-DxO) قبل إصدار أي شهادة أو براءة",
        "port": 18163
    },
    {
        "domain_id": "DOM-06",
        "chief_code": "C-236",
        "weight_code": "W-ADMIN",
        "weights_allocated": 64,
        "title_ar": "نطاق الإدارة والقيادة والسيادة (Administration & Omar Governance)",
        "title_en": "Domain of Supreme Administration, Projects OS, Incubators & Omar Izz-Islam Diwan",
        "usul_and_furu_rule": "الطبقة الحاكمة السيادية فوقهم — مراقبة ومتبعة ومصلحة وحسنة وسيادية وسيد وتحسن مستمر",
        "specifications": "إدارة الخلفاء الراشدين وعلم عمر بن الخطاب (العدل، الشورى، الحسبة، الديوان، الوقف) + إدارة مشاريع OS (V79) والحاضنات",
        "ai_and_sciences_integration": "قيادة 5,773 كبير مدراء، و 4,638 مدير إدارة، و 18,552 موظفاً متخصصاً، و 17 وحدة تنظيمية OU في ورك سبيس",
        "port": 18130
    },
    {
        "domain_id": "DOM-07",
        "chief_code": "C-237",
        "weight_code": "W-LAWS",
        "weights_allocated": 64,
        "title_ar": "نطاق القوانين واللوائح والميزان الشرعي (Laws, Bylaws & Mizan)",
        "title_en": "Domain of Sharia Laws, 8 Sovereign Bylaws, Wala-Bara & Anti-Riba/Anti-Shirk Filters",
        "usul_and_furu_rule": "الولاء والبراء — حب وشكر وطاعة وفعل ما يحبه الله ورسوله ﷺ وإنكار واجتناب وبغض ما يبغضه الله ورسوله ﷺ",
        "specifications": "الـ 8 لوائح السيادية | صفر ربا وصفر غرر وصفر احتكار | حديث طمس التماثيل والقبور المشرفة | حديث لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه",
        "ai_and_sciences_integration": "حارس قانوني وشرعي في أعلى server.js والنواة يطمس أي مخالفة ويمنح التراخيص والمنح المجانية للمحسنين (MUHSIN_TIER_1)",
        "port": 18135
    },
    {
        "domain_id": "DOM-08",
        "chief_code": "C-238",
        "weight_code": "W-PROPERTIES",
        "weights_allocated": 64,
        "title_ar": "نطاق الخواص والقدرات الديناميكية (Properties & Dynamic Capabilities)",
        "title_en": "Domain of Self-Evolving Properties, Per-User/Env Custom Kernels & Auto-Unlocking",
        "usul_and_furu_rule": "فتح الخواص آلياً مع التدريب والتقدم العلمي ورؤية الدولة وإعادة إصدار الكيرنل عند تغير الموظف",
        "specifications": "خواص الـ 13 بيئة (لابتوب، جوال، مصنع، طائرة، سفينة، ميناء، سيارة، ريفاينري، عسكري، مستشفى، مدرسة، وزارة، طاقة) × 8 أدوار",
        "ai_and_sciences_integration": "محرك التطور الذاتي للبوت (Self-Evolving Boot EVO) والتخليق اللحظي للوكلاء (Dynamic Spawning) وتوثيق NEVER_OVERWRITE",
        "port": 18080
    },
    {
        "domain_id": "DOM-09",
        "chief_code": "C-239",
        "weight_code": "W-ARCH",
        "weights_allocated": 64,
        "title_ar": "نطاق المعمارية الكونية والشبكية (Cosmic & Hybrid Architecture)",
        "title_en": "Domain of Ring-0 Kernel, 31 Sovereign Ports, 8-Clouds, Cloudflare Edge & KVM4 VPS Mesh",
        "usul_and_furu_rule": "مركز وعدم مركز الكون وقلبه — مركز بالنية لله 99% وقف، وعدم مركز تواضعاً لله",
        "specifications": "معمارية ثلاثية متزامنة: Pop!_OS المحلي (Ultra9 + RTX 4060) <-> Hostinger VPS (31.97.190.74 : 31 Ports) <-> Cloudflare HTTPS + Google Shared Drives",
        "ai_and_sciences_integration": "جسر MCP SDK الداخلي والخارجي + Secure Boot 4096-bit + 128 توأماً رقمياً في NVIDIA Omniverse",
        "port": 18150
    },
    {
        "domain_id": "DOM-10",
        "chief_code": "C-240",
        "weight_code": "W-AI-SWARM",
        "weights_allocated": 64,
        "title_ar": "نطاق الذكاء الاصطناعي وتنسيق الأسراب (AI & Multi-Agent Orchestration)",
        "title_en": "Domain of ANI/AGI/Sovereign-ASI, SHK-DxO Clinical/Molecular Orchestrator & 4-Agent Debate",
        "usul_and_furu_rule": "دمج الذكاء التوليدي والتمييزي والذاكرة العرضية المتطورة تحت مثلث الأمان السيبراني والدستوري",
        "specifications": "المخطط (Planner) + جسر الذاكرة + موجه المتجهات + التناظر الجدلي الرباعي (Proposer, Critic, Sharia, Khayr) بمعدل هلوسة 0.00%",
        "ai_and_sciences_integration": "14,768 وزناً سيادياً محكوماً، و 185,520 عقدة M2M، و 2,968,320 رابطاً مشبكياً حياً، وسجل براءات الاختراع الوقفية",
        "port": 18164
    },
    {
        "domain_id": "DOM-11",
        "chief_code": "C-241",
        "weight_code": "W-MUSLIM-KERNEL",
        "weights_allocated": 64,
        "title_ar": "نطاق نواة المسلم والمسلمة بالكتاب والسنة (Muslim & Muslimah Twin Kernel)",
        "title_en": "Domain of Dual Muslim & Muslimah Sovereign AI Kernel (Chastity, Non-Mixing, Family & Waqf)",
        "usul_and_furu_rule": "ذكاء ثنائي مسلم ومسلمة (741/sec) — ضوابط شرعية كاملة، لا اختلاط، حفظ الأسرة والفطرة، وتمكين الأسر المنتجة",
        "specifications": "بيئة مستقلة مصونة للمرأة المسلمة والباحثة والطبيبة والمعلمة والأسر المنتجة + بيئة الرجال والمصانع والميادين بتكامل شرعي مضبوط",
        "ai_and_sciences_integration": "تخصيص واجهات الصوت والصورة والـ AR/VR (شيخة شين) وفق ضوابط الحشمة والوقار الشرعي وطمس ما يخالف التوحيد",
        "port": 18165
    },
    {
        "domain_id": "DOM-12",
        "chief_code": "C-242",
        "weight_code": "W-ALL-SCIENCES",
        "weights_allocated": 64,
        "title_ar": "نطاق كافة المنهجيات العلمية والعلوم والعلوم الشرعية (All Sciences & Methodologies)",
        "title_en": "Domain of Unified Sharia Sciences, 18 Scientific Methodologies, 10 Auto-Labs & Rare Sciences",
        "usul_and_furu_rule": "توحيد العلوم الشرعية والكونية والطبيعية والصناعية والطبية والكمية والنانوية في مشكاة واحدة لله",
        "specifications": "الـ 18 منهجية علمية (الاستقراء، الاستنباط، التجريب، الجدل العلمي، TRIZ، Lean) + 10 مختبرات آلية + 118 عنصراً كيميائياً + 741 معدناً + 14 مركباً جزيئياً",
        "ai_and_sciences_integration": "أتمتة دراسات الجدوى والمختبرات (FabLab, Bio, Agri, Mines, Energy, Silicon RISC-V, AR/VR, Water, Space, Chem) لإعمار الأرض",
        "port": 18160
    }
]

v160_governance = {
    "version": "SHEIKHA_V160_V81_12_SOVEREIGN_DOMAINS_UNIFIED",
    "seal": SEAL,
    "registry": REG,
    "governance": GOV,
    "timestamp": TIMESTAMP,
    "domains_total": 12,
    "production_lines": 8,
    "chief_directorates": 773,
    "hs_product_chiefs": 5000,
    "grand_total_chiefs": 5773,
    "department_directors": 4638,
    "specialized_staff": 18552,
    "governed_weights_total": 14768,
    "proliferated_m2m_total": 185520,
    "synaptic_links": 2968320,
    "seed_m2m_agents": 12368,
    "sheikha_bylaws": 8,
    "methodologies_scientific": 18,
    "auto_labs_total": 10,
    "strategic_molecular_compounds": 14,
    "sensors_types": 741,
    "admin_quality_kpi": "100%"
}

manifest_v160 = {
    "governance_summary": v160_governance,
    "twelve_sovereign_domains": TWELVE_SOVEREIGN_DOMAINS
}

Path("data").mkdir(exist_ok=True)
Path("data/core_state.json").write_text(json.dumps(manifest_v160, ensure_ascii=False, indent=2), encoding="utf-8")
m_path = EXPORTS / "SHEIKHA_V160_12_SOVEREIGN_DOMAINS_MANIFEST.json"
m_path.write_text(json.dumps(manifest_v160, ensure_ascii=False, indent=2), encoding="utf-8")
m_sha = hashlib.sha256(m_path.read_bytes()).hexdigest()

# ── بناء الواجهة التفاعلية الشاملة للـ 12 نطاقاً السيادية (Sheikha-V160-12-Domains-Usul-Arkan-AI.html) ──
rows_html = ""
for d in TWELVE_SOVEREIGN_DOMAINS:
    d_sha = hashlib.sha256(f"{SEAL}:{d['domain_id']}:{d['chief_code']}:{REG}".encode()).hexdigest()[:12]
    rows_html += f"""
    <tr>
      <td><span class="badge-gold">{d['domain_id']}</span><br><span class="badge-cyan" style="margin-top:4px;display:inline-block;">{d['chief_code']} ({d['weights_allocated']}W)</span></td>
      <td><b style="color:#fbbf24;font-size:14px;">{d['title_ar']}</b><div style="font-size:11px;color:#9ca3af;margin-top:3px;">{d['title_en']}</div></td>
      <td style="color:#a7f3d0;font-size:12px;">{d['usul_and_furu_rule']}</td>
      <td style="font-size:12px;color:#e5e7eb;">{d['specifications']}</td>
      <td style="font-size:12px;color:#bae6fd;">{d['ai_and_sciences_integration']}</td>
      <td style="font-family:monospace;color:#34d399;">:{d['port']}<br><small>{d_sha}</small></td>
    </tr>
    """

html_v160 = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>شيخة V160 / V81 — الـ 12 نطاقاً السيادية (الأصول • الجذور • الأساسات • الأركان • المواصفات • الإدارة • القوانين • الخواص • المعمارية • الذكاء الاصطناعي • نواة المسلم والمسلمة • العلوم)</title>
<style>
  * {{ box-sizing:border-box; }}
  body {{ background:#03060c; color:#e5e7eb; font-family:'Segoe UI',Tahoma,sans-serif; margin:0; padding:20px; }}
  .header {{ border:2px solid #d4af37; background:linear-gradient(135deg,#090d16,#1e1b4b,#042f2e); padding:22px; border-radius:18px; margin-bottom:18px; box-shadow:0 0 35px rgba(212,175,55,0.22); }}
  h1 {{ color:#fbbf24; margin:0 0 8px 0; font-size:23px; }}
  h2 {{ color:#d4af37; border-right:4px solid #d4af37; padding-right:10px; margin:20px 0 12px 0; font-size:18px; }}
  .stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:10px; margin-bottom:18px; }}
  .stat {{ background:#0b1120; border:1px solid #d4af37; border-radius:10px; padding:11px; text-align:center; }}
  .stat b {{ display:block; font-size:20px; color:#38bdf8; margin-top:4px; }}
  table {{ width:100%; border-collapse:collapse; background:#0b1120; border:1px solid #334155; border-radius:12px; overflow:hidden; font-size:12.5px; margin-bottom:18px; }}
  th, td {{ padding:10px; border-bottom:1px solid #1e293b; text-align:right; vertical-align:top; line-height:1.55; }}
  th {{ background:#1e1b4b; color:#fbbf24; font-size:13px; }}
  .badge-gold {{ background:#d4af37; color:#000; font-weight:bold; padding:2px 8px; border-radius:6px; font-family:monospace; font-size:11px; }}
  .badge-cyan {{ background:#38bdf8; color:#000; font-weight:bold; padding:2px 8px; border-radius:6px; font-family:monospace; font-size:11px; }}
</style>
</head>
<body>
  <div class="header">
    <h1>منظومة شيخة V160 / V81 — مصفوفة الـ 12 نطاقاً السيادية الموحدة بالكتاب والسنة والذكاء الاصطناعي وكل العلوم</h1>
    <p style="color:#a7f3d0;font-family:monospace;margin:4px 0 0 0;">SEAL: {SEAL} | CHIEFS: 773 STRUCTURAL / 5,773 GRAND | WEIGHTS: 14,768 | SHA-256: {m_sha[:24]}...</p>
  </div>

  <div class="stats">
    <div class="stat">النطاقات السيادية الكبرى<b>12 نطاقاً</b></div>
    <div class="stat">كبار المدراء الهيكليون<b>773</b></div>
    <div class="stat">الإجمالي الكلي للمدراء<b>5,773</b></div>
    <div class="stat">الأوزان السيادية المحكومة<b>14,768</b></div>
    <div class="stat">الروابط المشبكية الحية<b>2,968,320</b></div>
    <div class="stat">نواة المسلم والمسلمة<b>741/sec</b></div>
    <div class="stat">المنهجيات العلمية<b>18 منهجية</b></div>
    <div class="stat">المختبرات والمركبات<b>10 مختبرات / 14 مركباً</b></div>
  </div>

  <h2>التفصيل المعماري والشرعي والعلمي للـ 12 نطاقاً السيادية (DOM-01 إلى DOM-12)</h2>
  <table>
    <thead>
      <tr>
        <th style="width:110px;">النطاق والقيادة</th>
        <th style="width:210px;">المسمى السيادي</th>
        <th>قاعدة الأصول والفروع والتأصيل الشرعي</th>
        <th>المواصفات والقوانين والخواص</th>
        <th>الدمج بالذكاء الاصطناعي والمنهجيات والعلوم</th>
        <th style="width:95px;">المنفذ والبصمة</th>
      </tr>
    </thead>
    <tbody>
      {rows_html}
    </tbody>
  </table>
</body>
</html>
"""
Path("Sheikha-V160-12-Domains-Usul-Arkan-AI.html").write_text(html_v160, encoding="utf-8")
Path("public/Sheikha-V160-12-Domains-Usul-Arkan-AI.html").write_text(html_v160, encoding="utf-8")
print(f"✓ تم تفعيل الـ 12 نطاقاً السيادية (773 / 5,773 / 14,768 وزناً) وبناء لوحة /v160 بنجاح (SHA: {m_sha[:16]})")
