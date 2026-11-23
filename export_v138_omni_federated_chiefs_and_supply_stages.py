import csv, json, hashlib, datetime
from pathlib import Path

# 1) المجلس الأعلى لكبار المدراء العامين (78 كبير مدراء: C-01 .. C-78)
MACRO_CHIEFS_78 = [
    ("C-01", "Chief Executive Officer (CEO M2M)", "كبير المدراء التنفيذيين", "OKRs / BSC / Corporate Governance", "99.9%", 18082),
    ("C-02", "Chief Planning Officer (CPO)", "كبير مدراء التخطيط (تخطيط وتنفيذ)", "PMBOK 7 / Critical Path / Scenario Planning", "99.5%", 18082),
    ("C-03", "Chief Engineering Officer (CEngO)", "كبير مدراء الهندسة", "IEEE / ISO 15288 / NVIDIA Omniverse USD", "99.6%", 18094),
    ("C-04", "Chief Financial Officer (CFO)", "كبير مدراء المالية", "IFRS / Halal Capital / Zero-Riba Liquidity", "99.9%", 18140),
    ("C-05", "Chief Accounting Officer (CAO)", "كبير مدراء المحاسبة", "ZATCA Phase2 UBL 2.1 / 4-Ledgers Split", "100%", 18163),
    ("C-06", "Chief Support Services Officer", "كبير مدراء المساندة", "ITIL v4 / SLA 99.99% / Lean Support", "99.1%", 18158),
    ("C-07", "Chief Supply Chain Officer (CSCO)", "كبير مدراء سلاسل الإمداد والتوريد", "SCOR Model / JIT / 12-Stage Sequential Handoff", "99.8%", 18093),
    ("C-08", "Chief Logistics Officer (CLO)", "كبير مدراء اللوجستيات", "BOL GPS Live / Maersk-DHL-SIRC GoGreen", "99.3%", 18155),
    ("C-09", "Chief Contracts Officer (CCO)", "كبير مدراء العقود", "FIDIC / Shariah No-Gharar Smart Contracts", "99.8%", 18159),
    ("C-10", "Chief Industrial Officer (CIndO)", "كبير مدراء الصناعة (50 مصنعاً)", "Lean Six Sigma / ISIC 24.10-24.45 / Smelting 1200C", "99.5%", 18126),
    ("C-11", "Chief Technology Officer (CTO)", "كبير مدراء التقنية", "Cloud Run me-central1 / Zero-Trust / Argon", "99.9%", 18156),
    ("C-12", "Chief Knowledge Officer (CKO)", "كبير مدراء المعرفة", "ISO 30401 Knowledge Management / Waqf Edu", "99.2%", 18161),
    ("C-13", "Chief Scientists Council Officer", "كبير مدراء مجلس العلماء والخبراء", "Shariah & Scientific Peer Review", "99.9%", 18135),
    ("C-14", "Chief R&D, Innovation & Exploration", "كبير مدراء البحث والتطوير والابتكار والاستكشاف", "ISO 56002 / TRIZ / Stage-Gate / KFUPM Lab", "99.6%", 18110),
    ("C-15", "Chief Sciences Officer", "كبير مدراء العلوم الطبيعية والتطبيقية", "Metallurgy / Spectroscopy Cu 99.99% / Physics", "99.8%", 18126),
    ("C-16", "Chief Computation & Mathematical Verification", "كبير مدراء الحساب الرياضي والتحقق الخوارزمي", "Algorithmic Verification / SHA-256 / GRAND 10000+", "100%", 18131),
    ("C-17", "Chief Statistics Officer", "كبير مدراء الإحصاء", "Six Sigma SPC / Telemetry & Variance Control", "99.7%", 9091),
    ("C-18", "Chief Training Officer", "كبير مدراء التدريب", "Competency Matrix 18160 / Vocational & AI Training", "99.3%", 18160),
    ("C-19", "Chief Earth & Heavens Stewardship", "كبير مدراء إعمار السماوات والأرض وما بينهما", "Universal Waqf 10% / Green Circular Economy", "100%", 18142),
    ("C-20", "Chief Commerce Officer", "كبير مدراء التجارة", "Global Markets LME/COMEX/Tadawul / HS 5000", "99.6%", 18165),
    ("C-21", "Chief Administration Officer", "كبير مدراء الإدارة والنظام الإداري", "ISO 9001:2015 / EFQM / Administrative Excellence", "99.8%", 18120),
    ("C-22", "Chief Quality Officer (CQO)", "كبير مدراء الجودة والجودة الإدارية", "TQM / Six Sigma DMAIC (3.4 DPMO) / LME Grade A", "99.95%", 18110),
    ("C-23", "Chief Safety & HSE Officer", "كبير مدراء السلامة", "ISO 45001 / ISO 14001 / Zero Harm", "100%", 18126),
    ("C-24", "Chief Marketing Officer (CMO)", "كبير مدراء التسويق", "100 Marketers Network / Omni-Channel / Meta API", "99.5%", 18151),
    ("C-25", "Chief Sales Officer (CSO)", "كبير مدراء المبيعات", "CEO Buyer Engine 18164 / 10 POS / sheikha.sa", "99.5%", 18164),
    ("C-26", "Chief PMO Officer (CPMO)", "كبير مدراء مكتب المشاريع التقنية", "PMI PMBOK 7 / Agile / 128 Digital Twins", "99.9%", 18154),
    ("C-27", "Chief Operating Officer (COO)", "كبير مدراء التشغيل", "29 Sovereign Ports / 20 WMS Warehouses 24/7", "99.9%", 18157),
    ("C-28", "Chief Legal & Corporate Counsel Officer", "كبير مدراء القانون والمحاماة والشؤون القانونية", "Saudi Commercial Law / PDPL / Dispute Resolution", "99.9%", 18160),
    ("C-29", "Chief Governance Officer (CGO)", "كبير مدراء الحوكمة ولوائح شيخة", "Sheikha Sovereign Bylaws / COBIT 2019 / ISO 37000", "100%", 18162),
    ("C-30", "Chief Telecommunications & MCP/SDK Officer", "مدير كبراء الاتصالات وبروتوكولات MCP/SDK", "ITU-T / IEEE 802 / MCP JSON-RPC 2.0 / gRPC / OPC-UA", "99.98%", 18158),
    ("C-31", "Chief Omni-Channel Communication Officer", "مدير كبراء التواصل والعلاقات المؤسسية والدبلوماسية", "ISO 26000 / Diplomatic & Meta/WhatsApp/Omni-AI Bridge", "99.96%", 18120),
    ("C-32", "Chief Asset Officer (CASO)", "كبير مدراء الأصول والأصول الوقفية الثابتة", "ISO 55001 / EAM / IFRS 13 Fair Value / Fixed Waqf", "100%", 18142),
    ("C-33", "Chief Construction Officer (CBldO)", "كبير مدراء البناء والتشييد الهندسي", "Saudi Building Code (SBC) / BIM 7D / Omniverse Twins", "99.92%", 18094),
    ("C-34", "Chief Mega-Projects Officer (CMPO)", "كبير مدراء المشاريع الكبرى والرأسمالية", "PMBOK Construction Ext / PRINCE2 / Earned Value M2M", "99.94%", 18154),
    ("C-35", "Chief Contracting & EPC Officer (CEpcO)", "كبير مدراء المقاولات وعقود الاستصناع (EPC)", "Shariah Istisna'a & FIDIC Red/Yellow/Silver", "99.95%", 18159),
    ("C-36", "Chief Real Estate Officer (CREO)", "كبير مدراء العقارات والمدن الصناعية والأوقاف العقارية", "MODON & RCJY Industrial Lands / 50 Factories Estates", "99.95%", 18158),
    ("C-37", "Chief Civilization & Imar Officer (CCIO)", "كبير مدراء الإعمار والتطوير الحضري والكوني", "Quranic Isti'mar / LEED Platinum / Universal Waqf 10%", "100%", 18165),
    ("C-38", "Chief Shariah & Fatwa Audit Officer (CSFO)", "كبير مدراء الشريعة والفتوى والرقابة الشرعية", "Quran & Sunnah / AAOIFI Shariah Standards", "100%", 18135),
    ("C-39", "Chief Zakat & Universal Waqf Officer (CZWO)", "كبير مدراء الزكاة والوقف الكوني والعمل الخيري", "8 Zakat Masarif / Fixed Waqf Endowment", "100%", 18141),
    ("C-40", "Chief Mining & Geological Exploration (CMGO)", "كبير مدراء التعدين والجيولوجيا والثروات المعدنية", "JORC Code / MW-001..020 Ores / Copper & Gold", "99.7%", 18093),
    ("C-41", "Chief Scrap & Circular Recycling Officer (CSRO)", "كبير مدراء السكراب والتدوير والاقتصاد الدائري", "ISRI Scrap Specs / SW-001..015 HMS1&2 / WEEE", "99.6%", 18126),
    ("C-42", "Chief Smelting & Foundry Metallurgy (CSmO)", "كبير مدراء المصاهر والسباكة والتعدين الحراري", "Furnace 1200C / LME Grade A Cathode Cu 99.99%", "99.95%", 18126),
    ("C-43", "Chief Renewable Energy, Water & Sustainability", "كبير مدراء الطاقة المتجددة والمياه والاستدامة", "ISO 50001 Energy / Green Hydrogen & Solar Smelting", "99.8%", 18142),
    ("C-44", "Chief Cybersecurity & Data Sovereignty (CCSO)", "كبير مدراء الأمن السيبراني وحماية البيانات السيادية", "NCA ECC / ISO 27001 / SDAIA PDPL / 62,954 Watch Guard", "100%", 18162),
    ("C-45", "Chief AI, Weights & Digital Twins Officer (CAIO)", "كبير مدراء الذكاء الاصطناعي والأوزان والتوائم الرقمية", "10,000 Sovereign Weights / 128 NVIDIA Omniverse Twins", "99.98%", 18131),
    ("C-46", "Chief Customs, Ports & Cross-Border Trade", "كبير مدراء الجمارك والموانئ والتجارة العابرة للحدود", "WCO HS Code 5000 / ZATCA Fasah / Digital BOL 11-Col", "99.85%", 18155),
    ("C-47", "Chief Treasury, Settlement & Halal Payments", "كبير مدراء الخزينة والتسويات والمدفوعات الحلال", "Instant Split (0.5/2.5/10/87%) / Moyasar-Mada-Stripe", "100%", 18140),
    ("C-48", "Chief Risk, Compliance & Business Continuity", "كبير مدراء المخاطر والامتثال واستمرارية الأعمال", "ISO 31000 Risk / ISO 22301 Continuity / 24/7 Watchdog", "99.96%", 18162),
    ("C-49", "Chief Customer Experience & B2B Buyer Success", "كبير مدراء تجربة العميل ونجاح الشركاء وكبار المشترين", "12 CEO Buyer Personas / 10 POS Centers / SLA 99.99%", "99.7%", 18164),
    ("C-50", "Chief Human Resources & M2M Talent Officer", "كبير مدراء الموارد البشرية واستقطاب المواهب والـ M2M", "Saudi Labor Law / GOSI Automation / Full Org Roster", "99.95%", 18160),
    ("C-51", "Chief Computing, Computer & Calculation (C3O)", "كبير مدراء الحوسبة والحاسب والحساب", "HPC Supercomputing / Bare-Metal RISC-V / Exact Hisab", "100%", 18131),
    ("C-52", "Grand Chief Scholar (Supreme Authority — GCS)", "كبير العلماء (المرجعية العلمية والشرعية العليا)", "Unity of Revelation (Quran & Sunnah) & Cosmic Sciences", "100%", 18135),
    ("C-53", "Chief Council of Scientists & Scholars Director", "كبير مدراء العلماء والمجامع العلمية والبحثية", "Global Scholars Council / Peer Review / KFUPM Lab", "99.99%", 18161),
    ("C-54", "Chief Shariah Sciences & Usul Officer (CSSO)", "كبير مدراء العلوم الشرعية (الكتاب والسنة والتوحيد والفقه)", "Aqeedah & Tawheed / Tafsir / Hadith / Usul Al-Fiqh", "100%", 18135),
    # الكبار الـ 24 الجدد المضافون في V138:
    ("C-55", "Chief Global & Local Markets Officer (CMktO)", "كبير مدراء الأسواق (القيادة العليا للأسواق الـ 18)", "LME / COMEX / LBMA / SHFE / Tadawul / ISRI Governance", "99.9%", 18165),
    ("C-56", "Chief Islamic & Macro-Economics Officer (CEconO)", "كبير مدراء الاقتصاد والاقتصاد الإسلامي الكلي", "Real Asset-Backed Economy / Zero-Riba / Anti-Monopoly", "99.95%", 18140),
    ("C-57", "Chief Supreme Management Officer (CSMO)", "كبير مدراء الإدارة العليا والتوجيه المؤسسي", "Sovereign Command / Drucker & Mintzberg & Islamic Admin", "99.95%", 18082),
    ("C-58", "Chief Systems, Organizations & Regulations (CSORO)", "كبير مدراء النظم والمنظمات والأنظمة", "ISO 15288 Systems Eng / Organizational Design / Bylaws", "99.96%", 18162),
    ("C-59", "Chief Administrative Systems & ERP Officer (CASO-ERP)", "كبير مدراء النظم الإدارية وأتمتة الإجراءات", "SAP S/4HANA / Microsoft Alliance / Paperless M2M Admin", "99.9%", 18153),
    ("C-60", "Chief Sovereign Sources & Provenance Officer (CSrcO)", "كبير مدراء المصادر وتوثيق المنشأ والمرجعية", "Primary Source Verification / Ore & Scrap Provenance", "100%", 18093),
    ("C-61", "Chief Information Officer (CIO)", "كبير مدراء المعلومات ونظم قواعد البيانات السيادية", "ISO 27001 / Data Lakes / SQLite WAL & Blockchain Sync", "99.98%", 18131),
    ("C-62", "Chief Metals & Alloys Officer (CMetO)", "كبير مدراء المعادن والسبائك الاستراتيجية (20 نوعاً)", "MT-001 Cathode Cu 99.99% LME Grade A / Precious & Base Metals", "99.95%", 18126),
    ("C-63", "Chief Halal Wealth & Capital Officer (CMalO)", "كبير مدراء المال وحفظ وتنمية الثروة الحلال", "Maqasid Al-Shariah Hifz Al-Mal / Halal Capital Allocation", "100%", 18140),
    ("C-64", "Chief Organizations & Ecosystem Officer (CEcoO)", "كبير مدراء المنظمات والمنظومة والتحالفات", "24 Global Supply Networks / Multi-Entity Ecosystem", "99.9%", 18161),
    ("C-65", "Chief Federation & Federated Architecture (CFedO)", "كبير مدراء الفدرلة والفدرالية المعمارية والذكاء الفدرالي", "Federated Learning / Federated Microservices & 12 Domains", "99.97%", 18161),
    ("C-66", "Chief Government Integration Officer (CGovIO)", "كبير مدراء التكامل الحكومي والمنصات الوطنية (G2B)", "ZATCA / Monshaat / MODON / Fasah / GOSI / SDAIA / CST", "100%", 18120),
    ("C-67", "Chief Sheikha Sovereign Vision Officer (CSVO)", "كبير مدراء الرؤية — رؤية شيخة السيادية", "Sheikha Charter / Quran & Sunnah Leadership / Global Good", "100%", 18082),
    ("C-68", "Chief Saudi Vision 2030 Programs Officer (CSV2030)", "كبير مدراء الرؤية وأهداف وبرامج السعودية 2030", "NIDLP / Made in Saudi / Shareek / Saudi Green Initiative", "100%", 18120),
    ("C-69", "Chief Local & International Consulting Officer (CAdvO)", "كبير مدراء الاستشارات المحلية والدولية", "ISO 20700 Management Consulting / Engineering & Shariah Advisory", "99.85%", 18110),
    ("C-70", "Chief Sheikha Global & Cosmic Vision Officer (CGCVO)", "كبير مدراء رؤية شيخة الدولية والكونية", "GRAND 10000+ Universe / Universal Waqf / Humanity Benefit", "100%", 18165),
    ("C-71", "Chief Energy & Industrial Power Officer (CEngyO)", "كبير مدراء الطاقة والشبكات الحرارية والكهربائية", "Furnace 1200C Power / Industrial Grid / Renewable Mix", "99.9%", 18126),
    ("C-72", "Chief All-Sectors Master Officer (CSecMO)", "كبير مدراء القطاعات (المشرف العام على الـ 22 قطاعاً)", "UN ISIC Rev.4 Master Governance / Cross-Sector Synergy", "99.92%", 18157),
    ("C-73", "Chief Master Products Portfolio Officer (CPrdMO)", "كبير مدراء المنتجات (المشرف العام على الـ 5000 منتج)", "WCO HS Code 5000 Portfolio / Quality & Pricing Matrix", "99.94%", 18157),
    ("C-74", "Chief Economic Feasibility Studies Officer (CFeasO)", "كبير مدراء دراسات الجدوى الاقتصادية والمالية والفنية", "UNIDO Feasibility Methodology / Zero-Riba NPV & IRR", "99.95%", 18140),
    ("C-75", "Chief Trade Journeys Master Officer (CTrjMO)", "كبير مدراء الرحلات التجارية (المشرف العام على الـ 12 رحلة)", "End-to-End Trade Lifecycle / Mine-to-Buyer Automation", "99.92%", 18155),
    ("C-76", "Chief SheikhaChain Sovereign Ledger Officer (CSChO)", "كبير مدراء شيخة شين (SheikhaChain) وسجل اللوح المحفوظ", "SheikhaChain Core / Lawh Mahfuz 535 Registry SHA edc795a4", "100%", 18131),
    ("C-77", "Chief Blockchain & Smart Contracts Officer (CBchO)", "كبير مدراء البلوك شين والعقود الذكية والتوثيق التشفيري", "Zero-Gharar Smart Contracts / Merkle Trees / SHA-256 Proofs", "100%", 18131),
    ("C-78", "Chief Master Cloud Infrastructure Officer (CCloudO)", "كبير مدراء السحابة العامة والسيادية (المشرف على الـ 8 سحابات)", "Multi-Cloud & Sovereign Cloud me-central1 / Bare-Metal", "99.98%", 18150)
]

