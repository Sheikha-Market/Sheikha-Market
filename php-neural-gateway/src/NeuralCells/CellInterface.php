<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\NeuralCells;

/**
 * واجهة الخلية العصبية — Neural Cell Interface
 *
 * كل خلية عصبية في شبكة الشبكة العصبية الجذرية يجب أن تنفّذ هذه الواجهة.
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة:31
 */
interface CellInterface
{
    /**
     * معرّف الخلية الفريد — Unique cell identifier
     */
    public function getId(): string;

    /**
     * اسم الخلية بالعربية — Arabic cell name
     */
    public function getName(): string;

    /**
     * الوزن العصبي — Neural weight (0.0 to 2.0)
     */
    public function getWeight(): float;

    /**
     * تفعيل الخلية بمدخل معيّن — Activate cell with given input
     *
     * @param float $input قيمة المدخل (0.0 to 1.0)
     * @return float إشارة الخلية
     */
    public function activate(float $input): float;

    /**
     * إرجاع بيانات الخلية كمصفوفة — Return cell data as array
     *
     * @return array<string, mixed>
     */
    public function toArray(): array;
}
