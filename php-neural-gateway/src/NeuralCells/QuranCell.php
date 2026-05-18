<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\NeuralCells;

/**
 * خلية قرآنية — Quran Neural Cell
 *
 * خلايا اقتصادية مستنبطة من القرآن الكريم
 * Cells derived from Quranic economic principles.
 *
 * القواعد المدعومة:
 *   PROHIBITED  — محظور (ربا، غرر) → إشارة سلبية قوية
 *   OBLIGATORY  — واجب (زكاة)     → تعزيز قوي
 *   REQUIRED    — مطلوب (عدل، عقود) → تعزيز
 *   RECOMMENDED — مستحب (وقف)     → تعزيز خفيف
 *   STANDARD    — معيار (ذهب)     → محايد
 */
class QuranCell implements CellInterface
{
    public const RULE_PROHIBITED  = 'PROHIBITED';
    public const RULE_OBLIGATORY  = 'OBLIGATORY';
    public const RULE_REQUIRED    = 'REQUIRED';
    public const RULE_RECOMMENDED = 'RECOMMENDED';
    public const RULE_STANDARD    = 'STANDARD';
    public const RULE_PERMITTED   = 'PERMITTED';

    private string $id;
    private string $name;
    private string $rule;
    private string $nodeRef;
    private float $weight;

    public function __construct(
        string $id,
        string $name,
        string $rule,
        string $nodeRef,
        float $weight = 1.0
    ) {
        $this->id      = $id;
        $this->name    = $name;
        $this->rule    = $rule;
        $this->nodeRef = $nodeRef;
        $this->weight  = $weight;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getWeight(): float
    {
        return $this->weight;
    }

    public function getRule(): string
    {
        return $this->rule;
    }

    public function getNodeRef(): string
    {
        return $this->nodeRef;
    }

    /**
     * دالة التفعيل الإسلامية — Islamic activation function
     *
     * المحظورات: إشارة سلبية × 1.5
     * الواجبات:  إشارة إيجابية × 1.5
     * المطلوبات: إشارة إيجابية × 1.2
     * المستحبات: إشارة إيجابية × 0.8
     * المعاييـر: إشارة إيجابية × 1.0
     */
    public function activate(float $input): float
    {
        return match ($this->rule) {
            self::RULE_PROHIBITED  => $input * $this->weight * -1.5,
            self::RULE_OBLIGATORY  => $input * $this->weight * 1.5,
            self::RULE_REQUIRED    => $input * $this->weight * 1.2,
            self::RULE_RECOMMENDED => $input * $this->weight * 0.8,
            self::RULE_STANDARD,
            self::RULE_PERMITTED   => $input * $this->weight * 1.0,
            default                => $input * $this->weight * 1.0,
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id'      => $this->id,
            'name'    => $this->name,
            'rule'    => $this->rule,
            'nodeRef' => $this->nodeRef,
            'weight'  => $this->weight,
            'type'    => 'quran',
        ];
    }

    /**
     * بناء الخلايا القرآنية الثماني — Build the 8 standard Quran cells
     *
     * @return QuranCell[]
     */
    public static function buildStandardCells(): array
    {
        return [
            new self('qc-riba',     'خلية الربا',          self::RULE_PROHIBITED,  'node:riba',        1.0),
            new self('qc-trade',    'خلية التجارة',        self::RULE_PERMITTED,   'node:trade',       1.0),
            new self('qc-gharar',   'خلية الغرر',          self::RULE_PROHIBITED,  'node:gharar',      1.0),
            new self('qc-justice',  'خلية العدل',          self::RULE_REQUIRED,    'node:justice',     1.0),
            new self('qc-zakat',    'خلية الزكاة',         self::RULE_OBLIGATORY,  'node:zakat',       1.0),
            new self('qc-waqf',     'خلية الوقف',          self::RULE_RECOMMENDED, 'node:waqf',        0.9),
            new self('qc-gold',     'خلية الذهب والفضة',   self::RULE_STANDARD,    'node:gold-silver', 0.9),
            new self('qc-contract', 'خلية العقود',         self::RULE_REQUIRED,    'node:contract',    1.0),
        ];
    }
}