# 2) كبار المدراء لكل مرحلة في سلاسل الإمداد والتوريد + تسليم المرحلة التي تليها وأوزانها (12 مرحلة)
SUPPLY_STAGE_CHIEFS_12 = [
    ("STG-C-01", "كبير مدراء مرحلة المنجم والاستخراج (Mine Stage Chief)", "STG-C-02 (مرحلة المصهر 1200°C)", "98.0%", 18093, "استخراج وفحص الخامات المعدنية (MW-001..020) وتسليمها آلياً للمصهر"),
    ("STG-C-02", "كبير مدراء مرحلة المصهر والسباكة (Smelter 1200°C Stage Chief)", "STG-C-03 (مرحلة المصنع والتشكيل)", "99.0%", 18126, "صهر الخام والسكراب وإنتاج كاثود النحاس النقي 99.99% (MT-001) وتسليمه للمصنع"),
    ("STG-C-03", "كبير مدراء مرحلة المصنع والتشكيل (Factory 50-Twins Stage Chief)", "STG-C-04 (مرحلة المختبر والتعبئة)", "94.0%", 18157, "تشكيل القضبان والصفائح والسبائك عبر 50 مصنعاً توأماً وتسليمها للمختبر"),
    ("STG-C-04", "كبير مدراء مرحلة المختبر والجودة والتعبئة (QC Lab & Packaging Chief)", "STG-C-05 (مرحلة المستودع الذكي WMS)", "99.5%", 18110, "فحص مطابقة LME Grade A وإصدار شهادة الوزن والتغليف وتسليمها للمستودع"),
    ("STG-C-05", "كبير مدراء مرحلة المستودع الذكي (Warehouse 20-Twins WMS Chief)", "STG-C-06 (مرحلة النقل البري والأسطول)", "95.0%", 18158, "تخزين ذكي بحرارة ورطوبة محكومة عبر 20 مستودعاً وتسليم الشحنة للنقل البري"),
    ("STG-C-06", "كبير مدراء مرحلة النقل البري والأسطول (Inland Transport Fleet Chief)", "STG-C-07 (مرحلة ميناء التصدير)", "96.5%", 18155, "نقل بري آمن بتتبع GPS حي من المستودع إلى بوابة ميناء التصدير"),
    ("STG-C-07", "كبير مدراء مرحلة ميناء التصدير والمحطة البحرية (Origin Port Chief)", "STG-C-08 (مرحلة الشحن البحري/الجوي الدولي)", "97.2%", 18155, "إصدار مسودة بوليصة الشحن الرقمية (BOL 11-Col) والتحميل على السفينة"),
    ("STG-C-08", "كبير مدراء مرحلة الشحن الدولي البحري والجوي (Global Carrier Maersk/DHL Chief)", "STG-C-09 (مرحلة الجمارك والفسح)", "97.8%", 18155, "شحن دولي GoGreen عبر 24 شبكة إمداد وتسليمها لميناء الوجهة والجمارك"),
    ("STG-C-09", "كبير مدراء مرحلة الجمارك والفسح والميناء الوجهة (Customs Clearance Chief)", "STG-C-10 (مرحلة مركز التوزيع الإقليمي)", "98.5%", 18163, "مطابقة HS Code والفاتورة الإلكترونية ZATCA والفسح الجمركي الآلي"),
    ("STG-C-10", "كبير مدراء مرحلة مركز التوزيع الإقليمي (Distribution Hub Chief)", "STG-C-11 (مرحلة نقاط البيع والتسليم للمشتري)", "96.0%", 18093, "فرز وتوجيه الطلبيات لكبار المشترين ومراكز البيع العشرة"),
    ("STG-C-11", "كبير مدراء مرحلة نقاط البيع والتسليم للمشتري (POS & Buyer Delivery Chief)", "STG-C-12 (مرحلة التسوية والوقف والتدوير العكسي)", "98.0%", 18164, "إتمام البيع عبر sheikha.sa ومحرك المشتري التنفيذي وتسليم البضاعة"),
    ("STG-C-12", "كبير مدراء مرحلة التسوية والزكاة والوقف والتدوير العكسي (Settlement & Circular Chief)", "STG-C-01 (إعادة الخردة للمنجم/المصهر — دورة مغلقة)", "100%", 18140, "تقسيم السيولة (0.5/2.5/10/87%) وتوجيه الوقف الكوني وإعادة تدوير السكراب")
]

