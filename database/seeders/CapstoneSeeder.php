<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Capstone;
use App\Models\Category;
use App\Models\User;

class CapstoneSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure admin exists (encoder)
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

        $categories = Category::all()->keyBy('name');

        if ($categories->isEmpty()) {
            return; // make sure CategorySeeder runs first
        }

        $data = [
            'Web-Based Systems' => [
                'title' => 'Online Capstone Repository Management System',
                'abstract' =>
                    'A centralized web-based system for storing, searching, and managing approved capstone projects with advanced filtering and role-based access.',
                'statement_of_the_problem' =>
                    'Manual storage of printed capstone copies results in difficulty retrieving records and managing historical projects.',
                'objectives' =>
                    'Develop a searchable repository, implement role-based access, and generate monitoring reports.',
                'authors' => 'Michael T. Ramos, Andrea P. Villanueva',
                'adviser' => 'Prof. Daniel S. Cruz',
                'academic_year' => '2025-2026',
            ],

            'Mobile Applications' => [
                'title' => 'Student Task Planner and Reminder Mobile App',
                'abstract' =>
                    'An Android-based productivity application that helps students manage deadlines and academic tasks with push notifications.',
                'statement_of_the_problem' =>
                    'Students frequently miss deadlines due to lack of proper task management tools.',
                'objectives' =>
                    'Provide task scheduling, notifications, and calendar integration.',
                'authors' => 'Katherine L. Mendoza, John P. Navarro',
                'adviser' => 'Prof. Maria L. Reyes',
                'academic_year' => '2025-2026',
            ],

            'Artificial Intelligence' => [
                'title' => 'AI-Based Capstone Proposal Similarity Detection System',
                'abstract' =>
                    'A system that uses semantic embeddings to detect duplicate or highly similar capstone proposals before approval.',
                'statement_of_the_problem' =>
                    'Manual screening cannot efficiently detect reworded or semantically similar project ideas.',
                'objectives' =>
                    'Implement embedding comparison and similarity scoring for proposal screening.',
                'authors' => 'Aries Llesis, Nicole Anne Ramos',
                'adviser' => 'Dr. Anthony P. Dizon',
                'academic_year' => '2025-2026',
            ],

            'Information Management Systems' => [
                'title' => 'School Clinic Patient Records and Inventory System',
                'abstract' =>
                    'An information system that digitizes patient records and tracks medicine inventory for better monitoring.',
                'statement_of_the_problem' =>
                    'Paper-based clinic logs make tracking patient history and medicine stock inefficient.',
                'objectives' =>
                    'Digitize records and automate medicine inventory monitoring.',
                'authors' => 'Renz C. Mendoza, Sofia L. Navarro',
                'adviser' => 'Prof. Camille R. Aquino',
                'academic_year' => '2025-2026',
            ],

            'IoT and Embedded Systems' => [
                'title' => 'IoT-Based Smart Classroom Energy Monitoring System',
                'abstract' =>
                    'An IoT system that monitors classroom electricity consumption and provides real-time dashboards.',
                'statement_of_the_problem' =>
                    'Unmonitored electricity usage leads to energy waste and higher operational costs.',
                'objectives' =>
                    'Monitor consumption, provide analytics, and automate energy control.',
                'authors' => 'Paolo N. Fernandez, Angelica D. Cruz',
                'adviser' => 'Engr. Liza M. Herrera',
                'academic_year' => '2025-2026',
            ],
        ];

        foreach ($data as $categoryName => $capstone) {

            if (!isset($categories[$categoryName])) {
                continue;
            }

            Capstone::firstOrCreate(
                ['title' => $capstone['title']],
                array_merge($capstone, [
                    'category_id' => $categories[$categoryName]->id,
                    'created_by' => $admin->id, // encoder
                ])
            );
        }
    }
}