<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Client;

use Sheikha\NeuralGateway\Logging\SheikhaLogger;

/**
 * عميل Node.js API — NodeJs HTTP Client
 *
 * يتصل ببوابة Node.js الرئيسية (sheikha-main-portal) ويُوحِّد الاستجابات.
 * يدعم retry تلقائي، timeout، وإخفاء بيانات حساسة في السجلات.
 *
 * "التكامل بين الطبقات كالتكامل بين العلوم — كلٌّ يُقوّي الآخر"
 */
class NodeJsClient
{
    private string        $baseUrl;
    private int           $timeoutSeconds;
    private int           $maxRetries;
    private SheikhaLogger $logger;
    /** @var array<string, string> */
    private array         $defaultHeaders;

    public function __construct(
        string        $baseUrl        = 'http://localhost:8080',
        int           $timeoutSeconds = 10,
        int           $maxRetries     = 2,
        ?SheikhaLogger $logger        = null
    ) {
        $this->baseUrl        = rtrim($baseUrl, '/');
        $this->timeoutSeconds = $timeoutSeconds;
        $this->maxRetries     = $maxRetries;
        $this->logger         = $logger ?? new SheikhaLogger('nodejs-client');
        $this->defaultHeaders = [
            'Accept'       => 'application/json',
            'Content-Type' => 'application/json',
            'X-Source'     => 'sheikha-php-neural-gateway',
            'X-Version'    => '1.0.0',
        ];
    }

    /**
     * GET طلب — GET request
     *
     * @param string               $path
     * @param array<string,string> $headers
     * @return ApiResponse
     */
    public function get(string $path, array $headers = []): ApiResponse
    {
        return $this->request('GET', $path, null, $headers);
    }

    /**
     * POST طلب — POST request
     *
     * @param string               $path
     * @param array<string,mixed>  $body
     * @param array<string,string> $headers
     * @return ApiResponse
     */
    public function post(string $path, array $body = [], array $headers = []): ApiResponse
    {
        return $this->request('POST', $path, $body, $headers);
    }

    /**
     * تنفيذ الطلب مع retry — Execute request with retry
     *
     * @param string               $method
     * @param string               $path
     * @param array<string,mixed>|null $body
     * @param array<string,string> $headers
     */
    private function request(string $method, string $path, ?array $body, array $headers): ApiResponse
    {
        $url     = $this->baseUrl . '/' . ltrim($path, '/');
        $merged  = array_merge($this->defaultHeaders, $headers);
        $attempt = 0;

        $startMs = microtime(true);

        while ($attempt <= $this->maxRetries) {
            $attempt++;
            try {
                $response = $this->curlRequest($method, $url, $body, $merged);
                $latency  = round((microtime(true) - $startMs) * 1000, 2);

                if ($response['httpCode'] >= 200 && $response['httpCode'] < 300) {
                    $data = is_array($response['body']) ? $response['body'] : ['raw' => $response['body']];
                    $this->logger->info("[$method] $path → {$response['httpCode']}", ['latencyMs' => $latency]);
                    return ApiResponse::ok($data, $latency);
                }

                // 4xx لا تُعاد — client errors not retried
                if ($response['httpCode'] >= 400 && $response['httpCode'] < 500) {
                    $errorMsg = $response['body']['message'] ?? $response['body']['error'] ?? "HTTP {$response['httpCode']}";
                    $this->logger->warning("[$method] $path → {$response['httpCode']}: $errorMsg");
                    return ApiResponse::fail($response['httpCode'], (string)$errorMsg, round((microtime(true) - $startMs) * 1000, 2));
                }

                // 5xx تُعاد حتى maxRetries
                if ($attempt > $this->maxRetries) {
                    $this->logger->error("[$method] $path → {$response['httpCode']} (بعد $attempt محاولات)");
                    return ApiResponse::fail($response['httpCode'], "خطأ في الخادم — Server error {$response['httpCode']}", round((microtime(true) - $startMs) * 1000, 2));
                }

                usleep(200_000 * $attempt); // تأخير متصاعد

            } catch (\Throwable $e) {
                if ($attempt > $this->maxRetries) {
                    $this->logger->error("[$method] $path → استثناء: {$e->getMessage()}");
                    return ApiResponse::fail(503, 'الخادم غير متاح — Service unavailable', round((microtime(true) - $startMs) * 1000, 2));
                }
                usleep(300_000 * $attempt);
            }
        }

        return ApiResponse::fail(503, 'تجاوز عدد المحاولات — Max retries exceeded', round((microtime(true) - $startMs) * 1000, 2));
    }

    /**
     * تنفيذ طلب cURL — Execute cURL request
     *
     * @param string               $method
     * @param string               $url
     * @param array<string,mixed>|null $body
     * @param array<string,string> $headers
     * @return array{httpCode: int, body: mixed}
     */
    private function curlRequest(string $method, string $url, ?array $body, array $headers): array
    {
        $ch = curl_init();

        $curlHeaders = [];
        foreach ($headers as $key => $value) {
            $curlHeaders[] = "$key: $value";
        }

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $this->timeoutSeconds,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_HTTPHEADER     => $curlHeaders,
            CURLOPT_FOLLOWLOCATION => false,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body ?? []));
        } elseif ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($body !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            }
        }

        $raw      = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new \RuntimeException("cURL فشل: $curlErr");
        }

        $parsed = json_decode((string)$raw, true);
        $body   = is_array($parsed) ? $parsed : ['raw' => (string)$raw];

        return ['httpCode' => $httpCode, 'body' => $body];
    }

    /**
     * فحص صحة خادم Node.js — Health check against Node.js server
     */
    public function healthCheck(): bool
    {
        try {
            $response = $this->get('api/health');
            return $response->isSuccess();
        } catch (\Throwable) {
            return false;
        }
    }
}