# 3) كبار المدراء لكل نوع بالسحابة (8 أنواع سحابية)
CLOUD_TYPE_CHIEFS_8 = [
    ("CLD-C-01", "كبير مدراء السحابة السيادية الوطنية (Sovereign National Cloud me-central1 Chief)", "99.9%", 18150),
    ("CLD-C-02", "كبير مدراء السحابة الخاصة والمعزولة (Private & Bare-Metal Cloud Chief)", "100%", 18125),
    ("CLD-C-03", "كبير مدراء السحابة العامة والتحالفات (Public Cloud Google/AWS/Azure Chief)", "94.0%", 18150),
    ("CLD-C-04", "كبير مدراء السحابة الهجينة (Hybrid Cloud Bridge Chief)", "96.5%", 18125),
    ("CLD-C-05", "كبير مدراء السحابة المتعددة الفدرالية (Multi-Cloud Federated Mesh Chief)", "97.0%", 18161),
    ("CLD-C-06", "كبير مدراء سحابة الحوسبة الطرفية والصناعية (Industrial Edge & PLC/IoT Cloud Chief)", "95.5%", 18126),
    ("CLD-C-07", "كبير مدراء سحابة الذكاء الاصطناعي والتوائم الرقمية (AI GPU & NVIDIA Omniverse Cloud Chief)", "98.0%", 18154),
    ("CLD-C-08", "كبير مدراء سحابة البلوك شين واللوح المحفوظ (SheikhaChain & Immutable Ledger Cloud Chief)", "100%", 18131)
]

