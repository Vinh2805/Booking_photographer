<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FinalReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $data) {}

    public function build()
    {
        return $this->subject('Biên nhận thanh toán phần còn lại - '.$this->data['ma_bc'])
            ->markdown('emails.receipts.final');
    }
}
