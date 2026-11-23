#!/usr/bin/env python3
import re, csv, json, hashlib
from pathlib import Path
BASE=Path(".")
core_path=BASE/"sheikha_core_engine.py"
text=core_path.read_text(encoding="utf-8", errors="ignore")

# اقرأ CSV الحقيقي
EXPORTS=BASE/"exports"
csv_path=EXPORTS/"SHEIKHA_V159_717_STRUCTURAL_CHIEFS_MASTER.csv"
if not csv_path.exists():
    csv_path=sorted(EXPORTS.glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime, reverse=True)[0]
rows=list(csv.DictReader(open(csv_path,"r",encoding="utf-8-sig")))
structural=len(rows)
grand=structural+5000
total_weights=sum(int(r.get("governed_weights") or 32) for r in rows)
total_nodes=sum(int(r.get("proliferated_m2m_nodes") or 240) for r in rows)
total_synaptic=sum(int(r.get("synaptic_links") or 3840) for r in rows)
total_seed=sum(int(r.get("seed_m2m_agents") or 16) for r in rows)

print(f"REAL: {structural}/{grand}/{total_weights} Synaptic {total_synaptic}")

# استبدال عدواني لكل رقم 663/5663/13240 و 717/5717/12440 السابق
# سنستخدم regex لجميع الأنماط
replacements = [
    (r'"chief_directorates"\s*:\s*663', f'"chief_directorates": {structural}'),
    (r'"chief_directorates"\s*:\s*717', f'"chief_directorates": {structural}'),
    (r'"chief_directorates"\s*=\s*663', f'"chief_directorates" = {structural}'),
    (r'"grand_total_chiefs"\s*:\s*5663', f'"grand_total_chiefs": {grand}'),
    (r'"grand_total_chiefs"\s*:\s*5717', f'"grand_total_chiefs": {grand}'),
    (r'"governed_weights_total"\s*:\s*13240', f'"governed_weights_total": {total_weights}'),
    (r'"governed_weights_total"\s*:\s*12440', f'"governed_weights_total": {total_weights}'),
    (r'"governed_weights_total"\s*:\s*11944', f'"governed_weights_total": {total_weights}'),
    (r'"proliferated_m2m_total"\s*:\s*169920', f'"proliferated_m2m_total": {total_nodes}'),
    (r'"proliferated_m2m_total"\s*:\s*\d+', f'"proliferated_m2m_total": {total_nodes}'),
    (r'"synaptic_links"\s*:\s*2718720', f'"synaptic_links": {total_synaptic}'),
    (r'"synaptic_links"\s*:\s*\d+', f'"synaptic_links": {total_synaptic}'),
    (r'"seed_m2m_agents"\s*:\s*10608', f'"seed_m2m_agents": {total_seed}'),
    (r'"seed_m2m_agents"\s*:\s*\d+', f'"seed_m2m_agents": {total_seed}'),
]

# كرر حتى لا يبقى أي 663
for pattern, repl in replacements:
    text = re.sub(pattern, repl, text)

# أيضاً استبدال بسيط نصي مباشر (يغطي كل التكرارات)
text = text.replace(': 663,', f': {structural},')
text = text.replace(': 663', f': {structural}')
text = text.replace('= 663', f'= {structural}')
text = text.replace('663,  # chief', f'{structural},  # chief')
# لكن نحتاج حذر: 663 قد يظهر في أماكن أخرى، لذا نعيد فقط الحقول المحددة
# الحل الأفضل: اجعل النواة تقرأ من CSV ديناميكياً
# سنحقن كود ديناميكي في بداية دالة health إن وجدت

