#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {loadSourceProgram} = require('../../sheikha-language/compiler/source-loader');
const {lowerToIR} = require('../../sheikha-language/compiler/ir');
const {typeCheckAst} = require('../../sheikha-language/compiler/type-checker');
const {compileIRToBytecode} = require('../../sheikha-language/compiler/bytecode');
const {generateTarget} = require('../../sheikha-language/compiler/target-generators');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = 'sheikha-language/system/sheikha-sovereign-architecture-v1.shk';
const OUTPUT = path.join(ROOT, 'dist/sheikha-language-products/v1');

function sha256(data) { return crypto.createHash('sha256').update(data).digest('hex'); }

function build(outputDirectory = OUTPUT) {
  const sourceProgram = loadSourceProgram(SOURCE);
  const typeCheck = typeCheckAst(sourceProgram.ast);
  if (!typeCheck.ok) throw new Error('SHEIKHA_SOURCE_TYPECHECK_FAILED');
  const ir = lowerToIR(sourceProgram.ast);
  const bytecode = compileIRToBytecode(ir);
  const files = {
    'source/sheikha-sovereign-architecture-v1.shk': `${sourceProgram.source.trimEnd()}\n`,
    'intermediate/program.ast.json': `${JSON.stringify(sourceProgram.ast, null, 2)}\n`,
    'intermediate/program.ir.json': `${JSON.stringify(ir, null, 2)}\n`,
    'intermediate/program.types.json': `${JSON.stringify(typeCheck, null, 2)}\n`,
    'runtime/program.bytecode.json': `${JSON.stringify(bytecode, null, 2)}\n`
  };
  for (const [target, file] of Object.entries({javascript: 'generated/program.js', python: 'generated/program.py', php: 'generated/program.php'})) {
    files[file] = generateTarget(target, {sourceProgram, ast: sourceProgram.ast, ir, typeCheck, bytecode, outputPath: file});
  }
  fs.rmSync(outputDirectory, {recursive: true, force: true});
  fs.mkdirSync(outputDirectory, {recursive: true});
  const artifacts = [];
  for (const [relative, content] of Object.entries(files)) {
    const absolute = path.join(outputDirectory, relative);
    fs.mkdirSync(path.dirname(absolute), {recursive: true});
    fs.writeFileSync(absolute, content, 'utf8');
    artifacts.push({path: relative, bytes: Buffer.byteLength(content), sha256: sha256(content)});
  }
  const manifest = {
    schemaVersion: '1.0.0', system: 'SHEIKHA_ARABIC_LANGUAGE_PRODUCTS_RELEASE_V1',
    status: 'BOUNDED_HOSTED_PRODUCTS_BUILT', sourceLanguage: 'sheikha', sourceKind: 'shk',
    targets: ['BYTECODE_VM', 'JSON_IR', 'JAVASCRIPT', 'PYTHON', 'PHP'], artifacts,
    boundaries: {nativeKernelObjectIncluded: false, firmwareImageIncluded: false, selfHostedCompilerClaimed: false, productionDeploymentPerformed: false}
  };
  manifest.releaseSha256 = sha256(JSON.stringify(manifest));
  fs.writeFileSync(path.join(outputDirectory, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDirectory, 'README-AR.md'), [
    '# منتجات لغة شيخة العربية V1', '',
    'حزمة تطويرية مولدة من مصدر `.shk` عربي محكوم.',
    'تشمل AST وIR وbytecode ومخرجات JavaScript وPython وPHP.',
    'لا تحتوي Kernel native أو Firmware، ولا تنفذ نشرًا أو أوامر نظام.', '',
    `بصمة الإصدار: \`${manifest.releaseSha256}\``, ''
  ].join('\n'));
  return manifest;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(build(), null, 2)}\n`);
module.exports = {OUTPUT, SOURCE, build};
