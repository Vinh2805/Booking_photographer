<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\BuoiChup;
use App\Models\NhiepAnhGia;
use App\Models\KhachHang;

class BookingChangeApprovalController extends Controller
{
    // ✅ Duyệt yêu cầu thay đổi
    public function approve(Request $request, int $id)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $yeuCau = DB::table('yeu_cau_thay_doi')->where('id', $id)->first();
        if (!$yeuCau) return response()->json(['message' => 'Không tìm thấy yêu cầu thay đổi.'], 404);

        $changes = json_decode($yeuCau->Danh_Sach_Thay_Doi, true);
        $booking = BuoiChup::find($yeuCau->Ma_BC);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);

        // Xác định người duyệt: phải là người còn lại (không phải người gửi)
        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        
        $nguoiDuyet = null;
        $coQuyenDuyet = false;
        
        if ($yeuCau->Nguoi_Gui === 'customer') {
            // Nếu khách hàng gửi → nhiếp ảnh gia duyệt
            if ($nag && $booking->Ma_NAG === $nag->Ma_NAG) {
                $nguoiDuyet = 'photographer';
                $coQuyenDuyet = true;
            }
        } elseif ($yeuCau->Nguoi_Gui === 'photographer') {
            // Nếu nhiếp ảnh gia gửi → khách hàng duyệt
            if ($khachHang && $booking->Ma_KH === $khachHang->Ma_KH) {
                $nguoiDuyet = 'customer';
                $coQuyenDuyet = true;
            }
        }
        
        if (!$coQuyenDuyet) {
            return response()->json(['message' => 'Bạn không có quyền duyệt yêu cầu thay đổi này'], 403);
        }

        // Kiểm tra lịch trống nếu có thay đổi thời gian
        if (isset($changes['Bat_Dau_Chup']) || isset($changes['Ket_Thuc_Chup'])) {
            // Xác định thời gian mới
            $batDauMoi = isset($changes['Bat_Dau_Chup']) 
                ? Carbon::parse($changes['Bat_Dau_Chup']['moi'])
                : Carbon::parse($booking->Bat_Dau_Chup);
            $ketThucMoi = isset($changes['Ket_Thuc_Chup'])
                ? Carbon::parse($changes['Ket_Thuc_Chup']['moi'])
                : Carbon::parse($booking->Ket_Thuc_Chup);

            // Kiểm tra thời gian phải trong tương lai
            if ($batDauMoi->isPast()) {
                return response()->json([
                    'message' => 'Thời gian bắt đầu phải trong tương lai. Không thể đặt lịch ở quá khứ.'
                ], 422);
            }

            if ($ketThucMoi->isPast()) {
                return response()->json([
                    'message' => 'Thời gian kết thúc phải trong tương lai. Không thể đặt lịch ở quá khứ.'
                ], 422);
            }

            // Kiểm tra xem thời gian mới có trùng với buổi chụp bận khác không (loại trừ buổi chụp hiện tại)
            $conflictingBooking = BuoiChup::where('Ma_NAG', $booking->Ma_NAG)
                ->where('Ma_BC', '!=', $booking->Ma_BC) // Loại trừ buổi chụp hiện tại
                ->whereNotIn('Trang_Thai', ['Chờ xác nhận', 'Đã hủy']) // Chỉ kiểm tra các trạng thái bận
                ->where(function ($query) use ($batDauMoi, $ketThucMoi) {
                    $query->whereBetween('Bat_Dau_Chup', [$batDauMoi, $ketThucMoi])
                        ->orWhereBetween('Ket_Thuc_Chup', [$batDauMoi, $ketThucMoi])
                        ->orWhere(function ($q) use ($batDauMoi, $ketThucMoi) {
                            $q->where('Bat_Dau_Chup', '<=', $batDauMoi)
                              ->where('Ket_Thuc_Chup', '>=', $ketThucMoi);
                        });
                })
                ->first();

            if ($conflictingBooking) {
                return response()->json([
                    'message' => 'Thời gian mới đã được đặt bởi buổi chụp khác. Vui lòng chọn thời gian khác.',
                    'conflicting_booking' => [
                        'ma_bc' => $conflictingBooking->Ma_BC,
                        'bat_dau' => $conflictingBooking->Bat_Dau_Chup,
                        'ket_thuc' => $conflictingBooking->Ket_Thuc_Chup,
                        'trang_thai' => $conflictingBooking->Trang_Thai,
                    ]
                ], 409);
            }
        }

        DB::transaction(function () use ($booking, $changes, $yeuCau) {
            foreach ($changes as $field => $pair) {
                if (isset($pair['moi'])) {
                    $newValue = $pair['moi'];
                    
                    // Convert giá trị theo đúng kiểu dữ liệu của field
                    if (in_array($field, ['Bat_Dau_Chup', 'Ket_Thuc_Chup'])) {
                        // Đảm bảo là Carbon instance hoặc datetime string
                        $booking->$field = Carbon::parse($newValue);
                    } elseif (in_array($field, ['Tong_Tien', 'Ti_Le_Coc'])) {
                        // Đảm bảo là decimal
                        $booking->$field = (float) $newValue;
                    } else {
                        // String fields
                        $booking->$field = (string) $newValue;
                    }
                }
            }
            $booking->Ly_Do_Thay_Doi = $yeuCau->Ly_Do;
            $booking->Trang_Thai = 'Thay đổi';
            $booking->save();

            DB::table('yeu_cau_thay_doi')->where('id', $yeuCau->id)->update([
                'Trang_Thai' => 'Đã duyệt'
            ]);

            DB::table('lich_su_giao_dich')->insert([
                'Ma_BC' => $booking->Ma_BC,
                'Loai_Giao_Dich' => 'Thay doi',
                'Mo_Ta' => "Đã duyệt yêu cầu thay đổi buổi chụp {$booking->Ma_BC}. Cập nhật: " . json_encode($changes, JSON_UNESCAPED_UNICODE),
                'Thoi_Gian' => now()
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Yêu cầu thay đổi đã được duyệt và cập nhật vào buổi chụp.',
            'icon' => '✅'
        ]);
    }

    // ❌ Từ chối yêu cầu thay đổi
    public function reject(Request $request, int $id)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $lyDo = $request->input('ly_do') ?? 'Không có lý do cụ thể';
        $yeuCau = DB::table('yeu_cau_thay_doi')->where('id', $id)->first();
        if (!$yeuCau) return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);

        $booking = BuoiChup::find($yeuCau->Ma_BC);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);

        // Xác định người từ chối: phải là người còn lại (không phải người gửi)
        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        
        $coQuyenTuChoi = false;
        
        if ($yeuCau->Nguoi_Gui === 'customer') {
            // Nếu khách hàng gửi → nhiếp ảnh gia từ chối
            if ($nag && $booking->Ma_NAG === $nag->Ma_NAG) {
                $coQuyenTuChoi = true;
            }
        } elseif ($yeuCau->Nguoi_Gui === 'photographer') {
            // Nếu nhiếp ảnh gia gửi → khách hàng từ chối
            if ($khachHang && $booking->Ma_KH === $khachHang->Ma_KH) {
                $coQuyenTuChoi = true;
            }
        }
        
        if (!$coQuyenTuChoi) {
            return response()->json(['message' => 'Bạn không có quyền từ chối yêu cầu thay đổi này'], 403);
        }

        DB::table('yeu_cau_thay_doi')->where('id', $id)->update(['Trang_Thai' => 'Từ chối']);

        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $yeuCau->Ma_BC,
            'Loai_Giao_Dich' => 'Thay doi',
            'Mo_Ta' => "Yêu cầu thay đổi buổi chụp {$yeuCau->Ma_BC} bị từ chối. Lý do: {$lyDo}",
            'Thoi_Gian' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã từ chối yêu cầu thay đổi buổi chụp.',
            'icon' => '❌'
        ]);
    }
}
