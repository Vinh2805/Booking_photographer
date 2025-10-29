<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\BuoiChup;

class BookingConfirmationController extends Controller
{
    // ✅ Xác nhận buổi chụp
    public function confirm(string $ma_bc)
    {
        $booking = BuoiChup::find($ma_bc);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        if ($booking->Trang_Thai !== 'Chờ xác nhận')
            return response()->json(['message' => 'Buổi chụp không thể xác nhận ở trạng thái hiện tại.'], 400);

        DB::transaction(function () use ($booking) {
            $booking->Trang_Thai = 'Chờ đặt cọc';
            $booking->save();
            Log::info("Buổi chụp {$booking->Ma_BC} đã được xác nhận bởi nhiếp ảnh gia {$booking->Ma_NAG}");
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
        $request->validate(['ly_do' => 'required|string|max:255']);

        $booking = BuoiChup::find($ma_bc);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
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
