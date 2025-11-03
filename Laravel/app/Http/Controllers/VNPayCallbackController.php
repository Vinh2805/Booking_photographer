<?php

namespace App\Http\Controllers;

use App\Models\ThanhToan;
use App\Models\BuoiChup;
use App\Models\TransactionLog;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositReceiptMail;
use App\Mail\FinalReceiptMail;

class VNPayCallbackController extends Controller
{
    public function handle(Request $request, VNPayService $vnpay)
    {
        $data = $request->all();
        Log::info('VNPay callback received', $data);

        // 1. xác thực chữ ký
        if (!$vnpay->verifyReturn($data)) {
            Log::error('VNPay checksum mismatch', ['data' => $data]);
            return response('Checksum không hợp lệ', 400);
        }

        $responseCode = $data['vnp_ResponseCode'] ?? null;
        $rawRef = $data['vnp_TxnRef'] ?? null;

        if ($responseCode !== '00') {
            Log::warning("Thanh toán VNPay thất bại: {$responseCode}");
            return response('Thanh toán thất bại hoặc bị huỷ.', 400);
        }

        // 2. tách mã buổi chụp và loại giao dịch
        // ví dụ: BC0001-DP hoặc BC0001-FN
        $type = 'deposit';
        $ma_bc = $rawRef;

        if (str_ends_with($rawRef, '-DP')) {
            $type = 'deposit';
            $ma_bc = substr($rawRef, 0, -3);
        } elseif (str_ends_with($rawRef, '-FN')) {
            $type = 'final';
            $ma_bc = substr($rawRef, 0, -3);
        }

        try {
            DB::beginTransaction();

            $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
            if (!$booking) {
                return response("Không tìm thấy buổi chụp $ma_bc", 404);
            }

            $basePrice   = (float) $booking->Tong_Tien;
            $depositRate = (float) ($booking->Ti_Le_Coc ?? 30);
            $depositAmt  = round($basePrice * $depositRate / 100, 2);
            $feeRate     = 0.015;

            if ($type === 'deposit') {
                $payAmount  = $depositAmt;
                $booking->Trang_Thai = 'Chờ thanh toán';
                $mailClass  = DepositReceiptMail::class;
                $logAction  = 'Dat coc';
                $logDesc    = "Đặt cọc {$depositAmt} qua VNPay thành công.";
            } else {
                $remaining  = max(0, $basePrice - $depositAmt);
                $payAmount  = $remaining;
                $booking->Trang_Thai = 'Chờ xử lý ảnh';
                $mailClass  = FinalReceiptMail::class;
                $logAction  = 'Thanh toan';
                $logDesc    = "Thanh toán phần còn lại {$remaining} qua VNPay thành công.";
            }

            $serviceFee  = round($payAmount * $feeRate, 2);
            $totalCharge = $payAmount + $serviceFee;

            $maTT = 'TT' . now()->format('YmdHis') . rand(100, 999);

            ThanhToan::create([
                'Ma_TT'     => $maTT,
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => 'Chuyển khoản',
                'Trang_Thai'=> 'Thành công',
                'Ngay_TT'   => now(),
                'Ghi_Chu'   => json_encode([
                    'type'           => $type,
                    'amount'         => $payAmount,
                    'service_fee'    => $serviceFee,
                    'fee_rate'       => $feeRate,
                    'method_raw'     => 'vnpay',
                    'transaction_id' => $data['vnp_TransactionNo'] ?? '',
                    'bank_code'      => $data['vnp_BankCode'] ?? '',
                    'paid_at'        => now()->toDateTimeString(),
                ], JSON_UNESCAPED_UNICODE),
            ]);

            $booking->save();

            TransactionLog::record($ma_bc, $logAction, $logDesc);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi lưu DB sau callback VNPay', ['error' => $e->getMessage()]);
            return response('Lỗi hệ thống khi lưu giao dịch.', 500);
        }

        // gửi mail (tạm cứng)
        try {
            $email = 'customer@example.com';
            if ($type === 'deposit') {
                Mail::to($email)->send(new $mailClass([
                    'ma_bc'          => $ma_bc,
                    'base_price'     => $basePrice,
                    'deposit_rate'   => $depositRate,
                    'deposit_amount' => $depositAmt,
                    'service_fee'    => $serviceFee,
                    'total_charge'   => $totalCharge,
                    'method_label'   => 'VNPay',
                    'transaction_id' => $data['vnp_TransactionNo'] ?? '',
                    'paid_at'        => now()->toDateTimeString(),
                ]));
            } else {
                Mail::to($email)->send(new $mailClass([
                    'ma_bc'          => $ma_bc,
                    'remain_amount'  => $payAmount,
                    'service_fee'    => $serviceFee,
                    'total_charge'   => $totalCharge,
                    'method_label'   => 'VNPay',
                    'transaction_id' => $data['vnp_TransactionNo'] ?? '',
                    'paid_at'        => now()->toDateTimeString(),
                ]));
            }
        } catch (\Throwable $e) {
            Log::warning('Gửi mail sau callback VNPay thất bại', ['error' => $e->getMessage()]);
        }

        return response()->view('payment.vnpay_success', [
            'ma_bc'          => $ma_bc,
            'amount'         => number_format($totalCharge, 0, ',', '.') . 'đ',
            'transaction_id' => $data['vnp_TransactionNo'] ?? '',
            'type'           => $type,
        ]);
    }
}
