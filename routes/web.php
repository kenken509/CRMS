<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AuditLogsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CapstoneController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\ProposalCheckerController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::controller(IndexController::class)->group(function(){
    Route::get('/','index');
});

Route::controller(AuthController::class)->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/login', 'showLogin')->name('login');
        Route::post('/login', 'store');
    });

    Route::post('/logout', 'destroy')
        ->middleware('auth')
        ->name('logout');
    
});

Route::controller(AdminDashboardController::class)->group(function () {
    Route::middleware('auth')->group(function () {
        Route::get('admin/dashboard', 'index');
    });

    //Route::get('admin/dashboard', 'index');
});

Route::controller(UsersController::class)->group(function () {
    Route::middleware('auth')->group(function () {
        // Page
        Route::get('admin/users', 'index');
        
        //Table data
        Route::get('admin/users/all', 'allUsers');

        // Deactivate /Activate
        Route::patch('admin/users/{user}/toggle', 'toggleActive'); //->name('admin.users.toggle')

        // Edit save
        Route::put('admin/users/{user}', 'updateUser'); //->name('admin.users.update')

        // routes/web.php
        Route::post('admin/users', [UsersController::class, 'storeUser']);  //->name('admin.users.store')
    });

});

Route::controller(CapstoneController::class)->group(function () {
    Route::middleware('auth')->group(function () {
        Route::get('admin/capstones', 'index');
        
        // Create page + store
        Route::get('admin/capstones/create', 'create');
        Route::post('admin/capstones', 'store');
        Route::get('admin/capstones/{id}', 'show')->whereNumber('id');

        Route::get('admin/capstones/all', 'all');              // active
        Route::get('admin/capstones/archived', 'archived');    // archived

        Route::patch('admin/capstones/{capstone}/archive', 'archive');
        Route::patch('admin/capstones/{id}/restore', 'restore')->whereNumber('id');

         // ✅ Edit page + update
        Route::get('admin/capstones/{id}/edit', 'edit')->whereNumber('id');
        Route::patch('admin/capstones/{id}', 'update')->whereNumber('id');

    });

    
});

Route::controller(CategoriesController::class)->group(function () {
    Route::middleware('auth')->group(function () {
        Route::get('admin/categories', 'index');

         // axios endpoint (paginated + searchable)
        Route::get('admin/categories/all', 'allCategories');

        // ✅ toggle
        Route::patch('admin/categories/{id}/toggle', 'toggleActive');

        // ✅ create
        Route::post('admin/categories', 'store');

        // update
        Route::put('admin/categories/{id}', 'update');
    });
});

Route::controller(ProposalCheckerController::class)->group(function () {
    Route::middleware('auth')->group(function () {
        Route::get('admin/checker', 'index');
    });
});

Route::controller(AuditLogsController::class)->group(function () {
    Route::middleware('auth')->group(function () {
        Route::get('admin/logs', 'index');
    });
});