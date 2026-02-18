<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UsersController extends Controller
{
    public function index(){
        return inertia('Admin/Users/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'users',
            ],
        ]);
    }
}
