<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\BuoiChup;
use App\Models\ThanhToan;
use App\Models\KhachHang;
use App\Models\DanhGia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    // 1. Đăng nhập Admin
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        $user = User::where('Email_TK', $fields['email'])->first();

        // Kiểm tra user, password và QUYỀN ADMIN
        if (!$user || !Hash::check($fields['password'], $user->Mat_Khau) || $user->Loai_TK !== 'Admin') {
            return response()->json([
                'message' => 'Thông tin đăng nhập không đúng hoặc bạn không có quyền Admin.'
            ], 401);
        }

        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Đăng nhập thành công'
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }

    // 2. Lấy số liệu Dashboard
    public function getDashboardStats(Request $request)
    {
        $period = $request->query('period', 'month'); // day, week, month
        
        $now = Carbon::now();
        $startDate = $now->copy()->startOfMonth();
        $previousStartDate = $now->copy()->subMonth()->startOfMonth();
        $previousEndDate = $now->copy()->subMonth()->endOfMonth();

        if ($period === 'week') {
            $startDate = $now->copy()->startOfWeek();
            $previousStartDate = $now->copy()->subWeek()->startOfWeek();
            $previousEndDate = $now->copy()->subWeek()->endOfWeek();
        } elseif ($period === 'day') {
            $startDate = $now->copy()->startOfDay();
            $previousStartDate = $now->copy()->subDay()->startOfDay();
            $previousEndDate = $now->copy()->subDay()->endOfDay();
        }

        // --- Booking Stats ---
        $currentBookings = BuoiChup::where('Ngay_Tao', '>=', $startDate)->count();
        $previousBookings = BuoiChup::whereBetween('Ngay_Tao', [$previousStartDate, $previousEndDate])->count();
        $bookingChange = $previousBookings > 0 
            ? round((($currentBookings - $previousBookings) / $previousBookings) * 100, 1) 
            : 100;

        // --- Revenue Stats ---
        $currentRevenue = ThanhToan::where('Trang_Thai', 'Thành công')
            ->where('Ngay_TT', '>=', $startDate)
            ->sum('So_Tien');
        $previousRevenue = ThanhToan::where('Trang_Thai', 'Thành công')
            ->whereBetween('Ngay_TT', [$previousStartDate, $previousEndDate])
            ->sum('So_Tien');
        $revenueChange = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : 100;

        // --- Customer Stats ---
        // Đếm user mới tạo trong khoảng thời gian này
        $currentCustomers = User::where('Loai_TK', 'Khách hàng')
            ->where('Thoi_Diem_Tao_TK', '>=', $startDate)
            ->count();
        $previousCustomers = User::where('Loai_TK', 'Khách hàng')
             ->whereBetween('Thoi_Diem_Tao_TK', [$previousStartDate, $previousEndDate])
             ->count();
        $customerChange = $previousCustomers > 0
            ? round((($currentCustomers - $previousCustomers) / $previousCustomers) * 100, 1)
            : 100;

        // --- Processing (Đang chờ xử lý) ---
        // Bao gồm: Chờ xác nhận, Chờ thanh toán, Chờ đặt cọc, Đang xử lý, Sắp diễn ra
        $processingCount = BuoiChup::whereIn('Trang_Thai', [
            'Chờ xác nhận', 
            'Chờ thanh toán', 
            'Chờ đặt cọc', 
            'Đang xử lý',
            'Sắp diễn ra'
        ])->count();


        // --- Additional Quick Stats ---
        // Đã xử lý hôm nay -> Thay bằng "Yêu cầu mới hôm nay" (New Requests Today) vì không có updated_at
        $processedToday = BuoiChup::whereDate('Ngay_Tao', Carbon::today())->count();
            
        $urgentCount = DanhGia::where('So_Sao', '<=', 3)->count(); // Số lượng đánh giá thấp cần xử lý

        return response()->json([
            'stats' => [
                'bookings' => [
                    'value' => number_format($currentBookings),
                    'change' => ($bookingChange >= 0 ? '+' : '') . $bookingChange . '%',
                    'trend' => $bookingChange >= 0 ? 'positive' : 'negative'
                ],
                'revenue' => [
                    'value' => number_format($currentRevenue, 0, ',', '.') . ' đ',
                    'change' => ($revenueChange >= 0 ? '+' : '') . $revenueChange . '%',
                    'trend' => $revenueChange >= 0 ? 'positive' : 'negative'
                ],
                'customers' => [
                    'value' => number_format($currentCustomers),
                    'change' => ($customerChange >= 0 ? '+' : '') . $customerChange . '%',
                    'trend' => $customerChange >= 0 ? 'positive' : 'negative'
                ],
                'processing' => [
                    'value' => number_format($processingCount),
                    'change' => 'Active',
                    'trend' => 'neutral'
                ],
                // New Fields
                'processed_today' => number_format($processedToday),
                'urgent_count' => number_format($urgentCount)
            ]
        ]);
    }

    // 3. Lấy hoạt động gần đây
    public function getRecentActivities()
    {
        // Lấy 10 hoạt động mới nhất từ tất cả các nguồn
        // Ở đây demo lấy từ bảng Booking mới nhất và Đánh giá mới nhất
        
        $activities = collect();

        // Booking mới
        $newBookings = BuoiChup::with('khachHang.taiKhoan')
            ->orderBy('Ngay_Tao', 'desc')
            ->take(5)
            ->get()
            ->map(function ($bc) {
                return [
                    'id' => 'bk_' . $bc->Ma_BC,
                    'type' => 'booking',
                    'title' => 'Booking mới: ' . $bc->Ma_BC,
                    'description' => 'Khách hàng ' . ($bc->khachHang->taiKhoan->Ho_Ten ?? 'Ẩn danh') . ' đặt lịch tại ' . $bc->Dia_Diem,
                    'time' => $bc->Ngay_Tao,
                    'status' => 'new',
                    'bookingId' => $bc->Ma_BC
                ];
            });
        
        // Đánh giá thấp (Cảnh báo)
        $lowReviews = DanhGia::with(['nhiepAnhGia.taiKhoan'])
            ->where('So_Sao', '<=', 3)
            ->orderBy('Ngay_ĐG', 'desc')
            ->take(5)
            ->get()
            ->map(function ($rv) {
                return [
                    'id' => 'rv_' . $rv->Ma_ĐG,
                    'type' => 'alert',
                    'title' => 'Đánh giá thấp: ' . $rv->So_Sao . ' sao',
                    'description' => 'NAG ' . ($rv->nhiepAnhGia->taiKhoan->Ho_Ten ?? 'Unknown') . ' nhận đánh giá thấp.',
                    'time' => $rv->Ngay_ĐG,
                    'status' => 'warning',
                    'bookingId' => $rv->Ma_BC
                ];
            });

        $activities = $activities->merge($newBookings)->merge($lowReviews)->sortByDesc('time')->values();

        return response()->json([
            'activities' => $activities
        ]);
    }
}
