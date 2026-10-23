#!/usr/bin/env bash
# Prepare a new, filtered deployment context; never build, deploy, or reuse it.
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"
command -v python3 >/dev/null || { printf 'python3 is required.\n' >&2; exit 1; }

python3 - "$repo_root" "$@" <<'PY'
import argparse
import hashlib
import json
import os
import fnmatch
from pathlib import Path
import shutil
import stat
import subprocess
import sys

root = Path(sys.argv[1])
parser = argparse.ArgumentParser(description='Prepare a private local build context; never upload.')
parser.add_argument('destination', nargs='?', default='')
parser.add_argument('--server-override', metavar='REGULAR_FILE')
args = parser.parse_args(sys.argv[2:])
requested = args.destination
server_override = (Path(os.path.abspath(args.server_override))
                   if args.server_override is not None else None)
server_override_metadata = None
server_override_bytes = None
trees = (
    'core', 'lib', 'models', 'middleware', 'routes', 'config', 'public',
    'data', 'runtime', 'tools', 'sheikha-language', 'sdk', 'knowledge',
)
root_files = (
    'server.js', 'global-neural-governance-init.js', 'package.json',
    'package-lock.json', 'Dockerfile', '.dockerignore', '.gcloudignore',
)
required_modules = (
    'core/engine-registry/sheikha-governed-engine-registry-v2.js',
    'core/engine-registry/sheikha-engine-registry-v1.js',
    'core/optional-engine-contract-fabric/sheikha-optional-engine-contract-fabric-v14.js',
    'core/kernel/index.js',
    'tools/sheikha-language-platform/sheikha-language-platform-v1.js',
    'runtime/sheikha-language-platform/v1/sheikha-language-platform-v1.json',
    'runtime/sheikha-programming-language-universal/v1/sheikha-universal-compiler.js',
    'runtime/sheikha-infinite-agent/v1/sheikha-infinite-agent-kernel.js',
    'runtime/sheikha-natural-integration/v1/sheikha-natural-integration-model.js',
    'routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js',
    *(f'sheikha-language/compiler/{name}.js' for name in (
        'lexer', 'parser', 'sheikha-compiler', 'sheikha-runner',
        'ir', 'vm', 'governance', 'source-loader', 'bytecode',
        'bytecode-vm', 'type-checker', 'local-production-components',
    )),
)
destination = None
MAX_CONTEXT_FILES = 20000
MAX_CONTEXT_BYTES = 1024 * 1024 * 1024
PRIVATE_COMPONENTS = {
    'private', 'intellectual-property', 'secrets', 'credentials', 'passwords',
    'private-keys', '.ssh', '.aws', '.azure', '.kube', 'sheikha_os_ecosystem',
}
PRIVATE_NAMES = {'.npmrc', '.netrc', '.mcp.json', 'auth.json',
                 'secret.json', 'secrets.json', 'passwords.json'}
PRIVATE_PATTERNS = ('credentials*.json', 'service-account*.json',
                    'service_account*.json')
PRIVATE_SUFFIXES = ('.pem', '.key', '.p12', '.pfx', '.jks', '.keystore')
PRIVATE_DESIGNS = {
    'public/workspace/engineering/natural-integration.html',
    'public/workspace/engineering/natural-integration.js',
}


def excluded(relative):
    parts = relative.parts
    lower_parts = tuple(part.lower() for part in parts)
    leaf = lower_parts[-1] if lower_parts else ''
    if any(name in {'node_modules', '__pycache__', '.git'}
           or name.lower().startswith('.env')
           or 'credentialblob' in name.lower() for name in parts):
        return True
    if (any(name in PRIVATE_COMPONENTS for name in lower_parts)
            or leaf in PRIVATE_NAMES or leaf.endswith(PRIVATE_SUFFIXES)
            or any(fnmatch.fnmatchcase(leaf, pattern) for pattern in PRIVATE_PATTERNS)
            or relative.as_posix() in PRIVATE_DESIGNS):
        return True
    if parts[:2] == ('tools', 'tools'):
        return True
    return (parts[:3] == ('runtime', 'governance', 'platform-trust')
            and 'executions' in parts[3:])


