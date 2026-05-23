#!/bin/bash
# Verify Sheikha Extension Installation

echo "════════════════════════════════════════════════"
echo "Sheikha - Extension Verification"
echo "════════════════════════════════════════════════"

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ VS Code is not installed or not in PATH"
    exit 1
fi

VS_CODE_VERSION=$(code --version | head -1)
echo "✅ VS Code version: $VS_CODE_VERSION"

# Check extension installation
EXTENSIONS=$(code --list-extensions 2>/dev/null | grep -i sheikha || true)
if [ -z "$EXTENSIONS" ]; then
    echo "⚠️  Sheikha extension not currently installed"
    echo "   Run: code --install-extension <dist/sheikha.sheikha-*.vsix>"
else
    echo "✅ Installed extensions:"
    echo "$EXTENSIONS" | sed 's/^/   /'
fi

# Check API availability
echo ""
echo "Testing API connectivity..."
API_STATUS=$(curl -s -m 3 http://localhost:8080/api/sheikha/extension/status || echo "UNREACHABLE")
if echo "$API_STATUS" | grep -q "Sheikha"; then
    echo "✅ API is reachable"
    echo "   Status: $(echo $API_STATUS | jq -r '.data.status' 2>/dev/null || echo 'OK')"
else
    echo "⚠️  API not reachable at http://localhost:8080"
    echo "   Make sure the Sheikha server is running"
fi

echo ""
echo "════════════════════════════════════════════════"
echo "Verification complete!"
echo "════════════════════════════════════════════════"
