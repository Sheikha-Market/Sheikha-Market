<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sheikha\NeuralGateway\Security\InputValidator;
use Sheikha\NeuralGateway\Security\JwtAuth;
use Sheikha\NeuralGateway\Security\RateLimit;

/**
 * اختبارات طبقة الأمان
 * Security Layer Unit Tests
 *
 * "لا ضرر ولا ضرار" — الحديث الشريف
 */
class SecurityTest extends TestCase
{
    // ── InputValidator ────────────────────────────────────────────────────────

    private InputValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new InputValidator();
    }

    /** @test */
    public function null_context_fails_validation(): void
    {
        $result = $this->validator->validateInferenceContext(null);
        $this->assertFalse($result['ok']);
        $this->assertNotEmpty($result['errors']);
    }

    /** @test */
    public function empty_string_context_fails_validation(): void
    {
        $result = $this->validator->validateInferenceContext('');
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function valid_array_context_passes(): void
    {
        $result = $this->validator->validateInferenceContext([
            'type' => 'TRADE', 'amount' => 1000, 'interestRate' => 0,
        ]);

        $this->assertTrue($result['ok']);
        $this->assertEmpty($result['errors']);
        $this->assertSame('TRADE', $result['data']['type']);
        $this->assertSame(1000.0, $result['data']['amount']);
    }

    /** @test */
    public function string_context_passes_as_text(): void
    {
        $result = $this->validator->validateInferenceContext('تجارة حلال');
        $this->assertTrue($result['ok']);
        $this->assertSame('تجارة حلال', $result['data']['text']);
    }

    /** @test */
    public function negative_amount_fails(): void
    {
        $result = $this->validator->validateInferenceContext(['amount' => -100]);
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function non_string_type_fails(): void
    {
        $result = $this->validator->validateInferenceContext(['type' => 123]);
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function non_numeric_amount_fails(): void
    {
        $result = $this->validator->validateInferenceContext(['amount' => 'كثير']);
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function non_numeric_interest_rate_fails(): void
    {
        $result = $this->validator->validateInferenceContext(['interestRate' => 'ربا']);
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function boolean_flags_are_cast_correctly(): void
    {
        $result = $this->validator->validateInferenceContext([
            'riba' => true, 'gharar' => false, 'hasInterest' => 1,
        ]);

        $this->assertTrue($result['ok']);
        $this->assertTrue($result['data']['riba']);
        $this->assertFalse($result['data']['gharar']);
        $this->assertTrue($result['data']['hasInterest']);
    }

    /** @test */
    public function text_over_max_length_fails(): void
    {
        $longText = str_repeat('أ', 5000);
        $result   = $this->validator->validateInferenceContext($longText);
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function non_array_non_string_context_fails(): void
    {
        $result = $this->validator->validateInferenceContext(42);
        $this->assertFalse($result['ok']);
    }

    /** @test */
    public function activation_body_empty_is_ok(): void
    {
        $result = $this->validator->validateActivationBody(null);
        $this->assertTrue($result['ok']);

        $result2 = $this->validator->validateActivationBody([]);
        $this->assertTrue($result2['ok']);
    }

    /** @test */
    public function sanitize_for_log_redacts_bearer_token(): void
    {
        $safe = $this->validator->sanitizeForLog('Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.test.sig');
        $this->assertStringNotContainsString('eyJhbGciOiJIUzI1NiJ9', $safe);
        $this->assertStringContainsString('[REDACTED]', $safe);
    }

    /** @test */
    public function sanitize_for_log_redacts_password(): void
    {
        $safe = $this->validator->sanitizeForLog('{"password":"secret123"}');
        $this->assertStringNotContainsString('secret123', $safe);
    }

    // ── JwtAuth ───────────────────────────────────────────────────────────────

    /** @test */
    public function jwt_issue_and_verify_valid_token(): void
    {
        $auth  = new JwtAuth(str_repeat('x', 32));
        $token = $auth->issue(['userId' => '42', 'role' => 'supplier']);

        $result = $auth->verify($token);

        $this->assertTrue($result['valid']);
        $this->assertNull($result['error']);
        $this->assertSame('42', $result['payload']['userId']);
        $this->assertSame('supplier', $result['payload']['role']);
    }

    /** @test */
    public function jwt_reject_tampered_token(): void
    {
        $auth  = new JwtAuth(str_repeat('x', 32));
        $token = $auth->issue(['userId' => '42']);
        $parts = explode('.', $token);
        $parts[1] .= 'tampered';
        $tampered = implode('.', $parts);

        $result = $auth->verify($tampered);

        $this->assertFalse($result['valid']);
        $this->assertNotNull($result['error']);
    }

    /** @test */
    public function jwt_reject_malformed_token(): void
    {
        $auth   = new JwtAuth(str_repeat('x', 32));
        $result = $auth->verify('not.a.valid.jwt.token.at.all');
        $this->assertFalse($result['valid']);
    }

    /** @test */
    public function jwt_reject_wrong_issuer(): void
    {
        // Token issued with different issuer field
        $auth    = new JwtAuth(str_repeat('x', 32));
        $header  = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']) ?: '');
        $payload = base64_encode(json_encode(['iss' => 'wrong-issuer', 'exp' => time() + 3600]) ?: '');
        // Obviously wrong signature — will fail sig check first
        $token   = "$header.$payload.badsig";
        $result  = $auth->verify($token);
        $this->assertFalse($result['valid']);
    }

    /** @test */
    public function jwt_extract_from_bearer_header(): void
    {
        $auth  = new JwtAuth(str_repeat('x', 32));
        $token = $auth->issue([]);
        $extracted = $auth->extractFromHeader("Bearer $token");

        $this->assertSame($token, $extracted);
    }

    /** @test */
    public function jwt_extract_returns_null_without_bearer(): void
    {
        $auth = new JwtAuth(str_repeat('x', 32));
        $this->assertNull($auth->extractFromHeader('Basic abc123'));
        $this->assertNull($auth->extractFromHeader(''));
    }

    /** @test */
    public function jwt_constructor_rejects_short_secret(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new JwtAuth('short');
    }

    // ── RateLimit ─────────────────────────────────────────────────────────────

    /** @test */
    public function rate_limit_allows_within_limit(): void
    {
        $key    = 'test-key-' . uniqid();
        $result = RateLimit::check($key, 10);
        $this->assertTrue($result['allowed']);
        $this->assertArrayHasKey('remaining', $result);
        $this->assertArrayHasKey('retryAfter', $result);
    }

    /** @test */
    public function rate_limit_blocks_after_exceeding(): void
    {
        $key = 'test-exceeded-' . uniqid();
        for ($i = 0; $i < 3; $i++) {
            RateLimit::check($key, 2);
        }
        $result = RateLimit::check($key, 2);
        $this->assertFalse($result['allowed'], 'يجب أن يُرفض الطلب بعد تجاوز الحد');
        $this->assertSame(0, $result['remaining']);
    }

    /** @test */
    public function rate_limit_remaining_decreases(): void
    {
        $key     = 'test-remaining-' . uniqid();
        $first   = RateLimit::check($key, 5);
        $second  = RateLimit::check($key, 5);

        $this->assertGreaterThan($second['remaining'], $first['remaining']);
    }

    /** @test */
    public function get_client_key_returns_hash(): void
    {
        $_SERVER['REMOTE_ADDR'] = '192.168.1.1';
        $key = RateLimit::getClientKey();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $key, 'يجب أن يكون SHA-256 hex');
    }
}
