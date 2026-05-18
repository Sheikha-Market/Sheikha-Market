<?php

declare(strict_types=1);

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                     ║
 * ║  نقطة الدخول — Sheikha PHP Neural Gateway Entry Point                       ║
 * ║  "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:31                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ── التحميل التلقائي ─────────────────────────────────────────────────────────
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error'   => 'تبعيات PHP غير مثبتة — Run: composer install',
        'hint'    => 'cd php-neural-gateway && composer install',
        'bismillah' => 'بسم الله الرحمن الرحيم',
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}
require_once $autoload;

// ── تحميل متغيرات البيئة ─────────────────────────────────────────────────────
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile) && class_exists('\Dotenv\Dotenv')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->safeLoad();
} elseif (file_exists($envFile)) {
    // fallback: تحليل يدوي بسيط لملف .env إذا لم تكن phpdotenv متاحة
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $val] = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val);
        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$val");
        }
    }
}

// ── إعداد معالج الأخطاء ──────────────────────────────────────────────────────
set_error_handler(function (int $errno, string $errstr): bool {
    if (!(error_reporting() & $errno)) {
        return false;
    }
    throw new \ErrorException($errstr, 0, $errno);
});

set_exception_handler(function (\Throwable $e): void {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    $isDev = (getenv('APP_ENV') ?: 'production') === 'development';
    echo json_encode([
        'error'   => 'خطأ غير متوقع — Unexpected error',
        'message' => $isDev ? $e->getMessage() : 'تحقق من السجلات',
        'bismillah' => 'بسم الله الرحمن الرحيم',
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
});

// ── بناء المكونات ─────────────────────────────────────────────────────────────
use Sheikha\NeuralGateway\Network\SNRNEngine;
use Sheikha\NeuralGateway\Security\InputValidator;
use Sheikha\NeuralGateway\Security\JwtAuth;
use Sheikha\NeuralGateway\Client\NodeJsClient;
use Sheikha\NeuralGateway\Logging\SheikhaLogger;
use Sheikha\NeuralGateway\Gateway\SheikhaGateway;

$jwtSecret  = getenv('JWT_SECRET') ?: '';
$nodeUrl    = getenv('NODE_API_URL') ?: 'http://localhost:8080';
$appEnv     = getenv('APP_ENV')     ?: 'production';
$logLevel   = getenv('LOG_LEVEL')   ?: 'INFO';
$timeout    = (int)(getenv('NODE_TIMEOUT') ?: 10);

// التحقق من الـ secret في الإنتاج
if ($appEnv === 'production' && strlen($jwtSecret) < 32) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'JWT_SECRET غير مضبوط — Set JWT_SECRET in .env (32+ chars)',
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}

// استخدام secret آمن للتطوير فقط
if (strlen($jwtSecret) < 32) {
    $jwtSecret = str_repeat('sheikha-dev-secret-', 3);
}

$logger    = new SheikhaLogger('gateway', strtoupper($logLevel));
$engine    = SNRNEngine::getInstance();
$validator = new InputValidator();
$jwtAuth   = new JwtAuth($jwtSecret);
$nodeClient = new NodeJsClient($nodeUrl, $timeout, 2, $logger);

$gateway = new SheikhaGateway($engine, $validator, $nodeClient, $logger, $jwtAuth);

// ── تشغيل البوابة ─────────────────────────────────────────────────────────────
$gateway->handle();
