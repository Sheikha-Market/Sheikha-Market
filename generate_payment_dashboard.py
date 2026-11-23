import json

html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>لوحة شفافية المعاملات والأجور لشيخة</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b132b; color: #ffffff; text-align: center; padding: 50px; }
        .container { background-color: #1c2541; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: inline-block; max-width: 600px; }
        h1 { color: #5bc0be; }
        .metric { font-size: 24px; margin: 20px 0; color: #6fffe9; }
        .evidence { font-style: italic; color: #a5a5a5; background-color: #0b132b; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🕌 بوابة مدفوعات وقنوات أجور شيخة الشفافة</h1>
        <hr style="border-color: #5bc0be;">
        <p class="metric">💰 قيمة المعاملة الإجمالية: $120,000 USD</p>
        <p class="metric">⚙️ الأجور الإدارية الثابتة (0.5%): $600 USD</p>
        <p class="metric">💵 صافي المبلغ للبائع: $119,400 USD</p>
        <div class="evidence">
            <p>📜 الدليل والمستند الشرعي المعزز للشفافية:</p>
            <p>«البَيِّعَانِ بِالخِيَارِ مَا لَمْ يَتَفَرَّقَا — البيع بالتراضي والإفصاح الكامل عن الأجور»</p>
        </div>
        <p style="color: #5bc0be; margin-top: 20px;">🔒 الحالة: معتمدة ومطابقة للشريعة الإسلامية بنسبة 100%</p>
    </div>
</body>
</html>
"""

# حفظ ملف الواجهة المرئية للشركاء
with open("sheikha_payments_dashboard.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("💾 تم توليد لوحة شفافية المعاملات التفاعلية بنجاح: sheikha_payments_dashboard.html")
