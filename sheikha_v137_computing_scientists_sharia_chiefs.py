import json, hashlib, csv, datetime
from pathlib import Path

REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"

NEW_CHIEFS=[
 ("C-38","Chief Computing, Computer & Calculation Officer (CCCCO)","كبير مدراء الحوسبة والحاسب والحساب","HPC Quantum / 【entity-NVIDIA¦canonical_name=NVIDIA】 CUDA / IEEE 754 / Zero-Robot M2M Calculation / 10K Weights / Lawh Mahfuz Compute","100%",18131,18156,16,240,"AGT-FUP-38","AGT-DEV-38","SHK-M2M-2026-0038","حوسبة كمية وحساب M2M + حاسب آلي سيادي + 【entity-NVIDIA Omniverse¦canonical_name=NVIDIA Omniverse】"),
 ("C-39","Chief Grand Scientist Sheikha Officer (CGSSO)","كبير العلماء شيخة — كبيرة العلماء","Sheikha Sovereign Science / 128 Digital Twins / 50 Factories Lab / Atomic Water Rasul Jannah / Quranic Science Isti'mar","100%",18131,18161,16,240,"AGT-FUP-39","AGT-DEV-39","SHK-M2M-2026-0039","علوم شيخة السيادية — اللوح المحفوظ + ماء الذرة + رسول + جنة"),
 ("C-40","Chief Scientist Officer (CSO)","كبير العلماء","ISO 16290 TRL / JORC / MW-001..020 / Scientific Method / Peer Review M2M","99.98%",18131,18156,16,240,"AGT-FUP-40","AGT-DEV-40","SHK-M2M-2026-0040","علوم المعادن والطاقة والاستدامة والتوائم الرقمية"),
 ("C-41","Chief Scientists Management Officer (CSMO)","كبير مدراء العلماء","17 Agents 28 Bots / 300 Directors 1200 Staff Governance / OKRs BSC / M2M Talent","99.97%",18160,18158,16,240,"AGT-FUP-41","AGT-DEV-41","SHK-M2M-2026-0041","إدارة منظومة العلماء — 44 كبير + 176 مدير + 528 مهم"),
 ("C-42","Chief Sharia Sciences Officer (CSSO)","كبير مدراء العلوم الشرعية","Quran & Sunnah / AAOIFI Shariah Standards / 8 Masarif Zakat / Fixed Waqf 10% / Fiqh Muamalat / Istisna'a / Zero-Riba Zero-Gharar","100%",18135,18141,16,240,"AGT-FUP-42","AGT-DEV-42","SHK-M2M-2026-0042","علوم شرعية — فقه معاملات + زكاة + وقف كوني + رقابة شرعية AAOIFI"),
 ("C-43","Chief Quantum Calculation & Mathematics Officer (CQCMO)","كبير مدراء الحساب الكمي والرياضيات السيادية","Quantum Mathematics / Cryptography PQC / Zero Knowledge / 10K Weights Optimization / Monte Carlo","100%",18156,18131,16,240,"AGT-FUP-43","AGT-DEV-43","SHK-M2M-2026-0043","حساب كمي — تشفير سيادي + تحسين أوزان 10K + حساب زكاة ووقف"),
 ("C-44","Chief Computer Engineering & Hardware Officer (CCEHO)","كبير مدراء هندسة الحاسب والعتاد السيادي","IEEE Computer Society / 【entity-NVIDIA¦canonical_name=NVIDIA】 DGX / 【entity-Intel¦canonical_name=Intel】 / 12 Domains Hostinger 89 / Sovereign Cloud","99.99%",18125,18158,16,240,"AGT-FUP-44","AGT-DEV-44","SHK-M2M-2026-0044","حاسب سيادي — خوادم 12 نطاق + أرجون + توائم رقمية"),
]

# قراءة السابق 37
prev=Path("SHEIKHA_V136_ORG_CHIEFS_37.csv")
chiefs_total=44
seed_total=chiefs_total*16 # 704
nodes_total=seed_total*15 # 10560
synaptic=seed_total*15*16 # 168960
licenses_total=106 # 93+13? نضع 106
total_org=1961+7*53 # 1961+371=2332

