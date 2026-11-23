import json, hashlib, datetime, csv
from pathlib import Path

REGISTRY_SHA="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV_ID="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"
OWNER="سلمان أحمد بن سلمان الراجحي"

NEW_CHIEFS=[
 ("C-32","Chief Asset Officer (CAO)","كبير مدراء الأصول","ISO 55000 / EAM / Asset Lifecycle Management / IFRS 13 Fair Value / 0.5% Transparency","99.95%",18162,18126,16,240,"AGT-FUP-32","AGT-DEV-32","SHK-M2M-2026-0032","أصول ثابتة ومنقولة + تقييم تقييم + وقف لا يباع"),
 ("C-33","Chief Construction Officer (CCO)","كبير مدراء البناء","PMBOK Construction Ext / FIDIC Red & Yellow / Saudi Building Code SBC / OSHA / LEED / 【entity-NVIDIA Omniverse¦canonical_name=NVIDIA Omniverse】 Construction Digital Twin","99.92%",18094,18154,16,240,"AGT-FUP-33","AGT-DEV-33","SHK-M2M-2026-0033","خرسانة جاهزة 1200C + حديد تسليح + MEP + 【entity-BIM¦canonical_name=BIM】 USD"),
 ("C-34","Chief Projects Officer (CPMO)","كبير مدراء المشاريع","PMO / PfMO / PMBOK7 / Critical Chain / EVM / Monte Carlo / Microsoft Project Online / Primavera P6","99.90%",18110,18153,16,240,"AGT-FUP-34","AGT-DEV-34","SHK-M2M-2026-0034","محفظة مشاريع 22 قطاع ISIC4 + 12 دورة حياة + 128 توأم رقمي"),
 ("C-35","Chief Contracting & Tendering Officer (CCTO)","كبير مدراء المقاولات والمناقصات","Saudi Contractors Authority / Etimad / FIDIC / JV / Performance Bond 10% / Advance Payment Guarantee / Halal No-Gharar","99.88%",18159,18120,16,240,"AGT-FUP-35","AGT-DEV-35","SHK-M2M-2026-0035","مناقصات 5000 HS Code + تأهيل مقاولين + تصنيف"),
 ("C-36","Chief Real Estate Officer (CREO)","كبير مدراء العقارات والتطوير العقاري","【entity-REGA¦canonical_name=REGA】 / Taqeem / MLS / Escrow Wafi / Ijara / Sakani / White Land Tax / 2.5% Zakat Real Estate","99.93%",18161,18155,16,240,"AGT-FUP-36","AGT-DEV-36","SHK-M2M-2026-0036","مخزون عقاري 20 مستودع + 50 مصنع + 24 شبكة لوجستية"),
 ("C-37","Chief Urban Development Officer (CUDO)","كبير مدراء الإعمار والمدن الذكية","MOMAH Balady / Saudi Code / Smart City ISO 37122 / GIS / CIM / 10% Waqf Urban / Green Building","99.94%",18140,18125,16,240,"AGT-FUP-37","AGT-DEV-37","SHK-M2M-2026-0037","إعمار مدن 12 نطاق sheikha.sa .city .gov + 87% حلال"),
]

# قراءة 31 السابق
prev_csv=Path("SHEIKHA_V133_31_CHIEFS_M2M_SUMMARY.csv")
if not prev_csv.exists():
  prev_csv=Path("SHEIKHA_V130_29_CHIEFS_M2M_SUMMARY.csv")

total_chiefs=37
seed_total=total_chiefs*16 # 592
nodes_total=seed_total*15 # 8880
synaptic=nodes_total*16 # 142080
licenses_total=93 # 87+6

# كتابة CSV الجديد 37
with open("SHEIKHA_V134_37_CHIEFS_M2M_SUMMARY.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f)
  w.writerow(["Code","Title_EN","Title_AR","Scientific_Methodology","KPI_Score","Primary_Port","Secondary_Port","Seed_Agents_Gen0","Proliferated_Nodes_15x","Followup_Agent","Kaizen_Dev_Agent","M2M_Production_License","Core_Domain"])
  # نسخ السابق إن وجد
  if prev_csv.exists():
    try:
      import csv as _csv
      with open(prev_csv,encoding="utf-8") as pf:
        r=list(_csv.DictReader(pf))
        for row in r:
          w.writerow([row.get("Code"),row.get("Title_EN"),row.get("Title_AR"),row.get("Scientific_Methodology"),row.get("KPI_Score"),row.get("Primary_Port"),"",row.get("Seed_Agents_Gen0"),row.get("Proliferated_Nodes_15x"),row.get("Followup_Agent"),row.get("Kaizen_Dev_Agent"),row.get("M2M_Production_License"),""])
    except: pass
  for c in NEW_CHIEFS:
    w.writerow([c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8],c[9],c[10],c[11],c[12]])

