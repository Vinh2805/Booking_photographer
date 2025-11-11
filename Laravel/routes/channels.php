<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{Ma_TK}', function ($user, $Ma_TK) {
    // Kiểm tra user có phải là khách hàng hoặc nhiếp ảnh gia với Ma_TK này không
    $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
    $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
    
    if ($khachHang && $khachHang->Ma_KH === $Ma_TK) {
        return true;
    }
    
    if ($nag && $nag->Ma_NAG === $Ma_TK) {
        return true;
    }
    
    return false;
});

Broadcast::channel('chat.booking.{Ma_BC}', function ($user, $Ma_BC) {
    // Kiểm tra user có quyền truy cập buổi chụp này không
    $booking = \App\Models\BuoiChup::find($Ma_BC);
    if (!$booking) {
        return false;
    }
    
    $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
    $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
    
    if ($khachHang && $booking->Ma_KH === $khachHang->Ma_KH) {
        return true;
    }
    
    if ($nag && $booking->Ma_NAG === $nag->Ma_NAG) {
        return true;
    }
    
    return false;
});