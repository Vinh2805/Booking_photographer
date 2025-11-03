<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class VNPayService
{
    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPaymentUrl(string $orderId, float $amount, string $returnUrl = null): string
    {
        $vnp_Url        = Config::get('vnpay.vnp_Url');
        $vnp_TmnCode    = Config::get('vnpay.vnp_TmnCode');
        $vnp_HashSecret = Config::get('vnpay.vnp_HashSecret');
        $vnp_Returnurl  = $returnUrl ?? Config::get('vnpay.vnp_ReturnUrl');

        $inputData = [
            "vnp_Version"     => "2.1.0",
            "vnp_TmnCode"     => $vnp_TmnCode,
            "vnp_Amount"      => (int)($amount * 100),
            "vnp_Command"     => "pay",
            "vnp_CreateDate"  => now()->format('YmdHis'),
            "vnp_CurrCode"    => "VND",
            "vnp_IpAddr"      => request()->ip(),
            "vnp_Locale"      => "vn",
            "vnp_OrderInfo"   => "Thanh toan GD:" . $orderId,
            "vnp_OrderType"   => "other",
            "vnp_ReturnUrl"   => $vnp_Returnurl,
            "vnp_TxnRef"      => $orderId,
//             "vnp_ExtraData" => urlencode(
//     base64_encode(
//         json_encode($meta, JSON_UNESCAPED_SLASHES)
//     )
// ),
            // "vnp_ExpireDate"  => now()->addMinutes(60)->format('YmdHis'),
        ];

        ksort($inputData);

        $query = "";
        $hashdata = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        if ($vnp_HashSecret) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $query .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return $vnp_Url . "?" . $query;
    }

    /**
     * Xác minh chữ ký VNPay callback (Return/IPN)
     */
    public function verifyReturn(array $params): bool
    {
        $vnp_HashSecret = Config::get('vnpay.vnp_HashSecret');
        $inputData = [];

        foreach ($params as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']); // bỏ thêm đề phòng

        ksort($inputData);

        $hashData = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // Debug log để đối chiếu nếu cần
        Log::info('VNPay verify signature', [
            'hashData'  => $hashData,
            'computed'  => $secureHash,
            'received'  => $vnp_SecureHash,
        ]);

        return $secureHash === $vnp_SecureHash;
    }
}
