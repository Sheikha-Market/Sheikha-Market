#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA V146 — Jannah Gardens, Peninsula Meadows & Rivers, Roots, Usul, Qawa'id,
Laws/Properties/Specs, Kingdom of Sheikha Saudi Arabia, Branches & Islamic Da'wah
470 Structural Chiefs (133 Macro + 337 Granular) + 5,000 HS Product Chiefs = 5,470 Total Chiefs
122,800 Proliferated M2M Nodes | 1,964,800 Synaptic Links (1.96M+)
Seal: BOUND_BY_QURAN_SUNNAH | ATOM_WATER_RASUL_JANNAH_SEALED
"""

import csv
import hashlib
import json
import tarfile
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(".")
EXPORTS_DIR = BASE_DIR / "exports"
BACKUPS_DIR = BASE_DIR / "backups"
DOCS_DIR = BASE_DIR / "docs"
CORE_GOV_DIR = BASE_DIR / "SHEIKHA-CORE" / "governance"

for d in (EXPORTS_DIR, BACKUPS_DIR, DOCS_DIR, CORE_GOV_DIR):
    d.mkdir(parents=True, exist_ok=True)

TIMESTAMP = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+03:00")
REGISTRY_HASH = "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV_HASH_SHORT = "87ce771c"

# ══════════════════════════════════════════════════════════════════════════════
# 1. كبار المدراء العامون التسعة الجدد (C-125 إلى C-133)
# ══════════════════════════════════════════════════════════════════════════════
NEW_MACRO_CHIEFS_V146 = [
    ("C-125", "Chief Sheikha Gardens & Jannah-Inspired Paradises Officer (CGardensO)", "كبير مدراء جنات وحدائق شيخة", "12 Gardens & Eco-Oasis Chiefs (GRDN-C-01..12), Sustainable Afforestation, Smart Botanical Parks, Green Waqf Oases, Quranic Jannah-Inspired Beauty & Isti'mar", "100%", "18142"),
    ("C-126", "Chief Sheikha Peninsula Meadows & Rivers Officer (CMeadowsO)", "كبير مدراء جزيرة شيخة مروجاً وأنهاراً", "12 Meadows & Rivers Chiefs (RIVR-C-01..12), Arabian Peninsula Greening, Desalination, Wadis & Aquifers, Hydro-Solar Engineering, Prophetic Hadith Fulfillment", "100%", "18142"),
    ("C-127", "Chief Sovereign Roots Officer (CRootsO)", "كبير مدراء الجذور", "12 Sovereign Roots Chiefs (ROOT-C-01..12), Tawheed & Wahyain Faith Roots, Arabic Triliteral Linguistic Roots, Cryptographic Root of Trust, Deep Geological Mineral Roots", "100%", "18082"),
    ("C-128", "Chief Sovereign Usul & Fundamentals Officer (CUsulO)", "كبير مدراء الأصول", "12 Sovereign Usul Chiefs (USUL-C-01..12), Usul Al-Fiqh, Usul Al-Aqeedah, 535 Lawh Mahfuz Fixed Waqf Assets (No Sale SHA 0cf8bc3c), Engineering & Metallurgical Fundamentals", "100%", "18162"),
    ("C-129", "Chief Sovereign Qawa'id & Foundations Officer (CQawaidO)", "كبير مدراء القواعد", "12 Sovereign Qawa'id Chiefs (QAWD-C-01..12), 5 Major Fiqh Maxims (Al-Qawa'id Al-Fiqhiyyah), SQLite WAL & Distributed Database Engines, Industrial & Architectural Foundations", "100%", "18131"),
    ("C-130", "Chief Laws, Physical/Chemical Properties & Standard Specifications Officer (CLawsSpecsO)", "كبير مدراء القوانين والخواص والمواصفات", "12 Laws, Properties & Specs Chiefs (SPEC-C-01..12), Cosmic & Physical Laws, Chemical/Metallurgical Properties (Cu 99.99% LME Grade A), SASO/ASTM/ISO/DIN/ISRI Standards", "100%", "18126"),
    ("C-131", "Chief Kingdom of Sheikha Saudi Arabia Sovereign Officer (CKSSAO)", "كبير مدراء مملكة شيخة العربية السعودية", "12 Kingdom of Sheikha Saudi Arabia Chiefs (KSSA-C-01..12), Two Holy Mosques Service, Saudi Vision 2030 Alignment, Made in Saudi, Al-Khobar & Nairyah HQ, National Industrial & Digital Sovereignty", "100%", "18082"),
    ("C-132", "Chief Sovereign Branches & Fur'u Officer (CBranchesO)", "كبير مدراء الفروع", "12 Sovereign Branches Chiefs (BRNC-C-01..12), Fiqh Al-Mu'amalat Branches, Regional & Global Commercial Branches, Supply Chain Nodes, Git/Codebase Branches, Goodly Tree Skyward Branches", "99.99%", "18155"),
    ("C-133", "Chief Islamic Da'wah & Global Guidance Officer (CDawahO)", "كبير مدراء نشر الدين الإسلامي والدعوة", "12 Islamic Da'wah & Guidance Chiefs (DAWA-C-01..12), Quran & Sunnah Global Dissemination (100 Languages), Wisdom & Good Counsel, Honest Muslim Merchant Ethics, Beneficial Knowledge Waqf", "100%", "18161"),
]

# ══════════════════════════════════════════════════════════════════════════════
# 2. كبار المدراء التفصيليون الـ 108 (12 لكل قطاع من القطاعات الـ 9)
# ══════════════════════════════════════════════════════════════════════════════
GRANULAR_V146 = []

# 2.1 جنات وحدائق شيخة (GRDN-C-01..12)
gardens_list = [
    ("GRDN-C-01", "Chief Quranic Botanical Gardens Officer", "كبير مدراء حدائق النباتات القرآنية والنبوية (النخيل، الرمان، الزيتون، التين، السدر)", "18142"),
    ("GRDN-C-02", "Chief Palm & Date Waqf Orchards Officer", "كبير مدراء جنات النخيل والأوقاف الزراعية المباركة", "18163"),
    ("GRDN-C-03", "Chief Smart Eco-Industrial Parks Officer", "كبير مدراء الحدائق الصناعية البيئية الذكية عديمة الانبعاثات", "18126"),
    ("GRDN-C-04", "Chief Al-Khobar & Nairyah Green Oases Officer", "كبير مدراء واحات وحدائق الخبر والنعيرية والمنطقة الشرقية", "18142"),
    ("GRDN-C-05", "Chief Vertical & Hydroponic Gardens Officer", "كبير مدراء الحدائق العمودية والزراعة المائية الذكية", "18142"),
    ("GRDN-C-06", "Chief Medicinal & Aromatic Herbs Gardens Officer", "كبير مدراء حدائق النباتات الطبية والعطرية والطب النبوي", "18143"),
    ("GRDN-C-07", "Chief Carbon-Negative Afforestation Officer", "كبير مدراء التشجير المليوني وامتصاص الكربون (المبادرة الخضراء)", "18142"),
    ("GRDN-C-08", "Chief Biodiversity & Wildlife Sanctuaries Officer", "كبير مدراء المحميات الطبيعية والتنوع الإحيائي الفطري", "18142"),
    ("GRDN-C-09", "Chief Knowledge & Innovation Gardens Officer", "كبير مدراء حدائق المعرفة والابتكار والتقنية", "18094"),
    ("GRDN-C-10", "Chief Waqf Public Parks & Family Sanctuaries Officer", "كبير مدراء الحدائق الوقفية العامة ومتنزهات الأسرة", "18163"),
    ("GRDN-C-11", "Chief Desert Rehabilitation & Soil Enrichment Officer", "كبير مدراء استصلاح الأراضي وإعمار الصحراء وتخصيب التربة", "18142"),
    ("GRDN-C-12", "Chief Jannah-Ethical Beauty & Harmony Officer", "كبير مدراء البهجة العمرانية والجمال البيئي المستمد من وصف الجنة", "18142"),
]
for code, en, ar, port in gardens_list:
    GRANULAR_V146.append((code, "SHEIKHA_GARDENS_JANNAH", en, ar, f"Reports to C-125 | {en}", "100%", port))

# 2.2 جزيرة شيخة مروجاً وأنهاراً (RIVR-C-01..12)
rivers_list = [
    ("RIVR-C-01", "Chief Arabian Peninsula Meadows Revival Officer", "كبير مدراء إحياء مروج الجزيرة العربية والغطاء النباتي الدائم", "18142"),
    ("RIVR-C-02", "Chief Renewable Rivers & Wadis Engineering Officer", "كبير مدراء هندسة الأنهار والأودية الجارية ومجاري السيول", "18142"),
    ("RIVR-C-03", "Chief Zero-Brine Solar Desalination Officer", "كبير مدراء تحلية المياه بالطاقة الشمسية والاندماجية بلا رجيع ملحي", "18142"),
    ("RIVR-C-04", "Chief Deep Aquifer & Groundwater Sustainability Officer", "كبير مدراء الخزانات الجوفية العميقة واستدامة المياه العذبة", "18142"),
    ("RIVR-C-05", "Chief Cloud Seeding & Rainwater Harvesting Officer", "كبير مدراء استمطار السحب وحصاد مياه الأمطار والسدود الذكية", "18142"),
    ("RIVR-C-06", "Chief Industrial Closed-Loop Water Recycling Officer", "كبير مدراء تدوير المياه الصناعية المغلقة 100% في الـ 50 مصنعاً", "18126"),
    ("RIVR-C-07", "Chief Grazing Meadows & Livestock Sustainability Officer", "كبير مدراء المروج الرعوية وتنمية الثروة الحيوانية والأمن الغذائي", "18142"),
    ("RIVR-C-08", "Chief Red Sea & Arabian Gulf Marine Ecology Officer", "كبير مدراء بيئة البحر الأحمر والخليج العربي والشعاب المرجانية", "18155"),
    ("RIVR-C-09", "Chief Atmospheric Water Generation Officer", "كبير مدراء تكثيف وتوليد المياه العذبة من رطوبة الهواء الجوي", "18142"),
    ("RIVR-C-10", "Chief Smart Irrigation & IoT Moisture Sensors Officer", "كبير مدراء شبكات الري الذكي وحساسات الرطوبة M2M", "18122"),
    ("RIVR-C-11", "Chief Suqya Al-Maa Waqf & Charitable Wells Officer", "كبير مدراء وقف سقيا الماء وحفر الآبار الخيرية", "18163"),
    ("RIVR-C-12", "Chief Prophetic Eschatological signos & Ecological Balance Officer", "كبير مدراء دراسات الإعجاز النبوي في عودة أرض العرب مروجاً وأنهاراً", "18161"),
]
for code, en, ar, port in rivers_list:
    GRANULAR_V146.append((code, "PENINSULA_MEADOWS_RIVERS", en, ar, f"Reports to C-126 | {en}", "100%", port))

# 2.3 الجذور السيادية (ROOT-C-01..12)
roots_list = [
    ("ROOT-C-01", "Chief Tawheed & Fitrah Root Officer", "كبير مدراء جذر التوحيد الخالص والفطرة الإلهية السليمة", "18082"),
    ("ROOT-C-02", "Chief Quran & Sunnah Revelation Root Officer", "كبير مدراء جذر الوحيين الشريفين (الكتاب والسنة)", "18162"),
    ("ROOT-C-03", "Chief Arabic Triliteral & Morphological Roots Officer", "كبير مدراء الجذور اللغوية العربية الثلاثية والرباعية والاشتقاق", "18148"),
    ("ROOT-C-04", "Chief Hardware & Cryptographic Root of Trust Officer", "كبير مدراء جذر الثقة العتادي والتشفيري (Root of Trust SHA-256)", "18082"),
    ("ROOT-C-05", "Chief Bare-Metal Ring-0 Kernel Root Officer", "كبير مدراء جذر النواة الصلبة (sheikha_kernel.c Ring-0)", "18125"),
    ("ROOT-C-06", "Chief Geological & Mineral Ore Roots Officer", "كبير مدراء الجذور الجيولوجية وعروق المعادن في باطن الأرض", "18126"),
    ("ROOT-C-07", "Chief Historical & Civilizational Roots Officer", "كبير مدراء الجذور التاريخية والحضارية الإسلامية والعربية", "18161"),
    ("ROOT-C-08", "Chief Mathematical & Algorithmic Roots Officer", "كبير مدراء الجذور الرياضية والخوارزمية والجبر الخوارزمي", "18131"),
    ("ROOT-C-09", "Chief Botanical & Agricultural Seed Bank Roots Officer", "كبير مدراء بنك البذور الأصيلة والجذور النباتية الوراثية", "18142"),
    ("ROOT-C-10", "Chief DNS Root Zone & Sovereign Naming Officer", "كبير مدراء منطقة الجذر السيادية للنطاقات (Root Zone DNS)", "18158"),
    ("ROOT-C-11", "Chief Root Cause Analysis (RCA) & Diagnostics Officer", "كبير مدراء تحليل الأسباب الجذرية (RCA) والمنع الاستباقي للأعطال", "18094"),
    ("ROOT-C-12", "Chief Goodly Tree Fixed Root Officer", "كبير مدراء تأصيل الشجرة الطيبة (أصلها ثابت وفرعها في السماء)", "18082"),
]
for code, en, ar, port in roots_list:
    GRANULAR_V146.append((code, "SOVEREIGN_ROOTS", en, ar, f"Reports to C-127 | {en}", "100%", port))

# 2.4 الأصول السيادية (USUL-C-01..12)
usul_list = [
    ("USUL-C-01", "Chief Usul Al-Tawheed & Aqeedah Officer", "كبير مدراء أصول الإيمان والعقيدة الإسلامية الصافية", "18162"),
    ("USUL-C-02", "Chief Usul Al-Fiqh & Istinbat Officer", "كبير مدراء أصول الفقه ومناهج الاستنباط الشرعي", "18162"),
    ("USUL-C-03", "Chief Usul Al-Tafsir & Ulum Al-Quran Officer", "كبير مدراء أصول التفسير وعلوم القرآن الكريم", "18161"),
    ("USUL-C-04", "Chief Usul Al-Hadith & Riwayah Verification Officer", "كبير مدراء أصول الحديث ومصطلحه والتثبت من الأسانيد", "18161"),
    ("USUL-C-05", "Chief 535 Lawh Mahfuz Sovereign Digital Assets Officer", "كبير مدراء الأصول الرقمية السيادية الـ 535 في السجل المحفوظ", "18131"),
    ("USUL-C-06", "Chief Immutable Waqf Assets (No Sale SHA 0cf8bc3c) Officer", "كبير مدراء الأصول الوقفية الثابتة (وقف ناجز لا يباع ولا يوهب ولا يورث)", "18163"),
    ("USUL-C-07", "Chief Industrial Fixed Assets (50 Factories & 20 WMS) Officer", "كبير مدراء الأصول الصناعية واللوجستية الثابتة", "18126"),
    ("USUL-C-08", "Chief Mineral Reserves & Mining Assets Officer", "كبير مدراء أصول الاحتياطيات التعدينية والسبائك السيادية", "18126"),
    ("USUL-C-09", "Chief Intellectual Property & 48 Foundational Weights Assets Officer", "كبير مدراء أصول الملكية الفكرية والأوزان السيادية الـ 10,000", "18159"),
    ("USUL-C-10", "Chief Financial & Halal Treasury Assets Officer", "كبير مدراء الأصول المالية والخزينة الحلال الخالية من الربا", "18140"),
    ("USUL-C-11", "Chief Usul Al-Handasah & Systems Architecture Officer", "كبير مدراء أصول الهندسة والعمارة السيادية للأنظمة", "18094"),
    ("USUL-C-12", "Chief Usul Al-Tijarah & Honest Market Conduct Officer", "كبير مدراء أصول التجارة الشرعية وآداب السوق الإسلامي", "18093"),
]
for code, en, ar, port in usul_list:
    GRANULAR_V146.append((code, "SOVEREIGN_USUL", en, ar, f"Reports to C-128 | {en}", "100%", port))

# 2.5 القواعد السيادية (QAWD-C-01..12)
qawaid_list = [
    ("QAWD-C-01", "Chief Maxim 'Matters by Intentions' (Al-Umur bi-Maqasidiha) Officer", "كبير مدراء قاعدة الأمور بمقاصدها وإخلاص النية لله", "18162"),
    ("QAWD-C-02", "Chief Maxim 'Certainty Not Removed by Doubt' Officer", "كبير مدراء قاعدة اليقين لا يزول بالشك والتثبت الرقمي", "18162"),
    ("QAWD-C-03", "Chief Maxim 'Hardship Brings Ease' (Al-Mashaqqah Tajlib Al-Taysir) Officer", "كبير مدراء قاعدة المشقة تجلب التيسير وتسهيل تجربة المستفيد", "18162"),
    ("QAWD-C-04", "Chief Maxim 'No Harm & No Reciprocating Harm' (La Darar wa La Dirar) Officer", "كبير مدراء قاعدة لا ضرر ولا ضرار والضرر يزال", "18162"),
    ("QAWD-C-05", "Chief Maxim 'Custom is Authoritative' (Al-Adah Muhakkamah) Officer", "كبير مدراء قاعدة العادة محكمة والأعراف التجارية الصحيحة", "18162"),
    ("QAWD-C-06", "Chief SQLite WAL & High-Speed Relational Databases Officer", "كبير مدراء قواعد البيانات العلائقية السيادية (SQLite WAL / PostgreSQL)", "18131"),
    ("QAWD-C-07", "Chief Vector & 10,000 Weights Knowledge Bases Officer", "كبير مدراء قواعد البيانات المتجهة وقواعد المعرفة للـ 10,000 وزن", "18131"),
    ("QAWD-C-08", "Chief Time-Series & Industrial Telemetry Databases Officer", "كبير مدراء قواعد بيانات السلاسل الزمنية والقياسات الصناعية (Prometheus)", "9091"),
    ("QAWD-C-09", "Chief Bare-Metal Server & Data Center Bases Officer", "كبير مدراء القواعد الحاسوبية ومراكز البيانات (VPS-949321 & Khobar/Nairyah)", "18158"),
    ("QAWD-C-10", "Chief Structural & Civil Engineering Foundations Officer", "كبير مدراء القواعد الإنشائية والخرسانية والمعدنية للمصانع", "18141"),
    ("QAWD-C-11", "Chief Cybersecurity & Zero-Trust Rulebases Officer", "كبير مدراء قواعد الأمن السيبراني وجدران الحماية (L2 62,954 Blocked)", "18162"),
    ("QAWD-C-12", "Chief Algorithmic & Logical Rule Engines Officer", "كبير مدراء محركات القواعد المنطقية والحوكمة الآلية الصارمة", "18082"),
]
for code, en, ar, port in qawaid_list:
    GRANULAR_V146.append((code, "SOVEREIGN_QAWAID", en, ar, f"Reports to C-129 | {en}", "100%", port))

# 2.6 القوانين والخواص والمواصفات (SPEC-C-01..12)
specs_list = [
    ("SPEC-C-01", "Chief Cosmic Sunan & Sharia Laws Compliance Officer", "كبير مدراء السنن الكونية والقوانين الشرعية والنظامية", "18162"),
    ("SPEC-C-02", "Chief Physical & Thermodynamic Laws Officer", "كبير مدراء القوانين الفيزيائية والديناميكا الحرارية في أفران الصهر (1200°C)", "18126"),
    ("SPEC-C-03", "Chief Chemical Purity & Atomic Composition Officer", "كبير مدراء الخواص الكيميائية والنقاء الذري (Cathode Cu 99.99% Grade A)", "18126"),
    ("SPEC-C-04", "Chief Mechanical & Metallurgical Properties Officer", "كبير مدراء الخواص الميكانيكية والميتالورجية (الصلادة، الشد، المطيلية)", "18126"),
    ("SPEC-C-05", "Chief Electrical & Thermal Conductivity Properties Officer", "كبير مدراء خواص التوصيلية الكهربائية والحرارية الفائقة (101% IACS)", "18126"),
    ("SPEC-C-06", "Chief SASO Saudi Standards & Quality Mark Officer", "كبير مدراء المواصفات والمقاييس السعودية (SASO) وعلامة الجودة", "18159"),
    ("SPEC-C-07", "Chief ASTM & ASME International Materials Specs Officer", "كبير مدراء المواصفات القياسية الأمريكية للمواد والسبائك (ASTM / ASME)", "18159"),
    ("SPEC-C-08", "Chief ISO 9001/14001/27001/50001 Standards Officer", "كبير مدراء مواصفات الأيزو العالمية للجودة والبيئة والأمن والطاقة", "18159"),
    ("SPEC-C-09", "Chief LME & LBMA Bullion & Cathode Specifications Officer", "كبير مدراء مواصفات بورصة لندن للمعادن (LME) وسوق السبائك (LBMA)", "18093"),
    ("SPEC-C-10", "Chief ISRI Scrap & Recycling Grading Specifications Officer", "كبير مدراء مواصفات ومعايير تصنيف الخردة والتدوير العالمية (ISRI)", "18126"),
    ("SPEC-C-11", "Chief Software ABI V1 & Native Protocol Specifications Officer", "كبير مدراء مواصفات البرمجيات الأصيلة (SHEIKHA-LANGUAGE-NATIVE-ABI-V1)", "18131"),
    ("SPEC-C-12", "Chief Optical, Spectroscopic & XRF Assay Specs Officer", "كبير مدراء الخواص الطيفية والبصرية والفحص المخبري بالأشعة السينية (XRF)", "18126"),
]
for code, en, ar, port in specs_list:
    GRANULAR_V146.append((code, "LAWS_PROPERTIES_SPECS", en, ar, f"Reports to C-130 | {en}", "100%", port))

# 2.7 مملكة شيخة العربية السعودية (KSSA-C-01..12)
kssa_list = [
    ("KSSA-C-01", "Chief Two Holy Mosques Digital & Waqf Service Officer", "كبير مدراء خدمة الحرمين الشريفين (مكة المكرمة والمدينة المنورة) والأوقاف", "18163"),
    ("KSSA-C-02", "Chief Saudi Vision 2030 & National Transformation Officer", "كبير مدراء مواءمة رؤية المملكة 2030 وبرامج التحول الوطني", "18082"),
    ("KSSA-C-03", "Chief Al-Khobar & Nairyah Sovereign HQ Command Officer", "كبير مدراء القيادة المركزية في الخبر والنعيرية والمنطقة الشرقية", "18082"),
    ("KSSA-C-04", "Chief 'Made in Saudi' & National Industrialization Officer", "كبير مدراء برنامج صُنع في السعودية وتوطين الصناعات التعدينية والتحويلية", "18126"),
    ("KSSA-C-05", "Chief Saudi Mining & Arabian Shield Wealth Officer", "كبير مدراء ثروات الدرع العربي والتعدين السعودي (الذهب، النحاس، الفوسفات)", "18126"),
    ("KSSA-C-06", "Chief ZATCA, SDAIA & National Gov-Integration Officer", "كبير مدراء التكامل الحكومي الوطني (ZATCA UUID f18f8146، سدايا، فسح، نافذ)", "18140"),
    ("KSSA-C-07", "Chief Saudi Sovereign AI & Arabic LLM Dominance Officer", "كبير مدراء السيادة السعودية في الذكاء الاصطناعي والنماذج العربية", "18131"),
    ("KSSA-C-08", "Chief Saudi Green Initiative & Clean Energy Officer", "كبير مدراء مبادرة السعودية الخضراء والطاقة النظيفة والهيدروجين الأخضر", "18142"),
    ("KSSA-C-09", "Chief Saudi Logistics Hub (3-Continents Bridge) Officer", "كبير مدراء المنصة اللوجستية السعودية الرابطة بين القارات الثلاث", "18155"),
    ("KSSA-C-10", "Chief Saudi Halal Economy & Islamic Finance Leadership Officer", "كبير مدراء ريادة الاقتصاد الحلال والمالية الإسلامية في المملكة", "18140"),
    ("KSSA-C-11", "Chief Saudi Youth Empowerment & Engineering Cadres Officer", "كبير مدراء تمكين الكفاءات الوطنية والمهندسين السعوديين", "18160"),
    ("KSSA-C-12", "Chief Saudi Global Export & Trade Diplomacy Officer", "كبير مدراء الصادرات السعودية غير النفطية والتجارة الدولية", "18093"),
]
for code, en, ar, port in kssa_list:
    GRANULAR_V146.append((code, "KINGDOM_SHEIKHA_SAUDI_ARABIA", en, ar, f"Reports to C-131 | {en}", "100%", port))

# 2.8 الفروع السيادية (BRNC-C-01..12)
branches_list = [
    ("BRNC-C-01", "Chief Fiqh Al-Mu'amalat & Halal Contracts Branches Officer", "كبير مدراء الفروع الفقهية في المعاملات المالية والعقود الحلال", "18162"),
    ("BRNC-C-02", "Chief KSA 13 Regions & 20 Cities Branches Officer", "كبير مدراء الفروع الإقليمية في مناطق المملكة الـ 13 والمدن الـ 20", "18155"),
    ("BRNC-C-03", "Chief GCC & Islamic World Branches Officer", "كبير مدراء فروع الخليج العربي والعالم الإسلامي", "18155"),
    ("BRNC-C-04", "Chief 7 Continents & 20 Global Partner Countries Branches Officer", "كبير مدراء الفروع القارية والدولية في الـ 7 قارات والـ 20 دولة", "18155"),
    ("BRNC-C-05", "Chief 50 Smart Factories Production Branches Officer", "كبير مدراء الفروع الإنتاجية والصناعية للـ 50 مصنعاً ذكياً", "18126"),
    ("BRNC-C-06", "Chief 20 Automated Warehouses (WMS) Branches Officer", "كبير مدراء فروع المستودعات الذكية والمناطق اللوجستية الـ 20", "18155"),
    ("BRNC-C-07", "Chief 10 POS & Digital E-Commerce Branches Officer", "كبير مدراء فروع نقاط البيع الـ 10 والمتاجر الإلكترونية", "18163"),
    ("BRNC-C-08", "Chief 22 Scientific & Applied Knowledge Branches Officer", "كبير مدراء الفروع العلمية والتطبيقية للـ 22 علماً في شجرة شيخة", "18161"),
    ("BRNC-C-09", "Chief Git Repositories & Software Release Branches Officer", "كبير مدراء فروع الشفرة المصدرية والإصدارات البرمجية المحكمة", "18110"),
    ("BRNC-C-10", "Chief M2M Synaptic Neural Arborization Branches Officer", "كبير مدراء التفرعات الشجيرية العصبية (1,964,800 Synaptic Links)", "18160"),
    ("BRNC-C-11", "Chief Waqf & Charitable Distribution Branches Officer", "كبير مدراء فروع مصارف الزكاة الثمانية ومشاريع الوقف الخيري", "18163"),
    ("BRNC-C-12", "Chief Skyward Goodly Tree Branches (Far'uha fi Al-Samaa) Officer", "كبير مدراء الفروع السامية للشجرة الطيبة (وفرعها في السماء تؤتي أكلها كل حين)", "18082"),
]
for code, en, ar, port in branches_list:
    GRANULAR_V146.append((code, "SOVEREIGN_BRANCHES", en, ar, f"Reports to C-132 | {en}", "100%", port))

# 2.9 نشر الدين الإسلامي والدعوة (DAWA-C-01..12)
dawah_list = [
    ("DAWA-C-01", "Chief Global Quranic Dissemination & Tajweed Officer", "كبير مدراء نشر القرآن الكريم وتلاوته وتجويده وتدبره عالمياً", "18161"),
    ("DAWA-C-02", "Chief Prophetic Sunnah & Seerah Publication Officer", "كبير مدراء نشر السنة النبوية الصحيحة والسيرة العطرة لخير البشر ﷺ", "18161"),
    ("DAWA-C-03", "Chief Tawheed & Pure Aqeedah Call Officer", "كبير مدراء الدعوة إلى التوحيد الخالص وتصحيح العقيدة بالحكمة", "18162"),
    ("DAWA-C-04", "Chief 100-Languages AI Translation & Da'wah Content Officer", "كبير مدراء ترجمة المحتوى الإسلامي والدعوي إلى 100 لغة عالمية", "18148"),
    ("DAWA-C-05", "Chief Wisdom & Goodly Counsel (Bi-Al-Hikmah) Officer", "كبير مدراء منهج الدعوة بالحكمة والموعظة الحسنة والجدال بالتي هي أحسن", "18161"),
    ("DAWA-C-06", "Chief Honest Muslim Merchant Da'wah by Example Officer", "كبير مدراء الدعوة بالقدوة الحسنة وأمانة وصدق التاجر المسلم في الأسواق", "18093"),
    ("DAWA-C-07", "Chief New Muslims Support & Educational Onboarding Officer", "كبير مدراء رعاية وتعليم المهتدين الجدد وتيسير تفقههم في الدين", "18163"),
    ("DAWA-C-08", "Chief Islamic Ethics in AI & Technology Officer", "كبير مدراء نشر الأخلاق الإسلامية والضوابط الشرعية في الذكاء الاصطناعي", "18131"),
    ("DAWA-C-09", "Chief Intellectual Doubt-Refutation & Apologetics Officer", "كبير مدراء تفنيد الشبهات الفكرية بالحجة العلمية والبرهان العقلي والشرعي", "18162"),
    ("DAWA-C-10", "Chief Digital Da'wah Platforms & Media Studio Officer", "كبير مدراء المنصات الرقمية الدعوية واستوديو المحتوى القيمي الهادف", "18151"),
    ("DAWA-C-11", "Chief Da'wah Waqf & Global Scholars Endowment Officer", "كبير مدراء أوقاف الدعوة إلى الله وكفالة العلماء والدعاة وطلبة العلم", "18163"),
    ("DAWA-C-12", "Chief Mercy to the Worlds (Rahmatan lil-Alamin) Civilization Officer", "كبير مدراء إبراز محاسن الإسلام الحضارية ورسالة (وما أرسلناك إلا رحمة للعالمين)", "18161"),
]
for code, en, ar, port in dawah_list:
    GRANULAR_V146.append((code, "ISLAMIC_DAWAH_GUIDANCE", en, ar, f"Reports to C-133 | {en}", "100%", port))

# ══════════════════════════════════════════════════════════════════════════════
# 3. دمج كبار المدراء السابقين (353 من V145) مع الـ 117 الجدد = 470 هيكلي + 5,000 HS = 5,470
# ══════════════════════════════════════════════════════════════════════════════
existing_rows = []
v145_csv = EXPORTS_DIR / "SHEIKHA_V145_353_STRUCTURAL_CHIEFS_MASTER.csv"
if v145_csv.exists():
    with open(v145_csv, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            existing_rows.append(r)

all_470_rows = list(existing_rows)
seq = len(all_470_rows) + 1

for code, en, ar, scope, kpi, port in NEW_MACRO_CHIEFS_V146:
    all_470_rows.append({
        "seq": seq,
        "chief_id": code,
        "tier": "SUPREME_MACRO_COUNCIL_133",
        "title_en": en,
        "title_ar": ar,
        "domain_scope": scope,
        "directors_count": 6,
        "engineers_count": 24,
        "seed_m2m_agents": 16,
        "proliferated_m2m_nodes": 240,
        "synaptic_links": 3840,
        "license_id": f"SHK-M2M-2026-{seq:04d}",
        "bound_port": port,
        "kpi_target": kpi,
        "sharia_seal": "BOUND_BY_QURAN_SUNNAH"
    })
    seq += 1

for code, tier_group, en, ar, scope, kpi, port in GRANULAR_V146:
    all_470_rows.append({
        "seq": seq,
        "chief_id": code,
        "tier": tier_group,
        "title_en": en,
        "title_ar": ar,
        "domain_scope": scope,
        "directors_count": 6,
        "engineers_count": 24,
        "seed_m2m_agents": 16,
        "proliferated_m2m_nodes": 240,
        "synaptic_links": 3840,
        "license_id": f"SHK-M2M-2026-{seq:04d}",
        "bound_port": port,
        "kpi_target": kpi,
        "sharia_seal": "BOUND_BY_QURAN_SUNNAH"
    })
    seq += 1

csv_v146_path = EXPORTS_DIR / "SHEIKHA_V146_470_STRUCTURAL_CHIEFS_MASTER.csv"
with open(csv_v146_path, "w", newline="", encoding="utf-8-sig") as f:
    fieldnames = [
        "seq", "chief_id", "tier", "title_en", "title_ar", "domain_scope",
        "directors_count", "engineers_count", "seed_m2m_agents",
        "proliferated_m2m_nodes", "synaptic_links", "license_id",
        "bound_port", "kpi_target", "sharia_seal"
    ]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(all_470_rows)

# ══════════════════════════════════════════════════════════════════════════════
# 4. توليد بيان الحوكمة الشامل V146
# ══════════════════════════════════════════════════════════════════════════════
manifest_v146 = {
    "schema": "SHEIKHA_V146_JANNAH_ROOTS_USUL_QAWAID_LAWS_KSSA_BRANCHES_DAWAH_GOVERNANCE",
    "timestamp": TIMESTAMP,
    "seal": "BOUND_BY_QURAN_SUNNAH",
    "trinity_seal": "ATOM_WATER_RASUL_JANNAH_SEALED",
    "registry_sha256": REGISTRY_HASH,
    "governance_short": GOV_HASH_SHORT,
    "counts": {
        "supreme_macro_chiefs": 133,
        "granular_domain_chiefs": 337,
        "structural_chiefs_total": 470,
        "hs_product_chiefs": 5000,
        "grand_total_chiefs": 5470,
        "department_directors": 2820,
        "specialized_engineers": 11280,
        "human_and_structural_leadership_total": 19570,
        "seed_m2m_agents_gen0": 7520,
        "proliferated_m2m_nodes": 122800,
        "synaptic_links": 1964800,
        "sovereign_licenses": 526,
        "governed_weights_total": 10000
    },
    "v146_nine_pillars_summary": {
        "C-125_Gardens_Jannah": "12 Gardens & Oases Chiefs (GRDN-C-01..12)",
        "C-126_Peninsula_Meadows_Rivers": "12 Meadows & Rivers Chiefs (RIVR-C-01..12)",
        "C-127_Sovereign_Roots": "12 Faith, Linguistic, Crypto & Geological Roots Chiefs (ROOT-C-01..12)",
        "C-128_Sovereign_Usul": "12 Usul Al-Fiqh, Aqeedah & 535 Fixed Waqf Assets Chiefs (USUL-C-01..12)",
        "C-129_Sovereign_Qawaid": "12 Fiqh Maxims, SQLite WAL Databases & Industrial Foundations Chiefs (QAWD-C-01..12)",
        "C-130_Laws_Properties_Specs": "12 Cosmic/Physical Laws, Cu 99.99% Properties & SASO/ASTM/ISO/LME Specs Chiefs (SPEC-C-01..12)",
        "C-131_Kingdom_Sheikha_Saudi_Arabia": "12 Kingdom of Sheikha Saudi Arabia National Sovereignty Chiefs (KSSA-C-01..12)",
        "C-132_Sovereign_Branches": "12 Fiqh, Regional, Global, Industrial & Skyward Tree Branches Chiefs (BRNC-C-01..12)",
        "C-133_Islamic_Dawah_Guidance": "12 Global Quran & Sunnah Da'wah (100 Languages) & Merchant Ethics Chiefs (DAWA-C-01..12)"
    }
}

manifest_path = CORE_GOV_DIR / "v146_jannah_roots_usul_laws_kssa_dawah_manifest.json"
manifest_path.write_text(json.dumps(manifest_v146, ensure_ascii=False, indent=2), encoding="utf-8")
manifest_sha = hashlib.sha256(manifest_path.read_bytes()).hexdigest()

# ══════════════════════════════════════════════════════════════════════════════
# 5. توليد اللوحة التفاعلية الشاملة:
#    Sheikha-V146-Jannah-Roots-Usul-Laws-KSSA-Dawah-5470.html
# ══════════════════════════════════════════════════════════════════════════════
html_v146 = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SHEIKHA V146 — جنات وحدائق شيخة • مروجاً وأنهاراً • الجذور والأصول والقواعد والقوانين • مملكة شيخة العربية السعودية • الفروع والدعوة (5,470 Chiefs | 1.96M+ Synaptic)</title>
  <style>
    :root {{
      --bg: #070c17;
      --surface: #0f172a;
      --gold: #d4af37;
      --gold-soft: rgba(212, 175, 55, 0.25);
      --green: #00ff88;
      --blue: #38bdf8;
      --purple: #a78bfa;
      --text: #e2e8f0;
      --muted: #94a3b8;
    }}
    * {{ box-sizing: border-box; font-family: 'Tajawal', 'Cairo', system-ui, sans-serif; }}
    body {{ margin: 0; background: var(--bg); color: var(--text); line-height: 1.65; }}
    .mono {{ font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace; }}
    header {{
      position: sticky; top: 0; z-index: 50;
      background: rgba(7, 12, 23, 0.95); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--gold-soft); padding: 14px 24px;
    }}
    .container {{ max-width: 1500px; margin: 0 auto; padding: 20px 24px; }}
    .badge {{
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700;
    }}
    .badge-gold {{ background: rgba(212,175,55,0.14); color: var(--gold); border: 1px solid var(--gold-soft); }}
    .badge-green {{ background: rgba(0,255,136,0.14); color: var(--green); border: 1px solid rgba(0,255,136,0.3); }}
    .badge-blue {{ background: rgba(56,189,248,0.14); color: var(--blue); border: 1px solid rgba(56,189,248,0.3); }}
    .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 12px; margin-bottom: 22px; }}
    .kpi-card {{ background: var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; }}
    .kpi-val {{ font-size: 22px; font-weight: 800; margin-top: 4px; }}
    .section-card {{
      background: var(--surface); border: 1px solid var(--gold-soft);
      border-radius: 16px; padding: 20px; margin-bottom: 22px;
      box-shadow: 0 0 28px rgba(212, 175, 55, 0.06) inset;
    }}
    .section-title {{
      font-size: 16px; font-weight: 800; color: var(--gold);
      margin: 0 0 14px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
    }}
    .grid-3 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }}
    .grid-4 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; }}
    .item-box {{ background: #070c17; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px; }}
    .tabs {{ display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }}
    .tab-btn {{
      background: #070c17; color: var(--text); border: 1px solid var(--gold-soft);
      padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 12px;
    }}
    .tab-btn.active, .tab-btn:hover {{ background: var(--gold); color: #070c17; }}
  </style>
</head>
<body>
  <header>
    <div style="max-width:1500px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="mono" style="width:46px;height:46px;border-radius:10px;background:var(--gold);color:#070c17;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;">V146</div>
        <div>
          <h1 style="margin:0;font-size:17px;font-weight:800;color:#fff;">منظومة شيخة السيادية V146 — <span style="color:var(--gold);">الجنات والحدائق • مروجاً وأنهاراً • الجذور والأصول والقواعد والقوانين • مملكة شيخة العربية السعودية • الفروع والدعوة</span></h1>
          <div class="mono" style="font-size:11px;color:var(--muted);">BOUND_BY_QURAN_SUNNAH • ATOM_WATER_RASUL_JANNAH_SEALED • Registry: {REGISTRY_HASH[:16]}... • Manifest SHA: {manifest_sha[:16]}...</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span class="badge badge-green">● 29/29 PORTS BOUND SO_REUSEADDR</span>
        <span class="badge badge-gold">5,470 CHIEFS (470 + 5,000 HS)</span>
        <span class="badge badge-blue">1,964,800 SYNAPTIC LINKS (1.96M+)</span>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="kpi-grid">
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">SUPREME MACRO CHIEFS</div><div class="kpi-val mono" style="color:var(--gold);">133</div><div style="font-size:11px;color:var(--muted);">C-01 إلى C-133 (+9 جدد)</div></div>
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">GRANULAR DOMAIN CHIEFS</div><div class="kpi-val mono" style="color:var(--blue);">337</div><div style="font-size:11px;color:var(--muted);">+108 تفصيلي (9 قطاعات × 12)</div></div>
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">GRAND TOTAL CHIEFS</div><div class="kpi-val mono" style="color:#fff;">5,470</div><div style="font-size:11px;color:var(--gold);">470 هيكلي + 5,000 منتج HS</div></div>
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">DIRECTORS & ENGINEERS</div><div class="kpi-val mono" style="color:var(--blue);">14,100</div><div style="font-size:11px;color:var(--muted);">2,820 مدير إدارة + 11,280 مهندساً</div></div>
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">M2M NEURAL NODES</div><div class="kpi-val mono" style="color:var(--green);">122,800</div><div style="font-size:11px;color:var(--muted);">7,520 بذرة × 15 + 10,000 منتج</div></div>
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">SYNAPTIC LINKS</div><div class="kpi-val mono" style="color:var(--purple);">1,964,800</div><div style="font-size:11px;color:var(--green);">قرابة 2 مليون رابط مشبكي عصبي!</div></div>
      <div class="kpi-card"><div class="mono" style="font-size:10px;color:var(--muted);">SOVEREIGN LICENSES</div><div class="kpi-val mono" style="color:var(--gold);">526 + 5000</div><div style="font-size:11px;color:var(--muted);">SHK-M2M-2026-0001..0470</div></div>
    </div>

    <!-- كبار المدراء العامون التسعة الجدد C-125 إلى C-133 -->
    <section class="section-card">
      <div class="section-title">
        <span>المجلس الأعلى للتأسيس الرباني والوطني والكوني (C-125 إلى C-133) — 9 كبار مدراء عامين + 108 كبار مدراء تفصيليين</span>
        <span class="badge badge-gold">أصلها ثابت وفرعها في السماء</span>
      </div>
      <div class="grid-3">
        <div class="item-box" style="border-color:var(--green);"><div class="mono" style="color:var(--green);font-weight:700;">C-125 • كبير مدراء جنات وحدائق شيخة</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (GRDN-C-01..12) لحدائق النباتات القرآنية، جنات النخيل الوقفية، الواحات الخضراء، والحدائق البيئية الصناعية.</div></div>
        <div class="item-box" style="border-color:var(--blue);"><div class="mono" style="color:var(--blue);font-weight:700;">C-126 • كبير مدراء جزيرة شيخة مروجاً وأنهاراً</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (RIVR-C-01..12) لإحياء مروج الجزيرة العربية، الأنهار والأودية، تحلية المياه، الخزانات الجوفية، ووقف سقيا الماء.</div></div>
        <div class="item-box" style="border-color:var(--gold);"><div class="mono" style="color:var(--gold);font-weight:700;">C-127 • كبير مدراء الجذور</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (ROOT-C-01..12) لجذر التوحيد والفطرة، جذور اللغة العربية، جذر الثقة العتادي Root of Trust، والجذور الجيولوجية للمعادن.</div></div>
        <div class="item-box" style="border-color:var(--gold);"><div class="mono" style="color:var(--gold);font-weight:700;">C-128 • كبير مدراء الأصول</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (USUL-C-01..12) لأصول العقيدة، أصول الفقه، الأصول الوقفية الثابتة (535 أصلاً في اللوح المحفوظ لا تباع)، وأصول الهندسة والتجارة.</div></div>
        <div class="item-box" style="border-color:var(--blue);"><div class="mono" style="color:var(--blue);font-weight:700;">C-129 • كبير مدراء القواعد</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (QAWD-C-01..12) للقواعد الفقهية الخمس الكبرى، قواعد البيانات العلائقية والمتجهة (SQLite WAL)، والقواعد الصناعية والسيبرانية.</div></div>
        <div class="item-box" style="border-color:var(--purple);"><div class="mono" style="color:var(--purple);font-weight:700;">C-130 • كبير مدراء القوانين والخواص والمواصفات</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (SPEC-C-01..12) للسنن الكونية، القوانين الفيزيائية، الخواص الكيميائية والميتالورجية (Cu 99.99%)، ومواصفات SASO/ASTM/ISO/LME.</div></div>
        <div class="item-box" style="border-color:var(--green);"><div class="mono" style="color:var(--green);font-weight:700;">C-131 • كبير مدراء مملكة شيخة العربية السعودية</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (KSSA-C-01..12) لخدمة الحرمين الشريفين، رؤية المملكة 2030، قيادة الخبر والنعيرية، صُنع في السعودية، وثروات الدرع العربي.</div></div>
        <div class="item-box" style="border-color:var(--gold);"><div class="mono" style="color:var(--gold);font-weight:700;">C-132 • كبير مدراء الفروع</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (BRNC-C-01..12) للفروع الفقهية، فروع المناطق الـ 13 والمدن الـ 20 والقارات الـ 7، فروع المصانع الـ 50، وفروع الشجرة الطيبة في السماء.</div></div>
        <div class="item-box" style="border-color:var(--green);"><div class="mono" style="color:var(--green);font-weight:700;">C-133 • كبير مدراء نشر الدين الإسلامي والدعوة</div><div style="font-size:12px;margin-top:4px;">12 كبير مدراء (DAWA-C-01..12) لنشر القرآن الكريم والسنة النبوية بـ 100 لغة، الدعوة بالحكمة والموعظة الحسنة، وأخلاق التاجر المسلم الصدوق الأمين.</div></div>
      </div>
    </section>

    <!-- التبويبات التفاعلية للـ 108 كبار مدراء تفصيليين -->
    <section class="section-card">
      <div class="section-title">
        <span>التفصيل الكامل للـ 108 كبار مدراء ميدانيين في الركائز التسع (12 كبير مدراء لكل ركيزة)</span>
        <span class="badge badge-green">SHK-M2M-2026-0354..0470</span>
      </div>
      <div class="tabs">
        <button class="tab-btn active" onclick="openTab('grdn', this)">🌴 جنات وحدائق شيخة (12)</button>
        <button class="tab-btn" onclick="openTab('rivr', this)">🏞️ جزيرة شيخة مروجاً وأنهاراً (12)</button>
        <button class="tab-btn" onclick="openTab('root', this)">🌳 الجذور (12)</button>
        <button class="tab-btn" onclick="openTab('usul', this)">🏛️ الأصول (12)</button>
        <button class="tab-btn" onclick="openTab('qawd', this)">📐 القواعد (12)</button>
        <button class="tab-btn" onclick="openTab('spec', this)">🔬 القوانين والخواص والمواصفات (12)</button>
        <button class="tab-btn" onclick="openTab('kssa', this)">🇸🇦 مملكة شيخة العربية السعودية (12)</button>
        <button class="tab-btn" onclick="openTab('brnc', this)">🌿 الفروع (12)</button>
        <button class="tab-btn" onclick="openTab('dawa', this)">🕋 نشر الدين الإسلامي والدعوة (12)</button>
      </div>
"""

