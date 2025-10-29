<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\BuoiChup;
use ZipArchive;

class PhotoUploadController extends Controller
{
    public function upload(Request $request, string $ma_bc, string $type)
    {
        // ✅ Validate input
        $validated = $request->validate([
            'file' => 'required|file|mimes:zip|max:1024000', // tối đa 1GB
        ], [
            'file.required' => 'Vui lòng chọn file ZIP để upload.',
            'file.mimes' => 'Chỉ chấp nhận file ZIP.',
            'file.max' => 'File vượt quá dung lượng 1GB.',
        ]);

        // ✅ Tìm buổi chụp
       $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
if (!$booking) {
    $count = BuoiChup::count();
    return response()->json([
        'message' => 'Không tìm thấy buổi chụp.',
        'debug' => [
            'ma_bc' => $ma_bc,
            'type'=>$type,
            'total_buoi_chup' => $count,
            'db_name' => DB::connection()->getDatabaseName(),
        ]
    ], 404);
}


        // ✅ Xác định loại (original hoặc edited)
        $folder = $type === 'edited' ? 'edited' : 'original';

        // ✅ Tạo thư mục tạm để lưu file ZIP
        $uploadDir = "public/uploads/{$folder}/{$ma_bc}";
        Storage::makeDirectory($uploadDir);

        // ✅ Lưu file ZIP tạm
        $file = $request->file('file');
        $fileName = "{$folder}_{$ma_bc}_" . now()->format('Ymd_His') . ".zip";
        $zipPath = $file->storeAs($uploadDir, $fileName);

        // ✅ Đường dẫn thư mục đích sau khi giải nén
        $extractDir = storage_path("app/public/photos/{$folder}/{$ma_bc}");
        if (!is_dir($extractDir)) {
            mkdir($extractDir, 0777, true);
        }

        // ✅ Giải nén file ZIP
        $zip = new ZipArchive;
        if ($zip->open(storage_path("app/{$zipPath}")) === true) {
            $zip->extractTo($extractDir);
            $zip->close();
            // Xóa file ZIP sau khi giải nén
            Storage::delete($zipPath);
        } else {
            return response()->json(['message' => 'Không thể giải nén file ZIP.'], 500);
        }

        // ✅ Ghi log upload
        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $ma_bc,
            'Loai_Giao_Dich' => $folder === 'original' ? 'Upload anh goc' : 'Upload anh hau ky',
            'Mo_Ta' => "Upload & giải nén file {$fileName} cho buổi chụp {$ma_bc}",
            'created_at' => now(),
        ]);

        // ✅ Cập nhật trạng thái buổi chụp
        $booking->Trang_Thai = $folder === 'original' ? 'Chờ xử lý ảnh' : 'Chờ khách tải ảnh';
        $booking->save();

        Log::info("Upload & giải nén {$folder} thành công", [
            'ma_bc' => $ma_bc,
            'extract_to' => $extractDir,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Upload và giải nén ảnh {$folder} thành công!",
            'booking_code' => $ma_bc,
            'file_name' => $fileName,
            'saved_to' => $extractDir,
            'next_status' => $booking->Trang_Thai,
        ], 201);
    }
}
