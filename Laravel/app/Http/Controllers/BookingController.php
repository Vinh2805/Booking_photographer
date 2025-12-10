<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\BuoiChup;
use App\Models\KhachHang;
use App\Models\DichVu;
use App\DTOs\YeuCauChupDTO;
use Carbon\Carbon;

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
            'Tieu_De' => 'nullable|string|max:255',
            'The_Loai_Chup' => 'required|string', // JSON string
            'Boi_Canh_Chup' => 'required|exists:dich_vu,Ten_DV',
            'Dia_Diem' => 'required|string|max:255',
            'Bat_Dau_Chup' => 'required|date|after:now',
            'Ket_Thuc_Chup' => 'required|date|after:Bat_Dau_Chup',
            'Ghi_Chu' => 'nullable|string',
            'Dich_Vu' => 'nullable|string', // JSON string
            'Tong_Tien' => 'required|numeric|min:0',
            'Anh_Minh_Hoa' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        ], [
            'Bat_Dau_Chup.after' => 'Thời gian bắt đầu phải trong tương lai. Không thể đặt lịch ở quá khứ.',
            'Ket_Thuc_Chup.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ]);

        // Tự động lấy Ma_KH từ user đã đăng nhập
        $validated['Ma_KH'] = $khachHang->Ma_KH;

        // Parse datetime strings để đảm bảo đúng timezone (Asia/Ho_Chi_Minh)
        // Format từ frontend: "YYYY-MM-DD HH:mm:ss" (local time, không có timezone)
        if (isset($validated['Bat_Dau_Chup'])) {
            try {
                $validated['Bat_Dau_Chup'] = Carbon::createFromFormat('Y-m-d H:i:s', $validated['Bat_Dau_Chup'], 'Asia/Ho_Chi_Minh')
                    ->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                // Nếu format không đúng, thử parse tự động
                $validated['Bat_Dau_Chup'] = Carbon::parse($validated['Bat_Dau_Chup'], 'Asia/Ho_Chi_Minh')
                    ->format('Y-m-d H:i:s');
            }
        }
        if (isset($validated['Ket_Thuc_Chup'])) {
            try {
                $validated['Ket_Thuc_Chup'] = Carbon::createFromFormat('Y-m-d H:i:s', $validated['Ket_Thuc_Chup'], 'Asia/Ho_Chi_Minh')
                    ->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                // Nếu format không đúng, thử parse tự động
                $validated['Ket_Thuc_Chup'] = Carbon::parse($validated['Ket_Thuc_Chup'], 'Asia/Ho_Chi_Minh')
                    ->format('Y-m-d H:i:s');
            }
        }

        // Parse JSON fields
        $theLoaiChup = json_decode($validated['The_Loai_Chup'], true);
        if (!is_array($theLoaiChup) || empty($theLoaiChup)) {
            return response()->json(['message' => 'Vui lòng chọn ít nhất một thể loại chụp ảnh'], 422);
        }

        $dichVu = [];
        if (!empty($validated['Dich_Vu'])) {
            $dichVu = json_decode($validated['Dich_Vu'], true);
            if (!is_array($dichVu)) {
                $dichVu = [];
            }
        }

        // Check for conflicting bookings - chỉ kiểm tra các trạng thái bận
        // Các trạng thái trống (có thể đặt): "Chờ xác nhận", "Đã hủy"
        // Các trạng thái bận (không thể đặt): tất cả các trạng thái khác
        $conflictingBooking = BuoiChup::where('Ma_NAG', $validated['Ma_NAG'])
            ->whereNotIn('Trang_Thai', ['Chờ xác nhận', 'Đã hủy'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('Bat_Dau_Chup', [$validated['Bat_Dau_Chup'], $validated['Ket_Thuc_Chup']])
                    ->orWhereBetween('Ket_Thuc_Chup', [$validated['Bat_Dau_Chup'], $validated['Ket_Thuc_Chup']])
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('Bat_Dau_Chup', '<=', $validated['Bat_Dau_Chup'])
                          ->where('Ket_Thuc_Chup', '>=', $validated['Ket_Thuc_Chup']);
                    });
            })
            ->first();

        if ($conflictingBooking) {
            return response()->json([
                'message' => 'Thời gian này đã được đặt. Vui lòng chọn thời gian khác.'
            ], 409);
        }

        // Handle image upload
        $anhMinhHoa = null;
        if ($request->hasFile('Anh_Minh_Hoa')) {
            $file = $request->file('Anh_Minh_Hoa');
            $fileName = 'booking_' . $user->Ma_TK . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/bookings', $fileName, 'local');
            $anhMinhHoa = '/storage/bookings/' . $fileName;
        }

        DB::beginTransaction();
        try {
            $booking = BuoiChup::create([
                'Ma_BC' => BuoiChup::generateMaBC(),
                'Ma_KH' => $validated['Ma_KH'],
                'Ma_NAG' => $validated['Ma_NAG'],
                'Tieu_De' => $validated['Tieu_De'] ?? null,
                'The_Loai_Chup' => json_encode($theLoaiChup),
                'Boi_Canh_Chup' => $validated['Boi_Canh_Chup'],
                'Dia_Diem' => $validated['Dia_Diem'],
                'Bat_Dau_Chup' => $validated['Bat_Dau_Chup'],
                'Ket_Thuc_Chup' => $validated['Ket_Thuc_Chup'],
                'Ghi_Chu' => $validated['Ghi_Chu'] ?? null,
                'Anh_Minh_Hoa' => $anhMinhHoa,
                'Trang_Thai' => 'Chờ xác nhận',
                'Tong_Tien' => $validated['Tong_Tien'],
                'Ti_Le_Coc' => 30.00 // Tỉ lệ đặt cọc mặc định 30%
            ]);

            // Attach services
            if (!empty($dichVu)) {
                foreach ($dichVu as $maDV) {
                    DB::table('buoi_chup_dich_vu')->insert([
                        'Ma_BC' => $booking->Ma_BC,
                        'Ma_DV' => $maDV,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Yêu cầu chụp đã được gửi thành công.',
                'data' => [
                    'ma_buoi_chup' => $booking->Ma_BC,
                    'trang_thai' => $booking->Trang_Thai
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi tạo yêu cầu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách dịch vụ
     */
    public function getServices()
    {
        $services = DichVu::where('Hoat_Dong', true)
            ->orderBy('Ten_DV')
            ->get(['Ma_DV', 'Ten_DV', 'Mo_Ta', 'Gia', 'Loai_DV']);

        return response()->json($services);
    }
}
