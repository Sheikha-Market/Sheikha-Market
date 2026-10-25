import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
SNAP=ROOT/"sheikhachain"/"supreme_governance"/"SUPREME_TRANSACTIONS_SNAPSHOT.json"
if SNAP.exists():
  d=json.loads(SNAP.read_text()); print(f"📨 MESSENGER: {len(d.get('beneficiaries',[]))} beneficiaries | {len(d.get('transactions',[]))} TX")
else:
  print("📨 MESSENGER: No snapshot")
