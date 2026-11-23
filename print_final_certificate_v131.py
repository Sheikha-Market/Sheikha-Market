import json
from pathlib import Path

cert_path = Path("SHEIKHA_V130_FINAL_29PORTS_CERTIFICATE.json")
cert = json.loads(cert_path.read_text(encoding="utf-8"))
cert["operational_decision_record"] = {
    "decision": "SCHEDULED_MONITORING_ACTIVE / FULL_LIVE_READINESS_HOLD",
    "SCHEDULED_MONITORING": "ACTIVE (25 Tasks | Latest Run: 2026-10-28)",
    "IMMEDIATE_RUN": "ACCEPTED_NOT_VERIFIED",
    "WORKSPACE_FULL_HEALTH": "NOT_PROVEN (Quota 10/5 | Independent Gmail/Sheets/Calendar R/W Required)",
    "VPS_24_7_GUARD": "LOCAL_SYSTEMD_GUARD_ENABLED",
    "AUTO_RECOVERY": "SANDBOX_VERIFIED_ONLY",
    "PRODUCTION_HOLD": "ACTIVE (NO_MERGE / NO_DEPLOY / NO_PRODUCTION)"
}
cert_path.write_text(json.dumps(cert, indent=2, ensure_ascii=False), encoding="utf-8")

summary = {k: v for k, v in cert.items() if k != "ports_detail"}
print(json.dumps(summary, indent=2, ensure_ascii=False))
total_p = len(cert["ports_detail"])
p200 = cert["api_200_passed"]
p404 = cert["strict_404_passed"]
print(f"\n✓ إجمالي المنافذ المفحوصة في الشهادة: {total_p} منفذاً | API 200: {p200} | Strict 404: {p404}")
