'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || '/work');
const nodeModulesRoot = path.join(root, 'node_modules');
const lockPath = path.join(root, 'package-lock.json');
const reportPath = path.join(
  root,
  'dependency-closure.json'
);

function writeReport(report) {
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
}

function fail(message, details = {}) {
  const report = {
    schemaVersion: '6.0.0',
    system: 'SHEIKHA_V6_OFFLINE_PRODUCTION_CLOSURE',
    status: 'PRODUCTION_CLOSURE_FAILED',
    message,
    ...details,
    externalNetworkUsed: false,
    npmRegistryUsed: false,
    npmCommandUsed: false,
    lifecycleScriptsExecuted: false
  };

  writeReport(report);
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

if (!fs.existsSync(lockPath)) {
  fail('package-lock.json is missing');
}

if (!fs.existsSync(nodeModulesRoot)) {
  fail('node_modules is missing');
}

let lock;

try {
  lock = JSON.parse(
    fs.readFileSync(lockPath, 'utf8')
  );
} catch (error) {
  fail('package-lock.json is invalid', {
    error: error.message
  });
}

if (
  !lock.packages ||
  typeof lock.packages !== 'object'
) {
  fail(
    'package-lock.json has no packages map',
    {
      lockfileVersion: lock.lockfileVersion ?? null
    }
  );
}

const lockEntries = Object.entries(
  lock.packages
).filter(([relative]) => (
  relative.startsWith('node_modules/')
));

const lockMap = new Map(lockEntries);

function normalized(relative) {
  return relative
    .split(path.sep)
    .join('/');
}

function depth(relative) {
  return normalized(relative).split('/').length;
}

function safeRemove(relative) {
  const target = path.resolve(root, relative);

  if (
    target !== nodeModulesRoot &&
    !target.startsWith(`${nodeModulesRoot}${path.sep}`)
  ) {
    fail('Removal outside node_modules was refused', {
      relative,
      target
    });
  }

  fs.rmSync(target, {
    recursive: true,
    force: true
  });
}

function discoverPackages(
  nodeModulesAbsolute,
  nodeModulesRelative,
  packages,
  symlinks
) {
  if (!fs.existsSync(nodeModulesAbsolute)) {
    return;
  }

  for (
    const entry of fs.readdirSync(
      nodeModulesAbsolute,
      { withFileTypes: true }
    )
  ) {
    if (
      entry.name === '.bin' ||
      entry.name.startsWith('.')
    ) {
      continue;
    }

    const entryAbsolute = path.join(
      nodeModulesAbsolute,
      entry.name
    );

    const entryRelative = normalized(
      path.join(
        nodeModulesRelative,
        entry.name
      )
    );

    if (entry.isSymbolicLink()) {
      let resolved = null;

      try {
        resolved = fs.realpathSync(entryAbsolute);
      } catch {
        resolved = 'BROKEN';
      }

      symlinks.push({
        path: entryRelative,
        resolved
      });

      continue;
    }

    if (
      entry.name.startsWith('@') &&
      entry.isDirectory()
    ) {
      for (
        const scoped of fs.readdirSync(
          entryAbsolute,
          { withFileTypes: true }
        )
      ) {
        if (!scoped.isDirectory()) {
          continue;
        }

        const packageAbsolute = path.join(
          entryAbsolute,
          scoped.name
        );

        const packageRelative = normalized(
          path.join(
            entryRelative,
            scoped.name
          )
        );

        if (
          fs.existsSync(
            path.join(
              packageAbsolute,
              'package.json'
            )
          )
        ) {
          packages.add(packageRelative);

          discoverPackages(
            path.join(
              packageAbsolute,
              'node_modules'
            ),
            normalized(
              path.join(
                packageRelative,
                'node_modules'
              )
            ),
            packages,
            symlinks
          );
        }
      }

      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    if (
      !fs.existsSync(
        path.join(entryAbsolute, 'package.json')
      )
    ) {
      continue;
    }

    packages.add(entryRelative);

    discoverPackages(
      path.join(entryAbsolute, 'node_modules'),
      normalized(
        path.join(
          entryRelative,
          'node_modules'
        )
      ),
      packages,
      symlinks
    );
  }
}

function platformConstraintAllows(
  constraints,
  current
) {
  if (
    !Array.isArray(constraints) ||
    constraints.length === 0
  ) {
    return true;
  }

  const positive = constraints
    .map(String)
    .filter(value => !value.startsWith('!'));

  const negative = constraints
    .map(String)
    .filter(value => value.startsWith('!'))
    .map(value => value.slice(1));

  if (negative.includes(current)) {
    return false;
  }

  return (
    positive.length === 0 ||
    positive.includes(current)
  );
}

function requiredOnCurrentPlatform(metadata) {
  return (
    platformConstraintAllows(
      metadata?.os,
      'linux'
    ) &&
    platformConstraintAllows(
      metadata?.cpu,
      'x64'
    ) &&
    platformConstraintAllows(
      metadata?.libc,
      'glibc'
    )
  );
}

const installedBefore = new Set();
const symlinksBefore = [];

discoverPackages(
  nodeModulesRoot,
  'node_modules',
  installedBefore,
  symlinksBefore
);

const devOnlyPaths = lockEntries
  .filter(([, metadata]) => (
    metadata?.dev === true
  ))
  .map(([relative]) => relative)
  .sort((left, right) => (
    depth(right) - depth(left)
  ));

const extraneousPaths = [...installedBefore]
  .filter(relative => !lockMap.has(relative))
  .sort((left, right) => (
    depth(right) - depth(left)
  ));

for (const relative of devOnlyPaths) {
  safeRemove(relative);
}

for (const relative of extraneousPaths) {
  safeRemove(relative);
}

for (const generatedPath of [
  'node_modules/.cache',
  'node_modules/.package-lock.json'
]) {
  safeRemove(generatedPath);
}

function cleanDanglingBinLinks(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (
    const entry of fs.readdirSync(
      directory,
      { withFileTypes: true }
    )
  ) {
    const absolute = path.join(
      directory,
      entry.name
    );

    if (entry.isSymbolicLink()) {
      try {
        fs.realpathSync(absolute);
      } catch {
        fs.rmSync(absolute, {
          force: true
        });
      }

      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === '.bin') {
      for (
        const binEntry of fs.readdirSync(
          absolute,
          { withFileTypes: true }
        )
      ) {
        if (!binEntry.isSymbolicLink()) {
          continue;
        }

        const binAbsolute = path.join(
          absolute,
          binEntry.name
        );

        try {
          fs.realpathSync(binAbsolute);
        } catch {
          fs.rmSync(binAbsolute, {
            force: true
          });
        }
      }

      continue;
    }

    cleanDanglingBinLinks(absolute);
  }
}

cleanDanglingBinLinks(nodeModulesRoot);

const installedAfter = new Set();
const symlinksAfter = [];

discoverPackages(
  nodeModulesRoot,
  'node_modules',
  installedAfter,
  symlinksAfter
);

const missingRequired = [];

for (const [relative, metadata] of lockEntries) {
  if (metadata?.dev === true) {
    continue;
  }

  if (fs.existsSync(path.join(root, relative))) {
    continue;
  }

  if (metadata?.optional === true) {
    continue;
  }

  if (!requiredOnCurrentPlatform(metadata)) {
    continue;
  }

  missingRequired.push(relative);
}

const remainingDevPackages = [
  ...installedAfter
].filter(relative => (
  lockMap.get(relative)?.dev === true
));

const remainingExtraneousPackages = [
  ...installedAfter
].filter(relative => (
  !lockMap.has(relative)
));

const externalOrBrokenSymlinks = [];

for (const item of symlinksAfter) {
  if (item.resolved === 'BROKEN') {
    externalOrBrokenSymlinks.push(item);
    continue;
  }

  const resolved = path.resolve(item.resolved);

  if (
    resolved !== nodeModulesRoot &&
    !resolved.startsWith(
      `${nodeModulesRoot}${path.sep}`
    )
  ) {
    externalOrBrokenSymlinks.push(item);
  }
}

const passed = (
  missingRequired.length === 0 &&
  remainingDevPackages.length === 0 &&
  remainingExtraneousPackages.length === 0 &&
  externalOrBrokenSymlinks.length === 0
);

const report = {
  schemaVersion: '6.0.0',
  system: 'SHEIKHA_V6_OFFLINE_PRODUCTION_CLOSURE',
  status: passed
    ? 'PRODUCTION_CLOSURE_VERIFIED'
    : 'PRODUCTION_CLOSURE_FAILED',
  lockfileVersion: lock.lockfileVersion ?? null,
  initiallyInstalledCount: installedBefore.size,
  productionInstalledCount: installedAfter.size,
  removedDevPackageCount: devOnlyPaths.length,
  removedExtraneousPackageCount:
    extraneousPaths.length,
  missingRequiredCount: missingRequired.length,
  remainingDevPackageCount:
    remainingDevPackages.length,
  remainingExtraneousPackageCount:
    remainingExtraneousPackages.length,
  invalidSymlinkCount:
    externalOrBrokenSymlinks.length,
  missingRequired,
  remainingDevPackages,
  remainingExtraneousPackages,
  invalidSymlinks: externalOrBrokenSymlinks,
  externalNetworkUsed: false,
  npmRegistryUsed: false,
  npmCommandUsed: false,
  lifecycleScriptsExecuted: false,
  source:
    'project-local-node_modules-and-package-lock',
  claim:
    'Production dependency closure was derived locally. ' +
    'No reproducible npm installation is claimed.'
};

writeReport(report);
console.log(JSON.stringify(report, null, 2));

process.exit(passed ? 0 : 1);
