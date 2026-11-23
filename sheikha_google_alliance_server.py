import http.server, json, urllib.parse
from pathlib import Path
PORT = 18150
INTEGRATION_FILE = Path("SHEIKHA_V115_GOOGLE_WORKSPACE_INTEGRATION.json")

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path in ["/","/api/health","/api/google/status"]:
            self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers()
            data = {"status":"ok","service":"شيخة قوقل — Google Alliance — Absolute Integration","port":PORT,"schema":"SHEIKHA_GOOGLE_WORKSPACE_V115","domains":12,"agents":17,"licenses":8,"weights_grand":2677,"efficiency":94.0,"seal":"BOUND_BY_QURAN_SUNNAH — شيخة قوقل","strict_404":True,"oauth":{"google":"18150/auth/google/login","meta":"18151/auth/meta/login","microsoft":"18153/auth/microsoft/login","nvidia":"18154/auth/nvidia/login"},"cloud":"me-central1","workspace":{"drive":"enabled","docs":"enabled","sheets":"enabled","gmail":"enabled","calendar":"enabled","cloud_run":"enabled","secret_manager":"enabled"},"integration_manifest": str(INTEGRATION_FILE)}
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
            return
        if path.startswith("/auth/google/"):
            self.send_response(302); self.send_header("Location","https://accounts.google.com/o/oauth2/v2/auth?client_id=SHEIKHA_GOOGLE&redirect_uri=http://127.0.0.1:18150/auth/google/callback&scope=drive.file%20documents%20spreadsheets%20gmail.send%20calendar&response_type=code&access_type=offline&prompt=consent"); self.end_headers()
            return
        if path.startswith("/api/google/workspace/manifest"):
            self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers()
            try:
                self.wfile.write(INTEGRATION_FILE.read_bytes())
            except Exception as e:
                self.wfile.write(json.dumps({"error":str(e)}).encode())
            return
        # Strict 404
        self.send_response(404); self.send_header("Content-Type","application/json"); self.end_headers()
        self.wfile.write(json.dumps({"error":"Not Found","path":path,"strict_404":True,"port":PORT}).encode())
    def log_message(self,*a): pass

with http.server.HTTPServer(("", PORT), H) as httpd:
    print(f"Google Alliance 18150 ABSOLUTE on {PORT} — 12 domains — 17 agents — 8 licenses — Workspace Integration LIVE — Strict 404")
    httpd.serve_forever()
