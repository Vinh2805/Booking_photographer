<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\TinNhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // Lấy lịch sử tin nhắn
    public function index($Ma_BC)
    {
        $messages = TinNhan::where('Ma_BC', $Ma_BC)
            ->orderBy('Gui_Luc', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Gửi tin nhắn
    public function store(Request $request)
    {
        // $user = Auth::user();

        $data = $request->validate([
            'Ma_BC' => 'required',
            'Noi_Dung' => 'required|string',
            'Loai_Tin' => 'nullable|string',
            'Ma_NAG' => 'nullable|string',
            'Ma_KH' => 'nullable|string',
        ]);

        // $data['Ma_TN'] = 'TN' . now()->format('YmdHis') . rand(100, 999);
        // $data['Trang_Thai'] = 'Đã gửi';

        // $message = TinNhan::create($data);

        // // Gửi realtime event
        // broadcast(new MessageSent($user, $message))->toOthers();

        // return response()->json($message);
        // Giả lập user hiện tại
    $user = null;

    if (!empty($data['Ma_KH'])) {
        $user = \App\Models\User::where('Ma_TK', $data['Ma_KH'])->first();
    } elseif (!empty($data['Ma_NAG'])) {
        $user = \App\Models\User::where('Ma_TK', $data['Ma_NAG'])->first();
    }

    // Nếu chưa có user vẫn cho phép test (gán tạm)
    if (!$user) {
        $user = new \App\Models\User([
            'Ma_TK' => 'TEST001',
            'Ho_Ten' => 'Tài khoản test',
        ]);
    }

    // Tạo bản ghi tin nhắn
    $data['Ma_TN'] = 'TN' . now()->format('YmdHis') . rand(100, 999);
    $data['Trang_Thai'] = 'Đã gửi';

    $message = \App\Models\TinNhan::create($data);

    // Broadcast realtime (chỉ chạy nếu Pusher/WebSocket đang hoạt động)
    broadcast(new \App\Events\MessageSent($user, $message))->toOthers();

    return response()->json($message);
    }
}
