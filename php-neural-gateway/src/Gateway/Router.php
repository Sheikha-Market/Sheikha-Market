<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Gateway;

/**
 * موجِّه الطلبات — HTTP Router
 *
 * يُحوِّل كل طلب HTTP إلى الـ handler المناسب
 * بسيط، سريع، بدون تبعيات خارجية
 */
class Router
{
    /** @var array<string, array<string, callable>> method → pattern → handler */
    private array $routes = [];

    /**
     * تسجيل مسار GET
     */
    public function get(string $pattern, callable $handler): void
    {
        $this->routes['GET'][$pattern] = $handler;
    }

    /**
     * تسجيل مسار POST
     */
    public function post(string $pattern, callable $handler): void
    {
        $this->routes['POST'][$pattern] = $handler;
    }

    /**
     * تسجيل مسار لكل الأساليب
     */
    public function any(string $pattern, callable $handler): void
    {
        foreach (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as $method) {
            $this->routes[$method][$pattern] = $handler;
        }
    }

    /**
     * توجيه الطلب الحالي — Dispatch current request
     *
     * @param string $method  الأسلوب HTTP
     * @param string $path    المسار الطلوب
     * @return array{status: int, body: array<string,mixed>, headers: array<string,string>}
     */
    public function dispatch(string $method, string $path): array
    {
        // OPTIONS للـ CORS
        if ($method === 'OPTIONS') {
            return ['status' => 204, 'body' => [], 'headers' => []];
        }

        $methodRoutes = $this->routes[$method] ?? [];

        foreach ($methodRoutes as $pattern => $handler) {
            $params = $this->match($pattern, $path);
            if ($params !== null) {
                try {
                    $result = $handler($params);
                    if (!is_array($result)) {
                        $result = ['data' => $result];
                    }
                    return [
                        'status'  => $result['status'] ?? 200,
                        'body'    => $result['body'] ?? $result,
                        'headers' => $result['headers'] ?? [],
                    ];
                } catch (\Throwable $e) {
                    return [
                        'status'  => 500,
                        'body'    => ['error' => 'خطأ داخلي في الخادم', 'message' => $e->getMessage()],
                        'headers' => [],
                    ];
                }
            }
        }

        return [
            'status'  => 404,
            'body'    => ['error' => 'المسار غير موجود — Not Found', 'path' => $path],
            'headers' => [],
        ];
    }

    /**
     * مطابقة المسار مع النمط — Match path against pattern
     *
     * يدعم:  /neural/status  (ثابت)
     *         /neural/{id}    (معامل)
     *         /api/v2/*       (wildcard)
     *
     * @return array<string,string>|null null إذا لم يتطابق
     */
    private function match(string $pattern, string $path): ?array
    {
        // wildcard
        if (str_ends_with($pattern, '/*')) {
            $prefix = rtrim(substr($pattern, 0, -2), '/');
            if (str_starts_with($path, $prefix)) {
                return ['wildcard' => substr($path, strlen($prefix) + 1)];
            }
            return null;
        }

        // تحويل {param} إلى regex
        $regex = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#u';

        if (preg_match($regex, $path, $matches)) {
            $params = [];
            foreach ($matches as $key => $value) {
                if (is_string($key)) {
                    $params[$key] = $value;
                }
            }
            return $params;
        }

        return null;
    }
}
