<?php

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use App\Models\KhachHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\AutoUpdateBookingStatus;

class CustomerBookingController extends Controller
{
    use AutoUpdateBookingStatus;
    // Map trạng thái frontend → backend
    private function mapStatusToDb($status)
    {
        return match ($status) {
            'pending_confirmation' => 'Chờ xác nhận',
            'pending_deposit' => 'Chờ đặt cọc',
            'upcoming' => 'Sắp diễn ra',
            'ongoing' => 'Đang diễn ra',
            'pending_payment' => 'Chờ thanh toán',
            'pending_processing' => 'Chờ xử lý ảnh',
            'photos_ready' => 'Đã xử lý ảnh',
            'completed' => 'Đã hoàn thành',
            'cancelled' => 'Đã hủy',
            default => null,
        };
    }

    private function mapStatusToFrontend($status)
    {
        return match ($status) {
            'Chờ xác nhận' => 'pending_confirmation',
            'Chờ đặt cọc' => 'pending_deposit',
            'Sắp diễn ra' => 'upcoming',
            'Đang diễn ra' => 'ongoing',
            'Chờ thanh toán' => 'pending_payment',
            'Chờ xử lý ảnh' => 'pending_processing',
            'Đã xử lý ảnh' => 'photos_ready',
            'Đã hoàn thành' => 'completed',
            'Đã hủy' => 'cancelled',
            'Thay đổi' => 'pending_confirmation',
            default => 'pending_confirmation',
        };
    }

