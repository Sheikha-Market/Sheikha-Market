import re, csv
from pathlib import Path
BASE=Path(".")
core=BASE/"sheikha_core_engine.py"
text=core.read_text(encoding="utf-8", errors="ignore")

csv_path=BASE/"exports"/"SHEIKHA_V158_703_STRUCTURAL_CHIEFS_MASTER.csv"
if not csv_path.exists():
    csv_path=sorted((BASE/"exports").glob("SHEIKHA_V15*.csv"), key=lambda x: x.stat().st_mtime)[-1]
rows=list(csv.DictReader(open(csv_path,"r",encoding="utf-8-sig")))
structural=len(rows)
grand=structural+5000
total_weights=sum(int(r.get("governed_weights") or 0) for r in rows)
total_nodes=sum(int(r.get("proliferated_m2m_nodes") or 0) for r in rows)
total_synaptic=sum(int(r.get("synaptic_links") or 0) for r in rows)
total_seed=sum(int(r.get("seed_m2m_agents") or 0) for r in rows)

print(f"Real CSV: {structural}/{grand}/{total_weights} Synaptic {total_synaptic} Nodes {total_nodes} Seed {total_seed}")

text=re.sub(r'"chief_directorates":\s*\d+', f'"chief_directorates": {structural}', text)
text=re.sub(r'"grand_total_chiefs":\s*\d+', f'"grand_total_chiefs": {grand}', text)
text=re.sub(r'"governed_weights_total":\s*\d+', f'"governed_weights_total": {total_weights}', text)
text=re.sub(r'"proliferated_m2m_total":\s*\d+', f'"proliferated_m2m_total": {total_nodes}', text)
text=re.sub(r'"synaptic_links":\s*\d+', f'"synaptic_links": {total_synaptic}', text)
text=re.sub(r'"seed_m2m_agents":\s*\d+', f'"seed_m2m_agents": {total_seed}', text)
text=re.sub(r'"department_directors":\s*\d+', f'"department_directors": {structural*6}', text)
text=re.sub(r'"specialized_staff":\s*\d+', f'"specialized_staff": {structural*24}', text)
text=re.sub(r'"grand":\s*10000', f'"grand": {grand}', text)
text=re.sub(r'"weights":\s*10000', f'"weights": {total_weights}', text)

if "/v158-network" not in text:
    text=text.replace('"/v157":', '"/v158-network": "Sheikha-V158-Network-Fabric.html",\n        "/v158-mcp": "Sheikha-V158-MCP-SDK.html",\n        "/v158-protocols": "Sheikha-V158-Protocols.html",\n        "/v158-executive": "Sheikha-V158-Executive-Report.html",\n        "/v157":')

core.write_text(text, encoding="utf-8")
print("✓ patched")
