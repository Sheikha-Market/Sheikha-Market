import json, hashlib, csv, datetime
from pathlib import Path

REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

# 37 مديرية — الدمج النهائي المعتمد
CHIEFS_37=[
("C-01","Chief Executive Officer (CEO M2M)","كبير المدراء التنفيذيين","OKRs BSC Corporate Governance","99.9%",18082,"SHK-M2M-2026-0001"),
("C-02","Chief Planning Officer (CPO)","كبير مدراء التخطيط","PMBOK7 Critical Path Scenario","99.5%",18082,"SHK-M2M-2026-0002"),
("C-03","Chief Engineering Officer (CEngO)","كبير مدراء الهندسة","IEEE ISO15288 【entity-NVIDIA Omniverse¦canonical_name=NVIDIA Omniverse】 USD","99.6%",18094,"SHK-M2M-2026-0003"),
("C-04","Chief Financial Officer (CFO)","كبير مدراء المالية","IFRS Halal Zero-Riba Liquidity","99.9%",18140,"SHK-M2M-2026-0004"),
("C-05","Chief Accounting Officer (CAO)","كبير مدراء المحاسبة","ZATCA Phase2 UBL2.1 4-Ledgers","100%",18163,"SHK-M2M-2026-0005"),
("C-06","Chief Support Services Officer","كبير مدراء المساندة","ITILv4 SLA99.99 Lean","99.1%",18158,"SHK-M2M-2026-0006"),
("C-07","Chief Supply Chain Officer (CSCO)","كبير مدراء سلاسل الإمداد","SCOR JIT WMS","99.4%",18093,"SHK-M2M-2026-0007"),
("C-08","Chief Logistics Officer (CLO)","كبير مدراء اللوجستيات","BOL GPS 【entity-Maersk¦canonical_name=Maersk】 【entity-DHL¦canonical_name=DHL】 SIRC GoGreen","99.3%",18155,"SHK-M2M-2026-0008"),
("C-09","Chief Contracts Officer (CCO)","كبير مدراء العقود","FIDIC Shariah No-Gharar Smart","99.8%",18159,"SHK-M2M-2026-0009"),
("C-10","Chief Partnerships Officer","كبير مدراء الشراكات","Monshaat 【entity-Aramco¦canonical_name=Aramco】 SABIC Priority rev40 fit25","99.5%",18152,"SHK-M2M-2026-0010"),
("C-11","Chief Licensing Officer","كبير مدراء التراخيص","56 Foundry Licenses SHA fb021dae","99.7%",18159,"SHK-M2M-2026-0011"),
("C-12","Chief Competency Officer","كبير مدراء الكفاءات","17 Agents 28 Bots Manuals 13c5682a","99.6%",18160,"SHK-M2M-2026-0012"),
("C-13","Chief Cloud & AI Exchange Officer","كبير مدراء السحابة والذكاء","Google Alliance ABSOLUTE 12 Domains","99.9%",18125,"SHK-M2M-2026-0013"),
("C-14","Chief Marketing & CEO Buyer Officer","كبير مدراء التسويق والمشترين","MT-001 Cathode 99% LME M-007 $9500","99.5%",18164,"SHK-M2M-2026-0014"),
("C-15","Chief Commerce & Charity Officer","كبير مدراء التجارة والوقف","0.5%+2.5%+10%+87% VAT15% ZATCA","99.9%",18163,"SHK-M2M-2026-0015"),
("C-16","Chief Argon Sovereign Engine Officer","كبير مدراء محرك أرجون السيادي","4 Argon 3.8 Thinking 3.6 Flash","99.8%",18156,"SHK-M2M-2026-0016"),
("C-17","Chief Hosting & Infrastructure Officer","كبير مدراء الاستضافة","Hostinger CST 89 SDAIA 89","99.4%",18158,"SHK-M2M-2026-0017"),
("C-18","Chief Universe & Digital Twin Officer","كبير مدراء الكون والتوائم","GRAND10000 128 Twins Omniverse USD","99.9%",18161,"SHK-M2M-2026-0018"),
("C-19","Chief Earth & Civilization Development Officer (CECO)","كبير مدراء الإعمار وإعمار السماوات والأرض","Quranic Isti'mar Universal Waqf 10% Sustainable","100%",18142,"SHK-M2M-2026-0019"),
("C-20","Chief Mining & Metals Officer","كبير مدراء التعدين والمعادن","Maaden LME Grade A 20x80 20x90","99.4%",18126,"SHK-M2M-2026-0020"),
("C-21","Chief Scrap & Circular Officer","كبير مدراء الخردة والاقتصاد الدائري","15x75 Green Circular","99.3%",18126,"SHK-M2M-2026-0021"),
("C-22","Chief Supply & Inventory Officer","كبير مدراء التوريد والمخزون","18x78 WMS 20 Warehouses","99.5%",18093,"SHK-M2M-2026-0022"),
("C-23","Chief Quality & Laboratory Officer","كبير مدراء الجودة والمختبر","LME Grade A Lab Machine→Packaging","99.8%",18126,"SHK-M2M-2026-0023"),
("C-24","Chief Green & Sustainability Officer","كبير مدراء الاستدامة","GoGreen SIRC Carbon","99.6%",18155,"SHK-M2M-2026-0024"),
("C-25","Chief Digital Industry Studio Officer","كبير مدراء الاستوديو الصناعي الرقمي","8 Platforms Factory","99.7%",18157,"SHK-M2M-2026-0025"),
("C-26","Chief Projects & Mega-PMO Officer (CPMO)","كبير مدراء المشاريع الكبرى","PMBOK7 PRINCE2 128 Twins EVM","99.9%",18154,"SHK-M2M-2026-0026"),
("C-27","Chief Operating Officer (COO)","كبير مدراء التشغيل","29 Ports 20 WMS 24/7","99.9%",18157,"SHK-M2M-2026-0027"),
("C-28","Chief Legal & M2M HR Officer","كبير مدراء القانون والموارد","PDPL Labor GOSI M2M Registry","99.9%",18160,"SHK-M2M-2026-0028"),
("C-29","Chief Governance Officer (CGO)","كبير مدراء الحوكمة ولوائح شيخة","Bylaws COBIT2019 ISO37000","100%",18162,"SHK-M2M-2026-0029"),
("C-30","Chief Telecommunications & MCP/SDK Officer (CTelO)","مدير كبراء الاتصالات وبروتوكولات MCP/SDK","ITU-T IEEE802 MCP JSON-RPC2.0 gRPC OPC-UA mTLS","99.98%",18158,"SHK-M2M-2026-0030"),
("C-31","Chief Omni-Channel Communication Officer (CComO)","مدير كبراء التواصل والعلاقات المؤسسية","ISO26000 Diplomatic Meta WhatsApp Omni-AI","99.96%",18120,"SHK-M2M-2026-0031"),
# الستة الجديدة — النواة
("C-32","Chief Assets Management Officer (CASO)","كبير مدراء الأصول والأصول الوقفية الثابتة","ISO55001 Fixed Waqf SHA0cf8bc3c Halal Valuation 0.5% Transparency","100%",18142,"SHK-M2M-2026-0032"),
("C-33","Chief Construction & Structural Officer (CBldO)","كبير مدراء البناء والتشييد الهندسي","SBC BIM7D Omniverse Structural Rebar Cu Furnace1200C","99.92%",18094,"SHK-M2M-2026-0033"),
("C-34","Chief Contracting & EPC Officer (CEpcO)","كبير مدراء المقاولات وعقود الاستصناع EPC","Shariah Istisna'a FIDIC EPC Zero-Gharar Subcontractor M2M","99.94%",18159,"SHK-M2M-2026-0034"),
("C-35","Chief Real Estate & Industrial Properties Officer (CREO)","كبير مدراء العقارات والمدن الصناعية والأوقاف العقارية","MODON RCJY 50 Factories 20 WMS Waqf REITs REGA Taqeem MLS Wafi","99.95%",18158,"SHK-M2M-2026-0035"),
("C-36","Chief Asset Valuation & Waqf Officer","كبير مدراء تقييم الأصول والوقف","IFRS13 Fair Value Taqeem Waqf Universal Asset Fixed لا يباع","99.95%",18162,"SHK-M2M-2026-0036"),
("C-37","Chief Urban Development & Smart Cities Officer (CUDO)","كبير مدراء الإعمار والمدن الذكية","MOMAH Balady Saudi Code SmartCity ISO37122 GIS CIM 10% Waqf","99.94%",18140,"SHK-M2M-2026-0037"),
]

