#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { privatePath, readPrivate } = require('./evaluate-shared-goals-v1');
const { buildOperatingKit } = require('../../core/partnerships/operating-kit-v1');

function run(args) {
  if (args.length !== 4 || args[0] !== '--input' || args[2] !== '--out') throw new Error('USAGE: --input PRIVATE_JSON --out NEW_PRIVATE_DIRECTORY');
  const input = privatePath(args[1]), output = privatePath(args[3]);
  if (fs.existsSync(output)) throw new Error('OUTPUT_ALREADY_EXISTS');
  if ((fs.statSync(path.dirname(output)).mode & 0o777) !== 0o700) throw new Error('OUTPUT_PARENT_MODE_700_REQUIRED');
  const kit = buildOperatingKit(JSON.parse(readPrivate(input).toString('utf8')));
  fs.mkdirSync(output, { mode: 0o700 });
  const write = (file, data) => fs.writeFileSync(path.join(output, file), JSON.stringify(data, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  write('operating-kit.json', kit);
  for (const calendar of kit.partnerCalendars) write(`partner-${calendar.relationshipId}.json`, { classification: kit.classification, dataMode: kit.dataMode, calendar, sent: false });
  for (const organization of kit.organizations) {
    write(`organization-${organization.organizationId}.json`, organization);
    const directory = `organization-${organization.organizationId}`;
    fs.mkdirSync(path.join(output, directory), { mode: 0o700 });
    for (const department of organization.departments) write(path.join(directory, `department-${department.id}.json`), {
      classification: kit.classification, dataMode: kit.dataMode, asOf: kit.asOf,
      department, sent: false, scopeNote: 'PRIVATE_INTERNAL_DRAFT_NOT_AUTHENTICATED_RECIPIENT_DELIVERY'
    });
  }
  const escape = value => String(value).replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char])).replace(/[\\`*_[\]{}()!|#]/g, '\\$&').replace(/[\r\n]+/g, ' ');
  const lines = ['# جداول الشركاء والتعليم والمراجعة', '', 'سري: مسودة، لا توقيع أو إرسال أو ترخيص نافذ.', `نوع البيانات: ${kit.dataMode}.`, ''];
  for (const calendar of kit.partnerCalendars) {
    lines.push(`## ${escape(calendar.displayName)}`, '| اليوم النسبي | الموعد المقترح UTC | العمل | المسؤول |', '|---:|---|---|---|');
    for (const step of calendar.milestones) lines.push(`| ${step.dayFromPlanStart} | ${step.proposedAt} | ${escape(step.title)} | ${escape(step.ownerId)} |`);
    if (!calendar.milestones.length) lines.push('لا جدولة لعلاقة مغلقة أو موقوفة.');
    lines.push('هذه مواعيد مقترحة من تاريخ الخطة، وليست التزامات وافق عليها الطرف الآخر.', '');
  }
  for (const unit of kit.methodologyUnits) {
    lines.push(`## منهج: ${escape(unit.title)}`, `الجمهور: ${escape(unit.audience)}. المتطلبات: ${escape(unit.prerequisites)}.`, `تغطية حقول البروتوكول: ${unit.protocolReview.completenessScore}%. ليست درجة صحة علمية.`, `موعد مراجعة الإصدار: ${unit.reviewBy}.`, '');
    for (const lesson of unit.lessons) lines.push(`### الدرس ${lesson.order}`, `الهدف: ${escape(lesson.objective)}`, `التوجيه: ${escape(lesson.explanation)}`, `تمرين: ${escape(lesson.exercise)}`, `معيار القبول: ${escape(lesson.assessmentCriterion)}`, '');
  }
  for (const org of kit.organizations) {
    lines.push(`## الهيكل: ${escape(org.displayName)}`, `الرؤية: ${escape(org.vision)}`, `الرسالة: ${escape(org.mission)}`, 'الحالة: متابعة وتخطيط محليان؛ لم تبدأ عمليات خارجية أو وكلاء دائمون.', '| الإدارة | الدور الرقمي | المسؤول | عدد المهام | حمل زائد |', '|---|---|---|---:|---|');
    for (const dept of org.departments) lines.push(`| ${escape(dept.nameAr)} | ${escape(dept.manager.roleNameAr)} | ${escape(dept.manager.humanOwnerId)} | ${dept.tasks.length} | ${dept.capacity.overloaded === null ? 'غير معلوم' : dept.capacity.overloaded ? 'نعم' : 'لا بحسب السعة المعلنة'} |`);
    lines.push('');
  }
  lines.push('## التوقيع والتراخيص', `طلبات توقيع للمراجعة: ${kit.signingReviews.length}. اتفاقيات موقعة: 0.`, `طلبات حقوق للمراجعة: ${kit.licenseReviews.length}. تراخيص ممنوحة: 0.`, 'المخرجات تتطلب تحقق هوية وصلاحية ومراجعة حقوق، ولا تغير أي قانون أو حقيقة علمية.', '');
  fs.writeFileSync(path.join(output, 'schedules-and-curricula.ar.md'), lines.join('\n'), { mode: 0o600, flag: 'wx' });
  write('completion.json', { complete: true, packSha256: kit.packSha256, externalMessagesSent: 0, agreementsSigned: 0, licensesIssued: 0 });
  return { complete: true, calendars: kit.partnerCalendars.length, curricula: kit.methodologyUnits.length, organizations: kit.organizations.length, departments: kit.organizations.reduce((sum, org) => sum + org.departments.length, 0), packSha256: kit.packSha256, agreementsSigned: 0 };
}
if (require.main === module) {
  try { console.log(JSON.stringify(run(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(JSON.stringify({ complete: false, error: /^[A-Z0-9_: -]+$/.test(error.message) ? error.message : 'PRIVATE_KIT_BUILD_FAILED' })); process.exitCode = 1; }
}
module.exports = { run };
