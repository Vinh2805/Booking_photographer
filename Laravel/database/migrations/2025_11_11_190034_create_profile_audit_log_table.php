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
        Schema::create('profile_audit_log', function (Blueprint $table) {
            $table->id();
            $table->string('Ma_TK', 20);
            $table->enum('Loai_TK', ['Nhiếp ảnh gia', 'Khách hàng']);
            $table->string('Truong_Thay_Doi', 100);
            $table->text('Gia_Tri_Cu')->nullable();
            $table->text('Gia_Tri_Moi')->nullable();
            $table->enum('Hanh_Dong', ['added', 'removed', 'updated', 'uploaded']);
            $table->string('Ip_Address', 45)->nullable();
            $table->text('User_Agent')->nullable();
            $table->string('Thiet_Bi', 50)->nullable(); // Desktop, Mobile
            $table->timestamp('Thoi_Gian')->useCurrent();
            
            $table->foreign('Ma_TK')
                  ->references('Ma_TK')
                  ->on('tai_khoan')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_audit_log');
    }
};
