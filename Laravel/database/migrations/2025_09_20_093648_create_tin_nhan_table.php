<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tin_nhan', function (Blueprint $table) {
            $table->string('Ma_TN', 20)->primary();
            $table->string('Ma_BC', 20);
            $table->string('Ma_KH', 20)->nullable();
            $table->string('Ma_NAG', 20)->nullable();
            $table->text('Noi_Dung');
            $table->dateTime('Gui_Luc')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('Trang_Thai', ['Đã gửi','Đã đọc'])->default('Đã gửi');

            $table->foreign('Ma_BC')->references('Ma_BC')->on('buoi_chup')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('Ma_KH')->references('Ma_KH')->on('khach_hang')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('Ma_NAG')->references('Ma_NAG')->on('nhiep_anh_gia')->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tin_nhan');
    }
};
