import http.server, json
from pathlib import Path

PORT = 18141
SERVICE = "sheikha_zakat_ledger.py"
ROLE = "Zakat 8-Masarif Ledger"

HTML_ROUTES = {
    "/v121": "Sheikha-V121-Zatca-Phase2.html",
    "/v122": "Sheikha-V122-Sheikha-Sa.html",
    "/v123": "Sheikha-V123-Mining-Scrap.html",
    "/v124": "Sheikha-V124-Universal-All.html",
    "/v125": "Sheikha-V125-18164-Ceo.html",
    "/supervisor": "Sheikha-Supervisor-Report-V125.html",
    "/v127": "Sheikha-V127-18165-Universe.html",
}

ALLOWED_JSON = {
    "/", "/health", "/status", "/api/health", "/api/status",
    "/api/v1/status", "/api/sheikha-sa/status", "/api/commerce/charity/status",
    "/api/ceo/buyer/status", "/api/ceo/buyer/ask", "/api/zatca/status",
    "/api/hosting/status", "/api/competency/agents", "/api/universe/domains",
    "/api/governance/watch", "/api/universe/matrix", "/metrics"
}

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in HTML_ROUTES:
            html_file = Path(HTML_ROUTES[path])
            if html_file.exists():
                data = html_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        if path in ALLOWED_JSON:
            payload = {
                "status": "ok",
                "schema": "SHEIKHA_V127_UNIVERSE_GRAND_10000",
                "port": PORT,
                "service": SERVICE,
                "role": ROLE,
                "api_200": True,
                "strict_404": True,
                "domain": "sheikha.sa",
                "cr": "2051263653",
                "unified": "7049031003",
                "vat": "310000000000003",
                "zatca_phase2": "READY",
                "zatca_uuid": "f18f8146-3bb7-8535-sheikha",
                "zatca_hash": "3bb78535cc9555ff",
                "registry": "edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b",
                "governance": "87ce771c",
                "grand": 10000,
                "digital_twins_nvidia": 128,
                "foundry_licenses": 56,
                "ceo_buyer_engine": {
                    "best_weight": "MT-001 Cathode Cu 99.99% LME Grade A 99% SHA 374c6686 Foundry 18126 weight 99%",
                    "best_market": "M-007 LME Metals Market 99% LME London price $9500/ton",
                    "calculator": {
                        "amount": 40000,
                        "vat_15": 6000,
                        "invoice": 46000,
                        "transparency_0_5": 200,
                        "zakat_2_5": 1000,
                        "waqf_10": 4000,
                        "net_halal": 34800,
                        "total_payable": 51200,
                        "currency": "SAR"
                    }
                },
                "seal": "BOUND_BY_QURAN_SUNNAH — PRODUCTION_HOLD ACTIVE — REVIEW_ONLY"
            }
            raw = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
        else:
            err = json.dumps({"error": "Not Found", "strict_404": True, "port": PORT}).encode("utf-8")
            self.send_response(404)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(err)))
            self.end_headers()
            self.wfile.write(err)

if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
