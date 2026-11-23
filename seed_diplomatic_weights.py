import json, hashlib
from pathlib import Path

p1 = Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p2 = Path("blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")
p3 = Path("SHEIKHA-CORE/blockchain/registry.json")

diplomatic_weights = {
    "SHEIKHA_CORE_WEIGHT_0521_DIPLOMATIC_LANGUAGE_CORE": {
        "id": "SHEIKHA_CORE_WEIGHT_0521_DIPLOMATIC_LANGUAGE_CORE",
        "domain": "Sovereign_Diplomacy_and_Law",
        "title": "الوزن السيادي #0521: لغة شيخة الدبلوماسية ومواثيق المعاملات الدولية",
        "specification": "Standardized diplomatic grammar for international treaty generation bound by Quran and Sunnah",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_DIPLOMATIC_LANG_V72").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0522_INTERNATIONAL_ORGANIZATIONS_GATEWAY": {
        "id": "SHEIKHA_CORE_WEIGHT_0522_INTERNATIONAL_ORGANIZATIONS_GATEWAY",
        "domain": "Global_Institutional_Mesh",
        "title": "الوزن السيادي #0522: بوابة التواصل والامتثال مع المنظمات الدولية (UN, WTO, GCC)",
        "specification": "Institutional interoperability layer mapping sovereign operations to international conventions",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_INTL_ORGS_GATEWAY_V72").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0523_DUAL_STREAM_TRADE_AND_CHARITY": {
        "id": "SHEIKHA_CORE_WEIGHT_0523_DUAL_STREAM_TRADE_AND_CHARITY",
        "domain": "Sharia_Financial_Governance",
        "title": "الوزن السيادي #0523: ميثاق التداول المالي المزدوج (التجاري الشفاف والخيري الوقفي)",
        "specification": "Diplomatic disclosure of 0.5% operational fees alongside mandatory 2.5% Zakat and 10% Waqf allocations",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_DUAL_STREAM_V72").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0524_CUSTOMS_AND_TRADE_CONCORD": {
        "id": "SHEIKHA_CORE_WEIGHT_0524_CUSTOMS_AND_TRADE_CONCORD",
        "domain": "Customs_Supply_Chain_Architecture",
        "title": "الوزن السيادي #0524: الميثاق الجمركي العالمي لتتبع سلاسل المعادن والطاقة بـ HS Codes",
        "specification": "Automated cross-border verification honoring EU CBAM and US Section 307 standards",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_CUSTOMS_CONCORD_V72").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    },
    "SHEIKHA_CORE_WEIGHT_0525_COSMIC_PEACE_AND_JUSTICE": {
        "id": "SHEIKHA_CORE_WEIGHT_0525_COSMIC_PEACE_AND_JUSTICE",
        "domain": "Universal_Charter_Governance",
        "title": "الوزن السيادي #0525: ميثاق السلام والعدالة الكونية وعمار الأرض والسماوات وما بينهما",
        "specification": "Universal ecological and human stewardship protocol enforcing zero exploitation and honest stewardship",
        "shk_reward": 35000,
        "weight_hash": hashlib.sha256(b"SHEIKHA_COSMIC_JUSTICE_V72").hexdigest(),
        "status": "PROPOSED_DESCRIPTOR_NOT_TRAINED"
    }
}

for p in [p1, p2, p3]:
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        data.update(diplomatic_weights)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

h1 = hashlib.sha256(p1.read_bytes()).hexdigest()
print(f"✓ تم توثيق الأوزان الدبلوماسية الخمسة بنجاح")
print(f"✓ إجمالي الأوزان المسجلة في السجل الموحد: {len(data)} وزناً سيادياً")
print(f"✓ البصمة التشفيرية المحدثة للوح المحفوظ: {h1}")
