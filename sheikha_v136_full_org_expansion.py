import json, hashlib, csv, datetime, random
from pathlib import Path

REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED"
OWNER="سلمان أحمد بن سلمان الراجحي"

random.seed(7049031003)

# 37 كبير مدراء موجود
CHIEFS_CODES=[f"C-{i:02d}" for i in range(1,38)]

# هيكل التوسعة
DIRECTORS_PER_CHIEF=4
MANAGERS_PER_CHIEF=12
EMPLOYEES_PER_CHIEF=36  # 4 teams x 9

DEPTS=[
 ("الأصول والوقف","Assets & Waqf","ISO55001","18142"),("البناء والتشييد","Construction","SBC BIM7D","18094"),
 ("المشاريع الكبرى","Mega Projects","PMO P6 EVM","18154"),("المقاولات EPC","Contracting EPC","Etimad FIDIC","18159"),
 ("العقارات الصناعية","Industrial Real Estate","MODON RCJY","18158"),("الإعمار والمدن الذكية","Urban Smart Cities","MOMAH Balady","18140"),
 ("المالية والزكاة","Finance Zakat","IFRS Halal","18140"),("المحاسبة ZATCA","Accounting ZATCA","UBL2.1","18163"),
 ("الإمداد والتوريد","Supply Chain","SCOR JIT","18093"),("اللوجستيات","Logistics","BOL GPS GoGreen","18155"),
 ("الشراكات","Partnerships","Monshaat Aramco","18152"),("التراخيص والمسبك","Licensing Foundry","56 Licenses","18159"),
 ("التسويق CEO Buyer","Marketing Buyer","LME MT-001","18164"),("التجارة والوقف","Commerce Waqf","0.5%+2.5%+10%","18163"),
 ("السحابة 12 نطاق","Cloud 12 Domains","Google Alliance","18125"),("أرجون السيادي","Argon Engine","4 Argon 3.8T","18156"),
 ("الكون والتوائم","Universe Twins","128 USD Omniverse","18161"),("الحوكمة واللوائح","Governance Bylaws","COBIT ISO37000","18162"),
 ("الاتصالات MCP/SDK","Telecom MCP","ITU-T gRPC mTLS","18158"),("التواصل الدبلوماسي","Diplomatic Comm","【entity-Meta¦canonical_name=Meta】 WhatsApp","18120")
]

# توليد المدراء
directors=[]
managers=[]
employees=[]
emp_id=1

for ci,chief in enumerate(CHIEFS_CODES,1):
  for d in range(1,DIRECTORS_PER_CHIEF+1):
    dept=DEPTS[(ci+d)%len(DEPTS)]
    code=f"D-{ci:02d}-{d:02d}"
    directors.append([code,f"Director {dept[0]} {d}",f"مدير {dept[0]} {d}",f"{chief} Reports to {chief}","{dept[2]}","{dept[3]}",f"DIR-{ci}{d}",f"90%+"])
    # مدراء تحت كل مدير
    for m in range(1,4): # 3 managers per director = 12 per chief
      mgr_code=f"MGR-{ci:02d}-{d:02d}-{m:02d}"
      managers.append([mgr_code,f"Manager {dept[0]} {d}.{m}",f"مدير {dept[0]} مهم {d}.{m}",code,dept[2],dept[3],f"MGR-{ci}{d}{m}","85%+"])
      # موظفون تحت كل مدير مهم 3 موظفين = 36 per chief
      for e in range(1,4):
        role=random.choice(["مهندس","محاسب","محلل","مشرف ميداني","أخصائي","فني","منسق","مراقب جودة","مسؤول"])
        emp_code=f"EMP-{emp_id:04d}"
        employees.append([emp_code,f"{role} {dept[0]} {ci}-{d}-{m}-{e}",f"{role} {dept[0]}",mgr_code,dept[2],dept[3],f"C-{ci:02d}",emp_id])
        emp_id+=1

# كتابة CSVs
with open("SHEIKHA_V136_ORG_CHIEFS_37.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_AR","Title_EN","Reports_To","Port","KPI","License"])
  for i,c in enumerate(CHIEFS_CODES,1):
    w.writerow([c,f"كبير مدراء {i}",f"Chief Director {i}",f"C-01 CEO" if c!="C-01" else "OWNER 7049031003",18082+f"{i%10}","99.9%",f"SHK-M2M-2026-{i:04d}"])

with open("SHEIKHA_V136_ORG_DIRECTORS_148.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Chief_Parent","Methodology","Port","Grade","KPI"])
  w.writerows(directors)

with open("SHEIKHA_V136_ORG_MANAGERS_444.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_EN","Title_AR","Director_Parent","Methodology","Port","Grade","KPI"])
  w.writerows(managers)

with open("SHEIKHA_V136_ORG_EMPLOYEES_1332.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f); w.writerow(["Code","Title_AR","Role","Manager_Parent","Methodology","Port","Chief_Root","ID"])
  w.writerows(employees)

total_org=len(CHIEFS_CODES)+len(directors)+len(managers)+len(employees) # 37+148+444+1332=1961

unified={
 "schema":"SHEIKHA_V136_FULL_ORG_NAWAA_GOVERNANCE",
 "timestamp":datetime.datetime.now().isoformat(),
 "seal":SEAL,"registry":REG,"governance":GOV,
 "owner":OWNER,"cr":"2051263653","unified":"7049031003","vat":"310000000000003",
 "nawaa":{"core":18082,"watch":18162,"status":"ZERO ROBOT ACTIVE — النواة والحوكمة BOUND_BY_QURAN_SUNNAH","weights":10000,"hold":"PRODUCTION_HOLD ACTIVE"},
 "org":{"chiefs":len(CHIEFS_CODES),"directors":len(directors),"managers_important":len(managers),"employees":len(employees),"total":total_org,"ratio":"C1:D4:M12:E36 — 37/148/444/1332 = 1961 موظف"},
 "neural":{"chiefs_37":{"seeds":592,"nodes":8880,"synaptic":142080},"with_staff":{"seeds_total":total_org*2,"nodes_total":total_org*15,"synaptic_total":total_org*240}},
 "compliance":{"sharia":"BOUND_BY_QURAN_SUNNAH ATOM_WATER_RASUL_JANNAH_SEALED","no_riba_gharar":True,"zatca":"Phase2 UBL2.1 UUID f18f8146","pdpl_gosi":True,"iso55001_sbc_rega_wafi_balady":True,"commerce":"0.5% شفافية + 2.5% زكاة + 10% وقف + 87% حلال + VAT15% =115K","waqf":"أصل ثابت لا يباع SHA 0cf8bc3c"},
 "departments":[{"ar":d[0],"en":d[1],"method":d[2],"port":d[3]} for d in DEPTS[:12]],
 "best":{"weight":"MT-001 Cathode Cu 99.99% LME Grade A 99% SHA 374c6686","market":"M-007 LME $9500/ton","factories":50,"warehouses":20,"logistics":24,"hs":5000,"twins":128}
}
sha=hashlib.sha256(json.dumps(unified,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
unified["sha256"]=sha
Path("SHEIKHA_V136_FULL_ORG_GOVERNANCE.json").write_text(json.dumps(unified,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"✓ V136 FULL ORG — 37 Chiefs + 148 Directors + 444 Important Managers + 1332 Employees = {total_org} — SHA {sha[:16]}")
