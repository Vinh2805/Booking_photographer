<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Thanh toán thành công</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    * {
      box-sizing: border-box;
      font-family: "Segoe UI", Roboto, sans-serif;
    }
    body {
      background: linear-gradient(135deg, #2b9ff9, #845ef7);
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      padding: 40px 50px;
      text-align: center;
      max-width: 420px;
      width: 90%;
      animation: fadeIn 0.8s ease;
    }
    h2 {
      color: #28a745;
      font-size: 1.6rem;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    p {
      margin: 8px 0;
      color: #555;
      font-size: 15px;
    }
    strong {
      color: #000;
    }
    a.button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #2b9ff9, #845ef7);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    a.button:hover {
      opacity: 0.9;
    }
    .checkmark {
      font-size: 3rem;
      color: #28a745;
      animation: pop 0.5s ease-in-out;
    }
    .redirect {
      margin-top: 15px;
      font-size: 0.9rem;
      color: #666;
    }

    @keyframes pop {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="checkmark">✅</div>
    <h2>Thanh toán VNPay thành công</h2>
    <p>Mã buổi chụp: <strong>{{ $ma_bc }}</strong></p>
    <p>Số tiền: <strong>{{ $amount }}</strong></p>
    <p>Mã giao dịch: <strong>{{ $transaction_id }}</strong></p>

    @php
        // Sử dụng APP_URL từ Laravel để redirect về Laravel app (không phải Vite dev server)
        $frontendUrl = env('APP_URL', 'http://127.0.0.1:8000');
        $redirectUrl = $frontendUrl . '/customer-auth-login?' . http_build_query([
            'payment' => 'success',
            'type' => $type,
            'ma_bc' => $ma_bc,
            'amount' => $amount,
            'transaction_id' => $transaction_id
        ]);
    @endphp
    
    <a href="{{ $redirectUrl }}" class="button">⬅️ Trở về trang chủ</a>

    <div class="redirect" id="redirect-msg">
      Đang chuyển hướng trong <span id="countdown">3</span> giây...
    </div>
  </div>

  <script>
    let seconds = 3;
    const countdown = document.getElementById('countdown');
    const redirectMsg = document.getElementById('redirect-msg');
    const redirectUrl = "{{ $redirectUrl }}";

    const timer = setInterval(() => {
      seconds--;
      countdown.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(timer);
        redirectMsg.textContent = "Đang chuyển hướng...";
        window.location.href = redirectUrl;
      }
    }, 1000);
  </script>
</body>
</html>
