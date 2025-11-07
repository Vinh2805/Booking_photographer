<?php

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use App\Models\KhachHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerBookingController extends Controller
{
    // Map trạng thái frontend → backend
    private function mapStatusToDb($status)
    {
        return match ($status) {
            'pending_confirmation' => 'cho_xac_nhan',
            'pending_deposit' => 'cho_dat_coc',
            'upcoming' => 'sap_dien_ra',
            'ongoing' => 'dang_dien_ra',
            'pending_payment' => 'cho_thanh_toan',
            'pending_processing' => 'cho_xu_ly_anh',
            'photos_ready' => 'da_xu_ly_anh',
            'completed' => 'hoan_thanh',
            'cancelled' => 'da_huy',
            default => null,
        };
    }

    private function mapStatusToFrontend($status)
    {
        return match ($status) {
            'cho_xac_nhan' => 'pending_confirmation',
            'cho_dat_coc' => 'pending_deposit',
            'sap_dien_ra' => 'upcoming',
            'dang_dien_ra' => 'ongoing',
            'cho_thanh_toan' => 'pending_payment',
            'cho_xu_ly_anh' => 'pending_processing',
            'da_xu_ly_anh' => 'photos_ready',
            'hoan_thanh' => 'completed',
            'da_huy' => 'cancelled',
            default => 'pending_confirmation',
        };
    }

    /**
     * Lấy danh sách buổi chụp của khách hàng
     */
    public function index(Request $request)
{
    $user = Auth::guard('sanctum')->user();
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    $khachHang = KhachHang::where('Ma_TK', $user->id)->first();
    if (!$khachHang) {
        return response()->json(['message' => 'Khách hàng không tồn tại'], 404);
    }

    $query = BuoiChup::with(['nhaNhiepAnh', 'dichVu'])
        ->withCount([
            'anh as raw_photos_count' => fn($q) => $q->where('Loai', 'raw'),
            'anh as edited_photos_count' => fn($q) => $q->where('Loai', 'edited'),
        ])
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
              ->orWhereHas('nhaNhiepAnh', fn($q) => $q->where('Ten_NAG', 'like', "%{$search}%"));
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

        return [
            'id' => $bc->Ma_BC,
            'status' => $this->mapStatusToFrontend($bc->Trang_Thai),
            'title' => $bc->Loai_Chup . ' - ' . $bc->Dia_Diem,
            'photographer' => [
                'name' => $bc->nhaNhiepAnh?->Ten_NAG ?? 'Chưa chỉ định',
                'avatar' => $bc->nhaNhiepAnh?->Avatar ?? '',
                'rating' => $bc->nhaNhiepAnh?->Danh_Gia ?? 0,
                'completedSessions' => $bc->nhaNhiepAnh?->So_Buoi_Hoan_Thanh ?? 0,
            ],
            'type' => $bc->Loai_Chup,
            'location' => $bc->Dia_Diem,
            'date' => $start?->format('Y-m-d'),
            'time' => $start?->format('H:i'),
            'price' => $bc->Tong_Tien,
            'description' => $bc->Ghi_Chu ?? '',
            'services' => $bc->dichVu->pluck('Ten_DV')->toArray(),
            'duration' => $duration,
            'guestCount' => $bc->So_Nguoi ?: '—',
            'specialRequests' => $bc->Yeu_Cau_Dac_Biet ?? '',
            'photos' => [
                'rawPhotos' => $bc->raw_photos_count ?? 0,
                'editedPhotos' => $bc->edited_photos_count ?? 0,
            ],
        ];
    }));
}

    /**
     * Chi tiết buổi chụp
     */
    public function show($id)
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        $khachHang = KhachHang::where('Ma_TK', $user->id)->first();
        if (!$khachHang) return response()->json(['message' => 'Khách hàng không tồn tại'], 404);

        $bc = BuoiChup::with(['nhaNhiepAnh', 'dichVu', 'anh'])
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
                'name' => $bc->nhaNhiepAnh?->Ten_NAG ?? 'Chưa chỉ định',
                'avatar' => $bc->nhaNhiepAnh?->Avatar ?? '',
                'rating' => $bc->nhaNhiepAnh?->Danh_Gia ?? 0,
                'completedSessions' => $bc->nhaNhiepAnh?->So_Buoi_Hoan_Thanh ?? 0,
            ],
            'type' => $bc->Loai_Chup,
            'location' => $bc->Dia_Diem,
            'date' => $start?->format('Y-m-d'),
            'time' => $start?->format('H:i'),
            'price' => $bc->Tong_Tien,
            'description' => $bc->Ghi_Chu ?? '',
            'services' => $bc->dichVu->pluck('Ten_DV')->toArray(),
            'duration' => $duration,
            'guestCount' => $bc->So_Nguoi ?? '—',
            'specialRequests' => $bc->Yeu_Cau_Dac_Biet ?? '',
            'photos' => [
                'rawPhotos' => $bc->anh()->where('Loai', 'raw')->count(),
                'editedPhotos' => $bc->anh()->where('Loai', 'edited')->count(),
            ],
        ]);
    }
}