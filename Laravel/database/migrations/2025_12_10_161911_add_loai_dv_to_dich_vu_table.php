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
        Schema::table('dich_vu', function (Blueprint $table) {
            $table->tinyInteger('Loai_DV')->default(0)->comment('0: Dịch vụ thêm, 1: Gói chụp cơ bản');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dich_vu', function (Blueprint $table) {
            $table->dropColumn('Loai_DV');
        });
    }
};
