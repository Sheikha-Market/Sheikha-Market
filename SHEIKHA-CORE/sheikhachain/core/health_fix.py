import pathlib
p=pathlib.Path("SHEIKHA-CORE/blockchain/registry.json")
print(f"Registry exists: {p.exists()}")
# لا تستخدم glob مع f-string متداخل
