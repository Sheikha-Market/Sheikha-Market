<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Client;

/**
 * غلاف استجابة API — API Response Wrapper
 *
 * يوحّد شكل الاستجابة من نقاط Node.js وPHP
 */
class ApiResponse
{
    private bool   $success;
    private int    $statusCode;
    /** @var array<string, mixed>|null */
    private ?array $data;
    private ?string $error;
    private float  $latencyMs;

    /**
     * @param array<string, mixed>|null $data
     */
    public function __construct(
        bool    $success,
        int     $statusCode,
        ?array  $data      = null,
        ?string $error     = null,
        float   $latencyMs = 0.0
    ) {
        $this->success    = $success;
        $this->statusCode = $statusCode;
        $this->data       = $data;
        $this->error      = $error;
        $this->latencyMs  = $latencyMs;
    }

    public function isSuccess(): bool
    {
        return $this->success;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getData(): ?array
    {
        return $this->data;
    }

    public function getError(): ?string
    {
        return $this->error;
    }

    public function getLatencyMs(): float
    {
        return $this->latencyMs;
    }

    /**
     * تحويل إلى مصفوفة للإرسال — Convert to array for sending
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'success'    => $this->success,
            'statusCode' => $this->statusCode,
            'data'       => $this->data,
            'error'      => $this->error,
            'latencyMs'  => $this->latencyMs,
        ];
    }

    /**
     * بناء استجابة ناجحة — Build successful response
     *
     * @param array<string, mixed> $data
     */
    public static function ok(array $data, float $latencyMs = 0.0): self
    {
        return new self(true, 200, $data, null, $latencyMs);
    }

    /**
     * بناء استجابة خطأ — Build error response
     */
    public static function fail(int $statusCode, string $error, float $latencyMs = 0.0): self
    {
        return new self(false, $statusCode, null, $error, $latencyMs);
    }
}
