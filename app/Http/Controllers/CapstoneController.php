<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CapstoneController extends Controller
{
    public function index(){
        return inertia('Admin/Capstones/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'capstones',
            ],
            'header' => [
                'title' => 'Capstones',
                'subtitle' => 'Manage submitted capstone records',
            ],
        ]);
    }
}
