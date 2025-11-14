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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('Loai_Nguoi_Dung', ['khach_hang', 'nhiep_anh_gia']);
            $table->string('Ma_Nguoi_Dung', 20); // Ma_KH hoặc Ma_NAG
            $table->enum('Loai_Giao_Dich', ['nap_tien', 'rut_tien', 'thanh_toan', 'nhan_tien']); // nhan_tien: NAG nhận tiền từ thanh toán
            $table->decimal('So_Tien', 15, 2);
            $table->decimal('So_Du_Truoc', 15, 2)->default(0);
            $table->decimal('So_Du_Sau', 15, 2)->default(0);
            $table->string('Ma_BC', 20)->nullable(); // Liên kết với buổi chụp nếu có
            $table->string('Ma_TT', 20)->nullable(); // Liên kết với thanh toán nếu có
            $table->text('Ghi_Chu')->nullable();
            $table->string('So_Tai_Khoan', 50)->nullable(); // Cho rút tiền
            $table->string('Ten_Ngan_Hang', 255)->nullable();
            $table->string('Ten_Chu_Tai_Khoan', 255)->nullable();
            $table->string('Transaction_ID', 100)->nullable(); // Mã giao dịch bên ngoài
            $table->timestamp('Thoi_Gian')->useCurrent();
            
            $table->index(['Loai_Nguoi_Dung', 'Ma_Nguoi_Dung']);
            $table->index('Ma_BC');
            $table->index('Thoi_Gian');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
