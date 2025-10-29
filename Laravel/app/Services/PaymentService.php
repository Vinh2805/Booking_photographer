<?php

namespace App\Services;

class PaymentService
{
    // Mô phỏng cổng thanh toán: trả về success nếu "sodu" (truyền từ FE) >= totalCharge
    public function charge(string $method, float $totalCharge, ?float $available = null): array
    {
        // available = số dư ví / thẻ do FE gửi lên (demo). Khi tích hợp cổng thật, thay phần này.
        if ($available !== null && $available < $totalCharge) {
            return [
                'success' => false,
                'error_code' => 'INSUFFICIENT_FUNDS',
                'message' => 'Số dư không đủ để thanh toán.'
            ];
        }

        // Giả lập giao dịch thành công
        return [
            'success' => true,
            'transaction_id' => 'TRX-' . strtoupper(uniqid()),
            'paid_at' => now()->toDateTimeString(),
        ];
    }

    // Phí dịch vụ theo phương thức. Có thể chỉnh theo chính sách của bạn.
    public function feeRate(string $method): float
    {
        // vi_ca_nhan: 1%, the_ngan_hang: 2%, vi_dien_tu: 1.5%, chuyen_khoan: 0%
        return match ($method) {
            'vi_ca_nhan'   => 0.01,
            'the_ngan_hang'=> 0.02,
            'vi_dien_tu'   => 0.015,
            'chuyen_khoan' => 0.00,
            default        => 0.02
        };
    }
}
