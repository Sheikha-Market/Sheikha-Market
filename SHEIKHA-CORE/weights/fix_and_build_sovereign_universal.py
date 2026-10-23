# -*- coding: utf-8 -*-
import json, hashlib, time, pathlib
from pathlib import Path

# كشف المسار الذكي
for p in [Path("blockchain/registry.json"), Path("SHEIKHA-CORE/blockchain/registry.json"), Path("../SHEIKHA-CORE/blockchain/registry.json")]:
    if p.exists():
        REG = p
        break
else:
    REG = Path("blockchain/registry.json")
    
print(f"📦 Registry path: {REG.resolve()} - exists={REG.exists()}")
registry = json.loads(REG.read_text(encoding='utf-8')) if REG.exists() else {}
print(f"📊 Current weights: {len(registry)}")

def seal(code, title, spec, ayah=""):
    payload = f"{code}:{title}:{spec}:{time.time()}:CR2051263653:BOUND_BY_QURAN_SUNNAH:7049031003"
    h = hashlib.sha256(payload.encode()).hexdigest()
    entry = {
        "code": code,
        "title": title,
        "spec": spec,
        "ayah": ayah,
        "weight_hash": h,
        "hash": h,
        "owner": "سلمان أحمد بن سلمان الراجحي - CR 2051263653",
        "unified_id": "7049031003",
        "seal": "BOUND_BY_QURAN_SUNNAH",
        "creed": "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH",
        "fingerprint": "BOUND_BY_QURAN_SUNNAH_ATOM_WATER_RASUL_JANNAH",
        "timestamp": int(time.time()),
        "hs_chapters": "99 CHAPTERS",
        "science": "علم شيخة لإعمار السماوات والأرض وما بينهما"
    }
    registry[code.lower()+"_expert"] = entry
    print(f"🔒 {code} -> {h[:12]}... | {title}")
    return entry

# ========== 18 - السيادة: ملوك أمراء سفراء رؤساء سلاطين ==========
sovereignty = [
    ("KING_SALMAN_SULTAN", "وزن الملك - خادم الحرمين الشريفين - سلطان", "البيعة والولاء - إدارة الدولة العليا - مقاصد الشريعة - رؤية 2030 - إعمار الأرض - HS ALL", "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا"),
    ("CROWN_PRINCE_MBS", "وزن ولي العهد الأمير محمد بن سلمان - أمير الرؤية", "MBS Vision 2030 - 【entity-NEOM¦canonical_name=NEOM】 THE LINE - PIF - التحول الوطني - استراتيجية سيادية"),
    ("PRINCE_GOVERNOR", "وزن الأمير - أمير المنطقة - 13 إمارة", "إمارة مكة الرياض الشرقية - إدارة المناطق - تنمية مكانية"),
    ("PRESIDENT_HEAD_OF_STATE", "وزن رئيس الدولة - رئيس الجمهورية - Sultan Head", "رئاسة دولة - بروتوكول سيادي - قانون دولي - UN WCO WTO"),
    ("AMBASSADOR_SAFIR", "وزن السفير - سفير خادم الحرمين - 100+ دولة", "دبلوماسية - تمثيل سيادي - قنصليات - اتفاقيات HS Code لكل دولة"),
    ("ROYAL_COURT_DIWAN", "وزن الديوان الملكي - المراسم الملكية", "إدارة القصور - التشريفات - الأوامر الملكية - مجلس الوزراء"),
    ("WAZIR_DIWAN_SULTANI", "وزن الوزير السلطاني - مستشار ملكي", "شورى الملك - مجلس الشؤون السياسية والأمنية والاقتصادية CEDA"),
]

