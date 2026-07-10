'use strict';

const path = require('node:path');

const { createDeterministicTar } = require('../../common/distribution-utils');
const { stageCli } = require('../../common/source-staging-engine');

const TARGET_ID = 'linux-cli-x86_64';

function canBuild(context) {
  return context.host.platform === 'linux' &&
    context.host.architecture === 'x86_64' &&
    Boolean(context.toolchain.tools.node && context.toolchain.tools.tar && context.toolchain.tools.gzip);
}

function build(context, target) {
  const stage = stageCli(context, target);
  const artifactPath = path.join(context.artifactDir, target.artifactName);
  createDeterministicTar(stage.parent, stage.rootName, artifactPath);
  return {
    targetId: target.id,
    artifactPath,
    adapter: 'SHEIKHA_LINUX_CLI_TAR_ADAPTER_V1',
    stageRoot: stage.root
  };
}

module.exports = { TARGET_ID, build, canBuild };
