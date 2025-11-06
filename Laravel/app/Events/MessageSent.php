<?php

namespace App\Events;

use App\Models\TinNhan;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $message;

    public function __construct(User $user, TinNhan $message)
    {
        $this->user = $user;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        // Mỗi người có channel riêng
        return new PrivateChannel('chat.' . $this->message->Ma_NAG ?? $this->message->Ma_KH);
    }

    public function broadcastWith()
    {
        return [
            'message' => [
                'Ma_TN' => $this->message->Ma_TN,
                'Noi_Dung' => $this->message->Noi_Dung,
                'Ma_KH' => $this->message->Ma_KH,
                'Ma_NAG' => $this->message->Ma_NAG,
                'Trang_Thai' => $this->message->Trang_Thai,
                'Loai_Tin' => $this->message->Loai_Tin,
                'Thoi_Gian' => now()->toDateTimeString(),
            ],
        ];
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}
