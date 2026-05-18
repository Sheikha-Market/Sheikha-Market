<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Network;

use Sheikha\NeuralGateway\NeuralCells\QuranCell;
use Sheikha\NeuralGateway\NeuralCells\SunnahCell;
use Sheikha\NeuralGateway\NeuralCells\MaqasidCell;
use Sheikha\NeuralGateway\NeuralCells\SupremeCell;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA NEURAL ROOT NETWORK — PHP Edition (SNRN-PHP)                      ║
 * ║   شبكة الخلايا الجذرية العصبية — نسخة PHP                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:31
 *
 * المكونات (19 خلية):
 *   • خلايا القرآن الكريم   — 8 خلايا
 *   • خلايا السنة النبوية   — 5 خلايا
 *   • خلايا المقاصد الخمس  — 5 خلايا
 *   • خلية التوحيد العليا  — 1 خلية سيادية
 *
 * مرآة طبق الأصل لـ: sheikha-main-portal/core/neural-root-network/snrn-engine.js
 */
class SNRNEngine
{
    public const VERSION    = '1.0.0';
    public const NETWORK    = 'SNRN-PHP — Sheikha Neural Root Network (PHP)';
    public const TOTAL_CELLS = 19; // 8 + 5 + 5 + 1

    public const VERDICT_HALAL         = 'HALAL';
    public const VERDICT_HARAM         = 'HARAM';
    public const VERDICT_MAKRUH        = 'MAKRUH';
    public const VERDICT_REVIEW_NEEDED = 'REVIEW_NEEDED';

    /** @var QuranCell[] */
    private array $quranCells;

    /** @var SunnahCell[] */
    private array $sunnahCells;

    /** @var MaqasidCell[] */
    private array $maqasidCells;

    private SupremeCell $supremeCell;

    private bool $ready      = false;
    private int  $callCount  = 0;
    private ?string $startedAt = null;

    private static ?SNRNEngine $instance = null;

    private function __construct()
    {
        $this->quranCells   = QuranCell::buildStandardCells();
        $this->sunnahCells  = SunnahCell::buildStandardCells();
        $this->maqasidCells = MaqasidCell::buildStandardCells();
        $this->supremeCell  = SupremeCell::getInstance();
    }

    /**
     * Singleton — المحرك واحد في كل التطبيق
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * تهيئة الشبكة — Initialize the network
     *
     * @return array<string, mixed>
     */
    public function init(): array
    {
        if ($this->ready) {
            return $this->status();
        }
        $this->startedAt = (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM);
        $this->ready     = true;
        return $this->status();
    }

    /**
     * تشغيل الاستدلال الشرعي — Run sharia inference
     *
     * @param array<string, mixed> $context سياق المعاملة أو الاستفسار
     * @return array<string, mixed> النتيجة الشرعية
     */
    public function infer(array $context): array
    {
        $this->callCount++;

        // ── تحديد علامات المحظورات ────────────────────────────────────
        $hasInterest  = !empty($context['hasInterest'])
            || ($context['riba'] ?? false) === true
            || (isset($context['interestRate']) && (float)$context['interestRate'] > 0);

        $hasGharar    = !empty($context['hasUncertainty'])
            || ($context['gharar'] ?? false) === true
            || ($context['priceUnknown'] ?? false) === true;

        $prohibitionFlags = [
            'qc-riba'   => $hasInterest,
            'qc-gharar' => $hasGharar,
        ];

        $signals = [];
        $refs    = [];

        // ── ① تفعيل خلايا القرآن ─────────────────────────────────────
        foreach ($this->quranCells as $cell) {
            if ($cell->getRule() === QuranCell::RULE_PROHIBITED) {
                $input = isset($prohibitionFlags[$cell->getId()])
                      && $prohibitionFlags[$cell->getId()] ? 1.0 : 0.0;
            } else {
                $input = 0.5;
            }

            if ($input === 0.0) {
                continue; // لا دليل على المشكلة — skip
            }

            $signal = $cell->activate($input);
            $signals[] = $signal;

            if (abs($signal) > 0.5) {
                $refs[] = [
                    'type'   => 'quran',
                    'cell'   => $cell->getName(),
                    'signal' => round($signal, 3),
                ];
            }
        }

        // ── ② تفعيل خلايا السنة ──────────────────────────────────────
        $sunnahProhibitionTopics = [
            'غرر' => $hasGharar,
            'ربا' => $hasInterest,
        ];

        foreach ($this->sunnahCells as $cell) {
            $topic = $cell->getTopic();
            if (isset($sunnahProhibitionTopics[$topic])) {
                // خلية محظورة — تُفعَّل فقط عند وجود المشكلة
                if (!$sunnahProhibitionTopics[$topic]) {
                    continue;
                }
            }
            $input  = 1.0;
            $signal = $cell->activate($input);
            $signals[] = $signal;

            if (!empty($refs) || abs($signal) > 0.5) {
                $refs[] = [
                    'type'        => 'hadith',
                    'cell'        => $cell->getName(),
                    'topic'       => $topic,
                    'signal'      => round($signal, 3),
                ];
            }
        }

        // ── ③ تفعيل خلايا المقاصد ────────────────────────────────────
        foreach ($this->maqasidCells as $cell) {
            $signals[] = $cell->activate(1.0);
        }

        // ── ④ خلية التوحيد العليا — دائماً مُفعَّلة ──────────────────
        $signals[] = $this->supremeCell->activate();

        // ── ⑤ حساب الدرجة الكلية ─────────────────────────────────────
        $positiveSignals = array_filter($signals, fn($s) => $s > 0);
        $negativeSignals = array_filter($signals, fn($s) => $s < 0);

        $positiveSum = array_sum($positiveSignals);
        $negativeSum = abs((float)array_sum($negativeSignals));

        $totalCount  = count($signals);
        $rawScore    = $totalCount > 0 ? ($positiveSum - $negativeSum) / $totalCount : 0.0;
        $normalized  = max(-1.0, min(1.0, $rawScore));

        // ── ⑥ الحكم الشرعي ───────────────────────────────────────────
        // الربا أو الغرر → حرام قطعاً
        $hasRibaOrGharar = $hasInterest || $hasGharar;

        if ($hasRibaOrGharar || $negativeSum > 2.0) {
            $verdict    = self::VERDICT_HARAM;
            $confidence = $hasRibaOrGharar
                ? 0.99
                : min(0.99, $negativeSum / ($positiveSum + $negativeSum + 0.001));
        } elseif ($normalized > 0.5) {
            $verdict    = self::VERDICT_HALAL;
            $confidence = min(0.99, $normalized);
        } elseif ($normalized > 0.0) {
            $verdict    = self::VERDICT_MAKRUH;
            $confidence = 0.5 + $normalized * 0.3;
        } else {
            $verdict    = self::VERDICT_REVIEW_NEEDED;
            $confidence = 0.3;
        }

        return [
            'verdict'         => $verdict,
            'confidence'      => round($confidence, 4),
            'score'           => round($normalized, 4),
            'cellsActivated'  => count($signals),
            'quranCells'      => count($this->quranCells),
            'sunnahCells'     => count($this->sunnahCells),
            'maqasidCells'    => count($this->maqasidCells),
            'refs'            => array_slice($refs, 0, 5),
            'supremeCell'     => $this->supremeCell->getPrinciple(),
            'processedAt'     => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ];
    }

