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
        // Sử dụng raw SQL để sửa đổi enum
        DB::statement("ALTER TABLE wallet_transactions MODIFY COLUMN Loai_Nguoi_Dung ENUM('khach_hang', 'nhiep_anh_gia', 'admin') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE wallet_transactions MODIFY COLUMN Loai_Nguoi_Dung ENUM('khach_hang', 'nhiep_anh_gia') NOT NULL");
    }
};
