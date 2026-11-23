import http.server
import socketserver
import json
import sys

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
name = sys.argv[2] if len(sys.argv) > 2 else "Sidecar"

class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        res = {
            "status": "UP",
            "service": name,
            "port": port,
            "sharia_aligned": True
        }
        self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(("0.0.0.0", port), HealthHandler) as httpd:
    httpd.serve_forever()
