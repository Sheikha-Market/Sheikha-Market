<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sheikha\NeuralGateway\Gateway\Router;

/**
 * اختبارات الـ Router
 * Router Unit Tests
 */
class RouterTest extends TestCase
{
    private Router $router;

    protected function setUp(): void
    {
        $this->router = new Router();
    }

    /** @test */
    public function get_route_dispatches_correctly(): void
    {
        $this->router->get('/health', fn($params) => ['body' => ['ok' => true]]);
        $result = $this->router->dispatch('GET', '/health');

        $this->assertSame(200, $result['status']);
        $this->assertTrue($result['body']['ok']);
    }

    /** @test */
    public function post_route_dispatches_correctly(): void
    {
        $this->router->post('/neural/infer', fn($params) => ['status' => 201, 'body' => ['done' => true]]);
        $result = $this->router->dispatch('POST', '/neural/infer');

        $this->assertSame(201, $result['status']);
    }

    /** @test */
    public function unknown_route_returns_404(): void
    {
        $result = $this->router->dispatch('GET', '/nonexistent');

        $this->assertSame(404, $result['status']);
        $this->assertArrayHasKey('error', $result['body']);
    }

    /** @test */
    public function options_returns_204(): void
    {
        $result = $this->router->dispatch('OPTIONS', '/neural/infer');
        $this->assertSame(204, $result['status']);
    }

    /** @test */
    public function wildcard_route_matches_subpath(): void
    {
        $captured = [];
        $this->router->get('/api/*', function ($params) use (&$captured) {
            $captured = $params;
            return ['body' => ['wildcard' => $params['wildcard']]];
        });

        $result = $this->router->dispatch('GET', '/api/v2/status');

        $this->assertSame(200, $result['status']);
        $this->assertSame('v2/status', $result['body']['wildcard']);
    }

    /** @test */
    public function route_with_param_extracts_value(): void
    {
        $this->router->get('/cells/{id}', fn($params) => ['body' => ['id' => $params['id']]]);
        $result = $this->router->dispatch('GET', '/cells/qc-riba');

        $this->assertSame('qc-riba', $result['body']['id']);
    }

    /** @test */
    public function handler_exception_returns_500(): void
    {
        $this->router->get('/broken', function () {
            throw new \RuntimeException('Something went wrong');
        });

        $result = $this->router->dispatch('GET', '/broken');

        $this->assertSame(500, $result['status']);
        $this->assertArrayHasKey('error', $result['body']);
    }

    /** @test */
    public function get_does_not_match_post(): void
    {
        $this->router->get('/only-get', fn($params) => ['body' => ['ok' => true]]);
        $result = $this->router->dispatch('POST', '/only-get');

        $this->assertSame(404, $result['status']);
    }
}
