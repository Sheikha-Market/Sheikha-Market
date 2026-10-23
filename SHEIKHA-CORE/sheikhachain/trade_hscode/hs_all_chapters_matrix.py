# -*- coding: utf-8 -*-
# HS CODE 99 CHAPTERS - كل المنتجات لكل قطاع وكل دولة
import json, hashlib, time, pathlib
HS_CHAPTERS={
"01-05":"حيوانات حية ومنتجات حيوانية","06-15":"منتجات نباتية وزيوت","16-24":"صناعات غذائية ومشروبات",
"25-27":"معادن ومنتجات تعدين وطاقة - نفط غاز Pearl Metal","28-38":"كيماويات وأسمدة وأدوية",
"39-40":"بلاستيك ومطاط","41-43":"جلود","44-49":"خشب وورق","50-63":"منسوجات وملابس",
"64-67":"أحذية وقبعات","68-71":"حجر وزجاج ولؤلؤ - Pearl Metal Foundry","72-83":"معادن وحديد وصلب - SBC 401 - 7214.20.00",
"84-85":"آلات ومعدات كهربائية - ESP32 - الدارة - ROS2 Robots - 8543.70",
"86-89":"نقل - سيارات سفن طائرات - Maritime Cargo Carrier","90-92":"أجهزة دقيقة وطبية - Digital Twin - 9018",
"93":"أسلحة دفاع","94-96":"أثاث وألعاب","97-99":"تحف وفن وخدمات - البرمجة والحوسبة"
}
pathlib.Path("sheikhachain/trade_hscode").mkdir(parents=True,exist_ok=True)
matrix=[]
for chapter, desc in HS_CHAPTERS.items():
    code=chapter.split('-')[0]
    payload=f"{chapter}:{desc}:{time.time()}"
    h=hashlib.sha256(payload.encode()).hexdigest()
    matrix.append({"hs_chapter":chapter,"description":desc,"example_hs_code":f"{code}.00.00","sheikha_sector":"SHEIKHA_"+chapter.replace('-','_'),"tracking_hash":h,"owner":"CR2051263653","seal":"BOUND_BY_QURAN_SUNNAH"})
with open("sheikhachain/trade_hscode/hs_all_chapters_matrix.json","w",encoding='utf-8') as f:
    json.dump(matrix,f,ensure_ascii=False,indent=2)
print(f"✅ HS MATRIX: {len(matrix)} chapters - كل القطاعات وكل المنتجات وكل الدول")
print(json.dumps(matrix[:3],indent=2,ensure_ascii=False))
