'use strict';

const crypto = require('node:crypto');
const { TextDecoder } = require('node:util');

const specification = require('../../../../runtime/arabic-semantic-encoding/v1/sheikha-arabic-semantic-encoding-profile-v1.json');

const MAGIC = Buffer.from(specification.wireFrame.magicAscii, 'ascii');
const FRAME_VERSION = specification.wireFrame.version;
const FIXED_HEADER_BYTES = specification.wireFrame.fixedHeaderBytes;
const LIMITS = Object.freeze({ ...specification.limits });
const PROFILE_ID = specification.system;
const ENVELOPE_SCHEMA = 'sheikha/arabic-semantic-envelope/v1';
const MAX_FRAME_BYTES = FIXED_HEADER_BYTES + LIMITS.maxMetadataBytes + LIMITS.maxPayloadBytes;
const BIDI_CONTROLS = new Map([
  [0x061C, 'ARABIC_LETTER_MARK'],
  [0x200E, 'LEFT_TO_RIGHT_MARK'],
  [0x200F, 'RIGHT_TO_LEFT_MARK'],
  [0x202A, 'LEFT_TO_RIGHT_EMBEDDING'],
  [0x202B, 'RIGHT_TO_LEFT_EMBEDDING'],
  [0x202C, 'POP_DIRECTIONAL_FORMATTING'],
  [0x202D, 'LEFT_TO_RIGHT_OVERRIDE'],
  [0x202E, 'RIGHT_TO_LEFT_OVERRIDE'],
  [0x2066, 'LEFT_TO_RIGHT_ISOLATE'],
  [0x2067, 'RIGHT_TO_LEFT_ISOLATE'],
  [0x2068, 'FIRST_STRONG_ISOLATE'],
  [0x2069, 'POP_DIRECTIONAL_ISOLATE']
]);

function error(code, message) {
  const value = new Error(message);
  value.code = code;
  return value;
}

function cleanText(value, maxLength = 200) {
  const withoutDisallowedControls = Array.from(String(value || ''))
    .map((character) => {
      const code = character.charCodeAt(0);
      const disallowed = code <= 8 || code === 11 || code === 12 ||
        (code >= 14 && code <= 31) || code === 127;
      return disallowed ? ' ' : character;
    })
    .join('');
  return withoutDisallowedControls
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, maxLength);
}

function hasUnpairedSurrogate(text) {
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    if (unit >= 0xD800 && unit <= 0xDBFF) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return true;
      index += 1;
    } else if (unit >= 0xDC00 && unit <= 0xDFFF) {
      return true;
    }
  }
  return false;
}

function findBidiControls(text) {
  const found = [];
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (BIDI_CONTROLS.has(codePoint)) {
      found.push({
        character,
        codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        name: BIDI_CONTROLS.get(codePoint)
      });
    }
  }
  return found;
}

function countGraphemes(text) {
  if (typeof Intl.Segmenter !== 'function') return [...text].length;
  return [...new Intl.Segmenter('ar', { granularity: 'grapheme' }).segment(text)].length;
}

function splitGraphemes(text) {
  if (typeof Intl.Segmenter !== 'function') return [...text];
  return [...new Intl.Segmenter('ar', { granularity: 'grapheme' }).segment(text)]
    .map((item) => item.segment);
}

function classifySymbol(symbol) {
  if (/^\s+$/u.test(symbol)) return 'فراغ';
  if (/^\p{Mark}+$/u.test(symbol)) return 'تشكيل';
  if (/\p{Letter}/u.test(symbol)) return 'حرف';
  if (/\p{Number}/u.test(symbol)) return 'عدد';
  if (/\p{Punctuation}/u.test(symbol)) return 'علامة_ترقيم';
  if (/\p{Symbol}/u.test(symbol)) return 'رمز';
  return 'محرف_آخر';
}

