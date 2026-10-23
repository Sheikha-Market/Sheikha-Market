# -*- coding: utf-8 -*-
# SHEIKHA REAL ON-CHAIN DEPLOYMENT - 【entity-Polygon¦canonical_name=Polygon】 Amoy 80002
# Owner: Salman Ahmed Al Rajeh CR 2051263653 - BOUND_BY_QURAN_SUNNAH
import os, sys, json, time, hashlib, pathlib
base=pathlib.Path(__file__).parent
try:
    from web3 import Web3
except:
    print("Installing web3...")
    os.system(f"{sys.executable} -m pip install web3 --quiet --break-system-packages")
    from web3 import Web3

registry_path=base/"registry.json"
if not registry_path.exists():
    print("❌ registry.json not found")
    sys.exit(1)
registry=json.loads(registry_path.read_text(encoding='utf-8'))
reg_hash=hashlib.sha256(json.dumps(registry,sort_keys=True).encode()).hexdigest()
print(f"🕌 [SHEIKHA] Registry: {len(registry)} experts - SHA256: {reg_hash}")
print(f"🕌 [SHEIKHA] Owner: CR 2051263653 - BOUND_BY_QURAN_SUNNAH - LA_ILAHA_ILLA_ALLAH")

PRIVATE_KEY=os.getenv("PRIVATE_KEY","").strip()
RPC_LIST=[
    os.getenv("AMOY_RPC",""),
    "https://rpc-amoy.polygon.technology",
    "https://polygon-amoy-bor-rpc.publicnode.com",
    "https://polygon-amoy.drpc.org",
    "https://rpc.ankr.com/polygon_amoy"
]
RPC_LIST=[r for r in RPC_LIST if r]

w3=None
for rpc in RPC_LIST:
    try:
        w3=Web3(Web3.HTTPProvider(rpc, request_kwargs={'timeout':10}))
        if w3.is_connected():
            print(f"✅ Connected: {rpc} Chain {w3.eth.chain_id}")
            break
    except: continue

if not w3 or not w3.is_connected():
    print("❌ No RPC reachable - saving DRY RUN proof")
    proof={
        "network":"Polygon Amoy 80002",
        "owner":"Salman Al-Rajhi CR2051263653",
        "creed":"LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH",
        "seal":"BOUND_BY_QURAN_SUNNAH",
        "science":"علم شيخة لإعمار السماوات والأرض",
        "experts":len(registry),
        "registry_sha256":reg_hash,
        "status":"READY_FOR_BROADCAST",
        "timestamp":int(time.time())
    }
    (base/"AMOY_DEPLOYMENT_MANIFEST.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf-8')
    print("📄 Manifest saved - set PRIVATE_KEY to broadcast live")
    sys.exit(0)

if not PRIVATE_KEY or PRIVATE_KEY=="0x..." or len(PRIVATE_KEY)<10:
    print("⚠️ PRIVATE_KEY not set - DRY RUN only")
    print("export PRIVATE_KEY=0x... && python3 blockchain/deploy_real.py")
    proof={
        "network":"Polygon Amoy","chain_id":80002,"owner":"CR2051263653",
        "experts":len(registry),"registry_sha256":reg_hash,
        "status":"READY","rpc":str(w3.provider.endpoint_uri)
    }
    (base/"AMOY_DEPLOYMENT_MANIFEST.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf-8')
    sys.exit(0)

acct=w3.eth.account.from_key(PRIVATE_KEY)
print(f"👤 Wallet: {acct.address} Balance: {w3.from_wei(w3.eth.get_balance(acct.address),'ether')} POL")
tx={
    'nonce':w3.eth.get_transaction_count(acct.address),
    'to':acct.address,
    'value':0,
    'gas':150000,
    'gasPrice':w3.eth.gas_price,
    'chainId':80002,
    'data':w3.to_hex(text=f"SHEIKHA:CR2051263653:{reg_hash[:32]}:EXPERTS{len(registry)}:BOUND_BY_QURAN_SUNNAH")
}
signed=w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
tx_hash=w3.eth.send_raw_transaction(signed.rawTransaction)
print(f"🎉 TX: {tx_hash.hex()} - https://amoy.polygonscan.com/tx/{tx_hash.hex()}")
receipt=w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
print(f"✅ Block {receipt.blockNumber} - SEALED FOR ALLAH FOREVER")
(base/"AMOY_REAL_TX.json").write_text(json.dumps({"tx":tx_hash.hex(),"block":receipt.blockNumber,"hash":reg_hash},indent=2),encoding='utf-8')
