<?php

namespace App\Http\Controllers;

use App\Mail\FinalReceiptMail;
use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\TransactionLog;
use App\Models\KhachHang;
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
        try {
            Log::info('Getting final payment quote', [
                'ma_bc' => $ma_bc,
                'user_id' => $request->user()?->Ma_TK,
            ]);

            // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
            $user = $request->user();
            if (!$user) {
                Log::warning('Unauthenticated request for final payment quote', ['ma_bc' => $ma_bc]);
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Kiểm tra quyền truy cập - không cần load relationship khachHang
            $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
            if (!$booking) {
                Log::warning('Booking not found for final payment quote', ['ma_bc' => $ma_bc]);
                return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
            }

            // Kiểm tra nếu user là khách hàng, chỉ được xem booking của mình
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if (!$khachHang) {
                Log::warning('User is not a customer', ['ma_bc' => $ma_bc, 'user_id' => $user->Ma_TK]);
                return response()->json(['message' => 'Bạn không phải khách hàng'], 403);
            }
            
            if ($booking->Ma_KH !== $khachHang->Ma_KH) {
                Log::warning('Customer does not own this booking', [
                    'ma_bc' => $ma_bc,
                    'booking_ma_kh' => $booking->Ma_KH,
                    'customer_ma_kh' => $khachHang->Ma_KH,
                ]);
                return response()->json(['message' => 'Bạn không có quyền xem thông tin này'], 403);
            }

            // Kiểm tra trạng thái booking - chỉ cho phép thanh toán phần còn lại khi đã đặt cọc
            if (!in_array($booking->Trang_Thai, ['Chờ thanh toán'])) {
                Log::warning('Booking status does not allow final payment', [
                    'ma_bc' => $ma_bc,
                    'status' => $booking->Trang_Thai,
                ]);
                return response()->json([
                    'message' => 'Buổi chụp chưa sẵn sàng để thanh toán phần còn lại. Vui lòng đặt cọc trước.',
                    'current_status' => $booking->Trang_Thai,
                ], 400);
            }

            //lấy tổng tiền & tỷ lệ cọc
            $basePrice   = (float) $booking->Tong_Tien;
            $depositRate = (float) ($booking->Ti_Le_Coc ?? 30);
            $depositAmt  = round($basePrice * $depositRate / 100, 2);

            // Kiểm tra xem đã đặt cọc chưa bằng cách kiểm tra bảng thanh_toan
            // Lấy tất cả các giao dịch thành công của buổi chụp
            $payments = \App\Models\ThanhToan::where('Ma_BC', $ma_bc)
                ->where('Trang_Thai', 'Thành công')
                ->get();
            
            $hasDeposit = false;
            foreach ($payments as $payment) {
                $ghiChu = json_decode($payment->Ghi_Chu, true);
                if (isset($ghiChu['type']) && $ghiChu['type'] === 'deposit') {
                    $hasDeposit = true;
                    break;
                }
            }

            if (!$hasDeposit) {
                Log::warning('No deposit found for booking', [
                    'ma_bc' => $ma_bc,
                    'payments_count' => $payments->count(),
                    'booking_status' => $booking->Trang_Thai,
                ]);
                // Nếu trạng thái là "Chờ thanh toán" nhưng chưa có đặt cọc, có thể là lỗi dữ liệu
                // Cho phép tiếp tục nhưng cảnh báo
                if ($booking->Trang_Thai !== 'Chờ thanh toán') {
                    return response()->json([
                        'message' => 'Buổi chụp chưa được đặt cọc. Vui lòng đặt cọc trước khi thanh toán phần còn lại.',
                        'current_status' => $booking->Trang_Thai,
                    ], 400);
                }
                // Nếu trạng thái đã là "Chờ thanh toán" nhưng chưa có đặt cọc trong DB,
                // có thể là do callback VNPay chưa cập nhật hoặc có vấn đề với dữ liệu
                // Cho phép tiếp tục nhưng log lại
                Log::warning('Booking status is "Chờ thanh toán" but no deposit payment found', ['ma_bc' => $ma_bc]);
            }

            // Phần còn lại = Tổng - Tiền cọc
            $remaining = max(0, $basePrice - $depositAmt);

            if ($remaining <= 0) {
                Log::info('No remaining amount to pay', ['ma_bc' => $ma_bc, 'base_price' => $basePrice, 'deposit' => $depositAmt]);
                return response()->json([
                    'message' => 'Buổi chụp đã được thanh toán đầy đủ.',
                ], 400);
            }

            // Phí dịch vụ theo phương thức
            $method  = $request->query('payment_method', 'vnpay');
            $feeRate = app(PaymentService::class)->feeRate($method);
            $service = round($remaining * $feeRate, 2);
            $total   = $remaining + $service;

            Log::info('Final payment quote calculated successfully', [
                'ma_bc' => $ma_bc,
                'base_price' => $basePrice,
                'deposit' => $depositAmt,
                'remaining' => $remaining,
                'service_fee' => $service,
                'total' => $total,
            ]);

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
        } catch (\Throwable $e) {
            Log::error('Lỗi khi lấy quote thanh toán', [
                'ma_bc' => $ma_bc,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lấy thông tin thanh toán',
                'error' => config('app.debug') ? $e->getMessage() : 'Lỗi hệ thống',
            ], 500);
        }
    }

    /**
     * Thực hiện thanh toán phần còn lại
     */
    public function store(string $ma_bc, Request $request, PaymentService $payment)
    {
        try {
            // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

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

            // Kiểm tra quyền truy cập - chỉ khách hàng sở hữu booking mới được thanh toán
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if (!$khachHang) {
                return response()->json(['message' => 'Bạn không phải khách hàng'], 403);
            }
            if ($booking->Ma_KH !== $khachHang->Ma_KH) {
                return response()->json(['message' => 'Bạn không có quyền thanh toán buổi chụp này'], 403);
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
        // Lấy số dư ví từ database
        $walletBalance = (float)($khachHang->So_Du ?? 0);
        
        $charge = $payment->charge('vi_ca_nhan', $totalCharge, $ma_bc, ['type' => 'final'], $walletBalance);
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

            // Trừ tiền từ ví
            $khachHang->So_Du = max(0, $walletBalance - $totalCharge);
            $khachHang->save();

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
                    'wallet_balance_before' => $walletBalance,
                    'wallet_balance_after' => $khachHang->So_Du,
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Lỗi khi thanh toán phần còn lại', [
                'ma_bc' => $ma_bc,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi thanh toán',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
