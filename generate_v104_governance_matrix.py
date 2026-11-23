import json, hashlib, datetime
from pathlib import Path

drafts_dir = Path("governance/drafts")
drafts_dir.mkdir(parents=True, exist_ok=True)

# 1. مصفوفة الـ 15 جهة + الجهات الوطنية السيادية (CST & SDAIA)
ENTITIES = [
    {"id": "01_MONSHAAT", "name": "منشآت (Monsha'at)", "tier": "الأولى", "role": "دعم وتأهيل مؤسسة سعودية", "action": "خدمات التأهيل وبرامج المنشآت", "url": "https://monshaat.gov.sa/en", "score": {"rev": 35, "fit": 25, "ease": 15, "cap": 10, "know": 10, "total": 95}, "platform": "Sheikha Governance & Licensing"},
    {"id": "02_ARAMCO", "name": "أرامكو السعودية (Aramco)", "tier": "الأولى", "role": "مورد معادن/خدمات", "action": "مراجعة اشتراطات الموردين والسجل والنشاط (التسجيل لا يضمن أمر شراء)", "url": "https://www.aramco.com/en/what-we-do/suppliers/become-a-supplier", "score": {"rev": 38, "fit": 25, "ease": 11, "cap": 8, "know": 10, "total": 92}, "platform": "Sheikha Supply Gateway"},
    {"id": "03_SABIC", "name": "سابك (SABIC)", "tier": "الأولى", "role": "مورد صناعي", "action": "ملف العناية الواجبة والتأهيل الفني (التسجيل لا يضمن أمر شراء)", "url": "https://supplier.sabic.com/RegisterSABICSupplier.aspx", "score": {"rev": 36, "fit": 25, "ease": 11, "cap": 8, "know": 10, "total": 90}, "platform": "Sheikha Supply Gateway"},
    {"id": "04_MAERSK", "name": "ميرسك (Maersk)", "tier": "الثانية", "role": "لوجستيات", "action": "مراجعة قاعدة الموردين وتحديد خدمة محددة", "url": "https://www.maersk.com/procurement/how-to-reach-us", "score": {"rev": 34, "fit": 22, "ease": 12, "cap": 9, "know": 9, "total": 86}, "platform": "Sheikha Logistics Network"},
    {"id": "05_SHOPIFY", "name": "Shopify", "tier": "الثانية", "role": "تطبيقات/تجار", "action": "تحديد مسار مطور أو خدمات بتفويض محدود", "url": "https://www.shopify.com/partners", "score": {"rev": 33, "fit": 22, "ease": 13, "cap": 9, "know": 8, "total": 85}, "platform": "Sheikha Commerce Apps"},
    {"id": "06_KFUPM", "name": "جامعة الملك فهد للبترول والمعادن (KFUPM)", "tier": "الثانية", "role": "بحث وتطوير", "action": "تقديم مشكلة صناعية قابلة للبحث المشترك", "url": "https://ri.kfupm.edu.sa/collaboration/about-us/overview", "score": {"rev": 30, "fit": 25, "ease": 14, "cap": 9, "know": 10, "total": 88}, "platform": "Sheikha University & Skills Lab"},
    {"id": "07_MICROSOFT", "name": "Microsoft", "tier": "الثانية", "role": "برامج سحابية/ISV", "action": "تحديد عضوية البرنامج ونموذج المنتج", "url": "https://partner.microsoft.com/en-us/partnership", "score": {"rev": 32, "fit": 23, "ease": 12, "cap": 8, "know": 9, "total": 84}, "platform": "Sheikha Cloud & AI Exchange"},
    {"id": "08_AWS", "name": "AWS", "tier": "الثانية", "role": "برنامج شركاء", "action": "مراجعة متطلبات Partner Central", "url": "https://aws.amazon.com/partners/", "score": {"rev": 31, "fit": 22, "ease": 12, "cap": 8, "know": 9, "total": 82}, "platform": "Sheikha Cloud & AI Exchange"},
    {"id": "09_OPENAI", "name": "OpenAI", "tier": "الثالثة", "role": "تكامل API وتطبيقات", "action": "تصميم بوابة محكومة قبل الربط بمفاتيح فعلية", "url": "https://developers.openai.com/", "score": {"rev": 29, "fit": 22, "ease": 12, "cap": 8, "know": 9, "total": 80}, "platform": "Sheikha Cloud & AI Exchange"},
    {"id": "10_GOOGLE_CLOUD", "name": "Google Cloud", "tier": "الثالثة", "role": "تكامل سحابي", "action": "التمييز بين استخدام الخدمات والعضوية الرسمية", "url": "https://cloud.google.com/partners", "score": {"rev": 32, "fit": 23, "ease": 11, "cap": 8, "know": 9, "total": 83}, "platform": "Sheikha Cloud & AI Exchange"},
    {"id": "11_DHL", "name": "DHL", "tier": "الثالثة", "role": "مورد لوجستي", "action": "تجهيز نموذج مورد ومدونة السلوك", "url": "https://group.dhl.com/en/about-us/supplier-portal.html", "score": {"rev": 28, "fit": 21, "ease": 12, "cap": 9, "know": 8, "total": 78}, "platform": "Sheikha Logistics Network"},
    {"id": "12_SAP", "name": "SAP", "tier": "الثالثة", "role": "ERP/SCM", "action": "اختبار نطاق منتج يلائم PartnerEdge", "url": "https://partneredge.sap.com/en/public.html", "score": {"rev": 28, "fit": 21, "ease": 10, "cap": 8, "know": 9, "total": 76}, "platform": "Sheikha Digital Industry Studio"},
    {"id": "13_NVIDIA", "name": "NVIDIA Inception", "tier": "مشروط", "role": "برنامج ناشئة تقنية", "action": "فحص أهلية شيخة بسبب استثناء مزودي السحابة والاستشارات", "url": "https://www.nvidia.com/en-us/startups/", "score": {"rev": 26, "fit": 22, "ease": 10, "cap": 7, "know": 10, "total": 75}, "platform": "Sheikha Digital Industry Studio"},
    {"id": "14_META", "name": "Meta", "tier": "الثالثة", "role": "تكامل اجتماعي", "action": "تصحيح OAuth ومراجعة أذونات التطبيقات", "url": "https://developers.facebook.com/", "score": {"rev": 31, "fit": 22, "ease": 11, "cap": 9, "know": 8, "total": 81}, "platform": "Sheikha Commerce Apps"},
    {"id": "15_HOSTINGER", "name": "Hostinger", "tier": "الثالثة", "role": "علاقة مورد واستضافة", "action": "جمع العقد وحقوق الخدمة والنسخ والتعافي", "url": "https://www.hostinger.com/", "score": {"rev": 34, "fit": 23, "ease": 14, "cap": 8, "know": 8, "total": 87}, "platform": "Sheikha Governance & Licensing"},
    {"id": "16_CST_SAUDI", "name": "هيئة الاتصالات والفضاء والتقنية (CST)", "tier": "الأولى (تنظيمي)", "role": "تراخيص الحوسبة السحابية والمنصات", "action": "مراجعة لوائح تسجيل مقدمي خدمات الحوسبة السحابية والامتثال السيادي", "url": "https://www.cst.gov.sa/", "score": {"rev": 36, "fit": 25, "ease": 13, "cap": 10, "know": 10, "total": 94}, "platform": "Sheikha Governance & Licensing"},
    {"id": "17_SDAIA_SAUDI", "name": "الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)", "tier": "الأولى (تنظيمي)", "role": "حوكمة البيانات وأخلاقيات الذكاء الاصطناعي", "action": "مطابقة معايير حماية البيانات الشخصية (PDPL) ومبادئ الذكاء الاصطناعي المسؤول", "url": "https://sdaia.gov.sa/", "score": {"rev": 35, "fit": 25, "ease": 13, "cap": 10, "know": 10, "total": 93}, "platform": "Sheikha Cloud & AI Exchange"}
]

