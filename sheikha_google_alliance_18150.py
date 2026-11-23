import http.server
import socketserver
import json
import urllib.parse
from pathlib import Path

PORT = 18150

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class GoogleAllianceHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path in ("/api/health", "/health", "/api/alliance/google", "/api/google/workspace"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "service": "شيخة قوقل — Google Alliance — Absolute Integration",
                "port": PORT,
                "region": "me-central1",
                "project": "sheikha-sovereign-v115",
                "domains": 12,
                "agents": 17,
                "licenses": 8,
                "weights_grand": 2677,
                "efficiency": 94.0,
                "seal": "BOUND_BY_QURAN_SUNNAH"
            }, ensure_ascii=False).encode("utf-8"))
            return

        if path in ("/", "/index.html"):
            for cand in [
                Path.home() / "التنزيلات/Sheikha-V115-Google-Cloud(2).html",
                Path.home() / "التنزيلات/Sheikha-V115-Google-Cloud(1).html",
                Path.home() / "التنزيلات/Sheikha-V115-Google-Cloud.html"
            ]:
                if cand.exists():
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(cand.read_bytes())
                    return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write("<html dir='rtl'><h1>شيخة قوقل — Port 18150 LIVE</h1></html>".encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "NOT_FOUND", "http": 404, "port": PORT, "path": path}).encode("utf-8"))

    def log_message(self, *args):
        pass

with ReusableTCPServer(("127.0.0.1", PORT), GoogleAllianceHandler) as httpd:
    httpd.serve_forever()
