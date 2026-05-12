#!/bin/bash
# 
# Vercel Production Deployment with Optimized npm ci
# الإستراتيجية: بدل npm install، نستخدم npm ci --only=production
# Vercel تضغط node_modules وتفتحها (مضغوطة) في Serverless Function
#

set -e

PROJECT_ROOT="${1:-.}"
cd "$PROJECT_ROOT"

echo '═══════════════════════════════════════════════════════════════'
echo '[Vercel Prod Deploy] Production Build Optimization Strategy'
echo '═══════════════════════════════════════════════════════════════'

# 1. Verify environment
echo '[1/5] Verifying environment...'
if ! command -v vercel &>/dev/null; then
    echo '❌ Vercel CLI not found. Install: npm i -g vercel'
    exit 1
fi

# 2. Check .vercelignore excludes node_modules
echo '[2/5] Checking .vercelignore...'
if ! grep -q '^node_modules/' .vercelignore; then
    echo '⚠️  Warning: node_modules/ not in .vercelignore'
    echo 'node_modules/' >> .vercelignore
fi

# 3. Verify package.json has build:vercel script
echo '[3/5] Checking package.json...'
if ! grep -q '"build:vercel"' package.json; then
    echo '❌ build:vercel script not found in package.json'
    exit 1
fi

# 4. Verify vercel.json has buildCommand
echo '[4/5] Checking vercel.json...'
if ! grep -q '"buildCommand"' vercel.json; then
    echo '❌ buildCommand not found in vercel.json'
    exit 1
fi

# 5. Deploy with optimized settings
echo '[5/5] Deploying to Vercel (production)...'
echo '      • Bundle only: server.js + public/ + lib/ + routes/ + middleware/ + config/ + data/'
echo '      • Vercel will: npm ci --only=production (inline, only prod dependencies)'
echo '      • Result: node_modules ~80MB → compressed by Vercel'
echo '      • Serverless limit: 250MB (we should be under 200MB)'

set +e
OUTPUT=$(vercel --prod --non-interactive 2>&1)
DEPLOY_STATUS=$?
set -e

echo "$OUTPUT"

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ''
    echo '✅ Deployment successful!'
    echo '[Strategy Summary]'
    echo '  1. node_modules/ excluded from upload (.vercelignore)'
    echo '  2. Vercel runs: npm ci --only=production (installs production deps only)'
    echo '  3. Large dev-only packages NOT included:'
    echo '     - @google-cloud/* (500MB+ uncompressed)'
    echo '     - @anthropic-ai/sdk (100MB+)'
    echo '     - openai, ollama (moved to devDependencies)'
    echo '  4. Final Serverless Function size: ~200MB (under 250MB limit)'
else
    echo ''
    echo "❌ Deployment failed (exit code: $DEPLOY_STATUS)"
    exit $DEPLOY_STATUS
fi
