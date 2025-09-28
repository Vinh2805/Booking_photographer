<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('khach_hang', function (Blueprint $table) {
            $table->string('Ma_KH', 20)->primary();
            $table->string('Ma_TK', 20)->nullable();
            $table->string('Dia_Chi', 255)->nullable();
            $table->date('Ngay_Sinh')->nullable();
            $table->enum('Gioi_Tinh', ['Nam','Nữ'])->nullable();

            $table->foreign('Ma_TK')->references('Ma_TK')->on('tai_khoan')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('khach_hang');
    }
};
