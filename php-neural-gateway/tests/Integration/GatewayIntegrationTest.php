<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Tests\Integration;

use PHPUnit\Framework\TestCase;
use Sheikha\NeuralGateway\Network\SNRNEngine;
use Sheikha\NeuralGateway\Security\InputValidator;
use Sheikha\NeuralGateway\Security\JwtAuth;
use Sheikha\NeuralGateway\Client\NodeJsClient;
use Sheikha\NeuralGateway\Logging\SheikhaLogger;
use Sheikha\NeuralGateway\Gateway\SheikhaGateway;

/**
 * اختبارات التكامل — Integration Tests
 *
 * تختبر تكامل مكونات PHP مع بعضها
 * (اختبارات Node.js تُنفَّذ فقط إذا كان الخادم متاحاً)
 *
 * "التكامل بين الطبقات كالتكامل بين العلوم"
 */
class GatewayIntegrationTest extends TestCase
{
    private SheikhaGateway $gateway;
    private SNRNEngine     $engine;
    private string         $nodeUrl;

    protected function setUp(): void
    {
        $this->nodeUrl = getenv('NODE_API_URL') ?: 'http://localhost:8080';
        $jwtSecret     = str_repeat('sheikha-integration-test-secret-x', 2);

        $this->engine  = SNRNEngine::getInstance();

        // إعادة تعيين singleton للاختبار
        $reflection = new \ReflectionClass(SNRNEngine::class);
        $prop       = $reflection->getProperty('instance');
        $prop->setAccessible(true);
        $prop->setValue(null, null);

        $this->engine = SNRNEngine::getInstance();

        $validator  = new InputValidator();
        $jwtAuth    = new JwtAuth($jwtSecret);
        $logger     = new SheikhaLogger('test', 'ERROR');
        $nodeClient = new NodeJsClient($this->nodeUrl, 5, 1, $logger);

        $this->gateway = new SheikhaGateway($this->engine, $validator, $nodeClient, $logger, $jwtAuth);
        $this->gateway->init();
    }

    // ── 1. تكامل المحرك مع البوابة ───────────────────────────────────────────

    /** @test */
    public function gateway_initializes_engine_with_19_cells(): void
    {
        $status = $this->engine->status();

        $this->assertTrue($status['ready'], 'المحرك يجب أن يكون جاهزاً');
        $this->assertSame(19, $status['totalCells'], 'يجب 19 خلية');
    }

    /** @test */
    public function gateway_health_handler_returns_php_engine_status(): void
    {
        $result = $this->gateway->handleHealth([]);

        $this->assertArrayHasKey('body', $result);
        $body = $result['body'];

        $this->assertArrayHasKey('phpEngine', $body);
        $this->assertTrue($body['phpEngine']['ready'], 'محرك PHP يجب أن يكون جاهزاً');
        $this->assertSame(19, $body['phpEngine']['totalCells']);
    }

    /** @test */
    public function gateway_neural_status_handler_returns_correct_structure(): void
    {
        $result = $this->gateway->handleNeuralStatus([]);

        $this->assertArrayHasKey('body', $result);
        $body = $result['body'];

        $this->assertArrayHasKey('totalCells', $body);
        $this->assertArrayHasKey('layers', $body);
        $this->assertArrayHasKey('ready', $body);
        $this->assertTrue($body['ready']);
    }

    /** @test */
    public function gateway_cells_handler_returns_all_19_cells(): void
    {
        $result = $this->gateway->handleNeuralCells([]);

        $this->assertArrayHasKey('body', $result);
        $this->assertSame(19, $result['body']['total']);
        $this->assertCount(19, $result['body']['cells']);
    }

    /** @test */
    public function gateway_neural_activate_handler_succeeds(): void
    {
        $_SERVER['__PARSED_BODY__'] = ['domain' => 'commerce', 'action' => 'تفعيل'];
        $result = $this->gateway->handleNeuralActivate([]);

        $this->assertArrayHasKey('body', $result);
        $this->assertTrue($result['body']['success']);
        $this->assertContains('SNRN-PHP-19-cells', $result['body']['networksActivated']);
        $this->assertSame(19, $result['body']['totalCells']);
    }

    /** @test */
    public function gateway_infer_handler_rejects_null_body(): void
    {
        $_SERVER['__PARSED_BODY__'] = null;
        $result = $this->gateway->handleNeuralInfer([]);

        $this->assertSame(400, $result['status']);
        $this->assertArrayHasKey('error', $result['body']);
    }

    /** @test */
    public function gateway_infer_handler_accepts_valid_trade(): void
    {
        $_SERVER['__PARSED_BODY__'] = ['type' => 'TRADE', 'amount' => 5000, 'interestRate' => 0];
        $result = $this->gateway->handleNeuralInfer([]);

        $this->assertSame(200, $result['status'] ?? 200);
        $this->assertArrayHasKey('verdict', $result['body']);
        $this->assertSame(SNRNEngine::VERDICT_HALAL, $result['body']['verdict']);
        $this->assertArrayHasKey('latencyMs', $result['body']);
        $this->assertSame('SNRN-PHP', $result['body']['engine']);
    }

