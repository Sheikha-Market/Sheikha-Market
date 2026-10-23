#!/usr/bin/env python3
"""Local metadata and HTTP diagnosis; no writes, imports of app code, or secrets."""
import datetime
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import urllib.error
import urllib.request

ROOT = Path.home() / 'Projects/sheikha/sheikha-main-portal'
FILES = (
    'server.js',
    'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js',
    'runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js',
    'routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js',
    'runtime/infinite/kernel.js', 'runtime/cosmic/model.js',
    'routes/infinite.js', 'routes/cosmic.js',
)


def command(args):
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=10)
        return result.returncode, result.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return None, ''


def main():
    report = {
        'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'scope': 'LOCAL_READ_ONLY_DIAGNOSIS',
        'projectFound': ROOT.is_dir(),
        'externalDeploymentPerformed': False,
        'files': [], 'http': [],
    }
    node = shutil.which('node')
    for relative in FILES:
        path = ROOT / relative
        row = {'path': relative, 'exists': path.is_file() and not path.is_symlink()}
        if row['exists']:
            content = path.read_bytes()
            row.update(bytes=len(content), sha256=hashlib.sha256(content).hexdigest())
            row['containsRedactionPlaceholder'] = b'[STRIPPED' in content
            if node:
                code, _ = command([node, '--check', str(path)])
                row['syntaxCheckPassed'] = code == 0 and bool(content.strip())
        report['files'].append(row)
    if shutil.which('podman'):
        code, value = command(['podman', 'ps', '--format', '{{.ID}} {{.Names}} {{.Status}} {{.Ports}}'])
        report['containerInventoryAvailable'] = code == 0
        report['containers'] = value.splitlines() if code == 0 else []
    # These fixed loopback requests never carry credentials or query strings.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    for path in ('/api/health', '/api/infinite-agent/status', '/api/cosmic/', '/api/cosmic/water', '/api/cosmic/atoms', '/api/cosmic-engineering/'):
        row = {'path': path}
        try:
            with opener.open('http://127.0.0.1:18080' + path, timeout=3) as response:
                row['status'] = response.status
                raw = response.read(16385)
                if path in ('/api/health', '/api/infinite-agent/status') and len(raw) <= 16384:
                    data = json.loads(raw)
                    row['success'] = data.get('success') is True
                    if path.endswith('/status'):
                        row['localSimulation'] = data.get('localSimulation')
                        row['liveNeuralNetwork'] = data.get('liveNeuralNetwork')
        except urllib.error.HTTPError as error:
            row['status'] = error.code
        except (OSError, ValueError, urllib.error.URLError):
            row['status'] = 'UNREACHABLE_OR_UNREADABLE'
        report['http'].append(row)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
