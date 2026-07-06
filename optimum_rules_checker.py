import json
import sys

RULES_FILE = 'rules_of_optimum.json'

# تحميل القواعد
with open(RULES_FILE, encoding='utf-8') as f:
    rules = json.load(f)

def check_project_against_rules(project_desc):
    print("\nنتيجة الفحص حسب قواعد الأفضل:\n" + "="*40)
    for rule in rules:
        print(f"\n🔹 القاعدة: {rule['name']}")
        print(f"- المصدر: {rule['source']}")
        print(f"- الملخص: {rule['summary']}")
        print(f"- التطبيق الكوني: {rule['cosmic_application']}")
        print(f"- المجالات: {', '.join(rule['fields'])}")
        print(f"- مثال تطبيقي: {rule['example']}")
        print(f"- مقياس التحقق: {rule['metric']}")
        # تحليل بسيط: هل الوصف يذكر القاعدة أو مجالها؟
        found = any(field in project_desc for field in rule['fields']) or rule['name'] in project_desc
        if found:
            print("✅ يظهر أن المشروع يراعي هذه القاعدة.")
        else:
            print("⚠️ لم تظهر إشارات واضحة لمراعاة القاعدة في الوصف.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("يرجى تمرير وصف المشروع كـ argument أو لصقه بعد التشغيل.")
        project_desc = input("وصف المشروع: ")
    else:
        project_desc = sys.argv[1]
    check_project_against_rules(project_desc)
