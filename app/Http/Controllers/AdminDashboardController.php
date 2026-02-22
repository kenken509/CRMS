<?php


namespace App\Http\Controllers;

use App\Models\Capstone;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // =========================
        // Repository Metrics
        // =========================

        $totalCapstones = Capstone::count();
        $activeCapstones = Capstone::whereNull('deleted_at')->count();
        $archivedCapstones = Capstone::onlyTrashed()->count();

        $totalCategories = Category::count();
        $totalUsers = User::count();

        // =========================
        // AI Indexing Metrics
        // =========================

        $indexed = Capstone::where('embedding_status', 'synced')->count();
        $pending = Capstone::where('embedding_status', 'pending')->count();
        $failed  = Capstone::where('embedding_status', 'failed')->count();

        // =========================
        // Proposal Checker Metrics
        // (Assuming you log checks later)
        // =========================

        // For now fallback (replace when you create proposal_checks table)
        $proposalChecks = 0;
        $highRisk = 0;       // >= 0.80
        $veryHighRisk = 0;   // >= 0.90

        // =========================
        // Recent Activities
        // =========================

        $recentCapstones = Capstone::latest()
            ->take(5)
            ->get();

        $recent = $recentCapstones->map(function ($c) {
            return [
                'title' => 'New capstone added',
                'meta' => 'Capstones',
                'sub' => $c->title,
                'badge' => ucfirst($c->embedding_status ?? 'pending'),
                'level' => $c->embedding_status === 'failed'
                    ? 'danger'
                    : ($c->embedding_status === 'pending' ? 'warn' : 'good'),
                'href' => "/admin/capstones/{$c->id}",
            ];
        })->toArray();

        // =========================
        // Return to Inertia
        // =========================

        return inertia('Admin/Dashboard/Dashboard', [
            'nav' => [
                'section' => 'admin',
                'page' => 'dashboard',
            ],
            'header' => [
                'title' => 'Dashboard',
                'subtitle' => 'Overview of repository, AI indexing, and system activity',
            ],
            'stats' => [
                'totals' => [
                    'capstones' => $totalCapstones,
                    'categories' => $totalCategories,
                    'users' => $totalUsers,
                ],
                'capstones' => [
                    'active' => $activeCapstones,
                    'archived' => $archivedCapstones,
                ],
                'ai' => [
                    'indexed' => $indexed,
                    'pending' => $pending,
                    'failed' => $failed,
                    'checks' => $proposalChecks,
                    'highRisk' => $highRisk,
                    'veryHighRisk' => $veryHighRisk,
                ],
            ],
            'recent' => $recent,
        ]);
    }
}