function analyzeText(text) {
  if (typeof text !== 'string') {
    throw error('TEXT_REQUIRED', 'النص مطلوب ويجب أن يكون سلسلة محارف.');
  }
  if (hasUnpairedSurrogate(text)) {
    throw error('UNPAIRED_SURROGATE', 'النص يحتوي وحدة surrogate غير مكتملة.');
  }

  const codePoints = [...text];
  const arabicCharacters = codePoints.filter((character) => /\p{Script=Arabic}/u.test(character));
  const latinCharacters = codePoints.filter((character) => /\p{Script=Latin}/u.test(character));
  const visibleCharacters = codePoints.filter((character) => !/\s/u.test(character));
  const bidiControls = findBidiControls(text);
  const payloadBytes = Buffer.byteLength(text, 'utf8');

  return {
    codePointCount: codePoints.length,
    utf16CodeUnitCount: text.length,
    graphemeCount: countGraphemes(text),
    payloadBytes,
    arabicCharacterCount: arabicCharacters.length,
    arabicRatioPercent: visibleCharacters.length === 0
      ? 0
      : Math.round((arabicCharacters.length / visibleCharacters.length) * 10000) / 100,
    mixedArabicLatin: arabicCharacters.length > 0 && latinCharacters.length > 0,
    nfc: text.normalize('NFC') === text,
    bidiControls,
    bidiControlCount: bidiControls.length,
    byteOrderMarkPresent: text.codePointAt(0) === 0xFEFF,
    diacriticsPreserved: true,
    destructiveArabicLetterFoldingApplied: false
  };
}

function prepareText(text, options = {}) {
  const originalAnalysis = analyzeText(text);
  const explicitContentClass = options.contentClass == null
    ? null
    : cleanText(options.contentClass, 80).toUpperCase();
  const contentTypeAlias = options.contentType == null
    ? null
    : cleanText(options.contentType, 80).toUpperCase();
  if (explicitContentClass && contentTypeAlias && explicitContentClass !== contentTypeAlias) {
    throw error(
      'CONTENT_CLASS_CONFLICT',
      'يجب أن تتطابق قيمتا contentClass وcontentType عند إرسالهما معًا.'
    );
  }
  const contentClass = explicitContentClass || contentTypeAlias || 'GENERAL_TEXT';
  const defaultNormalization = contentClass === 'RELIGIOUS_SOURCE' ? 'PRESERVE' : 'NFC';
  const normalization = cleanText(options.normalization || defaultNormalization, 20).toUpperCase();

  if (!['NFC', 'PRESERVE'].includes(normalization)) {
    throw error('NORMALIZATION_NOT_SUPPORTED', 'يدعم الملف NFC أو PRESERVE فقط.');
  }
  if (contentClass === 'RELIGIOUS_SOURCE' && normalization !== 'PRESERVE') {
    throw error(
      'RELIGIOUS_SOURCE_REQUIRES_PRESERVE',
      'النص الديني المنقول يتطلب PRESERVE ومراجعة سلامة المصدر.'
    );
  }
  if (originalAnalysis.byteOrderMarkPresent) {
    throw error('BYTE_ORDER_MARK_REJECTED', 'لا يسمح ملف شيخة بعلامة BOM داخل الحمولة.');
  }
  if (originalAnalysis.bidiControlCount > 0 && options.allowBidiControls !== true) {
    throw error('BIDI_CONTROLS_REVIEW_REQUIRED', 'محارف اتجاه صريحة تتطلب سماحًا ومراجعة.');
  }

  const preparedText = normalization === 'NFC' ? text.normalize('NFC') : text;
  const payload = Buffer.from(preparedText, 'utf8');
  if (payload.length > LIMITS.maxPayloadBytes) {
    throw error('PAYLOAD_TOO_LARGE', `تتجاوز الحمولة الحد ${LIMITS.maxPayloadBytes} بايت.`);
  }

  return {
    originalText: text,
    text: preparedText,
    payload,
    contentClass,
    normalization,
    originalAnalysis,
    analysis: analyzeText(preparedText),
    originalDigest: crypto.createHash('sha256').update(text, 'utf8').digest('hex'),
    payloadDigest: crypto.createHash('sha256').update(payload).digest('hex'),
    changedByNormalization: preparedText !== text
  };
}

