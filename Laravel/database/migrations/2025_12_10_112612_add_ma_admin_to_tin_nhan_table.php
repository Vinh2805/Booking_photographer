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
            $table->string('Ma_Admin', 20)->nullable()->after('Ma_NAG');
            $table->foreign('Ma_Admin')->references('Ma_Admin')->on('admins')->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('tin_nhan', function (Blueprint $table) {
            $table->dropForeign(['Ma_Admin']);
            $table->dropColumn('Ma_Admin');
        });
    }
};
