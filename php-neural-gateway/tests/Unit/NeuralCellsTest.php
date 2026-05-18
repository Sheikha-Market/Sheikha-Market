<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sheikha\NeuralGateway\NeuralCells\QuranCell;
use Sheikha\NeuralGateway\NeuralCells\SunnahCell;
use Sheikha\NeuralGateway\NeuralCells\MaqasidCell;
use Sheikha\NeuralGateway\NeuralCells\SupremeCell;

/**
 * اختبارات وحدة الخلايا العصبية
 * Neural Cells Unit Tests
 */
class NeuralCellsTest extends TestCase
{
    // ── خلايا القرآن ─────────────────────────────────────────────────────────

    /** @test */
    public function quran_cell_prohibited_gives_negative_signal(): void
    {
        $cell   = new QuranCell('qc-riba', 'خلية الربا', QuranCell::RULE_PROHIBITED, 'node:riba', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertLessThan(0, $signal, 'المحظور يجب أن يُعطي إشارة سلبية');
        $this->assertSame(-1.5, $signal, 'المحظور × 1.0 = -1.5');
    }

    /** @test */
    public function quran_cell_obligatory_gives_strong_positive_signal(): void
    {
        $cell   = new QuranCell('qc-zakat', 'خلية الزكاة', QuranCell::RULE_OBLIGATORY, 'node:zakat', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertSame(1.5, $signal, 'الواجب × 1.0 = 1.5');
        $this->assertGreaterThan(0, $signal);
    }

    /** @test */
    public function quran_cell_required_gives_1_2_multiplier(): void
    {
        $cell   = new QuranCell('qc-justice', 'خلية العدل', QuranCell::RULE_REQUIRED, 'node:justice', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertSame(1.2, $signal);
    }

    /** @test */
    public function quran_cell_recommended_gives_0_8_multiplier(): void
    {
        $cell   = new QuranCell('qc-waqf', 'خلية الوقف', QuranCell::RULE_RECOMMENDED, 'node:waqf', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertSame(0.8, $signal);
    }

    /** @test */
    public function quran_cell_weight_scales_signal(): void
    {
        $cell   = new QuranCell('qc-waqf', 'خلية الوقف', QuranCell::RULE_RECOMMENDED, 'node:waqf', 0.9);
        $signal = $cell->activate(1.0);

        $this->assertEqualsWithDelta(0.72, $signal, 0.001);
    }

    /** @test */
    public function quran_cell_to_array_has_required_keys(): void
    {
        $cell  = new QuranCell('qc-trade', 'خلية التجارة', QuranCell::RULE_PERMITTED, 'node:trade', 1.0);
        $arr   = $cell->toArray();

        foreach (['id', 'name', 'rule', 'nodeRef', 'weight', 'type'] as $key) {
            $this->assertArrayHasKey($key, $arr);
        }
        $this->assertSame('quran', $arr['type']);
    }

    /** @test */
    public function build_standard_cells_returns_8_cells(): void
    {
        $cells = QuranCell::buildStandardCells();

        $this->assertCount(8, $cells);
        foreach ($cells as $cell) {
            $this->assertInstanceOf(QuranCell::class, $cell);
        }
    }

    /** @test */
    public function standard_quran_cells_include_riba_and_gharar_as_prohibited(): void
    {
        $cells = QuranCell::buildStandardCells();
        $ids   = array_map(fn($c) => $c->getId(), $cells);
        $rules = array_column(array_map(fn($c) => $c->toArray(), $cells), 'rule', 'id');

        $this->assertContains('qc-riba',   $ids);
        $this->assertContains('qc-gharar', $ids);
        $this->assertSame(QuranCell::RULE_PROHIBITED, $rules['qc-riba']);
        $this->assertSame(QuranCell::RULE_PROHIBITED, $rules['qc-gharar']);
    }

    // ── خلايا السنة ──────────────────────────────────────────────────────────

    /** @test */
    public function sunnah_prohibition_cell_gives_negative_signal(): void
    {
        $cell   = new SunnahCell('sc-riba', 'خلية الربا النبوية', 'ربا', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertLessThan(0, $signal, 'خلية الربا في السنة يجب أن تُعطي إشارة سلبية');
    }

    /** @test */
    public function sunnah_trade_cell_gives_positive_signal(): void
    {
        $cell   = new SunnahCell('sc-trade', 'خلية التجارة النبوية', 'تجارة', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertGreaterThan(0, $signal);
        $this->assertSame(1.0, $signal);
    }

    /** @test */
    public function sunnah_is_prohibition_for_riba_and_gharar(): void
    {
        $riba   = new SunnahCell('sc-riba',   'خلية الربا',  'ربا',  1.0);
        $gharar = new SunnahCell('sc-gharar', 'خلية الغرر', 'غرر', 1.0);
        $trade  = new SunnahCell('sc-trade',  'التجارة',    'تجارة', 1.0);

        $this->assertTrue($riba->isProhibition());
        $this->assertTrue($gharar->isProhibition());
        $this->assertFalse($trade->isProhibition());
    }

    /** @test */
    public function build_standard_sunnah_returns_5_cells(): void
    {
        $cells = SunnahCell::buildStandardCells();

        $this->assertCount(5, $cells);
    }

    // ── خلايا المقاصد ────────────────────────────────────────────────────────

    /** @test */
    public function maqasid_cell_gives_positive_signal(): void
    {
        $cell   = new MaqasidCell('mc-deen', 'حفظ الدين', 'deen', 1.0);
        $signal = $cell->activate(1.0);

        $this->assertGreaterThan(0, $signal);
        $this->assertSame(1.0, $signal);
    }

    /** @test */
    public function maqasid_nasl_has_lower_weight(): void
    {
        $cells     = MaqasidCell::buildStandardCells();
        $naslCells = array_filter($cells, fn($c) => $c->getMaqsad() === 'nasl');
        $nasl      = reset($naslCells);

        $this->assertInstanceOf(MaqasidCell::class, $nasl);
        $this->assertSame(0.8, $nasl->getWeight(), 'حفظ النسل له وزن 0.8');
    }

    /** @test */
    public function build_standard_maqasid_returns_5_cells(): void
    {
        $cells = MaqasidCell::buildStandardCells();

        $this->assertCount(5, $cells);
        $maqasids = array_map(fn($c) => $c->getMaqsad(), $cells);

        foreach (['deen', 'nafs', 'aql', 'nasl', 'maal'] as $maqsad) {
            $this->assertContains($maqsad, $maqasids, "المقصد '$maqsad' مطلوب");
        }
    }

    // ── خلية التوحيد العليا ──────────────────────────────────────────────────

    /** @test */
    public function supreme_cell_id_is_correct(): void
    {
        $cell = SupremeCell::getInstance();
        $this->assertSame(SupremeCell::ID, $cell->getId());
    }

    /** @test */
    public function supreme_cell_weight_is_2(): void
    {
        $cell = SupremeCell::getInstance();
        $this->assertSame(2.0, $cell->getWeight());
    }

    /** @test */
    public function supreme_cell_activation_ignores_input(): void
    {
        $cell = SupremeCell::getInstance();

        // بصرف النظر عن المدخل — the output is always 2.0
        $this->assertSame(2.0, $cell->activate(0.0));
        $this->assertSame(2.0, $cell->activate(0.5));
        $this->assertSame(2.0, $cell->activate(1.0));
    }

    /** @test */
    public function supreme_cell_to_array_has_overrides_true(): void
    {
        $arr = SupremeCell::getInstance()->toArray();

        $this->assertTrue($arr['overrides']);
        $this->assertTrue($arr['alwaysOn']);
        $this->assertSame('supreme', $arr['type']);
    }
}
