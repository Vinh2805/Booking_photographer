<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('anh', function (Blueprint $table) {
            $table->id('Ma_Anh'); // Khóa chính tự tăng
            $table->string('Ma_BC', 20); // Mã buổi chụp
            $table->string('Duong_Dan', 255); // Đường dẫn ảnh (URL hoặc path)
            $table->string('Ten_Anh')->nullable(); // Tên ảnh
            $table->text('Mo_Ta')->nullable(); // Mô tả ảnh (nếu cần)
            $table->timestamps(); // created_at, updated_at

            // Khóa ngoại liên kết với bảng buoi_chup
            $table->foreign('Ma_BC')
                  ->references('Ma_BC')
                  ->on('buoi_chup')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anh');
    }
};