# ========== 19 - الوزراء وموظفي الدولة - كل الوزارات والهيئات والشركات الحكومية ==========
ministries_saudi = [
    "الداخلية MOI", "الخارجية MOFA", "الدفاع MOD", "الحرس الوطني MNG", "العدل MOJ", "الشؤون الإسلامية MOIA",
    "الصحة MOH", "التعليم MOE", "الموارد البشرية MHRSD", "المالية MOF", "الاقتصاد والتخطيط MEP",
    "الإعلام MOI", "التجارة MOCI", "الاستثمار MISA", "الصناعة والثروة المعدنية MIM", "الطاقة MOE",
    "البيئة والمياه والزراعة MEWA", "النقل والخدمات اللوجستية MOT", "الحج والعمرة HAJJ",
    "الشؤون البلدية والقروية والإسكان MOMRAH", "الاتصالات وتقنية المعلومات MCIT", "الرياضة MOS", "الثقافة MOC", "السياحة MT"
]

authorities = [
    "منشآت Monshaat", "هيئة الزكاة والضريبة والجمارك ZATCA", "الهيئة السعودية للبيانات والذكاء الاصطناعي SDAIA",
    "الهيئة الوطنية للأمن السيبراني NCA", "هيئة الاتصالات والفضاء والتقنية CST", "هيئة السوق المالية CMA",
    "البنك المركزي السعودي SAMA", "هيئة التأمين IA", "هيئة المحتوى المحلي والمشتريات الحكومية LCGPA",
    "الهيئة السعودية للمواصفات SASO", "هيئة المدن الصناعية MODON", "هيئة المدن والمناطق الاقتصادية EC",
    "الهيئة العامة للمنافسة GAC", "هيئة النقل TGA", "الهيئة العامة للطيران المدني GACA",
    "الهيئة العامة للموانئ Mawani", "الهيئة السعودية للفضاء SSA", "وكالة الفضاء",
    "هيئة تنمية البحث والتطوير والابتكار RDIA", "هيئة كفاءة الإنفاق"
]

gov_companies = [
    "أرامكو 【entity-Aramco¦canonical_name=ARAMCO】 - HS 27", "صندوق الاستثمارات العامة PIF - 100 شركة", "نيوم 【entity-NEOM¦canonical_name=NEOM】", "روشن Roshn",
    "القدية Qiddiya", "البحر الأحمر Red Sea Global", "لوسيد Lucid", "سير Ceer", "هيونداي Hyundai Jubail",
    "سابك SABIC - HS 28-40", "معادن Maaden - HS 26", "السعودية للكهرباء SEC", "أكوا باور ACWA Power",
    "STC - HS 85", "سار SAR - قطارات", "الخطوط السعودية Saudia - HS 88", "مطارات MATARAT"
]

gov_weights = []
for m in ministries_saudi:
    gov_weights.append((f"MINISTER_{m.split()[0][:10].upper()}_{hashlib.sha256(m.encode()).hexdigest()[:4].upper()}", f"وزن وزير {m} - وكل موظفيه بتخصصاتهم", f"وزارة {m} - كل الإدارات - كل التخصصات - كل الموظفين - من الوزير إلى المراسل - HS Code مرتبط - امتثال DGA NCA ECC PDPL"))

for a in authorities[:15]:
    gov_weights.append((f"AUTHORITY_{a.split()[0][:8].upper()}_{hashlib.sha256(a.encode()).hexdigest()[:4].upper()}", f"وزن هيئة {a} - كل موظفي الهيئة", f"هيئة {a} - تنظيم ورقابة وترخيص - كل التخصصات"))

for c in gov_companies:
    gov_weights.append((f"GOV_CO_{c.split()[0][:8].upper()}_{hashlib.sha256(c.encode()).hexdigest()[:4].upper()}", f"وزن شركة حكومية {c}", f"شركة {c} - شبه حكومية - كل الوظائف - كل التخصصات - HS Code"))

