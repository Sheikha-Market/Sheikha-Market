#!/bin/bash
# Sheikha VS Code Extension - Build .vsix Package
# ===========================================================
# This script packages the VS Code extension into an installable .vsix file

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXTENSION_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$EXTENSION_DIR/dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Sheikha VS Code Extension - Build .vsix Package${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js and npm.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ node is not installed. Please install Node.js.${NC}"
    exit 1
fi

if command -v vsce &> /dev/null; then
    VSCE_CMD=(vsce)
elif npx --no-install vsce --version &> /dev/null; then
    VSCE_CMD=(npx --no-install vsce)
else
    echo -e "${YELLOW}📦 Installing @vscode/vsce (VS Code Extension packaging tool)...${NC}"
    npm install -g @vscode/vsce
    VSCE_CMD=(vsce)
fi

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"

# Create output directory
echo -e "\n${YELLOW}📁 Creating output directory...${NC}"
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}✅ Output directory: $OUTPUT_DIR${NC}"

# Validate package.json exists
if [ ! -f "$EXTENSION_DIR/package.json" ]; then
    echo -e "${RED}❌ package.json not found in $EXTENSION_DIR${NC}"
    exit 1
fi

# Validate the governed extension entrypoint exists
if [ ! -f "$EXTENSION_DIR/src/extension.js" ]; then
    echo -e "${RED}❌ src/extension.js not found in $EXTENSION_DIR${NC}"
    exit 1
fi

# Extract version from package.json
VERSION=$(grep '"version"' "$EXTENSION_DIR/package.json" | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
PUBLISHER=$(grep '"publisher"' "$EXTENSION_DIR/package.json" | head -1 | sed 's/.*"publisher": "\([^"]*\)".*/\1/')
NAME=$(grep '"name"' "$EXTENSION_DIR/package.json" | head -1 | sed 's/.*"name": "\([^"]*\)".*/\1/')

echo -e "\n${BLUE}Extension Details:${NC}"
echo -e "  Name: ${GREEN}$NAME${NC}"
echo -e "  Publisher: ${GREEN}$PUBLISHER${NC}"
echo -e "  Version: ${GREEN}$VERSION${NC}"

# Create .vsix package
echo -e "\n${YELLOW}🔨 Building .vsix package...${NC}"
cd "$EXTENSION_DIR"

VSIX_FILE="$OUTPUT_DIR/${PUBLISHER}.${NAME}-${VERSION}.vsix"

if "${VSCE_CMD[@]}" package --no-dependencies --out "$VSIX_FILE" 2>&1; then
    echo -e "${GREEN}✅ Successfully created: $VSIX_FILE${NC}"
else
    echo -e "${RED}❌ Failed to create .vsix package${NC}"
    exit 1
fi

PACKAGE_FILES=$(unzip -Z1 "$VSIX_FILE")
if ! grep -Fxq "extension/src/extension.js" <<< "$PACKAGE_FILES"; then
    echo -e "${RED}❌ Governed entrypoint is missing from the package${NC}"
    exit 1
fi
if grep -Fxq "extension/extension.js" <<< "$PACKAGE_FILES"; then
    echo -e "${RED}❌ Conflicting legacy entrypoint is present in the package${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Governed entrypoint verified${NC}"

# Verify file size
FILE_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
echo -e "${BLUE}📦 Package size: ${GREEN}$FILE_SIZE${NC}"

# Create installation summary
INSTALL_SUMMARY="$OUTPUT_DIR/INSTALL.txt"
cat > "$INSTALL_SUMMARY" << EOF
Sheikha Extension - Installation Summary
================================================

Extension: $NAME
Publisher: $PUBLISHER
Version: $VERSION
Built: $(date)

Installation Methods:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FROM FILE (Offline Installation)
   ────────────────────────────────
   \$ code --install-extension "$VSIX_FILE"

   Or via VS Code UI:
   • Open Extensions (Ctrl+Shift+X)
   • Click ⋯ menu → Install from VSIX
   • Select the .vsix file

2. FROM COMMAND LINE
   ──────────────────
   \$ cd "$EXTENSION_DIR"
   \$ vsce publish --pat <Azure DevOps PAT>

   Note: Requires publisher token

3. FROM VS CODE MARKETPLACE (Future)
   ─────────────────────────────────
   Search for "Sheikha" in Extensions

Troubleshooting:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: "Cannot find module" errors
→ Run: npm install in the extension directory

Issue: Extension doesn't activate
→ Check: VS Code version >= 1.85.0
→ Open: outputPanel "Sheikha" for logs

Issue: Commands not appearing
→ Reload VS Code (Ctrl+R)
→ Check: activationEvents in package.json

First Steps After Installation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Reload VS Code (Ctrl+R)
2. Verify in Extensions view (should show version $VERSION)
3. Open Command Palette (Ctrl+Shift+P)
4. Run: "Sheikha: حالة النظام"
5. Check if API is reachable (http://localhost:8080)
6. Open chat with: Ctrl+Shift+I

Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VS Code Settings (Ctrl+,):
• sheikha.serverUrl → API endpoint
• sheikha.defaultModel → AI model to use
• sheikha.enableInlineCompletions → Toggle suggestions
• sheikha.completionDelay → Delay before showing suggestions (ms)

Created: $(date '+%Y-%m-%d %H:%M:%S')
EOF

echo -e "\n${GREEN}✅ Installation guide created: $INSTALL_SUMMARY${NC}"

# Create quick test script
TEST_SCRIPT="$OUTPUT_DIR/verify-extension.sh"
cat > "$TEST_SCRIPT" << 'EOF'
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
EOF

chmod +x "$TEST_SCRIPT"
echo -e "${GREEN}✅ Verification script created: $TEST_SCRIPT${NC}"

# Summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Build Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Output location: ${YELLOW}$OUTPUT_DIR${NC}"
echo -e "Main file: ${YELLOW}$(basename "$VSIX_FILE")${NC}"
echo -e "Size: ${YELLOW}$FILE_SIZE${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. ${GREEN}code --install-extension \"$VSIX_FILE\"${NC}"
echo -e "  2. Reload VS Code (Ctrl+R)"
echo -e "  3. Open Command Palette and run 'Sheikha: حالة النظام'"
echo ""
echo -e "For details, see: ${YELLOW}$INSTALL_SUMMARY${NC}"
echo ""
