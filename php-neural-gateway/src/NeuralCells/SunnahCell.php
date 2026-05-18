<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\NeuralCells;

/**
 * خلية السنة النبوية — Sunnah Neural Cell
 *
 * خلايا مستنبطة من أحاديث النبي ﷺ التجارية
 * Cells derived from Prophetic hadiths on commerce and dealings.
 *
 * "النبي ﷺ كان تاجراً أميناً" — السيرة النبوية
 */
class SunnahCell implements CellInterface
{
    private string $id;
    private string $name;
    private string $topic;
    private float $weight;

    /** المواضيع المحظورة — Prohibition topics */
    private const PROHIBITION_TOPICS = ['غرر', 'ربا'];

    public function __construct(
        string $id,
        string $name,
        string $topic,
        float $weight = 1.0
    ) {
        $this->id     = $id;
        $this->name   = $name;
        $this->topic  = $topic;
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

    public function getTopic(): string
    {
        return $this->topic;
    }

    /**
     * هل الخلية تتعلق بمحظور؟ — Is this cell a prohibition cell?
     */
    public function isProhibition(): bool
    {
        return in_array($this->topic, self::PROHIBITION_TOPICS, true);
    }

    /**
     * تفعيل خلية السنة — Activate Sunnah cell
     *
     * المحظورات (ربا / غرر): إشارة سلبية × 1.5
     * غير المحظورات:          إشارة إيجابية × 1.0
     */
    public function activate(float $input): float
    {
        if ($this->isProhibition()) {
            return -($this->weight * $input * 1.5);
        }
        return $this->weight * $input;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'topic'       => $this->topic,
            'weight'      => $this->weight,
            'prohibition' => $this->isProhibition(),
            'type'        => 'sunnah',
        ];
    }

    /**
     * بناء خلايا السنة الخمس — Build the 5 standard Sunnah cells
     *
     * @return SunnahCell[]
     */
    public static function buildStandardCells(): array
    {
        return [
            new self('sc-trade',   'خلية التجارة النبوية', 'تجارة', 1.0),
            new self('sc-gharar',  'خلية الغرر النبوية',   'غرر',   1.0),
            new self('sc-riba',    'خلية الربا النبوية',   'ربا',   1.0),
            new self('sc-zakat',   'خلية الزكاة النبوية',  'زكاة',  1.0),
            new self('sc-honesty', 'خلية الأمانة',         'أمانة', 1.0),
        ];
    }
}
