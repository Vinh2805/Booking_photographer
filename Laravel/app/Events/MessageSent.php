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
        // Broadcast đến channel của booking (cả 2 người đều subscribe channel này)
        if ($this->message->Ma_BC) {
            return new PrivateChannel('chat.booking.' . $this->message->Ma_BC);
        }
        
        // Fallback: nếu không có Ma_BC, broadcast đến channel của người nhận
        if ($this->message->Ma_KH) {
            return new PrivateChannel('chat.' . $this->message->Ma_KH);
        }
        
        if ($this->message->Ma_NAG) {
            return new PrivateChannel('chat.' . $this->message->Ma_NAG);
        }
        
        // Default channel (không nên xảy ra)
        return new PrivateChannel('chat.default');
    }

    public function broadcastWith()
    {
        $guiLuc = $this->message->Gui_Luc;
        if ($guiLuc instanceof \Carbon\Carbon) {
            $guiLuc = $guiLuc->toDateTimeString();
        } elseif (is_string($guiLuc)) {
            // Giữ nguyên nếu đã là string
        } else {
            $guiLuc = now()->toDateTimeString();
        }

        return [
            'message' => [
                'Ma_TN' => $this->message->Ma_TN,
                'Ma_BC' => $this->message->Ma_BC,
                'Noi_Dung' => $this->message->Noi_Dung,
                'Ma_KH' => $this->message->Ma_KH,
                'Ma_NAG' => $this->message->Ma_NAG,
                'Trang_Thai' => $this->message->Trang_Thai,
                'Loai_Tin' => $this->message->Loai_Tin,
                'Gui_Luc' => $guiLuc,
            ],
        ];
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}
