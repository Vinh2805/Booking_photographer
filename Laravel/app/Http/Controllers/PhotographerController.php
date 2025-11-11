<?php

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\TinNhan;
use App\Models\NhiepAnhGia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PhotographerController extends Controller
{
    // 📊 Thống kê tổng quan cho nhiếp ảnh gia
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

        // Lấy Ma_NAG từ bảng nhiep_anh_gia
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if (!$nag) {
            return response()->json(['message' => 'Bạn không phải nhiếp ảnh gia'], 403);
        }

        $totalBookings = BuoiChup::where('Ma_NAG', $nag->Ma_NAG)->count();
        $revenue = ThanhToan::whereHas('buoiChup', function ($q) use ($nag) {
            $q->where('Ma_NAG', $nag->Ma_NAG);
        })->sum('So_Tien');
        
        // Lấy rating từ bảng danh_gia
        $rating = DB::table('danh_gia')
            ->where('Ma_NAG', $nag->Ma_NAG)
            ->avg('So_Sao') ?? 0;
            
        $unreadMessages = TinNhan::where('Ma_NAG', $nag->Ma_NAG)
            ->where('Trang_Thai', 'Đã gửi')
            ->count();

        return response()->json([
            'bookings' => $totalBookings,
            'revenue' => $revenue,
            'rating' => round($rating, 1),
            'unreadMessages' => $unreadMessages,
        ]);
    }

    // 📅 Lấy danh sách buổi chụp sắp tới
    public function bookings(Request $request, $Ma_TK)
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

        // Lấy Ma_NAG từ bảng nhiep_anh_gia
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if (!$nag) {
            return response()->json(['message' => 'Bạn không phải nhiếp ảnh gia'], 403);
        }

        $upcoming = BuoiChup::where('Ma_NAG', $nag->Ma_NAG)
            ->whereDate('Bat_Dau_Chup', '>=', now())
            ->orderBy('Bat_Dau_Chup', 'asc')
            ->take(5)
            ->get();

        return response()->json($upcoming);
    }

    public function featured()
    {
        // Lấy thông tin nhiếp ảnh gia với thông tin từ bảng tai_khoan
        // Bảng tai_khoan chỉ có: Ma_TK, Ho_Ten, So_ĐT, Email_TK, Mat_Khau, Loai_TK, Hinh_Thuc_Dang_Nhap
        $photographers = NhiepAnhGia::join('tai_khoan', 'nhiep_anh_gia.Ma_TK', '=', 'tai_khoan.Ma_TK')
            ->select(
                'nhiep_anh_gia.Ma_NAG as id',
                'tai_khoan.Ho_Ten as name',
                'nhiep_anh_gia.Gia_Trung_Binh as priceValue',
                'nhiep_anh_gia.Dia_Diem_Hoat_Dong as location',
                'nhiep_anh_gia.Kinh_Nghiem as experience'
            )
            ->whereNotNull('nhiep_anh_gia.Ma_TK')
            ->take(12)
            ->get()
            ->map(function ($p) {
                // Đếm số buổi chụp đã hoàn thành
                $completedBookings = BuoiChup::where('Ma_NAG', $p->id)
                    ->where('Trang_Thai', 'Đã hoàn thành')
                    ->count();
                
                // Tính rating trung bình từ bảng danh_gia
                $rating = DB::table('danh_gia')
                    ->where('Ma_NAG', $p->id)
                    ->avg('So_Sao') ?? 0;

                return (object) [
                    'id' => $p->id,
                    'name' => $p->name ?? 'Nhiếp ảnh gia',
                    'avatar' => '', // Chưa có trong database
                    'coverImage' => '', // Chưa có trong database
                    'priceValue' => (float)($p->priceValue ?? 0),
                    'price' => number_format($p->priceValue ?? 0, 0, ',', '.') . '₫',
                    'location' => $p->location ?? 'Chưa cập nhật',
                    'rating' => round($rating, 1),
                    'description' => 'Nhiếp ảnh gia chuyên nghiệp',
                    'specialties' => ['Chân dung'], // Default
                    'isOnline' => false,
                    'isVerified' => false,
                    'level' => 'Professional',
                    'completedBookings' => $completedBookings,
                    'responseTime' => 'Nhanh',
                    'joinedDate' => now()->toDateString(),
                ];
            });

        return response()->json($photographers);
    }
}
