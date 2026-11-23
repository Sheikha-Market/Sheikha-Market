import csv
from pathlib import Path
BASE=Path(".")
EXPORTS=BASE/"exports"
v_path=EXPORTS/"SHEIKHA_V158_700_STRUCTURAL_CHIEFS_MASTER.csv"
rows=list(csv.DictReader(open(v_path,"r",encoding="utf-8-sig")))
print(f"Before {len(rows)}")

# 4 كبار V156 المفقودين (211-214)
MISSING=[
    ("C-211","OMNIVERSE","Chief Omniverse Sovereign Officer","كبير مدراء الأومنيفيرس السيادي","W-OMNI-01..32 | NVIDIA Omniverse 128 Digital Twins USD | 32 Weights",18180,"W-OMNI",32),
    ("C-212","CLOUDS_FED","Chief 8-Clouds Federation Officer","كبير مدراء اتحاد السحابات الثمانية","W-CLOUD-01..48 | AWS Azure GCP OCI Alibaba IBM Oracle Huawei Federation mTLS OIDC Meta | 48 Weights",18181,"W-CLOUD",48),
    ("C-213","LME_MT001","Chief LME MT-001 Cathode Officer","كبير مدراء كاثود النحاس LME MT-001","W-LME-01..32 | LME Grade A Cu 99.99% MT-001 SHA 374c6686 M-007 $9500/ton | 32 Weights",18182,"W-LME",32),
    ("C-214","ZATCA_P2","Chief ZATCA Phase2 Officer","كبير مدراء زاتكا المرحلة الثانية","W-ZATCA-01..32 | ZATCA Phase2 UBL2.1 UUID f18f8146 Hash 3bb78535 CR2051263653 Unified7049031003 VAT310000000000003 | 32 Weights",18183,"W-ZATCA",32),
]
seq=len(rows)+1
for chief_id,tier,en,ar,scope,port,wcode,wcount in MISSING:
    if any(r["chief_id"]==chief_id for r in rows): continue
    rows.append({"seq":seq,"chief_id":chief_id,"tier":tier,"title_en":en,"title_ar":ar,"domain_scope":scope,"directors_count":6,"engineers_count":24,"seed_m2m_agents":16,"proliferated_m2m_nodes":240,"synaptic_links":3840,"license_id":f"SHK-M2M-2026-{seq:04d}","bound_port":port,"kpi_target":"100% ACTIVE","sharia_seal":"BOUND_BY_QURAN_SUNNAH","governed_weights":wcount,"weight_code":wcode,"weight_status":"WEIGHTS_ACTIVE_V156_MISSING"})
    seq+=1

out=EXPORTS/"SHEIKHA_V158_703_STRUCTURAL_CHIEFS_MASTER.csv"
fieldnames=["seq","chief_id","tier","title_en","title_ar","domain_scope","directors_count","engineers_count","seed_m2m_agents","proliferated_m2m_nodes","synaptic_links","license_id","bound_port","kpi_target","sharia_seal","governed_weights","weight_code","weight_status"]
with open(out,"w",newline="",encoding="utf-8-sig") as f:
    import csv as csvm
    w=csvm.DictWriter(f, fieldnames=fieldnames); w.writeheader(); w.writerows(rows)
print(f"✓ After {len(rows)} -> {out}")