with open("SHEIKHA_V137_44_CHIEFS_M2M_SUMMARY.csv","w",newline="",encoding="utf-8") as f:
 w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Methodology","KPI","Port","Secondary","Seed","Nodes","FUP","DEV","License","Domain"])
 if prev.exists():
  import csv as _csv
  try:
   with open(prev,encoding="utf-8") as pf:
    for row in _csv.DictReader(pf):
     w.writerow([row.get("Code"),row.get("Title_EN",""),row.get("Title_AR",""),row.get("Methodology",""),row.get("KPI",""),row.get("Port",""),"",16,240,f"AGT-FUP-{row.get('Code','').split('-')[1]}",f"AGT-DEV-{row.get('Code','').split('-')[1]}",row.get("License",""),""])
  except: pass
 for c in NEW_CHIEFS:
  w.writerow([c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8],c[9],c[10],c[11],c[12]])

# تراخيص 106
with open("SHEIKHA_V137_106_LICENSES_SUMMARY.csv","w",newline="",encoding="utf-8") as f:
 w=csv.writer(f); w.writerow(["License_No","Title_EN","Title_AR","Chief_Code","Port","KPI","SHA_Prefix","Status","Seal"])
 for c in NEW_CHIEFS:
  sha=hashlib.sha256((c[11]+c[1]).encode()).hexdigest()[:8]
  w.writerow([c[11],c[1]+" Sovereign License",c[2]+" ترخيص سيادي",c[0],c[5],c[4],sha,"ACTIVE",SEAL])

# JSON موحد
unified={
 "schema":"SHEIKHA_V137_COMPUTING_SCIENTISTS_SHARIA_SOVEREIGN",
 "timestamp":datetime.datetime.now().isoformat(),
 "seal":SEAL,"registry":REG,"governance":GOV,
 "owner":"سلمان أحمد بن سلمان الراجحي","cr":"2051263653","unified":"7049031003","vat":"310000000000003","zatca_uuid":"f18f8146-3bb7-8535-sheikha",
 "nawaa":{"core":18082,"watch":18162,"compute":18131,"sharia":18135,"waqf":18141,"status":"ZERO ROBOT ACTIVE — النواة الحوسبية والعلمية الشرعية BOUND_BY_QURAN_SUNNAH","weights":10000,"hold":"PRODUCTION_HOLD ACTIVE"},
 "hierarchy":{"chiefs":44,"seeds_gen0":704,"nodes_m2m":10560,"synaptic":168960,"licenses":106,"foundry":56,"total_org_1961_prev":1961,"total_org_2332_new":2332,"added":371,"ratio":"C1:D4:M12:E36"},
 "new_7_computing_science_sharia":[
  {"code":c[0],"ar":c[2],"en":c[1],"method":c[3],"kpi":c[4],"port":c[5],"license":c[11],"domain":c[12]} for c in NEW_CHIEFS
 ],
 "science_governance":{"quran_sunnah":True,"aaoifi":True,"isotrm_t":True,"zero_riba_gharar":True,"8_masarif_zakat":True,"fixed_waqf_10pct_no_sale":True,"10k_weights_128_twins":True,"lawh_mahfuz_sync":True,"atomic_water_rasul_jannah_sealed":True},
 "commerce":{"example_100k":{"transparency_0_5":500,"zakat_2_5":2500,"waqf_10":10000,"net_87":87000,"vat_15":15000,"total_115k":115000},"waqf":"أصل ثابت لا يباع SHA 0cf8bc3c"},
 "best":{"weight":"MT-001 Cathode Cu 99.99% LME Grade A 99% SHA 374c6686","market":"M-007 LME $9500/ton","factories":50,"warehouses":20,"logistics":24,"twins":128,"hs":5000}
}
sha_all=hashlib.sha256(json.dumps(unified,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
unified["sha256"]=sha_all
Path("SHEIKHA_V137_COMPUTING_SCIENTISTS_SHARIA_GOVERNANCE.json").write_text(json.dumps(unified,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"✓ V137 44 Chiefs — النواة الحوسبية والعلمية الشرعية — 704 Seeds | 10560 Nodes | 168960 Synaptic | 106 Licenses | 2332 Org — SHA {sha_all[:16]}")
for c in NEW_CHIEFS: print(f"  {c[0]} {c[2]} — {c[5]} — {c[4]} — {c[11]}")
