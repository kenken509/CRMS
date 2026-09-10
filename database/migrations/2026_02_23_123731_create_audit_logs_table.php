<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Who did it (nullable for system / failed auth / guest)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // What happened
            $table->string('action', 80); // e.g. users.created, users.updated, auth.login
            $table->string('entity_type', 120)->nullable(); // e.g. App\Models\User
            $table->unsignedBigInteger('entity_id')->nullable();

            // Useful context
            $table->text('description')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Request metadata
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('url')->nullable();
            $table->string('method', 10)->nullable();

            $table->timestamps();

            $table->index(['action']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};