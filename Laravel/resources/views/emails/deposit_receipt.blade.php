<h2>Đặt cọc thành công ✅</h2>
<p>Mã booking: <strong>{{ $data['ma_bc'] }}</strong></p>
<ul>
  <li>Giá buổi chụp: {{ number_format($data['base_price'], 0, ',', '.') }} đ</li>
  <li>Tỷ lệ cọc: {{ $data['deposit_rate'] }}%</li>
  <li>Số tiền cọc: {{ number_format($data['deposit_amount'], 0, ',', '.') }} đ</li>
  <li>Phí dịch vụ: {{ number_format($data['service_fee'], 0, ',', '.') }} đ</li>
  <li>Tổng thanh toán: <strong>{{ number_format($data['total_charge'], 0, ',', '.') }} đ</strong></li>
  <li>Phương thức: {{ $data['method_label'] }}</li>
  <li>Mã giao dịch: {{ $data['transaction_id'] }}</li>
  <li>Thời gian: {{ $data['paid_at'] }}</li>
</ul>
<p>Cám ơn bạn đã sử dụng dịch vụ!</p>
