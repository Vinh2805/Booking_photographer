<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->string('Ma_TT', 20)->primary();
            $table->string('Ma_BC', 20);
            $table->decimal('So_Tien', 12, 2);
            $table->enum('Hinh_Thuc', ['Tiền mặt','Chuyển khoản']);
            $table->enum('Trang_Thai', ['Chờ xác nhận','Thành công','Thất bại','Hoàn tiền'])->default('Chờ xác nhận');
            $table->dateTime('Ngay_TT')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->text('Ghi_Chu')->nullable();

            $table->foreign('Ma_BC')->references('Ma_BC')->on('buoi_chup')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thanh_toan');
    }
};
