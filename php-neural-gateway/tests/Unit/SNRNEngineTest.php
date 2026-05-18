<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sheikha\NeuralGateway\Network\SNRNEngine;

/**
 * اختبارات محرك الشبكة العصبية الجذرية
 * SNRNEngine Unit Tests
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 * ﴿وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا﴾ — البقرة: ٣١
 */
class SNRNEngineTest extends TestCase
{
    private SNRNEngine $engine;

    protected function setUp(): void
    {
        // استخدام نسخة جديدة في كل اختبار — fresh instance per test
        $reflection = new \ReflectionClass(SNRNEngine::class);
        $prop       = $reflection->getProperty('instance');
        $prop->setAccessible(true);
        $prop->setValue(null, null);

        $this->engine = SNRNEngine::getInstance();
        $this->engine->init();
    }

    // ── 1. البنية والحالة ────────────────────────────────────────────────────

    /** @test */
    public function it_has_exactly_19_cells(): void
    {
        $status = $this->engine->status();
        $this->assertSame(19, $status['totalCells'], 'المحرك يجب أن يحتوي بالضبط 19 خلية');
    }

    /** @test */
    public function it_has_8_quran_cells(): void
    {
        $status = $this->engine->status();
        $this->assertSame(8, $status['layers']['quran']['cells'], 'يجب أن تكون 8 خلايا قرآنية');
    }

    /** @test */
    public function it_has_5_sunnah_cells(): void
    {
        $status = $this->engine->status();
        $this->assertSame(5, $status['layers']['sunnah']['cells'], 'يجب أن تكون 5 خلايا سنة نبوية');
    }

    /** @test */
    public function it_has_5_maqasid_cells(): void
    {
        $status = $this->engine->status();
        $this->assertSame(5, $status['layers']['maqasid']['cells'], 'يجب أن تكون 5 خلايا مقاصد');
    }

    /** @test */
    public function it_has_1_supreme_cell(): void
    {
        $status = $this->engine->status();
        $this->assertSame(1, $status['layers']['supreme']['cells'], 'يجب أن تكون 1 خلية توحيد عليا');
    }

    /** @test */
    public function it_is_ready_after_init(): void
    {
        $status = $this->engine->status();
        $this->assertTrue($status['ready'], 'المحرك يجب أن يكون جاهزاً بعد init()');
    }

    /** @test */
    public function status_has_required_keys(): void
    {
        $status = $this->engine->status();
        foreach (['network', 'version', 'ready', 'totalCells', 'layers', 'callCount', 'startedAt'] as $key) {
            $this->assertArrayHasKey($key, $status, "الحالة يجب أن تحتوي على '$key'");
        }
    }

    // ── 2. الاستدلال الشرعي ──────────────────────────────────────────────────

    /** @test */
    public function halal_trade_without_riba_returns_halal(): void
    {
        $result = $this->engine->infer(['type' => 'TRADE', 'interestRate' => 0, 'amount' => 5000]);

        $this->assertSame(SNRNEngine::VERDICT_HALAL, $result['verdict'], 'التجارة الحلال يجب أن تكون HALAL');
        $this->assertGreaterThanOrEqual(0.5, $result['confidence'], 'الثقة يجب أن تكون >= 0.5');
    }

    /** @test */
    public function riba_transaction_returns_haram(): void
    {
        $result = $this->engine->infer(['type' => 'LOAN_WITH_INTEREST', 'interestRate' => 12, 'amount' => 10000]);

        $this->assertSame(SNRNEngine::VERDICT_HARAM, $result['verdict'], 'الربا يجب أن يُعطي حكم HARAM');
        $this->assertGreaterThanOrEqual(0.95, $result['confidence'], 'الثقة في تحريم الربا يجب أن تكون عالية');
    }

    /** @test */
    public function gharar_transaction_returns_haram(): void
    {
        $result = $this->engine->infer(['type' => 'TRADE', 'gharar' => true, 'priceUnknown' => true]);

        $this->assertSame(SNRNEngine::VERDICT_HARAM, $result['verdict'], 'الغرر يجب أن يُعطي حكم HARAM');
    }

    /** @test */
    public function riba_flag_via_hasInterest_returns_haram(): void
    {
        $result = $this->engine->infer(['hasInterest' => true]);

        $this->assertSame(SNRNEngine::VERDICT_HARAM, $result['verdict']);
    }

    /** @test */
    public function inference_result_has_required_fields(): void
    {
        $result = $this->engine->infer(['type' => 'TRADE', 'amount' => 100]);

        $required = ['verdict', 'confidence', 'score', 'cellsActivated', 'quranCells', 'sunnahCells', 'maqasidCells', 'processedAt'];
        foreach ($required as $field) {
            $this->assertArrayHasKey($field, $result, "النتيجة يجب أن تحتوي على '$field'");
        }
    }

    /** @test */
    public function confidence_is_between_0_and_1(): void
    {
        $halal = $this->engine->infer(['type' => 'TRADE', 'interestRate' => 0]);
        $haram = $this->engine->infer(['interestRate' => 10]);

        $this->assertGreaterThanOrEqual(0.0, $halal['confidence']);
        $this->assertLessThanOrEqual(1.0, $halal['confidence']);
        $this->assertGreaterThanOrEqual(0.0, $haram['confidence']);
        $this->assertLessThanOrEqual(1.0, $haram['confidence']);
    }

