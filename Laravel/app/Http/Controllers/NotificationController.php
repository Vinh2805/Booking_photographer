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
        $isAdmin = $user->Loai_TK === 'Admin'; // Check if user is Admin

        if ($isAdmin) {
             // === LOGIC CHO ADMIN ===
             // 1. Lấy thông tin Admin
             $admin = \App\Models\Admin::where('Ma_TK', $user->Ma_TK)->first();
             if ($admin) {
                 // a. Lấy log Ví Admin
                 $walletLogs = WalletTransaction::where('Loai_Nguoi_Dung', 'admin')
                    ->where('Ma_Nguoi_Dung', $admin->Ma_Admin)
                    ->orderBy('Thoi_Gian', 'desc')
                    ->take(10)
                    ->get()
                    ->map(function ($log) {
                        return [
                            'id' => 'wallet_' . $log->id,
                            'type' => 'wallet',
                            'title' => 'Biến động số dư Admin',
                            'message' => $this->formatWalletMessage($log),
                            'created_at' => $log->Thoi_Gian,
                            'icon' => 'wallet',
                            'action_url' => '/wallet'
                        ];
                    });
                 $notifications = $notifications->merge($walletLogs);
             }

             // b. Thông báo Booking mới (toàn hệ thống)
             $newRequests = BuoiChup::where('Trang_Thai', 'Chờ xác nhận')
                ->orderBy('Ngay_Tao', 'desc')
                ->take(5)
                ->get()
                ->map(function ($bc) {
                    return [
                        'id' => 'new_req_' . $bc->Ma_BC,
                        'type' => 'booking_request',
                        'title' => 'Yêu cầu đặt lịch mới',
                        'message' => "Khách hàng đặt lịch tại {$bc->Dia_Diem}. Mã: {$bc->Ma_BC}",
                        'created_at' => $bc->Ngay_Tao,
                        'icon' => 'calendar',
                        'action_url' => '/bookings'
                    ];
                });
             $notifications = $notifications->merge($newRequests);

             // c. Thông báo Đánh giá thấp (Cảnh báo)
             $lowReviews = DB::table('danh_gia')
                ->where('So_Sao', '<=', 3)
                ->orderBy('Ngay_ĐG', 'desc')
                ->take(5)
                ->get()
                ->map(function ($rv) {
                    return [
                        'id' => 'review_' . $rv->Ma_ĐG,
                        'type' => 'review',
                        'title' => 'Cảnh báo: Đánh giá thấp',
                        'message' => "Có đánh giá {$rv->So_Sao} sao cho Booking {$rv->Ma_BC}",
                        'created_at' => $rv->Ngay_ĐG,
                        'icon' => 'star',
                        'action_url' => '/photographers'
                    ];
                });
             $notifications = $notifications->merge($lowReviews);

        } else {
            // === LOGIC CHO USER THƯỜNG (NAG/KH) ===
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
