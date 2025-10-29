<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use App\Models\BuoiChup;
use Illuminate\Support\Facades\DB;
use App\Models\TransactionLog;

class PhotoDownloadController extends Controller
{
    public function downloadOriginal(string $ma_bc)
    {
        return $this->handleDownload($ma_bc, 'original', 'Tải ảnh gốc');
    }

    public function downloadEdited(string $ma_bc)
    {
        return $this->handleDownload($ma_bc, 'edited', 'Tải ảnh hậu kỳ');
    }

    private function handleDownload(string $ma_bc, string $folder, string $type)
    {
        $booking = BuoiChup::where('Ma_BC', $ma_bc)->first();
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        }

        // Đường dẫn thư mục chứa ảnh
        $directory = storage_path("app/public/photos/{$folder}/{$ma_bc}");
        if (!is_dir($directory)) {
            return response()->json(['message' => "Không có ảnh trong thư mục {$folder} cho mã {$ma_bc}."], 404);
        }

        // Tên file ZIP xuất ra
        $zipFile = storage_path("app/public/downloads/{$folder}_{$ma_bc}.zip");

        // Nén toàn bộ thư mục
        $zip = new ZipArchive;
        if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
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

        // 🧾 Ghi log qua model TransactionLog
        TransactionLog::record(
            $ma_bc,
            $type,
            "Người dùng tải {$type} cho buổi chụp {$ma_bc}"
        );
        // 🟢 Nếu là tải ảnh hậu kỳ → cập nhật trạng thái buổi chụp
        if ($type === 'Tai anh hau ky') {
            $booking->Trang_Thai = 'Đã xử lý ảnh';
            $booking->save();
        }
        Log::info("{$type} thành công", [
            'ma_bc' => $ma_bc,
            'folder' => $folder,
            'file' => $zipFile,
        ]);

        // Trả file ZIP về FE
        return response()->download($zipFile)->deleteFileAfterSend(true);
    }
}