# 2. توليد مسودة مستقلة لكل جهة داخل governance/drafts/
for ent in ENTITIES:
    draft_md = f"""# شيخة — مسودة تعاون وتأهيل داخلية غير مرسلة ({ent['name']})

- **الجهة المستهدفة:** {ent['name']}
- **المرحلة التنظيمية:** {ent['tier']} (مجموع نقاط الأولوية: {ent['score']['total']}/100)
- **الدور والمجال:** {ent['role']}
- **الإجراء المطلوب:** {ent['action']}
- **الرابط المرجعي:** {ent['url']}
- **منصة شيخة الحاضنة:** {ent['platform']}
- **حالة العلاقة الحالية:** **وثيقة تحضيرية داخلية للمراجعة البشرية؛ ليست شراكة رسمية موقعة ولا طلباً مقدماً.**
- **بيانات المنشأة:** سوق شيخة (س.ت: 2051263653 | موحد: 7049031003) — المالك: سلمان أحمد بن سلمان الراجح.

---

## نص المسودة التحضيرية
السادة / إدارة الشراكات والتأهيل لدى **{ent['name']}** المحترمين،
السلام عليكم ورحمة الله وبركاته،

تعمل منظومة شيخة (سجل تجاري رقم 2051263653) على تطوير حلول تقنية وتجارية في قطاع سلاسل الإمداد والمعادن والحوسبة المحكومة بضوابط الشفافية والامتثال النظامي.
نرغب في استكشاف متطلبات التأهيل والتسجيل الرسمية لديكم في مجال ({ent['role']})، وتحديد الاشتراطات الفنية والقانونية اللازمة عبر منصة ({ent['platform']}) التابعة لنا.

*ضابط حوكمي: لا يتم إرسال هذه المسودة أو تفعيل أي ربط خارجي إلا بعد المراجعة والاعتماد البشري المباشر من المالك السيادي.*
"""
    (drafts_dir / f"{ent['id']}_DRAFT.md").write_text(draft_md, encoding="utf-8")

