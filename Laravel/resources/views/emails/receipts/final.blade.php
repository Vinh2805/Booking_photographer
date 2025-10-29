@component('mail::message')
# Thanh toán thành công

**Mã booking:** {{ $data['ma_bc'] }}

- Số tiền còn lại: {{ number_format($data['remain_amount'],0,',','.') }} đ
- Phí dịch vụ: {{ number_format($data['service_fee'],0,',','.') }} đ
- Tổng thanh toán: {{ number_format($data['total_charge'],0,',','.') }} đ
- Phương thức: {{ $data['method_label'] }}
- Mã giao dịch: {{ $data['transaction_id'] }}
- Thời gian: {{ $data['paid_at'] }}

@component('mail::button', ['url' => url('/momentia/booking/'.$data['ma_bc'])])
Quản lý buổi chụp
@endcomponent
@endcomponent
