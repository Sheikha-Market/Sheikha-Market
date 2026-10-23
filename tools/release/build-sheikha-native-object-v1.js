#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {loadSourceProgram} = require('../../sheikha-language/compiler/source-loader');
const {lowerToIR} = require('../../sheikha-language/compiler/ir');
const {typeCheckAst} = require('../../sheikha-language/compiler/type-checker');
const {compileIRToBytecode} = require('../../sheikha-language/compiler/bytecode');
const {generateTarget} = require('../../sheikha-language/compiler/target-generators');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = 'sheikha-language/kernel/sheikha-native-kernel-v1.shk';
const OUTPUT = path.join(ROOT, 'dist/sheikha-language-native/v1');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

function build(outputDirectory = OUTPUT) {
  const sourceProgram = loadSourceProgram(SOURCE);
  const typeCheck = typeCheckAst(sourceProgram.ast);
  if (!typeCheck.ok) throw new Error('SHEIKHA_NATIVE_SOURCE_TYPECHECK_FAILED');
  const ir = lowerToIR(sourceProgram.ast);
  const bytecode = compileIRToBytecode(ir);
  const cPath = path.join(outputDirectory, 'sheikha-native-kernel-v1.c');
  const objectPath = path.join(outputDirectory, 'sheikha-native-kernel-v1.o');
  const cSource = generateTarget('freestanding-c11', {sourceProgram, ast: sourceProgram.ast, ir, typeCheck, bytecode, outputPath: cPath});
  fs.rmSync(outputDirectory, {recursive: true, force: true});
  fs.mkdirSync(outputDirectory, {recursive: true});
  fs.writeFileSync(cPath, cSource, 'utf8');
  execFileSync(process.env.CC || 'cc', ['-std=c11', '-ffreestanding', '-fno-builtin', '-fno-stack-protector', '-fno-pic', '-c', cPath, '-o', objectPath], {stdio: 'pipe'});
  const cBytes = fs.readFileSync(cPath);
  const objectBytes = fs.readFileSync(objectPath);
  const manifest = {
    schemaVersion: '1.0.0', system: 'SHEIKHA_NATIVE_LANGUAGE_OBJECT_V1',
    status: 'NATIVE_RELOCATABLE_OBJECT_BUILT', architecture: process.arch,
    sourceLanguage: 'sheikha', bootstrapCompiler: 'Node.js', nativeBackend: 'freestanding-c11',
    source: SOURCE,
    kernelLogic: {
      uefiHandoffGuardGeneratedFromSheikha: true,
      controlledHaltModeGeneratedFromSheikha: true,
      completeKernelInSheikha: false
    },
    artifacts: {c: {path: path.basename(cPath), sha256: sha256(cBytes), bytes: cBytes.length}, object: {path: path.basename(objectPath), sha256: sha256(objectBytes), bytes: objectBytes.length}},
    boundaries: {selfHostedCompiler: false, completeKernel: false, bootableArtifact: false, firmwareImage: false, hostCompilerRequiredAtBuildTime: true, hostRuntimeRequiredAfterLink: false}
  };
  manifest.manifestSha256 = sha256(JSON.stringify(manifest));
  fs.writeFileSync(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(build(), null, 2)}\n`);
module.exports = {build, OUTPUT};
