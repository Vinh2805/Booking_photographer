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
        // Thêm trường vào bảng tai_khoan
        Schema::table('tai_khoan', function (Blueprint $table) {
            $table->string('Avatar', 500)->nullable()->after('Email_TK');
            $table->text('Gioi_Thieu')->nullable()->after('Avatar');
        });

        // Thêm trường vào bảng khach_hang
        Schema::table('khach_hang', function (Blueprint $table) {
            $table->json('So_Thich_The_Loai')->nullable()->after('Gioi_Tinh');
            $table->json('So_Thich_Dia_Diem')->nullable()->after('So_Thich_The_Loai');
        });

        // Thêm trường vào bảng nhiep_anh_gia
        Schema::table('nhiep_anh_gia', function (Blueprint $table) {
            $table->string('Anh_Bia', 500)->nullable()->after('Gia_Trung_Binh');
            $table->json('Boi_Canh_Chup')->nullable()->after('Anh_Bia');
            $table->json('Thiet_Bi')->nullable()->after('Boi_Canh_Chup');
            $table->json('Portfolio')->nullable()->after('Thiet_Bi');
            $table->decimal('Gia_Toi_Thieu', 12, 2)->nullable()->after('Gia_Trung_Binh');
            $table->decimal('Gia_Toi_Da', 12, 2)->nullable()->after('Gia_Toi_Thieu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tai_khoan', function (Blueprint $table) {
            $table->dropColumn(['Avatar', 'Gioi_Thieu']);
        });

        Schema::table('khach_hang', function (Blueprint $table) {
            $table->dropColumn(['So_Thich_The_Loai', 'So_Thich_Dia_Diem']);
        });

        Schema::table('nhiep_anh_gia', function (Blueprint $table) {
            $table->dropColumn(['Anh_Bia', 'Boi_Canh_Chup', 'Thiet_Bi', 'Portfolio', 'Gia_Toi_Thieu', 'Gia_Toi_Da']);
        });
    }
};
