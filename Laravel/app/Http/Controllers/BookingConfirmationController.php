<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\BuoiChup;
use App\Models\NhiepAnhGia;

class BookingConfirmationController extends Controller
{
    // ✅ Xác nhận buổi chụp
    public function confirm(Request $request, string $ma_bc)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra user là nhiếp ảnh gia
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if (!$nag) {
            return response()->json(['message' => 'Bạn không phải nhiếp ảnh gia'], 403);
        }

        $booking = BuoiChup::find($ma_bc);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        
        // Kiểm tra buổi chụp thuộc về nhiếp ảnh gia này
        if ($booking->Ma_NAG !== $nag->Ma_NAG) {
            return response()->json(['message' => 'Bạn không có quyền xác nhận buổi chụp này'], 403);
        }
        
        if ($booking->Trang_Thai !== 'Chờ xác nhận')
            return response()->json(['message' => 'Buổi chụp không thể xác nhận ở trạng thái hiện tại.'], 400);

        DB::transaction(function () use ($booking, $nag) {
            // 1. Cập nhật trạng thái booking được chọn
            $booking->Trang_Thai = 'Chờ đặt cọc';
            $booking->save();
            Log::info("Buổi chụp {$booking->Ma_BC} đã được xác nhận bởi nhiếp ảnh gia {$booking->Ma_NAG}");

            // 2. Tìm và hủy các booking trùng giờ đang "Chờ xác nhận"
            $startTime = $booking->Bat_Dau_Chup;
            $endTime = $booking->Ket_Thuc_Chup;

            $conflictingBookings = BuoiChup::where('Ma_NAG', $nag->Ma_NAG)
                ->where('Ma_BC', '!=', $booking->Ma_BC) // Trừ booking hiện tại
                ->where('Trang_Thai', 'Chờ xác nhận')   // Chỉ hủy các yêu cầu đang chờ
                ->where(function ($query) use ($startTime, $endTime) {
                    // Logic trùng lặp: (StartA < EndB) && (EndA > StartB)
                    $query->where('Bat_Dau_Chup', '<', $endTime)
                          ->where('Ket_Thuc_Chup', '>', $startTime);
                })
                ->get();

            if ($conflictingBookings->count() > 0) {
                foreach ($conflictingBookings as $conflict) {
                    $conflict->Trang_Thai = 'Đã hủy';
                    $conflict->Ly_Do_Huy = 'Nhiếp ảnh gia đã nhận lịch khác trùng khung giờ này (' . $booking->Ma_BC . ')';
                    $conflict->save();
                    Log::info("Tự động hủy booking {$conflict->Ma_BC} do trùng lịch với {$booking->Ma_BC}");
                }
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Buổi chụp đã được xác nhận thành công.',
            'data' => [
                'ma_buoi_chup' => $booking->Ma_BC,
                'trang_thai' => $booking->Trang_Thai,
                'thong_bao' => 'Thông báo đã được gửi đến khách hàng.',
                'icon' => '✅'
            ]
        ]);
    }

    // ❌ Từ chối buổi chụp
    public function reject(Request $request, string $ma_bc)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra user là nhiếp ảnh gia
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if (!$nag) {
            return response()->json(['message' => 'Bạn không phải nhiếp ảnh gia'], 403);
        }

        $request->validate(['ly_do' => 'required|string|max:255']);

        $booking = BuoiChup::find($ma_bc);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        
        // Kiểm tra buổi chụp thuộc về nhiếp ảnh gia này
        if ($booking->Ma_NAG !== $nag->Ma_NAG) {
            return response()->json(['message' => 'Bạn không có quyền từ chối buổi chụp này'], 403);
        }
        
        if ($booking->Trang_Thai !== 'Chờ xác nhận')
            return response()->json(['message' => 'Buổi chụp không thể từ chối ở trạng thái hiện tại.'], 400);

        DB::transaction(function () use ($booking, $request) {
            $booking->Trang_Thai = 'Đã hủy';
            $booking->Ly_Do_Huy = $request->ly_do;
            $booking->save();
            Log::warning("Buổi chụp {$booking->Ma_BC} bị từ chối. Lý do: {$request->ly_do}");
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Đã từ chối buổi chụp thành công.',
            'data' => [
                'ma_buoi_chup' => $booking->Ma_BC,
                'ly_do' => $request->ly_do,
                'thong_bao' => 'Khách hàng sẽ nhận được thông báo về việc từ chối.',
                'icon' => '⚠️'
            ]
        ]);
    }
}
