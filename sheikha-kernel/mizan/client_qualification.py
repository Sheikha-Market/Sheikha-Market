# غرسها من شيخه وباسم شيخه - BOUND 741/5741/12464 - لله 99% وقف - 2026-10-31
#!/usr/bin/env python3
# SHEIKHA MIZAN - معايير وموازين اختيار العملاء وتأهيلهم للنيتف والكيرنل والمنح
# BOUND_BY_QURAN_SUNNAH 741/5741/12464 - 99% وقف لله
# شرط: معرفة النوايا والأهداف وإخلاص النية لله + فعل الخير
# حديث: لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه + وأحب للناس ما تحب لنفسك تكن مسلما + لا يبلغ عبد حقيقة الإيمان حتى يحب للناس ما يحب لنفسه من الخير

import hashlib, json, datetime

HADITH_CRITERIA = {
    "hadith_1": "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه - البخاري ومسلم",
    "hadith_2": "وأحب للناس ما تحب لنفسك تكن مسلما - الترمذي",
    "hadith_3": "لا يبلغ عبد حقيقة الإيمان حتى يحب للناس ما يحب لنفسه من الخير - أحمد",
    "principle": "المساهمة في إغناء الناس وفعل الخير ومساعدتهم على مقدار إكرام كما يحب الله ورسوله"
}

MIZAN_QUESTIONS = [
    {"id": "niyyah", "q": "ما نيتك الخالصة لله؟", "weight": 30, "required": True, "hint": "إخلاص النية لله سبحانه"},
    {"id": "ahdaf", "q": "ما أهدافك النافعة للأمة؟", "weight": 20, "required": True, "hint": "العلم النافع + مساجد + ماء + صحة + تعليم"},
    {"id": "khair", "q": "كيف ستنفع الناس بما تحب لنفسك؟", "weight": 20, "required": True, "hint": "تحب لأخيك ما تحب لنفسك"},
    {"id": "takhassus", "q": "ما تخصصك؟", "weight": 10, "required": True, "hint": "تجارة-وقف-صحة-برمجة-مصاحف"},
    {"id": "hewaya", "q": "ما هواياتك النافعة؟", "weight": 5, "required": False, "hint": "تلاوة-مصاحف-زمزم-علاج"},
    {"id": "mowten", "q": "ما موطنك وخدمتك لـ 54 دولة حبشة؟", "weight": 5, "required": False, "hint": "الحبشة - الدمان - الحجاز"},
    {"id": "ikhlas", "q": "هل تعمل لوجه الله 99% وقف؟", "weight": 10, "required": True, "hint": "99% وقف 1% غنى لله توحيد"},
]

def evaluate_client(answers: dict) -> dict:
    score = 0
    max_score = sum(q["weight"] for q in MIZAN_QUESTIONS)
    details = []
    for q in MIZAN_QUESTIONS:
        ans = answers.get(q["id"], "")
        if q["required"] and not ans:
            details.append({"id": q["id"], "score": 0, "reason": "مطلوب لكنه فارغ - لا يقبل"})
            continue
        # تقييم بسيط: طول الإجابة + ذكر الله
        s = 0
        if len(ans) >= 10: s += q["weight"] * 0.6
        if "لله" in ans or "الله" in ans: s += q["weight"] * 0.2
        if "خير" in ans or "نفع" in ans or "وقف" in ans: s += q["weight"] * 0.2
        if len(ans) >= 50: s = q["weight"]
        score += s
        details.append({"id": q["id"], "q": q["q"], "score": s, "max": q["weight"]})
    
    percentage = (score / max_score) * 100 if max_score else 0
    # منح حسب النية
    if percentage >= 80:
        tier = "MUHSIN_TIER_1 - منح كامل + ترخيص نيتف + كيرنل + بيرميتل + دعم"
        grant = "FULL_GRANT - إكرام كما يحب الله ورسوله"
    elif percentage >= 60:
        tier = "MUKHLIS_TIER_2 - منح نيتف + كيرنل + خصم 99%"
        grant = "PARTIAL_GRANT_99pct - وقف"
    elif percentage >= 40:
        tier = "SADIQ_TIER_3 - تأهيل + تدريب + ثم منح"
        grant = "TRAINING_GRANT - تأهيل للنية"
    else:
        tier = "NEEDS_NIYYAH - يحتاج إخلاص نية"
        grant = "NO_GRANT_YET - راجع نيتك لله"
    
    base = f"BOUND-{answers.get('takhassus','')}-{answers.get('niyyah','')}-{datetime.datetime.now().isoformat()}"
    serial = f"SHKHA-{hashlib.sha256(base.encode()).hexdigest()[:8].upper()}-741"
    
    return {
        "serial": serial,
        "score": score,
        "percentage": percentage,
        "tier": tier,
        "grant": grant,
        "details": details,
        "hadith": HADITH_CRITERIA,
        "bound": "BOUND_BY_QURAN_SUNNAH 741/5741/12464 - 99% وقف 1% غنى لله",
        "timestamp": datetime.datetime.now().isoformat()
    }

# تجربة
if __name__ == "__main__":
    test = {
        "niyyah": "أريد أن أنفع الأمة لوجه الله خالصا 99% وقف لله في صحة وتعليم وماء زمزم ومساجد ومصاحف زمزم",
        "ahdaf": "إغناء الناس وفعل الخير وتعليم العلم النافع ونشر المصاحف وبناء مساجد وماء",
        "khair": "أحب لأخي ما أحب لنفسي من الخير - أريد أن أساعد الناس بما أعطاني الله من علم وتجارة ووقف",
        "takhassus": "صحة-تداوي-دواء-مصاحف-زمزم",
        "hewaya": "علاج-طوارئ-تلاوة-ماء-زمزم",
        "mowten": "الدمان-54-دولة-حبشة-الحجاز",
        "ikhlas": "نعم 99% وقف 1% غنى لله توحيد إخلاص النية لله سبحانه"
    }
    print(json.dumps(evaluate_client(test), ensure_ascii=False, indent=2))
