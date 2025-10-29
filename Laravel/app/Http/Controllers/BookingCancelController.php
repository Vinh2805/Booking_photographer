<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\BuoiChup;
use Carbon\Carbon;

class BookingCancelController extends Controller
{
    public function cancel(Request $request, string $ma_bc)
    {
        $request->validate([
            'ly_do' => 'required|string|max:255',
        ]);

        $booking = BuoiChup::find($ma_bc);
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        }

        // Không cho huỷ nếu buổi chụp đã diễn ra hoặc hoàn tất
        if (in_array($booking->Trang_Thai, ['Đang diễn ra', 'Đã hoàn thành'])) {
            return response()->json(['message' => 'Buổi chụp đã diễn ra hoặc hoàn thành, không thể huỷ.'], 400);
        }

        // ✅ Tính thời gian còn lại trước buổi chụp
        $now = Carbon::now();
        $bat_dau = Carbon::parse($booking->Bat_Dau_Chup);
        $diffHours = $now->diffInHours($bat_dau, false);

        // ✅ Tính số tiền đặt cọc
        $so_tien_coc = $booking->Tong_Tien * ($booking->Ti_Le_Coc / 100);
        $ti_le_hoan = 1.0;
        $ghi_chu = '';

        // ✅ Chính sách hoàn tiền
        if ($diffHours < 24) {
            $ti_le_hoan = 0;
            $ghi_chu = 'Huỷ trong vòng 24h — khấu trừ 100% tiền cọc.';
        } else {
            $ti_le_hoan = 1.0;
            $ghi_chu = 'Huỷ trước 24h — hoàn 100% tiền cọc.';
        }

        $so_tien_hoan = round($so_tien_coc * $ti_le_hoan, 2);

        DB::transaction(function () use ($booking, $request, $ghi_chu, $so_tien_hoan) {
            // 🔸 Cập nhật trạng thái buổi chụp
            $booking->Trang_Thai = 'Đã hủy';
            $booking->Ly_Do_Huy = $request->ly_do;
            $booking->save();

            // 🔸 Ghi log vào bảng lịch sử giao dịch
            DB::table('lich_su_giao_dich')->insert([
                'Ma_BC' => $booking->Ma_BC,
                'Loai_Giao_Dich' => 'Da huy',
                'Mo_Ta' => "Khách hàng {$booking->Ma_KH} huỷ buổi chụp. {$ghi_chu} Lý do: {$request->ly_do}",
                'Ip_Address' => request()->ip(),
                'User_Agent' => request()->header('User-Agent'),
                'Thoi_Gian' => now()
            ]);

            Log::warning("Khách hàng {$booking->Ma_KH} huỷ buổi chụp {$booking->Ma_BC}. {$ghi_chu}");
        });

        return response()->json([
            'status' => 'success',
            'title' => 'Yêu cầu huỷ đã được ghi nhận',
            'message' => 'Momentia sẽ xử lý hoàn tiền theo chính sách huỷ.',
            'data' => [
                'ma_buoi_chup' => $booking->Ma_BC,
                'ly_do' => $request->ly_do,
                'thoi_gian_con_lai' => "{$diffHours} giờ trước khi chụp",
                'tien_coc' => $so_tien_coc,
                'so_tien_hoan' => $so_tien_hoan,
                'ghi_chu' => $ghi_chu,
                'icon' => '💰',
                'canh_bao' => 'Thời gian xử lý hoàn tiền có thể mất 24–48 giờ.'
            ]
        ]);
    }
}
