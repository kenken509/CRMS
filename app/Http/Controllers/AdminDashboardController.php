<?php

namespace App\Http\Controllers;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return inertia('Admin/Dashboard/Dashboard', [
            'nav' => [
                'section' => 'admin',
                'page' => 'dashboard',
            ],
        ]);
    }
}
