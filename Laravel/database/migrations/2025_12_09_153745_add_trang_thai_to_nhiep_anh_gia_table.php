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
        Schema::table('nhiep_anh_gia', function (Blueprint $table) {
            $table->enum('Trang_Thai', ['Pending', 'Approved', 'Rejected', 'Locked'])->default('Pending')->after('Gia_Trung_Binh');
        });
    }

    public function down(): void
    {
        Schema::table('nhiep_anh_gia', function (Blueprint $table) {
            $table->dropColumn('Trang_Thai');
        });
    }
};