# 4) كبار المدراء لكل قطاع بالسوق حسب التصنيف (22 قطاعاً ISIC Rev.4)
SECTOR_CHIEFS_22 = [
    (f"SEC-C-{i:02d}", f"كبير مدراء القطاع {i:02d}: {name}", isic, weight, 18157)
    for i, (isic, name, weight) in enumerate([
        ("ISIC-07.10", "تعدين خامات الحديد (Iron Ores Mining)", "96.0%"),
        ("ISIC-07.29", "تعدين النحاس والمعادن غير الحديدية (Copper & Non-Ferrous Mining)", "98.0%"),
        ("ISIC-24.10", "صناعة الحديد والصلب الأساسي (Basic Iron & Steel Manufacturing)", "97.0%"),
        ("ISIC-24.44", "صهر وتكرير النحاس والمعادن الثمينة (Copper & Precious Metals Smelting)", "99.0%"),
        ("ISIC-38.31", "فرز وإعادة تدوير الخردة والسكراب المعدني (Metal Scrap Recycling)", "95.0%"),
        ("ISIC-25.11", "صناعة المنتجات المعدنية الإنشائية والهيكلية (Structural Metal Products)", "94.5%"),
        ("ISIC-41.00", "تشييد المباني والمنشآت الصناعية (Industrial & Building Construction)", "96.5%"),
        ("ISIC-42.90", "الهندسة المدنية ومشاريع البنية التحتية والإعمار (Civil Engineering & Imar)", "97.0%"),
        ("ISIC-46.62", "تجارة الجملة في المعادن وخامات المعادن (Wholesale of Metals & Metal Ores)", "98.5%"),
        ("ISIC-49.23", "النقل البري للبضائع والأساطيل الذكية (Freight Land Transport)", "96.5%"),
        ("ISIC-50.12", "النقل البحري للبضائع العابرة للمحيطات (Sea & Coastal Freight Water Transport)", "97.8%"),
        ("ISIC-52.10", "التخزين والمستودعات الذكية المبردة والمحكومة (Warehousing & Smart WMS)", "95.0%"),
        ("ISIC-62.01", "برمجة الحاسب والذكاء الاصطناعي والنظم السيادية (Computer Programming & AI)", "99.5%"),
        ("ISIC-63.11", "معالجة البياناتوالاستضافة السحابية (Data Processing & Cloud Hosting)", "98.8%"),
        ("ISIC-64.19", "الوساطة المالية الحلال والتسويات والوقف (Halal Financial & Waqf Settlement)", "100%"),
        ("ISIC-68.10", "الأنشطة العقارية والمدن الصناعية والأوقاف (Real Estate & Industrial Cities)", "97.5%"),
        ("ISIC-70.20", "الاستشارات الإدارية والاقتصادية ودراسات الجدوى (Management & Feasibility Consulting)", "98.0%"),
        ("ISIC-71.10", "الأنشطة المعمارية والهندسية والتوائم الرقمية (Architecture & Digital Twins)", "98.2%"),
        ("ISIC-72.10", "البحث والتطوير في العلوم الطبيعية والهندسية (Scientific R&D & Metallurgy Lab)", "99.0%"),
        ("ISIC-73.10", "التسويق الرقمي وشبكات المسوقين الآلية (Omni-Channel & 100 Marketers Network)", "92.0%"),
        ("ISIC-85.49", "التعليم والتدريب التقني والوقف المعرفي (Technical Training & Knowledge Waqf)", "96.8%"),
        ("ISIC-94.99", "العمل الخيري والزكاة وإعمار الأرض (Zakat, Universal Waqf & Earth Stewardship)", "100%")
    ], 1)
]

