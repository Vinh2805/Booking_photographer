<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DepositReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data) { $this->data = $data; }

    public function build()
    {
        return $this->subject('Biên nhận đặt cọc - ' . $this->data['ma_bc'])
            ->view('emails.deposit_receipt');
    }
}
