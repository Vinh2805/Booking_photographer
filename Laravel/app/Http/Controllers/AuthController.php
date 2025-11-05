<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 🟢 Đăng ký người dùng mới
    public function register(Request $request)
    {
        $data = $request->validate([
            'Ho_Ten' => 'required|string|max:255',
            'Email_TK' => 'required|email|unique:tai_khoan,Email_TK',
            'Mat_Khau' => 'required|min:8|confirmed',
        ]);

        $maTK = 'TK' . str_pad(User::count() + 1, 4, '0', STR_PAD_LEFT);

        $user = User::create([
            'Ma_TK' => $maTK,
            'Ho_Ten' => $data['Ho_Ten'],
            'Email_TK' => $data['Email_TK'],
            'Mat_Khau' => Hash::make($data['Mat_Khau']),
            'Loai_TK' => 'Khách hàng',
            'Hinh_Thuc_Dang_Nhap' => 'User-registered',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => [
                'Ma_TK' => $user->Ma_TK,
                'Ho_Ten' => $user->Ho_Ten,
                'Email_TK' => $user->Email_TK,
            ],
            'token' => $token,
        ], 201);
    }

    // 🟡 Đăng nhập
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'Email_TK' => 'required|email',
            'Mat_Khau' => 'required',
        ]);

        $user = User::where('Email_TK', $credentials['Email_TK'])->first();

        if (!$user || !Hash::check($credentials['Mat_Khau'], $user->Mat_Khau)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không chính xác!'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => [
                'Ma_TK' => $user->Ma_TK,
                'Ho_Ten' => $user->Ho_Ten,
                'Email_TK' => $user->Email_TK,
            ],
            'token' => $token,
        ]);
    }

    // 🔴 Đăng xuất
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công!']);
    }
}
