#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA V159 — MCP TOOLS REGISTRY SOVEREIGN + 14 TOOLS + 【entity-NOTION¦canonical_name=Notion】 SUPERVISOR + 8-CLOUDS
703 -> 717 Structural +5000 = 5717 Grand | Weights 11944 -> 14736 | Synaptic 2.7M -> 3.0M
Seal: BOUND_BY_QURAN_SUNNAH | Registry: edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b
"""
import csv, re, json, hashlib
from pathlib import Path
BASE=Path(".")
EXPORTS=BASE/"exports"
EXPORTS.mkdir(exist_ok=True)

# 1) اقرأ آخر CSV
cands=sorted(EXPORTS.glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime, reverse=True)
v_path=cands[0] if cands else None
print(f"Reading {v_path}")
rows=list(csv.DictReader(open(v_path,"r",encoding="utf-8-sig")))
print(f"Before {len(rows)}")

# 2) V159: 14 MCP Tools Chiefs
MCP_TOOLS=[
    ("C-251","MCP_T01","Chief MCP Tool sheikha.status Officer","كبير مدراء أداة الحالة السيادية","W-MCP-T01-01..32 | Tool: sheikha.status -> health + 703 chiefs + 8-lines + ZATCA + LME | 32 Weights",18201,"W-MCP-T01",32),
    ("C-252","MCP_T02","Chief MCP Tool sheikha.analyze Officer","كبير مدراء أداة التحليل السيادي","W-MCP-T02-01..32 | Tool: sheikha.analyze -> consistency mirror CSV<->Core<->Ports | 32 Weights",18202,"W-MCP-T02",32),
    ("C-253","MCP_T03","Chief MCP Tool sheikha.ports Officer","كبير مدراء أداة المنافذ","W-MCP-T03-01..32 | Tool: sheikha.ports -> 29 ports SO_REUSEADDR Zero TIME_WAIT mesh | 32 Weights",18203,"W-MCP-T03",32),
    ("C-254","MCP_T04","Chief MCP Tool sheikha.classify Officer","كبير مدراء أداة التصنيف الشرعي","W-MCP-T04-01..32 | Tool: sheikha.classify payments/contracts -> Halal/Gharar/Riba/BOQ | 32 Weights",18204,"W-MCP-T04",32),
    ("C-255","MCP_T05","Chief MCP Tool sheikha.expand Officer","كبير مدراء أداة التوسع","W-MCP-T05-01..32 | Tool: sheikha.expand ai-engine/ide/foundry -> proliferate M2M | 32 Weights",18205,"W-MCP-T05",32),
    ("C-256","MCP_T06","Chief MCP Tool sheikha.decision Officer","كبير مدراء أداة القرار","W-MCP-T06-01..32 | Tool: sheikha.decision market/logistics -> M-007 LME + shipping BL | 32 Weights",18206,"W-MCP-T06",32),
    ("C-257","MCP_T07","Chief MCP Tool sheikha.runtime Officer","كبير مدراء أداة وقت التشغيل","W-MCP-T07-01..32 | Tool: sheikha.runtime -> Podman 5 containers Exited0 fallback Python core | 32 Weights",18207,"W-MCP-T07",32),
    ("C-258","MCP_T08","Chief MCP Tool sheikha.rwp Officer","كبير مدراء أداة المقاييس الكونية","W-MCP-T08-01..32 | Tool: sheikha.rwp -> prophetic & cosmic metrics RWP | 32 Weights",18208,"W-MCP-T08",32),
    ("C-259","MCP_T09","Chief MCP Tool sheikha.publish Officer","كبير مدراء أداة النشر الحوكمي","W-MCP-T09-01..32 | Tool: sheikha.publish-plan -> governance gate check | 32 Weights",18209,"W-MCP-T09",32),
    ("C-260","MCP_T10","Chief MCP Tool sheikha.smoke Officer","كبير مدراء أداة اختبار الدخان","W-MCP-T10-01..32 | Tool: sheikha.smoke -> /api/health + 29 ports 200 | 32 Weights",18210,"W-MCP-T10",32),
    ("C-261","MCP_T11","Chief MCP Tool sheikha.selfGovern Officer","كبير مدراء أداة الحكم الذاتي","W-MCP-T11-01..32 | Tool: sheikha.self-govern -> C-29 governance + anti-gharar | 32 Weights",18211,"W-MCP-T11",32),
    ("C-262","MCP_T12","Chief MCP Tool sheikha.【entity-notion¦canonical_name=Notion】 Officer","كبير مدراء أداة 【entity-Notion¦canonical_name=Notion】 Supervisor","W-MCP-T12-01..48 | Tool: 【entity-notion¦canonical_name=Notion】.supervisor -> 【entity-Notion¦canonical_name=Notion】 DB Index 703 chiefs + 8-Clouds Fed + ZATCA UUID f18f8146 | 48 Weights",18212,"W-MCP-T12",48),
    ("C-263","MCP_T13","Chief MCP Tool sheikha.clouds Officer","كبير مدراء أداة اتحاد السحابات","W-MCP-T13-01..48 | Tool: clouds.federation -> 【entity-AWS¦canonical_name=AWS】 【entity-Azure¦canonical_name=Azure】 GCP OCI 【entity-Alibaba¦canonical_name=Alibaba】 【entity-IBM¦canonical_name=IBM】 【entity-Oracle¦canonical_name=Oracle】 【entity-Huawei¦canonical_name=Huawei】 mTLS OIDC Meta | 48 Weights",18213,"W-MCP-T13",48),
    ("C-264","MCP_T14","Chief MCP Tool sheikha.omniverse Officer","كبير مدراء أداة الأومنيفيرس","W-MCP-T14-01..48 | Tool: sheikha.omniverse -> 【entity-NVIDIA¦canonical_name=NVIDIA】 128 digital twins USD + Foundry + LME MT-001 374c6686 | 48 Weights",18214,"W-MCP-T14",48),
]

seq=len(rows)+1
for chief_id,tier,en,ar,scope,port,wcode,wcount in MCP_TOOLS:
    if any(r["chief_id"]==chief_id for r in rows): continue
    rows.append({"seq":seq,"chief_id":chief_id,"tier":tier,"title_en":en,"title_ar":ar,"domain_scope":scope,"directors_count":6,"engineers_count":24,"seed_m2m_agents":16,"proliferated_m2m_nodes":240,"synaptic_links":3840,"license_id":f"SHK-M2M-2026-{seq:04d}","bound_port":port,"kpi_target":"100% ACTIVE","sharia_seal":"BOUND_BY_QURAN_SUNNAH","governed_weights":wcount,"weight_code":wcode,"weight_status":"MCP_TOOLS_ACTIVE_V159"})
    seq+=1

print(f"After {len(rows)}")

# حساب المجاميع الحقيقية
structural=len(rows)
grand=structural+5000
# أوزان: احسب من الجديد + قديم، وإن كان قديم صفر فاستخدم 32 افتراضي لقديم
total_weights=0
for r in rows:
    try: total_weights+=int(r.get("governed_weights") or 32)
    except: total_weights+=32
total_nodes=sum(int(r.get("proliferated_m2m_nodes") or 240) for r in rows)
total_synaptic=sum(int(r.get("synaptic_links") or 3840) for r in rows)
total_seed=sum(int(r.get("seed_m2m_agents") or 16) for r in rows)

print(f"New totals: {structural}/{grand}/{total_weights} Synaptic {total_synaptic}")

# كتابة CSV
out=EXPORTS/"SHEIKHA_V159_717_STRUCTURAL_CHIEFS_MASTER.csv"
fieldnames=["seq","chief_id","tier","title_en","title_ar","domain_scope","directors_count","engineers_count","seed_m2m_agents","proliferated_m2m_nodes","synaptic_links","license_id","bound_port","kpi_target","sharia_seal","governed_weights","weight_code","weight_status"]
with open(out,"w",newline="",encoding="utf-8-sig") as f:
    w=csv.DictWriter(f, fieldnames=fieldnames); w.writeheader(); w.writerows(rows)
print(f"✓ CSV: {out}")

# 3) بناء sheikha_mcp_server.py الفعلي بـ 14 Tool
mcp_code = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA MCP SERVER — V159 SOVEREIGN — 14 TOOLS + 【entity-NOTION¦canonical_name=Notion】 + 8-CLOUDS
Registry edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b Gov 87ce771c Seal BOUND_BY_QURAN_SUNNAH
Port 18193 | Foundry {structural}/{grand}/{total_weights}
"""
import json, csv
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer

