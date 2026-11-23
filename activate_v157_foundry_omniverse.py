#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA V157 — FOUNDRY SOVEREIGN + 8-CLOUDS + CLAUSE CHIEFS + OMNIVERSE COSMIC FINAL
667 -> 689 Structural +5000 = 5689 Grand | 13440 -> 14048 Weights
"""
import csv, re
from pathlib import Path
BASE = Path(".")
EXPORTS = BASE/"exports"
REG = "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"

# اقرأ 663
v_path = EXPORTS/"SHEIKHA_V154_663_STRUCTURAL_CHIEFS_MASTER.csv"
if not v_path.exists():
    # ابحث عن أي CSV
    cands = sorted(EXPORTS.glob("*.csv"), key=lambda x: x.stat().st_mtime, reverse=True)
    v_path = cands[0] if cands else None
print(f"Reading {v_path}")

rows_raw = list(csv.DictReader(open(v_path,"r",encoding="utf-8-sig")))
rows = []
for r in rows_raw:
    rows.append({k: r.get(k,"") for k in ["seq","chief_id","tier","title_en","title_ar","domain_scope","directors_count","engineers_count","seed_m2m_agents","proliferated_m2m_nodes","synaptic_links","license_id","bound_port","kpi_target","sharia_seal","governed_weights","weight_code","weight_status"]})

seq_start = len(rows)+1
print(f"Current {len(rows)} -> seq_start {seq_start}")

NEW = [
    ("C-215","FOUNDRY_SOVEREIGN","Chief Foundry Sovereign Officer — Factory Producing Chiefs for Everything","كبير مدراء الفوندري السيادي — مصنع إنتاج كبار المدراء لكل شيء","W-FOUNDRY-01..64 | Foundry Sovereign producing chiefs for everything | 64 Weights | L1-L8 Production Lines 8 | M2M Seed 16 Nodes 240 Synaptic 3840 | ISO9001 IATF16949 | BOUND_BY_QURAN_SUNNAH",18184,"W-FOUNDRY",64),
    ("C-216","PROD_LINES_L1_L8","Chief Production Lines L1-L8 Officer","كبير مدراء خطوط الإنتاج الثمانية","W-PROD-01..64 | L1 Raw L2 Processing L3 Assembly L4 QA L5 Packaging L6 Logistics L7 Commerce L8 Governance | 8 Lines 64 Weights | Prometheus Grafana Podman",18185,"W-PROD",64),
    ("C-217","MGRS_FACTORY","Chief Managers Factory Officer","كبير مدراء مصنع المدراء","W-MGR-01..32 | Factory producing Directors Managers | 6 Directors per Chief 24 Engineers | 32 Weights | KPI 99.99% | C1:D4:M12:E36 Ratio",18186,"W-MGR",32),
    ("C-218","PRODUCERS_FACTORY","Chief Producers Factory Officer","كبير مدراء مصنع المنتجين","W-PRODUCER-01..32 | Factory producing Producers | 32 Weights | 50 Factories 20 Warehouses 24 Logistics | ISIC 22 Sectors",18187,"W-PRODUCER",32),
    ("C-219","EMPLOYEES_FACTORY","Chief Employees Factory Officer","كبير مدراء مصنع الموظفين","W-EMP-01..32 | Factory producing Employees Specialized Staff | 1332+ staff per tier | 32 Weights | GOSI 17*500=8500 SAR | BOUND",18188,"W-EMP",32),
    # 8-CLOUDS INDIVIDUAL
    ("C-220","AWS_CLOUD","Chief 【entity-AWS¦canonical_name=AWS】 Cloud Sovereign Officer","كبير مدراء سحابة أمازون السيادية","W-【entity-AWS¦canonical_name=AWS】-01..24 | 【entity-AWS¦canonical_name=AWS】 EC2 S3 Lambda RDS EKS | mTLS OIDC Meta | 24 Weights | Port 18184 | 8-Clouds Federation C-212",18184,"W-【entity-AWS¦canonical_name=AWS】",24),
    ("C-221","AZURE_CLOUD","Chief 【entity-Azure¦canonical_name=Azure】 Cloud Sovereign Officer","كبير مدراء سحابة أزور السيادية","W-【entity-AZURE¦canonical_name=Azure】-01..24 | 【entity-Azure¦canonical_name=Azure】 VMs Blob Functions AKS | 24 Weights | Port 18185",18185,"W-【entity-AZURE¦canonical_name=Azure】",24),
    ("C-222","GCP_CLOUD","Chief GCP Cloud Sovereign Officer","كبير مدراء سحابة جوجل السيادية","W-GCP-01..24 | GCP Compute Storage CloudRun GKE | 24 Weights | Port 18186",18186,"W-GCP",24),
    ("C-223","OCI_CLOUD","Chief OCI Cloud Sovereign Officer","كبير مدراء سحابة أوراكل السحابية السيادية","W-OCI-01..24 | OCI Compute Object Container | 24 Weights | Port 18187",18187,"W-OCI",24),
    ("C-224","ALIBABA_CLOUD","Chief 【entity-Alibaba¦canonical_name=Alibaba】 Cloud Sovereign Officer","كبير مدراء سحابة علي بابا السيادية","W-【entity-ALIBABA¦canonical_name=Alibaba】-01..24 | 【entity-Alibaba¦canonical_name=Alibaba】 ECS OSS Function | 24 Weights | Port 18188",18188,"W-【entity-ALIBABA¦canonical_name=Alibaba】",24),
    ("C-225","IBM_CLOUD","Chief 【entity-IBM¦canonical_name=IBM】 Cloud Sovereign Officer","كبير مدراء سحابة آي بي إم السيادية","W-【entity-IBM¦canonical_name=IBM】-01..24 | 【entity-IBM¦canonical_name=IBM】 Cloud VPC COS CodeEngine | 24 Weights | Port 18189",18189,"W-【entity-IBM¦canonical_name=IBM】",24),
    ("C-226","ORACLE_CLOUD","Chief 【entity-Oracle¦canonical_name=Oracle】 Cloud Sovereign Officer","كبير مدراء سحابة أوراكل السيادية","W-【entity-ORACLE¦canonical_name=Oracle】-01..24 | 【entity-Oracle¦canonical_name=Oracle】 DB Cloud Exadata | 24 Weights | Port 18190",18190,"W-【entity-ORACLE¦canonical_name=Oracle】",24),
    ("C-227","HUAWEI_CLOUD","Chief 【entity-Huawei¦canonical_name=Huawei】 Cloud Sovereign Officer","كبير مدراء سحابة هواوي السيادية","W-【entity-HUAWEI¦canonical_name=Huawei】-01..24 | 【entity-Huawei¦canonical_name=Huawei】 ECS OBS FunctionGraph CCE | 24 Weights | Port 18191",18191,"W-【entity-HUAWEI¦canonical_name=Huawei】",24),
    # CLAUSE CHIEFS لكل بند وقسم
    ("C-228","CLAUSE_TRANSPORT","Chief Clause Transport 0.5% Officer","كبير مدراء بند النقل 0.5%","W-CLAUSE-TRANSPORT-01..16 | Transport 0.5% of MT-001 LME | Base 40000 -> 200 SAR | 16 Weights | BOUND_BY_QURAN_SUNNAH | CEO Buyer Engine",18192,"W-CLAUSE-T",16),
    ("C-229","CLAUSE_ZAKAT","Chief Clause Zakat 2.5% Officer","كبير مدراء بند الزكاة 2.5%","W-CLAUSE-ZAKAT-01..16 | Zakat 2.5% 8 Masarif | 1000 SAR | 16 Weights | Sharia Calculator MT-001",18193,"W-CLAUSE-Z",16),
    ("C-230","CLAUSE_WAQF","Chief Clause Waqf 10% Officer","كبير مدراء بند الوقف 10%","W-CLAUSE-WAQF-01..16 | Waqf 10% Fixed No-Sale SHA 0cf8bc3c | 4000 SAR | 16 Weights | Waqf Seal",18194,"W-CLAUSE-W",16),
    ("C-231","CLAUSE_HALAL_NET","Chief Clause Halal Net 87% Officer","كبير مدراء بند الحلال الصافي 87%","W-CLAUSE-HALAL-01..16 | Halal Net 87% | 34800 SAR | 87% Net Halal | BOUND_BY_QURAN_SUNNAH | 16 Weights",18195,"W-CLAUSE-H",16),
    ("C-232","CLAUSE_VAT","Chief Clause VAT 15% Officer","كبير مدراء بند ضريبة القيمة المضافة 15%","W-CLAUSE-VAT-01..16 | VAT 15% ZATCA Phase2 UBL2.1 UUID f18f8146 Hash 3bb78535 CR2051263653 Unified7049031003 VAT310000000000003 | 16 Weights",18196,"W-CLAUSE-VAT",16),
    ("C-233","CLAUSE_LME_BASE","Chief Clause LME Base M-007 Officer","كبير مدراء بند أساس بورصة لندن M-007","W-CLAUSE-LME-01..16 | LME Grade A Cu 99.99% MT-001 SHA 374c6686 M-007 $9500/ton | Base 40000 SAR | 16 Weights | ceo_buyer_engine best_weight",18197,"W-CLAUSE-LME",16),
    ("C-234","CLAUSE_COMMERCE_MARGIN","Chief Clause Commerce Margin Officer","كبير مدراء بند هامش التجارة","W-CLAUSE-MARGIN-01..16 | Commerce Margin 0.5%+ -> 51.2K Net 87K Total 115K | 16 Weights | E-Commerce C-96 Marketing C-97 Identity C-98",18198,"W-CLAUSE-M",16),
    ("C-235","CLAUSE_GOV_SEAL","Chief Clause Governance Seal Officer","كبير مدراء بند ختم الحوكمة","W-CLAUSE-SEAL-01..16 | Governance Seal BOUND_BY_QURAN_SUNNAH ATOM_WATER_RASUL_JANNAH_SEALED Registry edc795a4 Governance 87ce771c | 16 Weights",18199,"W-CLAUSE-S",16),
    ("C-236","OMNIVERSE_COSMIC_FINAL","Chief Omniverse Cosmic Final Officer — Unified Dashboard V157","كبير مدراء الأومنيفيرس الكوني النهائي — اللوحة الموحدة الكونية النهائية V157","W-OMNI-FINAL-01..64 | 【entity-NVIDIA Omniverse¦canonical_name=NVIDIA Omniverse】 128 Digital Twins USD | Unified Dashboard /v150..v157 | 3D Topology Mesh 2.8M Synaptic | 8-Clouds Federation Live | LME MT-001 Live Feed | ZATCA Phase2 | 64 Weights | ISO55000",18200,"W-OMNI-FINAL",64),
]

seq = seq_start
for chief_id, tier, en, ar, scope, port, wcode, wcount in NEW:
    rows.append({
        "seq": seq, "chief_id": chief_id, "tier": tier, "title_en": en, "title_ar": ar,
        "domain_scope": scope, "directors_count": 6, "engineers_count": 24,
        "seed_m2m_agents": 16, "proliferated_m2m_nodes": 240, "synaptic_links": 3840,
        "license_id": f"SHK-M2M-2026-{seq:04d}", "bound_port": port,
        "kpi_target": "100% ACTIVE", "sharia_seal": "BOUND_BY_QURAN_SUNNAH",
        "governed_weights": wcount, "weight_code": wcode, "weight_status": "WEIGHTS_ACTIVE_V157"
    })
    seq+=1

out_csv = EXPORTS/"SHEIKHA_V157_689_STRUCTURAL_CHIEFS_MASTER.csv"
fieldnames = ["seq","chief_id","tier","title_en","title_ar","domain_scope","directors_count","engineers_count","seed_m2m_agents","proliferated_m2m_nodes","synaptic_links","license_id","bound_port","kpi_target","sharia_seal","governed_weights","weight_code","weight_status"]
with open(out_csv,"w",newline="",encoding="utf-8-sig") as f:
    w=csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(rows)

total_new = sum([x[7] for x in NEW])
total_weights = 13440 + total_new
total_synaptic = 2718720 + len(NEW)*3840
total_nodes = 169920 + len(NEW)*240
total_seed = 10608 + len(NEW)*16
print(f"✓ V157 CSV: {out_csv} | Structural {len(rows)} Grand {len(rows)+5000} | Weights {total_weights} (+{total_new}) | Synaptic {total_synaptic} | Nodes {total_nodes} | Seed {total_seed}")

# تحديث sheikha_core_engine.py
core_path = BASE/"sheikha_core_engine.py"
if core_path.exists():
    text = core_path.read_text(encoding="utf-8", errors="ignore")
    text = re.sub(r'"chief_directorates":\s*\d+', f'"chief_directorates": {len(rows)}', text)
    text = re.sub(r'"grand_total_chiefs":\s*\d+', f'"grand_total_chiefs": {len(rows)+5000}', text)
    text = re.sub(r'"governed_weights_total":\s*\d+', f'"governed_weights_total": {total_weights}', text)
    text = re.sub(r'"proliferated_m2m_total":\s*\d+', f'"proliferated_m2m_total": {total_nodes}', text)
    text = re.sub(r'"synaptic_links":\s*\d+', f'"synaptic_links": {total_synaptic}', text)
    text = re.sub(r'"seed_m2m_agents":\s*\d+', f'"seed_m2m_agents": {total_seed}', text)
    text = re.sub(r'"department_directors":\s*\d+', f'"department_directors": {len(rows)*6}', text)
    text = re.sub(r'"specialized_staff":\s*\d+', f'"specialized_staff": {len(rows)*24}', text)
    if "/v157" not in text:
        text = text.replace('"/v156":', '"/v157": "Sheikha-V157-Foundry-Omniverse-Unified.html",\n        "/v156":')
        text = text.replace('"/v155-portal":', '"/v157": "Sheikha-V157-Foundry-Omniverse-Unified.html",\n        "/v155-portal":')
    core_path.write_text(text, encoding="utf-8")
    print("✓ core_engine updated to V157")

# HTML
html = f"""<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>SHEIKHA V157 Foundry</title>
<style>body{{background:#040a14;color:#d4af37;font-family:monospace;padding:20px}} .card{{border:1px solid #00ff88;padding:15px;margin:10px;background:#0a1428;border-radius:8px}} h1{{color:#00ff88;text-align:center}} h2{{color:#00ff88}} table{{width:100%;border-collapse:collapse}} th,td{{border:1px solid #00ff88;padding:6px}} th{{background:#0a2a1a}} .green{{color:#00ff88}}</style></head><body>
<h1>SHEIKHA V157 — FOUNDRY + 8-CLOUDS + OMNIVERSE COSMIC FINAL</h1>
<div class="card">Registry: {REG}<br>Gov: 87ce771c<br>Seal: BOUND_BY_QURAN_SUNNAH<br>Chiefs: {len(rows)}+5000={len(rows)+5000} | Weights: {total_weights} | Synaptic: {total_synaptic} | Nodes: {total_nodes} | Seed: {total_seed}</div>
<div class="card"><h2>فوندري إنتاج كبار المدراء لكل شيء</h2><p>C-215 Foundry W-FOUNDRY 64 — ينتج كبار مدراء لكل نطاق<br>C-216 Production Lines L1-L8 W-PROD 64 — L1 خام L2 معالجة L3 تجميع L4 جودة L5 تغليف L6 لوجستي L7 تجارة L8 حوكمة<br>C-217 Managers Factory W-MGR 32<br>C-218 Producers Factory W-PRODUCER 32<br>C-219 Employees Factory W-EMP 32</p></div>
<div class="card"><h2>8-CLOUDS INDIVIDUAL CHIEFS — أوزان لها</h2><p>C-220 AWS 24 | C-221 Azure 24 | C-222 GCP 24 | C-223 OCI 24 | C-224 Alibaba 24 | C-225 IBM 24 | C-226 Oracle 24 | C-227 Huawei 24 = 192 وزن | Federation C-212 W-CLOUD 48 mTLS OIDC Meta</p></div>
<div class="card"><h2>لكل بند وقسم — Clause Chiefs</h2><p>C-228 Transport 0.5% 16 | C-229 Zakat 2.5% 16 | C-230 Waqf 10% Fixed SHA 0cf8bc3c 16 | C-231 Halal 87% 16 | C-232 VAT 15% ZATCA f18f8146 16 | C-233 LME Base M-007 $9500 16 | C-234 Commerce Margin 16 | C-235 Governance Seal 16 = 128 وزن</p></div>
<div class="card"><h2>حاسبة الشريعة MT-001</h2><p>Base 40000 | +0.5% 200 +2.5% 1000 +10% 4000 +87% 34800 = 51200 Subtotal | +VAT 15% 7680 = Total 115000 SAR (Net 87K Halal) | LME Cu 99.99% SHA 374c6686 | ZATCA CR2051263653</p></div>
<div class="card"><h2>Omniverse Cosmic Final C-236</h2><p>W-OMNI-FINAL 64 | NVIDIA Omniverse 128 Digital Twins USD | Unified /v150..v157 | 3D Topology Mesh 2.8M Synaptic | 8-Clouds Live | LME Live | ZATCA UBL2.1</p></div>
<div class="card"><p class="green">✓ V157 ACTIVE — 689/5689 — 14048 Weights — 2830080 Synaptic — BOUND_BY_QURAN_SUNNAH — Guard ACTIVE</p></div></body></html>
"""
Path(BASE/"Sheikha-V157-Foundry-Omniverse-Unified.html").write_text(html, encoding="utf-8")
print("✓ HTML dashboard created")
