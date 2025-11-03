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
            'vnpay'      => 0.015,
            default      => 0.0,
        };
    }

    /**
     * $method: vi_ca_nhan | vnpay
     * $reference: thường là Ma_BC
     * $meta['type']: 'deposit' | 'final' (chúng ta sẽ chuyển thành hậu tố của TxnRef)
     */
    public function charge(
        string $method,
        float $amount,
        ?string $reference = null,
        array $meta = [],
        ?float $available = null
    ): array {
        // ví cá nhân
        if ($method === 'vi_ca_nhan') {
            if ($available !== null && $available < $amount) {
                return [
                    'success'    => false,
                    'message'    => 'Số dư không đủ để thanh toán.',
                    'error_code' => 'INSUFFICIENT_FUNDS',
                ];
            }

            return [
                'success'        => true,
                'transaction_id' => 'TRX-' . strtoupper(uniqid()),
                'paid_at'        => now()->toDateTimeString(),
                'message'        => 'Thanh toán bằng ví cá nhân thành công.',
            ];
        }

        // vnpay
        if ($method === 'vnpay') {
            // gốc: MA_BC
            $orderId = $reference ?? ('ORDER' . now()->format('YmdHis'));

            // thêm hậu tố để callback phân biệt
            // deposit -> -DP ; final -> -FN
            $suffix = '';
            if (($meta['type'] ?? '') === 'final') {
                $suffix = '-FN';
            } else {
                $suffix = '-DP';
            }

            $orderIdWithType = $orderId . $suffix;

            return [
                'success'      => true,
                'redirect_url' => $this->vnpay->createPaymentUrl($orderIdWithType, $amount),
                'message'      => 'Chuyển hướng tới VNPay...',
            ];
        }

        return [
            'success' => false,
            'message' => 'Phương thức thanh toán không được hỗ trợ.',
        ];
    }
}