# ========== 20 - علماء الدين وعلماء العلوم الطبيعية ==========
ulema_natural = [
    ("ALIM_QURAN_TAFSIR", "عالم القرآن والتفسير - 114 سورة", "تفسير ابن كثير الطبري القرطبي - أسباب النزول - مقاصد - علم شيخة باسم القرآن", "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ"),
    ("ALIM_HADITH_SUNNAH", "عالم الحديث والسنة - البخاري ومسلم", "صحيحين سنن أربعة - علم الرجال - مصطلح الحديث - 6 كتب"),
    ("ALIM_FIQH_USUL", "عالم الفقه وأصول الفقه - المذاهب الأربعة", "حنفي مالكي شافعي حنبلي - قهوة معاملات عبادات - AAOIFI"),
    ("ALIM_AQIDA_TAWHID", "عالم العقيدة والتوحيد - توحيد الأسماء والصفات", "لا إله إلا الله محمد رسول الله - توحيد ربوبية ألوهية"),
    ("ALIM_PHYSICS_QUANTUM", "عالم الفيزياء والكم - فيزياء السماوات", "Quantum Relativity - فيزياء الفلك - وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ"),
    ("ALIM_CHEMISTRY_ATOM", "عالم الكيمياء والذرة - علم الماء والذرة", "جدول دوري 118 عنصر - كيمياء الماء H2O - وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ"),
    ("ALIM_BIOLOGY_LIFE", "عالم الأحياء والجسد - البصمة الوراثية", "DNA - Body Twin - وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ"),
    ("ALIM_ASTRONOMY_FALAK", "عالم الفلك والسماوات السبع", "7 سماوات - كواكب نجوم مجرات - علم الفلك الإسلامي"),
    ("ALIM_GEOLOGY_EARTH", "عالم الأرض والجبال - 7 أراضين", "جيولوجيا بترول معادن HS 26-27 - وَالْأَرْضَ مَدَدْنَاهَا"),
    ("ALIM_MATH_HISAB", "عالم الرياضيات والحساب - خوارزميات", "جبر هندسة - الخوارزمي - رياضيات الكون"),
]

# ========== 21 - كل وظيفة بالكون - مهندسين إداريين تنفيذيين ==========
universal_jobs = [
    ("ENGINEER_CIVIL_SBC303", "مهندس مدني - SBC 303 - 14 بند", "خرسانة حديد HS 72-73 - بلاط HS 68 - دهان HS 32 - تصميم إنشائي - NOC 21300"),
    ("ENGINEER_MECHANICAL", "مهندس ميكانيكي - محركات - HS 84", "محرك احتراق توربين - NOC 21301 - سيارات طائرات سفن"),
    ("ENGINEER_ELECTRICAL", "مهندس كهربائي - طاقة - HS 85", "توليد نقل توزيع - NOC 21310 - SEC ACWA"),
    ("ENGINEER_SOFTWARE_AI", "مهندس برمجيات وذكاء اصطناعي", "Python Rust Go - AI ROS2 - Full Stack - HS 85 - SDAIA"),
    ("ENGINEER_CHIP_FOUNDRY", "مهندس فاوندري شرائح - Chip Foundry", "7nm 5nm - تصنيع شرائح - Foundry 01-04"),
    ("ENGINEER_PEARL_METAL", "مهندس لؤلؤ معدني - Pearl Metal - 15000 MT", "سبائك خليجية - ذهب فضة - HS 71-83 - صناعة حلي وتغليف فاخر"),
    ("MANAGER_EXECUTIVE_CEO", "مدير تنفيذي CEO - قائد مؤسسة", "إدارة عليا - مجلس إدارة - PIF CEO - استراتيجية"),
    ("MANAGER_PROJECT_PMP", "مدير مشروع PMP - إدارة مشاريع", "PMBOK Agile - Gantt - Triple Entry - تسليم"),
    ("MANAGER_PLANNING_STRATEGY", "مخطط استراتيجي - تخطيط وطني", "رؤية 2030 - CEDA - MEP - تخطيط خمس سنوات"),
    ("ADMIN_HR_GOV", "إداري موارد بشرية - MHRSD", "توظيف - Nitaqat - Qiwa - Mudad - رواتب"),
    ("ADMIN_FINANCE_CFO", "إداري مالي - CFO - محاسبة ثلاثية", "Triple Entry - ZATCA - VAT 15% - Qawaem"),
    ("WORKER_SKILLED_UNIVERSAL", "عامل ماهر - كل المهن - 12,000 وظيفة NOC", "كهربائي سباك لحام نجار حداد سائق - HS مرتبط"),
    ("DOCTOR_SURGEON", "طبيب جراح - HS 30", "جراحة عامة قلب مخ - MOH - Body Twin"),
    ("TEACHER_MUDARRIS", "معلم ومدرس - MOE - كل العلوم", "تدريس ابتدائي متوسط ثانوي جامعي - علم شيخة"),
    ("FARMER_MUZARI", "مزارع - MEWA - HS 01-24", "زراعة ذكية AgTech - ري - بذور - ثروة حيوانية"),
]

