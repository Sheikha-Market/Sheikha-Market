'use strict';

const crypto = require('node:crypto');
const { runScenario } = require('./sheikha-digital-robot-v1');
const { runConnectorScenario } = require('./sheikha-robotic-connectors-v1.cjs');
const FAMILIES = [
  { id: 'mobile', name: 'المتحرك', code: 'SH-M01', tools: ['camera', 'tray'], mission: 'warehouse-inspection', controller: 'قاعدة بعجلات', axes: ['توجيه', 'حركة القاعدة'], sensors: ['تحديد الموضع', 'مسافة العوائق', 'سرعة العجلات'], parts: ['هيكل القاعدة', 'وحدات حركة', 'برج قياس', 'حجرة طاقة', 'حجرة حوسبة'] },
  { id: 'arm', name: 'الذراع', code: 'SH-A01', tools: ['gripper', 'camera'], mission: 'stationary-sort', controller: 'مفاصل تسلسلية', axes: ['القاعدة', 'الكتف', 'المرفق', 'المعصم'], sensors: ['موضع المفاصل', 'عزم الحمل', 'حضور الأداة'], parts: ['قاعدة تثبيت', 'وصلات مفصلية', 'محاور وسواقات', 'واجهة أداة', 'حجرة تحكم'] },
  { id: 'reception', name: 'الاستقبال', code: 'SH-R01', tools: ['display', 'tray'], mission: 'reception', controller: 'منصة استقبال ثابتة', axes: ['الرأس البصري', 'واجهات العرض'], sensors: ['حضور غير معرف للهوية', 'حالة الواجهة', 'تشخيص محلي'], parts: ['قاعدة ثابتة', 'هيكل رأسي', 'وحدة عرض', 'غلاف قابل للصيانة', 'حجرة حوسبة'] },
  { id: 'digital', name: 'الرقمي', code: 'SH-D01', tools: ['display', 'camera'], mission: 'reception', controller: 'آلة حالات رقمية', axes: ['عرض الحالة', 'دورة المهمة'], sensors: ['نبض التطبيق', 'أحداث محاكاة'], parts: ['نواة الحالة', 'واجهة بصرية', 'مخطط مهمة', 'سجل أدلة'] }
];
const TOOLS = [{ id: 'camera', name: 'وحدة فحص بصرية' }, { id: 'tray', name: 'منصة حمل تصورية' }, { id: 'gripper', name: 'قابض تصوري' }, { id: 'display', name: 'واجهة عرض' }];
const FINISHES = [{ id: 'emerald', name: 'أخضر', color: '#14614f' }, { id: 'pearl', name: 'فاتح', color: '#d9e1de' }, { id: 'graphite', name: 'جرافيت', color: '#394344' }];
const LIMITS = ['EXACT_HARDWARE', 'DEVICE_IDENTITY', 'CALIBRATED_LIMITS', 'INDEPENDENT_SAFETY_REVIEW', 'TOOL_RISK_REVIEW', 'AUTHORIZED_DEVICE_TRIAL'];
const boundaries = () => ({ simulationOnly: true, physicalCommandSent: false, physicalActuationAllowed: false, externalRequestSent: false, approvedForManufacturing: false, patentNoveltyVerified: false });
const copy = value => JSON.parse(JSON.stringify(value));
function exact(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw Error('OBJECT_REQUIRED');
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(value).length !== keys.length || !keys.every(key => Object.hasOwn(descriptors, key) && Object.hasOwn(descriptors[key], 'value'))) throw Error('FIELDS_REJECTED');
}
function validateDesign(input) {
  exact(input, ['family', 'tool', 'finish', 'scale', 'motion']);
  const family = FAMILIES.find(item => item.id === input.family);
  if (!family || !family.tools.includes(input.tool) || !FINISHES.some(item => item.id === input.finish) || !['demonstrate', 'inspect'].includes(input.motion)
    || typeof input.scale !== 'number' || !Number.isFinite(input.scale) || input.scale < 0.8 || input.scale > 1.2) throw Error('DESIGN_REJECTED');
  return { family: input.family, tool: input.tool, finish: input.finish, scale: Math.round(input.scale * 100) / 100, motion: input.motion };
}
function buildDesign(input) {
  const parameters = validateDesign(input), family = FAMILIES.find(item => item.id === parameters.family);
  const id = crypto.createHash('sha256').update(JSON.stringify(parameters)).digest('hex');
  return { schema: 'SHEIKHA_ROBOT_DESIGN_V1', id, code: family.code, title: `شيخة · ${family.name}`, status: 'CONCEPT_REQUIRES_REVIEW', parameters,
    geometry: { units: 'DIMENSIONLESS_VISUAL_UNITS', engine: 'Three.js', physicallyCalibrated: false },
    controller: { profile: family.controller, conceptualAxes: [...family.axes], expectedSensors: [...family.sensors],
      simulationCore: 'SheikhaDigitalRobot', states: ['IDLE', 'SIMULATING', 'COMPLETE', 'FAULT_LATCHED', 'ESTOP_LATCHED'],
      firmware: 'NOT_IMPLEMENTED', hardwareModel: 'UNKNOWN', actuatorLimits: 'UNKNOWN', protocol: 'NOT_CONFIGURED', requirements: [...LIMITS] },
    assembly: family.parts.map((name, i) => ({ id: `${family.code}-${i + 1}`, name, specification: 'ENGINEERING_REQUIRED', quantity: null })),
    simulation: runScenario(family.mission),
    evidenceLimits: ['VISUAL_KINEMATICS_NOT_DYNAMICS', 'NO_COLLISION_OR_LOAD_VALIDATION', 'NO_HARDWARE_CONNECTION', 'NO_NOVELTY_OR_PATENT_CLAIM'], boundaries: boundaries() };
}
function catalog() {
  return { schema: 'SHEIKHA_ROBOT_STUDIO_V1', families: copy(FAMILIES), tools: copy(TOOLS), finishes: copy(FINISHES),
    defaultDesign: { family: 'mobile', tool: 'camera', finish: 'emerald', scale: 1, motion: 'demonstrate' },
    pipeline: [
      { id: 'design', name: 'تعريف التصميم', owner: 'معماري النظام', status: 'LOCAL' },
      { id: 'control', name: 'عقد التحكم والمحاكاة', owner: 'التحكم والبرمجيات', status: 'SIMULATION_ONLY' },
      { id: 'render', name: 'توليد الحركة وMP4', owner: 'فوندري المرئيات', status: 'LOCAL_RENDERER' },
      { id: 'quality', name: 'فحص المدة والترميز والبصمات', owner: 'الجودة والحارس', status: 'LOCAL' },
      { id: 'review', name: 'مراجعة التصميم والمحتوى', owner: 'مراجع بشري غير معيّن', status: 'REQUIRED' },
      { id: 'hardware', name: 'هندسة العتاد والتصنيع', owner: 'فريق هندسي غير معيّن', status: 'BLOCKED' }
    ], providers: [
      { id: 'sheikha-local', name: 'شيخة · مولّد الحركة المحلي', mode: 'PARAMETRIC_3D_TO_VIDEO', connection: 'LOCAL', trainedVideoModel: false },
      { id: 'producer-exchange', name: 'تبادل حزم المنتجين', mode: 'JSON_CONTRACT', connection: 'OFFLINE_ONLY', authenticated: false },
      { id: 'external-video', name: 'توليد خارجي', mode: 'UNCONFIGURED', connection: 'BLOCKED', reason: 'PROVIDER_AND_BUDGET_NOT_APPROVED' },
      { id: 'physical-robot', name: 'الروبوت الحقيقي', mode: 'ENGINEERING_REQUIRED', connection: 'BLOCKED', reason: 'HARDWARE_AND_SAFETY_NOT_VERIFIED' }
    ], connectors: runConnectorScenario(), boundaries: boundaries() };
}
function exchange(input) {
  const design = buildDesign(input);
  return { schema: 'SHEIKHA_PRODUCER_REQUEST_V1', designId: design.id, producer: 'UNASSIGNED', status: 'NOT_SENT',
    requestedDeliverables: ['CONCEPT_MODEL', 'CONTROL_INTERFACE_REVIEW', 'MOTION_PREVIEW', 'ENGINEERING_GAPS'],
    design, constraints: { publicationAllowed: false, physicalCommandsAllowed: false, spendingApproved: false },
    expectedReceipt: { schema: 'SHEIKHA_PRODUCER_RECEIPT_V1', designId: design.id, producer: 'producer-id', reference: 'submission-id', artifactSha256: 'REPLACE_WITH_64_LOWERCASE_HEX' } };
}
function checkReceipt(input, expectedDesignId) {
  exact(input, ['schema', 'designId', 'producer', 'reference', 'artifactSha256']);
  if (input.schema !== 'SHEIKHA_PRODUCER_RECEIPT_V1' || typeof expectedDesignId !== 'string' || !/^[a-f0-9]{64}$/.test(expectedDesignId) || input.designId !== expectedDesignId
    || !['producer', 'reference'].every(key => typeof input[key] === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(input[key]))
    || typeof input.artifactSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(input.artifactSha256)) throw Error('RECEIPT_REJECTED');
  return { schema: 'SHEIKHA_PRODUCER_RECEIPT_CHECK_V1', receipt: copy(input), status: 'CONTRACT_VALID_UNVERIFIED_CONTENT',
    producerAuthenticated: false, artifactFetched: false, artifactHashVerified: false, reviewRequired: true, boundaries: boundaries() };
}
module.exports = { catalog, validateDesign, buildDesign, exchange, checkReceipt };
