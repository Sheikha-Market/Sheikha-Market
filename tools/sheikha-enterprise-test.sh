#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# Compatibility wrapper for the full Sheikha enterprise runtime test.

set -Eeuo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/sheikha-enterprise-runtime.sh" test
