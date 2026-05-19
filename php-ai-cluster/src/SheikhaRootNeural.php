<?php

final class SheikhaRootNeural
{
    public function __construct(
        private string $baseUrl = 'http://127.0.0.1:8080'
    ) {}

    public function health(): array
    {
        return $this->get('/api/health');
    }

    public function neural(): array
    {
        return $this->get('/api/network/neural/status');
    }

    public function governance(): array
    {
        return $this->get('/api/governance/status');
    }

    private function get(string $path): array
    {
        $json = file_get_contents($this->baseUrl . $path);
        return json_decode($json ?: '{}', true) ?: [];
    }
}