with open("SHEIKHA_V135_37_CHIEFS_M2M_FINAL.csv","w",newline="",encoding="utf-8") as f:
 w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Methodology","KPI","Port","Seed","Nodes","FUP","DEV","License"])
 for c in CHIEFS_37: w.writerow([c[0],c[1],c[2],c[3],c[4],c[5],16,240,f"AGT-FUP-{c[0].split('-')[1]}",f"AGT-DEV-{c[0].split('-')[1]}",c[6]])

unified={
 "schema":"SHEIKHA_V135_37_CHIEFS_NAWAA_GOVERNANCE_SOVEREIGN_FINAL",
 "timestamp":datetime.datetime.now().isoformat(),
 "seal":SEAL,"registry":REG,"governance":GOV,
 "owner":"سلمان أحمد بن سلمان الراجحي","cr":"2051263653","unified":"7049031003","vat":"310000000000003",
 "nawaa":{"core":18082,"governance_watch":18162,"status":"ZERO ROBOT ACTIVE — النواة والحوكمة BOUND_BY_QURAN_SUNNAH","weights":10000,"production_hold":"ACTIVE"},
 "totals":{"【entity-chiefs¦canonical_name=CHIEFS】":37,"seeds_gen0":592,"nodes_m2m":8880,"synaptic":142080,"licenses":93,"foundry":56,"weights":10000,"twins":128,"isic":22,"markets":18,"networks":24,"hs":5000,"factories":50,"warehouses":20,"logistics":24,"domains":12,"agents":17,"bots":28},
 "best":{"weight":"MT-001 Cathode Cu 99.99% LME Grade A 99% SHA 374c6686","market":"M-007 LME $9500/ton"},
 "commerce":{"example_100k":{"transparency_500":500,"zakat_2500":2500,"waqf_10000":10000,"net_87000":87000,"vat_15000":15000,"total_115k":115000},"waqf":"أصل ثابت لا يباع","zatca":"Phase2 UBL2.1 QR TLV UUID f18f8146"},
 "six_new":{"C-32":"الأصول ISO55001 وقف ثابت","C-33":"البناء SBC BIM7D Omniverse 1200C","C-34":"المقاولات Etimad FIDIC EPC استصناع لا غرر","C-35":"العقارات MODON RCJY 50 مصنع 20 WMS REGA Wafi","C-36":"تقييم الأصول IFRS13 Taqeem وقف كوني","C-37":"الإعمار Balady Saudi Code مدينة ذكية ISO37122 GIS CIM"}
}
sha=hashlib.sha256(json.dumps(unified,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
unified["sha256"]=sha
Path("SHEIKHA_V135_37CHIEFS_NAWAA_GOVERNANCE_FINAL.json").write_text(json.dumps(unified,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"✓ V135 UNIFIED 37 — SHA {sha[:16]} — 37 | 592 | 8880 | 142080 | 93 Licenses")
