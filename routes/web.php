<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\IndexController;
use Illuminate\Support\Facades\Route;

Route::controller(IndexController::class)->group(function(){
    Route::get('/','index');
});

Route::controller(AuthController::class)->group(function(){
    Route::get('/login', 'showLogin');
});