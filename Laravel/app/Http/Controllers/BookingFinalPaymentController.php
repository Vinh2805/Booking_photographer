<?php

namespace App\Http\Controllers;

use App\Mail\FinalReceiptMail;
use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingFinalPaymentController extends Controller
{
    /**
     * Quote: trả về số tiền còn lại + phí dịch vụ + tổng cần thanh toán
     */
    public function quote(string $ma_bc, Request $request)
    {
        $booking = BuoiChup::query()->find($ma_bc);
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        // Số tiền cọc theo tỉ lệ (giả định đã cọc đúng theo Ti_Le_Coc)
        $basePrice   = (float)$booking->Tong_Tien;
        $depositRate = (float)($booking->Ti_Le_Coc ?? 30);
        $depositAmt  = round($basePrice * $depositRate / 100, 2);

        // Số tiền còn lại (không tính phí dịch vụ)
        $remaining   = max(0, $basePrice - $depositAmt);

        // Phí DV phụ thuộc phương thức, nếu FE chưa chọn thì tạm dùng mặc định 'vi_dien_tu'
        $method   = $request->query('payment_method', 'vi_dien_tu');
        $feeRate  = app(PaymentService::class)->feeRate($method);
        $service  = round($remaining * $feeRate, 2);
        $total    = $remaining + $service;

        return response()->json([
            'booking' => [
                'Ma_BC' => $booking->Ma_BC,
                'Trang_Thai' => $booking->Trang_Thai,
                'Tong_Tien' => $basePrice,
                'Ti_Le_Coc(%)' => $depositRate,
            ],
            'costs' => [
                'so_tien_con_lai' => $remaining,
                'phi_dich_vu' => $service,
                'tong_thanh_toan' => $total,
            ],
            'payment_methods' => config('payments.methods', [
                'vi_ca_nhan','the_ngan_hang','vi_dien_tu','chuyen_khoan'
            ]),
            'must_agree_terms' => true,
        ]);
    }

    /**
     * Store: thực hiện thanh toán phần còn lại
     */
    public function store(string $ma_bc, Request $request, PaymentService $payment)
    {
        // 1) Validate
        $validated = $request->validate([
            'payment_method' => 'required|in:vi_ca_nhan,the_ngan_hang,vi_dien_tu,chuyen_khoan',
            'agree_terms'    => 'required|accepted',
            'available'      => 'nullable|numeric|min:0', // demo (khi chưa tích hợp cổng thật)
            'email'          => 'nullable|email',
        ], [
            'agree_terms.accepted' => 'Bạn phải đồng ý Điều khoản thanh toán và Chính sách hoàn tiền.'
        ]);

        // 2) Tìm buổi chụp + kiểm tra trạng thái
        $booking = BuoiChup::query()->find($ma_bc);
        if (!$booking) return response()->json(['message'=>'Không tìm thấy buổi chụp'], 404);

        // Chỉ cho phép thanh toán phần còn lại khi đã đặt cọc xong
        if (!in_array($booking->Trang_Thai, ['Chờ thanh toán'])) {
            return response()->json(['message' => 'Trạng thái buổi chụp không cho phép thanh toán phần còn lại.'], 409);
        }

        // 3) Tính toán
        $basePrice   = (float)$booking->Tong_Tien;
        $depositRate = (float)($booking->Ti_Le_Coc ?? 30);
        $depositAmt  = round($basePrice * $depositRate / 100, 2);

        // Số tiền còn lại cần trả (không gồm phí DV)
        $remaining   = max(0, $basePrice - $depositAmt);

        $feeRate     = $payment->feeRate($validated['payment_method']);
        $serviceFee  = round($remaining * $feeRate, 2);
        $totalCharge = $remaining + $serviceFee;

        // Map phương thức về enum cột Hinh_Thuc (bảng thanh_toan)
        [$enumMethod, $methodLabel] = match ($validated['payment_method']) {
            'chuyen_khoan' => ['Chuyển khoản', 'Chuyển khoản'],
            default        => ['Tiền mặt',    str_replace('_', ' ', $validated['payment_method'])],
        };

        // 4) Gọi cổng thanh toán (mock)
        $charge = $payment->charge($validated['payment_method'], $totalCharge, $validated['available'] ?? null);
        if (!$charge['success']) {
            // Ghi 1 bản ghi thất bại để tra soát
            ThanhToan::create([
                'Ma_TT'     => 'TT' . now()->format('YmdHis') . random_int(100,999),
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => $enumMethod,
                'Trang_Thai'=> 'Thất bại',
                'Ngay_TT'   => now(),
                'Ghi_Chu'   => json_encode([
                    'type'           => 'final',
                    'remain_amount'  => $remaining,
                    'service_fee'    => $serviceFee,
                    'fee_rate'       => $feeRate,
                    'method_raw'     => $validated['payment_method'],
                    'error_code'     => $charge['error_code'] ?? null,
                    'error_message'  => $charge['message'] ?? null,
                ], JSON_UNESCAPED_UNICODE),
            ]);

            return response()->json([
                'message' => $charge['message'] ?? 'Thanh toán thất bại.',
                'detail'  => 'Vui lòng thử lại hoặc chọn phương thức khác.'
            ], 402);
        }

        // 5) Ghi DB (transaction)
        try {
            DB::beginTransaction();

            $maTT = 'TT' . now()->format('YmdHis') . random_int(100,999);

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
            // 🧾 Ghi log giao dịch
            TransactionLog::record($ma_bc, 'Thanh toan', "Thanh toán {$remainingAmount} qua {$validated['payment_method']}");


            // Cập nhật trạng thái buổi chụp → Chờ xử lý ảnh
            $booking->Trang_Thai = 'Chờ xử lý ảnh';
            $booking->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi ghi giao dịch final', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Có lỗi khi lưu giao dịch. Vui lòng liên hệ CSKH.'
            ], 500);
        }

        // 6) Gửi email biên nhận
        try {
            $email = $validated['email'] ?? null; // hoặc lấy từ bảng tai_khoan giống API deposit
            if ($email) {
                Mail::to($email)->send(new FinalReceiptMail([
                    'ma_bc'         => $ma_bc,
                    'remain_amount' => $remaining,
                    'service_fee'   => $serviceFee,
                    'total_charge'  => $totalCharge,
                    'method_label'  => ucfirst(str_replace('_',' ', $validated['payment_method'])),
                    'transaction_id'=> $charge['transaction_id'] ?? '',
                    'paid_at'       => $charge['paid_at'] ?? now()->toDateTimeString(),
                ]));
            }
        } catch (\Throwable $e) {
            Log::warning('Gửi email final thất bại', ['error' => $e->getMessage()]);
        }

        // 7) Response cho UI thành công
        return response()->json([
            'status'          => 'success',
            'icon'            => 'success',
            'title'           => 'Thanh toán thành công',
            'booking_code'    => $ma_bc,
            'remain_amount'   => $remaining,
            'service_fee'     => $serviceFee,
            'total_charge'    => $totalCharge,
            'transaction_id'  => $charge['transaction_id'] ?? null,
            'paid_at'         => $charge['paid_at'] ?? now()->toDateTimeString(),
            'next_status'     => 'Chờ xử lý ảnh',
            'redirect_back_to'=> url("/momentia/booking/{$ma_bc}")
        ], 201);
    }
}