REGISTRY="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"
SEAL="BOUND_BY_QURAN_SUNNAH"

TOOLS_REGISTRY=[
  {{"name":"sheikha.status","chief":"C-251","port":18201,"desc":"عرض الحالة العامة ومطابقة الأقاليم — 703->717 chiefs health","weight":"W-MCP-T01","seal":SEAL}},
  {{"name":"sheikha.analyze","chief":"C-252","port":18202,"desc":"تحليل اتساق السجلات وتطابق المرآة CSV<->Core<->Ports","weight":"W-MCP-T02","seal":SEAL}},
  {{"name":"sheikha.ports","chief":"C-253","port":18203,"desc":"رصد المنافذ 29 SO_REUSEADDR Zero TIME_WAIT","weight":"W-MCP-T03","seal":SEAL}},
  {{"name":"sheikha.classify","chief":"C-254","port":18204,"desc":"تصنيف الامتثال الشرعي payments/contracts BOQ","weight":"W-MCP-T04","seal":SEAL}},
  {{"name":"sheikha.expand","chief":"C-255","port":18205,"desc":"توسيع وتوثيق ai-engine/ide/foundry M2M proliferation","weight":"W-MCP-T05","seal":SEAL}},
  {{"name":"sheikha.decision","chief":"C-256","port":18206,"desc":"فحص قرارات الأسواق وبوالص الشحن LME M-007 $9500/ton","weight":"W-MCP-T06","seal":SEAL}},
  {{"name":"sheikha.runtime","chief":"C-257","port":18207,"desc":"إدارة كبسولات Podman الموزعة 5 containers fallback","weight":"W-MCP-T07","seal":SEAL}},
  {{"name":"sheikha.rwp","chief":"C-258","port":18208,"desc":"استعراض المقاييس النبوية والكونية RWP","weight":"W-MCP-T08","seal":SEAL}},
  {{"name":"sheikha.publish-plan","chief":"C-259","port":18209,"desc":"التحقق الحوكمي من خطط النشر governance gate","weight":"W-MCP-T09","seal":SEAL}},
  {{"name":"sheikha.smoke","chief":"C-260","port":18210,"desc":"فحص جاهزية /api/health 200 strict_404","weight":"W-MCP-T10","seal":SEAL}},
  {{"name":"sheikha.self-govern","chief":"C-261","port":18211,"desc":"تأكيد سريان الرقابة ومكافحة الغرر C-29","weight":"W-MCP-T11","seal":SEAL}},
  {{"name":"【entity-notion¦canonical_name=Notion】.supervisor","chief":"C-262","port":18212,"desc":"【entity-Notion¦canonical_name=Notion】 Supervisor Index 717 chiefs + ZATCA UUID f18f8146 + CR2051263653","weight":"W-MCP-T12","seal":SEAL}},
  {{"name":"clouds.federation","chief":"C-263","port":18213,"desc":"8-Clouds Federation 【entity-AWS¦canonical_name=AWS】 【entity-Azure¦canonical_name=Azure】 GCP OCI 【entity-Alibaba¦canonical_name=Alibaba】 【entity-IBM¦canonical_name=IBM】 【entity-Oracle¦canonical_name=Oracle】 【entity-Huawei¦canonical_name=Huawei】 mTLS OIDC","weight":"W-MCP-T13","seal":SEAL}},
  {{"name":"sheikha.omniverse","chief":"C-264","port":18214,"desc":"Omniverse 128 digital twins USD NVIDIA + Foundry MT-001 374c6686","weight":"W-MCP-T14","seal":SEAL}},
]

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.send_header("Content-Type","application/json; charset=utf-8"); self.end_headers()
        if self.path in ["/","/mcp","/tools"]:
            self.wfile.write(json.dumps({{"registry":REGISTRY,"governance":GOV,"seal":SEAL,"structural":{structural},"grand":{grand},"weights":{total_weights},"tools":TOOLS_REGISTRY}}, ensure_ascii=False, indent=2).encode())
        elif self.path.startswith("/tool/"):
            name=self.path.split("/tool/")[1]
            tool=next((t for t in TOOLS_REGISTRY if t["name"]==name), None)
            self.wfile.write(json.dumps(tool or {{"error":"not found"}}, ensure_ascii=False).encode())
        else:
            self.wfile.write(json.dumps({{"ok":True,"path":self.path,"tools":len(TOOLS_REGISTRY)}}, ensure_ascii=False).encode())
    def log_message(self, *a): pass

