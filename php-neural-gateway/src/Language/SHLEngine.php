<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHL — محرك لغة شيخة البرمجية                                               ║
 * ║  Sheikha Language Engine — Arabic-first Programming Language                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * سير التنفيذ:
 *   شفرة المصدر (.shl)
 *     └─► Lexer      → تسلسل الرموز
 *           └─► Parser    → شجرة AST
 *                 └─► Interpreter → النتيجة
 *
 * الاستخدام:
 *   $engine = SHLEngine::getInstance();
 *   $result = $engine->run('اطبع("مرحباً بالعالم")');
 *
 * "وَجَعَلْنَا مِن كُلِّ شَيْءٍ حَيٍّ" — الأنبياء:30
 */
class SHLEngine
{
    public const VERSION  = '1.0.0';
    public const LANGUAGE = 'SHL — لغة شيخة البرمجية';
    public const AUTHOR   = 'شيخة — Sheikha Market™';

    private static ?SHLEngine $instance = null;

    private int $programsRun = 0;
    private ?string $startedAt = null;

    private function __construct()
    {
        $this->startedAt = (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * تشغيل برنامج SHL — Run SHL source code
     *
     * @return array{
     *   success: bool,
     *   output: string[],
     *   result: mixed,
     *   shariaViolations: string[],
     *   latencyMs: float,
     *   error: string|null,
     *   meta: array<string, mixed>
     * }
     */
    public function run(string $source, string $filename = '<shl>'): array
    {
        $this->programsRun++;
        $start = microtime(true);

        try {
            // ① المحلل المعجمي
            $lexer  = new Lexer($source);
            $tokens = $lexer->tokenize();

            // ② المحلل النحوي
            $parser = new Parser($tokens);
            $ast    = $parser->parse();

            // ③ المُفسِّر
            $interp = new Interpreter();
            $result = $interp->execute($ast);

            $latency = round((microtime(true) - $start) * 1000, 3);

            return [
                'success'          => true,
                'output'           => $result['output'],
                'result'           => $result['result'],
                'shariaViolations' => $result['shariaViolations'],
                'latencyMs'        => $latency,
                'error'            => null,
                'meta'             => [
                    'tokens'   => count($tokens),
                    'language' => self::LANGUAGE,
                    'version'  => self::VERSION,
                    'filename' => $filename,
                ],
            ];
        } catch (SHLError $e) {
            return [
                'success'          => false,
                'output'           => [],
                'result'           => null,
                'shariaViolations' => [],
                'latencyMs'        => round((microtime(true) - $start) * 1000, 3),
                'error'            => $e->getMessage(),
                'meta'             => ['language' => self::LANGUAGE, 'version' => self::VERSION],
            ];
        } catch (\Throwable $e) {
            return [
                'success'          => false,
                'output'           => [],
                'result'           => null,
                'shariaViolations' => [],
                'latencyMs'        => round((microtime(true) - $start) * 1000, 3),
                'error'            => 'خطأ داخلي: ' . $e->getMessage(),
                'meta'             => ['language' => self::LANGUAGE, 'version' => self::VERSION],
            ];
        }
    }

    /**
     * تحليل فقط — Parse only (lint)
     *
     * @return array{valid: bool, tokens: int, error: string|null}
     */
    public function lint(string $source): array
    {
        try {
            $tokens = (new Lexer($source))->tokenize();
            (new Parser($tokens))->parse();
            return ['valid' => true, 'tokens' => count($tokens), 'error' => null];
        } catch (SHLError $e) {
            return ['valid' => false, 'tokens' => 0, 'error' => $e->getMessage()];
        }
    }

    /**
     * تحليل معجمي فقط — Tokenize only
     *
     * @return array<array{type: string, value: mixed, line: int}>
     */
    public function tokenize(string $source): array
    {
        $tokens = (new Lexer($source))->tokenize();
        return array_map(fn($t) => [
            'type'  => $t->getType(),
            'value' => $t->getValue(),
            'line'  => $t->getLine(),
        ], $tokens);
    }

    /**
     * حالة المحرك — Engine status
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        return [
            'language'    => self::LANGUAGE,
            'version'     => self::VERSION,
            'author'      => self::AUTHOR,
            'programsRun' => $this->programsRun,
            'startedAt'   => $this->startedAt,
            'features'    => [
                'عربية أولاً'      => true,
                'ثنائية اللغة'     => true,
                'شريعة مدمجة'      => true,
                'شبكة عصبية'       => true,
                'دوال من الدرجة الأولى' => true,
                'أرقام عربية'       => true,
                'مكتبة قياسية'      => true,
                'معالجة أخطاء'      => true,
                'استيراد وحدات'     => true,
            ],
            'builtinModules' => ['رياضيات', 'نصوص', 'قوائم', 'شريعة', 'عصبي', 'تاريخ'],
            'superiority'   => 'أفضل من PHP في نطاق الاقتصاد الإسلامي والذكاء العصبي',
            'bismillah'     => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        ];
    }

    /**
     * تشغيل ملف .shl — Run a .shl file
     *
     * @return array<string, mixed>
     */
    public function runFile(string $path): array
    {
        if (!file_exists($path)) {
            return ['success' => false, 'error' => "الملف غير موجود: $path", 'output' => []];
        }
        $source = file_get_contents($path) ?: '';
        return $this->run($source, basename($path));
    }
}