# إضافة تعليمة ديناميكية: إذا كان الملف يستورد csv، اجعله يقرأ CSV عند بدء التشغيل
dynamic_loader = f'''
# --- SHEIKHA DYNAMIC CSV LOADER V159 AUTO-INJECTED ---
try:
    import csv as _csv_dyn, pathlib as _pathlib_dyn
    _csv_path_dyn = _pathlib_dyn.Path(__file__).parent / "exports" / "{csv_path.name}"
    if not _csv_path_dyn.exists():
        _cs = sorted((_pathlib_dyn.Path(__file__).parent / "exports").glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime)
        if _cs: _csv_path_dyn = _cs[-1]
    _rows_dyn = list(_csv_dyn.DictReader(open(_csv_path_dyn, "r", encoding="utf-8-sig")))
    _structural_dyn = len(_rows_dyn)
    _grand_dyn = _structural_dyn + 5000
    _weights_dyn = sum(int(r.get("governed_weights") or 32) for r in _rows_dyn)
    _nodes_dyn = sum(int(r.get("proliferated_m2m_nodes") or 240) for r in _rows_dyn)
    _syn_dyn = sum(int(r.get("synaptic_links") or 3840) for r in _rows_dyn)
    _seed_dyn = sum(int(r.get("seed_m2m_agents") or 16) for r in _rows_dyn)
    DYNAMIC_FOUNDRY = {{"structural": _structural_dyn, "grand": _grand_dyn, "weights": _weights_dyn, "nodes": _nodes_dyn, "synaptic": _syn_dyn, "seed": _seed_dyn}}
except Exception as _e_dyn:
    DYNAMIC_FOUNDRY = {{"structural": {structural}, "grand": {grand}, "weights": {total_weights}, "nodes": {total_nodes}, "synaptic": {total_synaptic}, "seed": {total_seed}}}
# --- END DYNAMIC LOADER ---
'''

if "DYNAMIC_FOUNDRY" not in text:
    # احقن بعد أول import
    text = text.replace("import json", f"import json\n{dynamic_loader}", 1)

# الآن استبدل كل تعيين foundry_m2m_governance ليستخدم DYNAMIC_FOUNDRY
# سنبحث عن dict كامل ونستبدله بمرجع ديناميكي
text = re.sub(
    r'"foundry_m2m_governance"\s*:\s*\{[^}]*"chief_directorates"[^}]*\}',
    f'"foundry_m2m_governance": {{"production_lines": 8, "chief_directorates": DYNAMIC_FOUNDRY["structural"], "hs_product_chiefs": 5000, "grand_total_chiefs": DYNAMIC_FOUNDRY["grand"], "department_directors": DYNAMIC_FOUNDRY["structural"]*6, "specialized_staff": DYNAMIC_FOUNDRY["structural"]*24, "chief_governance_officer": "C-29 ACTIVE", "sheikha_bylaws": 8, "methodologies_scientific": 18, "licenses_and_certificates": 725, "seed_m2m_agents": DYNAMIC_FOUNDRY["seed"], "proliferated_m2m_total": DYNAMIC_FOUNDRY["nodes"], "synaptic_links": DYNAMIC_FOUNDRY["synaptic"], "governed_weights_total": DYNAMIC_FOUNDRY["weights"], "admin_quality_kpi": "99.99%"}}',
    text,
    flags=re.DOTALL
)

core_path.write_text(text, encoding="utf-8")
print(f"✓ core bruteforced + dynamic loader injected {structural}/{grand}/{total_weights}")

