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
                'tai_khoan.Avatar as avatar',
                'nhiep_anh_gia.Anh_Bia as coverImage',
                'nhiep_anh_gia.Portfolio as portfolio',
                'nhiep_anh_gia.Boi_Canh_Chup as styles',
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

                // Process avatar URL - file is stored in storage/app/private/public/avatars/
                $avatarUrl = null;
                if ($p->avatar && !empty($p->avatar)) {
                    $filePath = str_replace('/storage/', 'public/', $p->avatar);
                    if (\Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
                        $fileName = basename($p->avatar);
                        $avatarUrl = url('/api/storage/avatars/' . $fileName);
                    }
                }

                // Process cover image URL - file is stored in storage/app/private/public/covers/
                $coverImageUrl = null;
                if ($p->coverImage && !empty($p->coverImage)) {
                    $filePath = str_replace('/storage/', 'public/', $p->coverImage);
                    if (\Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
                        $fileName = basename($p->coverImage);
                        $coverImageUrl = url('/api/storage/covers/' . $fileName);
                    }
                }

                // Process portfolio URLs - files are stored in storage/app/private/public/portfolio/
                $portfolioImages = [];
                if ($p->portfolio) {
                    $portfolio = json_decode($p->portfolio, true);
                    if (is_array($portfolio)) {
                        foreach ($portfolio as $portfolioUrl) {
                            if ($portfolioUrl && !empty($portfolioUrl)) {
                                $filePath = str_replace('/storage/', 'public/', $portfolioUrl);
                                if (\Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
                                    $fileName = basename($portfolioUrl);
                                    $portfolioImages[] = url('/api/storage/portfolio/' . $fileName);
                                }
                            }
                        }
                    }
                }

                // Process styles
                $specialties = ['Chân dung']; // Default
                if ($p->styles) {
                    $styles = json_decode($p->styles, true);
                    if (is_array($styles) && !empty($styles)) {
                        $specialties = $styles;
                    }
                }

                return (object) [
                    'id' => $p->id,
                    'name' => $p->name ?? 'Nhiếp ảnh gia',
                    'avatar' => $avatarUrl ?? '',
                    'coverImage' => $coverImageUrl ?? '',
                    'portfolioImages' => $portfolioImages,
                    'priceValue' => (float)($p->priceValue ?? 0),
                    'price' => number_format($p->priceValue ?? 0, 0, ',', '.') . '₫',
                    'location' => $p->location ?? 'Chưa cập nhật',
                    'rating' => round($rating, 1),
                    'description' => 'Nhiếp ảnh gia chuyên nghiệp',
                    'specialties' => $specialties,
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

    /**
     * Lấy thông tin chi tiết của một photographer theo ID (public)
     */
    public function show($id)
    {
        $nag = NhiepAnhGia::join('tai_khoan', 'nhiep_anh_gia.Ma_TK', '=', 'tai_khoan.Ma_TK')
            ->where('nhiep_anh_gia.Ma_NAG', $id)
            ->select(
                'nhiep_anh_gia.Ma_NAG as id',
                'tai_khoan.Ho_Ten as name',
                'tai_khoan.Avatar as avatar',
                'nhiep_anh_gia.Anh_Bia as coverImage',
                'nhiep_anh_gia.Portfolio as portfolio',
                'nhiep_anh_gia.Boi_Canh_Chup as styles',
                'nhiep_anh_gia.Thiet_Bi as equipment',
                'nhiep_anh_gia.Gia_Trung_Binh as priceValue',
                'nhiep_anh_gia.Gia_Toi_Thieu as priceMin',
                'nhiep_anh_gia.Gia_Toi_Da as priceMax',
                'nhiep_anh_gia.Dia_Diem_Hoat_Dong as location',
                'nhiep_anh_gia.Kinh_Nghiem as experience',
                'tai_khoan.Gioi_Thieu as bio'
            )
            ->first();

        if (!$nag) {
            return response()->json(['message' => 'Không tìm thấy nhiếp ảnh gia'], 404);
        }

        // Đếm số buổi chụp đã hoàn thành
        $completedBookings = BuoiChup::where('Ma_NAG', $nag->id)
            ->where('Trang_Thai', 'Đã hoàn thành')
            ->count();
        
        // Tính rating trung bình từ bảng danh_gia
        $rating = DB::table('danh_gia')
            ->where('Ma_NAG', $nag->id)
            ->avg('So_Sao') ?? 0;
        $reviewCount = DB::table('danh_gia')
            ->where('Ma_NAG', $nag->id)
            ->count();

        // Process avatar URL
        $avatarUrl = null;
        if ($nag->avatar && !empty($nag->avatar)) {
            $filePath = str_replace('/storage/', 'public/', $nag->avatar);
            if (\Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
                $fileName = basename($nag->avatar);
                $avatarUrl = url('/api/storage/avatars/' . $fileName);
            }
        }

        // Process cover image URL
        $coverImageUrl = null;
        if ($nag->coverImage && !empty($nag->coverImage)) {
            $filePath = str_replace('/storage/', 'public/', $nag->coverImage);
            if (\Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
                $fileName = basename($nag->coverImage);
                $coverImageUrl = url('/api/storage/covers/' . $fileName);
            }
        }

        // Process portfolio URLs
        $portfolioImages = [];
        if ($nag->portfolio) {
            $portfolio = json_decode($nag->portfolio, true);
            if (is_array($portfolio) && !empty($portfolio)) {
                foreach ($portfolio as $portfolioUrl) {
                    if ($portfolioUrl && !empty($portfolioUrl)) {
                        // Extract filename from URL (could be /storage/portfolio/... or full URL)
                        $fileName = basename($portfolioUrl);
                        
                        // Try to find the file in storage
                        $filePath = 'public/portfolio/' . $fileName;
                        
                        // Check if file exists in local storage
                        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($filePath)) {
                            // File exists, generate serve URL
                            $portfolioImages[] = url('/api/storage/portfolio/' . $fileName);
                        } else {
                            // File might not exist or path is different, but still try to serve it
                            // The serve endpoint will handle 404 if file doesn't exist
                            $portfolioImages[] = url('/api/storage/portfolio/' . $fileName);
                        }
                    }
                }
            }
        }

        // Process styles
        $specialties = [];
        if ($nag->styles) {
            $styles = json_decode($nag->styles, true);
            if (is_array($styles)) {
                $specialties = $styles;
            }
        }

        // Process equipment
        $equipmentList = [];
        if ($nag->equipment) {
            $equipment = json_decode($nag->equipment, true);
            if (is_array($equipment)) {
                $equipmentList = $equipment;
            }
        }

        return response()->json([
            'id' => $nag->id,
            'name' => $nag->name ?? 'Nhiếp ảnh gia',
            'avatar' => $avatarUrl ?? '',
            'coverImage' => $coverImageUrl ?? '',
            'portfolio' => $portfolioImages,
            'styles' => $specialties,
            'equipment' => $equipmentList,
            'priceValue' => (float)($nag->priceValue ?? 0),
            'priceMin' => (float)($nag->priceMin ?? 0),
            'priceMax' => (float)($nag->priceMax ?? 0),
            'location' => $nag->location ?? 'Chưa cập nhật',
            'experience' => $nag->experience ?? 0,
            'bio' => $nag->bio ?? '',
            'rating' => round($rating, 1),
            'reviewCount' => $reviewCount,
            'completedBookings' => $completedBookings,
        ]);
    }
}
