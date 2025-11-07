<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // =============================
    // 🟢 ĐĂNG KÝ KHÁCH HÀNG
    // =============================
    public function registerCustomer(Request $request)
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

        $token = $user->createToken('customer_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký khách hàng thành công!',
            'user' => $this->userResponse($user),
            'token' => $token,
        ], 201);
    }

    // =============================
    // 🟡 ĐĂNG NHẬP KHÁCH HÀNG
    // =============================
    public function loginCustomer(Request $request)
    {
        $credentials = $request->validate([
            'Email_TK' => 'required|email',
            'Mat_Khau' => 'required',
        ]);

        $user = User::where('Email_TK', $credentials['Email_TK'])
            ->where('Loai_TK', 'Khách hàng')
            ->first();

        if (!$user || !Hash::check($credentials['Mat_Khau'], $user->Mat_Khau)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không chính xác!'], 401);
        }

        $token = $user->createToken('customer_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập khách hàng thành công!',
            'user' => $this->userResponse($user),
            'token' => $token,
        ]);
    }

    // =============================
    // 📸 ĐĂNG KÝ NHIẾP ẢNH GIA
    // =============================
    public function registerPhotographer(Request $request)
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
            'Loai_TK' => 'Nhiếp ảnh gia',
            'Hinh_Thuc_Dang_Nhap' => 'User-registered',
        ]);

        $token = $user->createToken('photographer_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký nhiếp ảnh gia thành công!',
            'user' => $this->userResponse($user),
            'token' => $token,
        ], 201);
    }

    // =============================
    // 📸 ĐĂNG NHẬP NHIẾP ẢNH GIA
    // =============================
    public function loginPhotographer(Request $request)
    {
        $credentials = $request->validate([
            'Email_TK' => 'required|email',
            'Mat_Khau' => 'required',
        ]);

        $user = User::where('Email_TK', $credentials['Email_TK'])
            ->where('Loai_TK', 'Nhiếp ảnh gia')
            ->first();

        if (!$user || !Hash::check($credentials['Mat_Khau'], $user->Mat_Khau)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không chính xác!'], 401);
        }

        $token = $user->createToken('photographer_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập nhiếp ảnh gia thành công!',
            'user' => $this->userResponse($user),
            'token' => $token,
        ]);
    }

    // =============================
    // 🔴 ĐĂNG XUẤT
    // =============================
    public function logout(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['message' => 'Token không hợp lệ hoặc đã hết hạn!'], 401);
    }

    $token = $user->currentAccessToken();

    if ($token) {
        $token->delete();
        return response()->json(['message' => 'Đăng xuất thành công!']);
    }
}

    // =============================
    // 🔧 HÀM HỖ TRỢ
    // =============================
    private function userResponse($user)
    {
        return [
            'Ma_TK' => $user->Ma_TK,
            'Ho_Ten' => $user->Ho_Ten,
            'Email_TK' => $user->Email_TK,
            'Loai_TK' => $user->Loai_TK,
        ];
    }

}