    /** @test */
    public function score_is_normalized_between_minus1_and_1(): void
    {
        $result = $this->engine->infer(['type' => 'SALE', 'amount' => 200]);

        $this->assertGreaterThanOrEqual(-1.0, $result['score']);
        $this->assertLessThanOrEqual(1.0, $result['score']);
    }

    /** @test */
    public function call_count_increments(): void
    {
        $before = $this->engine->status()['callCount'];
        $this->engine->infer(['type' => 'TRADE']);
        $this->engine->infer(['type' => 'TRADE']);
        $after  = $this->engine->status()['callCount'];

        $this->assertSame($before + 2, $after, 'عداد الاستدعاءات يجب أن يزيد بـ 2');
    }

    // ── 3. فحص الحلال السريع ─────────────────────────────────────────────────

    /** @test */
    public function quick_halal_check_valid_trade(): void
    {
        $result = $this->engine->quickHalalCheck(['type' => 'SALE', 'amount' => 100, 'interestRate' => 0]);

        $this->assertTrue($result['isHalal'], 'التجارة السليمة يجب أن تجتاز فحص الحلال');
        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['violations'], 'لا يجب أن تكون هناك مخالفات');
    }

    /** @test */
    public function quick_halal_check_riba_fails(): void
    {
        $result = $this->engine->quickHalalCheck(['type' => 'LOAN_WITH_INTEREST', 'interestRate' => 5]);

        $this->assertFalse($result['isHalal'], 'الربا يجب أن يفشل في فحص الحلال');
        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['violations'], 'يجب أن تكون هناك مخالفات الربا');
    }

    /** @test */
    public function quick_halal_check_gharar_fails(): void
    {
        $result = $this->engine->quickHalalCheck(['type' => 'TRADE', 'gharar' => true]);

        $this->assertFalse($result['isHalal']);
        $this->assertNotEmpty($result['violations']);
    }

    /** @test */
    public function quick_halal_check_has_required_fields(): void
    {
        $result = $this->engine->quickHalalCheck(['type' => 'TRADE']);

        foreach (['isHalal', 'valid', 'verdict', 'confidence', 'violations', 'checkedAt'] as $field) {
            $this->assertArrayHasKey($field, $result, "فحص الحلال يجب أن يحتوي على '$field'");
        }
    }

    // ── 4. تقييم المقاصد ─────────────────────────────────────────────────────

    /** @test */
    public function maqasid_assessment_returns_object(): void
    {
        $result = $this->engine->assessMaqasid(['type' => 'TRADE', 'amount' => 500]);

        $this->assertIsArray($result, 'تقييم المقاصد يجب أن يُرجع مصفوفة');
        $this->assertTrue($result['available'], 'خلايا المقاصد يجب أن تكون متاحة');
        $this->assertSame(5, $result['cellCount'], 'يجب أن تكون 5 خلايا مقاصد');
    }

    /** @test */
    public function maqasid_assessment_has_all_5_maqasid(): void
    {
        $result = $this->engine->assessMaqasid([]);
        $maqasidIds = array_column($result['cells'], 'maqsad');

        $expected = ['deen', 'nafs', 'aql', 'nasl', 'maal'];
        foreach ($expected as $maqsad) {
            $this->assertContains($maqsad, $maqasidIds, "المقصد '$maqsad' يجب أن يكون موجوداً");
        }
    }

    // ── 5. قائمة الخلايا ─────────────────────────────────────────────────────

    /** @test */
    public function list_cells_returns_19_cells(): void
    {
        $result = $this->engine->listCells();

        $this->assertSame(19, $result['total'], 'يجب أن يكون هناك 19 خلية');
        $this->assertCount(19, $result['cells'], 'مصفوفة الخلايا يجب أن تحتوي 19 خلية');
    }

    /** @test */
    public function list_cells_has_layer_breakdown(): void
    {
        $result  = $this->engine->listCells();
        $layers  = $result['layers'];

        $this->assertSame(8, $layers['quran'],   'يجب 8 خلايا قرآنية');
        $this->assertSame(5, $layers['sunnah'],  'يجب 5 خلايا سنة');
        $this->assertSame(5, $layers['maqasid'], 'يجب 5 خلايا مقاصد');
        $this->assertSame(1, $layers['supreme'], 'يجب 1 خلية عليا');
    }

    // ── 6. خلية التوحيد العليا ───────────────────────────────────────────────

    /** @test */
    public function supreme_cell_is_singleton(): void
    {
        $cell1 = \Sheikha\NeuralGateway\NeuralCells\SupremeCell::getInstance();
        $cell2 = \Sheikha\NeuralGateway\NeuralCells\SupremeCell::getInstance();

        $this->assertSame($cell1, $cell2, 'خلية التوحيد العليا يجب أن تكون singleton');
    }

    /** @test */
    public function supreme_cell_always_returns_weight_2(): void
    {
        $cell   = \Sheikha\NeuralGateway\NeuralCells\SupremeCell::getInstance();
        $signal = $cell->activate(0.0); // حتى بمدخل صفر

        $this->assertSame(2.0, $signal, 'الخلية العليا دائماً تُعطي وزن 2.0');
    }

    /** @test */
    public function supreme_cell_principle_is_tawheed(): void
    {
        $cell = \Sheikha\NeuralGateway\NeuralCells\SupremeCell::getInstance();
        $this->assertStringContainsString('لا إله إلا الله', $cell->getPrinciple());
    }
}
