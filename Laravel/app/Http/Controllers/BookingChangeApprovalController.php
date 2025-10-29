<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\BuoiChup;

class BookingChangeApprovalController extends Controller
{
    // ✅ Duyệt yêu cầu thay đổi
    public function approve(int $id)
    {
        $yeuCau = DB::table('yeu_cau_thay_doi')->where('id', $id)->first();
        if (!$yeuCau) return response()->json(['message' => 'Không tìm thấy yêu cầu thay đổi.'], 404);

        $changes = json_decode($yeuCau->Danh_Sach_Thay_Doi, true);
        $booking = BuoiChup::find($yeuCau->Ma_BC);
        if (!$booking) return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);

        DB::transaction(function () use ($booking, $changes, $yeuCau) {
            foreach ($changes as $field => $pair) {
                if (isset($pair['moi']) && property_exists($booking, $field)) {
                    $booking->$field = $pair['moi'];
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
    public function reject(int $id, Request $request)
    {
        $lyDo = $request->input('ly_do') ?? 'Không có lý do cụ thể';
        $yeuCau = DB::table('yeu_cau_thay_doi')->where('id', $id)->first();
        if (!$yeuCau) return response()->json(['message' => 'Không tìm thấy yêu cầu.'], 404);

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
