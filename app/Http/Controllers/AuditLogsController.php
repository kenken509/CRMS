<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuditLogsController extends Controller
{
    public function index(){
        return inertia('Admin/Logs/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'logs',
            ],
        ]);
    }
}