# 5) كبار المدراء لكل سوق حسب التصنيف (18 سوقاً عالمياً ومحلياً)
MARKET_CHIEFS_18 = [
    (f"MKT-C-{i:02d}", f"كبير مدراء سوق {name}", code, weight, 18165)
    for i, (code, name, weight) in enumerate([
        ("M-001", "بورصة لندن للمعادن (LME London Metals Market — $9,500/t Cu)", "99.0%"),
        ("M-002", "سوق كومكس نيويورك للمعادن (COMEX New York Futures Market)", "98.0%"),
        ("M-003", "سوق سبائك لندن للذهب والفضة (LBMA Bullion Market — $2,340/oz Au)", "99.0%"),
        ("M-004", "بورصة شنغهاي للعقود الآجلة (SHFE Shanghai Metals Market)", "96.5%"),
        ("M-005", "السوق المالية السعودية (تداول — Saudi Tadawul & Nomu)", "99.5%"),
        ("M-006", "معهد صناعات إعادة التدوير والسكراب العالمي (ISRI Scrap Market)", "96.0%"),
        ("M-007", "سوق التعدين السعودي والمنصة الوطنية (Maaden & Ta'deen Market)", "98.5%"),
        ("M-008", "سوق الاقتصاد الدائري والتدوير السعودي (SIRC Circular Market)", "95.0%"),
        ("M-009", "سوق الخليج والشرق الأوسط للمعادن والإنشاءات (GCC Industrial Market)", "97.0%"),
        ("M-010", "السوق الأوروبية الخضراء الخالية من الكربون (EU CBAM Compliant Market)", "96.0%"),
        ("M-011", "سوق شرق وجنوب آسيا لسلاسل الإمداد الصناعي (ASEAN & East Asia Market)", "95.5%"),
        ("M-012", "سوق التجارة الإلكترونية الفورية لشيخة (sheikha.sa Spot B2B Market)", "99.5%"),
        ("M-013", "سوق عقود الاستصناع والتوريد الآجل الحلال (Halal Istisna'a Forward Market)", "100%"),
        ("M-014", "سوق التوريد الحكومي والمشاريع الكبرى (Saudi Etimad & Mega-Projects Market)", "98.0%"),
        ("M-015", "سوق المنشآت الصغيرة والمتوسطة والمصانع (Monshaat SME Industrial Market)", "96.5%"),
        ("M-016", "سوق الطاقة المتجددة ومعادن البطاريات (EV Battery & Green Metals Market)", "97.5%"),
        ("M-017", "سوق الأوقاف والصكوك الإسلامية والعقارات الصناعية (Waqf & Halal Sukuk Market)", "100%"),
        ("M-018", "سوق التوائم الرقمية والخدمات السحابية وM2M (Digital Twins & S-SaaS Market)", "98.5%")
    ], 1)
]

