'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const [mode='status',...args]=process.argv.slice(2);
function run(command,args){const r=cp.spawnSync(command,args,{encoding:'utf8',timeout:30000,maxBuffer:131072});if(r.error||r.status!==0)throw Error('TOOLCHAIN_COMMAND_FAILED: '+command);return r.stdout;}
function status(){const versions={};for(const command of ['gcc','clang','cmake','ninja'])versions[command]=run(command,['--version']).split('\n')[0];return {status:'LOCAL_TOOLCHAIN_AVAILABLE',versions,productionReady:false};}
if(mode==='status'&&args.length===0)console.log(JSON.stringify(status()));
else if(mode==='verify'&&args.length===1){
 const project=require('../../core/platform/sheikha-sdp-project-v1.cjs');project.validateId(args[0]);
 if(process.platform!=='linux'||process.arch!=='x64')throw Error('TOOLCHAIN_HOST_DENIED');
 const tools=status(),snapshot=project.buildProject(args[0]);
 const compiled=project.compileProject(fs.readFileSync(path.join(snapshot.buildDirectory,'main.shk'),'utf8'));
 const code=require('../../core/platform/sheikha-sdp-native-linux-v1.cjs').generate(compiled.bytecode);
 const dir=fs.mkdtempSync(path.join(path.dirname(snapshot.buildDirectory),'toolchain-'));fs.chmodSync(dir,0o700);
 fs.writeFileSync(path.join(dir,'program.c'),code,{flag:'wx',mode:0o600});
 fs.writeFileSync(path.join(dir,'CMakeLists.txt'),'cmake_minimum_required(VERSION 3.22)\nproject(SheikhaToolchain LANGUAGES C)\nadd_executable(sheikha-check program.c)\ntarget_compile_options(sheikha-check PRIVATE -Wall -Wextra -Werror)\n',{flag:'wx',mode:0o600});
 run('cmake',['-S',dir,'-B',path.join(dir,'build'),'-G','Ninja','-DCMAKE_C_COMPILER=/usr/bin/clang']);
 run('cmake',['--build',path.join(dir,'build')]);
 const binary=path.join(dir,'build/sheikha-check'),bytes=fs.readFileSync(binary);
 if(bytes.subarray(0,4).toString('hex')!=='7f454c46'||bytes[4]!==2||bytes.readUInt16LE(18)!==62)throw Error('TOOLCHAIN_ELF_DENIED');
 const output=run(binary,[]),expected=compiled.execution.output.map(x=>x+'\n').join('');if(output!==expected)throw Error('TOOLCHAIN_OUTPUT_MISMATCH');
 const report={timestamp:new Date().toISOString(),status:'LOCAL_TOOLCHAIN_BUILD_EXECUTION_VERIFIED',id:args[0],tools,sourceSha256:compiled.sourceSha256,snapshot:path.relative(root,snapshot.buildDirectory),binarySha256:crypto.createHash('sha256').update(bytes).digest('hex'),output,vmOutputMatched:true,binding:compiled.binding,bareMetal:false,externalCertificationGranted:false,productionReady:false};
 fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
 const files=['program.c','CMakeLists.txt','build/sheikha-check','verification.json'];fs.writeFileSync(path.join(dir,'SHA256SUMS'),files.map(f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,f))).digest('hex')+'  '+f).join('\n')+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:report.status,directory:dir,output,vmOutputMatched:true,productionReady:false}));
}else throw Error('TOOLCHAIN_ARGUMENTS_DENIED');
