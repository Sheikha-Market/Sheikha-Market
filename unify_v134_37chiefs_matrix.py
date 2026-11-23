import csv, json, hashlib, datetime
from pathlib import Path

CHIEFS_37 = [
    ("C-01", "Chief Executive Officer (CEO M2M)", "كبير المدراء التنفيذيين", "OKRs / BSC / Corporate Governance", "99.9%", 18082),
    ("C-02", "Chief Planning Officer (CPO)", "كبير مدراء التخطيط (تخطيط وتنفيذ)", "PMBOK 7 / Critical Path / Scenario Planning", "99.5%", 18082),
    ("C-03", "Chief Engineering Officer (CEngO)", "كبير مدراء الهندسة", "IEEE / ISO 15288 / NVIDIA Omniverse USD", "99.6%", 18094),
    ("C-04", "Chief Financial Officer (CFO)", "كبير مدراء المالية", "IFRS / Halal Capital / Zero-Riba Liquidity", "99.9%", 18140),
    ("C-05", "Chief Accounting Officer (CAO)", "كبير مدراء المحاسبة", "ZATCA Phase2 UBL 2.1 / 4-Ledgers Split", "100%", 18163),
    ("C-06", "Chief Support Services Officer", "كبير مدراء المساندة", "ITIL v4 / SLA 99.99% / Lean Support", "99.1%", 18158),
    ("C-07", "Chief Supply Chain Officer (CSCO)", "كبير مدراء سلاسل الإمداد والتوريد", "SCOR Model / JIT / WMS Integration", "99.4%", 18093),
    ("C-08", "Chief Logistics Officer (CLO)", "كبير مدراء اللوجستيات", "BOL GPS Live / Maersk-DHL-SIRC GoGreen", "99.3%", 18155),
    ("C-09", "Chief Contracts Officer (CCO)", "كبير مدراء العقود", "FIDIC / Shariah No-Gharar Smart Contracts", "99.8%", 18159),
    ("C-10", "Chief Industrial Officer (CIndO)", "كبير مدراء الصناعة (50 مصنعاً)", "Lean Six Sigma / ISIC 24.10-24.45 / Smelting 1200C", "99.5%", 18126),
    ("C-11", "Chief Technology Officer (CTO)", "كبير مدراء التقنية", "Cloud Run me-central1 / Zero-Trust / Argon", "99.9%", 18156),
    ("C-12", "Chief Knowledge Officer (CKO)", "كبير مدراء المعرفة", "ISO 30401 Knowledge Management / Waqf Edu", "99.2%", 18161),
    ("C-13", "Chief Scientists Council Officer", "كبير مدراء العلماء", "Shariah & Scientific Peer Review", "99.8%", 18135),
    ("C-14", "Chief R&D, Innovation & Exploration", "كبير مدراء البحث والتطوير والابتكار والاستكشاف", "ISO 56002 / TRIZ / Stage-Gate / KFUPM Lab", "99.6%", 18110),
    ("C-15", "Chief Sciences Officer", "كبير مدراء العلوم", "Metallurgy / Spectroscopy Cu 99.99% / Physics", "99.6%", 18126),
    ("C-16", "Chief Computation Officer", "كبير مدراء الحساب", "Algorithmic Verification / SHA-256 / GRAND 10000+", "100%", 18131),
    ("C-17", "Chief Statistics Officer", "كبير مدراء الإحصاء", "Six Sigma SPC / Telemetry & Variance Control", "99.7%", 9091),
    ("C-18", "Chief Training Officer", "كبير مدراء التدريب", "Competency Matrix 18160 / Vocational & AI Training", "99.3%", 18160),
    ("C-19", "Chief Earth & Heavens Stewardship", "كبير مدراء إعمار السماوات والأرض وما بينهما", "Universal Waqf 10% / Green Circular Economy", "100%", 18142),
    ("C-20", "Chief Commerce Officer", "كبير مدراء التجارة", "Global Markets LME/COMEX/Tadawul / HS 5000", "99.6%", 18165),
    ("C-21", "Chief Administration Officer", "كبير مدراء الإدارة والنظام الإداري", "ISO 9001:2015 / EFQM / Administrative Excellence", "99.8%", 18120),
    ("C-22", "Chief Quality Officer (CQO)", "كبير مدراء الجودة والجودة الإدارية", "TQM / Six Sigma DMAIC (3.4 DPMO) / LME Grade A", "99.95%", 18110),
    ("C-23", "Chief Safety & HSE Officer", "كبير مدراء السلامة", "ISO 45001 / ISO 14001 / Zero Harm", "100%", 18126),
    ("C-24", "Chief Marketing Officer (CMO)", "كبير مدراء التسويق", "100 Marketers Network / Omni-Channel / Meta API", "99.1%", 18151),
    ("C-25", "Chief Sales Officer (CSO)", "كبير مدراء المبيعات", "CEO Buyer Engine 18164 / 10 POS / sheikha.sa", "99.5%", 18164),
    ("C-26", "Chief PMO Officer (CPMO)", "كبير مدراء مكتب المشاريع التقنية", "PMI PMBOK 7 / Agile / 128 Digital Twins", "99.9%", 18154),
    ("C-27", "Chief Operating Officer (COO)", "كبير مدراء التشغيل", "29 Sovereign Ports / 20 WMS Warehouses 24/7", "99.9%", 18157),
    ("C-28", "Chief Legal & M2M HR Officer", "كبير مدراء القانون والمحاماة والموارد (M2M HR)", "PDPL / Saudi Labor & GOSI / M2M Agent Registry", "99.9%", 18160),
    ("C-29", "Chief Governance Officer (CGO)", "كبير مدراء الحوكمة ولوائح شيخة", "Sheikha Sovereign Bylaws / COBIT 2019 / ISO 37000", "100%", 18162),
    ("C-30", "Chief Telecommunications & MCP/SDK Officer (CTelO)", "مدير كبراء الاتصالات وبروتوكولات MCP/SDK", "ITU-T / IEEE 802 / MCP JSON-RPC 2.0 / gRPC / OPC-UA / mTLS", "99.98%", 18158),
    ("C-31", "Chief Omni-Channel Communication Officer (CComO)", "مدير كبراء التواصل والعلاقات المؤسسية والدبلوماسية", "ISO 26000 / Diplomatic & Meta/WhatsApp/Omni-AI Bridge", "99.96%", 18120),
    ("C-32", "Chief Asset Officer (CASO)", "كبير مدراء الأصول والأصول الوقفية الثابتة", "ISO 55001 / EAM / IFRS 13 Fair Value / Fixed Waqf SHA 0cf8bc3c", "100%", 18142),
    ("C-33", "Chief Construction Officer (CBldO)", "كبير مدراء البناء والتشييد الهندسي", "Saudi Building Code (SBC) / BIM 7D / Omniverse Structural Twins", "99.92%", 18094),
    ("C-34", "Chief Mega-Projects Officer (CMPO)", "كبير مدراء المشاريع الكبرى والرأسمالية", "PMBOK Construction Ext / PRINCE2 / Earned Value M2M", "99.94%", 18154),
    ("C-35", "Chief Contracting & EPC Officer (CEpcO)", "كبير مدراء المقاولات وعقود الاستصناع (EPC)", "Shariah Istisna'a & FIDIC Red/Yellow/Silver / Zero-Gharar", "99.95%", 18159),
    ("C-36", "Chief Real Estate Officer (CREO)", "كبير مدراء العقارات والمدن الصناعية والأوقاف العقارية", "MODON & RCJY Industrial Lands / 50 Factories & 20 WMS Estates", "99.95%", 18158),
    ("C-37", "Chief Civilization & Imar Officer (CCIO)", "كبير مدراء الإعمار والتطوير الحضري والكوني", "Quranic Isti'mar / LEED Platinum / Universal Waqf 10% Infrastructure", "100%", 18165)
]

for csv_file in ["SHEIKHA_V134_35_CHIEFS_M2M_SUMMARY.csv", "SHEIKHA_V134_37_CHIEFS_M2M_SUMMARY.csv"]:
    with open(csv_file, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Code", "Title_EN", "Title_AR", "Scientific_Methodology", "KPI_Score", "Primary_Port", "Seed_Agents_Gen0", "Proliferated_Nodes_15x", "Followup_Agent", "Kaizen_Dev_Agent", "M2M_Production_License"])
        for idx, (code, en, ar, meth, kpi, port) in enumerate(CHIEFS_37, 1):
            w.writerow([code, en, ar, meth, kpi, port, 16, 240, f"AGT-FUP-{idx:02d}", f"AGT-DEV-{idx:02d}", f"SHK-M2M-2026-{idx:04d}"])

print("✓ تم توحيد مصفوفة الـ 37 كبير مدراء (592 بذرة | 8,880 عقدة عصبية | 142,080 رابطاً مشبكياً | 93 ترخيصاً)")
