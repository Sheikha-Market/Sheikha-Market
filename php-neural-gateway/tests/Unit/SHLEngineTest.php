<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sheikha\NeuralGateway\Language\SHLEngine;
use Sheikha\NeuralGateway\Language\Lexer;
use Sheikha\NeuralGateway\Language\Parser;
use Sheikha\NeuralGateway\Language\Interpreter;
use Sheikha\NeuralGateway\Language\Token;
use Sheikha\NeuralGateway\Language\SHLError;

/**
 * اختبارات لغة شيخة البرمجية — SHL Language Tests
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 * "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ" — يوسف:2
 */
class SHLEngineTest extends TestCase
{
    private SHLEngine $engine;

    protected function setUp(): void
    {
        $reflection = new \ReflectionClass(SHLEngine::class);
        $prop       = $reflection->getProperty('instance');
        $prop->setAccessible(true);
        $prop->setValue(null, null);

        $this->engine = SHLEngine::getInstance();
    }

    // ── 1. المحرك والحالة ────────────────────────────────────────────────────

    /** @test */
    public function engine_status_has_required_fields(): void
    {
        $status = $this->engine->status();

        $this->assertArrayHasKey('language',    $status);
        $this->assertArrayHasKey('version',     $status);
        $this->assertArrayHasKey('features',    $status);
        $this->assertStringContainsString('SHL', $status['language']);
        $this->assertSame('1.0.0', $status['version']);
    }

    /** @test */
    public function engine_features_include_arabic_first(): void
    {
        $status = $this->engine->status();
        $this->assertTrue($status['features']['عربية أولاً']);
        $this->assertTrue($status['features']['شريعة مدمجة']);
        $this->assertTrue($status['features']['شبكة عصبية']);
        $this->assertTrue($status['features']['ثنائية اللغة']);
    }

    // ── 2. المحلل المعجمي ────────────────────────────────────────────────────

    /** @test */
    public function lexer_tokenizes_arabic_let(): void
    {
        $tokens = (new Lexer('ليكن اسم = "شيخة"'))->tokenize();
        $types  = array_column(array_map(fn($t) => ['t' => $t->getType()], $tokens), 't');

        $this->assertContains(Token::T_LET,        $types);
        $this->assertContains(Token::T_IDENTIFIER, $types);
        $this->assertContains(Token::T_ASSIGN,     $types);
        $this->assertContains(Token::T_STRING,     $types);
    }

    /** @test */
    public function lexer_tokenizes_english_let(): void
    {
        $tokens = (new Lexer('let x = 42'))->tokenize();
        $types  = array_column(array_map(fn($t) => ['t' => $t->getType()], $tokens), 't');

        $this->assertContains(Token::T_LET,    $types);
        $this->assertContains(Token::T_NUMBER, $types);
    }

    /** @test */
    public function lexer_recognizes_arabic_numerals(): void
    {
        $tokens = (new Lexer('ليكن عدد = ٤٢'))->tokenize();
        $numbers = array_filter($tokens, fn($t) => $t->is(Token::T_NUMBER));
        $this->assertNotEmpty($numbers);
        $num = reset($numbers);
        $this->assertSame(42, $num->getValue());
    }

    /** @test */
    public function lexer_recognizes_halal_as_true(): void
    {
        $tokens = (new Lexer('حلال'))->tokenize();
        $bools  = array_filter($tokens, fn($t) => $t->is(Token::T_BOOL_TRUE));
        $this->assertNotEmpty($bools);
    }

    /** @test */
    public function lexer_recognizes_haram_keywords(): void
    {
        $tokens = (new Lexer('لا_ربا لا_غرر'))->tokenize();
        $types  = array_column(array_map(fn($t) => ['t' => $t->getType()], $tokens), 't');

        $this->assertContains(Token::T_NO_RIBA,   $types);
        $this->assertContains(Token::T_NO_GHARAR, $types);
    }

    /** @test */
    public function lexer_skips_comments(): void
    {
        $tokens = (new Lexer("# تعليق\nليكن س = 1"))->tokenize();
        $types  = array_column(array_map(fn($t) => ['t' => $t->getType()], $tokens), 't');

        $this->assertNotContains(Token::T_COMMENT, $types);
        $this->assertContains(Token::T_LET,        $types);
    }

    /** @test */
    public function lexer_handles_arabic_comma(): void
    {
        $tokens = (new Lexer('[١، ٢، ٣]'))->tokenize();
        $commas = array_filter($tokens, fn($t) => $t->is(Token::T_COMMA));
        $this->assertCount(2, $commas);
    }

