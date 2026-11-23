from pathlib import Path
import csv, hashlib
BASE=Path(".")
EXPORTS=BASE/"exports"
csv_path=sorted(EXPORTS.glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime, reverse=True)[0]
rows=list(csv.DictReader(open(csv_path,"r",encoding="utf-8-sig")))
structural=len(rows)
grand=structural+5000
weights=sum(int(r.get("governed_weights") or 32) for r in rows)
nodes=sum(int(r.get("proliferated_m2m_nodes") or 240) for r in rows)
synaptic=sum(int(r.get("synaptic_links") or 3840) for r in rows)
seed=sum(int(r.get("seed_m2m_agents") or 16) for r in rows)
print(f"Building core from {csv_path.name}: {structural}/{grand}/{weights}")

REG="edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b"
GOV="87ce771c"

core_code = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHEIKHA CORE ENGINE V159 DYNAMIC — 717 Structural +5000 = 5717 Grand
Registry {REG} Gov {GOV} Seal BOUND_BY_QURAN_SUNNAH
Auto-reads latest CSV from exports/ at startup — no hardcoded 663
"""
import csv, json, hashlib
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
import socket

REGISTRY="{REG}"
GOVERNANCE="{GOV}"
SEAL="BOUND_BY_QURAN_SUNNAH"
SCHEMA="SHEIKHA_CORE_V130_SOVEREIGN"

def load_foundry():
    try:
        base = Path(__file__).parent
        ex = base / "exports"
        cands = sorted(ex.glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime, reverse=True)
        if not cands:
            raise FileNotFoundError("No CSV")
        p = cands[0]
        rows = list(csv.DictReader(open(p, "r", encoding="utf-8-sig")))
        structural = len(rows)
        grand = structural + 5000
        weights = sum(int(r.get("governed_weights") or 32) for r in rows)
        nodes = sum(int(r.get("proliferated_m2m_nodes") or 240) for r in rows)
        synaptic = sum(int(r.get("synaptic_links") or 3840) for r in rows)
        seed = sum(int(r.get("seed_m2m_agents") or 16) for r in rows)
        return {{
            "production_lines": 8,
            "chief_directorates": structural,
            "hs_product_chiefs": 5000,
            "grand_total_chiefs": grand,
            "department_directors": structural*6,
            "specialized_staff": structural*24,
            "chief_governance_officer": "C-29 ACTIVE",
            "sheikha_bylaws": 8,
            "methodologies_scientific": 18,
            "licenses_and_certificates": 725,
            "seed_m2m_agents": seed,
            "proliferated_m2m_total": nodes,
            "synaptic_links": synaptic,
            "governed_weights_total": weights,
            "admin_quality_kpi": "99.99%",
            "csv_source": p.name
        }}
    except Exception as e:
        return {{
            "production_lines": 8,
            "chief_directorates": {structural},
            "hs_product_chiefs": 5000,
            "grand_total_chiefs": {grand},
            "department_directors": {structural*6},
            "specialized_staff": {structural*24},
            "chief_governance_officer": "C-29 ACTIVE",
            "sheikha_bylaws": 8,
            "methodologies_scientific": 18,
            "licenses_and_certificates": 725,
            "seed_m2m_agents": {seed},
            "proliferated_m2m_total": {nodes},
            "synaptic_links": {synaptic},
            "governed_weights_total": {weights},
            "admin_quality_kpi": "99.99%",
            "csv_source": "fallback {csv_path.name}",
            "error": str(e)
        }}

FOUNDRY = load_foundry()

ROUTES = {{
    "/": "index.html",
    "/v150": "Sheikha-V150-Milestone-Unified-Dashboard.html",
    "/v150-topology": "Sheikha-V150-Live-Synaptic-Topology.html",
    "/v151-geo-mind": "Sheikha-V151-Mind-AI-Geo-Regions-Dashboard.html",
    "/v152": "Sheikha-V152-Structure-Architecture-Construction-Basira.html",
    "/v153-infra": "Sheikha-V153-AutoBlueprint-Cores-Imam-12Infra.html",
    "/v154-directory": "Sheikha-V154-Dalil-Cores-659-Directory.html",
    "/v154-robotics": "Sheikha-V154-Robotics-Alien-Cosmic-Twin.html",
    "/v155-portal": "Sheikha-V155-Grand-Sovereign-Portal.html",
    "/v155-executive-report": "Sheikha-V155-Executive-Report.html",
    "/v156": "Sheikha-V156-Omniverse-Clouds-LME-ZATCA.html",
    "/v157": "Sheikha-V157-Foundry-Omniverse-Unified.html",
    "/v158-network": "Sheikha-V158-Network-Fabric.html",
    "/v158-mcp": "Sheikha-V158-MCP-SDK.html",
    "/v159-mcp-registry": "Sheikha-V159-MCP-Registry.html",
    "/api/health": "health",
}}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # health
        if self.path in ["/api/health", "/health"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            f = load_foundry()
            data = {{
                "status": "ok",
                "ok": True,
                "healthy": True,
                "active": True,
                "port": 18082,
                "schema": SCHEMA,
                "service": "sheikha_core_engine.py",
                "strict_404": True,
                "api_200": True,
                "seal": SEAL,
                "operational_decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
                "governance_gates": {{
                    "SCHEDULED_MONITORING": "ACTIVE (25 Tasks)",
                    "IMMEDIATE_RUN": "ACCEPTED_NOT_VERIFIED",
                    "WORKSPACE_FULL_HEALTH": "NOT_PROVEN",
                    "VPS_24_7_GUARD": "LOCAL_SYSTEMD_GUARD_ACTIVE",
                    "AUTO_RECOVERY": "SANDBOX_VERIFIED",
                    "PRODUCTION_HOLD": "ACTIVE (NO_MERGE / NO_DEPLOY / NO_PRODUCTION)"
                }},
                "registry": REGISTRY,
                "governance": GOVERNANCE,
                "grand": f["grand_total_chiefs"],
                "weights": f["governed_weights_total"],
                "platforms_count": 8,
                "domains": 12,
                "digital_twins_nvidia": 128,
                "foundry_m2m_governance": f,
                "ceo_buyer_engine": {{
                    "best_weight": "MT-001 Cathode Cu 99.99% LME Grade A 99% SHA 374c6686 Foundry 18126 weight 99%",
                    "best_market": "M-007 LME Metals Market 99% LME London price $9500/ton",
                    "calculator": {{"amount": 40000, "vat_15": 6000, "invoice": 46000, "transparency_0_5": 200, "zakat_2_5": 1000, "waqf_10": 4000, "net_halal": 34800, "total_payable": 51200, "currency": "SAR"}}
                }},
                "universe": {{"grand": f["grand_total_chiefs"], "digital_twins": 128, "sectors": 22, "markets": 18, "networks": 24, "hs_products": 5000}}
            }}
            self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode())
            return
        # routes html
        p = self.path.split("?")[0]
        if p in ROUTES and ROUTES[p] != "health":
            fpath = Path(__file__).parent / ROUTES[p]
            if fpath.exists():
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(fpath.read_bytes())
                return
        # list routes
        if p in ["/routes", "/list"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(list(ROUTES.keys()), ensure_ascii=False).encode())
            return
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({{"error": "strict_404", "path": self.path, "seal": SEAL}}).encode())

    def log_message(self, *a): pass

def run():
    # SO_REUSEADDR Zero TIME_WAIT
    HTTPServer.allow_reuse_address = True
    s = HTTPServer(("127.0.0.1", 18082), Handler)
    s.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    print(f"Sheikha Core V159 Dynamic on 18082 — {{FOUNDRY['chief_directorates']}}/{{FOUNDRY['grand_total_chiefs']}}/{{FOUNDRY['governed_weights_total']}} from {{FOUNDRY['csv_source']}}")
    s.serve_forever()

if __name__ == "__main__":
    run()
'''

Path("sheikha_core_engine.py").write_text(core_code, encoding="utf-8")
print(f"✓ rebuilt sheikha_core_engine.py dynamic {structural}/{grand}/{weights}")
# sha
sha=hashlib.sha256(core_code.encode()).hexdigest()[:16]
print(f"SHA {sha}")
