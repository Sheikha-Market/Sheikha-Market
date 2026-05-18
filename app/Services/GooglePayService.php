<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Exception;

/**
 * خدمة Google Pay المتكاملة
 * 
 * توفر معالجة الدفع الآمن عبر Google Pay والمحافظ الرقمية
 */
class GooglePayService
{
    protected $merchantId;
    protected $merchantName;
    protected $publicKey;
    protected $environment;

    public function __construct()
    {
        $this->merchantId = config('services.google.pay_merchant_id');
        $this->merchantName = config('services.google.pay_merchant_name', 'Sheikha Market');
        $this->publicKey = config('services.google.pay_public_key');
        $this->environment = config('services.google.pay_environment', 'PRODUCTION');

        if (!$this->merchantId) {
            Log::channel('payment')->warning('Google Pay Merchant ID غير معرّف');
        }
    }

    /**
     * الحصول على بيانات الدفع المطلوبة للواجهة الأمامية
     */
    public function getPaymentDataRequest(float $amount, string $currency = 'SAR', array $metadata = [])
    {
        try {
            $paymentDataRequest = [
                'apiVersion' => 2,
                'apiVersionMinor' => 0,
                'allowedPaymentMethods' => [
                    [
                        'type' => 'CARD',
                        'parameters' => [
                            'allowedAuthMethods' => ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            'allowedCardNetworks' => ['MASTERCARD', 'VISA', 'AMEX'],
                        ],
                        'tokenizationSpecification' => [
                            'type' => 'PAYMENT_GATEWAY',
                            'parameters' => [
                                'gateway' => 'stripe',
                                'gatewayMerchantId' => config('services.stripe.merchant_id'),
                            ],
                        ],
                    ],
                ],
                'merchantInfo' => [
                    'merchantId' => $this->merchantId,
                    'merchantName' => $this->merchantName,
                ],
                'transactionInfo' => [
                    'totalPriceStatus' => 'FINAL',
                    'totalPrice' => number_format($amount, 2, '.', ''),
                    'currencyCode' => $currency,
                    'countryCode' => 'SA',
                ],
                'metadata' => $metadata,
            ];

            Log::channel('payment')->info("تم إنشاء بيانات الدفع: {$amount} {$currency}");

            return [
                'success' => true,
                'data' => $paymentDataRequest,
            ];

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في إنشاء بيانات الدفع: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * معالجة رد الاتصال من Google Pay
     */
    public function processPaymentToken(string $token, array $paymentData)
    {
        try {
            // التحقق من التوقيع
            $isValid = $this->verifySignature($token);

            if (!$isValid) {
                throw new Exception('فشل التحقق من التوقيع');
            }

            // فك تشفير البيانات
            $decryptedData = $this->decryptPaymentData($token);

            Log::channel('payment')->info("تم فك تشفير بيانات الدفع بنجاح");

            return [
                'success' => true,
                'payment_data' => $decryptedData,
                'token' => $token,
            ];

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في معالجة رد الاتصال: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * التحقق من التوقيع الرقمي
     */
    protected function verifySignature(string $token)
    {
        try {
            // في بيئة الإنتاج، تحقق من التوقيع باستخدام المفتاح العام
            $publicKey = file_get_contents(storage_path(
                'app/google-pay/' . config('services.google.pay_public_key')
            ));

            $isValid = openssl_verify(
                $token,
                base64_decode(json_decode($token)->signature),
                $publicKey,
                OPENSSL_ALGO_SHA256
            );

            return $isValid === 1;

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في التحقق من التوقيع: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * فك تشفير بيانات الدفع
     */
    protected function decryptPaymentData(string $token)
    {
        try {
            $data = json_decode($token, true);

            // في بيئة الإنتاج، استخدم OpenSSL أو مكتبة تشفير آمنة
            $decrypted = openssl_decrypt(
                $data['encryptedMessage'],
                'aes-256-gcm',
                base64_decode($data['ephemeralPublicKey']),
                OPENSSL_RAW_DATA,
                base64_decode($data['iv']),
                base64_decode($data['tag'])
            );

            return json_decode($decrypted, true);

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في فك التشفير: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * تسجيل المعاملة
     */
    public function recordTransaction(array $transactionData)
    {
        try {
            $transaction = \App\Models\Transaction::create([
                'user_id' => auth()->id(),
                'amount' => $transactionData['amount'],
                'currency' => $transactionData['currency'],
                'payment_method' => 'google_pay',
                'status' => 'pending',
                'token' => $transactionData['token'],
                'metadata' => $transactionData['metadata'] ?? [],
            ]);

            Log::channel('payment')->info("تم تسجيل معاملة جديدة: {$transaction->id}");

            return [
                'success' => true,
                'transaction_id' => $transaction->id,
            ];

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في تسجيل المعاملة: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * استرجاع المعاملات
     */
    public function getTransactions($userId = null)
    {
        try {
            $query = \App\Models\Transaction::query();

            if ($userId) {
                $query->where('user_id', $userId);
            } elseif (auth()->check()) {
                $query->where('user_id', auth()->id());
            }

            $transactions = $query->latest()->paginate(20);

            return [
                'success' => true,
                'transactions' => $transactions,
            ];

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في استرجاع المعاملات: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * حساب الرسوم والضرائب
     */
    public function calculateFees(float $amount, string $currency = 'SAR')
    {
        try {
            $googlePayFeePercentage = 2.4; // 2.4% رسم Google Pay
            $vatPercentage = 15; // 15% ضريبة القيمة المضافة

            $googlePayFee = ($amount * $googlePayFeePercentage) / 100;
            $subtotal = $amount + $googlePayFee;
            $vat = ($subtotal * $vatPercentage) / 100;
            $total = $subtotal + $vat;

            return [
                'amount' => $amount,
                'google_pay_fee' => round($googlePayFee, 2),
                'subtotal' => round($subtotal, 2),
                'vat' => round($vat, 2),
                'total' => round($total, 2),
                'currency' => $currency,
            ];

        } catch (Exception $e) {
            Log::channel('payment')->error("خطأ في حساب الرسوم: {$e->getMessage()}");
            throw $e;
        }
    }
}
