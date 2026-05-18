<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Security;

/**
 * حد معدل الطلبات — Rate Limiter
 *
 * يحمي الخادم من الإغراق باستخدام ملفات APCu أو في الذاكرة
 * "لا ضرر ولا ضرار" — الحديث الشريف
 *
 * الحدود الافتراضية:
 *   - 60 طلب/دقيقة للعام
 *   - 120 طلب/دقيقة للمُصادَق عليه
 *   - 10 طلب/دقيقة لنقاط الاستدلال الثقيل
 */
class RateLimit
{
    public const LIMIT_PUBLIC    = 60;   // طلب/دقيقة للعام
    public const LIMIT_AUTH      = 120;  // طلب/دقيقة للمصادَق
    public const LIMIT_INFERENCE = 10;   // طلب/دقيقة للاستدلال العصبي

    public const WINDOW_SECONDS = 60;

    /** @var array<string, array{count: int, windowStart: int}> In-memory store */
    private static array $store = [];

    /**
     * التحقق من حد الطلبات — Check rate limit
     *
     * @param string $key  مفتاح التعريف (IP أو user_id)
     * @param int    $limit الحد الأقصى
     * @return array{allowed: bool, remaining: int, retryAfter: int}
     */
    public static function check(string $key, int $limit = self::LIMIT_PUBLIC): array
    {
        $now = time();

        // محاولة استخدام APCu إذا كان متاحاً
        if (function_exists('apcu_fetch') && ini_get('apc.enabled')) {
            return self::checkApcu($key, $limit, $now);
        }

        return self::checkMemory($key, $limit, $now);
    }

    /**
     * @return array{allowed: bool, remaining: int, retryAfter: int}
     */
    private static function checkApcu(string $key, int $limit, int $now): array
    {
        $apcKey = 'rl:' . $key;
        $data   = apcu_fetch($apcKey, $success);

        if (!$success || !is_array($data)) {
            $data = ['count' => 0, 'windowStart' => $now];
        }

        if (($now - $data['windowStart']) >= self::WINDOW_SECONDS) {
            $data = ['count' => 0, 'windowStart' => $now];
        }

        $data['count']++;
        apcu_store($apcKey, $data, self::WINDOW_SECONDS);

        $remaining   = max(0, $limit - $data['count']);
        $retryAfter  = (int)($data['windowStart'] + self::WINDOW_SECONDS - $now);
        $allowed     = $data['count'] <= $limit;

        return compact('allowed', 'remaining', 'retryAfter');
    }

    /**
     * @return array{allowed: bool, remaining: int, retryAfter: int}
     */
    private static function checkMemory(string $key, int $limit, int $now): array
    {
        if (!isset(self::$store[$key]) || ($now - self::$store[$key]['windowStart']) >= self::WINDOW_SECONDS) {
            self::$store[$key] = ['count' => 0, 'windowStart' => $now];
        }

        self::$store[$key]['count']++;
        $count       = self::$store[$key]['count'];
        $remaining   = max(0, $limit - $count);
        $retryAfter  = (int)(self::$store[$key]['windowStart'] + self::WINDOW_SECONDS - $now);
        $allowed     = $count <= $limit;

        return compact('allowed', 'remaining', 'retryAfter');
    }

    /**
     * استخراج IP العميل بأمان — Safely extract client IP
     */
    public static function getClientKey(): string
    {
        // نستخدم IP فقط — لا نستخدم headers يمكن تزويرها
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return hash('sha256', $ip);
    }
}