    // ── 3. التشغيل الأساسي ───────────────────────────────────────────────────

    /** @test */
    public function run_hello_world_arabic(): void
    {
        $result = $this->engine->run('اطبع("مرحباً بالعالم")');

        $this->assertTrue($result['success']);
        $this->assertContains('مرحباً بالعالم', $result['output']);
    }

    /** @test */
    public function run_hello_world_english(): void
    {
        $result = $this->engine->run('print("Hello from SHL")');

        $this->assertTrue($result['success']);
        $this->assertContains('Hello from SHL', $result['output']);
    }

    /** @test */
    public function run_arithmetic_addition(): void
    {
        $result = $this->engine->run('اطبع(٣ + ٤)');
        $this->assertTrue($result['success']);
        $this->assertContains('7', $result['output']);
    }

    /** @test */
    public function run_arithmetic_multiplication(): void
    {
        $result = $this->engine->run('اطبع(٦ * ٧)');
        $this->assertTrue($result['success']);
        $this->assertContains('42', $result['output']);
    }

    /** @test */
    public function run_string_concatenation(): void
    {
        $result = $this->engine->run('اطبع("سوق " + "شيخة")');
        $this->assertTrue($result['success']);
        $this->assertContains('سوق شيخة', $result['output']);
    }

    /** @test */
    public function run_variable_assignment(): void
    {
        $result = $this->engine->run("ليكن س = 10\nليكن ص = 20\nاطبع(س + ص)");
        $this->assertTrue($result['success']);
        $this->assertContains('30', $result['output']);
    }

    /** @test */
    public function run_if_condition_arabic(): void
    {
        $code = "ليكن ع = 5\nإذا ع > 3:\n    اطبع(\"كبير\")\nوإلا:\n    اطبع(\"صغير\")\nنهاية";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('كبير', $result['output']);
    }

    /** @test */
    public function run_for_loop_arabic(): void
    {
        $code = "ليكن مجموع = 0\nلكل ع في [1، 2، 3، 4، 5]:\n    مجموع += ع\nنهاية\nاطبع(مجموع)";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('15', $result['output']);
    }

    /** @test */
    public function run_while_loop(): void
    {
        $code = "ليكن ع = 0\nبينما ع < 3:\n    ع += 1\nنهاية\nاطبع(ع)";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('3', $result['output']);
    }

    /** @test */
    public function run_function_definition_and_call(): void
    {
        $code = "دالة مرحبا(اسم):\n    أرجع \"مرحباً \" + اسم\nنهاية_دالة\nاطبع(مرحبا(\"شيخة\"))";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('مرحباً شيخة', $result['output']);
    }

    /** @test */
    public function run_list_operations(): void
    {
        $code = "ليكن قائمتي = [١٠، ٢٠، ٣٠]\nاطبع(قائمتي[0])";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('10', $result['output']);
    }

    /** @test */
    public function run_object_literal(): void
    {
        $code = 'ليكن كائن = {"اسم": "شيخة", "عمر": 1}' . "\n" . 'اطبع(كائن["اسم"])';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('شيخة', $result['output']);
    }

    // ── 4. المكتبة القياسية ──────────────────────────────────────────────────

    /** @test */
    public function stdlib_zakat_calculation_above_nisab(): void
    {
        $code = "ليكن ز = احسب_زكاة(100000، 5950)\nاطبع(ز[\"وجبت\"])";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('حلال', $result['output']); // true = حلال in SHL
    }

    /** @test */
    public function stdlib_zakat_below_nisab_is_zero(): void
    {
        $code = "ليكن ز = احسب_زكاة(1000، 5950)\nاطبع(ز[\"مقدار\"])";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('0', $result['output']);
    }

    /** @test */
    public function stdlib_halal_check_works(): void
    {
        $code = 'ليكن ن = تحقق_حلال({"نوع": "TRADE", "interestRate": 0})' . "\n" . 'اطبع(ن["isHalal"])';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('حلال', $result['output']);
    }

    /** @test */
    public function stdlib_math_sqrt(): void
    {
        $code = 'اطبع(جذر(16))';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success']);
        $this->assertContains('4', $result['output']);
    }

    /** @test */
    public function stdlib_string_length(): void
    {
        $code = 'اطبع(طول("شيخة"))';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success']);
        $this->assertContains('4', $result['output']); // ش-ي-خ-ة = 4 أحرف
    }

