#!/usr/bin/env bash
# Deprecated compatibility entrypoint.
# Use tools/sheikha-enterprise-runtime.sh for the governed runtime manager.

set -Eeuo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/sheikha-enterprise-runtime.sh" run
