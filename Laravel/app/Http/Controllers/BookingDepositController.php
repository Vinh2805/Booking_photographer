<?php

namespace App\Http\Controllers;

use App\Mail\DepositReceiptMail;
use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingDepositController extends Controller
{
    public function store(string $ma_bc, Request $request, PaymentService $payment)
    {
        // 1) Validate input
        $validated = $request->validate([
            'payment_method' => 'required|in:vi_ca_nhan,the_ngan_hang,vi_dien_tu,chuyen_khoan',
            'agree_terms'    => 'required|accepted',  // bắt buộc tick điều khoản
            'available'      => 'nullable|numeric|min:0', // số dư mô phỏng để demo
            'email'          => 'nullable|email' // nếu muốn gửi tới email tùy ý; còn không có thì dùng email trong DB
        ], [
            'agree_terms.accepted' => 'Bạn phải đồng ý Điều khoản đặt cọc và Chính sách hoàn tiền.'
        ]);

        // 2) Tìm buổi chụp
        $booking = BuoiChup::query()->where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        // Trạng thái hợp lệ để cho phép đặt cọc
        if (!in_array($booking->Trang_Thai, ['Chờ xác nhận', 'Chờ đặt cọc'])) {
            return response()->json([
                'message' => 'Trạng thái buổi chụp không cho phép đặt cọc hiện tại.'
            ], 409);
        }

        // 3) Tính tiền
        $basePrice    = (float)$booking->Tong_Tien;
        $depositRate  = (float)($booking->Ti_Le_Coc ?? 30); // nếu null thì mặc định 30%
        $depositAmt   = round($basePrice * $depositRate / 100, 2);

        $feeRate      = $payment->feeRate($validated['payment_method']);
        $serviceFee   = round($depositAmt * $feeRate, 2);
        $totalCharge  = $depositAmt + $serviceFee;

        // Map phương thức cho cột enum hiện có của bảng thanh_toan (Tiền mặt/Chuyển khoản)
        [$enumMethod, $methodLabel] = match ($validated['payment_method']) {
            'chuyen_khoan' => ['Chuyển khoản', 'Chuyển khoản'],
            default        => ['Tiền mặt',    str_replace('_', ' ', $validated['payment_method'])]
        };

        // 4) Gọi cổng thanh toán (mô phỏng)
        $charge = $payment->charge($validated['payment_method'], $totalCharge, $validated['available'] ?? null);
        if (!$charge['success']) {
            // Ghi log giao dịch thất bại
            Log::warning('Deposit failed', [
                'ma_bc' => $ma_bc,
                'method' => $validated['payment_method'],
                'reason' => $charge['message'] ?? 'unknown'
            ]);

            // Lưu dòng thất bại vào bảng thanh_toan (đối soát)
            ThanhToan::create([
                'Ma_TT'     => 'TT' . now()->format('YmdHis') . rand(100,999),
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => $enumMethod,
                'Trang_Thai'=> 'Thất bại',
                'Ghi_Chu'   => json_encode([
                    'type'           => 'deposit',
                    'deposit_amount' => $depositAmt,
                    'service_fee'    => $serviceFee,
                    'fee_rate'       => $feeRate,
                    'method_raw'     => $validated['payment_method'],
                    'error_code'     => $charge['error_code'] ?? null,
                    'error_message'  => $charge['message'] ?? null,
                ], JSON_UNESCAPED_UNICODE),
            ]);

            return response()->json([
                'message' => $charge['message'] ?? 'Thanh toán thất bại. Vui lòng chọn phương thức khác.',
                'suggestion' => 'Vui lòng chọn phương thức khác hoặc nạp thêm tiền.'
            ], 402);
        }

        // 5) Giao dịch thành công: lưu DB trong transaction
        try {
            DB::beginTransaction();

            $maTT = 'TT' . now()->format('YmdHis') . rand(100,999);

            ThanhToan::create([
                'Ma_TT'     => $maTT,
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => $enumMethod,
                'Trang_Thai'=> 'Thành công',
                'Ghi_Chu'   => json_encode([
                    'type'            => 'deposit',
                    'deposit_amount'  => $depositAmt,
                    'service_fee'     => $serviceFee,
                    'fee_rate'        => $feeRate,
                    'method_raw'      => $validated['payment_method'],
                    'transaction_id'  => $charge['transaction_id'],
                ], JSON_UNESCAPED_UNICODE),
            ]);
            // 🧾 Ghi log giao dịch
            TransactionLog::record(
                $ma_bc,
                'Dat coc',
                "Khách hàng đặt cọc {$depositAmt} (tỷ lệ {$depositRate}%) qua {$validated['payment_method']} – Mã giao dịch {$charge['transaction_id']}"
            );

            // Cập nhật trạng thái buổi chụp: sau khi cọc -> chuyển sang "Chờ thanh toán" (thanh toán phần còn lại)
            $booking->Trang_Thai = 'Chờ thanh toán';
            $booking->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi lưu giao dịch đặt cọc', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi khi lưu giao dịch.'], 500);
        }

        // 6) Gửi email biên nhận
        try {
            // Lấy email khách hàng: bạn có thể join sang bảng tai_khoan nếu muốn chính xác.
            $email = $validated['email'] ?? null; // dev tip: truyền từ FE để demo

            if ($email) {
                Mail::to($email)->send(new DepositReceiptMail([
                    'ma_bc'          => $ma_bc,
                    'base_price'     => $basePrice,
                    'deposit_rate'   => $depositRate,
                    'deposit_amount' => $depositAmt,
                    'service_fee'    => $serviceFee,
                    'total_charge'   => $totalCharge,
                    'method_label'   => ucfirst(str_replace('_', ' ', $validated['payment_method'])),
                    'transaction_id' => $charge['transaction_id'],
                    'paid_at'        => $charge['paid_at'],
                ]));
            }
        } catch (\Throwable $e) {
            Log::error('Gửi email biên nhận thất bại', ['error' => $e->getMessage()]);
            // Không rollback giao dịch vì thanh toán đã thành công; chỉ log để CSKH xử lý.
        }

        // 7) Trả kết quả cho FE
        return response()->json([
            'status'          => 'success',
            'icon'            => 'success', // FE hiển thị tick xanh
            'message'         => 'Đặt cọc thành công',
            'booking_code'    => $ma_bc,
            'base_price'      => $basePrice,
            'deposit_rate'    => $depositRate,
            'deposit_amount'  => $depositAmt,
            'service_fee'     => $serviceFee,
            'total_charge'    => $totalCharge,
            'transaction_id'  => $charge['transaction_id'],
            'paid_at'         => $charge['paid_at'],
            'next_status'     => 'Chờ thanh toán',
        ], 201);
    }
}