# تراخيص 93
with open("SHEIKHA_V134_93_LICENSES_SUMMARY.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f)
  w.writerow(["License_No","Title_EN","Title_AR","Chief_Code","Port","Weight_Category","KPI","SHA256_Prefix","Status","Foundry_Line"])
  # 87 السابقة
  prev_lic=Path("SHEIKHA_V133_87_LICENSES_SUMMARY.csv")
  if prev_lic.exists():
    with open(prev_lic,encoding="utf-8") as pf:
      import csv as _csv
      for row in _csv.DictReader(pf):
        w.writerow([row.get("License_No"),row.get("Title_EN"),row.get("Title_AR"),row.get("Chief_Code"),row.get("Port"),row.get("Weight_Category"),row.get("KPI"),row.get("SHA256_Prefix"),row.get("Status"),row.get("Foundry_Line")])
  # إضافة 6 الجديدة
  for c in NEW_CHIEFS:
    lic_sha=hashlib.sha256((c[11]+c[1]).encode()).hexdigest()[:8]
    w.writerow([c[11],c[1]+" Foundry License",c[2]+" ترخيص مسبك",c[0],c[5],"Construction-RealEstate Assets 80%",c[4],lic_sha,"ACTIVE","FL-06 Construction & Real Estate"])

# JSON موحد
unified={
 "schema":"SHEIKHA_V134_37_CHIEFS_ASSETS_CONSTRUCTION_REALESTATE",
 "timestamp":datetime.datetime.now().isoformat(),
 "seal":SEAL,
 "owner":OWNER,"cr":"2051263653","unified":"7049031003","vat":"310000000000003","zatca_uuid":"f18f8146-3bb7-8535-sheikha",
 "registry_sha256":REGISTRY_SHA,"governance_id":GOV_ID,
 "nawaa":{"core_port":18082,"status":"ACTIVE","weights":10000,"governance_watch":18162,"foundry_lab":18126,"message":"النواة ZERO ROBOT ACTIVE BOUND_BY_QURAN_SUNNAH"},
 "chiefs_total":total_chiefs,"seed_gen0":seed_total,"proliferated_nodes":nodes_total,"synaptic_connections":synaptic,"licenses":licenses_total,
 "new_chiefs":[{"code":c[0],"en":c[1],"ar":c[2],"method":c[3],"kpi":c[4],"port":c[5],"license":c[11],"domain":c[12]} for c in NEW_CHIEFS],
 "construction_real_estate_model":{"asset_iso55000":True,"sbc_code":True,"rega_taqeem":True,"momoah_balady":True,"fidic":True,"etimad":True,"wafi_escrow":True,"bim_usd_omniverse":True,"lme_cathode_best":"MT-001 99% SHA 374c6686","digital_twins":128,"factories":50,"warehouses":20,"logistics_networks":24,"hs_code":5000,"isic_sectors":22},
 "commerce_model":{"transparency_0_5":500,"zakat_2_5":2500,"waqf_10":10000,"net_87":87000,"vat_15":15000,"example_100k_total":115000,"waqf_ledger":"أصل ثابت لا يباع"}
}
Path("SHEIKHA_V134_37CHIEFS_ASSETS_CONSTRUCTION.json").write_text(json.dumps(unified,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"✓ تم تفعيل {len(NEW_CHIEFS)} كبار مدراء الأصول/البناء/المشاريع/المقاولات/العقارات/الإعمار")
print(f"✓ إجمالي: {total_chiefs} | بذور: {seed_total} | عقد متكاثرة: {nodes_total} | روابط: {synaptic} | تراخيص: {licenses_total}")
print(f"SHA: {hashlib.sha256(json.dumps(unified,ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]}")
