import csv, pathlib
base = pathlib.Path("exports/SHEIKHA_V159_717_STRUCTURAL_CHIEFS_MASTER.csv")
rows = list(csv.DictReader(open(base, encoding="utf-8-sig")))
# إضافة 16
for i in range(16):
    chief_id = f"C-{265+i}"
    rows.append({
      "chief_id": chief_id,
      "structural_id": 717+i+1,
      "domain": f"MUKHALAFA-{i+1}",
      "name_ar": f"رئيس مخالفة اليهود والنصارى {i+1}",
      "name_en": f"Mukhalafa Chief {i+1}",
      "governed_weights": 1,
      "seed_m2m_agents": 16,
      "proliferated_m2m_nodes": 240,
      "synaptic_links": 3840,
      "seal": "BOUND_BY_QURAN_SUNNAH"
    })
out = pathlib.Path("exports/SHEIKHA_V161_733_STRUCTURAL_CHIEFS_MASTER.csv")
with open(out,"w",encoding="utf-8",newline="") as f:
    w=csv.DictWriter(f, fieldnames=rows[0].keys())
    w.writeheader(); w.writerows(rows)
print(f"✓ V161 CSV {out} -> {len(rows)} chiefs")
