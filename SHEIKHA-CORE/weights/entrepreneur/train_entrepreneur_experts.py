# -*- coding: utf-8 -*-
import hashlib, json, time, pathlib
from pathlib import Path
base=Path(".")
reg_path=base/"SHEIKHA-CORE/blockchain/registry.json"
registry=json.loads(reg_path.read_text(encoding='utf-8'))
def seal_weight(code,title,spec):
    payload=f"{code}:{title}:{spec}:{time.time()}:CR2051263653"
    h=hashlib.sha256(payload.encode()).hexdigest()
    entry={"code":code,"title":title,"spec":spec,"hash":h,"owner":"CR2051263653","seal":"BOUND_BY_QURAN_SUNNAH","timestamp":int(time.time())}
    print(f"🔒 [ENTREPRENEUR-WEIGHT-SEALED] {code} -> {h[:16]}...")
    return entry

defs=json.loads((base/"SHEIKHA-CORE/families/16_entrepreneurship/entrepreneur_matrix.json").read_text(encoding='utf-8'))
for d in defs:
    e=seal_weight(d["code"],d["title"],d["spec"])
    registry[d["code"].lower()+"_expert"]=e

reg_path.write_text(json.dumps(registry,indent=2,ensure_ascii=False),encoding='utf-8')
print(f"✅ ENTREPRENEUR WEIGHTS SEALED: {len(defs)} - Total: {len(registry)}")
