<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\BuoiChup;
use App\Models\KhachHang;

class BookingChangeController extends Controller
{
    public function requestChange(Request $request, string $ma_bc)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra user là khách hàng
        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        if (!$khachHang) {
            return response()->json(['message' => 'Bạn không phải khách hàng'], 403);
        }

        $validated = $request->validate([
            'thay_doi' => 'required|array',
            'ly_do' => 'required|string|max:255'
        ], [
            'thay_doi.required' => 'Vui lòng chọn thông tin cần thay đổi.',
            'ly_do.required' => 'Vui lòng nhập lý do thay đổi.'
        ]);

        $booking = BuoiChup::find($ma_bc);
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        }

        // Kiểm tra buổi chụp thuộc về khách hàng này
        if ($booking->Ma_KH !== $khachHang->Ma_KH) {
            return response()->json(['message' => 'Bạn không có quyền yêu cầu thay đổi buổi chụp này'], 403);
        }

        $changes = [];
        foreach ($validated['thay_doi'] as $field => $newValue) {
            if (property_exists($booking, $field)) {
                $changes[$field] = [
                    'cu' => $booking->$field,
                    'moi' => $newValue
                ];
            }
        }

        DB::table('yeu_cau_thay_doi')->insert([
            'Ma_BC' => $booking->Ma_BC,
            'Danh_Sach_Thay_Doi' => json_encode($changes, JSON_UNESCAPED_UNICODE),
            'Ly_Do' => $validated['ly_do'],
            'Trang_Thai' => 'Chờ duyệt',
            'Ngay_Tao' => now()
        ]);

        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $booking->Ma_BC,
            'Loai_Giao_Dich' => 'Thay doi',
            'Mo_Ta' => "Yêu cầu thay đổi buổi chụp {$booking->Ma_BC} đang chờ duyệt. Lý do: {$validated['ly_do']}",
            'Thoi_Gian' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'title' => 'Yêu cầu thay đổi đã được gửi',
            'message' => 'Yêu cầu của bạn đang được xét duyệt bởi nhiếp ảnh gia/khách hàng.',
            'data' => [
                'ma_buoi_chup' => $booking->Ma_BC,
                'thay_doi' => $changes,
                'ly_do' => $validated['ly_do']
            ],
            'icon' => '📩'
        ]);
    }
}
