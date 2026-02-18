<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CategoriesController extends Controller
{
    public function index(){
        return inertia('Admin/Categories/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'categories',
            ],
        ]);
    }
}
