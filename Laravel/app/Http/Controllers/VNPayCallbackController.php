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

class VNPayCallbackController extends Controller
{
    public function handle(Request $request, VNPayService $vnpay)
    {
        $data = $request->all();
        Log::info('VNPay callback received', $data);

        // 1️⃣ Xác thực checksum
        if (!$vnpay->verifyReturn($data)) {
            return response('Checksum không hợp lệ', 400);
        }

        // 2️⃣ Kiểm tra trạng thái giao dịch
        $responseCode = $data['vnp_ResponseCode'] ?? null;
        $ma_bc = $data['vnp_TxnRef'] ?? null;

        if ($responseCode !== '00') {
            Log::warning("Thanh toán VNPay thất bại: {$responseCode}");
            return response('Thanh toán thất bại hoặc bị huỷ.', 400);
        }

        // 3️⃣ Giao dịch hợp lệ → lưu DB
        try {
            DB::beginTransaction();

            $booking = BuoiChup::query()->where('Ma_BC', $ma_bc)->first();
            if (!$booking) {
                return response("Không tìm thấy buổi chụp $ma_bc", 404);
            }

            $basePrice = (float) $booking->Tong_Tien;
            $depositRate = (float) ($booking->Ti_Le_Coc ?? 30);
            $depositAmt = round($basePrice * $depositRate / 100, 2);
            $feeRate = 0.015;
            $serviceFee = round($depositAmt * $feeRate, 2);
            $totalCharge = $depositAmt + $serviceFee;

            $maTT = 'TT' . now()->format('YmdHis') . rand(100, 999);

            ThanhToan::create([
                'Ma_TT' => $maTT,
                'Ma_BC' => $ma_bc,
                'So_Tien' => $totalCharge,
                'Hinh_Thuc' => 'Chuyển khoản',
                'Trang_Thai' => 'Thành công',
                'Ngay_TT' => now(),
                'Ghi_Chu' => json_encode([
                    'type' => 'deposit',
                    'deposit_amount' => $depositAmt,
                    'service_fee' => $serviceFee,
                    'fee_rate' => $feeRate,
                    'method_raw' => 'vnpay',
                    'transaction_id' => $data['vnp_TransactionNo'] ?? '',
                    'bank_code' => $data['vnp_BankCode'] ?? '',
                    'paid_at' => now()->toDateTimeString(),
                ], JSON_UNESCAPED_UNICODE),
            ]);

            // Cập nhật trạng thái buổi chụp
            $booking->Trang_Thai = 'Chờ thanh toán';
            $booking->save();

            // Ghi log giao dịch
            TransactionLog::record($ma_bc, 'Dat coc', 'Thanh toán VNPay thành công.');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi lưu DB sau callback VNPay', ['error' => $e->getMessage()]);
            return response('Lỗi hệ thống khi lưu giao dịch.', 500);
        }

        // 4️⃣ Gửi mail xác nhận
        try {
            $email = 'customer@example.com'; // sau này lấy từ bảng tài khoản
            Mail::to($email)->send(new DepositReceiptMail([
                'ma_bc' => $ma_bc,
                'base_price' => $basePrice,
                'deposit_rate' => $depositRate,
                'deposit_amount' => $depositAmt,
                'service_fee' => $serviceFee,
                'total_charge' => $totalCharge,
                'method_label' => 'VNPay',
                'transaction_id' => $data['vnp_TransactionNo'] ?? '',
                'paid_at' => now()->toDateTimeString(),
            ]));
        } catch (\Throwable $e) {
            Log::warning('Gửi mail sau callback VNPay thất bại', ['error' => $e->getMessage()]);
        }

        // 5️⃣ Trả thông báo cho người dùng
        return response()->view('payment.vnpay_success', [
            'ma_bc' => $ma_bc,
            'amount' => number_format($totalCharge, 0, ',', '.') . 'đ',
            'transaction_id' => $data['vnp_TransactionNo'] ?? '',
        ]);
    }
}
