<?php

namespace App\Services;

class PaymentService
{
    protected VNPayService $vnpay;

    public function __construct(VNPayService $vnpay)
    {
        $this->vnpay = $vnpay;
    }

    public function feeRate(string $method): float
    {
        return match ($method) {
            'vi_ca_nhan' => 0.01,
            'vnpay' => 0.015,
            default => 0.0
        };
    }

    public function charge(string $method, float $amount, ?float $available = null): array
    {
        if ($method === 'vi_ca_nhan') {
            if ($available !== null && $available < $amount) {
                return [
                    'success' => false,
                    'message' => 'Số dư không đủ để thanh toán.',
                    'error_code' => 'INSUFFICIENT_FUNDS'
                ];
            }

            return [
                'success' => true,
                'transaction_id' => 'TRX-' . strtoupper(uniqid()),
                'paid_at' => now()->toDateTimeString(),
                'message' => 'Thanh toán bằng ví cá nhân thành công.'
            ];
        }

        if ($method === 'vnpay') {
            return [
                'success' => true,
                'redirect_url' => $this->vnpay->createPaymentUrl(
                    'ORDER' . now()->format('YmdHis'),
                    $amount
                ),
                'message' => 'Chuyển hướng tới VNPay...'
            ];
        }

        return ['success' => false, 'message' => 'Phương thức không được hỗ trợ.'];
    }
}
