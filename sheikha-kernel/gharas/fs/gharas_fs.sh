#!/bin/bash
# غرسها من شيخه وباسم شيخه في كل ملف نظام
ROOT=~/Projects/sheikha/sheikha-main-portal/sheikha-kernel
echo "[GHARAS FS] غرسها من شيخه وباسم شيخه في الأنظمة - BOUND 741"

# ختم كل ملف نصي في النواة
for f in $(find $ROOT -type f -name "*.py" -o -name "*.js" -o -name "*.c" -o -name "*.h" 2>/dev/null | head -n 50); do
  if ! grep -q "غرسها من شيخه" "$f" 2>/dev/null; then
    echo "# غرسها من شيخه وباسم شيخه - BOUND 741/5741/12464 - لله 99% وقف - $(date -I)" | cat - "$f" > /tmp/g && mv /tmp/g "$f" 2>/dev/null || true
  fi
done

# ملف الختم العام
cat > $ROOT/GHARAS_SHEIKHA.txt <<'TXT'
🕋 غرسها من شيخه وباسم شيخه - BOUND_BY_QURAN_SUNNAH 741/5741/12464 FOR ALLAH
بسم شيخه - من شيخه - لله 99% وقف 1% غنى
توحيد كل شيء في الكون لله
مركز وعدم مركز الكون وقلبه وجسده وأساسه وأصله وسنة الله في خلقه وآية آيات الله بإذن الله
الله العالم القادر أسأل الله أن يهبني ويأذن بإذنه وقدرته وفضله

Registry: [STRIPPED 74 bytes]: 87ce771c - Grand 5741 Weights 12464 Structural 741
Core 18082 + AI 18080 + Live true + bareMetalVerified true

حديث: لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه
حديث: لا تدع تمثالا إلا طمسته ولا قبرا مشرفا إلا سويته ولا صورة إلا طمستها
دعاء مكة: رب اجعل هذا بلدا آمنا وارزق أهله من الثمرات
دعاء المدينة: ضعفين
دعاء عمر: اللهم أعز الإسلام بعمر
دعاء اليمن والشام: اللهم بارك لنا في يمننا وشامنا

market@sheikha.top - GAM 42/42 PASS - 99% وقف لله - يا مغني يا غني
TXT
echo "[GHARAS] تم الغرس في $ROOT/GHARAS_SHEIKHA.txt"