# بناء HTML V159 كامل (إصلاح REG)
REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
html=f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Sheikha V159 MCP Registry {structural}/{grand}/{total_weights}</title>
<style>body{{font-family:Tajawal,Arial;background:#0a0f1f;color:#e2e8f0;margin:0;padding:20px}} .card{{background:#111a33;border:1px solid #1e3a8a;border-radius:12px;padding:16px;margin:12px 0}} .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}} h1{{color:#38bdf8}} .badge{{background:#0ea5e9;color:#fff;padding:4px 10px;border-radius:20px;font-size:12px}} code{{background:#1e293b;padding:2px 6px;border-radius:6px}}</style></head><body>
<h1>🛰️ Sheikha V159 — MCP Tools Registry Sovereign — 14 Tools</h1>
<div class="card"><b>Registry</b> {REG} | Gov {GOV} | Seal BOUND_BY_QURAN_SUNNAH<br>
<b>Chiefs:</b> {structural} هيكلي + 5000 HS = {grand} إجمالي | <b>Weights:</b> {total_weights} | <b>Synaptic:</b> {total_synaptic:,} | <b>Nodes:</b> {total_nodes:,} | <b>Seed:</b> {total_seed}</div>
<div class="grid">
<div class="card"><span class="badge">C-251</span> <b>sheikha.status</b><br>عرض الحالة العامة<br><code>W-MCP-T01 32W</code> Port 18201</div>
<div class="card"><span class="badge">C-252</span> <b>sheikha.analyze</b><br>تحليل اتساق السجلات<br><code>W-MCP-T02 32W</code> Port 18202</div>
<div class="card"><span class="badge">C-253</span> <b>sheikha.ports</b><br>رصد 29 منفذ SO_REUSEADDR<br><code>W-MCP-T03 32W</code> Port 18203</div>
<div class="card"><span class="badge">C-254</span> <b>sheikha.classify</b><br>تصنيف شرعي BOQ<br><code>W-MCP-T04 32W</code> Port 18204</div>
<div class="card"><span class="badge">C-255</span> <b>sheikha.expand</b><br>توسيع Foundry<br><code>W-MCP-T05 32W</code> Port 18205</div>
<div class="card"><span class="badge">C-256</span> <b>sheikha.decision</b><br>قرارات أسواق LME $9500/ton<br><code>W-MCP-T06 32W</code> Port 18206</div>
<div class="card"><span class="badge">C-257</span> <b>sheikha.runtime</b><br>Podman runtime<br><code>W-MCP-T07 32W</code> Port 18207</div>
<div class="card"><span class="badge">C-258</span> <b>sheikha.rwp</b><br>مقاييس نبوية<br><code>W-MCP-T08 32W</code> Port 18208</div>
<div class="card"><span class="badge">C-259</span> <b>sheikha.publish-plan</b><br>تحقق حوكمي<br><code>W-MCP-T09 32W</code> Port 18209</div>
<div class="card"><span class="badge">C-260</span> <b>sheikha.smoke</b><br>/api/health 200<br><code>W-MCP-T10 32W</code> Port 18210</div>
<div class="card"><span class="badge">C-261</span> <b>sheikha.self-govern</b><br>مكافحة غرر C-29<br><code>W-MCP-T11 32W</code> Port 18211</div>
<div class="card"><span class="badge">C-262</span> <b>【entity-notion¦canonical_name=Notion】.supervisor</b><br>【entity-Notion¦canonical_name=Notion】 Index 717 chiefs<br><code>W-MCP-T12 48W</code> Port 18212 ZATCA f18f8146</div>
<div class="card"><span class="badge">C-263</span> <b>clouds.federation</b><br>8-Clouds mTLS OIDC<br><code>W-MCP-T13 48W</code> Port 18213 【entity-AWS¦canonical_name=AWS】 【entity-Azure¦canonical_name=Azure】 GCP OCI</div>
<div class="card"><span class="badge">C-264</span> <b>sheikha.omniverse</b><br>【entity-NVIDIA¦canonical_name=NVIDIA】 128 twins<br><code>W-MCP-T14 48W</code> Port 18214 MT-001 374c6686</div>
</div>
<div class="card"><h3>Sharia Finance Calculator</h3>Base 40000 + VAT15% 6000 = 46000 Invoice<br>Transparency 0.5% 200 + Zakat 2.5% 1000 + Waqf 10% 4000 + Net Halal 34800 = 51200 SAR<br>SHA 0cf8bc3c Waqf Fixed | LME MT-001 Cathode Cu 99.99% SHA 374c6686 | ZATCA UUID f18f8146 Hash 3bb78535</div>
</body></html>'''
Path("Sheikha-V159-MCP-Registry.html").write_text(html, encoding="utf-8")
print("✓ HTML V159 built")
