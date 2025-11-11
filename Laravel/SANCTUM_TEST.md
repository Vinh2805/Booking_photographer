# Kiểm tra Sanctum Token

## Các vấn đề đã được sửa:

### 1. Frontend - apiClient.ts
✅ **Đã sửa**: Bật lại interceptor để tự động gửi token trong header
- Token được lấy từ localStorage (`customer_token` hoặc `photographer_token`)
- Token được gửi trong header: `Authorization: Bearer {token}`

### 2. Frontend - CustomerBookings.tsx
✅ **Đã sửa**: Thay `axios` bằng `apiClient` để tự động gửi token
- Trước: `axios.get("/api/customer/bookings")` - không có token
- Sau: `apiClient.get("/customer/bookings")` - có token tự động

### 3. Backend - Routes (api.php)
✅ **Đã sửa**: Thêm middleware `auth:sanctum` cho các route cần bảo vệ
- `/customer/bookings` - có middleware
- `/customer/bookings/{id}` - có middleware
- `/buoi-chup/{id}` - có middleware
- `/buoi-chup/{id}/*` (POST routes) - có middleware
- `/dang-xuat` - có middleware
- `/buoi-chup` (GET) - không có middleware (public), nhưng kiểm tra auth trong controller khi `only_mine=true`

### 4. Backend - Controllers
✅ **Đã kiểm tra**: Controllers sử dụng `Auth::guard('sanctum')->user()` để lấy user
- `CustomerBookingController` - sử dụng đúng
- `BuoiChupController` - sử dụng đúng với helper method `getPhotographerId()`

## Cách kiểm tra Sanctum Token:

### Test 1: Đăng nhập và lấy token
```bash
# Đăng nhập khách hàng
curl -X POST http://127.0.0.1:8000/api/khach-hang/dang-nhap \
  -H "Content-Type: application/json" \
  -d '{"Email_TK":"test@example.com","Mat_Khau":"password123"}'

# Response sẽ có token:
# {
#   "message": "Đăng nhập khách hàng thành công!",
#   "user": {...},
#   "token": "1|abcdefghijklmnopqrstuvwxyz..."
# }
```

### Test 2: Gọi API với token
```bash
# Gọi API với token
curl -X GET http://127.0.0.1:8000/api/customer/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Nếu token hợp lệ: trả về danh sách buổi chụp
# Nếu token không hợp lệ: trả về 401 Unauthenticated
```

### Test 3: Gọi API không có token
```bash
# Gọi API không có token
curl -X GET http://127.0.0.1:8000/api/customer/bookings \
  -H "Accept: application/json"

# Response: 401 Unauthenticated
```

### Test 4: Kiểm tra trong browser
1. Mở DevTools (F12)
2. Vào tab Network
3. Đăng nhập và kiểm tra request có header `Authorization: Bearer {token}`
4. Gọi API và kiểm tra response

## Các vấn đề có thể gặp:

### 1. Token không được gửi
**Nguyên nhân**: Interceptor bị comment hoặc không hoạt động
**Giải pháp**: Kiểm tra `apiClient.ts` có interceptor không

### 2. Token không hợp lệ
**Nguyên nhân**: Token đã hết hạn hoặc đã bị xóa
**Giải pháp**: Đăng nhập lại để lấy token mới

### 3. CORS Error
**Nguyên nhân**: Backend chưa cấu hình CORS
**Giải pháp**: Kiểm tra `config/cors.php` và `bootstrap/app.php`

### 4. 401 Unauthenticated
**Nguyên nhân**: Token không đúng format hoặc không được nhận diện
**Giải pháp**: 
- Kiểm tra token có đúng format `Bearer {token}` không
- Kiểm tra token có trong database `personal_access_tokens` không
- Kiểm tra middleware `auth:sanctum` có hoạt động không

## Cấu hình Sanctum:

### config/sanctum.php
- `stateful` domains: đã cấu hình `localhost,127.0.0.1`
- `guard`: `['web', 'api']`
- `expiration`: `null` (token không hết hạn)

### Database
- Bảng `personal_access_tokens` phải tồn tại
- Token được lưu trong bảng này khi user đăng nhập

## Kết luận:

✅ **Sanctum Token đã được cấu hình đúng**:
- Frontend tự động gửi token trong mọi request
- Backend kiểm tra token qua middleware `auth:sanctum`
- Controllers sử dụng `Auth::guard('sanctum')->user()` để lấy user
- Routes được bảo vệ đúng cách

🔍 **Cần test thực tế**:
1. Đăng nhập và kiểm tra token có được lưu không
2. Gọi API và kiểm tra token có được gửi không
3. Kiểm tra response có đúng không

