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
        Schema::dropIfExists('anh');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('anh', function (Blueprint $table) {
            $table->id('Ma_Anh'); // Khóa chính tự tăng
            $table->string('Ma_BC', 20);
            $table->string('Duong_Dan', 255);
            $table->string('Ten_Anh')->nullable();
            $table->text('Mo_Ta')->nullable();
            $table->enum('Loai', ['raw', 'edited'])->default('raw');
            $table->timestamps();

            // Khóa ngoại
            $table->foreign('Ma_BC')
                    ->references('Ma_BC')
                    ->on('buoi_chup')
                    ->onDelete('cascade');
        });
    }
};
