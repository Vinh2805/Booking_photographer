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
        Schema::table('buoi_chup', function (Blueprint $table) {
            $table->string('Tieu_De', 255)->nullable()->after('Loai_Chup');
            $table->json('The_Loai_Chup')->nullable()->after('Tieu_De'); // Array of genres
            $table->enum('Boi_Canh_Chup', ['Ngoài trời', 'Trong nhà', 'Kết hợp'])->nullable()->after('The_Loai_Chup');
            $table->string('Anh_Minh_Hoa', 500)->nullable()->after('Boi_Canh_Chup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buoi_chup', function (Blueprint $table) {
            $table->dropColumn(['Tieu_De', 'The_Loai_Chup', 'Boi_Canh_Chup', 'Anh_Minh_Hoa']);
        });
    }
};