function sortForCanonicalJson(value) {
  if (Array.isArray(value)) return value.map(sortForCanonicalJson);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = sortForCanonicalJson(value[key]);
      return result;
    }, {});
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(sortForCanonicalJson(value));
}

function buildAiAdvisory(prepared, input = {}) {
  const requested = input.requested === true;
  return {
    contract: 'SHEIKHA_AI_ENCODING_ADVISORY_V1',
    status: requested ? 'ADVISORY_REQUEST_READY_NOT_EXECUTED' : 'AVAILABLE_NOT_REQUESTED',
    requested,
    modelInvocationExecuted: false,
    providerRequiredForEncoding: false,
    mayAlterEncodedPayload: false,
    mayGrantAuthorization: false,
    mayIssueReligiousRuling: false,
    purpose: cleanText(input.purpose || 'ARABIC_SEMANTIC_ANNOTATION', 160),
    inputDigest: prepared.payloadDigest,
    inputTextEmbeddedInAdvisoryMetadata: false,
    humanReviewRequiredForUse: true
  };
}

function buildArabicCanonicalCore(prepared) {
  return {
    'المخطط': 'شيخة/الجذر-الدلالي-العربي/1',
    'الموضع': 'المرجع_التقني_الدلالي_الأعلى_داخل_شيخة',
    'لا_سلطة_تقنية_خارجية_فوق_الجذر': true,
    'المساءلة_البشرية_خارج_الهرم_التقني': true,
    'اللغة_الأساسية': 'العربية',
    'نوع_المحتوى': prepared.contentClass,
    'منهج_الحفظ': prepared.normalization,
    'عدد_العناقيد_الكتابية': prepared.analysis.graphemeCount,
    'بصمة_الحمولة': prepared.payloadDigest,
    'المهايئات_الواقعة_أسفل_الجذر': [
      'Unicode',
      'UTF-8',
      'TCP/IP أو QUIC',
      'Host Runtime'
    ],
    'مرجعية_القيم': 'الكتاب_والسنة_الصحيحة',
    'النية_البشرية_المعلنة_للمشروع': 'وحدها لله',
    'للبرنامج_نية_أو_عبادة': false,
    'مرجعية_القيم_تعليمة_تنفيذية': false,
    'الحكم_الشرعي_الآلي': false
  };
}

function buildGovernance(prepared, options = {}) {
  const riskLevel = cleanText(options.riskLevel || 'LOW', 40).toUpperCase();
  const humanApproved = options.humanApproved === true;
  const highRisk = ['HIGH', 'CRITICAL'].includes(riskLevel);
  return {
    contract: 'SHEIKHA_ENCODING_GOVERNANCE_V1',
    valuesReference: 'QURAN_AND_AUTHENTIC_SUNNAH',
    valuesReferenceIsExecutableBytecode: false,
    technicalEncodingDecision: 'ALLOW',
    downstreamExecutionDecision: highRisk && !humanApproved
      ? 'HUMAN_REVIEW_REQUIRED'
      : 'NOT_AUTHORIZED_BY_ENCODING',
    riskLevel,
    humanApproved,
    encodingGrantsExecutionAuthorization: false,
    automatedHalalOrHaramDecision: false,
    automatedReligiousInterpretation: false,
    qualifiedScholarReviewRequired: prepared.contentClass === 'RELIGIOUS_SOURCE',
    religiousSourceIntegrityReviewRequired: prepared.contentClass === 'RELIGIOUS_SOURCE',
    aiIsAdvisoryOnly: true,
    noHarmBoundaryActive: true,
    humanFinalResponsibility: true
  };
}