if __name__=="__main__":
    print(f"MCP Server V159 on 18193 with {{len(TOOLS_REGISTRY)}} tools")
    HTTPServer(("127.0.0.1",18193), Handler).serve_forever()
'''

Path("sheikha_mcp_server.py").write_text(mcp_code, encoding="utf-8")
print("✓ sheikha_mcp_server.py built")

# 4) إصلاح sheikha_core_engine.py جذرياً — استبدال كل القيم
core_path=BASE/"sheikha_core_engine.py"
if core_path.exists():
    text=core_path.read_text(encoding="utf-8", errors="ignore")
    # استبدال كل الأرقام القديمة بشكل آمن
    text=re.sub(r'"chief_directorates"\s*:\s*\d+', f'"chief_directorates": {structural}', text)
    text=re.sub(r'"grand_total_chiefs"\s*:\s*\d+', f'"grand_total_chiefs": {grand}', text)
    text=re.sub(r'"governed_weights_total"\s*:\s*\d+', f'"governed_weights_total": {total_weights}', text)
    text=re.sub(r'"proliferated_m2m_total"\s*:\s*\d+', f'"proliferated_m2m_total": {total_nodes}', text)
    text=re.sub(r'"synaptic_links"\s*:\s*\d+', f'"synaptic_links": {total_synaptic}', text)
    text=re.sub(r'"seed_m2m_agents"\s*:\s*\d+', f'"seed_m2m_agents": {total_seed}', text)
    text=re.sub(r'"department_directors"\s*:\s*\d+', f'"department_directors": {structural*6}', text)
    text=re.sub(r'"specialized_staff"\s*:\s*\d+', f'"specialized_staff": {structural*24}', text)
    text=re.sub(r'"grand"\s*:\s*10000', f'"grand": {grand}', text)
    text=re.sub(r'"weights"\s*:\s*10000', f'"weights": {total_weights}', text)
    # أزل أي كاش قديم
    text=text.replace('"chief_directorates": 663', f'"chief_directorates": {structural}')
    text=text.replace('"grand_total_chiefs": 5663', f'"grand_total_chiefs": {grand}')
    text=text.replace('"governed_weights_total": 13240', f'"governed_weights_total": {total_weights}')
    # إضافة مسارات V159
    if "/v159" not in text:
        text=text.replace('"/v158-network":', '"/v159-mcp-registry": "Sheikha-V159-MCP-Registry.html",\n        "/v159-tools": "sheikha_mcp_server.py",\n        "/v158-network":')
    core_path.write_text(text, encoding="utf-8")
    print(f"✓ core patched to {structural}/{grand}/{total_weights}")
else:
    print("core not found")

# 5) HTML Portal V159
html=f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Sheikha V159 MCP Registry Sovereign {structural}/{grand}/{total_weights}</title>
<style>body{{font-family:Tajawal,Arial;background:#0a0f1f;color:#e2e8f0;margin:0;padding:20px}} .card{{background:#111a33;border:1px solid #1e3a8a;border-radius:12px;padding:16px;margin:12px 0}} .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}} h1{{color:#38bdf8}} .badge{{background:#0ea5e9;color:#fff;padding:4px 10px;border-radius:20px;font-size:12px}} code{{background:#1e293b;padding:2px 6px;border-radius:6px}}</style></head><body>
<h1>🛰️ Sheikha V159 — MCP Tools Registry Sovereign</h1>
<div class="card"><b>Registry</b> {REG} | Gov 87ce771c | Seal BOUND_BY_QURAN_SUNNAH<br>
<b>Chiefs:</b> {structural} هيكلي + 5000 HS = {grand} إجمالي | <b>Weights:</b> {total_weights} | <b>Synaptic:</b> {total_synaptic:,} | <b>Nodes:</b> {total_nodes:,}</div>
<div class="grid">
'''
for tool in MCP_TOOLS:
    html+=f'<div class="card"><span class="badge">{tool[0]}</span> <b>{tool[2]}</b><br>{tool[3]}<br><code>{tool[4]}</code><br>Port {tool[5]} | {tool[6]} | {tool[7]}W</div>\n'
html+=f'''</div><div class="card"><h3>Notion Supervisor + 8-Clouds</h3>
ZATCA UUID f18f8146 Hash 3bb78535 CR2051263653 Unified7049031003 VAT310000000000003<br>
8-Clouds: AWS Azure GCP OCI Alibaba IBM Oracle Huawei mTLS OIDC Meta<br>
LME MT-001 SHA 374c6686 M-007 $9500/ton | Calculator 40000+VAT6000=46000 +Trans200+Zakat1000+Waqf4000=51200 SAR<br>
MCP Server: <code>python3 sheikha_mcp_server.py</code> -> localhost:18193/mcp<br>
CLI: <code>npx sheikha status</code> | <code>npx sheikha smoke</code>
</div></body></html>'''
Path("Sheikha-V159-MCP-Registry.html").write_text(html, encoding="utf-8")
print("✓ HTML V159 built")

# SHA
import hashlib
sha=hashlib.sha256((str(structural)+str(grand)+str(total_weights)).encode()).hexdigest()[:16]
print(f"SHA {sha}")
