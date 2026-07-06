#!/usr/bin/env bash
set -euo pipefail

echo "🧠 SHEIKHA KERNEL FABRIC V1 — READ ONLY"

node - <<'NODE' | tee runtime/kernel-fabric/sheikha-kernel-fabric-v1-report.json
const { inspectKernelFabric } = require('./core/kernel-fabric/sheikha-kernel-fabric-v1');
console.log(JSON.stringify(inspectKernelFabric(), null, 2));
NODE

echo "✅ Kernel Fabric read-only inspection completed"
