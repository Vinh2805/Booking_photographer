<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\KhachHang;
use App\Models\NhiepAnhGia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        DB::beginTransaction();
        try {
            $maTK = 'TK' . str_pad(User::count() + 1, 4, '0', STR_PAD_LEFT);
            $maKH = 'KH' . str_pad(KhachHang::count() + 1, 3, '0', STR_PAD_LEFT);

            // Tạo tài khoản
            $user = User::create([
                'Ma_TK' => $maTK,
                'Ho_Ten' => $data['Ho_Ten'],
                'Email_TK' => $data['Email_TK'],
                'Mat_Khau' => Hash::make($data['Mat_Khau']),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ]);

            // Tạo khách hàng với Loai_TK
            KhachHang::create([
                'Ma_KH' => $maKH,
                'Ma_TK' => $maTK,
                'Loai_TK' => 'Khách hàng',
            ]);

            DB::commit();

            $token = $user->createToken('customer_token')->plainTextToken;

            return response()->json([
                'message' => 'Đăng ký khách hàng thành công!',
                'user' => $this->userResponse($user),
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đăng ký thất bại: ' . $e->getMessage()
            ], 500);
        }
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

        DB::beginTransaction();
        try {
            $maTK = 'TK' . str_pad(User::count() + 1, 4, '0', STR_PAD_LEFT);
            $maNAG = 'NAG' . str_pad(NhiepAnhGia::count() + 1, 3, '0', STR_PAD_LEFT);

            // Tạo tài khoản
            $user = User::create([
                'Ma_TK' => $maTK,
                'Ho_Ten' => $data['Ho_Ten'],
                'Email_TK' => $data['Email_TK'],
                'Mat_Khau' => Hash::make($data['Mat_Khau']),
                'Loai_TK' => 'Nhiếp ảnh gia',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ]);

            // Tạo nhiếp ảnh gia với Loai_TK
            NhiepAnhGia::create([
                'Ma_NAG' => $maNAG,
                'Ma_TK' => $maTK,
                'Loai_TK' => 'Nhiếp ảnh gia',
            ]);

            DB::commit();

            $token = $user->createToken('photographer_token')->plainTextToken;

            return response()->json([
                'message' => 'Đăng ký nhiếp ảnh gia thành công!',
                'user' => $this->userResponse($user),
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đăng ký thất bại: ' . $e->getMessage()
            ], 500);
        }
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
