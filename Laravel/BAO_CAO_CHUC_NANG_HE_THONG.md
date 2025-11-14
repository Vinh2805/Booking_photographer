# 📋 BÁO CÁO CHỨC NĂNG HỆ THỐNG BOOKING PHOTOGRAPHER

## 📑 MỤC LỤC
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Nhóm chức năng Authentication & Authorization](#2-nhóm-chức-năng-authentication--authorization)
3. [Nhóm chức năng Profile Management](#3-nhóm-chức-năng-profile-management)
4. [Nhóm chức năng Booking Management](#4-nhóm-chức-năng-booking-management)
5. [Nhóm chức năng Payment Processing](#5-nhóm-chức-năng-payment-processing)
6. [Nhóm chức năng Wallet Management (Ví cá nhân)](#6-nhóm-chức-năng-wallet-management-ví-cá-nhân)
7. [Nhóm chức năng Photo Management](#7-nhóm-chức-năng-photo-management)
8. [Nhóm chức năng Chat/Messaging](#8-nhóm-chức-năng-chatmessaging)
9. [Nhóm chức năng Review & Rating](#9-nhóm-chức-năng-review--rating)
10. [Nhóm chức năng Photographer Discovery](#10-nhóm-chức-năng-photographer-discovery)
11. [Nhóm chức năng Dashboard & Statistics](#11-nhóm-chức-năng-dashboard--statistics)
12. [Nhóm chức năng Admin Management](#12-nhóm-chức-năng-admin-management)

---

## 1. TỔNG QUAN HỆ THỐNG

### Mô tả
Hệ thống đặt lịch chụp ảnh trực tuyến kết nối khách hàng với nhiếp ảnh gia. Hệ thống hỗ trợ quản lý buổi chụp từ lúc đặt lịch đến khi hoàn thành, bao gồm thanh toán, chat, upload/download ảnh, và đánh giá.

### Kiến trúc
- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: MySQL/MariaDB
- **Authentication**: Laravel Sanctum
- **Realtime**: Laravel Echo + Pusher
- **Payment**: VNPay Integration

---

## 2. NHÓM CHỨC NĂNG: AUTHENTICATION & AUTHORIZATION

### 2.1. Mô tả chức năng
Quản lý đăng ký, đăng nhập, đăng xuất cho 2 loại người dùng: Khách hàng và Nhiếp ảnh gia.

### 2.2. File Backend

#### Controllers
- **`app/Http/Controllers/AuthController.php`**
  - `registerCustomer()` - Đăng ký khách hàng
  - `loginCustomer()` - Đăng nhập khách hàng
  - `registerPhotographer()` - Đăng ký nhiếp ảnh gia
  - `loginPhotographer()` - Đăng nhập nhiếp ảnh gia
  - `logout()` - Đăng xuất

#### Models
- **`app/Models/User.php`** - Model tài khoản
- **`app/Models/KhachHang.php`** - Model khách hàng
- **`app/Models/NhiepAnhGia.php`** - Model nhiếp ảnh gia

#### Routes
- `POST /api/khach-hang/dang-ky` - Đăng ký khách hàng
- `POST /api/khach-hang/dang-nhap` - Đăng nhập khách hàng
- `POST /api/nhiep-anh-gia/dang-ky` - Đăng ký nhiếp ảnh gia
- `POST /api/nhiep-anh-gia/dang-nhap` - Đăng nhập nhiếp ảnh gia
- `POST /api/dang-xuat` - Đăng xuất (cần auth)

### 2.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerAuth.tsx`**
  - Form đăng nhập/đăng ký khách hàng
  - Validation form
  - Xử lý token và lưu vào localStorage

- **`resources/src/components/photographer/PhotographerAuth.tsx`**
  - Form đăng nhập/đăng ký nhiếp ảnh gia
  - Validation form
  - Xử lý token và lưu vào localStorage

#### Services
- **`resources/src/components/services/apiClient.ts`**
  - Axios interceptor tự động thêm token vào header
  - Xử lý lỗi 401 (Unauthorized)

### 2.4. Luồng hoạt động

#### Đăng ký
```
1. User điền form (Họ tên, Email, Mật khẩu)
2. Frontend gửi POST /api/khach-hang/dang-ky hoặc /api/nhiep-anh-gia/dang-ky
3. Backend validate dữ liệu
4. Backend tạo User và KhachHang/NhiepAnhGia
5. Backend tạo token (Sanctum)
6. Backend trả về token + user info
7. Frontend lưu token vào localStorage
8. Frontend redirect đến dashboard
```

#### Đăng nhập
```
1. User điền Email + Mật khẩu
2. Frontend gửi POST /api/khach-hang/dang-nhap hoặc /api/nhiep-anh-gia/dang-nhap
3. Backend kiểm tra credentials
4. Backend tạo token mới
5. Backend trả về token + user info
6. Frontend lưu token vào localStorage
7. Frontend redirect đến dashboard
```

#### Đăng xuất
```
1. User click đăng xuất
2. Frontend gửi POST /api/dang-xuat (với token)
3. Backend xóa token
4. Frontend xóa token khỏi localStorage
5. Frontend redirect về trang chủ
```

---

## 3. NHÓM CHỨC NĂNG: PROFILE MANAGEMENT

### 3.1. Mô tả chức năng
Quản lý thông tin cá nhân, avatar, portfolio (cho nhiếp ảnh gia), cập nhật thông tin profile.

### 3.2. File Backend

#### Controllers
- **`app/Http/Controllers/ProfileController.php`**
  - `getCustomerProfile()` - Lấy thông tin profile khách hàng
  - `updateCustomerProfile()` - Cập nhật profile khách hàng
  - `uploadCustomerAvatar()` - Upload avatar khách hàng
  - `getPhotographerProfile()` - Lấy thông tin profile nhiếp ảnh gia
  - `updatePhotographerProfile()` - Cập nhật profile nhiếp ảnh gia
  - `uploadPhotographerAvatar()` - Upload avatar nhiếp ảnh gia
  - `uploadPhotographerCover()` - Upload ảnh bìa nhiếp ảnh gia
  - `uploadPhotographerPortfolio()` - Upload portfolio nhiếp ảnh gia
  - `serveAvatar()`, `serveCover()`, `servePortfolio()` - Serve files từ storage

#### Routes
- `GET /api/profile/customer` - Lấy profile khách hàng
- `PUT /api/profile/customer` - Cập nhật profile khách hàng
- `POST /api/profile/customer/avatar` - Upload avatar khách hàng
- `GET /api/profile/photographer` - Lấy profile nhiếp ảnh gia
- `PUT /api/profile/photographer` - Cập nhật profile nhiếp ảnh gia
- `POST /api/profile/photographer/avatar` - Upload avatar nhiếp ảnh gia
- `POST /api/profile/photographer/cover` - Upload ảnh bìa
- `POST /api/profile/photographer/portfolio` - Upload portfolio
- `GET /api/storage/avatars/{filename}` - Xem avatar
- `GET /api/storage/covers/{filename}` - Xem ảnh bìa
- `GET /api/storage/portfolio/{filename}` - Xem portfolio

### 3.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerEditProfile.tsx`**
  - Form chỉnh sửa profile khách hàng
  - Upload avatar
  - Validation và submit

- **`resources/src/components/customer/CustomerProfile.tsx`**
  - Hiển thị thông tin profile khách hàng
  - Thống kê (số buổi chụp, đã hoàn thành, v.v.)

- **`resources/src/components/photographer/PhotographerEditProfile.tsx`**
  - Form chỉnh sửa profile nhiếp ảnh gia
  - Upload avatar, cover, portfolio
  - Quản lý portfolio (thêm/xóa ảnh)

- **`resources/src/components/photographer/PhotographerProfile.tsx`**
  - Hiển thị thông tin profile nhiếp ảnh gia
  - Portfolio gallery
  - Reviews section

### 3.4. Luồng hoạt động

#### Xem Profile
```
1. User vào trang Profile
2. Frontend gửi GET /api/profile/customer hoặc /api/profile/photographer
3. Backend lấy thông tin từ database
4. Backend trả về profile data
5. Frontend hiển thị thông tin
```

#### Cập nhật Profile
```
1. User chỉnh sửa thông tin trong form
2. User click "Lưu"
3. Frontend validate form
4. Frontend gửi PUT /api/profile/customer hoặc /api/profile/photographer
5. Backend validate và cập nhật database
6. Backend trả về kết quả
7. Frontend hiển thị thông báo thành công
```

#### Upload Avatar/Cover/Portfolio
```
1. User chọn file ảnh
2. Frontend preview ảnh
3. User click "Upload"
4. Frontend gửi POST /api/profile/{type}/avatar|cover|portfolio (multipart/form-data)
5. Backend lưu file vào storage/app/private/public/{type}/
6. Backend cập nhật đường dẫn trong database
7. Backend trả về URL ảnh
8. Frontend cập nhật UI với ảnh mới
```

---

## 4. NHÓM CHỨC NĂNG: BOOKING MANAGEMENT

### 4.1. Mô tả chức năng
Quản lý vòng đời buổi chụp từ tạo yêu cầu đến hoàn thành, bao gồm: tạo yêu cầu, xác nhận/từ chối, hủy, thay đổi, bắt đầu/kết thúc buổi chụp.

### 4.2. File Backend

#### Controllers
- **`app/Http/Controllers/BookingController.php`**
  - `createRequest()` - Khách hàng tạo yêu cầu đặt lịch
  - `getServices()` - Lấy danh sách dịch vụ

- **`app/Http/Controllers/BookingConfirmationController.php`**
  - `confirm()` - Nhiếp ảnh gia xác nhận buổi chụp
  - `reject()` - Nhiếp ảnh gia từ chối buổi chụp

- **`app/Http/Controllers/BookingCancelController.php`**
  - `cancel()` - Hủy buổi chụp (cả khách hàng và nhiếp ảnh gia)

- **`app/Http/Controllers/BookingChangeController.php`**
  - `requestChange()` - Yêu cầu thay đổi buổi chụp
  - `getPendingRequests()` - Lấy danh sách yêu cầu thay đổi chờ duyệt

- **`app/Http/Controllers/BookingChangeApprovalController.php`**
  - `approve()` - Duyệt yêu cầu thay đổi
  - `reject()` - Từ chối yêu cầu thay đổi

- **`app/Http/Controllers/BuoiChupController.php`**
  - `index()` - Danh sách buổi chụp (có filter, search, pagination)
  - `show()` - Chi tiết buổi chụp
  - `start()` - Bắt đầu buổi chụp (nhiếp ảnh gia)
  - `end()` - Kết thúc buổi chụp (nhiếp ảnh gia)
  - `completeProcessing()` - Hoàn thành xử lý ảnh

- **`app/Http/Controllers/CustomerBookingController.php`**
  - `index()` - Danh sách buổi chụp của khách hàng
  - `show()` - Chi tiết buổi chụp của khách hàng

#### Models
- **`app/Models/BuoiChup.php`** - Model buổi chụp
- **`app/Models/YeuCauChup.php`** - Model yêu cầu chụp
- **`app/Models/DichVu.php`** - Model dịch vụ

#### Routes
- `POST /api/booking/create` - Tạo yêu cầu đặt lịch
- `POST /api/booking/{ma_bc}/confirm` - Xác nhận buổi chụp
- `POST /api/booking/{ma_bc}/reject` - Từ chối buổi chụp
- `POST /api/booking/{ma_bc}/cancel` - Hủy buổi chụp
- `POST /api/booking/{ma_bc}/change` - Yêu cầu thay đổi
- `GET /api/booking/change-requests/pending` - Lấy yêu cầu thay đổi chờ duyệt
- `PUT /api/booking/change/{id}/approve` - Duyệt yêu cầu thay đổi
- `PUT /api/booking/change/{id}/reject` - Từ chối yêu cầu thay đổi
- `GET /api/buoi-chup` - Danh sách buổi chụp
- `GET /api/buoi-chup/{id}` - Chi tiết buổi chụp
- `POST /api/buoi-chup/{id}/start` - Bắt đầu buổi chụp
- `POST /api/buoi-chup/{id}/end` - Kết thúc buổi chụp
- `POST /api/buoi-chup/{id}/complete-processing` - Hoàn thành xử lý ảnh
- `GET /api/customer/bookings` - Danh sách buổi chụp của khách hàng
- `GET /api/customer/bookings/{id}` - Chi tiết buổi chụp của khách hàng
- `GET /api/dich-vu` - Lấy danh sách dịch vụ

### 4.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerBookings.tsx`**
  - Danh sách buổi chụp của khách hàng
  - Filter theo trạng thái
  - Chi tiết buổi chụp

- **`resources/src/components/customer/PhotographerPortfolioModal.tsx`**
  - Modal đặt lịch chụp
  - Form tạo yêu cầu đặt lịch

- **`resources/src/components/photographer/PhotographerBookings.tsx`**
  - Danh sách buổi chụp của nhiếp ảnh gia
  - Filter, search, pagination

- **`resources/src/components/photographer/BookingDetail.tsx`**
  - Chi tiết buổi chụp (nhiếp ảnh gia)
  - Các action: xác nhận, từ chối, hủy, bắt đầu, kết thúc, hoàn thành xử lý
  - Upload ảnh gốc/hậu kỳ
  - Xem yêu cầu thay đổi

- **`resources/src/components/shared/ChangeRequestSidebar.tsx`**
  - Sidebar hiển thị yêu cầu thay đổi
  - Duyệt/từ chối yêu cầu

#### Services
- **`resources/src/components/services/BookingAPI.ts`**
  - Các hàm API cho booking operations

### 4.4. Luồng hoạt động

#### Tạo yêu cầu đặt lịch
```
1. Khách hàng xem portfolio nhiếp ảnh gia
2. Khách hàng click "Đặt lịch"
3. Khách hàng điền form (thể loại, địa điểm, thời gian, dịch vụ, v.v.)
4. Frontend tính tổng tiền
5. Frontend gửi POST /api/booking/create
6. Backend validate và tạo BuoiChup với Trang_Thai = "Chờ xác nhận"
7. Backend trả về thông tin buổi chụp
8. Frontend hiển thị thông báo thành công
```

#### Xác nhận/Từ chối buổi chụp
```
1. Nhiếp ảnh gia xem danh sách buổi chụp "Chờ xác nhận"
2. Nhiếp ảnh gia xem chi tiết và click "Xác nhận" hoặc "Từ chối"
3. Frontend gửi POST /api/booking/{ma_bc}/confirm hoặc /reject
4. Backend cập nhật Trang_Thai:
   - Xác nhận: "Chờ xác nhận" → "Chờ đặt cọc"
   - Từ chối: "Chờ xác nhận" → "Đã hủy"
5. Backend trả về kết quả
6. Frontend cập nhật UI và hiển thị thông báo
```

#### Đặt cọc (xem phần Payment)
```
Sau khi nhiếp ảnh gia xác nhận, khách hàng đặt cọc
```

#### Bắt đầu buổi chụp
```
1. Nhiếp ảnh gia vào chi tiết buổi chụp "Chờ thanh toán"
2. Kiểm tra thời gian (có thể bắt đầu từ 30 phút trước đến 30 phút sau giờ hẹn)
3. Nhiếp ảnh gia click "Bắt đầu buổi chụp"
4. Frontend gửi POST /api/buoi-chup/{id}/start
5. Backend validate thời gian và trạng thái
6. Backend cập nhật Trang_Thai = "Đang diễn ra"
7. Backend trả về kết quả
8. Frontend cập nhật UI
```

#### Kết thúc buổi chụp
```
1. Nhiếp ảnh gia click "Kết thúc buổi chụp"
2. Frontend gửi POST /api/buoi-chup/{id}/end
3. Backend cập nhật Trang_Thai = "Chờ xử lý ảnh"
4. Backend trả về kết quả
5. Frontend cập nhật UI
```

#### Upload ảnh và hoàn thành xử lý
```
1. Nhiếp ảnh gia upload ảnh gốc (ZIP)
2. Nhiếp ảnh gia upload ảnh hậu kỳ (ZIP)
3. Nhiếp ảnh gia click "Hoàn thành xử lý ảnh"
4. Frontend gửi POST /api/buoi-chup/{id}/complete-processing
5. Backend cập nhật Trang_Thai = "Đã xử lý ảnh"
6. Backend trả về kết quả
7. Frontend cập nhật UI
```

#### Yêu cầu thay đổi
```
1. Khách hàng/Nhiếp ảnh gia vào chi tiết buổi chụp
2. Click "Yêu cầu thay đổi"
3. Điền thông tin thay đổi (địa điểm, thời gian, v.v.)
4. Frontend gửi POST /api/booking/{ma_bc}/change
5. Backend tạo bản ghi yêu cầu thay đổi
6. Người còn lại nhận thông báo và có thể duyệt/từ chối
```

---

## 5. NHÓM CHỨC NĂNG: PAYMENT PROCESSING

### 5.1. Mô tả chức năng
Xử lý thanh toán đặt cọc và thanh toán phần còn lại, tích hợp VNPay và ví cá nhân.

### 5.2. File Backend

#### Controllers
- **`app/Http/Controllers/BookingDepositController.php`**
  - `store()` - Xử lý đặt cọc (ví cá nhân hoặc VNPay)

- **`app/Http/Controllers/BookingFinalPaymentController.php`**
  - `quote()` - Tính toán số tiền còn lại
  - `store()` - Xử lý thanh toán phần còn lại

- **`app/Http/Controllers/VNPayCallbackController.php`**
  - `handle()` - Xử lý callback từ VNPay

#### Services
- **`app/Services/PaymentService.php`** - Service xử lý thanh toán
- **`app/Services/VNPayService.php`** - Service tích hợp VNPay

#### Models
- **`app/Models/ThanhToan.php`** - Model thanh toán
- **`app/Models/TransactionLog.php`** - Model log giao dịch

#### Mail
- **`app/Mail/DepositReceiptMail.php`** - Email biên nhận đặt cọc
- **`app/Mail/FinalReceiptMail.php`** - Email biên nhận thanh toán cuối

#### Routes
- `POST /api/buoi-chup/{ma_bc}/dat-coc` - Đặt cọc
- `GET /api/buoi-chup/{ma_bc}/thanh-toan/quote` - Xem báo giá phần còn lại
- `POST /api/buoi-chup/{ma_bc}/thanh-toan` - Thanh toán phần còn lại
- `GET /api/payment/vnpay/return` - Callback từ VNPay

### 5.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerBookings.tsx`**
  - Hiển thị nút "Đặt cọc" hoặc "Thanh toán"
  - Modal thanh toán

#### Services
- **`resources/src/components/services/PaymentAPI.ts`**
  - Các hàm API cho payment operations

### 5.4. Luồng hoạt động

#### Đặt cọc (Ví cá nhân)
```
1. Khách hàng vào chi tiết buổi chụp "Chờ đặt cọc"
2. Khách hàng click "Đặt cọc"
3. Chọn phương thức "Ví cá nhân"
4. Frontend gửi POST /api/buoi-chup/{ma_bc}/dat-coc
5. Backend tính toán:
   - Số tiền đặt cọc = Tổng tiền × Tỷ lệ cọc (30%)
   - Phí dịch vụ = Số tiền đặt cọc × Phí dịch vụ (1%)
   - Tổng thanh toán = Số tiền đặt cọc + Phí dịch vụ
6. Backend tự động lấy số dư ví từ database (So_Du)
7. Backend kiểm tra số dư có đủ không
8. Nếu đủ:
   - Backend trừ tiền từ ví (So_Du = So_Du - totalCharge)
   - Backend tạo bản ghi ThanhToan
   - Backend cập nhật Trang_Thai buổi chụp = "Chờ thanh toán"
   - Backend gửi email biên nhận
   - Backend trả về kết quả
9. Nếu không đủ:
   - Backend trả về lỗi "Số dư không đủ"
10. Frontend hiển thị thông báo thành công hoặc lỗi
```

#### Đặt cọc (VNPay)
```
1. Khách hàng chọn phương thức "VNPay"
2. Frontend gửi POST /api/buoi-chup/{ma_bc}/dat-coc
3. Backend tính toán số tiền
4. Backend tạo payment URL từ VNPayService
5. Backend trả về redirect_url
6. Frontend redirect đến VNPay
7. Khách hàng thanh toán trên VNPay
8. VNPay redirect về /api/payment/vnpay/return
9. Backend xác thực và cập nhật database
10. Backend redirect về frontend với kết quả
```

#### Thanh toán phần còn lại
```
1. Khách hàng vào chi tiết buổi chụp "Chờ thanh toán"
2. Khách hàng click "Thanh toán phần còn lại"
3. Frontend gửi GET /api/buoi-chup/{ma_bc}/thanh-toan/quote để xem số tiền
4. Khách hàng chọn phương thức thanh toán
5. Frontend gửi POST /api/buoi-chup/{ma_bc}/thanh-toan
6. Nếu chọn "Ví cá nhân":
   - Backend tự động lấy số dư ví từ database
   - Backend kiểm tra số dư có đủ không
   - Nếu đủ: Backend trừ tiền từ ví và tạo bản ghi ThanhToan
   - Nếu không đủ: Trả về lỗi "Số dư không đủ"
7. Nếu chọn "VNPay": Xử lý tương tự đặt cọc qua VNPay
8. Sau khi thanh toán thành công, Trang_Thai = "Chờ xử lý ảnh"
```

---

## 6. NHÓM CHỨC NĂNG: WALLET MANAGEMENT (VÍ CÁ NHÂN)

### 6.1. Mô tả chức năng
Quản lý ví cá nhân cho khách hàng, cho phép nạp tiền, rút tiền và sử dụng số dư để thanh toán các buổi chụp. Khi thanh toán bằng ví cá nhân, tiền sẽ tự động được trừ từ số dư.

### 6.2. File Backend

#### Controllers
- **`app/Http/Controllers/WalletController.php`**
  - `getBalance()` - Lấy số dư ví hiện tại của khách hàng
  - `createDepositRequest()` - Tạo yêu cầu nạp tiền và tạo mã QR
  - `confirmDeposit()` - Xác nhận nạp tiền (khách hàng tự xác nhận sau khi chuyển khoản)
  - `createWithdrawalRequest()` - Tạo yêu cầu rút tiền (trừ tiền ngay lập tức)

#### Models
- **`app/Models/KhachHang.php`**
  - Trường `So_Du` - Số dư ví cá nhân (decimal 15,2, default 0)

#### Migrations
- **`database/migrations/2025_11_14_091825_add_so_du_to_khach_hang_table.php`**
  - Thêm trường `So_Du` vào bảng `khach_hang`

#### Routes
- `GET /api/wallet/balance` - Lấy số dư ví (cần auth)
- `POST /api/wallet/deposit` - Tạo yêu cầu nạp tiền (tạo QR code)
- `POST /api/wallet/deposit/confirm` - Xác nhận nạp tiền
- `POST /api/wallet/withdraw` - Rút tiền từ ví

### 6.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerWallet.tsx`**
  - Hiển thị số dư ví
  - Form nạp tiền với mã QR (VietQR)
  - Form rút tiền với thông tin tài khoản ngân hàng
  - Modal xác nhận nạp tiền

#### Integration
- **`resources/src/components/CustomerApp.tsx`**
  - Thêm view "wallet" vào navigation
  - Route điều hướng đến wallet

- **`resources/src/components/MomentiaSidebar.tsx`**
  - Thêm menu "Ví cá nhân" cho khách hàng

- **`app/Http/Controllers/BookingDepositController.php`**
  - Tự động lấy số dư từ database khi thanh toán bằng ví cá nhân
  - Tự động trừ tiền từ ví khi thanh toán thành công

- **`app/Http/Controllers/BookingFinalPaymentController.php`**
  - Tự động lấy số dư từ database khi thanh toán bằng ví cá nhân
  - Tự động trừ tiền từ ví khi thanh toán thành công

- **`app/Http/Controllers/CustomerController.php`**
  - Thêm `walletBalance` vào response của dashboard

### 6.4. Luồng hoạt động

#### Nạp tiền vào ví
```
1. Khách hàng vào trang "Ví cá nhân"
2. Khách hàng click "Nạp tiền"
3. Nhập số tiền muốn nạp (tối thiểu 10,000 đ)
4. Frontend gửi POST /api/wallet/deposit
5. Backend tạo mã QR code từ VietQR API:
   - URL: https://img.vietqr.io/image/VIB-335757499-compact2.png
   - Parameters: amount, addInfo, accountName
6. Backend trả về QR code URL và transaction_id
7. Frontend hiển thị mã QR và thông tin ngân hàng
8. Khách hàng quét QR và chuyển khoản
9. Sau khi chuyển khoản, khách hàng bấm "Xác nhận đã chuyển khoản"
10. Frontend gửi POST /api/wallet/deposit/confirm
11. Backend cập nhật số dư ví (So_Du = So_Du + amount)
12. Backend log giao dịch vào file log
13. Frontend hiển thị thông báo thành công và cập nhật số dư
```

#### Rút tiền từ ví
```
1. Khách hàng vào trang "Ví cá nhân"
2. Khách hàng click "Rút tiền"
3. Điền thông tin:
   - Số tiền muốn rút (tối thiểu 50,000 đ)
   - Số tài khoản ngân hàng
   - Tên ngân hàng (tùy chọn)
   - Tên chủ tài khoản
4. Frontend gửi POST /api/wallet/withdraw
5. Backend kiểm tra số dư đủ không
6. Backend trừ tiền ngay lập tức (So_Du = So_Du - amount)
7. Backend log giao dịch vào file log
8. Backend trả về kết quả với số dư mới
9. Frontend hiển thị thông báo thành công và cập nhật số dư
```

#### Thanh toán bằng ví cá nhân
```
1. Khách hàng chọn phương thức "Ví cá nhân" khi đặt cọc hoặc thanh toán
2. Backend tự động lấy số dư từ database (không cần nhập thủ công)
3. Backend kiểm tra số dư có đủ không
4. Nếu đủ:
   - Backend trừ tiền từ ví (So_Du = So_Du - totalCharge)
   - Backend tạo bản ghi ThanhToan
   - Backend cập nhật trạng thái buổi chụp
   - Backend log giao dịch
5. Nếu không đủ:
   - Backend trả về lỗi "Số dư không đủ"
   - Frontend hiển thị thông báo lỗi
```

### 6.5. Tính năng đặc biệt

- **Tự động trừ tiền**: Khi thanh toán bằng ví cá nhân, tiền được trừ tự động từ số dư, không cần nhập số dư thủ công
- **Nạp tiền tự xác nhận**: Khách hàng tự xác nhận sau khi chuyển khoản, không cần chờ admin
- **Rút tiền tức thì**: Tiền được trừ ngay khi khách hàng xác nhận, không cần chờ duyệt
- **QR Code động**: Mã QR được tạo động với số tiền khách hàng muốn nạp
- **Hiển thị số dư**: Số dư ví được hiển thị trên dashboard và trang ví cá nhân

### 6.6. Thông tin ngân hàng nạp tiền

- **Ngân hàng**: VIB
- **Số tài khoản**: 335757499
- **Chủ tài khoản**: Admin
- **API QR Code**: VietQR.io

---

## 7. NHÓM CHỨC NĂNG: PHOTO MANAGEMENT

### 7.1. Mô tả chức năng
Upload và download ảnh gốc/hậu kỳ cho buổi chụp. Nhiếp ảnh gia upload file ZIP, khách hàng download.

### 12.2. File Backend

#### Controllers
- **`app/Http/Controllers/PhotoUploadController.php`**
  - `upload()` - Upload ảnh gốc hoặc hậu kỳ (file ZIP)

- **`app/Http/Controllers/PhotoDownloadController.php`**
  - `download()` - Download ảnh gốc hoặc hậu kỳ (file ZIP)

#### Routes
- `POST /api/photos/{type}/{ma_bc}/upload` - Upload ảnh (type: original/edited)
- `GET /api/photos/{type}/{ma_bc}/download` - Download ảnh

### 12.3. File Frontend

#### Components
- **`resources/src/components/photographer/BookingDetail.tsx`**
  - Form upload ảnh gốc/hậu kỳ
  - Progress bar khi upload
  - Hiển thị danh sách file đã upload

- **`resources/src/components/customer/CustomerBookings.tsx`**
  - Nút download ảnh gốc/hậu kỳ

#### Services
- **`resources/src/components/services/PhotoAPI.ts`**
  - Các hàm API cho photo operations

### 11.4. Luồng hoạt động

#### Upload ảnh
```
1. Nhiếp ảnh gia vào chi tiết buổi chụp
2. Nhiếp ảnh gia chọn file ZIP (ảnh gốc hoặc hậu kỳ)
3. Nhiếp ảnh gia click "Upload"
4. Frontend gửi POST /api/photos/{type}/{ma_bc}/upload (multipart/form-data)
5. Backend validate file (chỉ ZIP, max 1GB)
6. Backend lưu file vào storage/app/private/public/uploads/{type}/{ma_bc}/
7. Backend ghi log vào lich_su_giao_dich
8. Nếu upload ảnh hậu kỳ, Backend cập nhật Trang_Thai = "Đã xử lý ảnh"
9. Backend trả về kết quả
10. Frontend hiển thị thông báo thành công
```

#### Download ảnh
```
1. Khách hàng vào chi tiết buổi chụp
2. Khách hàng click "Download ảnh gốc" hoặc "Download ảnh hậu kỳ"
3. Frontend gửi GET /api/photos/{type}/{ma_bc}/download
4. Backend kiểm tra quyền truy cập
5. Backend tìm file ZIP trong storage
6. Backend trả về file ZIP
7. Frontend trigger download
```

---

## 8. NHÓM CHỨC NĂNG: CHAT/MESSAGING

### 8.1. Mô tả chức năng
Chat realtime giữa khách hàng và nhiếp ảnh gia theo từng buổi chụp. Hỗ trợ đánh dấu đã đọc, tin nhắn chưa đọc.

### 12.2. File Backend

#### Controllers
- **`app/Http/Controllers/ChatController.php`**
  - `index()` - Lấy lịch sử tin nhắn theo Ma_BC
  - `store()` - Gửi tin nhắn mới
  - `unread()` - Lấy tin nhắn chưa đọc
  - `markAsRead()` - Đánh dấu tin nhắn đã đọc

#### Events
- **`app/Events/MessageSent.php`** - Event broadcast tin nhắn realtime

#### Models
- **`app/Models/TinNhan.php`** - Model tin nhắn

#### Routes
- `GET /api/chat/{Ma_BC}` - Lấy lịch sử tin nhắn
- `POST /api/chat` - Gửi tin nhắn
- `GET /api/chat/unread` - Lấy tin nhắn chưa đọc
- `POST /api/chat/mark-read` - Đánh dấu đã đọc

#### Channels
- **`routes/channels.php`**
  - `chat.booking.{Ma_BC}` - Channel cho buổi chụp
  - `chat.{Ma_TK}` - Channel cho user

### 12.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerChat.tsx`**
  - Danh sách chat rooms (theo booking)
  - Chat interface
  - Gửi/nhận tin nhắn realtime

- **`resources/src/components/photographer/PhotographerChat.tsx`**
  - Tương tự CustomerChat

- **`resources/src/components/ui/three-way-chat.tsx`**
  - Component chat 3 người (nếu có)

#### Services
- **`resources/src/components/services/chatApi.ts`**
  - Các hàm API cho chat operations

#### WebSocket
- **`resources/src/echo.ts`**
  - Cấu hình Laravel Echo + Pusher
  - Subscribe channels

### 11.4. Luồng hoạt động

#### Gửi tin nhắn
```
1. User mở chat của buổi chụp
2. User nhập tin nhắn và click "Gửi"
3. Frontend gửi POST /api/chat với Ma_BC và Noi_Dung
4. Backend validate và tạo bản ghi TinNhan
5. Backend broadcast event MessageSent qua Pusher
6. Backend trả về tin nhắn vừa tạo
7. Frontend thêm tin nhắn vào danh sách
8. User khác nhận tin nhắn qua WebSocket và hiển thị
```

#### Nhận tin nhắn realtime
```
1. User mở chat của buổi chụp
2. Frontend subscribe channel: Echo.private('chat.booking.{Ma_BC}')
3. Frontend listen event: 'message.sent'
4. Khi có tin nhắn mới, Pusher gửi đến frontend
5. Frontend thêm tin nhắn vào danh sách
6. Frontend scroll xuống tin nhắn mới nhất
```

#### Đánh dấu đã đọc
```
1. User mở chat và xem tin nhắn
2. Frontend tự động gửi POST /api/chat/mark-read với Ma_BC
3. Backend cập nhật Trang_Thai = "Đã đọc" cho các tin nhắn chưa đọc
4. Backend trả về số lượng tin nhắn đã đánh dấu
```

---

## 9. NHÓM CHỨC NĂNG: REVIEW & RATING

### 9.1. Mô tả chức năng
Khách hàng đánh giá nhiếp ảnh gia sau khi buổi chụp hoàn thành (1-5 sao + nhận xét).

### 12.2. File Backend

#### Controllers
- **`app/Http/Controllers/ReviewController.php`**
  - `create()` - Tạo đánh giá
  - `getReview()` - Lấy đánh giá của buổi chụp

#### Routes
- `POST /api/booking/{ma_bc}/review` - Tạo đánh giá
- `GET /api/booking/{ma_bc}/review` - Lấy đánh giá

### 12.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerBookings.tsx`**
  - Form đánh giá sau khi buổi chụp hoàn thành

- **`resources/src/components/photographer/components/ReviewsSection.tsx`**
  - Hiển thị danh sách đánh giá của nhiếp ảnh gia

### 11.4. Luồng hoạt động

#### Tạo đánh giá
```
1. Khách hàng vào chi tiết buổi chụp "Đã hoàn thành"
2. Khách hàng chọn số sao (1-5) và viết nhận xét
3. Khách hàng click "Gửi đánh giá"
4. Frontend gửi POST /api/booking/{ma_bc}/review
5. Backend validate (chỉ đánh giá 1 lần, buổi chụp phải "Đã hoàn thành")
6. Backend tạo bản ghi trong bảng danh_gia
7. Backend ghi log vào lich_su_giao_dich
8. Backend trả về kết quả
9. Frontend hiển thị thông báo thành công
```

---

## 10. NHÓM CHỨC NĂNG: PHOTOGRAPHER DISCOVERY

### 10.1. Mô tả chức năng
Khách hàng tìm kiếm, xem danh sách nhiếp ảnh gia, xem portfolio, đánh giá, và đặt lịch.

### 12.2. File Backend

#### Controllers
- **`app/Http/Controllers/PhotographerController.php`**
  - `featured()` - Lấy danh sách nhiếp ảnh gia nổi bật
  - `show()` - Chi tiết nhiếp ảnh gia (public)

#### Routes
- `GET /api/nhiep-anh-gia/noi-bat` - Lấy nhiếp ảnh gia nổi bật
- `GET /api/nhiep-anh-gia/{id}` - Chi tiết nhiếp ảnh gia

### 12.3. File Frontend

#### Components
- **`resources/src/components/LandingPage.tsx`**
  - Trang chủ với danh sách nhiếp ảnh gia nổi bật

- **`resources/src/components/FeaturedPhotographers.tsx`**
  - Component hiển thị nhiếp ảnh gia nổi bật

- **`resources/src/components/PhotographerDiscovery.tsx`**
  - Trang khám phá nhiếp ảnh gia
  - Filter, search

- **`resources/src/components/AllPhotographers.tsx`**
  - Danh sách tất cả nhiếp ảnh gia

- **`resources/src/components/customer/PhotographerPortfolioModal.tsx`**
  - Modal xem portfolio và đặt lịch

### 11.4. Luồng hoạt động

#### Xem danh sách nhiếp ảnh gia
```
1. Khách hàng vào trang chủ hoặc trang khám phá
2. Frontend gửi GET /api/nhiep-anh-gia/noi-bat
3. Backend lấy danh sách nhiếp ảnh gia (có rating, số buổi chụp, v.v.)
4. Backend trả về danh sách
5. Frontend hiển thị cards nhiếp ảnh gia
```

#### Xem chi tiết và đặt lịch
```
1. Khách hàng click vào nhiếp ảnh gia
2. Frontend gửi GET /api/nhiep-anh-gia/{id}
3. Backend trả về thông tin chi tiết (portfolio, đánh giá, giá, v.v.)
4. Frontend hiển thị thông tin
5. Khách hàng click "Đặt lịch"
6. Mở modal form đặt lịch (xem phần Booking Management)
```

---

## 11. NHÓM CHỨC NĂNG: DASHBOARD & STATISTICS

### 11.1. Mô tả chức năng
Dashboard hiển thị thống kê, số liệu cho khách hàng và nhiếp ảnh gia.

### 12.2. File Backend

#### Controllers
- **`app/Http/Controllers/CustomerController.php`**
  - `dashboard()` - Dashboard khách hàng (số buổi chụp, tin nhắn chưa đọc, v.v.)

- **`app/Http/Controllers/PhotographerController.php`**
  - `dashboard()` - Dashboard nhiếp ảnh gia (số buổi chụp, doanh thu, rating, v.v.)
  - `bookings()` - Danh sách buổi chụp sắp tới

#### Routes
- `GET /api/customer/dashboard/{Ma_TK}` - Dashboard khách hàng
- `GET /api/photographer/dashboard/{Ma_TK}` - Dashboard nhiếp ảnh gia
- `GET /api/photographer/{Ma_TK}/bookings` - Buổi chụp sắp tới

### 12.3. File Frontend

#### Components
- **`resources/src/components/customer/CustomerHome.tsx`**
  - Dashboard khách hàng
  - Hiển thị thống kê

- **`resources/src/components/photographer/PhotographerHome.tsx`**
  - Dashboard nhiếp ảnh gia
  - Hiển thị thống kê, biểu đồ

### 11.4. Luồng hoạt động

#### Xem Dashboard
```
1. User đăng nhập và vào trang chủ
2. Frontend gửi GET /api/customer/dashboard/{Ma_TK} hoặc /api/photographer/dashboard/{Ma_TK}
3. Backend tính toán thống kê:
   - Khách hàng: số buổi chụp, đã hoàn thành, tin nhắn chưa đọc
   - Nhiếp ảnh gia: số buổi chụp, doanh thu, rating trung bình, tin nhắn chưa đọc
4. Backend trả về dữ liệu
5. Frontend hiển thị cards thống kê, biểu đồ
```

---

## 12. NHÓM CHỨC NĂNG: ADMIN MANAGEMENT

### 12.1. Mô tả chức năng
Quản lý hệ thống cho admin: quản lý khách hàng, nhiếp ảnh gia, buổi chụp, cài đặt hệ thống.

### 12.2. File Backend
*(Có thể chưa được implement đầy đủ)*

### 12.3. File Frontend

#### Components
- **`resources/src/components/AdminApp.tsx`**
  - App chính của admin

- **`resources/src/components/admin/AdminDashboard.tsx`**
  - Dashboard admin

- **`resources/src/components/admin/AdminBookings.tsx`**
  - Quản lý buổi chụp

- **`resources/src/components/admin/AdminCustomers.tsx`**
  - Quản lý khách hàng

- **`resources/src/components/admin/AdminPhotographers.tsx`**
  - Quản lý nhiếp ảnh gia

- **`resources/src/components/admin/AdminSettings.tsx`**
  - Cài đặt hệ thống

---

## 📊 TỔNG KẾT CẤU TRÚC FILE

### Backend Controllers (19 files)
1. `AuthController.php` - Authentication
2. `ProfileController.php` - Profile management
3. `BookingController.php` - Tạo booking
4. `BookingConfirmationController.php` - Xác nhận/từ chối
5. `BookingCancelController.php` - Hủy booking
6. `BookingChangeController.php` - Yêu cầu thay đổi
7. `BookingChangeApprovalController.php` - Duyệt yêu cầu thay đổi
8. `BuoiChupController.php` - Quản lý buổi chụp
9. `CustomerBookingController.php` - Booking của khách hàng
10. `BookingDepositController.php` - Đặt cọc
11. `BookingFinalPaymentController.php` - Thanh toán cuối
12. `VNPayCallbackController.php` - VNPay callback
13. `PhotoUploadController.php` - Upload ảnh
14. `PhotoDownloadController.php` - Download ảnh
15. `ChatController.php` - Chat
16. `ReviewController.php` - Đánh giá
17. `PhotographerController.php` - Nhiếp ảnh gia
18. `CustomerController.php` - Khách hàng
19. *(Admin controllers nếu có)*

### Frontend Components (50+ files)
- **Customer**: `CustomerAuth.tsx`, `CustomerHome.tsx`, `CustomerBookings.tsx`, `CustomerChat.tsx`, `CustomerProfile.tsx`, `CustomerEditProfile.tsx`, `PhotographerPortfolioModal.tsx`
- **Photographer**: `PhotographerAuth.tsx`, `PhotographerHome.tsx`, `PhotographerBookings.tsx`, `BookingDetail.tsx`, `PhotographerChat.tsx`, `PhotographerProfile.tsx`, `PhotographerEditProfile.tsx`, `PhotographerGallery.tsx`
- **Admin**: `AdminApp.tsx`, `AdminDashboard.tsx`, `AdminBookings.tsx`, `AdminCustomers.tsx`, `AdminPhotographers.tsx`, `AdminSettings.tsx`
- **Shared**: `LandingPage.tsx`, `PhotographerDiscovery.tsx`, `FeaturedPhotographers.tsx`, `ChangeRequestSidebar.tsx`
- **Services**: `apiClient.ts`, `BookingAPI.ts`, `chatApi.ts`, `PaymentAPI.ts`, `PhotoAPI.ts`, `customerApi.ts`, `photographerApi.ts`
- **UI Components**: 40+ components trong `ui/` folder

### Models (10 files)
1. `User.php` - Tài khoản
2. `KhachHang.php` - Khách hàng
3. `NhiepAnhGia.php` - Nhiếp ảnh gia
4. `BuoiChup.php` - Buổi chụp
5. `YeuCauChup.php` - Yêu cầu chụp
6. `ThanhToan.php` - Thanh toán
7. `TinNhan.php` - Tin nhắn
8. `Anh.php` - Ảnh
9. `DichVu.php` - Dịch vụ
10. `TransactionLog.php` - Log giao dịch

---

## 🔄 LUỒNG HOẠT ĐỘNG TỔNG QUAN

### Vòng đời một buổi chụp
```
1. Khách hàng đặt lịch → Trạng thái: "Chờ xác nhận"
2. Nhiếp ảnh gia xác nhận → "Chờ đặt cọc"
3. Khách hàng đặt cọc → "Chờ thanh toán"
4. Nhiếp ảnh gia bắt đầu buổi chụp → "Đang diễn ra"
5. Nhiếp ảnh gia kết thúc buổi chụp → "Chờ xử lý ảnh"
6. Nhiếp ảnh gia upload ảnh hậu kỳ → "Đã xử lý ảnh"
7. Khách hàng thanh toán phần còn lại → "Đã hoàn thành"
8. Khách hàng đánh giá nhiếp ảnh gia
```

---

## 📝 GHI CHÚ

- Tất cả API routes đều có prefix `/api`
- Hầu hết routes cần authentication (`auth:sanctum` middleware)
- Frontend sử dụng React Router để điều hướng
- Realtime chat sử dụng Laravel Echo + Pusher
- Payment tích hợp VNPay và ví cá nhân
- File storage sử dụng Laravel Storage (private storage)
- Email notification cho thanh toán (DepositReceiptMail, FinalReceiptMail)

---

**Tài liệu này được tạo tự động dựa trên codebase hiện tại.**
**Ngày tạo: 2025**

