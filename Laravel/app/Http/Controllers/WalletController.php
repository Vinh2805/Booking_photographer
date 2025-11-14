<?php

namespace App\Http\Controllers;

use App\Models\KhachHang;
use App\Models\NhiepAnhGia;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
    /**
     * Lấy số dư ví (hỗ trợ cả khách hàng và nhiếp ảnh gia)
     */
    public function getBalance(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Kiểm tra là khách hàng hay nhiếp ảnh gia
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if ($khachHang) {
                return response()->json([
                    'user_type' => 'khach_hang',
                    'balance' => (float) ($khachHang->So_Du ?? 0),
                    'formatted_balance' => number_format($khachHang->So_Du ?? 0, 0, ',', '.') . ' đ',
                ]);
            }

            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
            if ($nag) {
                return response()->json([
                    'user_type' => 'nhiep_anh_gia',
                    'balance' => (float) ($nag->So_Du ?? 0),
                    'formatted_balance' => number_format($nag->So_Du ?? 0, 0, ',', '.') . ' đ',
                ]);
            }

            return response()->json(['message' => 'Không tìm thấy thông tin người dùng'], 404);
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
            $soDuTruoc = (float) ($khachHang->So_Du ?? 0);
            $khachHang->So_Du = $soDuTruoc + $amount;
            $khachHang->save();

            // Lưu vào lịch sử giao dịch
            WalletTransaction::createTransaction(
                'khach_hang',
                $khachHang->Ma_KH,
                'nap_tien',
                $amount,
                $soDuTruoc,
                (float) $khachHang->So_Du,
                null,
                null,
                "Nạp tiền vào ví: " . number_format($amount, 0, ',', '.') . ' đ',
                null,
                null,
                null,
                $validated['transaction_id'] ?? null
            );

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
     * Tạo yêu cầu rút tiền (hỗ trợ cả khách hàng và nhiếp ảnh gia)
     */
    public function createWithdrawalRequest(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:50000|max:100000000', // Tối thiểu 50k
                'bank_account' => 'required|string|min:8|max:50',
                'bank_name' => 'nullable|string|max:255',
                'account_holder_name' => 'required|string|max:255',
            ]);

            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $amount = (float) $validated['amount'];
            $withdrawalId = 'WTH-' . now()->format('YmdHis') . rand(100, 999);

            DB::beginTransaction();

            // Kiểm tra là khách hàng hay nhiếp ảnh gia
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if ($khachHang) {
                $currentBalance = (float) ($khachHang->So_Du ?? 0);
                
                if ($currentBalance < $amount) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Số dư không đủ để rút tiền',
                        'current_balance' => $currentBalance,
                        'requested_amount' => $amount,
                    ], 400);
                }

                $khachHang->So_Du = $currentBalance - $amount;
                $khachHang->save();

                // Lưu vào lịch sử giao dịch
                WalletTransaction::createTransaction(
                    'khach_hang',
                    $khachHang->Ma_KH,
                    'rut_tien',
                    $amount,
                    $currentBalance,
                    (float) $khachHang->So_Du,
                    null,
                    null,
                    "Rút tiền từ ví: " . number_format($amount, 0, ',', '.') . ' đ',
                    $validated['bank_account'],
                    $validated['bank_name'],
                    $validated['account_holder_name'],
                    $withdrawalId
                );

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
            }

            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
            if ($nag) {
                $currentBalance = (float) ($nag->So_Du ?? 0);
                
                if ($currentBalance < $amount) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Số dư không đủ để rút tiền',
                        'current_balance' => $currentBalance,
                        'requested_amount' => $amount,
                    ], 400);
                }

                $nag->So_Du = $currentBalance - $amount;
                $nag->save();

                // Lưu vào lịch sử giao dịch
                WalletTransaction::createTransaction(
                    'nhiep_anh_gia',
                    $nag->Ma_NAG,
                    'rut_tien',
                    $amount,
                    $currentBalance,
                    (float) $nag->So_Du,
                    null,
                    null,
                    "Rút tiền từ ví: " . number_format($amount, 0, ',', '.') . ' đ',
                    $validated['bank_account'],
                    $validated['bank_name'],
                    $validated['account_holder_name'],
                    $withdrawalId
                );

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Rút tiền thành công! Tiền đã được trừ khỏi ví của bạn.',
                    'withdrawal_id' => $withdrawalId,
                    'amount' => $amount,
                    'formatted_amount' => number_format($amount, 0, ',', '.') . ' đ',
                    'new_balance' => (float) $nag->So_Du,
                    'formatted_balance' => number_format($nag->So_Du, 0, ',', '.') . ' đ',
                    'bank_info' => [
                        'account' => $validated['bank_account'],
                        'bank_name' => $validated['bank_name'] ?? 'Không xác định',
                        'account_holder' => $validated['account_holder_name'],
                    ],
                ]);
            }

            DB::rollBack();
            return response()->json(['message' => 'Không tìm thấy thông tin người dùng'], 404);
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

    /**
     * Lấy lịch sử giao dịch ví
     */
    public function getTransactions(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $limit = (int) $request->query('limit', 50);
            $offset = (int) $request->query('offset', 0);

            // Kiểm tra là khách hàng hay nhiếp ảnh gia
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if ($khachHang) {
                $transactions = WalletTransaction::where('Loai_Nguoi_Dung', 'khach_hang')
                    ->where('Ma_Nguoi_Dung', $khachHang->Ma_KH)
                    ->orderBy('Thoi_Gian', 'desc')
                    ->limit($limit)
                    ->offset($offset)
                    ->get();

                return response()->json([
                    'user_type' => 'khach_hang',
                    'transactions' => $transactions,
                    'total' => WalletTransaction::where('Loai_Nguoi_Dung', 'khach_hang')
                        ->where('Ma_Nguoi_Dung', $khachHang->Ma_KH)
                        ->count(),
                ]);
            }

            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
            if ($nag) {
                $transactions = WalletTransaction::where('Loai_Nguoi_Dung', 'nhiep_anh_gia')
                    ->where('Ma_Nguoi_Dung', $nag->Ma_NAG)
                    ->orderBy('Thoi_Gian', 'desc')
                    ->limit($limit)
                    ->offset($offset)
                    ->get();

                return response()->json([
                    'user_type' => 'nhiep_anh_gia',
                    'transactions' => $transactions,
                    'total' => WalletTransaction::where('Loai_Nguoi_Dung', 'nhiep_anh_gia')
                        ->where('Ma_Nguoi_Dung', $nag->Ma_NAG)
                        ->count(),
                ]);
            }

            return response()->json(['message' => 'Không tìm thấy thông tin người dùng'], 404);
        } catch (\Throwable $e) {
            Log::error('Lỗi lấy lịch sử giao dịch', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra'], 500);
        }
    }
}
