<?php

namespace App\Http\Controllers;

use App\Models\KhachHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
    /**
     * Lấy số dư ví của khách hàng
     */
    public function getBalance(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if (!$khachHang) {
                return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
            }

            return response()->json([
                'balance' => (float) ($khachHang->So_Du ?? 0),
                'formatted_balance' => number_format($khachHang->So_Du ?? 0, 0, ',', '.') . ' đ',
            ]);
        } catch (\Throwable $e) {
            Log::error('Lỗi lấy số dư ví', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra'], 500);
        }
    }

    /**
     * Tạo yêu cầu nạp tiền - trả về QR code URL
     */
    public function createDepositRequest(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:10000|max:100000000', // Tối thiểu 10k, tối đa 100 triệu
            ]);

            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if (!$khachHang) {
                return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
            }

            $amount = (float) $validated['amount'];
            
            // Tạo QR code URL
            $qrUrl = "https://img.vietqr.io/image/VIB-335757499-compact2.png?amount={$amount}&addInfo=nap%20tien%20vi%20ca%20nhan&accountName=Admin";

            // Tạo mã giao dịch tạm thời để theo dõi
            $transactionId = 'DEP-' . now()->format('YmdHis') . rand(100, 999);

            return response()->json([
                'success' => true,
                'qr_url' => $qrUrl,
                'amount' => $amount,
                'formatted_amount' => number_format($amount, 0, ',', '.') . ' đ',
                'transaction_id' => $transactionId,
                'message' => 'Vui lòng quét mã QR và chuyển khoản. Sau khi chuyển khoản, vui lòng liên hệ admin để được xác nhận.',
                'bank_info' => [
                    'bank' => 'VIB',
                    'account_number' => '335757499',
                    'account_name' => 'Admin',
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Lỗi tạo yêu cầu nạp tiền', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra'], 500);
        }
    }

    /**
     * Xác nhận nạp tiền (sẽ được admin gọi sau khi xác nhận chuyển khoản)
     * Hoặc có thể tự động nếu có webhook từ ngân hàng
     */
    public function confirmDeposit(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:10000',
                'transaction_id' => 'nullable|string',
            ]);

            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if (!$khachHang) {
                return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
            }

            $amount = (float) $validated['amount'];

            DB::beginTransaction();

            // Cập nhật số dư
            $khachHang->So_Du = ($khachHang->So_Du ?? 0) + $amount;
            $khachHang->save();

            // Log giao dịch vào file log thay vì TransactionLog (vì TransactionLog yêu cầu Ma_BC hợp lệ)
            Log::info('Nạp tiền vào ví', [
                'ma_kh' => $khachHang->Ma_KH,
                'amount' => $amount,
                'new_balance' => $khachHang->So_Du,
                'transaction_id' => $validated['transaction_id'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nạp tiền thành công',
                'new_balance' => (float) $khachHang->So_Du,
                'formatted_balance' => number_format($khachHang->So_Du, 0, ',', '.') . ' đ',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi xác nhận nạp tiền', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra'], 500);
        }
    }

    /**
     * Tạo yêu cầu rút tiền
     */
    public function createWithdrawalRequest(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:50000|max:100000000', // Tối thiểu 50k
                'bank_account' => 'required|string|min:8|max:20',
                'bank_name' => 'nullable|string|max:255',
                'account_holder_name' => 'required|string|max:255',
            ]);

            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if (!$khachHang) {
                return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
            }

            $amount = (float) $validated['amount'];
            $currentBalance = (float) ($khachHang->So_Du ?? 0);

            // Kiểm tra số dư
            if ($currentBalance < $amount) {
                return response()->json([
                    'message' => 'Số dư không đủ để rút tiền',
                    'current_balance' => $currentBalance,
                    'requested_amount' => $amount,
                ], 400);
            }

            // Tạo mã yêu cầu rút tiền
            $withdrawalId = 'WTH-' . now()->format('YmdHis') . rand(100, 999);

            // Trừ tiền ngay lập tức khi khách hàng xác nhận
            DB::beginTransaction();

            // Trừ tiền từ ví
            $khachHang->So_Du = $currentBalance - $amount;
            $khachHang->save();

            // Log giao dịch vào file log thay vì TransactionLog
            Log::info('Yêu cầu rút tiền từ ví', [
                'ma_kh' => $khachHang->Ma_KH,
                'amount' => $amount,
                'new_balance' => $khachHang->So_Du,
                'bank_account' => $validated['bank_account'],
                'bank_name' => $validated['bank_name'] ?? null,
                'account_holder_name' => $validated['account_holder_name'],
                'withdrawal_id' => $withdrawalId,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rút tiền thành công! Tiền đã được trừ khỏi ví của bạn.',
                'withdrawal_id' => $withdrawalId,
                'amount' => $amount,
                'formatted_amount' => number_format($amount, 0, ',', '.') . ' đ',
                'new_balance' => (float) $khachHang->So_Du,
                'formatted_balance' => number_format($khachHang->So_Du, 0, ',', '.') . ' đ',
                'bank_info' => [
                    'account' => $validated['bank_account'],
                    'bank_name' => $validated['bank_name'] ?? 'Không xác định',
                    'account_holder' => $validated['account_holder_name'],
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi tạo yêu cầu rút tiền', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra'], 500);
        }
    }
}
