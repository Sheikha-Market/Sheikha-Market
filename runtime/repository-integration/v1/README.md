# Sheikha Repository Integration V1

Read-only integration inspection shared by Sheikha CLI, Studio, Model Hub and
the JavaScript API SDK. Git, Node.js and Docker remain their upstream products;
the Sheikha layer does not change their ownership or license requirements.

## Scope And Evidence

The owner-controlled `config/sheikha-repository-integrations-v1.json` registers
local repositories. The default contains only this portal, not every repository
on the machine or in external accounts. A registry may contain 1-32 entries:

```json
{
  "schemaVersion": 1,
  "repositories": [
    { "id": "sheikha-main-portal", "root": "." },
    { "id": "another-owned-project", "root": "../another-owned-project" }
  ]
}
```

Add only repositories the operator is authorized to inspect. Roots must exist,
be canonical directories, and be actual Git roots (ordinary or bare). The service
does not discover remote accounts, clone repositories, follow source symlinks,
or accept HTTP path overrides. Missing repositories remain visibly unavailable.
Only fixed component paths are read; environment files and Git remote URLs are
not returned. No project scripts, package installers or Git hooks are executed.
Git, Docker and Unix file-flag handling currently target Linux, not untested OSes.

Evidence includes HEAD, aggregate worktree counts, fixed source-file hashes,
observed CLI versions and declared Node engine constraints. It does not prove
runtime deployment, model quality, commercial readiness or license ownership.
The snapshot is best-effort, not an atomic release attestation. SHA-256 detects
changes; it is not a signature or independent certification. Untracked directory
entries are counts from Git, not a recursive count of individual files.

## Local CLI

```bash
node cli/sheikha/sheikha-cli.js integrations
node tools/integrations/sheikha-repositories-v1.cjs
```

The standalone CLI accepts owner-supplied `--root PATH` and `--registry FILE`.
Exit codes: `0` registered repositories observed, `2` incomplete repository
inspection, `1` invalid configuration or failure. `0` does not mean production
ready. Neither command writes an evidence file or changes Git.

## HTTP And SDK

The existing server mounts these administrator-only GET routes:

- `/api/sheikha/model-hub/v1/integrations/status`
- `/api/sheikha/model-hub/v1/integrations/visual-health`
- `/api/sheikha/studio/v1/repository-integrations/status`
- `/api/sheikha/studio/v1/repository-integrations/visual-health`

Use the existing authenticated administrator session; no alternate inspection
password or token is created. Query overrides are refused. Responses use
`Cache-Control: no-store`. There are no mutation endpoints. Loading new routes
requires the normal reviewed application release/reload; this implementation
does not restart a running production service.

```js
const { createSheikhaApiClient } = require('../../../sdk/sheikha-api');
const client = createSheikhaApiClient({
  baseUrl: 'http://127.0.0.1:8080',
  token: process.env.SHEIKHA_ADMIN_SESSION_TOKEN
});
const repositories = await client.repositoryIntegrations.status();
const visual = await client.repositoryIntegrations.visualHealth();
```

HTTP inspection runs in a worker with a 15-second cancellation timer, 64 MiB
old-generation limit, one active job per process and a five-second snapshot
cache. Worker termination can wait for the current bounded Git subprocess.
Concurrent identical requests share a job; competing registries fail closed.
Each Git command has a three-second timeout and 1 MiB output limit. Source reads
are bounded; oversize, unreadable or unsafe files are not declared verified.
These are per-process limits, not a distributed rate limiter or memory SLA.

Visual health makes one bounded request to
`http://127.0.0.1:8093/api/drawing/status`. It does not follow redirects, forward
credentials, return raw service contents or accept another host. It checks the
V2 status contract with a 1.5-second timeout and 32 KiB body limit. A successful
contract check is explicitly not proof of rendered graphics or GPU/XR support.

## Docker And Node

`infra/docker/repository-integration-v1/` contains an optional CLI-inspector
container profile, not a containerization of the whole platform.

```bash
docker compose -f infra/docker/repository-integration-v1/compose.yaml config --quiet
```

This validates configuration without building or running a container. The
profile declares no runtime network, a read-only repository mount, non-root UID
1000, dropped capabilities, no Docker socket, no exposed ports, and resource
limits. See the [Docker Compose service specification](https://docs.docker.com/reference/compose-file/services/).
The build context is allowlisted and COPY instructions include only the
inspector, CLI and registry. The workspace mount still grants read access to
that authorized workspace; it is not a sandbox for untrusted project code.

Building requires separately permitted image/package downloads. Before release,
review and pin `SHEIKHA_NODE_IMAGE` to an approved digest, scan the resulting
image, check host UID/mount permissions and test the no-network container. The
default mutable Node 22 tag is a preparation choice, not an approved image.
Additional host repositories need individually reviewed read-only mounts and
container-visible registry paths. Do not mount Docker sockets or all of HOME.

Use a supported Node LTS release for production. Node 25 is EOL; Node 22 and 24
are listed as LTS in the [official release table](https://nodejs.org/en/about/previous-releases)
reviewed on 2026-09-24. This integration was tested on the locally installed
Node 22.22.2 and Node 25.6.1; that does not make Node 25 suitable for production
or certify the entire application on Node 22. No system runtime was changed.

## Operational Boundaries

External Git provider configuration is reported as configured, not connected.
Authenticated remote verification and synchronization need a separate approved
scope. No remote fetch/push, model training/download, customer-data transfer,
TPM operation, firmware change, service restart or commercial release is part of
inspection. Disabling this new integration requires only a reviewed removal of
its two route mounts; existing Git repositories need no rollback or reset.
