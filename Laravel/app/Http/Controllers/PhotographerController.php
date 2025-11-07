<?php

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\TinNhan;
use Illuminate\Http\Request;

class PhotographerController extends Controller
{
    // 📊 Thống kê tổng quan cho nhiếp ảnh gia
    public function dashboard($Ma_TK)
    {
        $totalBookings = BuoiChup::where('Ma_NAG', $Ma_TK)->count();
        $revenue = ThanhToan::whereHas('buoiChup', function ($q) use ($Ma_TK) {
            $q->where('Ma_NAG', $Ma_TK);
        })->sum('So_Tien');
        $rating = BuoiChup::where('Ma_NAG', $Ma_TK)->avg('Danh_Gia') ?? 0;
        $unreadMessages = TinNhan::where('Ma_NAG', $Ma_TK)
            ->where('Da_Doc', false)
            ->count();

        return response()->json([
            'bookings' => $totalBookings,
            'revenue' => $revenue,
            'rating' => round($rating, 1),
            'unreadMessages' => $unreadMessages,
        ]);
    }

    // 📅 Lấy danh sách buổi chụp sắp tới
    public function bookings($Ma_TK)
    {
        $upcoming = BuoiChup::where('Ma_NAG', $Ma_TK)
            ->whereDate('Ngay_Chup', '>=', now())
            ->orderBy('Ngay_Chup', 'asc')
            ->take(5)
            ->get();

        return response()->json($upcoming);
    }

     public function featured()
    {
        $photographers = NhiepAnhGia::select(
            'Ma_NAG as id',
            'Ho_Ten as name',
            'Anh_Dai_Dien as avatar',
            'Anh_Bia as coverImage',
            'Gia_TB as priceValue',
            'Dia_Diem_Lam_Viec as location',
            'Danh_Gia_TB as rating',
            'Mo_Ta as description',
            'Chuyen_Mon as specialties',
            'Trang_Thai_On as isOnline',
            'Da_Xac_Minh as isVerified',
            'Cap_Bac as level',
            'So_Luot_Dat as completedBookings',
            'Phan_Hoi_Trung_Binh as responseTime',
            'Ngay_Tao as joinedDate'
        )
        ->orderByDesc('Danh_Gia_TB')
        ->take(12)
        ->get()
        ->map(function ($p) {
            // chuyển giá tiền sang chuỗi đẹp + fallback cho mảng chuyên môn
            $p->price = number_format($p->priceValue ?? 0, 0, ',', '.') . '₫';
            $p->specialties = $p->specialties
                ? explode(',', $p->specialties)
                : ['Chân dung'];
            return $p;
        });

        return response()->json($photographers);
    }
}
