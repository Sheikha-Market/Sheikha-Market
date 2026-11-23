import json, hashlib, csv, datetime, random
from pathlib import Path

REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"
OWNER="سلمان أحمد بن سلمان الراجحي"
random.seed(7049031003)

CHIEFS_CODES=[f"C-{i:02d}" for i in range(1,38)]
DIRECTORS_PER_CHIEF=4
MANAGERS_PER_CHIEF=12
EMPLOYEES_PER_CHIEF=36

DEPTS=[
 ("الأصول والوقف","Assets & Waqf","ISO55001 Waqf","18142"),
 ("البناء والتشييد","Construction","SBC BIM7D Omniverse","18094"),
 ("المشاريع الكبرى","Mega Projects","PMO P6 EVM Monte Carlo","18154"),
 ("المقاولات EPC","Contracting EPC","Etimad FIDIC Istisna'a","18159"),
 ("العقارات الصناعية","Industrial Real Estate","MODON RCJY Wafi 【entity-REGA¦canonical_name=REGA】","18158"),
 ("الإعمار والمدن الذكية","Urban Smart Cities","MOMAH Balady ISO37122 GIS CIM","18140"),
 ("المالية والزكاة","Finance Zakat","IFRS Halal Zero-Riba","18140"),
 ("المحاسبة ZATCA","Accounting ZATCA","ZATCA Phase2 UBL2.1","18163"),
 ("الإمداد والتوريد","Supply Chain","SCOR JIT WMS 20","18093"),
 ("اللوجستيات","Logistics","BOL GPS Maersk DHL GoGreen","18155"),
 ("الشراكات","Partnerships","Monshaat Aramco SABIC","18152"),
 ("التراخيص والمسبك","Licensing Foundry","56 Licenses SHA","18159"),
]

directors=[]; managers=[]; employees=[]; emp_id=1

for ci,chief in enumerate(CHIEFS_CODES,1):
  for d in range(1,DIRECTORS_PER_CHIEF+1):
    dept=DEPTS[(ci+d)%len(DEPTS)]
    code=f"D-{ci:02d}-{d:02d}"
    directors.append([code,f"Director {dept[0]} {d}",f"مدير {dept[0]} {d}",chief,dept[2],dept[3],"A","99%+"])
    for m in range(1,4):
      mgr_code=f"MGR-{ci:02d}-{d:02d}-{m:02d}"
      managers.append([mgr_code,f"Manager {dept[0]} {d}.{m}",f"مدير {dept[0]} مهم {d}.{m}",code,dept[2],dept[3],"B","92%+"])
      for e in range(1,4):
        role=random.choice(["مهندس","محاسب","محلل","مشرف ميداني","أخصائي","فني","منسق","مراقب جودة","مسؤول","مثمن","مقيم","مراقب"])
        emp_code=f"EMP-{emp_id:04d}"
        employees.append([emp_code,f"{role} {dept[0]}",f"{role} {dept[0]} {ci}-{d}-{m}-{e}",mgr_code,dept[2],dept[3],f"C-{ci:02d}",emp_id])
        emp_id+=1

# CSVs
with open("SHEIKHA_V136_ORG_CHIEFS_37.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_AR","Title_EN","Reports_To","Port","KPI","License"])
  for i in range(1,38):
    w.writerow([f"C-{i:02d}",f"كبير مدراء {i}",f"Chief Director {i}",f"C-01 CEO" if i!=1 else "OWNER 7049031003",18082+(i%10),"99.9%",f"SHK-M2M-2026-{i:04d}"])

with open("SHEIKHA_V136_ORG_DIRECTORS_148.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Chief_Parent","Methodology","Port","Grade","KPI"]); w.writerows(directors)

with open("SHEIKHA_V136_ORG_MANAGERS_444.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Director_Parent","Methodology","Port","Grade","KPI"]); w.writerows(managers)

with open("SHEIKHA_V136_ORG_EMPLOYEES_1332.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_AR","Role","Manager_Parent","Methodology","Port","Chief_Root","ID"]); w.writerows(employees)

total_org=len(CHIEFS_CODES)+len(directors)+len(managers)+len(employees)

unified={
 "schema":"SHEIKHA_V136_FULL_ORG_NAWAA_GOVERNANCE_FIXED",
 "timestamp":datetime.datetime.now().isoformat(),
 "seal":SEAL,"registry":REG,"governance":GOV,"owner":OWNER,"cr":"2051263653","unified":"7049031003","vat":"310000000000003",
 "nawaa":{"core":18082,"watch":18162,"status":"ZERO ROBOT ACTIVE — النواة والحوكمة BOUND_BY_QURAN_SUNNAH","weights":10000,"hold":"PRODUCTION_HOLD ACTIVE"},
 "org":{"chiefs":len(CHIEFS_CODES),"directors":len(directors),"managers_important":len(managers),"employees":len(employees),"total":total_org,"ratio":"C1:D4:M12:E36 — 37/148/444/1332 = 1961"},
 "neural":{"seeds":total_org*2,"nodes":total_org*15,"synaptic":total_org*240,"chiefs_only":{"seeds":592,"nodes":8880,"synaptic":142080}},
 "compliance":{"sharia":SEAL,"zatca":"Phase2 UBL2.1 UUID f18f8146","waqf":"أصل ثابت لا يباع SHA 0cf8bc3c","commerce":"0.5%+2.5%+10%+87%+VAT15%","best_weight":"MT-001 Cathode Cu 99.99% SHA 374c6686","best_market":"M-007 LME $9500/ton"},
 "departments_6_core":{"C-32":"الأصول ISO55001 وقف ثابت 18142","C-33":"البناء SBC BIM7D Omniverse 1200C 18094","C-34":"المقاولات Etimad FIDIC EPC استصناع لا غرر 18159","C-35":"العقارات MODON RCJY 50 مصنع 20 WMS 【entity-REGA¦canonical_name=REGA】 Wafi 18158","C-36":"تقييم الأصول IFRS13 Taqeem 18162","C-37":"الإعمار MOMAH Balady SmartCity ISO37122 GIS CIM 18140"}
}
sha=hashlib.sha256(json.dumps(unified,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
unified["sha256"]=sha
Path("SHEIKHA_V136_FULL_ORG_GOVERNANCE.json").write_text(json.dumps(unified,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"✓ V136 FIXED — 37 Chiefs + 148 Directors + 444 Managers + 1332 Employees = {total_org} — SHA {sha[:16]}")
print(f"✓ Neural: {total_org*2} seeds | {total_org*15} nodes | {total_org*240} synaptic")
