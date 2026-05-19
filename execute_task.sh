set -e
cd /home/sheikha/Projects/sheikha/sheikha-main-portal
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json valid')"
npm install --silent
npm run -s os:test
UNIVERSAL_API_PORT=9191 node sheikha-universal-api/index.js >/tmp/sheikha-universal-api.log 2>&1 &
API_PID=$!
echo "Waiting for API to start..."
for i in {1..5}; do
  if curl -sf http://127.0.0.1:9191/api/v2/health > /dev/null; then
    echo "API is up"
    break
  fi
  sleep 1
done
curl -sf http://127.0.0.1:9191/api/v2/health | cat
curl -sf -X POST http://127.0.0.1:9191/api/neural/root/activate/fundamentals -H 'Content-Type: application/json' -d '{"domain":"computing","action":"activate kernel boot os"}' | cat
curl -sf -X POST http://127.0.0.1:9191/api/neural/root/cosmic-integration -H 'Content-Type: application/json' -d '{"scope":"global"}' | cat
kill "$API_PID" || true
npm run -s ops:sheikha:lang:sprint3:test || true
if [ -f scripts/neural-gate.sh ]; then
  bash scripts/neural-gate.sh http://127.0.0.1:8080 || true
fi
pm2 save --force
