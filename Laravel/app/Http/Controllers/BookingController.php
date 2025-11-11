<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\BuoiChup;
use App\Models\KhachHang;
use App\DTOs\YeuCauChupDTO;

class BookingController extends Controller
{
    public function createRequest(Request $request)
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

        $validated = $request->validate([
            'Ma_NAG' => 'required|string',
            'Loai_Chup' => 'nullable|string',
            'Dia_Diem' => 'nullable|string',
            'Bat_Dau_Chup' => 'required|date',
            'Ket_Thuc_Chup' => 'required|date|after:Bat_Dau_Chup',
            'Ghi_Chu' => 'nullable|string'
        ]);

        // Tự động lấy Ma_KH từ user đã đăng nhập
        $validated['Ma_KH'] = $khachHang->Ma_KH;

        $dto = new YeuCauChupDTO($validated);

        $booking = BuoiChup::create([
            'Ma_BC' => BuoiChup::generateMaBC(),
            'Ma_KH' => $dto->Ma_KH,
            'Ma_NAG' => $dto->Ma_NAG,
            'Loai_Chup' => $dto->Loai_Chup,
            'Dia_Diem' => $dto->Dia_Diem,
            'Bat_Dau_Chup' => $dto->Bat_Dau_Chup,
            'Ket_Thuc_Chup' => $dto->Ket_Thuc_Chup,
            'Ghi_Chu' => $dto->Ghi_Chu,
            'Trang_Thai' => 'Chờ xác nhận',
            'Tong_Tien' => 0
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Yêu cầu chụp đã được gửi thành công.',
            'data' => [
                'ma_buoi_chup' => $booking->Ma_BC,
                'trang_thai' => $booking->Trang_Thai
            ]
        ]);
    }
}
