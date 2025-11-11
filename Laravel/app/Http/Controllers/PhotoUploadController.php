<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\BuoiChup;
use App\Models\NhiepAnhGia;

class PhotoUploadController extends Controller
{
    public function upload(Request $request, string $type, string $ma_bc)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra user là nhiếp ảnh gia
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if (!$nag) {
            return response()->json(['message' => 'Bạn không phải nhiếp ảnh gia'], 403);
        }

        // ✅ Validate input
        $validated = $request->validate([
            'file' => 'required|file|mimes:zip|max:1024000', // 1GB = 1,000,000 KB
            'description' => 'nullable|string|max:255',
        ], [
            'file.required' => 'Vui lòng chọn file ZIP để upload.',
            'file.mimes' => 'Chỉ chấp nhận định dạng .zip.',
            'file.max' => 'File vượt quá dung lượng cho phép (1GB).',
        ]);

        // ✅ Kiểm tra buổi chụp
        $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        }

        // Kiểm tra buổi chụp thuộc về nhiếp ảnh gia này
        if ($booking->Ma_NAG !== $nag->Ma_NAG) {
            return response()->json(['message' => 'Bạn không có quyền upload ảnh cho buổi chụp này'], 403);
        }

        // ✅ Xác định loại ảnh (gốc / hậu kỳ)
        $folder = $type === 'edited' ? 'edited' : 'original';
        $dir = "public/uploads/{$folder}/{$ma_bc}";
        Storage::makeDirectory($dir);

        // ✅ Lưu file ZIP
        $file = $request->file('file');
        $fileName = "{$folder}_{$ma_bc}_" . now()->format('Ymd_His') . '.zip';
        $path = Storage::putFileAs($dir, $file, $fileName);

        // ✅ Ghi log upload vào bảng `lich_su_giao_dich`
        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $ma_bc,
            'Loai_Giao_Dich' => $folder === 'original' ? 'Upload anh goc' : 'Upload anh hau ki',
            'Mo_Ta' => "Upload file ZIP {$fileName} cho buổi chụp {$ma_bc}",
            'Thoi_Gian' => now(),
        ]);

        // ✅ Cập nhật trạng thái buổi chụp
        // Chỉ cập nhật thành "Đã xử lý ảnh" khi upload ảnh hậu kỳ (edited)
        if ($folder === 'edited') {
            $booking->Trang_Thai = 'Đã xử lý ảnh';
            $booking->save();
        }
        // Nếu upload ảnh gốc (raw), giữ nguyên trạng thái hiện tại (Chờ xử lý ảnh)

        Log::info("Upload {$folder} thành công", [
            'ma_bc' => $ma_bc,
            'file' => $fileName,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Upload thành công!',
            'file_name' => $fileName,
            'booking_code' => $ma_bc,
            'type' => $folder,
            'next_status' => $booking->Trang_Thai,
        ], 201);
    }
}
