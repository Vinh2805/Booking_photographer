<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buoi_chup', function (Blueprint $table) {
            $table->string('Ma_BC', 20)->primary();
            $table->string('Ma_NAG', 20)->nullable();
            $table->string('Ma_KH', 20)->nullable();
            $table->dateTime('Ngay_Tao')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->decimal('Tong_Tien', 12, 2);
            $table->dateTime('Bat_Dau_Chup');
            $table->dateTime('Ket_Thuc_Chup');
            $table->string('Dia_Diem', 255)->nullable();
            $table->string('Loai_Chup', 100)->nullable();
            $table->text('Ghi_Chu')->nullable();
            $table->enum('Trang_Thai', [
                'Chờ xác nhận','Chờ đặt cọc','Đang diễn ra','Chờ thanh toán',
                'Chờ xử lý ảnh','Đã xử lý ảnh','Đã hoàn thành','Đã hủy','Thay đổi'
            ])->default('Chờ xác nhận');
            $table->decimal('Ti_Le_Coc', 5, 2)->nullable();
            $table->text('Ly_Do_Huy')->nullable();
            $table->text('Ly_Do_Thay_Doi')->nullable();

            $table->foreign('Ma_NAG')->references('Ma_NAG')->on('nhiep_anh_gia')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('Ma_KH')->references('Ma_KH')->on('khach_hang')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buoi_chup');
    }
};
