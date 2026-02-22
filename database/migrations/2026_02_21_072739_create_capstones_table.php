<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('capstones', function (Blueprint $table) {
            $table->id();

            $table->string('title')->unique();
            $table->longText('abstract')->nullable();
            $table->longText('statement_of_the_problem')->nullable();
            $table->longText('objectives')->nullable();

            $table->text('authors')->nullable();
            $table->string('adviser')->nullable();
            $table->string('academic_year', 9)->nullable();

            $table->foreignId('category_id')->constrained('categories')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Embedding fields (NO ->after() in create)
            $table->string('embedding_status')->default('pending');
            $table->text('embedding_error')->nullable();
            $table->timestamp('embedded_at')->nullable();

            $table->index(['category_id']);
            $table->index(['academic_year']);
            $table->index(['created_by']);
            $table->index(['embedding_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capstones');
    }
};