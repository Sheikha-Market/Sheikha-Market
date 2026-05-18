<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Logging;

/**
 * مُسجِّل آمن — Secure Logger
 *
 * يُسجِّل العمليات دون كشف بيانات حساسة
 * "لا تُسجِّل ما يضر الناس"
 *
 * المستويات: DEBUG | INFO | WARNING | ERROR
 */
class SheikhaLogger
{
    public const LEVEL_DEBUG   = 'DEBUG';
    public const LEVEL_INFO    = 'INFO';
    public const LEVEL_WARNING = 'WARNING';
    public const LEVEL_ERROR   = 'ERROR';

    private const LEVEL_PRIORITY = [
        self::LEVEL_DEBUG   => 0,
        self::LEVEL_INFO    => 1,
        self::LEVEL_WARNING => 2,
        self::LEVEL_ERROR   => 3,
    ];

    private string $minLevel;
    private string $channel;

    /** الحقول الحساسة التي يجب إخفاؤها دائماً */
    private const SENSITIVE_KEYS = [
        'password', 'secret', 'token', 'key', 'credential',
        'authorization', 'passwd', 'pwd', 'api_key', 'apikey',
    ];

    public function __construct(string $channel = 'neural-gateway', string $minLevel = self::LEVEL_INFO)
    {
        $this->channel  = $channel;
        $this->minLevel = $minLevel;
    }

    /**
     * @param array<string, mixed> $context
     */
    public function debug(string $message, array $context = []): void
    {
        $this->log(self::LEVEL_DEBUG, $message, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    public function info(string $message, array $context = []): void
    {
        $this->log(self::LEVEL_INFO, $message, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    public function warning(string $message, array $context = []): void
    {
        $this->log(self::LEVEL_WARNING, $message, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    public function error(string $message, array $context = []): void
    {
        $this->log(self::LEVEL_ERROR, $message, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    private function log(string $level, string $message, array $context): void
    {
        // تجاهل المستويات الأقل من الحد الأدنى
        if ((self::LEVEL_PRIORITY[$level] ?? 0) < (self::LEVEL_PRIORITY[$this->minLevel] ?? 0)) {
            return;
        }

        $safeContext = $this->redactSensitive($context);
        $timestamp   = (new \DateTimeImmutable())->format('Y-m-d H:i:s');
        $contextStr  = empty($safeContext) ? '' : ' ' . json_encode($safeContext, JSON_UNESCAPED_UNICODE);

        $line = sprintf('[%s] [%s] [%s] %s%s', $timestamp, $level, $this->channel, $message, $contextStr);

        // STDOUT للـ INFO+، STDERR للـ ERROR
        if ($level === self::LEVEL_ERROR) {
            fwrite(STDERR, $line . PHP_EOL);
        } else {
            fwrite(STDOUT, $line . PHP_EOL);
        }
    }

    /**
     * إخفاء البيانات الحساسة — Redact sensitive data
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function redactSensitive(array $data): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            $lowerKey = strtolower((string)$key);
            $isSensitive = false;
            foreach (self::SENSITIVE_KEYS as $sensitiveKey) {
                if (str_contains($lowerKey, $sensitiveKey)) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $result[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $result[$key] = $this->redactSensitive($value);
            } else {
                $result[$key] = $value;
            }
        }
        return $result;
    }
}
