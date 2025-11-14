<?php

namespace App\Http\Controllers;

use App\Models\ThanhToan;
use App\Models\BuoiChup;
use App\Models\TransactionLog;
use App\Models\NhiepAnhGia;
use App\Models\KhachHang;
use App\Models\WalletTransaction;
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
            return response()->view('payment.vnpay_failure', [
                'ma_bc' => null,
                'message' => 'Checksum không hợp lệ. Giao dịch không được xác thực.',
            ]);
        }

        $responseCode = $data['vnp_ResponseCode'] ?? null;
        $rawRef = $data['vnp_TxnRef'] ?? null;

        if ($responseCode !== '00') {
            Log::warning("Thanh toán VNPay thất bại: {$responseCode}");
            
            // Tách mã buổi chụp từ TxnRef (có thể có -DP hoặc -FN)
            $ma_bc = $rawRef;
            if (str_ends_with($rawRef, '-DP')) {
                $ma_bc = substr($rawRef, 0, -3);
            } elseif (str_ends_with($rawRef, '-FN')) {
                $ma_bc = substr($rawRef, 0, -3);
            }
            
            $errorMessages = [
                '07' => 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                '09' => 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
                '10' => 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
                '11' => 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
                '12' => 'Thẻ/Tài khoản bị khóa.',
                '13' => 'Nhập sai mật khẩu xác thực giao dịch (OTP).',
                '51' => 'Tài khoản không đủ số dư để thực hiện giao dịch.',
                '65' => 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
                '75' => 'Ngân hàng thanh toán đang bảo trì.',
                '79' => 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
            ];
            
            $message = $errorMessages[$responseCode] ?? 'Thanh toán thất bại hoặc bị hủy.';
            
            return response()->view('payment.vnpay_failure', [
                'ma_bc' => $ma_bc,
                'message' => $message,
            ]);
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
                return response()->view('payment.vnpay_failure', [
                    'ma_bc' => $ma_bc,
                    'message' => "Không tìm thấy buổi chụp $ma_bc",
                ]);
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

            // Tạo mã thanh toán (tối đa 20 ký tự: TT + YmdHis + 2 số random)
            $maTT = 'TT' . now()->format('YmdHis') . rand(10, 99);

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

            // Lưu giao dịch VNPay vào lịch sử ví của khách hàng
            if ($booking->Ma_KH) {
                $khachHang = KhachHang::where('Ma_KH', $booking->Ma_KH)->first();
                if ($khachHang) {
                    $soDuHienTai = (float) ($khachHang->So_Du ?? 0);
                    // Lưu giao dịch thanh toán VNPay (không trừ từ ví, nhưng vẫn lưu lịch sử)
                    WalletTransaction::createTransaction(
                        'khach_hang',
                        $khachHang->Ma_KH,
                        'thanh_toan',
                        $totalCharge,
                        $soDuHienTai, // Số dư không đổi vì thanh toán qua VNPay
                        $soDuHienTai, // Số dư không đổi
                        $ma_bc,
                        $maTT,
                        ($type === 'deposit' ? 'Đặt cọc' : 'Thanh toán phần còn lại') . " buổi chụp {$ma_bc} qua VNPay: " . number_format($totalCharge, 0, ',', '.') . ' đ',
                        null,
                        null,
                        null,
                        $data['vnp_TransactionNo'] ?? null
                    );
                }
            }

            // Tự động cộng tiền cho nhiếp ảnh gia (trừ 20% chiết khấu)
            if ($booking->Ma_NAG) {
                $nag = NhiepAnhGia::where('Ma_NAG', $booking->Ma_NAG)->first();
                if ($nag) {
                    // NAG nhận 80% số tiền (trừ 20% chiết khấu)
                    $nagAmount = round($payAmount * 0.8, 2);
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
                        "Nhận tiền từ buổi chụp {$ma_bc} ({$logAction}): " . number_format($nagAmount, 0, ',', '.') . ' đ (đã trừ 20% chiết khấu)',
                        null,
                        null,
                        null,
                        $data['vnp_TransactionNo'] ?? null
                    );
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi lưu DB sau callback VNPay', ['error' => $e->getMessage()]);
            
            // Redirect về frontend với thông báo lỗi
            return response()->view('payment.vnpay_failure', [
                'ma_bc' => $ma_bc ?? null,
                'message' => 'Lỗi hệ thống khi lưu giao dịch. Vui lòng liên hệ hỗ trợ.',
            ]);
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
