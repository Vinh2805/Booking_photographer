<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('yeu_cau_thay_doi', function (Blueprint $table) {
            $table->id();
            $table->string('Ma_BC', 20);
            $table->json('Danh_Sach_Thay_Doi'); // chứa nhiều trường thay đổi
            $table->text('Ly_Do');
            $table->enum('Trang_Thai', ['Chờ duyệt', 'Đã duyệt', 'Từ chối'])->default('Chờ duyệt');
            $table->timestamp('Ngay_Tao')->useCurrent();

            $table->foreign('Ma_BC')
                ->references('Ma_BC')
                ->on('buoi_chup')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yeu_cau_thay_doi');
    }
};