    /**
     * Lấy danh sách buổi chụp của khách hàng
     */
    public function index(Request $request)
{
    // Tự động cập nhật trạng thái trước khi lấy danh sách
    $this->autoUpdateBookingStatus();
    
    // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
    if (!$khachHang) {
        return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
    }

    $query = BuoiChup::with(['nhaNhiepAnh.taiKhoan'])
        ->where('Ma_KH', $khachHang->Ma_KH);

    if ($request->status && $request->status !== 'all') {
        $dbStatus = $this->mapStatusToDb($request->status);
        if ($dbStatus) {
            $query->where('Trang_Thai', $dbStatus);
        }
    }

    if ($request->search) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('Ma_BC', 'like', "%{$search}%")
              ->orWhere('Loai_Chup', 'like', "%{$search}%")
              ->orWhere('Dia_Diem', 'like', "%{$search}%")
              ->orWhereHas('nhaNhiepAnh.taiKhoan', fn($q) => $q->where('Ho_Ten', 'like', "%{$search}%"));
        });
    }

    $bookings = $query->latest('Ngay_Tao')->get();

    return response()->json($bookings->map(function ($bc) {
        $start = $bc->Bat_Dau_Chup ? \Carbon\Carbon::parse($bc->Bat_Dau_Chup) : null;
        $end = $bc->Ket_Thuc_Chup ? \Carbon\Carbon::parse($bc->Ket_Thuc_Chup) : null;

        $duration = '';
        if ($start && $end) {
            $diff = $start->diff($end);
            $duration = $diff->h . ' giờ';
            if ($diff->i > 0) $duration .= " {$diff->i} phút";
        }

        // Tính rating và completedSessions nếu có nhiếp ảnh gia
        $rating = 0;
        $completedSessions = 0;
        if ($bc->nhaNhiepAnh) {
            $rating = (float)DB::table('danh_gia')
                ->where('Ma_NAG', $bc->nhaNhiepAnh->Ma_NAG)
                ->avg('So_Sao') ?? 0;
            $completedSessions = BuoiChup::where('Ma_NAG', $bc->nhaNhiepAnh->Ma_NAG)
                ->where('Trang_Thai', 'Đã hoàn thành')
                ->count();
        }

        return [
            'id' => $bc->Ma_BC,
            'status' => $this->mapStatusToFrontend($bc->Trang_Thai),
            'title' => $bc->Loai_Chup . ' - ' . $bc->Dia_Diem,
            'photographer' => [
                'name' => $bc->nhaNhiepAnh?->taiKhoan?->Ho_Ten ?? 'Chưa chỉ định',
                'avatar' => '', // Chưa có trong database
                'rating' => $rating,
                'completedSessions' => $completedSessions,
            ],
            'type' => $bc->Loai_Chup,
            'location' => $bc->Dia_Diem,
            'date' => $start?->format('Y-m-d'),
            'time' => $start?->format('H:i'),
            'endDate' => $end?->format('Y-m-d'),
            'endTime' => $end?->format('H:i'),
            'startDateTime' => $start?->format('Y-m-d H:i:s'),
            'endDateTime' => $end?->format('Y-m-d H:i:s'),
            'price' => $bc->Tong_Tien,
            'description' => $bc->Ghi_Chu ?? '',
            'services' => [], // TODO: Load từ bảng buoi_chup_dich_vu khi bảng được tạo
            'duration' => $duration,
            'guestCount' => $bc->So_Nguoi ?: '—',
            'specialRequests' => $bc->Yeu_Cau_Dac_Biet ?? '',
            'photos' => [
                'rawPhotos' => 0, // TODO: Count from filesystem
                'editedPhotos' => 0, // TODO: Count from filesystem
            ],
        ];
    }));
}

    /**
     * Chi tiết buổi chụp
     */
    public function show(Request $request, $id)
    {
        // Tự động cập nhật trạng thái trước khi lấy chi tiết
        $this->autoUpdateBookingStatus();
        
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        if (!$khachHang) return response()->json(['message' => 'Khách hàng không tồn tại'], 404);

        $bc = BuoiChup::with(['nhaNhiepAnh.taiKhoan'])
            ->where('Ma_KH', $khachHang->Ma_KH)
            ->where('Ma_BC', $id)
            ->first();

        if (!$bc) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        $start = $bc->Bat_Dau_Chup ? \Carbon\Carbon::parse($bc->Bat_Dau_Chup) : null;
        $end = $bc->Ket_Thuc_Chup ? \Carbon\Carbon::parse($bc->Ket_Thuc_Chup) : null;

        $duration = '';
        if ($start && $end) {
            $diff = $start->diff($end);
            $duration = $diff->h . ' giờ';
            if ($diff->i > 0) $duration .= " {$diff->i} phút";
        }

        return response()->json([
            'id' => $bc->Ma_BC,
            'status' => $this->mapStatusToFrontend($bc->Trang_Thai),
            'title' => $bc->Loai_Chup . ' - ' . $bc->Dia_Diem,
            'photographer' => [
                'name' => $bc->nhaNhiepAnh?->taiKhoan?->Ho_Ten ?? 'Chưa chỉ định',
                'avatar' => '', // Chưa có trong database
                'rating' => $bc->nhaNhiepAnh ? (float)DB::table('danh_gia')
                    ->where('Ma_NAG', $bc->nhaNhiepAnh->Ma_NAG)
                    ->avg('So_Sao') ?? 0 : 0,
                'completedSessions' => $bc->nhaNhiepAnh ? BuoiChup::where('Ma_NAG', $bc->nhaNhiepAnh->Ma_NAG)
                    ->where('Trang_Thai', 'Đã hoàn thành')
                    ->count() : 0,
            ],
            'type' => $bc->Loai_Chup,
            'location' => $bc->Dia_Diem,
            'date' => $start?->format('Y-m-d'),
            'time' => $start?->format('H:i'),
            'endDate' => $end?->format('Y-m-d'),
            'endTime' => $end?->format('H:i'),
            'startDateTime' => $start?->format('Y-m-d H:i:s'),
            'endDateTime' => $end?->format('Y-m-d H:i:s'),
            'price' => $bc->Tong_Tien,
            'description' => $bc->Ghi_Chu ?? '',
            'services' => [], // TODO: Load từ bảng buoi_chup_dich_vu khi bảng được tạo
            'duration' => $duration,
            'guestCount' => $bc->So_Nguoi ?? '—',
            'specialRequests' => $bc->Yeu_Cau_Dac_Biet ?? '',
            'photos' => [
                'rawPhotos' => 0,
                'editedPhotos' => 0,
            ],
        ]);
    }
}