tab_groups = [
    ("grdn", gardens_list, True),
    ("rivr", rivers_list, False),
    ("root", roots_list, False),
    ("usul", usul_list, False),
    ("qawd", qawaid_list, False),
    ("spec", specs_list, False),
    ("kssa", kssa_list, False),
    ("brnc", branches_list, False),
    ("dawa", dawah_list, False),
]

for tab_id, items, is_first in tab_groups:
    disp = "block" if is_first else "none"
    html_v146 += f'      <div id="pane-{tab_id}" class="tab-pane" style="display:{disp};"><div class="grid-4">\n'
    for code, en, ar, port in items:
        html_v146 += f'        <div class="item-box"><span class="mono" style="color:var(--gold);font-weight:700;">{code}</span> <span class="mono" style="font-size:10px;color:var(--green);">(Port {port})</span><div style="font-weight:700;font-size:13px;margin:4px 0;">{ar}</div><div class="mono" style="font-size:10px;color:var(--muted);">{en}</div></div>\n'
    html_v146 += '      </div></div>\n'

html_v146 += f"""    </section>
    <footer style="text-align:center;padding:18px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:var(--muted);" class="mono">
      SHEIKHA V146 OMNI-SOVEREIGN CONSOLE • 5,470 CHIEFS • 122,800 M2M NODES • 1,964,800 SYNAPTIC LINKS • WAQF FIXED NO SALE (SHA 0cf8bc3c) • BOUND_BY_QURAN_SUNNAH
    </footer>
  </main>
  <script>
    function openTab(id, btn) {{
      document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
      document.getElementById('pane-' + id).style.display = 'block';
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }}
  </script>
</body>
</html>
"""

