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
        Schema::create('admins', function (Blueprint $table) {
            $table->string('Ma_Admin', 20)->primary();
            $table->string('Ma_TK', 20)->unique();
            $table->decimal('So_Du', 15, 2)->default(0);
            
            $table->foreign('Ma_TK')->references('Ma_TK')->on('tai_khoan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
