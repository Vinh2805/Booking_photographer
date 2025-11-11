<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\TinNhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // Lấy lịch sử tin nhắn
    public function index(Request $request, $Ma_BC)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra quyền truy cập: user phải là khách hàng hoặc nhiếp ảnh gia của buổi chụp này
        $booking = \App\Models\BuoiChup::find($Ma_BC);
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        $hasAccess = false;
        if ($khachHang && $booking->Ma_KH === $khachHang->Ma_KH) {
            $hasAccess = true;
        } elseif ($nag && $booking->Ma_NAG === $nag->Ma_NAG) {
            $hasAccess = true;
        }

        if (!$hasAccess) {
            return response()->json(['message' => 'Bạn không có quyền xem tin nhắn của buổi chụp này'], 403);
        }

        $messages = TinNhan::where('Ma_BC', $Ma_BC)
            ->orderBy('Gui_Luc', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Gửi tin nhắn
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'Ma_BC' => 'required|string',
            'Noi_Dung' => 'required|string',
            'Loai_Tin' => 'nullable|string',
        ]);

        // Kiểm tra quyền truy cập: user phải là khách hàng hoặc nhiếp ảnh gia của buổi chụp này
        $booking = \App\Models\BuoiChup::find($data['Ma_BC']);
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp'], 404);
        }

        $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        $senderType = null;
        $senderId = null;

        if ($khachHang && $booking->Ma_KH === $khachHang->Ma_KH) {
            $senderType = 'customer';
            $senderId = $khachHang->Ma_KH;
            $data['Ma_KH'] = $khachHang->Ma_KH;
        } elseif ($nag && $booking->Ma_NAG === $nag->Ma_NAG) {
            $senderType = 'photographer';
            $senderId = $nag->Ma_NAG;
            $data['Ma_NAG'] = $nag->Ma_NAG;
        } else {
            return response()->json(['message' => 'Bạn không có quyền gửi tin nhắn cho buổi chụp này'], 403);
        }

        // Tạo bản ghi tin nhắn
        $data['Ma_TN'] = 'TN' . now()->format('YmdHis') . rand(100, 999);
        $data['Trang_Thai'] = 'Đã gửi'; // Enum chỉ có 'Đã gửi' và 'Đã đọc'
        $data['Gui_Luc'] = now();

        $message = \App\Models\TinNhan::create($data);

        // Broadcast realtime (chỉ chạy nếu Pusher/WebSocket đang hoạt động)
        try {
            broadcast(new \App\Events\MessageSent($user, $message))->toOthers();
        } catch (\Exception $e) {
            // Log lỗi nhưng vẫn trả về tin nhắn
            \Log::error('Broadcast error: ' . $e->getMessage());
        }

        return response()->json($message);
    }
    // 🟡 API: Lấy tin nhắn chưa đọc của người dùng
    public function unread(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        $query = TinNhan::query();

        if ($khachHang) {
            // Nếu là khách hàng, lấy tin nhắn gửi cho khách hàng (từ nhiếp ảnh gia)
            $query->where('Ma_KH', $khachHang->Ma_KH)
                  ->whereNotNull('Ma_NAG'); // Tin nhắn từ nhiếp ảnh gia
        } elseif ($nag) {
            // Nếu là nhiếp ảnh gia, lấy tin nhắn gửi cho nhiếp ảnh gia (từ khách hàng)
            $query->where('Ma_NAG', $nag->Ma_NAG)
                  ->whereNotNull('Ma_KH'); // Tin nhắn từ khách hàng
        } else {
            return response()->json(['message' => 'Bạn không phải khách hàng hoặc nhiếp ảnh gia'], 403);
        }

        // Tin nhắn chưa đọc là những tin có Trang_Thai = 'Đã gửi' (chưa được đọc)
        $messages = $query->where('Trang_Thai', 'Đã gửi')
            ->orderBy('Gui_Luc', 'asc')
            ->get();

        return response()->json($messages);
    }

    // 🟢 API: Đánh dấu tin nhắn đã đọc theo mã cuộc trò chuyện hoặc danh sách id
    public function markAsRead(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'Ma_BC' => 'nullable|string',
            'ids' => 'nullable|array',
        ]);

        $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        $query = TinNhan::query();

        // Chỉ đánh dấu tin nhắn gửi cho user hiện tại
        if ($khachHang) {
            $query->where('Ma_KH', $khachHang->Ma_KH)
                  ->whereNotNull('Ma_NAG'); // Tin nhắn từ nhiếp ảnh gia
        } elseif ($nag) {
            $query->where('Ma_NAG', $nag->Ma_NAG)
                  ->whereNotNull('Ma_KH'); // Tin nhắn từ khách hàng
        } else {
            return response()->json(['message' => 'Bạn không phải khách hàng hoặc nhiếp ảnh gia'], 403);
        }

        if (!empty($data['Ma_BC'])) {
            $query->where('Ma_BC', $data['Ma_BC']);
        } elseif (!empty($data['ids'])) {
            $query->whereIn('Ma_TN', $data['ids']);
        } else {
            return response()->json(['error' => 'Thiếu thông tin để xác định tin nhắn'], 400);
        }

        $count = $query->where('Trang_Thai', '!=', 'Đã đọc')
            ->update(['Trang_Thai' => 'Đã đọc']);

        return response()->json([
            'message' => "Đã đánh dấu {$count} tin nhắn là đã đọc.",
            'updated' => $count,
        ]);
    }
}
