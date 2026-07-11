'use strict';

module.exports = {
  ...require('./bare-metal/bare-metal-artifact-adapter-v2'),
  ...require('./cli/sheikha-cli-distribution-adapter-v2'),
  ...require('./linux/linux-v1-bridge-adapter-v2'),
  ...require('./macos/macos-readiness-adapter-v2'),
  ...require('./vscode/vscode-extension-adapter-v2'),
  ...require('./windows/windows-installer-adapter-v2')
};
