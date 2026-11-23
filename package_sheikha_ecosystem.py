import zipfile
import hashlib
import json
import os
from pathlib import Path

print("================== 📦 تفعيل منظومة حزم شيخة السيادية (V64.9) ==================")

package_name = "SHEIKHA-SOVEREIGN-PACKAGE-V64.9.zip"
files_to_pack = [
    "SHEIKHA-CORE/blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json",
    "blockchain/lawh_mahfuz/LAWH_MAHFUZ_MASTER_REGISTRY.json",
    "server.js",
    "package.json"
]

# إضافة قاعدة البيانات الجغرافية إن وجدت
db_path = "/home/sheikha/sheikha-governance/portfolio-v1/engineering/sheikha-v63-geo-20261027/sheikha-geo-index-v63.2.sqlite3"
if os.path.exists(db_path):
    files_to_pack.append(db_path)

with zipfile.ZipFile(package_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in files_to_pack:
        if os.path.exists(f):
            arcname = os.path.basename(f)
            zipf.write(f, arcname=arcname)
            print(f"✓ تم تضمين الملف بالحزمة: {arcname}")

# حساب بصمة الحزمة المجمعة SHA-256
pkg_bytes = Path(package_name).read_bytes()
pkg_hash = hashlib.sha256(pkg_bytes).hexdigest()

print(f"\n✓ تم توليد الحزمة السيادية بنجاح: {package_name}")
print(f"✓ الحجم الإجمالي: {len(pkg_bytes) / 1024:.2f} KB")
print(f"✓ بصمة الحزمة التشفيرية SHA-256: {pkg_hash}")
print(f"✓ حالة الاعتماد: موثقة ومغلقة بختم الشريعة والحوكمة")
print("==============================================================================")
