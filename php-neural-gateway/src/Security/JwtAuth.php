<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Security;

/**
 * مصادقة JWT — JWT Authentication
 *
 * يدير إصدار والتحقق من رموز JWT للمنظومة
 * لا يُسجِّل أي بيانات حساسة في السجلات
 */
class JwtAuth
{
    private string $secret;
    private string $algorithm;
    private int    $ttl; // seconds

    public function __construct(
        string $secret,
        string $algorithm = 'HS256',
        int    $ttl       = 3600
    ) {
        if (strlen($secret) < 32) {
            throw new \InvalidArgumentException('JWT secret يجب أن يكون 32 حرفاً على الأقل');
        }
        $this->secret    = $secret;
        $this->algorithm = $algorithm;
        $this->ttl       = $ttl;
    }

    /**
     * إصدار رمز JWT — Issue a JWT token
     *
     * @param array<string, mixed> $payload
     * @return string
     */
    public function issue(array $payload): string
    {
        $now = time();

        $claims = array_merge($payload, [
            'iss' => 'sheikha-neural-gateway',
            'aud' => 'sheikha-market',
            'iat' => $now,
            'exp' => $now + $this->ttl,
            'jti' => bin2hex(random_bytes(16)),
        ]);

        $header    = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => $this->algorithm]) ?: '');
        $body      = $this->base64UrlEncode(json_encode($claims) ?: '');
        $signature = $this->sign("$header.$body");

        return "$header.$body.$signature";
    }

    /**
     * التحقق من صحة رمز JWT — Verify JWT token
     *
     * @param string $token
     * @return array{valid: bool, payload: array<string,mixed>|null, error: string|null}
     */
    public function verify(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return ['valid' => false, 'payload' => null, 'error' => 'صيغة الرمز غير صحيحة'];
        }

        [$header, $body, $providedSig] = $parts;

        // التحقق من التوقيع — verify signature
        $expectedSig = $this->sign("$header.$body");
        if (!hash_equals($expectedSig, $providedSig)) {
            return ['valid' => false, 'payload' => null, 'error' => 'توقيع الرمز غير صحيح'];
        }

        // فك الترميز — decode payload
        $decoded = json_decode($this->base64UrlDecode($body), true);
        if (!is_array($decoded)) {
            return ['valid' => false, 'payload' => null, 'error' => 'محتوى الرمز تالف'];
        }

        // التحقق من الانتهاء — check expiry
        if (isset($decoded['exp']) && (int)$decoded['exp'] < time()) {
            return ['valid' => false, 'payload' => null, 'error' => 'انتهت صلاحية الرمز'];
        }

        // التحقق من المُصدِر — verify issuer
        if (($decoded['iss'] ?? '') !== 'sheikha-neural-gateway') {
            return ['valid' => false, 'payload' => null, 'error' => 'مُصدِر الرمز غير معروف'];
        }

        return ['valid' => true, 'payload' => $decoded, 'error' => null];
    }

    /**
     * استخراج رمز من header Authorization — Extract token from Authorization header
     */
    public function extractFromHeader(string $authHeader): ?string
    {
        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = trim(substr($authHeader, 7));
            return $token !== '' ? $token : null;
        }
        return null;
    }

    private function sign(string $data): string
    {
        return $this->base64UrlEncode(
            hash_hmac('sha256', $data, $this->secret, true)
        );
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $padded = str_pad(strtr($data, '-_', '+/'), strlen($data) + (4 - strlen($data) % 4) % 4, '=');
        return (string)base64_decode($padded);
    }
}
