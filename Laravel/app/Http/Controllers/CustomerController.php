<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function dashboard($Ma_TK)
    {
        return response()->json([
            'bookings' => 3,
            'unreadMessages' => 7,
            'favoritePhotographers' => 2,
        ]);
    }
}
