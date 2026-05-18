<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Gateway;

use Sheikha\NeuralGateway\Network\SNRNEngine;
use Sheikha\NeuralGateway\Security\InputValidator;
use Sheikha\NeuralGateway\Security\RateLimit;
use Sheikha\NeuralGateway\Security\JwtAuth;
use Sheikha\NeuralGateway\Client\NodeJsClient;
use Sheikha\NeuralGateway\Logging\SheikhaLogger;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  بوابة شيخة PHP الرئيسية — Sheikha PHP Neural Gateway                      ║
 * ║  النقطة المركزية لكل عمليات الشبكة العصبية الجذرية بلغة PHP                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿ وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ ﴾ — الأنبياء:30
 *
 * نقاط API المُفعَّلة:
 *   GET  /health                         ← فحص الصحة الشامل
 *   GET  /neural/status                  ← حالة الشبكة العصبية
 *   GET  /neural/cells                   ← قائمة كل الخلايا (19 خلية)
 *   POST /neural/infer                   ← الاستدلال الشرعي
 *   POST /neural/activate                ← تفعيل الشبكة
 *   POST /neural/halal-check             ← فحص الحلال السريع
 *   POST /neural/maqasid                 ← تقييم المقاصد الشرعية
 *   GET  /api/v2/*                       ← بروكسي لـ Node.js /api/v2/*
 *   GET  /api/*                          ← بروكسي لـ Node.js /api/*
 */
class SheikhaGateway
{
    private SNRNEngine     $engine;
    private InputValidator $validator;
    private NodeJsClient   $nodeClient;
    private SheikhaLogger  $logger;
    private JwtAuth        $jwtAuth;
    private Router         $router;

    private bool $initialized = false;

    public function __construct(
        SNRNEngine     $engine,
        InputValidator $validator,
        NodeJsClient   $nodeClient,
        SheikhaLogger  $logger,
        JwtAuth        $jwtAuth
    ) {
        $this->engine     = $engine;
        $this->validator  = $validator;
        $this->nodeClient = $nodeClient;
        $this->logger     = $logger;
        $this->jwtAuth    = $jwtAuth;
        $this->router     = new Router();
    }

    /**
     * تهيئة وتسجيل كل المسارات — Initialize and register all routes
     */
    public function init(): void
    {
        if ($this->initialized) {
            return;
        }

        // تفعيل المحرك العصبي
        $this->engine->init();

        // ── تسجيل المسارات ────────────────────────────────────────────
        $this->router->get('/health',               [$this, 'handleHealth']);
        $this->router->get('/neural/status',         [$this, 'handleNeuralStatus']);
        $this->router->get('/neural/cells',          [$this, 'handleNeuralCells']);
        $this->router->post('/neural/infer',         [$this, 'handleNeuralInfer']);
        $this->router->post('/neural/activate',      [$this, 'handleNeuralActivate']);
        $this->router->post('/neural/halal-check',   [$this, 'handleHalalCheck']);
        $this->router->post('/neural/maqasid',       [$this, 'handleMaqasid']);

        // بروكسي شامل لـ Node.js — Full proxy to Node.js
        $this->router->any('/api/v2/*',              [$this, 'handleProxyV2']);
        $this->router->any('/api/*',                 [$this, 'handleProxy']);

        // مسار جذر الترحيب
        $this->router->get('/',                      [$this, 'handleRoot']);

        $this->initialized = true;
        $this->logger->info('🧠 بوابة شيخة PHP مُفعَّلة — Sheikha PHP Gateway initialized');
    }

