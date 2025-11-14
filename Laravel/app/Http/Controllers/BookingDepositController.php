<?php

namespace App\Http\Controllers;

use App\Mail\DepositReceiptMail;
use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\TransactionLog;
use App\Models\KhachHang;
use App\Models\NhiepAnhGia;
use App\Models\WalletTransaction;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingDepositController extends Controller
{
    public function store(string $ma_bc, Request $request, PaymentService $payment)
    {
        // 1️⃣ Validate input
        $validated = $request->validate([
            'payment_method' => 'required|in:vi_ca_nhan,vnpay',
            'agree_terms'    => 'required|accepted',
            'available'      => 'nullable|numeric|min:0', // ví cá nhân
            'email'          => 'nullable|email'
        ], [
            'agree_terms.accepted' => 'Bạn phải đồng ý Điều khoản đặt cọc và Chính sách hoàn tiền.'
        ]);

        // 2️⃣ Kiểm tra buổi chụp
        $booking = BuoiChup::query()->where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        if (!in_array($booking->Trang_Thai, ['Chờ xác nhận', 'Chờ đặt cọc'])) {
            return response()->json([
                'message' => 'Trạng thái buổi chụp không cho phép đặt cọc hiện tại.'
            ], 409);
        }

        // 3️⃣ Tính toán số tiền
        $basePrice   = (float)$booking->Tong_Tien;
        $depositRate = (float)($booking->Ti_Le_Coc ?? 30);
        $depositAmt  = round($basePrice * $depositRate / 100, 2);

        $feeRate     = $payment->feeRate($validated['payment_method']);
        $serviceFee  = round($depositAmt * $feeRate, 2);
        $totalCharge = $depositAmt + $serviceFee;

        // Map enum (cho bảng thanh_toan)
        [$enumMethod, $methodLabel] = match ($validated['payment_method']) {
            'vnpay' => ['Chuyển khoản', 'VNPay'],
            default => ['Tiền mặt', 'Ví cá nhân'],
        };

       // 4️⃣ Nếu là VNPay → tạo redirect link
if ($validated['payment_method'] === 'vnpay') {
    $charge = $payment->charge('vnpay', $totalCharge, $ma_bc, ['type' => 'deposit']); // truyền mã buổi chụp vào

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

        // 5️⃣ Nếu là ví cá nhân → xử lý nội bộ và lưu DB
        // Lấy số dư ví từ database
        $user = $request->user();
        $khachHang = $user ? KhachHang::where('Ma_TK', $user->Ma_TK)->first() : null;
        $walletBalance = $khachHang ? (float)($khachHang->So_Du ?? 0) : 0;
        
        $charge = $payment->charge('vi_ca_nhan', $totalCharge, $ma_bc, ['type' => 'deposit'], $walletBalance);

        if (!$charge['success']) {
            Log::warning('Deposit failed', [
                'ma_bc' => $ma_bc,
                'method' => $validated['payment_method'],
                'reason' => $charge['message'] ?? 'unknown'
            ]);

            ThanhToan::create([
                'Ma_TT'     => 'TT' . now()->format('YmdHis') . rand(10,99),
                'Ma_BC'     => $ma_bc,
                'So_Tien'   => $totalCharge,
                'Hinh_Thuc' => $enumMethod,
                'Trang_Thai'=> 'Thất bại',
                'Ghi_Chu'   => json_encode([
                    'type' => 'deposit',
                    'deposit_amount' => $depositAmt,
                    'service_fee' => $serviceFee,
                    'fee_rate' => $feeRate,
                    'method_raw' => $validated['payment_method'],
                    'error_message' => $charge['message'] ?? null,
                ], JSON_UNESCAPED_UNICODE),
            ]);

            return response()->json([
                'message' => $charge['message'] ?? 'Thanh toán thất bại. Vui lòng chọn phương thức khác.'
            ], 402);
        }

        // 6️⃣ Lưu DB khi thanh toán thành công (ví cá nhân)
        try {
            DB::beginTransaction();

            // Tạo mã thanh toán (tối đa 20 ký tự: TT + YmdHis + 2 số random)
            $maTT = 'TT' . now()->format('YmdHis') . rand(10,99);

            // Trừ tiền từ ví
            if ($khachHang) {
                $soDuTruoc = $walletBalance;
                $khachHang->So_Du = max(0, $walletBalance - $totalCharge);
                $khachHang->save();

                // Lưu vào lịch sử giao dịch
                WalletTransaction::createTransaction(
                    'khach_hang',
                    $khachHang->Ma_KH,
                    'thanh_toan',
                    $totalCharge,
                    $soDuTruoc,
                    (float) $khachHang->So_Du,
                    $ma_bc,
                    $maTT,
                    "Thanh toán đặt cọc buổi chụp {$ma_bc}: " . number_format($totalCharge, 0, ',', '.') . ' đ',
                    null,
                    null,
                    null,
                    $charge['transaction_id'] ?? null
                );
            }

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
                    'wallet_balance_before' => $walletBalance,
                    'wallet_balance_after' => $khachHang ? $khachHang->So_Du : null,
                ], JSON_UNESCAPED_UNICODE),
            ]);

            TransactionLog::record(
                $ma_bc,
                'Dat coc',
                "Khách hàng đặt cọc {$depositAmt} (tỷ lệ {$depositRate}%) qua ví cá nhân – Mã giao dịch {$charge['transaction_id']}"
            );

            // Tự động cộng tiền cho nhiếp ảnh gia (trừ 20% chiết khấu)
            if ($booking->Ma_NAG) {
                $nag = NhiepAnhGia::where('Ma_NAG', $booking->Ma_NAG)->first();
                if ($nag) {
                    // NAG nhận 80% số tiền đặt cọc (trừ 20% chiết khấu)
                    $nagAmount = round($depositAmt * 0.8, 2);
                    $soDuTruocNAG = (float) ($nag->So_Du ?? 0);
                    $nag->So_Du = $soDuTruocNAG + $nagAmount;
                    $nag->save();

                    // Lưu vào lịch sử giao dịch
                    WalletTransaction::createTransaction(
                        'nhiep_anh_gia',
                        $nag->Ma_NAG,
                        'nhan_tien',
                        $nagAmount,
                        $soDuTruocNAG,
                        (float) $nag->So_Du,
                        $ma_bc,
                        $maTT,
                        "Nhận tiền đặt cọc từ buổi chụp {$ma_bc}: " . number_format($nagAmount, 0, ',', '.') . ' đ (đã trừ 20% chiết khấu)',
                        null,
                        null,
                        null,
                        $charge['transaction_id'] ?? null
                    );
                }
            }

            $booking->Trang_Thai = 'Chờ thanh toán';
            $booking->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi lưu giao dịch đặt cọc', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi khi lưu giao dịch.'], 500);
        }

        // 7️⃣ Gửi mail
        try {
            if ($validated['email']) {
                Mail::to($validated['email'])->send(new DepositReceiptMail([
                    'ma_bc'          => $ma_bc,
                    'base_price'     => $basePrice,
                    'deposit_rate'   => $depositRate,
                    'deposit_amount' => $depositAmt,
                    'service_fee'    => $serviceFee,
                    'total_charge'   => $totalCharge,
                    'method_label'   => $methodLabel,
                    'transaction_id' => $charge['transaction_id'],
                    'paid_at'        => $charge['paid_at'],
                ]));
            }
        } catch (\Throwable $e) {
            Log::error('Gửi email biên nhận thất bại', ['error' => $e->getMessage()]);
        }

        // 8️⃣ Trả kết quả cho FE
        return response()->json([
            'status'         => 'success',
            'message'        => 'Đặt cọc thành công qua ví cá nhân',
            'booking_code'   => $ma_bc,
            'deposit_amount' => $depositAmt,
            'service_fee'    => $serviceFee,
            'total_charge'   => $totalCharge,
            'transaction_id' => $charge['transaction_id'],
            'paid_at'        => $charge['paid_at'],
        ], 201);
    }
}
