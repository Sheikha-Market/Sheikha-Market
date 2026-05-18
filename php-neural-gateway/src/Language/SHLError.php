<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language;

/**
 * خطأ في لغة شيخة — SHL Runtime/Compile Error
 */
class SHLError extends \RuntimeException
{
    private int $shlLine;
    private string $shlFile;

    public function __construct(string $message, int $shlLine = 0, string $shlFile = '<shl>')
    {
        $this->shlLine = $shlLine;
        $this->shlFile = $shlFile;
        parent::__construct("[$shlFile:$shlLine] $message");
    }

    public function getShlLine(): int     { return $this->shlLine; }
    public function getShlFile(): string  { return $this->shlFile; }
}

/**
 * إشارة إرجاع — Return signal (used for function returns)
 */
class ReturnSignal extends \Exception
{
    public mixed $value;
    public function __construct(mixed $value) { $this->value = $value; }
}

/**
 * إشارة الخروج من الحلقة — Break signal
 */
class BreakSignal extends \Exception {}

/**
 * إشارة التابع — Continue signal
 */
class ContinueSignal extends \Exception {}
