<?php

declare(strict_types=1);

return [
    'artifacts_dir' => 'build/sheikha-php-neural',
    'php' => [
        'min_version' => '8.1.0',
        'neural_probe' => 'php-ai-cluster/src/SheikhaRootNeural.php',
    ],
    'node' => [
        'binary' => getenv('SHEIKHA_NODE_BINARY') ?: 'node',
    ],
    'language' => [
        'compiler' => 'sheikha-language/compiler/sheikha-compiler.js',
        'runner' => 'sheikha-language/compiler/sheikha-runner.js',
    ],
    'examples' => [
        'market' => 'sheikha-language/examples/market.shk',
        'orchestration' => 'sheikha-language/examples/orchestration.shk',
        'full_activation' => 'sheikha-lang/examples/full-activation.shk',
        'ultimate_activation' => 'sheikha-lang/examples/ultimate-activation.shk',
    ],
];
