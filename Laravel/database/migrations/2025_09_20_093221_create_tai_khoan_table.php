<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tai_khoan', function (Blueprint $table) {
            $table->string('Ma_TK', 20)->primary();
            $table->string('Ho_Ten', 100);
            $table->string('So_ĐT', 15)->nullable()->unique();
            $table->string('Email_TK', 100)->unique();
            $table->string('Mat_Khau', 255);
            $table->enum('Loai_TK', ['Nhiếp ảnh gia', 'Khách hàng'])->default('Khách hàng');
            $table->enum('Hinh_Thuc_Dang_Nhap', ['User-registered', 'Facebook', 'Google'])->default('User-registered');
            $table->timestamp('Thoi_Diem_Tao_TK')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tai_khoan');
    }
};