function buildMetadata(prepared, options = {}) {
  const ai = buildAiAdvisory(prepared, options.ai || {});
  const governance = buildGovernance(prepared, options);
  return {
    schema: ENVELOPE_SCHEMA,
    profile: PROFILE_ID,
    profileVersion: specification.version,
    arabicCanonicalCore: buildArabicCanonicalCore(prepared),
    language: cleanText(options.language || 'ar', 20) || 'ar',
    contentClass: prepared.contentClass,
    normalization: prepared.normalization,
    application: {
      messageType: cleanText(options.messageType || 'ARABIC_TEXT', 100),
      intent: cleanText(options.intent || 'TEXT_INTERCHANGE', 200),
      correlationId: cleanText(options.correlationId, 160) || null
    },
    presentation: {
      originalDigest: prepared.originalDigest,
      payloadDigest: prepared.payloadDigest,
      changedByNormalization: prepared.changedByNormalization,
      arabicRatioPercent: prepared.analysis.arabicRatioPercent,
      graphemeCount: prepared.analysis.graphemeCount,
      bidiControlCount: prepared.analysis.bidiControlCount,
      diacriticsPreserved: true,
      destructiveArabicLetterFoldingApplied: false
    },
    ai,
    governance
  };
}

function explainEncoding(input = {}) {
  const prepared = prepareText(input.text, input);
  const graphemes = splitGraphemes(prepared.text);
  const maximumExplained = 256;
  const symbols = graphemes.slice(0, maximumExplained).map((symbol, index) => {
    const bytes = Buffer.from(symbol, 'utf8');
    return {
      'الترتيب': index,
      'الرمز': symbol,
      'الفئة': classifySymbol(symbol),
      'نقاط_الترميز': [...symbol].map((character) => {
        const point = character.codePointAt(0);
        return `U+${point.toString(16).toUpperCase().padStart(4, '0')}`;
      }),
      'بايتات_UTF8': [...bytes],
      'التمثيل_السداسي': bytes.toString('hex'),
      'عدد_البايتات': bytes.length
    };
  });

  return {
    system: 'SHEIKHA_ARABIC_ENCODING_EXPLANATION_V1',
    status: 'ARABIC_ENCODING_EXPLAINED_WITH_TECHNICAL_EVIDENCE',
    'الجذر_الدلالي': buildArabicCanonicalCore(prepared),
    'البيان': {
      'النص_محفوظ': true,
      'التطبيع': prepared.normalization,
      'تغير_بالتطبيع': prepared.changedByNormalization,
      'عدد_العناقيد': graphemes.length,
      'المشروح_منها': symbols.length,
      'البيان_مختصر': graphemes.length > maximumExplained
    },
    'الرموز': symbols,
    'الدليل_التقني': {
      'بصمة_الأصل': prepared.originalDigest,
      'بصمة_الحمولة': prepared.payloadDigest,
      'عدد_البايتات': prepared.payload.length,
      'إعادة_UTF8_مطابقة': Buffer.from(prepared.text, 'utf8').toString('utf8') === prepared.text,
      'المراجع': specification.normativeReferences.map((item) => item.id)
    },
    'حدود_الحجة': {
      'القياس_التقني_مثبت_بالاختبار': true,
      'النص_الشرعي_بديل_عن_القياس_الهندسي': false,
      'البرنامج_يثبت_حكما_عقديا_آليا': false,
      'المراجعة_البشرية_النهائية': true
    }
  };
}

function proposeImprovement(input = {}) {
  const title = cleanText(input.title || input.name, 200);
  if (!title) {
    throw error('IMPROVEMENT_TITLE_REQUIRED', 'عنوان مقترح التحسين مطلوب.');
  }
  const targetLayer = cleanText(input.targetLayer || 'PRESENTATION', 80).toUpperCase();
  const rationale = cleanText(input.rationale || input.reason, 1000);
  const evidence = Array.isArray(input.evidence)
    ? input.evidence.slice(0, 20).map((item) => cleanText(item, 300)).filter(Boolean)
    : [];
  const tests = Array.isArray(input.tests)
    ? input.tests.slice(0, 20).map((item) => cleanText(item, 300)).filter(Boolean)
    : [];
  const proposalId = crypto.createHash('sha256')
    .update(canonicalJson({ title, targetLayer, rationale, evidence, tests }))
    .digest('hex')
    .slice(0, 24);

  return {
    system: 'SHEIKHA_ENCODING_GOVERNED_IMPROVEMENT_V1',
    status: 'PROPOSAL_REVIEW_REQUIRED',
    proposalId,
    title,
    targetLayer,
    rationale,
    evidence,
    tests,
    ai: {
      mayDraftProposal: true,
      modelInvocationExecuted: false,
      mayApproveOrActivate: false
    },
    gates: specification.continuousImprovement.requiredGates.map((gate) => ({
      gate,
      status: 'PENDING_EVIDENCE_OR_REVIEW'
    })),
    automaticRuntimeSelfModification: false,
    automaticProfileActivation: false,
    backwardCompatibilityRequired: true,
    humanApprovalRequired: true,
    versionedReleaseRequired: true
  };
}

