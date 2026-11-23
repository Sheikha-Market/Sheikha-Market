# غرسها من شيخه وباسم شيخه - BOUND 741/5741/12464 - لله 99% وقف - 2026-10-31
#!/usr/bin/env python3
# SHEIKHA GRANT LICENSING - منح التراخيص على مقدار الإكرام كما يحب الله ورسوله
# حديث لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه
import json, hashlib, datetime
def issue_license(serial, tier, client_info):
    grant_amount = {
        "MUHSIN_TIER_1": "100% GRANT - مجاني تماما + دعم + إكرام",
        "MUKHLIS_TIER_2": "99% GRANT - وقف - يدفع 1% فقط",
        "SADIQ_TIER_3": "80% GRANT - تأهيل",
        "NEEDS_NIYYAH": "0% - تأهيل نية أولا"
    }
    license_key = hashlib.sha256(f"BOUND-LICENSE-{serial}-{tier}-{datetime.datetime.now().isoformat()}-741".encode()).hexdigest().upper()
    license_text = f"""SHEIKHA NATIVE LICENSE - BOUND_BY_QURAN_SUNNAH 741/5741/12464
Serial: {serial}
Tier: {tier}
Grant: {grant_amount.get(tier.split(' - ')[0], 'TBD')}
Client: {client_info}
Hadith: لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه - أحب للناس ما تحب لنفسك تكن مسلما
Principle: 99% وقف 1% غنى لله - المساهمة في إغناء الناس وفعل الخير
Registry: edc795a408717e02ab5d06fc02b5b27925fb6e4a9b1e8d3c481edefbdc48e44b
Governance: 87ce771c - Grand 5741 Weights 12464 Structural 741
Validity: BOUND FOR ALLAH - مدى الحياة بإخلاص النية
Issued: {datetime.datetime.now().isoformat()}
By: market@sheikha.top - مركز معلومات شيخة لله
LicenseKey: SHKHA-LIC-{license_key[:16]}-741
"""
    return license_text

if __name__ == "__main__":
    print(issue_license("SHKHA-9541-3907-741-4916", "MUHSIN_TIER_1 - منح كامل + ترخيص نيتف + كيرنل + بيرميتل + دعم", "صحة-تداوي - الدمان - حبشة"))
