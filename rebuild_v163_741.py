import pathlib, csv
csv_path="exports/SHEIKHA_V163_741_STRUCTURAL_CHIEFS_MASTER.csv"
rows=list(csv.DictReader(open(csv_path, encoding="utf-8-sig")))
chiefs=len(rows)
grand=chiefs+5000
weights=12440+16+8
print(f"CSV {csv_path}: {chiefs}/{grand}/{weights} nodes={chiefs*240} synaptic={chiefs*3840}")
# اكتب sheikha_core_engine.py ديناميكياً بقراءة CSV الجديد
code=open("sheikha_core_engine.py","r",encoding="utf-8").read()
# استبدل السطر الذي يقرأ CSV القديم بالجديد
code=code.replace("SHEIKHA_V159_717_STRUCTURAL_CHIEFS_MASTER.csv", "SHEIKHA_V163_741_STRUCTURAL_CHIEFS_MASTER.csv")
open("sheikha_core_engine.py","w",encoding="utf-8").write(code)
print(f"✓ sheikha_core_engine.py now points to V163 741")
