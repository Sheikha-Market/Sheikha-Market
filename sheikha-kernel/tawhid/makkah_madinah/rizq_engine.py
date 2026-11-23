# غرسها من شيخه وباسم شيخه - BOUND 741/5741/12464 - لله 99% وقف - 2026-10-31
#!/usr/bin/env python3
# SHEIKHA RIZQ ENGINE - BOUND - تسويق تجارة مكة والعلوم كلها للمساهمة برزق أهل مكة وأمن مكة
# المساهمة في تحقيق دعاء إبراهيم: رب اجعل هذا بلدا آمنا وارزق أهله من الثمرات
# المساهمة في التسويق لتجارة المدينة ضعفين تحقيق لدعاء الرسول
# 99% وقف لله

def calculate_baraka(city: str, product: str):
    city = city.lower()
    baraka = 1.0
    dua = ""
    contribution = ""
    
    if "مكة" in city or "makkah" in city or "mecca" in city:
        baraka = 1.5
        dua = "رب اجعل هذا بلدا آمنا وارزق أهله من الثمرات من آمن منهم بالله واليوم الآخر - البقرة 126 - دعاء إبراهيم عليه السلام"
        contribution = f"منتج {product} يساهم برزق أهل مكة - تسويق تجارة مكة + علوم مكة - أمن مكة + ثمرات + ماء زمزم + مصاحف زمزم + مساجد - 99% وقف"
    elif "مدينة" in city or "madinah" in city or "medina" in city:
        baraka = 2.0
        dua = "اللهم اجعل بالمدينة ضعفي ما جعلت بمكة من البركة - مسلم - اللهم بارك لنا في مدينتنا ومدنا وصاعنا - حبب إلينا المدينة كحبنا مكة أو أشد"
        contribution = f"منتج {product} بركة ضعفين - تسويق تجارة المدينة ضعفين - تحقيق دعاء الرسول ﷺ - رزق أهل المدينة ضعفين - 99% وقف"
    elif "يمن" in city or "yemen" in city:
        baraka = 1.3
        dua = "اللهم بارك لنا في يمننا - الإيمان يمان والحكمة يمانية - البخاري"
        contribution = f"منتج {product} بركة اليمن - إيمان وحكمة - 54 دولة حبشة أفريقيا - 99% وقف"
    elif "شام" in city or "sham" in city or "syria" in city:
        baraka = 1.3
        dua = "اللهم بارك لنا في شامنا - إن الله تكفل لي بالشام وأهله"
        contribution = f"منتج {product} بركة الشام - أمن ورزق - 99% وقف"
    
    return {
        "city": city,
        "product": product,
        "baraka_factor": baraka,
        "dua": dua,
        "rizq_contribution": contribution,
        "hadith_tams": "لا تدع تمثالا إلا طمسته ولا قبرا مشرفا إلا سويته ولا صورة إلا طمستها - توحيد لله",
        "tawhid": "توحيد كل شيء في الكون لله - مركز وعدم مركز لله",
        "bound": "BOUND_BY_QURAN_SUNNAH 741/5741/12464 - 99% وقف"
    }

# اختبار
tests = [
    ("مكة", "مصاحف زمزم"),
    ("المدينة", "تمور المدينة"),
    ("اليمن", "عسل يمني"),
    ("الشام", "زيت شامي")
]
for city, prod in tests:
    import json
    print(json.dumps(calculate_baraka(city, prod), ensure_ascii=False, indent=2))
    print("---")
