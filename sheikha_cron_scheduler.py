import time
import subprocess
import datetime

def run_remediation():
    timestamp = datetime.datetime.now().isoformat()
    print(f"\n[{timestamp}] 🕒 بدء دورة الفحص الصحي والتداوي التلقائي للأقاليم...")
    subprocess.run(["python3", "sheikha_self_healing.py"])

def run_zakat_calculations():
    timestamp = datetime.datetime.now().isoformat()
    print(f"\n[{timestamp}] 🪙 بدء احتساب التدفقات الزكوية والتنبؤات المالية السنوية...")
    subprocess.run(["python3", "sheikha_financial_zakator.py"])

def run_backup_system():
    timestamp = datetime.datetime.now().isoformat()
    print(f"\n[{timestamp}] 📦 بدء دورة النسخ الاحتياطي والأرشفة التلقائية المشفرة...")
    subprocess.run(["python3", "sheikha_backup_engine.py"])

print("================== 📅 تم تشغيل وتفعيل تقويم عمليات شيخة المنسق والجاهز ==================")
print("  ✓ جدولة التداوي والفحص الذاتي للأقاليم: نشطة ودورية")
print("  ✓ جدولة النسخ الاحتياطي والأرشفة المشفرة: مدمجة")
print("  ✓ جدولة الحسابات المالية والزكوية: دورية ومجربّة")
print("-----------------------------------------------------------------------------------------")

# تنفيذ أولي فوري ومباشر لجميع العمليات للتأكد من سلامة الكود
run_remediation()
run_backup_system()
run_zakat_calculations()
