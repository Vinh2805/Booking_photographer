<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Thêm trường Loai_TK vào bảng khach_hang
        Schema::table('khach_hang', function (Blueprint $table) {
            $table->enum('Loai_TK', ['Nhiếp ảnh gia', 'Khách hàng'])->nullable()->after('Ma_TK');
        });

        // Thêm trường Loai_TK vào bảng nhiep_anh_gia
        Schema::table('nhiep_anh_gia', function (Blueprint $table) {
            $table->enum('Loai_TK', ['Nhiếp ảnh gia', 'Khách hàng'])->nullable()->after('Ma_TK');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa trường Loai_TK khỏi bảng khach_hang
        Schema::table('khach_hang', function (Blueprint $table) {
            $table->dropColumn('Loai_TK');
        });

        // Xóa trường Loai_TK khỏi bảng nhiep_anh_gia
        Schema::table('nhiep_anh_gia', function (Blueprint $table) {
            $table->dropColumn('Loai_TK');
        });
    }
};
