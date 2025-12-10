<?php

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\TinNhan;
use App\Models\DichVu;
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
                    // Check if it's already a URL
                    if (str_starts_with($p->avatar, 'http')) {
                         $avatarUrl = $p->avatar;
                    } else {
                         $fileName = basename($p->avatar);
                         $avatarUrl = url('/api/storage/avatars/' . $fileName);
                    }
                }

                // Process cover image URL - file is stored in storage/app/private/public/covers/
                $coverImageUrl = null;
                if ($p->coverImage && !empty($p->coverImage)) {
                    $fileName = basename($p->coverImage);
                    $coverImageUrl = url('/api/storage/covers/' . $fileName);
                }

                // Process portfolio URLs - files are stored in storage/app/private/public/portfolio/
                $portfolioImages = [];
                if ($p->portfolio) {
                    $portfolio = json_decode($p->portfolio, true);
                    if (is_array($portfolio)) {
                        foreach ($portfolio as $portfolioUrl) {
                            if ($portfolioUrl && !empty($portfolioUrl)) {
                                $fileName = basename($portfolioUrl);
                                $portfolioImages[] = url('/api/storage/portfolio/' . $fileName);
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
            // Check if it's already a URL
            if (str_starts_with($nag->avatar, 'http')) {
                 $avatarUrl = $nag->avatar;
            } else {
                 $fileName = basename($nag->avatar);
                 $avatarUrl = url('/api/storage/avatars/' . $fileName);
            }
        }

        // Process cover image URL
        $coverImageUrl = null;
        if ($nag->coverImage && !empty($nag->coverImage)) {
            $fileName = basename($nag->coverImage);
            $coverImageUrl = url('/api/storage/covers/' . $fileName);
        }

        // Process portfolio URLs
        $portfolioImages = [];
        if ($nag->portfolio) {
            $portfolio = json_decode($nag->portfolio, true);
            if (is_array($portfolio) && !empty($portfolio)) {
                foreach ($portfolio as $portfolioUrl) {
                    if ($portfolioUrl && !empty($portfolioUrl)) {
                        $fileName = basename($portfolioUrl);
                        $portfolioImages[] = url('/api/storage/portfolio/' . $fileName);
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

    /**
     * Lấy lịch trống của nhiếp ảnh gia
     * Trả về danh sách các khoảng thời gian đã bận (để frontend có thể tính toán lịch trống)
     * 
     * @param Request $request
     * @param string $Ma_NAG Mã nhiếp ảnh gia
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableSchedule(Request $request, $Ma_NAG)
    {
        try {
            // Validate Ma_NAG
            $nag = NhiepAnhGia::where('Ma_NAG', $Ma_NAG)->first();
            if (!$nag) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy nhiếp ảnh gia'
                ], 404);
            }

            // Lấy các tham số từ request
            $startDate = $request->get('start_date', now()->toDateString());
            $endDate = $request->get('end_date', now()->addMonths(1)->toDateString());

            // Lấy tất cả các buổi chụp bận (không phải trạng thái "Chờ xác nhận" hoặc "Đã hủy")
            $busyBookings = BuoiChup::where('Ma_NAG', $Ma_NAG)
                ->whereNotIn('Trang_Thai', ['Chờ xác nhận', 'Đã hủy'])
                ->whereDate('Bat_Dau_Chup', '>=', $startDate)
                ->whereDate('Bat_Dau_Chup', '<=', $endDate)
                ->orderBy('Bat_Dau_Chup', 'asc')
                ->get(['Ma_BC', 'Bat_Dau_Chup', 'Ket_Thuc_Chup', 'Trang_Thai']);

            // Format dữ liệu trả về
            $busySlots = $busyBookings->map(function ($booking) {
                return [
                    'ma_bc' => $booking->Ma_BC,
                    'bat_dau' => $booking->Bat_Dau_Chup,
                    'ket_thuc' => $booking->Ket_Thuc_Chup,
                    'trang_thai' => $booking->Trang_Thai,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'ma_nag' => $Ma_NAG,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'busy_slots' => $busySlots,
                    'message' => 'Lịch trống được tính bằng cách loại trừ các khoảng thời gian bận ở trên'
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy lịch trống',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kiểm tra thời gian có trống không
     * Helper method để kiểm tra một khoảng thời gian cụ thể có thể đặt được không
     * 
     * @param Request $request
     * @param string $Ma_NAG Mã nhiếp ảnh gia
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkTimeSlot(Request $request, $Ma_NAG)
    {
        try {
            $validated = $request->validate([
                'bat_dau' => 'required|date|after:now',
                'ket_thuc' => 'required|date|after:bat_dau',
            ], [
                'bat_dau.after' => 'Thời gian bắt đầu phải trong tương lai. Không thể đặt lịch ở quá khứ.',
                'ket_thuc.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
            ]);

            // Validate Ma_NAG
            $nag = NhiepAnhGia::where('Ma_NAG', $Ma_NAG)->first();
            if (!$nag) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy nhiếp ảnh gia'
                ], 404);
            }

            // Kiểm tra xem có buổi chụp bận nào trùng với thời gian này không
            $conflictingBooking = BuoiChup::where('Ma_NAG', $Ma_NAG)
                ->whereNotIn('Trang_Thai', ['Chờ xác nhận', 'Đã hủy'])
                ->where(function ($query) use ($validated) {
                    $query->whereBetween('Bat_Dau_Chup', [$validated['bat_dau'], $validated['ket_thuc']])
                        ->orWhereBetween('Ket_Thuc_Chup', [$validated['bat_dau'], $validated['ket_thuc']])
                        ->orWhere(function ($q) use ($validated) {
                            $q->where('Bat_Dau_Chup', '<=', $validated['bat_dau'])
                              ->where('Ket_Thuc_Chup', '>=', $validated['ket_thuc']);
                        });
                })
                ->first();

            $isAvailable = !$conflictingBooking;

            return response()->json([
                'success' => true,
                'data' => [
                    'is_available' => $isAvailable,
                    'conflicting_booking' => $conflictingBooking ? [
                        'ma_bc' => $conflictingBooking->Ma_BC,
                        'bat_dau' => $conflictingBooking->Bat_Dau_Chup,
                        'ket_thuc' => $conflictingBooking->Ket_Thuc_Chup,
                        'trang_thai' => $conflictingBooking->Trang_Thai,
                    ] : null,
                    'message' => $isAvailable 
                        ? 'Thời gian này có thể đặt được' 
                        : 'Thời gian này đã được đặt'
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kiểm tra thời gian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách dịch vụ và giá của nhiếp ảnh gia
     */
    public function getServices($id)
    {
        $nag = NhiepAnhGia::find($id);

        if (!$nag) {
            return response()->json(['message' => 'Không tìm thấy nhiếp ảnh gia'], 404);
        }

        // Lấy dịch vụ qua relationship, bao gồm Gia từ pivot table
        $services = $nag->dichVu()->where('Hoat_Dong', true)->get();

        // Format lại dữ liệu để phù hợp với frontend
        $formattedServices = $services->map(function ($service) {
            return [
                'Ma_DV' => $service->Ma_DV,
                'Ten_DV' => $service->Ten_DV,
                'Mo_Ta' => $service->Mo_Ta,
                'Loai_DV' => $service->Loai_DV,
                'Gia' => (float) $service->pivot->Gia, // Lấy giá từ bảng pivot
            ];
        });

        return response()->json($formattedServices);
    }


    /**
     * Lấy danh sách toàn bộ dịch vụ kèm trạng thái và giá của NAG hiện tại (để quản lý)
     */
    public function getMyServices(Request $request)
    {
        try {
            $user = $request->user();
            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

            if (!$nag) {
                return response()->json(['message' => 'Bạn không phải là nhiếp ảnh gia'], 403);
            }

            // Lấy tất cả dịch vụ master
            $allServices = DichVu::where('Hoat_Dong', true)->get();

            // Lấy dịch vụ riêng của NAG
            $myServices = $nag->dichVu()->get()->keyBy('Ma_DV');

            $result = $allServices->map(function ($service) use ($myServices) {
                $is_active = $myServices->has($service->Ma_DV);
                $serviceItem = $myServices->get($service->Ma_DV);
                $price = ($is_active && $serviceItem && $serviceItem->pivot) ? $serviceItem->pivot->Gia : 0;

                return [
                    'Ma_DV' => $service->Ma_DV,
                    'Ten_DV' => $service->Ten_DV,
                    'Mo_Ta' => $service->Mo_Ta,
                    'Loai_DV' => $service->Loai_DV,
                    'is_active' => $is_active,
                    'price' => (float) $price,
                ];
            });

            return response()->json($result);
        } catch (\Exception $e) {
            \Log::error("getMyServices error: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật danh sách dịch vụ và giá cho NAG hiện tại
     */
    public function updateMyServices(Request $request)
    {
        $user = $request->user();
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        if (!$nag) {
            return response()->json(['message' => 'Bạn không phải là nhiếp ảnh gia'], 403);
        }

        $items = $request->input('services', []); // List of { Ma_DV, price, is_active }

        $syncData = [];
        foreach ($items as $item) {
            if (isset($item['is_active']) && $item['is_active']) {
                $syncData[$item['Ma_DV']] = ['Gia' => $item['price'] ?? 0];
            }
        }

        // Sync (xóa những cái không có trong list Active, thêm/update cái có)
        // Tuy nhiên, nếu FE gửi full list, thì sync là chuẩn. 
        // Nhưng nếu FE gửi partial, sync sẽ xóa mất cái cũ.
        // Giả sử FE gửi toàn bộ danh sách master service với trạng thái active/inactive
        
        // Để an toàn, chúng ta loop và update/delete từng cái hoặc dùng sync nếu input là full list.
        // Cách tốt nhất cho "Quản lý bảng giá" là gửi full list những cái Active.
        
        $nag->dichVu()->sync($syncData);

        return response()->json(['message' => 'Cập nhật bảng giá thành công']);
    }
}
