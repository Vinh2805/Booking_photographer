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
        // Sử dụng raw query để thay đổi enum (MySQL)
        DB::statement("ALTER TABLE tai_khoan MODIFY COLUMN Loai_TK ENUM('Nhiếp ảnh gia', 'Khách hàng', 'Admin') NOT NULL DEFAULT 'Khách hàng'");
    }

    public function down(): void
    {
        // Revert lại
        DB::statement("ALTER TABLE tai_khoan MODIFY COLUMN Loai_TK ENUM('Nhiếp ảnh gia', 'Khách hàng') NOT NULL DEFAULT 'Khách hàng'");
    }
};
