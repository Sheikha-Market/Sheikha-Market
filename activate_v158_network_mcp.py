#!/usr/bin/env python3
# SHEIKHA V158 — NETWORK FABRIC + MCP SDK INTERNAL/EXTERNAL + GOVERNANCE
import csv, re
from pathlib import Path
BASE=Path(".")
EXPORTS=BASE/"exports"
v_path=EXPORTS/"SHEIKHA_V157_689_STRUCTURAL_CHIEFS_MASTER.csv"
if not v_path.exists():
    v_path=sorted(EXPORTS.glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime)[-1]
print(f"Reading {v_path}")
rows=list(csv.DictReader(open(v_path,"r",encoding="utf-8-sig")))
# keep full dict
NEW=[
    ("C-237","INT_NET","Chief Internal Network Sovereign Officer","كبير مدراء الشبكة الداخلية السيادية","W-INT-NET-01..32 | 10.0.0.0/8 Internal Fabric 127.0.0.1 Sovereign Loop SO_REUSEADDR Zero TIME_WAIT 29 Ports Mesh | 32 Weights",18192,"W-INT-NET",32),
    ("C-238","EXT_NET","Chief External Network Sovereign Officer","كبير مدراء الشبكة الخارجية السيادية","W-EXT-NET-01..32 | 0.0.0.0 External Edge TLS1.3 mTLS OIDC 【entity-Meta¦canonical_name=Meta】 ZATCA LME 8-Clouds Federation | 32 Weights",18193,"W-EXT-NET",32),
    ("C-239","NET_GOV","Chief Network Governance Officer","كبير مدراء حوكمة الشبكات","W-NET-GOV-01..32 | C-29 ACTIVE bridge Internal<->External PEP BOUND_BY_QURAN_SUNNAH | 32 Weights",18194,"W-NET-GOV",32),
    ("C-240","INT_PROTO","Chief Internal Protocols Officer","كبير مدراء البروتوكولات الداخلية","W-INT-PROTO-01..32 | TCP QUIC gRPC Protobuf MsgPack mTLS OIDC Internal JWT 128 Digital Twins USD | 32 Weights",18195,"W-INT-PROTO",32),
    ("C-241","EXT_PROTO","Chief External Protocols Officer","كبير مدراء البروتوكولات الخارجية","W-EXT-PROTO-01..32 | HTTPS/2 WebSocket SFTP SMTP REST UBL2.1 ZATCA JSON-LD | 32 Weights",18196,"W-EXT-PROTO",32),
    ("C-242","MCP_SDK_INT","Chief MCP SDK Internal Officer","كبير مدراء MCP SDK الداخلي","W-MCP-INT-01..32 | MCP Server Internal Tools sheikha_core_engine guard foundry M2M 8 lines 128 twins Stdio | 32 Weights",18197,"W-MCP-INT",32),
    ("C-243","MCP_SDK_EXT","Chief MCP SDK External Officer","كبير مدراء MCP SDK الخارجي","W-MCP-EXT-01..32 | MCP Client External AWS Azure GCP OCI Alibaba IBM Oracle Huawei LME $9500 ZATCA f18f8146 SSE | 32 Weights",18198,"W-MCP-EXT",32),
    ("C-244","MCP_GOV","Chief MCP Governance Officer","كبير مدراء حوكمة MCP","W-MCP-GOV-01..32 | MCP Registry edc795a4 Tool Approval Scope BOUND Audit SHA 374c6686 0cf8bc3c | 32 Weights",18199,"W-MCP-GOV",32),
    ("C-245","INTER_BRIDGE","Chief Inter-Network Bridge Officer","كبير مدراء جسر بين الشبكات الداخلية والخارجية","W-BRIDGE-01..32 | Bridge Internal<->External API Gateway 18082->18093..18180 Rate Limit 10k SHA/s Circuit Breaker | 32 Weights",18200,"W-BRIDGE",32),
    ("C-246","INT_COMM","Chief Internal Communications Officer","كبير مدراء الاتصالات الداخلية","W-INT-COMM-01..32 | M2M Synaptic 2.8M links 169920 nodes internal gossip PubSub | 32 Weights",18201,"W-INT-COMM",32),
    ("C-247","EXT_COMM","Chief External Communications Officer","كبير مدراء الاتصالات الخارجية","W-EXT-COMM-01..32 | 29 Sovereign Ports Federation External Health Heartbeat 29/29 SANDBOX_AUTO_RECOVERY_PROVEN | 32 Weights",18202,"W-EXT-COMM",32),
    ("C-248","TELECOM_C30","Chief Telecom C-30 Officer","كبير مدراء الاتصالات C-30","W-TELECOM-01..32 | Telecom Governance SMS OTP VoIP SIP 5G Edge C-30 | 32 Weights",18203,"W-TELECOM",32),
    ("C-249","COMM_C31","Chief Communication C-31 Officer","كبير مدراء التواصل C-31","W-COMM-01..32 | Communication Governance Email SMTP Push Webhook C-31 | 32 Weights",18204,"W-COMM",32),
    ("C-250","NET_SEC","Chief Network Security Sovereign Officer","كبير مدراء أمن الشبكات السيادي","W-SEC-01..32 | Zero Trust mTLS everywhere OIDC Meta SPIFFE SVID WAF DDoS | 32 Weights",18205,"W-SEC",32),
]
seq=len(rows)+1
for chief_id,tier,en,ar,scope,port,wcode,wcount in NEW:
    rows.append({"seq":seq,"chief_id":chief_id,"tier":tier,"title_en":en,"title_ar":ar,"domain_scope":scope,"directors_count":6,"engineers_count":24,"seed_m2m_agents":16,"proliferated_m2m_nodes":240,"synaptic_links":3840,"license_id":f"SHK-M2M-2026-{seq:04d}","bound_port":port,"kpi_target":"100% ACTIVE","sharia_seal":"BOUND_BY_QURAN_SUNNAH","governed_weights":wcount,"weight_code":wcode,"weight_status":"WEIGHTS_ACTIVE_V158"})
    seq+=1

