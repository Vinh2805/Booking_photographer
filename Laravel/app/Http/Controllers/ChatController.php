<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\TinNhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // Lấy lịch sử tin nhắn
    // Lấy danh sách hội thoại cho Admin (theo User)
    // Lấy danh sách hội thoại cho Admin (theo User)
    public function getConversations(Request $request) {
        $user = $request->user();
        
        // Debug permission
        if (!$this->isAdmin($user)) {
             // Log this if possible, or return diverse error
             return response()->json([
                 'message' => 'Unauthorized: User is not an Admin',
                 'user_type' => $user->Loai_TK ?? 'null',
                 'id' => $user->Ma_TK
             ], 403);
        }

        // Lấy toàn bộ danh sách khách hàng và nhiếp ảnh gia
        $customers = \App\Models\KhachHang::with('taiKhoan')->get()->map(function($c) {
            return [
                'id' => $c->Ma_KH,
                'name' => $c->taiKhoan->Ho_Ten ?? 'No Name',
                'avatar' => $c->taiKhoan->avatar_url ?? '',
                'type' => 'customer'
            ];
        });

        $photographers = \App\Models\NhiepAnhGia::with('taiKhoan')->get()->map(function($p) {
             return [
                'id' => $p->Ma_NAG,
                'name' => $p->taiKhoan->Ho_Ten ?? 'No Name',
                'avatar' => $p->taiKhoan->avatar_url ?? '',
                'type' => 'photographer'
            ];
        });

        return response()->json([
            'customers' => $customers,
            'photographers' => $photographers
        ]);
    }

    // ... (rest of file) ...

    // Lấy chi tiết tin nhắn với một user cụ thể (Support Chat cho Admin)
    public function getMessagesByUser(Request $request, $userId) {
        $user = $request->user();
        if (!$this->isAdmin($user)) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = TinNhan::whereNull('Ma_BC')->orderBy('Gui_Luc', 'asc');

        if (str_starts_with($userId, 'KH')) {
            $query->where('Ma_KH', $userId);
        } elseif (str_starts_with($userId, 'NAG')) {
            $query->where('Ma_NAG', $userId);
        } else {
            return response()->json(['message' => 'Invalid User ID'], 400);
        }

        $messages = $query->get();
        return response()->json($messages);
    }

    private function isAdmin($user) {
        // Check capability first (Sanctum)
        if ($user->tokenCan('admin')) {
            return true;
        }
        // Fallback: Check Role
        if ($user->Loai_TK === 'Admin') {
            return true;
        }
        // Legacy: Check DB
        return \App\Models\Admin::where('Ma_TK', $user->Ma_TK)->exists();
    }

    public function index(Request $request, $Ma_BC)
    {
        // ... (Old logic for booking chat, keep for backward compatibility or modify if needed)
        // For now, keep it valid.
        
        $user = $request->user();
        // ... rest of index code
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
        $admin = \App\Models\Admin::where('Ma_TK', $user->Ma_TK)->first();

        $hasAccess = false;
        $allowedScopes = ['general'];

        if ($khachHang && $booking->Ma_KH === $khachHang->Ma_KH) {
            $hasAccess = true;
            $allowedScopes[] = 'admin_customer';
        } elseif ($nag && $booking->Ma_NAG === $nag->Ma_NAG) {
            $hasAccess = true;
            $allowedScopes[] = 'admin_photographer';
        } elseif ($admin) {
            $hasAccess = true;
            $allowedScopes = ['general', 'admin_customer', 'admin_photographer'];
        }

        if (!$hasAccess) {
            return response()->json(['message' => 'Bạn không có quyền xem tin nhắn của buổi chụp này'], 403);
        }

        $messages = TinNhan::where('Ma_BC', $Ma_BC)
            ->whereIn('Pham_Vi', $allowedScopes)
            ->orderBy('Gui_Luc', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Lấy lịch sử chat hỗ trợ (Chat với Admin - không có Ma_BC)
    public function getSupportHistory(Request $request) {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        $query = TinNhan::whereNull('Ma_BC')->orderBy('Gui_Luc', 'asc');

        if ($khachHang) {
            $query->where('Ma_KH', $khachHang->Ma_KH);
        } elseif ($nag) {
            $query->where('Ma_NAG', $nag->Ma_NAG);
        } else {
             // Admin shouldn't call this, but if they do... logic is different
             return response()->json(['message' => 'Only for users'], 403);
        }

        return response()->json($query->get());
    }

    // Gửi tin nhắn
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'Ma_BC' => 'nullable|string',
            'Noi_Dung' => 'required|string',
            'Loai_Tin' => 'nullable|string',
            'Pham_Vi' => 'nullable|string|in:general,admin_customer,admin_photographer',
            'ReceiverId' => 'nullable|string', // ID người nhận (nếu chat direct without booking)
        ]);

        if (!isset($data['Pham_Vi'])) {
            $data['Pham_Vi'] = 'general';
        }

        $booking = null;
        if (!empty($data['Ma_BC'])) {
            $booking = \App\Models\BuoiChup::find($data['Ma_BC']);
        }
        $khachHang = \App\Models\KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = \App\Models\NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        $admin = \App\Models\Admin::where('Ma_TK', $user->Ma_TK)->first();

        $senderType = null;
        
        if ($admin) {
            $senderType = 'admin';
            $data['Ma_Admin'] = $admin->Ma_Admin;
            
            // Nếu không có Ma_BC, phải có ReceiverId để biết gửi cho ai
            if (empty($data['Ma_BC']) && !empty($data['ReceiverId'])) {
                if (str_starts_with($data['ReceiverId'], 'KH')) {
                    $data['Ma_KH'] = $data['ReceiverId'];
                    $data['Ma_BC'] = null; // Ensure null
                    $data['Pham_Vi'] = 'admin_customer';
                } elseif (str_starts_with($data['ReceiverId'], 'NAG')) {
                    $data['Ma_NAG'] = $data['ReceiverId'];
                    $data['Ma_BC'] = null; 
                    $data['Pham_Vi'] = 'admin_photographer';
                }
            } elseif ($booking) {
                // Logic cũ: Admin gửi vào booking
                // ...
            }
        } elseif ($khachHang) {
            $senderType = 'customer';
            $data['Ma_KH'] = $khachHang->Ma_KH;
            // Nếu gửi support (không có Ma_BC), set phạm vi
            if (empty($data['Ma_BC'])) {
                $data['Pham_Vi'] = 'admin_customer';
                // Ma_Admin null -> Tin nhắn chờ Admin đọc
            }
        } elseif ($nag) {
            $senderType = 'photographer';
            $data['Ma_NAG'] = $nag->Ma_NAG;
            // Nếu gửi support (không có Ma_BC), set phạm vi
            if (empty($data['Ma_BC'])) {
                $data['Pham_Vi'] = 'admin_photographer';
                // Ma_Admin null -> Tin nhắn chờ Admin đọc
            }
        } else {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Validation logic for booking access if Ma_BC is present
        if ($booking) {
             if ($senderType === 'customer' && $booking->Ma_KH !== $khachHang->Ma_KH) {
                 return response()->json(['message' => 'Unauthorized'], 403);
             }
             if ($senderType === 'photographer' && $booking->Ma_NAG !== $nag->Ma_NAG) {
                 return response()->json(['message' => 'Unauthorized'], 403);
             }
        }

        // Tạo bản ghi tin nhắn
        $data['Ma_TN'] = 'TN' . now()->format('YmdHis') . rand(100, 999);
        $data['Trang_Thai'] = 'Đã gửi'; 
        $data['Gui_Luc'] = now();
        
        unset($data['ReceiverId']); // Remove temp field

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
