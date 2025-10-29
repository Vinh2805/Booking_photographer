<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use App\Models\BuoiChup;

class PhotoDownloadController extends Controller
{
    public function download(string $type, string $ma_bc)
    {
        // 1️⃣ Xác định loại ảnh
        $folder = $type === 'edited' ? 'edited' : 'original';
        $typeLabel = $folder === 'edited' ? 'Tải ảnh hậu kỳ' : 'Tải ảnh gốc';

        // 2️⃣ Tìm buổi chụp
        $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        }

        // 3️⃣ Đường dẫn thư mục ảnh
        $directory = storage_path("app/private/public/uploads/{$folder}/{$ma_bc}");
        if (!is_dir($directory)) {
            return response()->json(['message' => "Không tìm thấy ảnh trong thư mục {$folder} cho buổi chụp {$ma_bc}."], 404);
        }

        // 4️⃣ Tạo file ZIP tạm thời
        $zipFileName = "{$folder}_{$ma_bc}_" . now()->format('Ymd_His') . ".zip";
        $zipFilePath = storage_path("app/public/downloads/{$zipFileName}");
        if (!is_dir(dirname($zipFilePath))) {
            mkdir(dirname($zipFilePath), 0755, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($directory) + 1);
                    $zip->addFile($filePath, $relativePath);
                }
            }
            $zip->close();
        } else {
            return response()->json(['message' => 'Không thể tạo file ZIP.'], 500);
        }

        // 5️⃣ Ghi log giao dịch tải ảnh
        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $ma_bc,
            'Loai_Giao_Dich' => $folder === 'edited' ? 'Tai anh hau ky' : 'Tai anh goc',
            'Mo_Ta' => "{$typeLabel} cho buổi chụp {$ma_bc}",
            'Thoi_Gian' => now(),
        ]);

        // 6️⃣ Cập nhật trạng thái buổi chụp
        if ($folder === 'edited') {
            $booking->Trang_Thai = 'Đã xử lý ảnh';
            $booking->save();
        }

        // 7️⃣ Trả file về FE
        Log::info("{$typeLabel} thành công", [
            'ma_bc' => $ma_bc,
            'folder' => $folder,
            'file' => $zipFileName,
        ]);

        return response()->download($zipFilePath)->deleteFileAfterSend(true);
    }
}
