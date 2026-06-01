<?php

declare(strict_types=1);

require_once __DIR__ . '/../scripts/lib/sheikha-php-neural.php';

$action = $argv[1] ?? '';
$input = $argv[2] ?? '';
$output = $argv[3] ?? null;
$force = in_array('--force', $argv, true) || getenv('SHEIKHA_FORCE_ENABLE_ALL') === 'true';
$profile = $force ? 'staging' : 'local';
$strictIsolation = !$force;

if ($action === 'doctor') {
    $doctor = sheikha_php_neural_doctor();
    sheikha_php_neural_status_line('SHEIKHA_RUNTIME_DOCTOR', $doctor['ok'] ? 'OK' : 'FAIL');
    exit($doctor['ok'] ? 0 : 1);
}

if ($action !== 'compile' && $action !== 'run') {
    fwrite(STDERR, "Usage: php sheikha-lang/runtime.php <compile|run|doctor> <file.shk> [output.php]\n");
    exit(1);
}

if ($input === '') {
    fwrite(STDERR, "Missing input file.\n");
    exit(1);
}

if ($action === 'compile') {
    $result = sheikha_php_neural_compile($input, $output);
    if (!$result['ok']) {
        fwrite(STDERR, $result['stderr'] . PHP_EOL);
        exit($result['exit_code'] ?: 1);
    }

    sheikha_php_neural_status_line('SHEIKHA_RUNTIME_ACTION', 'COMPILE');
    sheikha_php_neural_status_line('SHEIKHA_RUNTIME_OUTPUT', $result['artifacts']['php']);
    exit(0);
}

$engine = in_array('--engine', $argv, true) ? $argv[array_search('--engine', $argv, true) + 1] : 'compiled';
$result = sheikha_php_neural_run_program($input, $engine, $profile, $strictIsolation);
if (!$result['ok']) {
    fwrite(STDERR, $result['stderr'] . PHP_EOL);
    exit($result['exit_code'] ?: 1);
}

sheikha_php_neural_status_line('SHEIKHA_RUNTIME_ACTION', 'RUN');
sheikha_php_neural_status_line('SHEIKHA_RUNTIME_ENGINE', strtoupper($engine));
sheikha_php_neural_status_line('SHEIKHA_RUNTIME_JSON', $result['artifacts']['json']);
sheikha_php_neural_status_line('SHEIKHA_RUNTIME_TRACE', $result['artifacts']['trace']);
