<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Thanh toán thành công</title>
</head>
<body>
  <h2>✅ Thanh toán VNPay thành công</h2>
  <p>Mã buổi chụp: <strong>{{ $ma_bc }}</strong></p>
  <p>Số tiền: {{ $amount }}</p>
  <p>Mã giao dịch: {{ $transaction_id }}</p>
  <a href="http://localhost:4200/momentia/booking/{{ $ma_bc }}">Trở lại trang buổi chụp</a>
</body>
</html>
