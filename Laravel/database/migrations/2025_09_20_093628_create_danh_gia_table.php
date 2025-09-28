<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('danh_gia', function (Blueprint $table) {
            $table->string('Ma_ĐG', 20)->primary();
            $table->string('Ma_BC', 20);
            $table->string('Ma_KH', 20);
            $table->string('Ma_NAG', 20);
            $table->integer('So_Sao')->check('So_Sao between 1 and 5');
            $table->text('Noi_Dung')->nullable();
            $table->dateTime('Ngay_ĐG')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('Ma_BC')->references('Ma_BC')->on('buoi_chup')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('Ma_KH')->references('Ma_KH')->on('khach_hang')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('Ma_NAG')->references('Ma_NAG')->on('nhiep_anh_gia')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('danh_gia');
    }
};
