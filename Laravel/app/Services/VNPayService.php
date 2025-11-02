<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;

class VNPayService
{
    public function createPaymentUrl(string $orderId, float $amount, string $returnUrl = null): string
    {
        $vnp_Url = Config::get('vnpay.vnp_Url');
        $vnp_TmnCode = Config::get('vnpay.vnp_TmnCode');
        $vnp_HashSecret = Config::get('vnpay.vnp_HashSecret');
        $vnp_Returnurl = $returnUrl ?? Config::get('vnpay.vnp_ReturnUrl');

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $amount * 100,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => now()->format('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => request()->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => "Thanh toán đơn hàng $orderId",
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $orderId,
        ];

        ksort($inputData);
        $hashdata = urldecode(http_build_query($inputData));
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

        return $vnp_Url . '?' . http_build_query($inputData) . '&vnp_SecureHash=' . $vnpSecureHash;
    }

    public function verifyReturn(array $params): bool
    {
        $vnp_HashSecret = Config::get('vnpay.vnp_HashSecret');
        $inputData = [];

        foreach ($params as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = urldecode(http_build_query($inputData));
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        return $secureHash === $params['vnp_SecureHash'];
    }
}
