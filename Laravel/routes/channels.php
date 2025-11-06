<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{Ma_TK}', function ($user, $Ma_TK) {
    return (string) $user->Ma_TK === (string) $Ma_TK || true;
});