<?php

namespace App\Http\Controllers;

use App\Mail\FinalReceiptMail;
use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\TransactionLog;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingFinalPaymentController extends Controller
{
    /**
     * Trả về báo giá phần còn lại giống logic đặt cọc
     */
    public function quote(string $ma_bc, Request $request)
    {
        $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        //lấy tổng tiền & tỷ lệ cọc
        $basePrice   = (float) $booking->Tong_Tien;
        $depositRate = (float) ($booking->Ti_Le_Coc ?? 30);
        $depositAmt  = round($basePrice * $depositRate / 100, 2);

        // Phần còn lại = Tổng - Tiền cọc
        $remaining = max(0, $basePrice - $depositAmt);

        // Phí dịch vụ theo phương thức
        $method  = $request->query('payment_method', 'vnpay');
        $feeRate = app(PaymentService::class)->feeRate($method);
        $service = round($remaining * $feeRate, 2);
        $total   = $remaining + $service;

        return response()->json([
            'booking' => [
                'Ma_BC'        => $booking->Ma_BC,
                'Trang_Thai'   => $booking->Trang_Thai,
                'Tong_Tien'    => $basePrice,
                'Ti_Le_Coc(%)' => $depositRate,
            ],
            'costs' => [
                'so_tien_con_lai' => $remaining,
                'phi_dich_vu'     => $service,
                'tong_thanh_toan' => $total,
            ],
            'payment_methods' => ['vi_ca_nhan', 'vnpay'],
            'must_agree_terms' => true,
        ]);
    }

    /**
     * Thực hiện thanh toán phần còn lại
     */
    public function store(string $ma_bc, Request $request, PaymentService $payment)
    {
        // 1️⃣ Validate input
        $validated = $request->validate([
            'payment_method' => 'required|in:vi_ca_nhan,vnpay',
            'agree_terms'    => 'required|accepted',
            'available'      => 'nullable|numeric|min:0',
            'email'          => 'nullable|email'
        ], [
            'agree_terms.accepted' => 'Bạn phải đồng ý Điều khoản thanh toán và Chính sách hoàn tiền.'
        ]);

        // 2️⃣ Tìm buổi chụp
        $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        if (!in_array($booking->Trang_Thai, ['Chờ thanh toán'])) {
            return response()->json(['message' => 'Trạng thái buổi chụp không cho phép thanh toán phần còn lại.'], 409);
        }

        
        $basePrice   = (float) $booking->Tong_Tien;
        $depositRate = (float) ($booking->Ti_Le_Coc ?? 30);
        $depositAmt  = round($basePrice * $depositRate / 100, 2);

        $remaining   = max(0, $basePrice - $depositAmt); // <-- phần còn lại cần trả

        $feeRate     = $payment->feeRate($validated['payment_method']);
        $serviceFee  = round($remaining * $feeRate, 2);
        $totalCharge = $remaining + $serviceFee;

        [$enumMethod, $methodLabel] = match ($validated['payment_method']) {
            'vnpay' => ['Chuyển khoản', 'VNPay'],
            default => ['Tiền mặt', 'Ví cá nhân'],
        };

        // 4️⃣ Nếu là VNPay → tạo redirect link 
        if ($validated['payment_method'] === 'vnpay') {
    $charge = $payment->charge('vnpay', $totalCharge, $ma_bc, ['type' => 'final']); // truyền mã buổi chụp vào

    return response()->json([
        'status'         => 'redirect',
        'message'        => 'Chuyển hướng đến VNPay để thanh toán',
        'redirect_url'   => $charge['redirect_url'],
        'booking_code'   => $ma_bc,
        'deposit_amount' => $depositAmt,
        'service_fee'    => $serviceFee,
        'total_charge'   => $totalCharge
    ], 200);
}

        // 5️⃣ Nếu là ví cá nhân → xử lý nội bộ
        $charge = $payment->charge('vi_ca_nhan', $totalCharge, $validated['available'] ?? null);
        if (!$charge['success']) {
            ThanhToan::create([
                'Ma_TT'     => 'TT' . now()->format('YmdHis') . rand(100,999),
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => $enumMethod,
                'Trang_Thai'=> 'Thất bại',
                'Ngay_TT'   => now(),
                'Ghi_Chu'   => json_encode([
                    'type'          => 'final',
                    'remain_amount' => $remaining,
                    'service_fee'   => $serviceFee,
                    'fee_rate'      => $feeRate,
                    'method_raw'    => $validated['payment_method'],
                    'error_message' => $charge['message'] ?? null,
                ], JSON_UNESCAPED_UNICODE),
            ]);

            return response()->json(['message' => 'Thanh toán thất bại.'], 402);
        }

        // 6️⃣ Ghi DB nếu thành công
        try {
            DB::beginTransaction();

            $maTT = 'TT' . now()->format('YmdHisv') . rand(100,999);

            ThanhToan::create([
                'Ma_TT'     => $maTT,
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => $enumMethod,
                'Trang_Thai'=> 'Thành công',
                'Ngay_TT'   => now(),
                'Ghi_Chu'   => json_encode([
                    'type'           => 'final',
                    'remain_amount'  => $remaining,
                    'service_fee'    => $serviceFee,
                    'fee_rate'       => $feeRate,
                    'method_raw'     => $validated['payment_method'],
                    'transaction_id' => $charge['transaction_id'] ?? null,
                    'paid_at'        => $charge['paid_at'] ?? now()->toDateTimeString(),
                ], JSON_UNESCAPED_UNICODE),
            ]);

            TransactionLog::record($ma_bc, 'Thanh toan', "Thanh toán phần còn lại {$remaining} qua ví cá nhân – Mã giao dịch {$charge['transaction_id']}");

            // Cập nhật trạng thái buổi chụp
            $booking->Trang_Thai = 'Chờ xử lý ảnh';
            $booking->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi ghi giao dịch final', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi khi lưu giao dịch.'], 500);
        }

        // 7️⃣ Gửi email biên nhận (nếu có)
        try {
            if (!empty($validated['email'])) {
                Mail::to($validated['email'])->send(new FinalReceiptMail([
                    'ma_bc'         => $ma_bc,
                    'remain_amount' => $remaining,
                    'service_fee'   => $serviceFee,
                    'total_charge'  => $totalCharge,
                    'method_label'  => $methodLabel,
                    'transaction_id'=> $charge['transaction_id'],
                    'paid_at'       => $charge['paid_at'],
                ]));
            }
        } catch (\Throwable $e) {
            Log::warning('Gửi email final thất bại', ['error' => $e->getMessage()]);
        }

        // 8️⃣ Phản hồi
        return response()->json([
            'status'          => 'success',
            'title'           => 'Thanh toán thành công',
            'booking_code'    => $ma_bc,
            'remain_amount'   => $remaining,
            'service_fee'     => $serviceFee,
            'total_charge'    => $totalCharge,
            'transaction_id'  => $charge['transaction_id'],
            'paid_at'         => $charge['paid_at'],
            'next_status'     => 'Chờ xử lý ảnh',
            'redirect_back_to'=> url("/momentia/booking/{$ma_bc}")
        ], 201);
    }
}