# 6) كبار المدراء لكل رحلة تجارية (12 رحلة تجارية)
JOURNEY_CHIEFS_12 = [
    (f"TRJ-C-{i:02d}", f"كبير مدراء الرحلة التجارية {i:02d}: {name}", weight, 18155)
    for i, (name, weight) in enumerate([
        ("رحلة الخام من المنجم إلى المصهر (Mine-to-Smelter Journey)", "98.0%"),
        ("رحلة السكراب من الجمع والفرز إلى الصهر والتدوير (Scrap-to-Cathode Journey)", "96.0%"),
        ("رحلة الكاثود والبيليت من المصهر إلى مصانع التشكيل (Smelter-to-Factory Journey)", "99.0%"),
        ("رحلة الفحص المخبري وإصدار شهادة الجودة والترخيص (Lab-to-License Journey)", "99.5%"),
        ("رحلة التخزين الذكي وإدارة المخزون في المستودعات (Factory-to-WMS Journey)", "95.0%"),
        ("رحلة التصدير البحري والدولي عبر الموانئ وبوالص الشحن (Port-to-Global-Buyer Journey)", "97.8%"),
        ("رحلة المشتري التنفيذي وطلب عروض الأسعار الآلي (CEO-Buyer-to-Quotation Journey)", "98.5%"),
        ("رحلة البيع عبر نقاط البيع الـ 10 ومزامنة المتاجر (POS-to-Checkout Journey)", "98.0%"),
        ("رحلة التسويق الآلي عبر الـ 100 مسوق وواتساب وميتا (Campaign-to-Conversion Journey)", "92.0%"),
        ("رحلة الفوترة الإلكترونية ZATCA Phase 2 والدفع الحلال (Invoice-to-Settlement Journey)", "100%"),
        ("رحلة استقطاع وتوزيع الزكاة (2.5%) والوقف الكوني (10%) (Revenue-to-Waqf-Zakat Journey)", "100%"),
        ("رحلة التوأم الرقمي والمحاكاة اللحظية عبر NVIDIA Omniverse (Physical-to-Digital-Twin Journey)", "98.5%")
    ], 1)
]