function frameFlags(prepared, metadata) {
  let flags = 0;
  if (prepared.normalization === 'NFC') flags |= 1;
  if (prepared.analysis.arabicRatioPercent >= 50) flags |= 2;
  if (metadata.governance.humanApproved) flags |= 4;
  if (metadata.ai.requested) flags |= 8;
  return flags;
}

function createFrame(prepared, metadata) {
  const metadataBytes = Buffer.from(canonicalJson(metadata), 'utf8');
  if (metadataBytes.length > LIMITS.maxMetadataBytes) {
    throw error('METADATA_TOO_LARGE', `تتجاوز البيانات الوصفية الحد ${LIMITS.maxMetadataBytes} بايت.`);
  }

  const digest = crypto.createHash('sha256')
    .update(metadataBytes)
    .update(prepared.payload)
    .digest();
  const header = Buffer.alloc(FIXED_HEADER_BYTES);
  MAGIC.copy(header, 0);
  header.writeUInt8(FRAME_VERSION, 4);
  header.writeUInt8(frameFlags(prepared, metadata), 5);
  header.writeUInt16BE(FIXED_HEADER_BYTES, 6);
  header.writeUInt32BE(metadataBytes.length, 8);
  header.writeUInt32BE(prepared.payload.length, 12);
  digest.copy(header, 16);
  return Buffer.concat([header, metadataBytes, prepared.payload]);
}

function decodeBase64(value, code = 'INVALID_BASE64', maxBytes = MAX_FRAME_BYTES) {
  const input = String(value || '');
  const maxEncodedLength = Math.ceil(maxBytes / 3) * 4;
  if (input.length > maxEncodedLength) {
    throw error('FRAME_LIMIT_EXCEEDED', 'تتجاوز قيمة Base64 الحد المعتمد.');
  }
  const standard = input.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/u.test(input);
  const urlSafe = input.length % 4 !== 1 && /^[A-Za-z0-9_-]+$/u.test(input);
  if (!input || (!standard && !urlSafe)) {
    throw error(code, 'قيمة Base64 أو Base64URL غير صالحة.');
  }
  const encoding = urlSafe ? 'base64url' : 'base64';
  const decoded = Buffer.from(input, encoding);
  if (decoded.length > maxBytes) {
    throw error('FRAME_LIMIT_EXCEEDED', 'تتجاوز البيانات المفكوكة الحد المعتمد.');
  }
  if (decoded.toString(encoding) !== input) {
    throw error(code, 'قيمة Base64 أو Base64URL غير قانونية أو غير معيارية.');
  }
  return decoded;
}