    /**
     * حالة الشبكة — Network status
     *
     * @return array<string, mixed>
     */
    public function status(): array
    {
        return [
            'network'     => self::NETWORK,
            'version'     => self::VERSION,
            'ready'       => $this->ready,
            'totalCells'  => self::TOTAL_CELLS,
            'layers'      => [
                'quran'   => [
                    'cells'       => count($this->quranCells),
                    'description' => 'خلايا القرآن الكريم',
                ],
                'sunnah'  => [
                    'cells'       => count($this->sunnahCells),
                    'description' => 'خلايا السنة النبوية',
                ],
                'maqasid' => [
                    'cells'       => count($this->maqasidCells),
                    'description' => 'خلايا المقاصد الشرعية',
                ],
                'supreme' => [
                    'cells'       => 1,
                    'description' => 'خلية التوحيد العليا',
                ],
            ],
            'callCount'   => $this->callCount,
            'startedAt'   => $this->startedAt,
            'superiority' => 'أعلى من Bitcoin + Siren AI — المرجع: الكتاب والسنة',
            'language'    => 'PHP',
        ];
    }

    /**
     * فحص حلال سريع — Quick halal check
     *
     * @param array<string, mixed> $context
     * @return array<string, mixed>
     */
    public function quickHalalCheck(array $context): array
    {
        $result     = $this->infer($context);
        $isHalal    = $result['verdict'] === self::VERDICT_HALAL;
        $violations = [];

        if (($context['riba'] ?? false) === true
            || (isset($context['interestRate']) && (float)$context['interestRate'] > 0)
            || !empty($context['hasInterest'])
        ) {
            $violations[] = ['rule' => 'NO_RIBA', 'description' => 'الربا محرم — وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا'];
        }

        if (($context['gharar'] ?? false) === true
            || ($context['priceUnknown'] ?? false) === true
            || !empty($context['hasUncertainty'])
        ) {
            $violations[] = ['rule' => 'NO_GHARAR', 'description' => 'الغرر الفاحش محرم — نهى النبي ﷺ عن بيع الغرر'];
        }

        return [
            'isHalal'    => $isHalal,
            'valid'      => $isHalal,
            'verdict'    => $result['verdict'],
            'confidence' => $result['confidence'],
            'violations' => $violations,
            'checkedAt'  => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ];
    }

    /**
     * تقييم المقاصد الشرعية — Assess Maqasid compliance
     *
     * @param array<string, mixed> $context
     * @return array<string, mixed>
     */
    public function assessMaqasid(array $context): array
    {
        $cellResults = [];
        $totalScore  = 0.0;

        foreach ($this->maqasidCells as $cell) {
            $signal        = $cell->activate(1.0);
            $totalScore   += $signal;
            $cellResults[] = [
                'maqsad' => $cell->getMaqsad(),
                'name'   => $cell->getName(),
                'score'  => round($signal, 4),
            ];
        }

        $avgScore  = count($this->maqasidCells) > 0
            ? $totalScore / count($this->maqasidCells)
            : 0.0;
        $fulfilled = $avgScore >= 0.7;

        return [
            'available'  => true,
            'fulfilled'  => $fulfilled,
            'avgScore'   => round($avgScore, 4),
            'cells'      => $cellResults,
            'cellCount'  => count($this->maqasidCells),
            'assessedAt' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
        ];
    }

    /**
     * عرض جميع الخلايا — List all cells
     *
     * @return array<string, mixed>
     */
    public function listCells(): array
    {
        $cells = [];
        foreach ($this->quranCells as $c) {
            $cells[] = $c->toArray();
        }
        foreach ($this->sunnahCells as $c) {
            $cells[] = $c->toArray();
        }
        foreach ($this->maqasidCells as $c) {
            $cells[] = $c->toArray();
        }
        $cells[] = $this->supremeCell->toArray();

        return [
            'total'  => count($cells),
            'cells'  => $cells,
            'layers' => [
                'quran'   => count($this->quranCells),
                'sunnah'  => count($this->sunnahCells),
                'maqasid' => count($this->maqasidCells),
                'supreme' => 1,
            ],
        ];
    }
}
