<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProposalCheckerController extends Controller
{
    public function index(){
        return inertia('Admin/ProposalChecker/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'checker',
            ],
        ]);
    }
}
