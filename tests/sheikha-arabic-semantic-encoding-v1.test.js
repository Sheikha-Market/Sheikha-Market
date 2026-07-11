'use strict';

const express = require('express');
const request = require('supertest');

const encoding = require('../core/language/sheikha-arabic/encoding/sheikha-arabic-semantic-encoding-v1');
const routes = require('../routes/arabic-semantic-encoding/status.routes');
const { buildReport } = require('../tools/activation/activate-sheikha-arabic-semantic-encoding-v1');

function app() {
  const instance = express();
  instance.use(express.json({ limit: '2mb' }));
  instance.use('/api/language/arabic-semantic-encoding', routes);
  return instance;
}

describe('Sheikha Arabic Semantic Encoding Profile V1', () => {
  test('defines a higher-level interoperable profile without replacing Unicode or UTF-8', () => {
    const result = encoding.status();
    expect(result).toMatchObject({
      status: 'VERIFIED_PROFILE_IMPLEMENTATION_ACTIVE',
      runtimeStandards: {
        utf8BytesPerScalar: '1_TO_4',
        unicodeIsEightBit: false,
        unicodeReplaced: false,
        utf8Replaced: false,
        higherLevelProfile: true,
        externalConformanceCertificationClaimed: false
      },
      architecture: {
        externalTechnicalSystemAboveRoot: false,
        unicodeUtf8TcpIpAreAdaptersBelowRoot: true,
        implementationHostedToday: true,
        fullNativeIndependenceComplete: false
      }
    });
    expect(result.layers).toHaveLength(4);
  });

  test('preserves a fully vocalized religious source exactly', () => {
    const text = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    const result = encoding.encodeMessage({
      text,
      contentClass: 'RELIGIOUS_SOURCE',
      ai: { requested: true }
    });
    const decoded = encoding.decodeFrame(result.frameBase64Url);
    expect(decoded.text).toBe(text);
    expect(result.roundTrip).toMatchObject({
      verified: true,
      textPreservedExactly: true
    });
    expect(result.layers.presentation.normalization).toBe('PRESERVE');
    expect(result.frameBase64Url).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(result.layers.application.metadata.arabicCanonicalCore).toMatchObject({
      'الموضع': 'المرجع_التقني_الدلالي_الأعلى_داخل_شيخة',
      'لا_سلطة_تقنية_خارجية_فوق_الجذر': true,
      'مرجعية_القيم_تعليمة_تنفيذية': false,
      'الحكم_الشرعي_الآلي': false
    });
    expect(result.governance).toMatchObject({
      qualifiedScholarReviewRequired: true,
      automatedHalalOrHaramDecision: false,
      encodingGrantsExecutionAuthorization: false
    });
  });

  test('accepts contentType as an alias and rejects conflicting content labels', () => {
    const text = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
    const aliased = encoding.encodeMessage({
      text,
      contentType: 'RELIGIOUS_SOURCE'
    });

    expect(encoding.decodeFrame(aliased.frameBase64Url).text).toBe(text);
    expect(aliased.layers.presentation.normalization).toBe('PRESERVE');
    expect(() => encoding.encodeMessage({
      text,
      contentClass: 'GENERAL_TEXT',
      contentType: 'RELIGIOUS_SOURCE'
    })).toThrow(expect.objectContaining({ code: 'CONTENT_CLASS_CONFLICT' }));
  });

  test('normalizes general text to NFC without destructive Arabic folding', () => {
    const decomposed = 'ا\u0654مانة';
    const result = encoding.encodeMessage({ text: decomposed });
    const decoded = encoding.decodeFrame(result.frameBase64Url);
    expect(decoded.text).toBe('أمانة');
    expect(result.layers.presentation.analysis).toMatchObject({
      nfc: true,
      diacriticsPreserved: true,
      destructiveArabicLetterFoldingApplied: false
    });
  });

  test('rejects malformed scalar input and explicit bidi controls by default', () => {
    expect(() => encoding.encodeMessage({ text: '\uD800' })).toThrow(
      expect.objectContaining({ code: 'UNPAIRED_SURROGATE' })
    );
    expect(() => encoding.encodeMessage({ text: 'أمان\u202Etxt' })).toThrow(
      expect.objectContaining({ code: 'BIDI_CONTROLS_REVIEW_REQUIRED' })
    );
  });

  test('detects frame tampering', () => {
    const result = encoding.encodeMessage({ text: 'الأمانة في النقل' });
    const frame = Buffer.from(result.frameBase64Url, 'base64url');
    frame[frame.length - 1] ^= 1;
    expect(() => encoding.decodeFrame(frame)).toThrow(
      expect.objectContaining({ code: 'FRAME_INTEGRITY_FAILED' })
    );
  });

  test('rejects a frame before processing when it exceeds the memory boundary', () => {
    const oversized = Buffer.alloc(
      encoding.LIMITS.maxPayloadBytes + encoding.LIMITS.maxMetadataBytes + 49
    );
    expect(() => encoding.decodeFrame(oversized)).toThrow(
      expect.objectContaining({ code: 'FRAME_LIMIT_EXCEEDED' })
    );
  });

  test('segments and reassembles the frame in order', () => {
    const result = encoding.encodeMessage({
      text: 'اللغة العربية أساس البيان والتبادل الدلالي الآمن.',
      maxSegmentBytes: 96
    });
    expect(result.transport.segmentCount).toBeGreaterThan(1);
    const reassembled = encoding.reassembleSegments([...result.transport.segments].reverse());
    expect(reassembled.messageId).toBe(result.messageId);
    expect(encoding.decodeFrame(reassembled.frameBase64Url).text)
      .toBe('اللغة العربية أساس البيان والتبادل الدلالي الآمن.');
  });

  test('keeps physical and AI claims within measured software boundaries', () => {
    const result = encoding.encodeMessage({
      text: 'اختبار الطبقات',
      ai: { requested: true }
    });
    expect(result.layers.physical).toMatchObject({
      status: 'ACTIVE_VERIFIED_SOFTWARE_ADAPTER',
      hardwareTransmissionExecuted: false,
      carrierOrDeviceRequiredForTransmission: true
    });
    expect(result.ai).toMatchObject({
      status: 'ADVISORY_REQUEST_READY_NOT_EXECUTED',
      modelInvocationExecuted: false,
      mayAlterEncodedPayload: false,
      mayGrantAuthorization: false
    });
    expect(result.metrics).toMatchObject({
      smallerThanRawUtf8: false,
      performanceSuperiorityProven: false
    });
  });

  test('explains the encoding of Arabic graphemes with technical evidence', () => {
    const result = encoding.explainEncoding({ text: 'شَيْء' });
    expect(result.status).toBe('ARABIC_ENCODING_EXPLAINED_WITH_TECHNICAL_EVIDENCE');
    expect(result['الرموز'].length).toBeGreaterThan(0);
    expect(result['الرموز'][0]).toEqual(expect.objectContaining({
      'الفئة': 'حرف',
      'نقاط_الترميز': expect.any(Array),
      'بايتات_UTF8': expect.any(Array)
    }));
    expect(result['حدود_الحجة']).toMatchObject({
      'القياس_التقني_مثبت_بالاختبار': true,
      'النص_الشرعي_بديل_عن_القياس_الهندسي': false,
      'البرنامج_يثبت_حكما_عقديا_آليا': false
    });
  });

  test('creates governed improvement proposals without self-modification', () => {
    const result = encoding.proposeImprovement({
      title: 'تحسين ضغط الغلاف',
      evidence: ['قياس الحجم'],
      tests: ['اختبار الرجوع المطابق']
    });
    expect(result).toMatchObject({
      status: 'PROPOSAL_REVIEW_REQUIRED',
      automaticRuntimeSelfModification: false,
      automaticProfileActivation: false,
      humanApprovalRequired: true,
      ai: {
        mayDraftProposal: true,
        modelInvocationExecuted: false,
        mayApproveOrActivate: false
      }
    });
  });

  test('activates all verified profile checks', () => {
    const report = buildReport();
    expect(report).toMatchObject({
      status: 'VERIFIED_PROFILE_ACTIVE',
      score: 100,
      missing: [],
      claims: {
        unicodeReplaced: false,
        utf8Replaced: false,
        hardwarePhysicalTransmissionActivated: false,
        softwarePhysicalAdapterVerified: true,
        externalStandardsCertificationIssued: false,
        semanticRootHighestInternalAuthority: true,
        externalTechnicalSystemAuthorityAboveRoot: false,
        unicodeUtf8TcpIpAdaptersBelowRoot: true,
        hostedAdapterImplementationToday: true,
        nativeIndependentCodecComplete: false,
        fullHostRemovalComplete: false,
        automaticRuntimeSelfModification: false
      }
    });
  });

  test('exposes status and a complete encode/decode API round trip', async () => {
    const statusResponse = await request(app())
      .get('/api/language/arabic-semantic-encoding/status')
      .expect(200);
    expect(statusResponse.body.result.layers).toHaveLength(4);

    const encoded = await request(app())
      .post('/api/language/arabic-semantic-encoding/encode')
      .send({ text: 'شيخة ترميز عربي' })
      .expect(200);
    const decoded = await request(app())
      .post('/api/language/arabic-semantic-encoding/decode')
      .send({ frameBase64Url: encoded.body.result.frameBase64Url })
      .expect(200);
    expect(decoded.body.result.text).toBe('شيخة ترميز عربي');

    const explained = await request(app())
      .post('/api/language/arabic-semantic-encoding/explain')
      .send({ text: 'شيخة' })
      .expect(200);
    expect(explained.body.result['الرموز'].length).toBeGreaterThan(0);

    const improvement = await request(app())
      .post('/api/language/arabic-semantic-encoding/improvement-plan')
      .send({ title: 'تحسين موثق' })
      .expect(200);
    expect(improvement.body.result.automaticProfileActivation).toBe(false);
  });

  test('returns a governed review response for unsafe bidi input', async () => {
    const response = await request(app())
      .post('/api/language/arabic-semantic-encoding/encode')
      .send({ text: 'أمان\u202Etxt' })
      .expect(422);
    expect(response.body).toMatchObject({
      success: false,
      error: 'BIDI_CONTROLS_REVIEW_REQUIRED'
    });
  });
});