def source_path(relative):
    if server_override is not None and Path(relative) == Path('server.js'):
        return server_override
    return root / relative


def require_regular(base, relative):
    filename = source_path(relative) if base == root else base / relative
    info = filename.lstat()
    if not stat.S_ISREG(info.st_mode):
        raise ValueError(f'Required regular file is missing or unsafe: {relative}')
    if info.st_size == 0:
        raise ValueError(f'Required file is empty: {relative}')


def signature(info):
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns,
            info.st_ctime_ns, info.st_mode)


def source_handle(relative):
    # Open every source component without following links, including races
    # between the initial inventory and the actual copy.
    filename = source_path(relative)
    # Walk from the absolute anchor so override ancestors cannot hide a link.
    descriptor = os.open(filename.anchor, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for component in filename.parts[1:-1]:
            next_descriptor = os.open(
                component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                dir_fd=descriptor,
            )
            os.close(descriptor)
            descriptor = next_descriptor
        file_descriptor = os.open(
            filename.name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=descriptor,
        )
    finally:
        os.close(descriptor)
    handle = os.fdopen(file_descriptor, 'rb')
    if not stat.S_ISREG(os.fstat(handle.fileno()).st_mode):
        handle.close()
        raise ValueError(f'Unsafe source file: {relative}')
    return handle


try:
    # An override is opt-in, never copied back, and snapshotted before inventory.
    if server_override is not None:
        for parent in server_override.parents:
            if parent.is_symlink():
                raise ValueError('Server override ancestors must not be symlinks')
        require_regular(root, 'server.js')
        with source_handle(Path('server.js')) as handle:
            info = os.fstat(handle.fileno())
            if info.st_size > MAX_CONTEXT_BYTES:
                raise ValueError('Server override exceeds context byte limit')
            server_override_metadata = signature(info)
            server_override_bytes = handle.read(info.st_size + 1)
            if (len(server_override_bytes) > MAX_CONTEXT_BYTES
                    or signature(os.fstat(handle.fileno())) != server_override_metadata
                    or signature(server_override.lstat()) != server_override_metadata):
                raise ValueError('Server override changed during snapshot')
        print(json.dumps({'serverOverride': {
            'source': str(server_override), 'destination': 'server.js',
            'sha256': hashlib.sha256(server_override_bytes).hexdigest(),
            'bytes': len(server_override_bytes), 'sourceTreeModified': False,
        }}), file=sys.stderr)

    # Complete preflight before allocating a destination.
    for name in root_files + required_modules:
        require_regular(root, name)
    for name in trees:
        if not stat.S_ISDIR((root / name).lstat().st_mode):
            raise ValueError(f'Required directory is missing or unsafe: {name}')

    directories = []
    files = [Path(name) for name in root_files]
    for tree in trees:
        for current, names, filenames in os.walk(root / tree, followlinks=False):
            relative_directory = Path(current).relative_to(root)
            directories.append(relative_directory)
            retained = []
            for name in sorted(names + filenames):
                relative = relative_directory / name
                if excluded(relative):
                    continue
                mode = (root / relative).lstat().st_mode
                if stat.S_ISLNK(mode):
                    raise ValueError(f'Symlink rejected: {relative}')
                if stat.S_ISDIR(mode):
                    retained.append(name)
                elif stat.S_ISREG(mode):
                    files.append(relative)
                else:
                    raise ValueError(f'Non-regular source entry rejected: {relative}')
            names[:] = retained

    for name in ('package.json', 'package-lock.json'):
        with source_handle(Path(name)) as handle:
            json.load(handle)

    # Bound all selected inputs before allocating or copying a destination.
    source_metadata = {}
    total_bytes = 0
    for relative in files:
        info = source_path(relative).lstat()
        if not stat.S_ISREG(info.st_mode):
            raise ValueError(f'Unsafe source entry: {relative}')
        source_metadata[relative] = signature(info)
        if (relative == Path('server.js') and server_override is not None
                and source_metadata[relative] != server_override_metadata):
            raise ValueError('Server override changed after snapshot')
        total_bytes += info.st_size
    if len(files) > MAX_CONTEXT_FILES or total_bytes > MAX_CONTEXT_BYTES:
        raise ValueError(f'Context limit exceeded: {len(files)} files, '
                         f'{total_bytes} bytes; limits {MAX_CONTEXT_FILES} files, '
                         f'{MAX_CONTEXT_BYTES} bytes')

    # Parse required JavaScript without executing it before image construction.
    node = shutil.which('node')
    if node is None:
        raise ValueError('Node is required for syntax preflight')
    check_env = {'PATH': os.environ.get('PATH', '/usr/bin:/bin'), 'LANG': 'C.UTF-8'}
    for name in root_files + required_modules:
        if Path(name).suffix not in {'.js', '.cjs', '.mjs'}:
            continue
        command = [node, '--check', str(root / name)]
        input_bytes = None
        if name == 'server.js' and server_override is not None:
            # Parse the snapshotted CommonJS server bytes, regardless of suffix.
            command = [node, '--input-type=commonjs', '--check']
            input_bytes = server_override_bytes
        result = subprocess.run(command, input=input_bytes, env=check_env,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                timeout=20, check=False)
        if result.returncode:
            # Never echo source snippets or potentially sensitive parser stderr.
            raise ValueError(f'JavaScript syntax check failed: {name}')

    if requested:
        candidate = Path(os.path.abspath(requested))
        if os.path.lexists(candidate):
            raise ValueError('Destination already exists; choose a new directory.')
        if candidate == root or root in candidate.parents:
            raise ValueError('Destination must be outside the source repository.')
        for parent in candidate.parents:
            if parent.is_symlink():
                raise ValueError('Destination ancestors must not be symlinks.')
        candidate.mkdir(mode=0o700)
        destination = candidate
    else:
        result = subprocess.run(
            ['mktemp', '-d', '/tmp/sheikha-deploy.XXXXXX'],
            check=True, text=True, stdout=subprocess.PIPE,
        )
        destination = Path(result.stdout.strip())

    for relative in directories:
        (destination / relative).mkdir(mode=0o700, parents=True, exist_ok=True)
    total_bytes = 0
    for relative in files:
        with source_handle(relative) as source:
            info = os.fstat(source.fileno())
            if signature(info) != source_metadata[relative]:
                raise ValueError(f'Source changed after preflight: {relative}')
            with (destination / relative).open('xb') as target:
                shutil.copyfileobj(source, target)
            if signature(os.fstat(source.fileno())) != source_metadata[relative]:
                raise ValueError(f'Source changed during copy: {relative}')
            (destination / relative).chmod(stat.S_IMODE(info.st_mode) & 0o777)
            total_bytes += info.st_size

    # Static presence and exclusion checks; no application or dependency install.
    for name in root_files + required_modules:
        require_regular(destination, name)
    for current, names, filenames in os.walk(destination, followlinks=False):
        for name in names + filenames:
            path = Path(current) / name
            relative = path.relative_to(destination)
            if path.is_symlink() or excluded(relative):
                raise ValueError(f'Unsafe entry in context: {relative}')
    print(f'Prepared {len(files)} files ({total_bytes} bytes); static checks passed.',
          file=sys.stderr)
    print(destination)
except Exception as error:
    print(f'Context preparation failed: {error}', file=sys.stderr)
    if destination is not None:
        print(f'Incomplete context retained for inspection: {destination}', file=sys.stderr)
    sys.exit(1)
PY
