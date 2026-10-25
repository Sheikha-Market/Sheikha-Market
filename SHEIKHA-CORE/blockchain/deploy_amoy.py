import json, pathlib, hashlib, datetime
base = pathlib.Path(__file__).parent
registry_path = base / "registry.json"
identity_path = base / "FIRST_IDENTITY_SOVEREIGN.json"

with open(registry_path,'r',encoding='utf-8') as f:
    reg=json.load(f)

digest = hashlib.sha256(json.dumps(reg,sort_keys=True).encode()).hexdigest()
print(f"🕌 [AMOY] Registry SHA256: {digest}")
print(f"🕌 [AMOY] Experts: {len(reg)}")
print(f"🕌 [AMOY] Owner: 2051263653 - BOUND_BY_QURAN_SUNNAH")
print(f"🕌 [AMOY] Network: Polygon Amoy Testnet - ChainId 80002")
print(f"🕌 [AMOY] Contract: WeightRegistry.sol -> deploy with PRIVATE_KEY & RPC_URL")
print(f"🕌 [AMOY] To deploy real: export PRIVATE_KEY=0x...; export AMOY_RPC=https://rpc-amoy.polygon.technology; python3 -m pip install web3 && python3 blockchain/deploy_real.py")
# save manifest
manifest = {
  "seal": "ATOM_WATER_RASUL_JANNAH_SEALED",
  "creed": "LA_ILAHA_ILLA_ALLAH_MUHAMMAD_RASUL_ALLAH",
  "owner_cr": "2051263653",
  "registry_digest": digest,
  "experts_count": len(reg),
  "timestamp": datetime.datetime.utcnow().isoformat()+"Z",
  "chain": "Polygon Amoy - Eternal for Allah"
}
(base / "AMOY_DEPLOYMENT_MANIFEST.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print("✅ Manifest saved: blockchain/AMOY_DEPLOYMENT_MANIFEST.json")
