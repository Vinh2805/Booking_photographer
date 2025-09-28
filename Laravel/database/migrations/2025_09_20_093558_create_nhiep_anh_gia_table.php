<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nhiep_anh_gia', function (Blueprint $table) {
            $table->string('Ma_NAG', 20)->primary();
            $table->string('Ma_TK', 20)->nullable();
            $table->string('Dia_Diem_Hoat_Dong', 100)->nullable();
            $table->integer('Kinh_Nghiem')->nullable();
            $table->decimal('Gia_Trung_Binh', 10, 2)->nullable();

            $table->foreign('Ma_TK')->references('Ma_TK')->on('tai_khoan')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nhiep_anh_gia');
    }
};
