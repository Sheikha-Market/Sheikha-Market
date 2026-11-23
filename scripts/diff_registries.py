import json, hashlib, pathlib
from datetime import datetime

base_path = pathlib.Path("SHEIKHA-CORE/blockchain/registry.json")
master_path = pathlib.Path("SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json")

def load_data(p):
    if not p.exists():
        return [], set(), "", 0
    data = json.loads(p.read_text(encoding="utf-8"))
    weights = data if isinstance(data, list) else data.get('weights', data.get('registry', []))
    if isinstance(weights, dict):
        weights = list(weights.values())
    ids = {w.get('id') or w.get('weight_id') for w in weights if isinstance(w, dict)}
    sha = hashlib.sha256(p.read_bytes()).hexdigest()
    return weights, ids, sha, len(weights)

base_w, base_ids, base_sha, base_len = load_data(base_path)
master_w, master_ids, master_sha, master_len = load_data(master_path)

in_master_not_base = sorted(list(master_ids - base_ids))
in_base_not_master = sorted(list(base_ids - master_ids))

report = {
    "generated_at": datetime.utcnow().isoformat() + "Z",
    "base": {"path": str(base_path), "sha256": base_sha, "count": base_len},
    "master": {"path": str(master_path), "sha256": master_sha, "count": master_len},
    "baseEqualsMaster": base_sha == master_sha,
    "inMasterNotBase": len(in_master_not_base),
    "inBaseNotMaster": len(in_base_not_master),
    "sample_diff_ids": in_master_not_base[:15]
}

pathlib.Path("diff_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✓ Base: {base_len} (SHA: {base_sha[:12]}...)")
print(f"✓ Master: {master_len} (SHA: {master_sha[:12]}...)")
print(f"✓ inMasterNotBase: {len(in_master_not_base)}")
print("✓ تم حفظ التقرير في diff_report.json")
