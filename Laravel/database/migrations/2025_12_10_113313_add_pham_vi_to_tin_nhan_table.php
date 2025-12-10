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
        Schema::table('tin_nhan', function (Blueprint $table) {
            $table->enum('Pham_Vi', ['general', 'admin_customer', 'admin_photographer'])->default('general')->after('Loai_Tin');
        });
    }

    public function down(): void
    {
        Schema::table('tin_nhan', function (Blueprint $table) {
            $table->dropColumn('Pham_Vi');
        });
    }
};
