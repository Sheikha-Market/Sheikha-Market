<?php

declare(strict_types=1);

/**
 * مُفعّل الشبكة العصبية الجذرية بلغة PHP.
 *
 * الهدف:
 * - تهيئة البيئة التشغيلية الأساسية.
 * - التأكد من متطلبات الأمان الحرجة.
 * - تشغيل فحوص تكامل للخدمات الأساسية.
 * - إصدار تقرير تشغيل موحد يمكن الرجوع له لاحقًا.
 */

error_reporting(E_ALL);

function rootPath(): string
{
    return dirname(__DIR__);
}

function runCommand(string $command, string $cwd): array
{
    $descriptor = [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $process = proc_open($command, $descriptor, $pipes, $cwd);
    if (!is_resource($process)) {
        return [
            'ok' => false,
            'exitCode' => 1,
            'stdout' => '',
            'stderr' => 'تعذر تشغيل الأمر.',
            'command' => $command,
        ];
    }

    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);

    return [
        'ok' => $exitCode === 0,
        'exitCode' => $exitCode,
        'stdout' => trim((string) $stdout),
        'stderr' => trim((string) $stderr),
        'command' => $command,
    ];
}

function ensureRuntimeEnv(string $root): array
{
    $runtimeFile = $root . '/.env.runtime';
    $exampleFile = $root . '/.env.example';
    $changes = [];

    if (!file_exists($runtimeFile) && file_exists($exampleFile)) {
        copy($exampleFile, $runtimeFile);
        $changes[] = '.env.runtime تم إنشاؤه من .env.example';
    }

    if (!file_exists($runtimeFile)) {
        file_put_contents($runtimeFile, "NODE_ENV=production\n");
        $changes[] = '.env.runtime تم إنشاؤه بالحد الأدنى';
    }

    $content = (string) file_get_contents($runtimeFile);

    $setOrReplace = static function (string $key, string $value, string $envContent): string {
        if (preg_match('/^' . preg_quote($key, '/') . '=.*/m', $envContent) === 1) {
            return (string) preg_replace('/^' . preg_quote($key, '/') . '=.*/m', $key . '=' . $value, $envContent);
        }

        return rtrim($envContent) . "\n" . $key . '=' . $value . "\n";
    };

    $needsSalt = !preg_match('/^PASSWORD_SALT=([^\n]{10,})$/m', $content);
    if ($needsSalt) {
        $salt = rtrim(strtr(base64_encode(random_bytes(24)), "+/", "-_"), '=');
        $content = $setOrReplace('PASSWORD_SALT', $salt, $content);
        $changes[] = 'تم توليد PASSWORD_SALT آمن';
    }

    $needsJwt = !preg_match('/^JWT_SECRET=([^\n]{32,})$/m', $content);
    if ($needsJwt) {
        $jwt = rtrim(strtr(base64_encode(random_bytes(48)), "+/", "-_"), '=');
        $content = $setOrReplace('JWT_SECRET', $jwt, $content);
        $changes[] = 'تم توليد JWT_SECRET آمن';
    }

    file_put_contents($runtimeFile, $content);
    @chmod($runtimeFile, 0600);

    return [
        'file' => $runtimeFile,
        'changes' => $changes,
    ];
}

function httpCheck(string $url, int $timeout = 5): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_CONNECTTIMEOUT => $timeout,
    ]);

    $body = (string) curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $ok = $errno === 0 && $code >= 200 && $code < 400;

    return [
        'url' => $url,
        'ok' => $ok,
        'httpCode' => $code,
        'error' => $error,
        'preview' => mb_substr($body, 0, 180),
    ];
}

function envToBool(string $value): bool
{
    $v = strtolower(trim($value));
    return in_array($v, ['1', 'true', 'yes', 'on'], true);
}

$root = rootPath();
$forceEnable = envToBool((string) getenv('SHEIKHA_FORCE_ENABLE_ALL'));

echo "[php-neural] بدء التفعيل الجذري...\n";

$envResult = ensureRuntimeEnv($root);

if ($forceEnable) {
    $runtimeFile = $root . '/.env.runtime';
    $content = (string) file_get_contents($runtimeFile);
    $pairs = [
        'OLLAMA_ENABLED' => 'true',
        'GOOGLE_CLOUD_PROJECT' => 'sheikha-marketplace',
        'GOOGLE_PROJECT_ID' => 'sheikha-marketplace',
    ];

    foreach ($pairs as $key => $value) {
        if (preg_match('/^' . preg_quote($key, '/') . '=.*/m', $content) === 1) {
            $content = (string) preg_replace('/^' . preg_quote($key, '/') . '=.*/m', $key . '=' . $value, $content);
        } else {
            $content .= "\n{$key}={$value}";
        }
    }

    file_put_contents($runtimeFile, rtrim($content) . "\n");
    $envResult['changes'][] = 'تم تفعيل وضع FORCE_ENABLE_ALL';
}

$steps = [];
$steps[] = runCommand('SHEIKHA_APP_CWD=' . escapeshellarg($root) . ' pm2 restart ecosystem.config.js --update-env', $root);
$steps[] = runCommand('pm2 save --force', $root);
$steps[] = runCommand('npm run -s ops:neural:auto', $root);

$checks = [
    'apiHealth' => httpCheck('http://127.0.0.1:8080/api/health'),
    'pythonDocs' => httpCheck('http://127.0.0.1:8000/docs'),
    'prometheus' => httpCheck('http://127.0.0.1:9090/-/healthy'),
    'grafana' => httpCheck('http://127.0.0.1:3000/api/health'),
    'ollama' => httpCheck((string) (getenv('OLLAMA_AZURE_ENDPOINT') ?: getenv('OLLAMA_HOST') ?: 'http://127.0.0.1:11434') . '/api/tags'),
];

// مسار تعافٍ تلقائي إذا كانت بوابة 8080 غير متاحة.
if (!$checks['apiHealth']['ok']) {
    $steps[] = runCommand('npm run -s server:restart', $root);
    usleep(1500000);
    $steps[] = runCommand('npm run -s ops:neural:auto', $root);
    $checks['apiHealth'] = httpCheck('http://127.0.0.1:8080/api/health');
}

$criticalOk = $checks['apiHealth']['ok'] && $checks['apiHealth']['httpCode'] === 200;

$report = [
    'success' => $criticalOk,
    'message' => $criticalOk ? 'تم تفعيل الشبكة العصبية الجذرية بنجاح.' : 'التفعيل اكتمل جزئياً ويوجد عناصر تحتاج متابعة.',
    'timestamp' => gmdate('c'),
    'data' => [
        'root' => $root,
        'env' => $envResult,
        'steps' => $steps,
        'checks' => $checks,
    ],
];

$reportDir = $root . '/reports';
if (!is_dir($reportDir)) {
    mkdir($reportDir, 0775, true);
}

$reportFile = $reportDir . '/neural-php-activation-report.json';
file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo '[php-neural] تقرير التفعيل: ' . $reportFile . "\n";
echo '[php-neural] الحالة: ' . ($report['success'] ? 'PASS' : 'PARTIAL') . "\n";

exit($report['success'] ? 0 : 2);