# 7) دمج الـ 150 كبير مدراء هيكليين في ملف CSV رئيسي موحد
all_structural_150 = []
for code, en, ar, meth, kpi, port in MACRO_CHIEFS_78:
    all_structural_150.append((code, "Supreme Macro Chief (مجلس الكبار العام)", en, ar, meth, kpi, port, "-"))

for code, ar, next_stg, weight, port, desc in SUPPLY_STAGE_CHIEFS_12:
    all_structural_150.append((code, "Supply Chain Stage Chief (كبير مدراء مرحلة إمداد)", code, ar, desc, weight, port, next_stg))

for code, ar, weight, port in CLOUD_TYPE_CHIEFS_8:
    all_structural_150.append((code, "Cloud Type Chief (كبير مدراء نوع سحابة)", code, ar, "Cloud Governance & Isolation", weight, port, "C-78 Master Cloud"))

for code, ar, isic, weight, port in SECTOR_CHIEFS_22:
    all_structural_150.append((code, "Market Sector Chief (كبير مدراء قطاع بالسوق)", isic, ar, f"Sector {isic} Governance", weight, port, "C-72 Master Sectors"))

for code, ar, m_code, weight, port in MARKET_CHIEFS_18:
    all_structural_150.append((code, "Classified Market Chief (كبير مدراء سوق مصنف)", m_code, ar, f"Market {m_code} Live Feed & Rules", weight, port, "C-55 Master Markets"))

for code, ar, weight, port in JOURNEY_CHIEFS_12:
    all_structural_150.append((code, "Trade Journey Chief (كبير مدراء رحلة تجارية)", code, ar, "End-to-End Journey SLA", weight, port, "C-75 Master Journeys"))

for csv_path in ["SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv", "SHEIKHA_V138_150_STRUCTURAL_CHIEFS_MASTER.csv"]:
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Category_Tier", "Title_EN_or_Ref", "Title_AR", "Methodology_or_Description", "Weight_KPI", "Primary_Port", "Next_Stage_or_Parent_Handoff", "Directors_Count", "Staff_Count", "Seed_M2M", "Proliferated_M2M", "License_ID"])
        for idx, (code, tier, en, ar, meth, kpi, port, handoff) in enumerate(all_structural_150, 1):
            w.writerow([code, tier, en, ar, meth, kpi, port, handoff, 6, 24, 16, 240, f"SHK-M2M-2026-{idx:04d}"])