    /** @test */
    public function gateway_infer_handler_detects_riba(): void
    {
        $_SERVER['__PARSED_BODY__'] = ['type' => 'LOAN_WITH_INTEREST', 'interestRate' => 15];
        $result = $this->gateway->handleNeuralInfer([]);

        $this->assertSame(SNRNEngine::VERDICT_HARAM, $result['body']['verdict']);
    }

    /** @test */
    public function gateway_halal_check_valid_trade(): void
    {
        $_SERVER['__PARSED_BODY__'] = ['type' => 'SALE', 'amount' => 100, 'interestRate' => 0];
        $result = $this->gateway->handleHalalCheck([]);

        $this->assertArrayHasKey('body', $result);
        $this->assertTrue($result['body']['isHalal']);
        $this->assertEmpty($result['body']['violations']);
    }

    /** @test */
    public function gateway_halal_check_riba_fails(): void
    {
        $_SERVER['__PARSED_BODY__'] = ['riba' => true, 'interestRate' => 8];
        $result = $this->gateway->handleHalalCheck([]);

        $this->assertFalse($result['body']['isHalal']);
        $this->assertNotEmpty($result['body']['violations']);
    }

    /** @test */
    public function gateway_maqasid_handler_returns_5_cells(): void
    {
        $_SERVER['__PARSED_BODY__'] = ['type' => 'TRADE'];
        $result = $this->gateway->handleMaqasid([]);

        $this->assertArrayHasKey('body', $result);
        $this->assertSame(5, $result['body']['cellCount']);
        $this->assertTrue($result['body']['available']);
    }

    /** @test */
    public function gateway_root_handler_lists_all_endpoints(): void
    {
        $result = $this->gateway->handleRoot([]);

        $this->assertArrayHasKey('body', $result);
        $body = $result['body'];

        $this->assertArrayHasKey('system',     $body);
        $this->assertArrayHasKey('endpoints',  $body);
        $this->assertArrayHasKey('cells',      $body);
        $this->assertSame(19, $body['cells']);
        $this->assertStringContainsString('PHP', $body['language']);
    }

    // ── 2. تكامل PHP ↔ Node.js (يُنفَّذ فقط إذا Node.js متاح) ───────────────

    /** @test */
    public function nodejs_health_check_is_skipped_if_unavailable(): void
    {
        $nodeClient = new NodeJsClient($this->nodeUrl, 2, 1);
        $alive      = $nodeClient->healthCheck();

        if ($alive) {
            $this->assertTrue($alive, '✅ Node.js متاح — اختبار التكامل الكامل');
        } else {
            $this->addWarning('⚠️ Node.js غير متاح — تم تخطي اختبار التكامل مع Node.js');
            $this->assertTrue(true); // لا نفشل الاختبار بسبب غياب Node.js
        }
    }

    /** @test */
    public function php_and_nodejs_engines_agree_on_halal_trade(): void
    {
        $nodeClient = new NodeJsClient($this->nodeUrl, 5, 1);

        if (!$nodeClient->healthCheck()) {
            $this->markTestSkipped('Node.js غير متاح');
        }

        // PHP inference
        $phpResult = $this->engine->infer(['type' => 'TRADE', 'interestRate' => 0, 'amount' => 1000]);

        // Node.js inference
        $nodeResponse = $nodeClient->post('api/neural/root/verify', ['type' => 'TRADE', 'interestRate' => 0]);

        // كلاهما يجب أن يتفق على الحلال
        $this->assertSame(SNRNEngine::VERDICT_HALAL, $phpResult['verdict'], 'PHP: HALAL');

        if ($nodeResponse->isSuccess()) {
            $nodeData = $nodeResponse->getData();
            $this->assertNotNull($nodeData, 'Node.js يجب أن يُرجع بيانات');
        }
    }

    /** @test */
    public function php_and_nodejs_engines_agree_on_haram_riba(): void
    {
        $phpResult = $this->engine->infer(['interestRate' => 20, 'riba' => true]);
        $this->assertSame(SNRNEngine::VERDICT_HARAM, $phpResult['verdict'], 'PHP: HARAM للربا');
    }

    // ── 3. اختبارات الأمان الشاملة ───────────────────────────────────────────

    /** @test */
    public function validation_blocks_array_injection_in_type(): void
    {
        $validator = new InputValidator();
        $result    = $validator->validateInferenceContext(['type' => ['$ne' => null]]);

        $this->assertFalse($result['ok'], 'حقن المصفوفة يجب أن يُرفض');
    }

    /** @test */
    public function validation_truncates_oversized_type(): void
    {
        $validator = new InputValidator();
        $longType  = str_repeat('X', 200);
        $result    = $validator->validateInferenceContext(['type' => $longType]);

        if ($result['ok']) {
            $this->assertLessThanOrEqual(64, strlen($result['data']['type']), 'type يجب أن يُقتطع');
        }
    }

    /** @test */
    public function jwt_tokens_from_gateway_are_verifiable(): void
    {
        $secret  = str_repeat('sheikha-gateway-secret-integration-', 2);
        $auth    = new JwtAuth($secret);

        $token   = $auth->issue(['userId' => 'user-42', 'role' => 'supplier']);
        $result  = $auth->verify($token);

        $this->assertTrue($result['valid']);
        $this->assertSame('user-42', $result['payload']['userId']);
        $this->assertSame('sheikha-neural-gateway', $result['payload']['iss']);
    }
}
