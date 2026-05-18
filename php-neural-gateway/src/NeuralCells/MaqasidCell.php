<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\NeuralCells;

/**
 * خلية المقاصد الشرعية — Maqasid Neural Cell
 *
 * خلايا المقاصد الخمس الضرورية:
 *   حفظ الدين — حفظ النفس — حفظ العقل — حفظ النسل — حفظ المال
 *
 * "المقاصد الخمس: أساس التشريع الإسلامي" — الغزالي، المستصفى
 */
class MaqasidCell implements CellInterface
{
    private string $id;
    private string $name;
    private string $maqsad;
    private float $weight;

    public function __construct(
        string $id,
        string $name,
        string $maqsad,
        float $weight = 1.0
    ) {
        $this->id     = $id;
        $this->name   = $name;
        $this->maqsad = $maqsad;
        $this->weight = $weight;
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

    public function getMaqsad(): string
    {
        return $this->maqsad;
    }

    /**
     * تفعيل خلية المقاصد — Activate Maqasid cell
     *
     * المقاصد دائماً إشارة إيجابية — تعزيز المعاملة الإسلامية
     */
    public function activate(float $input): float
    {
        return $this->weight * $input;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id'     => $this->id,
            'name'   => $this->name,
            'maqsad' => $this->maqsad,
            'weight' => $this->weight,
            'type'   => 'maqasid',
        ];
    }

    /**
     * بناء خلايا المقاصد الخمس — Build the 5 standard Maqasid cells
     *
     * @return MaqasidCell[]
     */
    public static function buildStandardCells(): array
    {
        return [
            new self('mc-deen', 'حفظ الدين',  'deen',  1.0),
            new self('mc-nafs', 'حفظ النفس',  'nafs',  1.0),
            new self('mc-aql',  'حفظ العقل',  'aql',   1.0),
            new self('mc-nasl', 'حفظ النسل',  'nasl',  0.8),
            new self('mc-maal', 'حفظ المال',  'maal',  1.0),
        ];
    }
}