# 8) توليد سجل الـ 5,000 كبير مدراء منتج حسب HS Code (HSP-C-0001 .. HSP-C-5000)
HS_BASE_TEMPLATES = [
    ("7403.11", "Cathode Copper 99.99% LME Grade A (كاثود نحاس نقي)", "99.0%", 18126, "M-001 LME"),
    ("7204.49", "Ferrous Scrap HMS 1&2 (خردة حديد ثقيل)", "95.0%", 18126, "M-006 ISRI"),
    ("2603.00", "Copper Ores & Concentrates (خامات ومركزات النحاس)", "98.0%", 18093, "M-007 Maaden"),
    ("7601.10", "Unwrought Aluminium Ingot 99.7% (سبائك ألمنيوم أولي)", "98.0%", 18126, "M-001 LME"),
    ("7108.12", "Gold Bullion 99.99% LBMA (سبائك ذهب نقي)", "99.99%", 18126, "M-003 LBMA"),
    ("7207.11", "Steel Billet 3SP/5SP (بيليت صلب صناعي)", "97.0%", 18157, "M-001 LME"),
    ("7404.00", "Copper Scrap No.1 Berry/Birch (سكراب نحاس نقي)", "96.5%", 18126, "M-002 COMEX"),
    ("7214.20", "Deformed Steel Rebar SBC (حديد تسليح للبناء والإعمار)", "97.5%", 18094, "M-009 GCC"),
    ("7502.10", "Unwrought Nickel 99.8% EV Grade (نيكل نقي للبطاريات)", "96.0%", 18126, "M-016 EV"),
    ("8542.31", "RISC-V & AI Processor Units (وحدات معالجة وحوسبة)", "99.0%", 18131, "M-018 S-SaaS")
]

with open("SHEIKHA_V138_5000_HSCODE_PRODUCT_CHIEFS.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Product_Chief_ID", "HS_Code_Subheading", "Product_Chief_Title_AR", "Product_Weight_Score", "Foundry_Port", "Primary_Market", "M2M_Nodes_Assigned", "Product_License", "Seal"])
    for i in range(1, 5001):
        base_hs, name, weight, port, mkt = HS_BASE_TEMPLATES[(i - 1) % len(HS_BASE_TEMPLATES)]
        sub_hs = f"{base_hs}.{(i % 99) + 1:02d}"
        w.writerow([
            f"HSP-C-{i:04d}",
            sub_hs,
            f"كبير مدراء المنتج #{i:04d} ({sub_hs}) — {name}",
            weight,
            port,
            mkt,
            2,
            f"SHK-HS-2026-{i:04d}",
            "BOUND_BY_QURAN_SUNNAH"
        ])

manifest_v138 = {
    "schema": "SHEIKHA_V138_OMNI_FEDERATED_CHIEFS_SUPPLY_STAGES_5000HS_CORE",
    "timestamp": datetime.datetime.now().isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "hierarchy_summary": {
        "supreme_macro_chiefs_C01_to_C78": 78,
        "supply_chain_stage_handoff_chiefs": 12,
        "cloud_type_chiefs": 8,
        "sector_isic4_chiefs": 22,
        "classified_market_chiefs": 18,
        "trade_journey_chiefs": 12,
        "total_structural_chiefs": 150,
        "hs_code_product_chiefs": 5000,
        "grand_total_all_chiefs": 5150,
        "department_directors": 900,
        "specialized_staff_and_scholars": 3600,
        "seed_m2m_agents_gen0": 2400,
        "proliferated_m2m_neural_nodes": 46000,
        "synaptic_neural_connections": 736000,
        "structural_licenses": 206,
        "hs_product_licenses": 5000,
        "governed_weights_total": 10000
    },
    "supply_chain_sequential_handoffs_12": [
        {
            "stage_chief": s[0],
            "title_ar": s[1],
            "next_stage_handoff": s[2],
            "stage_weight": s[3],
            "port": s[4],
            "process": s[5]
        }
        for s in SUPPLY_STAGE_CHIEFS_12
    ],
    "cloud_type_chiefs_8": [
        {"code": c[0], "title_ar": c[1], "weight": c[2], "port": c[3]}
        for c in CLOUD_TYPE_CHIEFS_8
    ]
}

raw_bytes = json.dumps(manifest_v138, indent=2, ensure_ascii=False).encode("utf-8")
manifest_v138["manifest_sha256"] = hashlib.sha256(raw_bytes).hexdigest()

for j_path in ["SHEIKHA_V130_UNIFIED_CHIEFS_LICENSES_EXPORT.json", "SHEIKHA_V138_OMNI_FEDERATED_5150_CHIEFS_MANIFEST.json"]:
    Path(j_path).write_text(json.dumps(manifest_v138, indent=2, ensure_ascii=False), encoding="utf-8")

print("✓ تم تفعيل منظومة كبار المدراء الفدرالية والقطاعية والسلعية الشاملة (V138):")
print("  • 78 كبير مدراء عامين في المجلس السيادي الأعلى (C-01..C-78)")
print("  • 12 كبير مدراء لمراحل سلاسل الإمداد والتوريد المتتابعة (منجم -> مصهر -> مصنع -> مختبر -> مستودع -> نقل -> ميناء -> شحن -> جمارك -> توزيع -> بيع -> تسوية/وقف)")
print("  • 8 كبار مدراء لأنواع السحابة + 22 كبير مدراء للقطاعات + 18 كبير مدراء للأسواق + 12 كبير مدراء للرحلات التجارية = 150 كبير مدراء هيكلي")
print("  • 5,000 كبير مدراء منتج حسب رمز HS Code (HSP-C-0001..5000) = 5,150 كبير مدراء إجمالاً")
print("  • 900 مدير إدارة + 3,600 موظف وعالم ومهندس + 46,000 عقدة عصبية M2M + 736,000 رابط مشبكي")
print(f"  • SHA-256: {manifest_v138['manifest_sha256']}")
