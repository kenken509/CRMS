<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TestController extends Controller
{
    public function taskList(){
        return inertia('TestPages/TaskList');
    }
}
