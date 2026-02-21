<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Get first user (or create one if needed)
        $admin = User::first();

        if (!$admin) {
            $admin = User::factory()->create([
                'name' => 'System Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'is_active' => true,
            ]);
        }

        $categories = [
            'Web-Based Systems',
            'Mobile Applications',
            'Artificial Intelligence',
            'Information Management Systems',
            'IoT and Embedded Systems',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['name' => $name],
                [
                    'is_active' => true,
                    'created_by' => $admin->id,
                ]
            );
        }
    }
}