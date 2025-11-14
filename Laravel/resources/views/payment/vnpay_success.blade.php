<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Kết quả thanh toán VNPay">
    <meta name="author" content="">
    <title>VNPAY - Thanh toán thành công</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            width: 100%;
            padding: 40px;
            animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .header h3 {
            color: #28a745;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .success-icon {
            font-size: 64px;
            color: #28a745;
            margin-bottom: 15px;
            animation: bounce 0.6s ease;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .table-responsive {
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .form-group label:first-child {
            display: block;
            font-weight: 600;
            color: #495057;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .form-group label:last-child {
            display: block;
            color: #212529;
            font-size: 16px;
            font-weight: 500;
        }
        .result-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        .result-success {
            background: #d4edda;
            color: #155724;
        }
        .result-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .result-invalid {
            background: #fff3cd;
            color: #856404;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .btn-back {
            display: block;
            width: 100%;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-back:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            color: white;
            text-decoration: none;
        }
        .redirect-info {
            text-align: center;
            margin-top: 15px;
            color: #6c757d;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h3>VNPAY - Thanh toán thành công</h3>
        </div>
        
        <div class="table-responsive">
            <div class="form-group">
                <label>Mã đơn hàng:</label>
                <label>{{ $ma_bc ?? 'N/A' }}</label>
            </div>
            
            <div class="form-group">
                <label>Số tiền:</label>
                <label>{{ $amount ?? 'N/A' }}</label>
            </div>
            
            <div class="form-group">
                <label>Loại thanh toán:</label>
                <label>{{ $type === 'deposit' ? 'Đặt cọc' : 'Thanh toán phần còn lại' }}</label>
            </div>
            
            <div class="form-group">
                <label>Mã giao dịch VNPay:</label>
                <label>{{ $transaction_id ?? 'N/A' }}</label>
            </div>
            
            <div class="form-group">
                <label>Kết quả:</label>
                <label>
                    <span class="result-badge result-success">Giao dịch thành công</span>
                </label>
            </div>
        </div>

        @php
            $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:8000');
            $frontendUrl = rtrim($frontendUrl, '/');
            $redirectUrl = $frontendUrl . '/customer-auth-login?' . http_build_query([
                'payment' => 'success',
                'type' => $type,
                'ma_bc' => $ma_bc ?? '',
                'amount' => $amount ?? '',
                'transaction_id' => $transaction_id ?? ''
            ]);
        @endphp

        <a href="{{ $redirectUrl }}" class="btn-back">⬅️ Trở về trang chủ</a>
        
        <div class="redirect-info" id="redirect-msg">
            Đang chuyển hướng trong <span id="countdown">3</span> giây...
        </div>

        <footer class="footer">
            <p>&copy; VNPAY {{ date('Y') }}</p>
        </footer>
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
