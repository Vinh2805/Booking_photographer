<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\BuoiChup;
use App\Models\KhachHang;

class ReviewController extends Controller
{
    /**
     * Tạo đánh giá cho nhiếp ảnh gia
     */
    public function create(Request $request, string $ma_bc)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra user là khách hàng
        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        if (!$khachHang) {
            return response()->json(['message' => 'Bạn không phải khách hàng'], 403);
        }

        // Kiểm tra buổi chụp
        $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        // Kiểm tra buổi chụp thuộc về khách hàng này
        if ($booking->Ma_KH !== $khachHang->Ma_KH) {
            return response()->json(['message' => 'Bạn không có quyền đánh giá buổi chụp này'], 403);
        }

        // Kiểm tra buổi chụp đã hoàn thành chưa
        if ($booking->Trang_Thai !== 'Đã hoàn thành') {
            return response()->json([
                'message' => 'Chỉ có thể đánh giá khi buổi chụp đã hoàn thành'
            ], 400);
        }

        // Kiểm tra đã đánh giá chưa
        $existingReview = DB::table('danh_gia')
            ->where('Ma_BC', $ma_bc)
            ->where('Ma_KH', $khachHang->Ma_KH)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Bạn đã đánh giá buổi chụp này rồi'
            ], 400);
        }

        // Validate
        $validated = $request->validate([
            'So_Sao' => 'required|integer|min:1|max:5',
            'Noi_Dung' => 'nullable|string|max:1000',
        ]);

        // Tạo mã đánh giá
        $maDG = $this->generateMaDG();

        // Tạo đánh giá
        DB::table('danh_gia')->insert([
            'Ma_ĐG' => $maDG,
            'Ma_BC' => $ma_bc,
            'Ma_KH' => $khachHang->Ma_KH,
            'Ma_NAG' => $booking->Ma_NAG,
            'So_Sao' => $validated['So_Sao'],
            'Noi_Dung' => $validated['Noi_Dung'] ?? null,
            'Ngay_ĐG' => now(),
        ]);

        // Ghi log
        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $ma_bc,
            'Loai_Giao_Dich' => 'Da hoan thanh',
            'Mo_Ta' => "Khách hàng đã đánh giá nhiếp ảnh gia với {$validated['So_Sao']} sao",
            'Thoi_Gian' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Đánh giá đã được gửi thành công',
            'data' => [
                'ma_danh_gia' => $maDG,
                'so_sao' => $validated['So_Sao'],
                'noi_dung' => $validated['Noi_Dung'] ?? null,
            ]
        ], 201);
    }

    /**
     * Lấy đánh giá của khách hàng cho buổi chụp
     */
    public function getReview(string $ma_bc)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        if (!$khachHang) {
            return response()->json(['message' => 'Bạn không phải khách hàng'], 403);
        }

        $review = DB::table('danh_gia')
            ->where('Ma_BC', $ma_bc)
            ->where('Ma_KH', $khachHang->Ma_KH)
            ->first();

        if (!$review) {
            return response()->json([
                'hasReview' => false,
                'review' => null
            ]);
        }

        return response()->json([
            'hasReview' => true,
            'review' => [
                'ma_danh_gia' => $review->Ma_ĐG,
                'so_sao' => $review->So_Sao,
                'noi_dung' => $review->Noi_Dung,
                'ngay_danh_gia' => $review->Ngay_ĐG,
            ]
        ]);
    }

    /**
     * Tạo mã đánh giá
     */
    private function generateMaDG(): string
    {
        $latest = DB::table('danh_gia')
            ->orderBy('Ma_ĐG', 'desc')
            ->first();

        if (!$latest) {
            return 'DG001';
        }

        $number = (int) substr($latest->Ma_ĐG, 2);
        $next = $number + 1;
        return 'DG' . str_pad($next, 3, '0', STR_PAD_LEFT);
    }
}