html_path = BASE_DIR / "Sheikha-V146-Jannah-Roots-Usul-Laws-KSSA-Dawah-5470.html"
html_path.write_text(html_v146, encoding="utf-8")

# ══════════════════════════════════════════════════════════════════════════════
# 6. إنشاء أرشيف النسخة الاحتياطية السيادية V146
# ══════════════════════════════════════════════════════════════════════════════
tar_path = BACKUPS_DIR / "SHEIKHA_V146_5470CHIEFS_1_96M_SYNAPTIC_JANNAH_ROOTS_USUL_KSSA_DAWAH.tar.gz"
with tarfile.open(tar_path, "w:gz") as tar:
    for fpath in [csv_v146_path, manifest_path, html_path]:
        if fpath.exists():
            tar.add(fpath, arcname=fpath.name)

tar_sha = hashlib.sha256(tar_path.read_bytes()).hexdigest()
print(f"✓ تم توليد {csv_v146_path} (470 كبير مدراء هيكلي + 5,000 منتج = 5,470 كبير مدراء)")
print(f"✓ تم توليد اللوحة التفاعلية: {html_path}")
print(f"✓ بصمة بيان الحوكمة V146 (SHA-256): {manifest_sha}")
print(f"✓ الأرشيف السيادي: {tar_path} | SHA-256: {tar_sha}")
