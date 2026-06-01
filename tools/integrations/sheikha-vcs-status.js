'use strict';

const fs = require('fs');

const fabric = JSON.parse(
  fs.readFileSync('runtime/integrations/vcs/sheikha-vcs-integration-fabric.json', 'utf8')
);

console.log(JSON.stringify({
  fabric: fabric.fabric,
  status: fabric.status,
  git: fabric.scope.git.status,
  github: fabric.scope.github.status,
  gitlab: fabric.scope.gitlab.status,
  vscodeExtension: fabric.scope.vscode_extension.status,
  rule: fabric.rule,
  principle: fabric.principle
}, null, 2));
