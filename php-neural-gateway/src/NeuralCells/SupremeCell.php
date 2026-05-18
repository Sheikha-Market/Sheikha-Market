<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\NeuralCells;

/**
 * خلية التوحيد العليا — Supreme Tawheed Cell
 *
 * الخلية السيادية الحاكمة فوق كل الطبقات
 * The sovereign cell above all layers — the governing root.
 *
 * "لَا إِلَٰهَ إِلَّا اللَّهُ" — أساس كل قرار
 *
 * وزنها: 2.0 (أعلى وزن في الشبكة)
 * طبيعتها: دائمة التفعيل — لا تُعطَّل
 */
class SupremeCell implements CellInterface
{
    public const ID        = 'supreme-tawheed';
    public const NAME      = 'خلية التوحيد العليا';
    public const PRINCIPLE = 'لا إله إلا الله — كل شيء لله';
    public const WEIGHT    = 2.0;

    /**
     * الخلية العليا singleton
     */
    private static ?SupremeCell $instance = null;

    private function __construct()
    {
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getId(): string
    {
        return self::ID;
    }

    public function getName(): string
    {
        return self::NAME;
    }

    public function getWeight(): float
    {
        return self::WEIGHT;
    }

    public function getPrinciple(): string
    {
        return self::PRINCIPLE;
    }

    /**
     * الخلية العليا دائماً تُعطي إشارة إيجابية ثابتة = weight
     * تُفعَّل دائماً بصرف النظر عن المدخل
     */
    public function activate(float $input = 1.0): float
    {
        return self::WEIGHT;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id'        => self::ID,
            'name'      => self::NAME,
            'principle' => self::PRINCIPLE,
            'weight'    => self::WEIGHT,
            'overrides' => true,
            'type'      => 'supreme',
            'alwaysOn'  => true,
        ];
    }
}
