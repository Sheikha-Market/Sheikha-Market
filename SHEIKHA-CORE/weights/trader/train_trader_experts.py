# -*- coding: utf-8 -*-
import hashlib, json, time, os, pathlib
from pathlib import Path
base=Path(".")
reg_path=base/"SHEIKHA-CORE/blockchain/registry.json"
if not reg_path.exists():
    reg_path=base/"blockchain/registry.json"
registry=json.loads(reg_path.read_text(encoding='utf-8')) if reg_path.exists() else {}
def seal_weight(code,title,spec):
    payload=f"{code}:{title}:{spec}:{time.time()}:CR2051263653:BOUND_BY_QURAN_SUNNAH"
    h=hashlib.sha256(payload.encode()).hexdigest()
    entry={"code":code,"title":title,"spec":spec,"hash":h,"owner":"CR2051263653","seal":"BOUND_BY_QURAN_SUNNAH","ayah":"وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا","timestamp":int(time.time())}
    print(f"🔒 [TRADER-WEIGHT-SEALED] {code} -> {h[:16]}...")
    return entry

trader_defs=json.loads((base/"SHEIKHA-CORE/families/15_trader_science/trader_matrix.json").read_text(encoding='utf-8'))
new_weights={}
for d in trader_defs:
    e=seal_weight(d["code"],d["title"],d["spec"])
    new_weights[d["code"].lower()]=e
    registry[d["code"].lower()+"_expert"]=e

Path("SHEIKHA-CORE/blockchain/registry.json").write_text(json.dumps(registry,indent=2,ensure_ascii=False),encoding='utf-8')
print(f"✅ TRADER WEIGHTS SEALED: {len(trader_defs)} - Total registry: {len(registry)}")
