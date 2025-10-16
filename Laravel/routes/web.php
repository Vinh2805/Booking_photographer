<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/momentia', function () {
    return view('main');
});

Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        return 'Admin Users Page';
    });
});
