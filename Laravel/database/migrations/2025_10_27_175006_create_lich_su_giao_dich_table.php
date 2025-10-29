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
        Schema::create('lich_su_giao_dich', function (Blueprint $table) {
            $table->id();
            $table->string('Ma_BC', 20); // liên kết với buổi chụp
            $table->enum('Loai_Giao_Dich', [
                'Dat coc',
                'Thanh toan',
                'Tai anh goc',
                'Tai anh hau ky'
            ]);
            $table->text('Mo_Ta')->nullable();
            $table->string('Ip_Address', 45)->nullable();
            $table->text('User_Agent')->nullable();
            $table->timestamp('Thoi_Gian')->useCurrent();
            
            // nếu muốn ràng buộc FK
            $table->foreign('Ma_BC')
                  ->references('Ma_BC')
                  ->on('buoi_chup')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lich_su_giao_dich');
    }
};