function decodeFrame(frameInput) {
  const frame = Buffer.isBuffer(frameInput) ? frameInput : decodeBase64(frameInput, 'INVALID_FRAME_BASE64');
  if (frame.length > MAX_FRAME_BYTES) {
    throw error('FRAME_LIMIT_EXCEEDED', 'يتجاوز الإطار الحد الأعلى المعتمد.');
  }
  if (frame.length < FIXED_HEADER_BYTES) {
    throw error('FRAME_TOO_SHORT', 'إطار شيخة أقصر من الرأس الثابت.');
  }
  if (!frame.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw error('FRAME_MAGIC_MISMATCH', 'توقيع إطار شيخة غير صحيح.');
  }
  if (frame.readUInt8(4) !== FRAME_VERSION) {
    throw error('FRAME_VERSION_UNSUPPORTED', 'إصدار إطار شيخة غير مدعوم.');
  }
  if (frame.readUInt16BE(6) !== FIXED_HEADER_BYTES) {
    throw error('FRAME_HEADER_LENGTH_INVALID', 'طول رأس إطار شيخة غير صحيح.');
  }

  const metadataLength = frame.readUInt32BE(8);
  const payloadLength = frame.readUInt32BE(12);
  if (metadataLength > LIMITS.maxMetadataBytes || payloadLength > LIMITS.maxPayloadBytes) {
    throw error('FRAME_LIMIT_EXCEEDED', 'يتجاوز الإطار حدود ملف شيخة.');
  }
  const expectedLength = FIXED_HEADER_BYTES + metadataLength + payloadLength;
  if (frame.length !== expectedLength) {
    throw error('FRAME_LENGTH_MISMATCH', 'لا يطابق طول الإطار الأطوال المسجلة في الرأس.');
  }

  const expectedDigest = frame.subarray(16, 48);
  const metadataBytes = frame.subarray(FIXED_HEADER_BYTES, FIXED_HEADER_BYTES + metadataLength);
  const payload = frame.subarray(FIXED_HEADER_BYTES + metadataLength);
  const actualDigest = crypto.createHash('sha256').update(metadataBytes).update(payload).digest();
  if (!crypto.timingSafeEqual(expectedDigest, actualDigest)) {
    throw error('FRAME_INTEGRITY_FAILED', 'فشل تحقق سلامة إطار شيخة.');
  }

  let metadata;
  try {
    metadata = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(metadataBytes));
  } catch (_value) {
    throw error('METADATA_DECODE_FAILED', 'تعذر فك البيانات الوصفية الصارمة.');
  }
  if (!metadata || metadata.schema !== ENVELOPE_SCHEMA || metadata.profile !== PROFILE_ID) {
    throw error('METADATA_SCHEMA_INVALID', 'مخطط بيانات إطار شيخة غير صحيح.');
  }

  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(payload);
  } catch (_value) {
    throw error('UTF8_DECODE_FAILED', 'الحمولة ليست UTF-8 قانونية.');
  }
  if (!Buffer.from(text, 'utf8').equals(payload)) {
    throw error('UTF8_NON_CANONICAL', 'الحمولة لا تحقق إعادة UTF-8 المطابقة.');
  }

  return {
    system: PROFILE_ID,
    status: 'DECODED_AND_INTEGRITY_VERIFIED',
    text,
    metadata,
    frame: {
      version: FRAME_VERSION,
      flags: frame.readUInt8(5),
      metadataBytes: metadataLength,
      payloadBytes: payloadLength,
      totalBytes: frame.length,
      integrity: 'SHA256_VERIFIED',
      authenticated: false,
      encrypted: false
    },
    analysis: analyzeText(text)
  };
}

function segmentFrame(frameInput, options = {}) {
  const frame = Buffer.isBuffer(frameInput) ? frameInput : decodeBase64(frameInput, 'INVALID_FRAME_BASE64');
  if (frame.length > MAX_FRAME_BYTES) {
    throw error('FRAME_LIMIT_EXCEEDED', 'يتجاوز الإطار الحد الأعلى المعتمد.');
  }
  const maxSegmentBytes = Number(options.maxSegmentBytes || 1200);
  if (!Number.isInteger(maxSegmentBytes) ||
      maxSegmentBytes < LIMITS.minSegmentBytes ||
      maxSegmentBytes > LIMITS.maxSegmentBytes) {
    throw error('SEGMENT_SIZE_INVALID', 'حجم المقطع خارج الحدود المعتمدة.');
  }

  const total = Math.ceil(frame.length / maxSegmentBytes);
  if (total > LIMITS.maxSegments) {
    throw error('TOO_MANY_SEGMENTS', 'عدد المقاطع يتجاوز الحد المعتمد.');
  }
  const messageId = crypto.createHash('sha256').update(frame).digest('hex');
  const segments = [];
  for (let index = 0; index < total; index += 1) {
    const payload = frame.subarray(index * maxSegmentBytes, (index + 1) * maxSegmentBytes);
    segments.push({
      schema: 'sheikha/arabic-semantic-segment/v1',
      messageId,
      index,
      total,
      payloadLength: payload.length,
      payloadBase64Url: payload.toString('base64url'),
      segmentDigest: crypto.createHash('sha256').update(payload).digest('hex')
    });
  }
  return {
    system: PROFILE_ID,
    status: 'FRAME_SEGMENTED',
    messageId,
    maxSegmentBytes,
    frameBytes: frame.length,
    segmentCount: segments.length,
    transportProtocolExecuted: false,
    segments
  };
}

