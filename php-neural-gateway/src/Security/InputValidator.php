<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Security;

/**
 * التحقق من المدخلات — Input Validator
 *
 * يتحقق من جميع المدخلات قبل معالجتها
 * "لا ضرر ولا ضرار" — الحديث الشريف
 */
class InputValidator
{
    /** الحد الأقصى لطول النص — Maximum text length */
    private const MAX_TEXT_LENGTH = 4096;

    /** الأنواع المسموح بها لـ type ─ Allowed types */
    private const ALLOWED_TYPES = [
        'TRADE', 'SALE', 'PURCHASE', 'LOAN', 'LOAN_WITH_INTEREST',
        'ZAKAT', 'WAQF', 'CONTRACT', 'INVESTMENT', 'SERVICE',
        'تجارة', 'بيع', 'شراء', 'قرض', 'استثمار', 'خدمة',
    ];

    /**
     * التحقق من سياق الاستدلال — Validate inference context
     *
     * @param mixed $raw البيانات الخام
     * @return array{ok: bool, data: array<string,mixed>, errors: string[]}
     */
    public function validateInferenceContext(mixed $raw): array
    {
        $errors = [];

        if ($raw === null || $raw === '') {
            return ['ok' => false, 'data' => [], 'errors' => ['البيانات مطلوبة — context is required']];
        }

        // قبول مصفوفة أو نص
        if (is_string($raw)) {
            $raw = trim($raw);
            if (strlen($raw) > self::MAX_TEXT_LENGTH) {
                return ['ok' => false, 'data' => [], 'errors' => ['النص طويل جداً — text too long']];
            }
            return ['ok' => true, 'data' => ['text' => $raw], 'errors' => []];
        }

        if (!is_array($raw)) {
            return ['ok' => false, 'data' => [], 'errors' => ['البيانات يجب أن تكون كائناً أو نصاً']];
        }

        $data = [];

        // نوع المعاملة
        if (isset($raw['type'])) {
            if (!is_string($raw['type'])) {
                $errors[] = 'type يجب أن يكون نصاً';
            } else {
                $data['type'] = substr(trim($raw['type']), 0, 64);
            }
        }

        // المبلغ
        if (isset($raw['amount'])) {
            if (!is_numeric($raw['amount'])) {
                $errors[] = 'amount يجب أن يكون رقماً';
            } elseif ((float)$raw['amount'] < 0) {
                $errors[] = 'amount لا يمكن أن يكون سالباً';
            } else {
                $data['amount'] = (float)$raw['amount'];
            }
        }

        // سعر الفائدة — Interest Rate
        if (isset($raw['interestRate'])) {
            if (!is_numeric($raw['interestRate'])) {
                $errors[] = 'interestRate يجب أن يكون رقماً';
            } else {
                $data['interestRate'] = (float)$raw['interestRate'];
            }
        }

        // علامات الربا / الغرر
        foreach (['riba', 'gharar', 'hasInterest', 'hasUncertainty', 'priceUnknown'] as $flag) {
            if (isset($raw[$flag])) {
                $data[$flag] = (bool)$raw[$flag];
            }
        }

        // نص حر
        if (isset($raw['text'])) {
            if (!is_string($raw['text'])) {
                $errors[] = 'text يجب أن يكون نصاً';
            } else {
                $data['text'] = substr(trim($raw['text']), 0, self::MAX_TEXT_LENGTH);
            }
        }

        if (!empty($errors)) {
            return ['ok' => false, 'data' => [], 'errors' => $errors];
        }

        return ['ok' => true, 'data' => $data, 'errors' => []];
    }

    /**
     * التحقق من بيانات التفعيل — Validate activation body
     *
     * @param mixed $raw
     * @return array{ok: bool, data: array<string,mixed>, errors: string[]}
     */
    public function validateActivationBody(mixed $raw): array
    {
        if ($raw === null || $raw === '') {
            // التفعيل بدون بيانات مقبول
            return ['ok' => true, 'data' => [], 'errors' => []];
        }

        if (!is_array($raw)) {
            return ['ok' => false, 'data' => [], 'errors' => ['body يجب أن يكون كائناً JSON']];
        }

        $data   = [];
        $errors = [];

        if (isset($raw['domain'])) {
            if (!is_string($raw['domain'])) {
                $errors[] = 'domain يجب أن يكون نصاً';
            } else {
                $data['domain'] = substr(trim($raw['domain']), 0, 64);
            }
        }

        if (isset($raw['action'])) {
            if (!is_string($raw['action'])) {
                $errors[] = 'action يجب أن يكون نصاً';
            } else {
                $data['action'] = substr(trim($raw['action']), 0, 256);
            }
        }

        if (isset($raw['region'])) {
            if (!is_string($raw['region'])) {
                $errors[] = 'region يجب أن يكون نصاً';
            } else {
                $data['region'] = substr(trim($raw['region']), 0, 64);
            }
        }

        if (!empty($errors)) {
            return ['ok' => false, 'data' => [], 'errors' => $errors];
        }

        return ['ok' => true, 'data' => $data, 'errors' => []];
    }

    /**
     * تعقيم نص للتسجيل الآمن — Sanitize text for safe logging
     * لا نُسجِّل بيانات حساسة أبداً
     */
    public function sanitizeForLog(string $text): string
    {
        // إخفاء tokens وأرقام البطاقات والكلمات السرية
        $patterns = [
            '/Bearer\s+[A-Za-z0-9\-._~+\/]+=*/i' => 'Bearer [REDACTED]',
            '/password["\s:=]+[^\s,}"]+/i'         => 'password:[REDACTED]',
            '/secret["\s:=]+[^\s,}"]+/i'            => 'secret:[REDACTED]',
            '/token["\s:=]+[A-Za-z0-9\-._~+\/]+/i' => 'token:[REDACTED]',
            '/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/' => '[CARD-REDACTED]',
        ];

        foreach ($patterns as $pattern => $replacement) {
            $text = (string)preg_replace($pattern, $replacement, $text);
        }

        return $text;
    }
}
