'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  copyPath,
  resetGeneratedDir,
  run,
  setTreeTimestamp
} = require('../../common/distribution-utils');
const { stageRuntimeSource } = require('../../common/source-staging-engine');

const TARGET_ID = 'linux-deb-amd64';

function canBuild(context) {
  return context.host.platform === 'linux' &&
    context.host.architecture === 'x86_64' &&
    Boolean(context.toolchain.tools['dpkg-deb']);
}

function build(context, target) {
  const source = stageRuntimeSource(context, target);
  const packageRoot = path.join(context.stagingRoot, `${target.id}-package`);
  const appRoot = path.join(packageRoot, 'usr', 'lib', 'sheikha');
  resetGeneratedDir(packageRoot);
  copyPath(source.root, appRoot);

  const debianRoot = path.join(packageRoot, 'DEBIAN');
  fs.mkdirSync(debianRoot, { recursive: true });
  fs.writeFileSync(path.join(debianRoot, 'control'), [
    'Package: sheikha',
    `Version: ${context.version}`,
    'Section: web',
    'Priority: optional',
    'Architecture: amd64',
    'Maintainer: Sheikha Local Release <local-release@sheikha.invalid>',
    'Depends: nodejs (>= 20), npm',
    'Description: Sheikha local-first server source runtime and CLI',
    ' Includes the governed Sheikha CLI and server source. Production dependencies',
    ' are installed explicitly with npm ci --omit=dev after package installation.',
    ''
  ].join('\n'));

  const launcher = path.join(packageRoot, 'usr', 'bin', 'sheikha');
  fs.mkdirSync(path.dirname(launcher), { recursive: true });
  fs.writeFileSync(launcher, [
    '#!/bin/sh',
    'exec node /usr/lib/sheikha/bin/sheikha "$@"',
    ''
  ].join('\n'));
  fs.chmodSync(launcher, 0o755);
  setTreeTimestamp(packageRoot, 0);

  const artifactPath = path.join(context.artifactDir, target.artifactName);
  run('dpkg-deb', ['--build', '--root-owner-group', packageRoot, artifactPath], {
    env: { SOURCE_DATE_EPOCH: '0' },
    timeout: 300000
  });
  return {
    targetId: target.id,
    artifactPath,
    adapter: 'SHEIKHA_LINUX_DEB_ADAPTER_V1',
    stageRoot: packageRoot
  };
}

module.exports = { TARGET_ID, build, canBuild };
