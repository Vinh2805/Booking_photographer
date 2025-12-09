<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WalletTransaction;
use App\Models\TransactionLog;
use App\Models\BuoiChup;
use App\Models\NhiepAnhGia;
use App\Models\KhachHang;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $notifications = collect();
        $maNguoiDung = null;
        $bookingIds = [];
        $isPhotographer = false;

        // 1. Xác định User là NAG hay Khách hàng
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if ($nag) {
            $maNguoiDung = $nag->Ma_NAG;
            $bookingIds = BuoiChup::where('Ma_NAG', $maNguoiDung)->pluck('Ma_BC')->toArray();
            $isPhotographer = true;
        } else {
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if ($khachHang) {
                $maNguoiDung = $khachHang->Ma_KH;
                $bookingIds = BuoiChup::where('Ma_KH', $maNguoiDung)->pluck('Ma_BC')->toArray();
            }
        }

        if (!$maNguoiDung) {
             return response()->json(['data' => []]);
        }

        // 2. Lấy log Ví (WalletTransaction)
        $walletLogs = WalletTransaction::where('Ma_Nguoi_Dung', $maNguoiDung)
            ->orderBy('Thoi_Gian', 'desc')
            ->take(20)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => 'wallet_' . $log->id,
                    'type' => 'wallet',
                    'title' => 'Giao dịch ví',
                    'message' => $this->formatWalletMessage($log),
                    'created_at' => $log->Thoi_Gian,
                    'icon' => 'wallet',
                    'action_url' => '/wallet'
                ];
            });
        $notifications = $notifications->merge($walletLogs);

        // 3. Lấy log Hoạt động (TransactionLog - lich_su_giao_dich) từ các booking liên quan
        if (!empty($bookingIds)) {
            $activityLogs = TransactionLog::whereIn('Ma_BC', $bookingIds)
                ->orderBy('Thoi_Gian', 'desc')
                ->take(20)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => 'activity_' . $log->id,
                        'type' => 'activity',
                        'title' => 'Hoạt động buổi chụp',
                        'message' => $this->formatActivityMessage($log),
                        'created_at' => $log->Thoi_Gian,
                        'icon' => 'camera',
                        'action_url' => '/booking/' . $log->Ma_BC
                    ];
                });
            $notifications = $notifications->merge($activityLogs);
        }

        // 4. (Tùy chọn) Thông báo Booking mới (chỉ cho NAG) nếu chưa có log
        if ($isPhotographer) {
            $newRequests = BuoiChup::where('Ma_NAG', $maNguoiDung)
                ->where('Trang_Thai', 'Chờ xác nhận')
                ->orderBy('Ngay_Tao', 'desc')
                ->take(5)
                ->get()
                ->map(function ($bc) {
                    return [
                        'id' => 'new_req_' . $bc->Ma_BC,
                        'type' => 'booking_request',
                        'title' => 'Yêu cầu chụp mới',
                        'message' => "Bạn có yêu cầu chụp mới từ khách hàng tại {$bc->Dia_Diem}",
                        'created_at' => $bc->Ngay_Tao,
                        'icon' => 'calendar-plus',
                        'action_url' => '/booking/' . $bc->Ma_BC
                    ];
                });
            $notifications = $notifications->merge($newRequests);
             
            // Thông báo Đánh giá mới
            $newReviews = DB::table('danh_gia')
                ->where('Ma_NAG', $maNguoiDung)
                ->orderBy('Ngay_ĐG', 'desc')
                ->take(5)
                ->get()
                ->map(function ($rv) {
                    return [
                        'id' => 'review_' . $rv->Ma_ĐG,
                        'type' => 'review',
                        'title' => 'Đánh giá mới',
                        'message' => "Bạn nhận được đánh giá {$rv->So_Sao} sao",
                        'created_at' => $rv->Ngay_ĐG,
                        'icon' => 'star',
                        'action_url' => '/profile'
                    ];
                });
             $notifications = $notifications->merge($newReviews);
        }

        // 5. Sắp xếp và trả về
        $sortedNotifications = $notifications->sortByDesc('created_at')->values();

        return response()->json([
            'success' => true,
            'data' => $sortedNotifications
        ]);
    }

    private function formatWalletMessage($log)
    {
        $amount = number_format($log->So_Tien, 0, ',', '.');
        switch ($log->Loai_Giao_Dich) {
            case 'nap_tien': return "Bạn đã nạp {$amount}đ vào ví";
            case 'rut_tien': return "Bạn đã rút {$amount}đ khỏi ví";
            case 'thanh_toan': return "Thanh toán {$amount}đ cho dịch vụ";
            case 'nhan_tien': return "Nhận {$amount}đ từ khách hàng";
            default: return "Giao dịch {$amount}đ: {$log->Ghi_Chu}";
        }
    }

    private function formatActivityMessage($log)
    {
        $desc = $log->Mo_Ta ? "($log->Mo_Ta)" : "";
        switch ($log->Loai_Giao_Dich) {
            case 'Dat coc': return "Đã đặt cọc cho buổi chụp {$log->Ma_BC}";
            case 'Thanh toan': return "Thanh toán hoàn tất cho buổi chụp {$log->Ma_BC}";
            case 'Upload anh goc': return "Đã tải lên ảnh gốc cho {$log->Ma_BC} $desc";
            case 'Upload anh hau ki': return "Đã tải lên ảnh hậu kỳ cho {$log->Ma_BC} $desc";
            case 'Da huy': return "Buổi chụp {$log->Ma_BC} đã bị hủy";
            default: return "Cập nhật {$log->Ma_BC}: {$log->Loai_Giao_Dich}";
        }
    }
}
