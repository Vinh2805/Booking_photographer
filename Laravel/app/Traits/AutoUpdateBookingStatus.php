<?php

namespace App\Traits;

use App\Models\BuoiChup;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

trait AutoUpdateBookingStatus
{
    /**
     * Tự động cập nhật trạng thái booking dựa trên thời gian
     */
    protected function autoUpdateBookingStatus(): void
    {
        $now = Carbon::now();
        // Tính thời gian muộn cho phép: thời gian hiện tại trừ 30 phút
        $lateThreshold = $now->copy()->subMinutes(30);
        
        // 1. Hủy các buổi chụp muộn quá 30 phút (chưa bắt đầu)
        // Lưu ý: 
        // - Chỉ hủy những buổi chụp có Bat_Dau_Chup đã qua hơn 30 phút so với thời gian hiện tại
        // - Không hủy những buổi chụp đã từng được bắt đầu và kết thúc (session_ended = true)
        // - So sánh cả ngày và giờ để đảm bảo chính xác
        $lateBookings = BuoiChup::whereIn('Trang_Thai', ['Chờ thanh toán', 'Chờ xử lý ảnh', 'Sắp diễn ra', 'Chờ xác nhận', 'Chờ đặt cọc'])
            ->where('Bat_Dau_Chup', '<', $lateThreshold->toDateTimeString()) // Chỉ lấy những buổi chụp có thời gian bắt đầu đã qua hơn 30 phút
            ->get();
        
        foreach ($lateBookings as $booking) {
            // Kiểm tra xem buổi chụp đã từng được bắt đầu và kết thúc chưa
            $sessionEnded = false;
            if ($booking->Ghi_Chu) {
                try {
                    $ghiChuData = json_decode($booking->Ghi_Chu, true);
                    if (is_array($ghiChuData) && isset($ghiChuData['session_ended']) && $ghiChuData['session_ended'] === true) {
                        $sessionEnded = true;
                    }
                } catch (\Exception $e) {
                    // Nếu không parse được, bỏ qua
                }
            }
            
            // Nếu đã từng bắt đầu và kết thúc, bỏ qua (không tự động hủy)
            if ($sessionEnded) {
                continue;
            }
            
            // Parse thời gian bắt đầu, đảm bảo có timezone đúng
            $scheduledTime = $booking->Bat_Dau_Chup instanceof Carbon 
                ? $booking->Bat_Dau_Chup->copy() 
                : Carbon::parse($booking->Bat_Dau_Chup);
            
            // Tính số phút đã muộn (số âm nếu đã qua thời gian, số dương nếu chưa đến)
            // $minutesLate sẽ là số âm nếu thời gian đã qua
            $minutesLate = $now->diffInMinutes($scheduledTime, false);
            
            // Chỉ hủy nếu thời gian bắt đầu đã qua hơn 30 phút (tức là muộn quá 30 phút)
            // Điều kiện: $scheduledTime < $now - 30 phút, tương đương với $minutesLate < -30
            // Nhưng để chắc chắn, ta so sánh trực tiếp với thời gian
            if ($scheduledTime->lt($lateThreshold)) {
                $booking->Trang_Thai = 'Đã hủy';
                $booking->Ly_Do_Huy = 'Tự động hủy do muộn quá 30 phút so với thời gian hẹn';
                $booking->save();
                
                // Ghi log với thông tin chi tiết
                DB::table('lich_su_giao_dich')->insert([
                    'Ma_BC' => $booking->Ma_BC,
                    'Loai_Giao_Dich' => 'Da huy',
                    'Mo_Ta' => "Tự động hủy do muộn quá 30 phút. Thời gian hẹn: {$scheduledTime->format('d/m/Y H:i')}, Thời gian hiện tại: {$now->format('d/m/Y H:i')}, Đã muộn: " . abs($minutesLate) . " phút",
                    'Thoi_Gian' => $now
                ]);
            }
        }
        
        // 2. Hoàn thành các buổi chụp đã qua thời gian kết thúc
        $endedBookings = BuoiChup::whereIn('Trang_Thai', ['Đang diễn ra', 'Chờ xử lý ảnh'])
            ->get();
        
        foreach ($endedBookings as $booking) {
            $endTime = $booking->Ket_Thuc_Chup instanceof Carbon 
                ? $booking->Ket_Thuc_Chup 
                : Carbon::parse($booking->Ket_Thuc_Chup);
            
            // Nếu đã qua thời gian kết thúc
            if ($now->greaterThan($endTime)) {
                if ($booking->Trang_Thai === 'Đang diễn ra') {
                    // Nếu đang diễn ra → chuyển sang "Chờ xử lý ảnh"
                    $booking->Trang_Thai = 'Chờ xử lý ảnh';
                    $booking->save();
                } elseif ($booking->Trang_Thai === 'Chờ xử lý ảnh') {
                    // Nếu đã xử lý ảnh → chuyển sang "Đã hoàn thành"
                    $booking->Trang_Thai = 'Đã hoàn thành';
                    $booking->save();
                }
            }
        }
    }
}

