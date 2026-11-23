import json, hashlib, datetime
from pathlib import Path

DEFAULT_LICENSES = [
    ("SHK-W-2026-0001", "Supply Gateway - Aramco", 78, 96, 95),
    ("SHK-W-2026-0002", "Supply Gateway - SABIC", 76, 96, 95),
    ("SHK-W-2026-0003", "Logistics Network - Maersk/DHL", 72, 92, 90),
    ("SHK-W-2026-0004", "Commerce Apps - Shopify", 70, 92, 90),
    ("SHK-W-2026-0005", "University Lab - KFUPM", 74, 92, 90),
    ("SHK-W-2026-0006", "Cloud & AI Exchange - Microsoft/AWS/Google", 80, 97, 90),
    ("SHK-W-2026-0007", "Digital Industry - NVIDIA", 75, 93, 90),
    ("SHK-W-2026-0008", "Governance & Licensing - Monshaat/CST/SDAIA", 76, 94, 90),
]

checks_dir = Path("governance/drafts/checks")
checks_dir.mkdir(parents=True, exist_ok=True)

self_weights = []
for lic_id, cat, base_w, def_eff, target_eff in DEFAULT_LICENSES:
    chk_file = checks_dir / f"{lic_id}.json"
    curr_eff = def_eff
    if chk_file.exists():
        try:
            d = json.loads(chk_file.read_text(encoding="utf-8"))
            curr_eff = min(int(d.get("current_efficiency", def_eff)), 100)
        except Exception:
            pass
    self_w = base_w + int((curr_eff - base_w) * 1.5) + 5
    self_weights.append({
        "license_id": lic_id,
        "category": cat,
        "base_weight": base_w,
        "current_efficiency": curr_eff,
        "target_efficiency": target_eff,
        "self_building_weight": self_w,
        "sha": hashlib.sha256(f"{lic_id}:{curr_eff}:{self_w}".encode()).hexdigest()[:16],
        "mechanism": "BOUND_BY_QURAN_SUNNAH — تعلم مباشر وتوثيق لحظي",
        "bot_id": f"BOT-{lic_id[-4:]}",
        "agent_id": f"AGT-{lic_id[-4:]}"
    })

avg_eff = round(sum(x["current_efficiency"] for x in self_weights) / len(self_weights), 2)
avg_sw = round(sum(x["self_building_weight"] for x in self_weights) / len(self_weights), 2)
grand_sw = sum(x["self_building_weight"] for x in self_weights)

payload = {
    "schema": "SHEIKHA_V120_SELF_BUILDING_WEIGHTS",
    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "seal": "BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED",
    "count": len(self_weights),
    "average_efficiency": avg_eff,
    "average_self_weight": avg_sw,
    "self_weights_grand": grand_sw,
    "v105_grand": 2677,
    "weights": self_weights
}
raw = json.dumps(payload, ensure_ascii=False, indent=2)
payload["sha_fingerprint"] = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

Path("SHEIKHA_V115_SELF_BUILDING_WEIGHTS.json").write_text(
    json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"✓ تم بناء سجل الأوزان الذاتية (8/8) — متوسط الكفاءة: {avg_eff}% | إجمالي الأوزان الذاتية: {grand_sw} | SHA: {payload['sha_fingerprint']}")