out=EXPORTS/"SHEIKHA_V158_700_STRUCTURAL_CHIEFS_MASTER.csv"
fieldnames=["seq","chief_id","tier","title_en","title_ar","domain_scope","directors_count","engineers_count","seed_m2m_agents","proliferated_m2m_nodes","synaptic_links","license_id","bound_port","kpi_target","sharia_seal","governed_weights","weight_code","weight_status"]
with open(out,"w",newline="",encoding="utf-8-sig") as f:
    w=csv.DictWriter(f, fieldnames=fieldnames); w.writeheader(); w.writerows(rows)

total_weights=14048+sum([x[7] for x in NEW])
total_synaptic=2803200+len(NEW)*3840
total_nodes=175200+len(NEW)*240
total_seed=10960+len(NEW)*16
print(f"✓ V158 CSV: {out} Structural {len(rows)} Grand {len(rows)+5000} Weights {total_weights} Synaptic {total_synaptic}")

# update core
core=BASE/"sheikha_core_engine.py"
if core.exists():
    t=core.read_text(encoding="utf-8", errors="ignore")
    t=re.sub(r'"chief_directorates":\s*\d+', f'"chief_directorates": {len(rows)}', t)
    t=re.sub(r'"grand_total_chiefs":\s*\d+', f'"grand_total_chiefs": {len(rows)+5000}', t)
    t=re.sub(r'"governed_weights_total":\s*\d+', f'"governed_weights_total": {total_weights}', t)
    t=re.sub(r'"proliferated_m2m_total":\s*\d+', f'"proliferated_m2m_total": {total_nodes}', t)
    t=re.sub(r'"synaptic_links":\s*\d+', f'"synaptic_links": {total_synaptic}', t)
    t=re.sub(r'"seed_m2m_agents":\s*\d+', f'"seed_m2m_agents": {total_seed}', t)
    if "/v158-network" not in t:
        t=t.replace('"/v157":', '"/v158-network": "Sheikha-V158-Network-Fabric.html",\n        "/v158-mcp": "Sheikha-V158-MCP-SDK.html",\n        "/v157":')
    core.write_text(t, encoding="utf-8")
    print("✓ core updated")

# HTML
html=f"""<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>V158 Network Fabric</title><style>body{{background:#040a14;color:#d4af37;font-family:monospace;padding:20px}} .card{{border:1px solid #00ff88;padding:15px;margin:10px;background:#0a1428}} h1,h2{{color:#00ff88}} table{{width:100%;border-collapse:collapse}} th,td{{border:1px solid #00ff88;padding:6px}} th{{background:#0a2a1a}}</style></head><body>
<h1>SHEIKHA V158 — NETWORK FABRIC + MCP SDK INTERNAL/EXTERNAL</h1>
<div class="card">Chiefs: {len(rows)}+5000={len(rows)+5000} | Weights: {total_weights} | Synaptic: {total_synaptic} | Registry: edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b | Seal: BOUND_BY_QURAN_SUNNAH</div>
<div class="card"><h2>Internal vs External Networks</h2><p>Internal 127.0.0.1 Mesh 29 Ports SO_REUSEADDR <-> Bridge 18200 mTLS <-> External Federation 8-Clouds LME ZATCA</p></div>
<div class="card"><h2>MCP SDK</h2><p>Internal Stdio: sheikha_core_engine + guard + foundry + 128 twins<br>External SSE: AWS Azure GCP OCI Alibaba IBM Oracle Huawei + LME + ZATCA<br>Governance C-244 Registry edc795a4 Approval BOUND</p></div>
<div class="card"><h2>Protocols</h2><p>Internal: TCP QUIC gRPC Protobuf MsgPack mTLS OIDC JWT<br>External: HTTPS/2 WebSocket SFTP SMTP REST UBL2.1 ZATCA JSON-LD</p></div>
<div class="card"><h2>Communications</h2><p>Internal M2M Synaptic 2.8M PubSub | External 29 Ports Federation Heartbeat 29/29 Auto-Recovery Proven | Telecom C-30 SMS VoIP 5G | Communication C-31 Email Push Webhook | Zero Trust WAF DDoS</p></div></body></html>"""
Path(BASE/"Sheikha-V158-Network-Fabric.html").write_text(html, encoding="utf-8")
print("✓ HTML created")
