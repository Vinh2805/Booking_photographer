# 📋 BÁO CÁO CHỨC NĂNG HỆ THỐNG BOOKING PHOTOGRAPHER
*(Cập nhật ngày 10/12/2025)*

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
11. [Nhóm chức năng Admin Management (Quản trị viên)](#11-nhóm-chức-năng-admin-management-quản-trị-viên)

---

## 1. TỔNG QUAN HỆ THỐNG

### Mô tả
Hệ thống đặt lịch chụp ảnh trực tuyến kết nối khách hàng với nhiếp ảnh gia. Hệ thống hỗ trợ toàn diện quy trình từ tìm kiếm, đặt lịch, thanh toán, quản lý buổi chụp, chat trực tuyến, đến upload/download ảnh và đánh giá chất lượng.

### Kiến trúc công nghệ
- **Backend Framework**: Laravel 12 (PHP 8.2+)
- **Frontend Framework**: React 19 + TypeScript + Vite + TailwindCSS
- **Database**: MySQL/MariaDB
- **Authentication**: Laravel Sanctum (Token-based)
- **Realtime Communication**: Laravel Echo + Pusher (Chat, Notifications)
- **Payment Gateway**: VNPay & Ví nội bộ

---

## 2. NHÓM CHỨC NĂNG: AUTHENTICATION & AUTHORIZATION

### 2.1. Mô tả chi tiết
Quản lý định danh, xác thực và phân quyền cho 3 đối tượng: Khách hàng (Customer), Nhiếp ảnh gia (Photographer), và Quản trị viên (Admin).

### 2.2. Backend (API & Logic)
- **Controllers**: `AuthController`, `AdminAuthController`
- **Luồng xử lý chính**:
    - **Đăng ký**: Validate dữ liệu -> Tạo bản ghi `User` -> Tạo bản ghi chi tiết (`KhachHang`/`NhiepAnhGia`) -> Cấp Sanctum Token.
    - **Đăng nhập**: Kiểm tra credentials -> Cấp Sanctum Token mới.
    - **Đăng xuất**: Thu hồi Token hiện tại.
    - **Admin Login**: Cơ chế đăng nhập riêng biệt cho Admin.

### 2.3. Frontend (UI/UX)
- **Components**: `CustomerAuth`, `PhotographerAuth`, `AdminLogin`.
- **Logic**: Lưu trữ Token vào `localStorage` (`customer_token`, `photographer_token`, `admin_token`), sử dụng Interceptor axios để đính kèm token vào mọi request.

---

## 3. NHÓM CHỨC NĂNG: PROFILE MANAGEMENT

### 3.1. Mô tả chi tiết
Cho phép người dùng quản lý thông tin cá nhân, hình ảnh đại diện, ảnh bìa và portfolio (đối với nhiếp ảnh gia).

### 3.2. Cải tiến mới
- **Avatar/Cover/Portfolio URL**: Backend (`User` model, `ProfileController`) đã được cập nhật để trả về **Full URL** cho các file ảnh (sử dụng accessor `avatar_url`), đảm bảo hiển thị đúng ảnh dù lưu trữ local hay cloud.
- **Data Consistency**: Đồng bộ hóa việc gọi tên trường dữ liệu giữa Frontend (`So_Dien_Thoai`) và Backend (`So_ĐT`).

### 3.3. Luồng hoạt động
- **Upload**: `Multipart/form-data` -> Backend validate -> Lưu Storage -> Trả về URL.
- **View**: API trả về object User kèm `avatar_url` được tính toán tự động.

---

## 4. NHÓM CHỨC NĂNG: BOOKING MANAGEMENT (QUẢN LÝ ĐẶT LỊCH)

### 4.1. Mô tả chi tiết
Core feature của hệ thống. Quản lý vòng đời buổi chụp: Tạo mới -> Xác nhận -> Đặt cọc -> Chụp -> Xử lý ảnh -> Hoàn thành.

### 4.2. Logic Tự động hóa (Mới cập nhật)
- **Xung đột lịch**: Khi Nhiếp ảnh gia **Xác nhận** một booking ("Chờ xác nhận" -> "Chờ đặt cọc"):
    - Hệ thống tự động quét các booking khác có trạng thái "Chờ xác nhận" trùng khung giờ của nhiếp ảnh gia đó.
    - Tự động chuyển các booking trùng lịch sang trạng thái "**Đã hủy**".
    - Ghi lý do hủy: "Nhiếp ảnh gia đã nhận lịch khác trùng khung giờ này".
- **Lợi ích**: Ngăn chặn double-booking, giảm thao tác thủ công cho nhiếp ảnh gia.

### 4.3. Các trạng thái (Status Flow)
1. `pending_confirmation` (Chờ xác nhận): Khách mới đặt.
2. `pending_deposit` (Chờ đặt cọc): NAG đã nhận, chờ khách thanh toán cọc.
3. `upcoming` (Sắp diễn ra/Chờ chụp): Đã cọc xong.
4. `ongoing` (Đang diễn ra): NAG bấm bắt đầu.
5. `processing_photos` (Đang xử lý/Chờ thanh toán sau): Chụp xong, chờ thanh toán nốt hoặc đang edit.
6. `completed` (Hoàn thành): Đã trả ảnh và thanh toán đủ.
7. `cancelled`, `disputed`: Các trạng thái ngoại lệ.

---

## 5. NHÓM CHỨC NĂNG: PAYMENT PROCESSING

### 5.1. Các phương thức
- **Ví cá nhân (Internal Wallet)**: Trừ tiền trực tiếp từ số dư tài khoản.
- **VNPay**: Cổng thanh toán bên ngoài.

### 5.2. Quy trình
- **Đặt cọc (Deposit)**: Thường là 30% giá trị hợp đồng.
- **Thanh toán cuối (Final Payment)**: 70% còn lại sau khi chụp xong.
- **Hoàn tiền**: Tự động hoàn tiền vào Ví cá nhân nếu booking bị hủy theo chính sách.

---

## 6. NHÓM CHỨC NĂNG: WALLET MANAGEMENT (VÍ CÁ NHÂN)

### 6.1. Chức năng
- **Nạp tiền**: Tạo mã QR VietQR động để khách nạp tiền vào ví.
- **Rút tiền**: Khách/NAG yêu cầu rút tiền về tài khoản ngân hàng liên kết.
- **Lịch sử giao dịch**: Ghi lại mọi biến động số dư (Nạp, Rút, Thanh toán booking, Nhận tiền booking).

---

## 7. NHÓM CHỨC NĂNG: PHOTO MANAGEMENT

### 7.1. Chức năng
- **Upload**: Nhiếp ảnh gia upload file (thường là ZIP) chứa ảnh gốc hoặc ảnh đã chỉnh sửa.
- **Download**: Khách hàng tải file về sau khi thanh toán đầy đủ.
- **Lưu trữ**: File được quản lý trong thư mục `storage/app/private/public/uploads`.

---

## 8. NHÓM CHỨC NĂNG: CHAT/MESSAGING

### 8.1. Công nghệ
- **Realtime**: Sử dụng Laravel Echo và Pusher.
- **Kênh (Channels)**: Private channel cho từng booking (`chat.booking.{id}`).

### 8.2. Tính năng
- Chat 1-1 giữa Khách hàng và NAG trong ngữ cảnh một booking cụ thể.
- Lịch sử chat được lưu trong database.
- Trạng thái tin nhắn (Đã gửi, Đã xem).

---

## 9. NHÓM CHỨC NĂNG: REVIEW & RATING

### 9.1. Logic
- Khách hàng đánh giá NAG sau khi booking `Hoàn thành`.
- Hệ thống tính điểm trung bình (Sao) cho NAG.
- Admin có thể xem chi tiết nội dung đánh giá của từng booking.

---

## 10. NHÓM CHỨC NĂNG: PHOTOGRAPHER DISCOVERY

### 10.1. Tìm kiếm & Lọc
- Tìm theo tên, địa điểm, thể loại chụp, mức giá.
- Sắp xếp theo đánh giá cao, phổ biến.

### 10.2. Hiển thị
- Portfolio ảnh đẹp mắt.
- Thông tin chi tiết gói chụp, bảng giá.

---

## 11. NHÓM CHỨC NĂNG: ADMIN MANAGEMENT (QUẢN TRỊ VIÊN)

### 11.1. Tổng quan
Dashboard dành cho quản trị viên hệ thống để giám sát và can thiệp mọi hoạt động.

### 11.2. Các module chi tiết (Đã cập nhật & Hoàn thiện)

#### A. Quản lý Buổi chụp (Bookings) - `AdminBookings.tsx`
- **Danh sách**: Xem toàn bộ booking với bộ lọc chi tiết (Trạng thái, Thời gian, Tên,...).
- **Chi tiết Booking**:
    - Thông tin đầy đủ: Thời gian, Địa điểm, Giá tiền.
    - **Thông tin Review**: Hiển thị số sao và nội dung đánh giá của khách hàng (nếu có) ngay trong popup chi tiết -> Giúp Admin phát hiện booking bị đánh giá thấp.
    - Thông tin đối tác: Avatar, Tên, SĐT của cả Khách và NAG.
- **Hành động**: Hủy booking (với lý do), Phê duyệt tranh chấp.

#### B. Quản lý Khách hàng (Customers) - `AdminCustomers.tsx`
- **Danh sách**: Tìm kiếm, lọc khách hàng.
- **Thống kê thực tế** (Real-time Stats):
    - **Tổng chi tiêu**: Tính tổng tiền từ các booking đã thực hiện.
    - **Tổng số booking**: Đếm số lượng booking.
    - **Số booking hoàn thành**: Đếm số booking thành công.
- **Hành động**: Khóa/Mở khóa tài khoản.

#### C. Quản lý Nhiếp ảnh gia (Photographers) - `AdminPhotographers.tsx`
- **Danh sách**: Theo dõi NAG, lọc theo trạng thái duyệt (Chờ duyệt, Đã duyệt).
- **Thông tin chi tiết**: Xem Portfolio, Doanh thu, Đánh giá trung bình.
- **Phê duyệt**: Duyệt hồ sơ NAG mới đăng ký.

### 11.3. Cải tiến UI/UX Admin (Mới nhất)
- **Fix hiển thị**: Đã sửa lỗi hiển thị sai Số điện thoại (do sai key `So_Dien_Thoai` vs `So_ĐT`).
- **Styling**: Cập nhật giao diện Tabs trong chi tiết Booking để hiển thị trạng thái active rõ ràng (`!bg-blue-500`, text-white).
- **Avatar**: Sử dụng cơ chế `avatar_url` chuẩn hóa để hiển thị ảnh đại diện người dùng chính xác.
