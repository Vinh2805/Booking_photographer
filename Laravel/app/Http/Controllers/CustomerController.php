<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\BuoiChup;
use App\Models\TinNhan;
use App\Models\KhachHang;

class CustomerController extends Controller
{
    public function dashboard(Request $request, $Ma_TK)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra Ma_TK trong URL phải khớp với user đã đăng nhập
        if ($user->Ma_TK !== $Ma_TK) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Lấy thông tin khách hàng
        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        if (!$khachHang) {
            return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
        }

        // Đếm số buổi chụp của khách hàng
        $bookingsCount = BuoiChup::where('Ma_KH', $khachHang->Ma_KH)->count();

        // Đếm số tin nhắn chưa đọc của khách hàng
        // Trang_Thai = 'Đã gửi' nghĩa là chưa đọc, 'Đã đọc' nghĩa là đã đọc
        $unreadMessagesCount = TinNhan::where('Ma_KH', $khachHang->Ma_KH)
            ->where('Trang_Thai', 'Đã gửi')
            ->count();

        // TODO: favoritePhotographers - cần bảng yêu_thich hoặc tương tự
        $favoritePhotographers = 0;

        return response()->json([
            'bookings' => $bookingsCount,
            'unreadMessages' => $unreadMessagesCount,
            'favoritePhotographers' => $favoritePhotographers,
        ]);
    }
}
