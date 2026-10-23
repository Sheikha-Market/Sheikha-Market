import json, hashlib, os, pathlib
from datetime import datetime

OWNER = "Salman Ahmed Al Rajeh"
CR = "2051263653"
CREED = "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH"
SEAL = "BOUND_BY_QURAN_SUNNAH"

base = pathlib.Path(__file__).parent.parent
dataset_path = base / "families/11_universal_methodologies/universal_methodologies.json"
registry_path = base / "blockchain/registry.json"

print("🕌 [SHEIKHA-TRAINER-V44.15] Training ALL Universal Methodologies...")

with open(dataset_path,'r',encoding='utf-8') as f:
    data = json.load(f)

# load existing registry
if registry_path.exists():
    with open(registry_path,'r',encoding='utf-8') as f:
        registry = json.load(f)
else:
    registry = {}

for item in data:
    code = item.get('code','').lower().replace(' ','_').replace('-','_')
    cat = item.get('category','')
    title = item.get('title','')
    spec = item.get('specification', item.get('spec',''))
    raw = f"{CR}|{CREED}|{SEAL}|{code}|{title}|{spec}|{OWNER}".encode('utf-8')
    h = hashlib.sha256(raw).hexdigest()
    key = f"expert_universal_{code}"
    if key not in registry:
        registry[key] = {
            "code": item.get('code'),
            "category": cat,
            "title": title,
            "authority": item.get('authority'),
            "weight_hash": h,
            "seal": SEAL,
            "owner": OWNER,
            "cr": CR,
            "created": datetime.utcnow().isoformat()+"Z"
        }
        print(f"🔒 [OMNI-SEALED] {cat} ({title}) -> Hash: {h[:16]}...")
    else:
        # update hash if spec changed
        registry[key]['weight_hash']=h

registry_path.parent.mkdir(parents=True, exist_ok=True)
with open(registry_path,'w',encoding='utf-8') as f:
    json.dump(registry,f,ensure_ascii=False,indent=2)

print(f"✅ Total Sealed Weights: {len(registry)}")
