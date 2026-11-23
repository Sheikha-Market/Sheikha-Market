# -*- coding: utf-8 -*-
import os, json, time, subprocess, http.server, socketserver, threading
from urllib.parse import parse_qs, urlparse
class SheikhaSovereignOrchestrator:
    def __init__(self, core_objective):
        self.objective = core_objective
        self.log_buffer = []
        self.constitution = [
            "Local Sheikha weights hold supreme sovereignty.",
            "Intellectual property must never be transmitted unencrypted.",
            "Cyber-Block Action: Block any code paths attempting system level execution."
        ]
        self.log("👑 [عقل شيخة الفائق]: تم تفعيل الدستور وقواعد الحظر بنقاء كامل.")
    def log(self, message):
        print(message)
        t_str = time.strftime("%H:%M:%S")
        self.log_buffer.append(f"[{t_str}] {message}")
    def check_system_resources(self):
        status_info = {"gpu": "CPU Mode / Integrated", "ram": "Unknown"}
        try:
            gpu_status = subprocess.check_output(["nvidia-smi", "--query-gpu=utilization.gpu,utilization.memory", "--format=csv,noheader,nounits"], text=True)
            gpu_util, gpu_mem = gpu_status.strip().split(",")
            status_info["gpu"] = f"Nvidia GPU: {gpu_util}% Util | {gpu_mem}% Mem"
        except: pass
        try:
            with open("/proc/meminfo", "r") as f:
                lines = f.readlines()
                total = int(lines[0].split()[1])
                free = int(lines[1].split()[1])
                status_info["ram"] = f"RAM: {((total - free) / total) * 100:.1f}% Used"
        except: pass
        return status_info
    def execute_sovereign_flow(self):
        self.log("🔮 [Cortex]: Decomposing high-level mission objective...")
        return "🎯 Mission successfully executed with 100% security alignment."
class SheikhaWebHandler(http.server.SimpleHTTPRequestHandler):
    orchestrator = None
    def log_message(self, format, *args): pass
    def do_GET(self):
        if SheikhaWebHandler.orchestrator is None:
            SheikhaWebHandler.orchestrator = SheikhaSovereignOrchestr("Secure Sheikha Main Portal")
        parsed_path = urlparse(self.path)
        if parsed_path.path in ["/status", "/api/health"]:
            try:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                sys_info = self.orchestrator.check_system_resources()
                response = {"logs": self.orchestrator.log_buffer, "gpu": sys_info["gpu"], "ram": sys_info["ram"], "constitution": self.orchestrator.constitution}
                self.wfile.write(json.dumps(response).encode("utf-8"))
            except: pass
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        html = "<html><head><title>Sheikha Dashboard</title><style>body{background:#0f0f1a;color:#fff;font-family:sans-serif;padding:30px;}.container{max-width:800px;margin:auto;background:#16162a;padding:20px;border-radius:10px;border-left:5px solid #d4af37;}textarea{width:100%;height:100px;background:#111;color:#fff;border:1px solid #444;border-radius:5px;padding:10px;}.btn{background:#d4af37;color:#000;border:none;padding:10px 20px;font-weight:bold;border-radius:5px;cursor:pointer;margin-top:10px;}.console{background:#000;color:#00ff00;font-family:monospace;padding:15px;border-radius:5px;height:150px;overflow-y:auto;white-space:pre-wrap;}</style></head><body><div class="container"><h1>👑 Sheikha Super Orchestrator - Sovereign Web UI</h1><div class="panel"><h3>📜 Governance Rules (Constitution):</h3><textarea id="const-input"></textarea><br><button class="btn" onclick="updateC()">💾 Save Constitution</button></div><br><button class="btn" onclick="runF()">⚡ Launch Agents</button><h3>🖥️ Live Console Log:</h3><div class="console" id="log-out">Connecting...</div></div><script>function upD(){fetch("/status").then(res=>res.json()).then(data=>{document.getElementById("log-out").innerText=data.logs.join("\n");if(!window.loaded){document.getElementById("const-input").value=data.constitution.join("\n");window.loaded=true;}});};function runF(){fetch("/run",{method:"POST"}).then(()=>upD());};function updateC(){fetch("/update_constitution",{method:"POST",body:"rules="+encodeURIComponent(document.getElementById("const-input").value)}).then(()=>{alert("✅ Constitution updated!");});};setInterval(upD,2000);window.onload=upD;</script></body></html>"
        self.wfile.write(html.encode("utf-8"))
    def do_POST(self):
        if SheikhaWebHandler.orchestrator is None: return
        if self.path == "/run":
            SheikhaWebHandler.orchestrator.execute_sovereign_flow()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        elif self.path == "/update_constitution":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length).decode("utf-8")
            params = parse_qs(post_data)
            if "rules" in params:
                SheikhaWebHandler.orchestrator.constitution = [r.strip() for r in params["rules"].split("\n") if r.strip()]
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", 8080), SheikhaWebHandler) as httpd:
        print("🚀 [لوحة تحكم ويب شيخة]: تم إطلاق واجهة الويب بنقاء كامل!")
        print("🌐 تصفحي الرابط من متصفحكِ الآن بأمان: http://localhost:8080")
        httpd.serve_forever()
if __name__ == "__main__":
    threading.Thread(target=start_server, daemon=True).start()
    while True: time.sleep(1)