# 3. حفظ ملف الإثبات والبصمة الشامل
manifest = {
    "schema": "SHEIKHA_V104_GOVERNANCE_AND_8_PLATFORMS",
    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "owner": "سلمان أحمد بن سلمان الراجح (CR: 2051263653 | Unified: 7049031003)",
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "scoring_formula": "قرب الإيراد (40) + الملاءمة (25) + سهولة التأهيل (15) + قلة رأس المال (10) + أثر المعرفة (10) = 100",
    "honesty_disclaimers": [
        "درجات الأولوية اجتهاد تنظيمي داخلي وليست تصنيفاً رسمياً",
        "التسجيل لدى أرامكو وسابك وميرسك لا يضمن عملاً أو أمر شراء تلقائياً",
        "برنامج NVIDIA Inception مشروط بفحص الأهلية نظراً لاستثناء مزودي السحابة والاستشارات",
        "الوحدات الـ 8 مقترحة ومفعلة داخل مصنع الإدارة المحلي ولم تنشر كتطبيقات مشتركة مستقلة دون ترخيص"
    ],
    "automation_boundaries": {
        "enabled_locally": ["فهرسة 17 جهة (15 + CST + SDAIA)", "حساب ترتيب الفرص", "إعداد مسودة لكل جهة", "توليد مؤشرات يومية", "حفظ تاريخ التشغيل وبصمات الملفات"],
        "disabled_without_approval": ["إرسال بريد خارجي", "التسجيل التلقائي في برامج الشركاء", "قبول الشروط نيابة عن المالك", "توقيع عقود ملزمة أو دفع مالي", "إصدار عملات أو تعديل DNS والأسرار"]
    },
    "entities_count": len(ENTITIES),
    "entities": ENTITIES
}

raw_json = json.dumps(manifest, ensure_ascii=False, indent=2)
manifest_hash = hashlib.sha256(raw_json.encode("utf-8")).hexdigest()
Path("SHEIKHA_V104_15ENTITIES_8PLATFORMS_MANIFEST.json").write_text(raw_json, encoding="utf-8")

print("================== 🏛️ مصنع حوكمة الشراكات والمنصات الـ 8 (V104.0) ==================")
print(f"✓ تم فهرسة وتقييم {len(ENTITIES)} جهة استراتيجية وتوليد مسوداتها الآمنة في: governance/drafts/")
print(f"✓ تم حفظ سجل الحوكمة الشامل في: SHEIKHA_V104_15ENTITIES_8PLATFORMS_MANIFEST.json")
print(f"✓ بصمة الإثبات التشفيرية (SHA-256): {manifest_hash}")
print("====================================================================================")