    /**
     * معالجة الطلب الوارد — Handle incoming HTTP request
     */
    public function handle(): void
    {
        if (!$this->initialized) {
            $this->init();
        }

        $this->sendSecurityHeaders();

        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        $path   = '/' . ltrim(rawurldecode($path), '/');

        // ── Rate Limiting ──────────────────────────────────────────────
        $rlKey    = RateLimit::getClientKey();
        $isInfer  = str_contains($path, '/neural/infer') || str_contains($path, '/neural/halal-check');
        $limit    = $isInfer ? RateLimit::LIMIT_INFERENCE : RateLimit::LIMIT_PUBLIC;
        $rl       = RateLimit::check($rlKey, $limit);

        header('X-RateLimit-Limit: ' . $limit);
        header('X-RateLimit-Remaining: ' . $rl['remaining']);

        if (!$rl['allowed']) {
            $this->sendJson(['error' => 'تجاوزت حد الطلبات — Too many requests'], 429, [
                'Retry-After' => (string)$rl['retryAfter'],
            ]);
            return;
        }

        // ── تحليل الـ Body ─────────────────────────────────────────────
        $body = $this->parseBody();

        // ── توجيه الطلب ───────────────────────────────────────────────
        $_SERVER['__PARSED_BODY__'] = $body; // نقل الـ body للـ handlers
        $result = $this->router->dispatch($method, $path);

        $this->sendJson($result['body'], $result['status'], $result['headers'] ?? []);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleRoot(array $_params): array
    {
        return ['body' => [
            'system'      => 'شبكة شيخة العصبية الجذرية — Sheikha Neural Root Network (PHP)',
            'version'     => '1.0.0',
            'language'    => 'PHP 8.1+',
            'cells'       => SNRNEngine::TOTAL_CELLS,
            'principle'   => 'بسم الله الرحمن الرحيم — لا إله إلا الله',
            'endpoints'   => [
                'GET /health',
                'GET /neural/status',
                'GET /neural/cells',
                'POST /neural/infer',
                'POST /neural/activate',
                'POST /neural/halal-check',
                'POST /neural/maqasid',
                'GET|POST /api/v2/*  (proxy → Node.js)',
                'GET|POST /api/*     (proxy → Node.js)',
            ],
            'nodeJsReady' => $this->nodeClient->healthCheck(),
            'timestamp'   => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ]];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleHealth(array $_params): array
    {
        $engineStatus = $this->engine->status();
        $nodeAlive    = $this->nodeClient->healthCheck();

        $overallReady = $engineStatus['ready'] && $nodeAlive;

        return ['body' => [
            'status'     => $overallReady ? 'healthy' : 'degraded',
            'phpEngine'  => [
                'ready'      => $engineStatus['ready'],
                'totalCells' => $engineStatus['totalCells'],
                'version'    => $engineStatus['version'],
            ],
            'nodeJs'     => [
                'alive'   => $nodeAlive,
                'message' => $nodeAlive ? 'Node.js خادم متاح' : 'Node.js خادم غير متاح',
            ],
            'checkedAt'  => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ], 'status' => $overallReady ? 200 : 206];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleNeuralStatus(array $_params): array
    {
        return ['body' => $this->engine->status()];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleNeuralCells(array $_params): array
    {
        return ['body' => $this->engine->listCells()];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleNeuralInfer(array $_params): array
    {
        $body = $_SERVER['__PARSED_BODY__'] ?? null;

        // التحقق من المدخلات
        if (is_array($body)) {
            $validation = $this->validator->validateInferenceContext($body);
        } elseif (is_string($body)) {
            $validation = $this->validator->validateInferenceContext($body);
        } else {
            return ['status' => 400, 'body' => ['error' => 'body مطلوب — context required']];
        }

        if (!$validation['ok']) {
            return ['status' => 400, 'body' => ['error' => 'بيانات غير صالحة', 'details' => $validation['errors']]];
        }

        $context = $validation['data'];
        $start   = microtime(true);
        $result  = $this->engine->infer($context);
        $latency = round((microtime(true) - $start) * 1000, 2);

        $result['latencyMs'] = $latency;
        $result['engine']    = 'SNRN-PHP';

        $this->logger->info('استدلال عصبي', ['verdict' => $result['verdict'], 'latencyMs' => $latency]);

        return ['body' => $result];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleNeuralActivate(array $_params): array
    {
        $body       = $_SERVER['__PARSED_BODY__'] ?? [];
        $validation = $this->validator->validateActivationBody(is_array($body) ? $body : []);

        if (!$validation['ok']) {
            return ['status' => 400, 'body' => ['error' => 'بيانات غير صالحة', 'details' => $validation['errors']]];
        }

        $status = $this->engine->init();

        $this->logger->info('تفعيل الشبكة العصبية', ['cells' => $status['totalCells']]);

        return ['body' => [
            'success'          => true,
            'networksActivated' => ['SNRN-PHP-19-cells'],
            'totalCells'       => $status['totalCells'],
            'status'           => $status,
            'activatedAt'      => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ]];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleHalalCheck(array $_params): array
    {
        $body = $_SERVER['__PARSED_BODY__'] ?? null;

        if (!is_array($body)) {
            return ['status' => 400, 'body' => ['error' => 'body JSON مطلوب']];
        }

        $validation = $this->validator->validateInferenceContext($body);
        if (!$validation['ok']) {
            return ['status' => 400, 'body' => ['error' => 'بيانات غير صالحة', 'details' => $validation['errors']]];
        }

        $result = $this->engine->quickHalalCheck($validation['data']);
        $this->logger->info('فحص الحلال', ['isHalal' => $result['isHalal']]);

        return ['body' => $result];
    }

    /**
     * @param array<string,string> $_params
     * @return array<string,mixed>
     */
    public function handleMaqasid(array $_params): array
    {
        $body = $_SERVER['__PARSED_BODY__'] ?? [];
        if (!is_array($body)) {
            $body = [];
        }

        $result = $this->engine->assessMaqasid($body);
        return ['body' => $result];
    }

    /**
     * بروكسي /api/v2/* → Node.js /api/v2/*
     *
     * @param array<string,string> $params
     * @return array<string,mixed>
     */
    public function handleProxyV2(array $params): array
    {
        return $this->proxyToNode('api/v2/' . ($params['wildcard'] ?? ''));
    }

    /**
     * بروكسي /api/* → Node.js /api/*
     *
     * @param array<string,string> $params
     * @return array<string,mixed>
     */
    public function handleProxy(array $params): array
    {
        return $this->proxyToNode('api/' . ($params['wildcard'] ?? ''));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * توجيه إلى Node.js — Proxy to Node.js
     *
     * @return array<string,mixed>
     */
    private function proxyToNode(string $path): array
    {
        $method     = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        $headers = [];
        if ($authHeader !== '') {
            $headers['Authorization'] = $authHeader;
        }

        $body = $_SERVER['__PARSED_BODY__'] ?? [];

        $response = $method === 'POST' || $method === 'PUT' || $method === 'PATCH'
            ? $this->nodeClient->post($path, is_array($body) ? $body : [], $headers)
            : $this->nodeClient->get($path, $headers);

        if ($response->isSuccess()) {
            return ['status' => 200, 'body' => $response->getData() ?? []];
        }

        return [
            'status' => $response->getStatusCode(),
            'body'   => ['error' => $response->getError(), 'proxied' => true, 'path' => $path],
        ];
    }

    /**
     * إرسال الإجابة JSON — Send JSON response
     *
     * @param array<string,mixed>  $data
     * @param array<string,string> $extraHeaders
     */
    private function sendJson(array $data, int $status = 200, array $extraHeaders = []): void
    {
        http_response_code($status);
        foreach ($extraHeaders as $key => $value) {
            header("$key: $value");
        }
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * إرسال ترويسات الأمان — Send security headers
     */
    private function sendSecurityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('X-Powered-By: Sheikha Neural Gateway');

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = getenv('CORS_ORIGIN') ?: '*';

        if ($allowed === '*' || $origin === $allowed) {
            header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Max-Age: 86400');
        }
    }

    /**
     * تحليل body الطلب — Parse request body
     *
     * @return array<string,mixed>|string|null
     */
    private function parseBody(): array|string|null
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $raw         = file_get_contents('php://input') ?: '';

        if (str_contains($contentType, 'application/json')) {
            $decoded = json_decode($raw, true);
            return is_array($decoded) ? $decoded : null;
        }

        if (str_contains($contentType, 'application/x-www-form-urlencoded')) {
            return $_POST;
        }

        if (strlen($raw) > 0) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
            return $raw;
        }

        return null;
    }
}