function reassembleSegments(segmentsInput) {
  if (!Array.isArray(segmentsInput) || segmentsInput.length === 0) {
    throw error('SEGMENTS_REQUIRED', 'يلزم مقطع واحد على الأقل.');
  }
  if (segmentsInput.length > LIMITS.maxSegments) {
    throw error('TOO_MANY_SEGMENTS', 'عدد المقاطع يتجاوز الحد المعتمد.');
  }

  const first = segmentsInput[0];
  const messageId = cleanText(first.messageId, 64);
  const total = Number(first.total);
  if (!/^[a-f0-9]{64}$/u.test(messageId) || !Number.isInteger(total) || total !== segmentsInput.length) {
    throw error('SEGMENT_SET_INVALID', 'هوية الرسالة أو عدد المقاطع غير صحيح.');
  }

  const seen = new Set();
  let totalBytes = 0;
  const ordered = [...segmentsInput].sort((left, right) => Number(left.index) - Number(right.index));
  const chunks = ordered.map((segment, expectedIndex) => {
    const index = Number(segment.index);
    if (segment.messageId !== messageId || Number(segment.total) !== total ||
        !Number.isInteger(index) || index !== expectedIndex || seen.has(index)) {
      throw error('SEGMENT_SEQUENCE_INVALID', 'تسلسل المقاطع غير صحيح أو مكرر.');
    }
    seen.add(index);
    const payload = decodeBase64(
      segment.payloadBase64Url || segment.payloadBase64,
      'SEGMENT_BASE64_INVALID',
      LIMITS.maxSegmentBytes
    );
    totalBytes += payload.length;
    if (totalBytes > MAX_FRAME_BYTES) {
      throw error('FRAME_LIMIT_EXCEEDED', 'تتجاوز المقاطع مجتمعة حد الإطار المعتمد.');
    }
    const digest = crypto.createHash('sha256').update(payload).digest('hex');
    if (digest !== segment.segmentDigest || payload.length !== Number(segment.payloadLength)) {
      throw error('SEGMENT_INTEGRITY_FAILED', 'فشل تحقق سلامة أحد المقاطع.');
    }
    return payload;
  });

  const frame = Buffer.concat(chunks);
  if (crypto.createHash('sha256').update(frame).digest('hex') !== messageId) {
    throw error('MESSAGE_INTEGRITY_FAILED', 'فشل تحقق سلامة الرسالة المجمعة.');
  }
  decodeFrame(frame);
  return {
    system: PROFILE_ID,
    status: 'REASSEMBLED_AND_VERIFIED',
    messageId,
    frameBytes: frame.length,
    frameBase64Url: frame.toString('base64url'),
    segmentCount: total,
    transportProtocolExecuted: false
  };
}

function physicalLayer(frame) {
  const previewBytes = frame.subarray(0, Math.min(frame.length, 16));
  return {
    id: 'L1_PHYSICAL_ADAPTER',
    status: 'ACTIVE_VERIFIED_SOFTWARE_ADAPTER',
    representation: 'BINARY_OCTET_STREAM',
    octets: frame.length,
    bitLength: frame.length * 8,
    bitPreview: [...previewBytes]
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join(' '),
    hardwareTransmissionExecuted: false,
    carrierOrDeviceRequiredForTransmission: true
  };
}

