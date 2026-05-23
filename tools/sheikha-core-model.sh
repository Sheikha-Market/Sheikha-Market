#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# Activate the local Sheikha-Core Ollama model from the canonical Modelfile.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL="${SHEIKHA_CORE_MODEL:-Sheikha-Core}"
MODELFILE="${1:-$DIR/models/sheikha-core/Modelfile}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama command not found. Install/start Ollama first." >&2
  exit 127
fi

if [ ! -f "$MODELFILE" ]; then
  echo "ERROR: Modelfile not found: $MODELFILE" >&2
  exit 2
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   SHEIKHA CORE MODEL ACTIVATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Model:     $MODEL"
echo "Modelfile: $MODELFILE"
echo

ollama create "$MODEL" -f "$MODELFILE"

echo
echo "Active local models:"
ollama list | sed -n '1,20p'
echo
echo "Run: ollama run $MODEL"