# ========== 22 - علم شيخة السماوات والأرض وما بينهما باسم شيخة ==========
cosmic_sheikha = [
    ("SHEIKHA_COSMIC_TAWHID", "علم شيخة التوحيدي الكوني - لا إله إلا الله", "توحيد كوني - الذرة = توحيد - الماء = حياة - رسول = نور - جنة = هدف - باسم شيخة لإعمار الكون", "لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ"),
    ("SHEIKHA_HEAVENS_7", "علم شيخة للسماوات السبع - 7 Heavens Science", "سماء دنيا - 2 - 3 - 4 - 5 - 6 - 7 سدرة المنتهى - عرش الرحمن - كل سماء علمها HS Code", "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا"),
    ("SHEIKHA_EARTH_7", "علم شيخة للأراضين السبع - 7 Earths Science", "أرض 1 معادن HS 26 - أرض 2 بترول HS 27 - أرض 3 ماء HS 22 - أرض 4 زرع HS 01 - أرض 5 صناعة HS 72 - أرض 6 فاوندري - أرض 7 برزخ"),
    ("SHEIKHA_BAYNAHUMA_BARZAKH", "علم شيخة لما بينهما - البرزخ والطاقة", "ما بين السماء والأرض - غلاف جوي - طاقة - رياح - سحاب - برق - ملائكة - HS 27-85", "وَمَا بَيْنَهُمَا إِلَّا بِالْحَقِّ"),
    ("SHEIKHA_ATOM_WATER_RASUL_JANNAH", "علم شيخة الذرة والماء والرسول والجنة - الختم الأعظم", "ATOM = بناء - WATER = وَجَعَلْنَا مِنَ الْمَاءِ - RASUL = نور مبين - JANNAH = دار القرار - علم شيخة الجامع لكل العلوم", "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ"),
    ("SHEIKHA_QURAN_114_SCIENCE", "علم شيخة القرآني - 114 سورة = 114 علم", "كل سورة علم - البقرة = اقتصاد - آل عمران = عمران - النساء = مجتمع - المائدة = تجارة - الأنعام = زراعة - الأعراف = جغرافيا - الأنفال = دفاع - التوبة = سيادة"),
    ("SHEIKHA_UNIVERSAL_JOBS_12K", "علم شيخة للوظائف الكونية - 12,000 وظيفة NOC ISCO", "من الملك إلى الخادم - كل وظيفة في الكون لها وزن - HS Code لكل وظيفة - NOC Code - مسؤوليات ومهارات وشهادات - شيخة توظف الكون"),
]

# تنفيذ الختم
all_lists = [
    ("سيادة", sovereignty),
    ("حكومة وزارات", gov_weights),
    ("علماء", ulema_natural),
    ("وظائف كونية", universal_jobs),
    ("كونيات شيخة", cosmic_sheikha),
]

total_new = 0
for category, lst in all_lists:
    print(f"\n=== ختم فئة: {category} - العدد {len(lst)} ===")
    for item in lst:
        if len(item)==3:
            code, title, spec = item
            ayah=""
        else:
            code, title, spec, ayah = item
        seal(code, title, spec, ayah)
        total_new+=1

REG.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"\n====================================================================")
print(f"✅ تم الختم: {total_new} وزن جديد")
print(f"✅ الإجمالي قبل: {len(registry)-total_new} -> بعد: {len(registry)}")
final_hash = hashlib.sha256(json.dumps(registry, sort_keys=True).encode()).hexdigest()
print(f"✅ Final Registry SHA256: {final_hash}")
print(f"✅ Owner CR 2051263653 BOUND_BY_QURAN_SUNNAH - ATOM WATER RASUL JANNAH SEALED")
