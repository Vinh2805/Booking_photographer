<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tai_khoan', function (Blueprint $table) {
            $table->string('Ma_TK', 20)->primary();
            $table->string('Ho_Ten', 50);
            $table->string('So_ĐT', 15)->nullable()->unique();
            $table->string('Email_TK', 255)->nullable()->unique();
            $table->string('Mat_Khau', 255);
            $table->enum('Loai_TK', ['Nhiếp ảnh gia','Khách hàng']);
            $table->enum('Hinh_Thuc_Dang_Nhap', ['User-registered','Facebook','Google']);
            $table->timestamp('Thoi_Diem_Tao_TK')->default(DB::raw('CURRENT_TIMESTAMP'));
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
