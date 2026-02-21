<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('capstones', function (Blueprint $table) {
            $table->id();

            // Core Information
            $table->string('title')->unique();
            $table->longText('abstract')->nullable();
            $table->longText('statement_of_the_problem')->nullable();
            $table->longText('objectives')->nullable();

            // Metadata
            $table->text('authors')->nullable();
            $table->string('adviser')->nullable();
            $table->string('academic_year', 9)->nullable(); // e.g. 2025-2026

            // Category Relationship
            $table->foreignId('category_id')
                ->constrained('categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Encoded By (Accountability - Required)
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes(); // Archive support

            // Indexes for performance
            $table->index(['category_id']);
            $table->index(['academic_year']);
            $table->index(['created_by']);

            // Optional (enable if using MySQL 8+ InnoDB fulltext)
            // $table->fullText(['title', 'abstract']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capstones');
    }
};