    /** @test */
    public function stdlib_list_sum(): void
    {
        $code = 'اطبع(مجموع([1، 2، 3، 4، 5]))';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('15', $result['output']);
    }

    /** @test */
    public function stdlib_neural_network_status(): void
    {
        $code = 'ليكن ح = حالة_الشبكة()' . "\n" . 'اطبع(ح["totalCells"])';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('19', $result['output']);
    }

    /** @test */
    public function stdlib_bismillah_constant(): void
    {
        $code = 'اطبع(بسملة())';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success']);
        $this->assertNotEmpty($result['output']);
        // نتحقق فقط من طول النص (البسملة طويلة مع التشكيل)
        $this->assertGreaterThan(20, mb_strlen($result['output'][0]), 'البسملة يجب أن تكون أكثر من 20 حرف');
    }

    // ── 5. الشريعة ───────────────────────────────────────────────────────────

    /** @test */
    public function sharia_block_no_riba_executes(): void
    {
        $code = "شريعة:\n    لا_ربا\نهاية\nاطبع(\"شريعة مُفعَّلة\")";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('شريعة مُفعَّلة', $result['output']);
    }

    /** @test */
    public function riba_check_detects_interest(): void
    {
        $code = 'اطبع(ربا(5))';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success']);
        $this->assertContains('حلال', $result['output']); // true = interest exists
    }

    /** @test */
    public function riba_check_no_interest(): void
    {
        $code = 'اطبع(ربا(0))';
        $result = $this->engine->run($code);

        $this->assertTrue($result['success']);
        $this->assertContains('خطأ', $result['output']); // false = no interest
    }

    // ── 6. معالجة الأخطاء ────────────────────────────────────────────────────

    /** @test */
    public function try_catch_handles_error(): void
    {
        $code = "حاول:\n    أطلق \"خطأ تجريبي\"\nالتقط خطئي:\n    اطبع(\"التُقط: \" + خطئي)\nنهاية";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertNotEmpty($result['output']);
        $this->assertStringContainsString('التُقط', $result['output'][0]);
    }

    /** @test */
    public function division_by_zero_throws_error(): void
    {
        $code = "ليكن ن = 10 / 0";
        $result = $this->engine->run($code);

        $this->assertFalse($result['success']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('صفر', $result['error']);
    }

    /** @test */
    public function undefined_variable_throws_error(): void
    {
        $code = 'اطبع(متغير_غير_موجود)';
        $result = $this->engine->run($code);

        $this->assertFalse($result['success']);
        $this->assertNotNull($result['error']);
    }

    // ── 7. التحليل ───────────────────────────────────────────────────────────

    /** @test */
    public function lint_valid_code(): void
    {
        $result = $this->engine->lint('اطبع("صحيح")');
        $this->assertTrue($result['valid']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function tokenize_returns_token_list(): void
    {
        $tokens = $this->engine->tokenize('ليكن س = ٤٢');
        $this->assertIsArray($tokens);
        $this->assertNotEmpty($tokens);
        foreach ($tokens as $tok) {
            $this->assertArrayHasKey('type', $tok);
            $this->assertArrayHasKey('value', $tok);
            $this->assertArrayHasKey('line', $tok);
        }
    }

    /** @test */
    public function programs_run_counter_increments(): void
    {
        $before = $this->engine->status()['programsRun'];
        $this->engine->run('اطبع("١")');
        $this->engine->run('اطبع("٢")');
        $after  = $this->engine->status()['programsRun'];
        $this->assertSame($before + 2, $after);
    }

    // ── 8. الثنائية اللغوية ──────────────────────────────────────────────────

    /** @test */
    public function bilingual_mixed_arabic_english(): void
    {
        $code = "let x = 10\nليكن ص = 20\nprint(x + ص)";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('30', $result['output']);
    }

    /** @test */
    public function english_function_keyword_works(): void
    {
        $code = "function double(n):\n    return n * 2\nend\nprint(double(7))";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success'], $result['error'] ?? '');
        $this->assertContains('14', $result['output']);
    }

    /** @test */
    public function true_false_multiple_aliases(): void
    {
        $code = "اطبع(true)\nاطبع(false)\nاطبع(صح)\nاطبع(خطأ)";
        $result = $this->engine->run($code);

        $this->assertTrue($result['success']);
        $this->assertCount(4, $result['output']);
    }
}
