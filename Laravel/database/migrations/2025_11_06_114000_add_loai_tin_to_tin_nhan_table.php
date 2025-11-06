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
        Schema::table('tin_nhan', function (Blueprint $table) {
             $table->enum('Loai_Tin', ['KH-NAG', 'KH-CSKH'])
                  ->default('KH-NAG')
                  ->after('Noi_Dung'); // đặt sau cột Nội_Dung (tùy bạn có thể đổi)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tin_nhan', function (Blueprint $table) {
            $table->dropColumn('Loai_Tin');
        });
    }
};