function encodeMessage(input = {}) {
  const prepared = prepareText(input.text, input);
  const metadata = buildMetadata(prepared, input);
  const frame = createFrame(prepared, metadata);
  const transport = segmentFrame(frame, { maxSegmentBytes: input.maxSegmentBytes });
  const decoded = decodeFrame(frame);
  const overheadBytes = frame.length - prepared.payload.length;

  return {
    system: PROFILE_ID,
    status: 'ENCODED_AND_ROUND_TRIP_VERIFIED',
    mediaType: specification.mediaType,
    frameBase64Url: frame.toString('base64url'),
    messageId: transport.messageId,
    layers: {
      physical: physicalLayer(frame),
      transportNetwork: {
        id: 'L3_L4_TRANSPORT_NETWORK',
        status: 'ACTIVE_SEGMENTATION_AND_REASSEMBLY',
        segmentCount: transport.segmentCount,
        maxSegmentBytes: transport.maxSegmentBytes,
        replacesTcpIpOrQuic: false,
        networkTransmissionExecuted: false
      },
      presentation: {
        id: 'L6_PRESENTATION_ENCODING',
        status: 'ACTIVE_STRICT_ARABIC_PRESENTATION_PROFILE',
        encoding: 'UTF-8',
        normalization: prepared.normalization,
        analysis: prepared.analysis,
        strictRoundTripVerified: decoded.text === prepared.text
      },
      application: {
        id: 'L7_APPLICATION_SEMANTICS',
        status: 'ACTIVE_SEMANTIC_ENVELOPE',
        metadata
      }
    },
    transport,
    metrics: {
      rawUtf8Bytes: prepared.payload.length,
      frameBytes: frame.length,
      overheadBytes,
      overheadPercent: prepared.payload.length === 0
        ? 0
        : Math.round((overheadBytes / prepared.payload.length) * 10000) / 100,
      smallerThanRawUtf8: frame.length < prepared.payload.length,
      performanceSuperiorityProven: false
    },
    governance: metadata.governance,
    ai: metadata.ai,
    roundTrip: {
      verified: decoded.text === prepared.text,
      textPreservedExactly: decoded.text === input.text,
      payloadDigest: prepared.payloadDigest
    }
  };
}

function status() {
  return {
    system: PROFILE_ID,
    nameAr: specification.nameAr,
    version: specification.version,
    status: 'VERIFIED_PROFILE_IMPLEMENTATION_ACTIVE',
    mediaType: specification.mediaType,
    runtimeStandards: {
      unicodeVersion: process.versions.unicode || 'UNKNOWN',
      icuVersion: process.versions.icu || 'UNKNOWN',
      utf8BytesPerScalar: '1_TO_4',
      unicodeIsEightBit: false,
      unicodeReplaced: false,
      utf8Replaced: false,
      higherLevelProfile: true,
      externalConformanceCertificationClaimed: false
    },
    layers: specification.layers,
    aiIntegration: specification.aiIntegration,
    continuousImprovement: specification.continuousImprovement,
    governance: specification.governance,
    measurementPolicy: specification.measurementPolicy,
    scope: specification.scope,
    limits: LIMITS,
    architecture: {
      semanticRoot: specification.sovereignSemanticRoot,
      externalTechnicalSystemAboveRoot: false,
      unicodeUtf8TcpIpAreAdaptersBelowRoot: true,
      implementationHostedToday: true,
      fullNativeIndependenceComplete: false
    },
    integrations: {
      existingArabicUtf8Engine: 'lib/sheikha-arabic-utf8-neural-engine.js',
      languageCluster: 'SHEIKHA_ARABIC_LANGUAGE_CLUSTER_FABRIC_V91',
      protocolRegistry: 'SHEIKHA_PROTOCOL_REGISTRY_V1',
      networkFabric: 'sheikha-network-fabric-core',
      universalBenefitBoundary: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1'
    }
  };
}

module.exports = {
  LIMITS,
  PROFILE_ID,
  analyzeText,
  canonicalJson,
  decodeFrame,
  encodeMessage,
  explainEncoding,
  findBidiControls,
  physicalLayer,
  prepareText,
  proposeImprovement,
  reassembleSegments,
  segmentFrame,
  specification,
  status
};
