import json, hashlib, pathlib, datetime
OWNER="Salman Ahmed Al Rajeh"
CR="2051263653"
SEAL="BOUND_BY_QURAN_SUNNAH"
CREED="LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH"
base=pathlib.Path(__file__).parent.parent

def load_json(p):
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else []

registry_path=base/"blockchain/registry.json"
registry=json.loads(registry_path.read_text(encoding='utf-8')) if registry_path.exists() else {}

datasets=[
    base/"families/12_sharia_sciences/quran_sunnah_matrix.json",
    base/"families/13_natural_sciences/natural_sciences_matrix.json"
]

count_before=len(registry)
for ds in datasets:
    data=load_json(ds)
    for item in data:
        code=item.get('code','').lower()
        title=item.get('title','')
        spec=item.get('spec','')
        raw=f"{CR}|{CREED}|{SEAL}|{code}|{title}|{spec}|{OWNER}".encode()
        h=hashlib.sha256(raw).hexdigest()
        key=f"expert_{code}"
        if key not in registry:
            print(f"🔒 [SHARIA-SCIENCE-SEALED] {code} ({title[:40]}) -> {h[:16]}...")
        registry[key]={
            "code": item.get('code'),
            "title": title,
            "authority": item.get('authority'),
            "weight_hash": h,
            "seal": SEAL,
            "creed": CREED,
            "owner": OWNER,
            "cr": CR,
            "domain": str(ds.parent.name),
            "created": datetime.datetime.utcnow().isoformat()+"Z"
        }

# علم شيخة الموحد نفسه كوزن نهائي
sheikha_science_path=base/"families/14_sheikha_unified_science/sheikha_unified_science.json"
sheikha_data=json.loads(sheikha_science_path.read_text(encoding='utf-8'))
for pillar in sheikha_data['pillars']:
    code=f"sheikha_pillar_{pillar['pillar']}_{pillar['name'][:10]}"
    raw=f"{CR}|{CREED}|{sheikha_data['integration_formula']}|{pillar['name']}|{OWNER}".encode()
    h=hashlib.sha256(raw).hexdigest()
    key=f"expert_sheikha_{pillar['pillar']}_{pillar['name'].split('-')[0].strip().lower().replace(' ','_')}"
    registry[key]={
        "code": f"SHEIKHA_PILLAR_{pillar['pillar']}",
        "title": pillar['name'],
        "weight_hash": h,
        "seal": SEAL,
        "creed": CREED,
        "owner": OWNER,
        "cr": CR,
        "pillar": pillar,
        "created": datetime.datetime.utcnow().isoformat()+"Z"
    }
    print(f"🌟 [SHEIKHA-SCIENCE-SEALED] Pillar {pillar['pillar']} {pillar['name']} -> {h[:16]}...")

# final unified weight
final_raw=f"{CR}|{CREED}|{SEAL}|SHEIKHA_UNIFIED_SCIENCE_FINAL|{sheikha_data['ayah']}|{OWNER}".encode()
final_hash=hashlib.sha256(final_raw).hexdigest()
registry["expert_sheikha_unified_final"]={
    "code":"SHEIKHA_UNIFIED_SCIENCE",
    "title":"علم شيخة لإعمار السماوات والأرض وما بينهما",
    "ayah": sheikha_data['ayah'],
    "formula": sheikha_data['integration_formula'],
    "weight_hash": final_hash,
    "seal": "ATOM_WATER_RASUL_JANNAH_SEALED",
    "creed": CREED,
    "owner": OWNER,
    "cr": CR,
    "experts_total": len(registry),
    "created": datetime.datetime.utcnow().isoformat()+"Z"
}

registry_path.write_text(json.dumps(registry,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"\n✅ SHEIKHA UNIFIED SCIENCE SEALED - Before: {count_before} After: {len(registry)} - New: {len(registry)-count_before}")
print(f"✅ Final Hash: {final_hash}")
