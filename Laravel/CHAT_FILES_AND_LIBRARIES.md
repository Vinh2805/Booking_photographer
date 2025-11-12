# 📋 Danh sách File và Thư viện liên quan đến Chat

## 🔴 BACKEND (Laravel/PHP)

### 📁 Controllers
- `app/Http/Controllers/ChatController.php` - Controller xử lý các API chat
  - `index()` - Lấy lịch sử tin nhắn theo Ma_BC
  - `store()` - Gửi tin nhắn mới
  - `unread()` - Lấy tin nhắn chưa đọc
  - `markAsRead()` - Đánh dấu tin nhắn đã đọc

### 📁 Events (Broadcasting)
- `app/Events/MessageSent.php` - Event broadcast tin nhắn realtime
  - Broadcast channel: `chat.booking.{Ma_BC}`
  - Event name: `message.sent`

### 📁 Models
- `app/Models/TinNhan.php` - Model tin nhắn
  - Table: `tin_nhan`
  - Relationships: `khachHang()`, `nhiepAnhGia()`

### 📁 Routes
- `routes/api.php` - Định nghĩa API routes cho chat:
  ```php
  GET  /api/chat/unread          - Lấy tin nhắn chưa đọc
  POST /api/chat/mark-read       - Đánh dấu đã đọc
  GET  /api/chat/{Ma_BC}         - Lấy lịch sử tin nhắn
  POST /api/chat                 - Gửi tin nhắn
  ```

- `routes/channels.php` - Định nghĩa broadcast channels:
  - `chat.{Ma_TK}` - Channel cho user cụ thể
  - `chat.booking.{Ma_BC}` - Channel cho buổi chụp cụ thể

### 📁 Database Migrations
- `database/migrations/2025_09_20_093648_create_tin_nhan_table.php` - Tạo bảng tin_nhan
- `database/migrations/2025_11_06_114000_add_loai_tin_to_tin_nhan_table.php` - Thêm cột Loai_Tin

### 📁 Config
- `config/broadcasting.php` - Cấu hình broadcasting (Pusher/Reverb)

---

## 🔵 FRONTEND (React/TypeScript)

### 📁 Components
- `resources/src/components/customer/CustomerChat.tsx` - Component chat cho khách hàng
- `resources/src/components/photographer/PhotographerChat.tsx` - Component chat cho nhiếp ảnh gia
- `resources/src/components/ui/three-way-chat.tsx` - Component chat 3 người (nếu có)

### 📁 Services/API
- `resources/src/components/services/chatApi.ts` - API client cho chat
  - `sendMessage()` - Gửi tin nhắn
  - `getMessagesByBooking()` - Lấy tin nhắn theo booking
  - `getUnreadMessages()` - Lấy tin nhắn chưa đọc
  - `markAsRead()` - Đánh dấu đã đọc

- `resources/src/components/services/apiClient.ts` - Axios client chung (có interceptor cho token)

### 📁 WebSocket/Realtime
- `resources/src/echo.ts` - Cấu hình Laravel Echo và Pusher
  - Khởi tạo Echo instance
  - Cấu hình authentication
  - Export Echo để sử dụng trong components

### 📁 Integration
- `resources/src/components/PhotographerApp.tsx` - App chính của nhiếp ảnh gia (có tích hợp chat)
- `resources/src/components/customer/CustomerApp.tsx` - App chính của khách hàng (có tích hợp chat)

---

## 📦 THƯ VIỆN CẦN CÀI ĐẶT

### 🔴 Backend (composer.json)
```json
{
  "require": {
    "pusher/pusher-php-server": "^7.2"  // Đã có trong composer.json
  }
}
```

**Cài đặt:**
```bash
composer require pusher/pusher-php-server
```

### 🔵 Frontend (package.json)
```json
{
  "dependencies": {
    "laravel-echo": "^2.2.6",      // Đã có trong package.json
    "pusher-js": "^8.4.0",         // Đã có trong package.json
    "axios": "^1.13.2"              // Đã có trong package.json
  }
}
```

**Cài đặt:**
```bash
npm install laravel-echo pusher-js axios
# hoặc
npm install
```

---

## ⚙️ CẤU HÌNH CẦN THIẾT

### 🔴 Backend (.env)
```env
# Broadcasting
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
```

### 🔵 Frontend (.env hoặc .env.local)
```env
VITE_PUSHER_APP_KEY=your_app_key
VITE_PUSHER_APP_CLUSTER=your_cluster
```

---

## 🗄️ CẤU TRÚC DATABASE

### Bảng `tin_nhan`
```sql
- Ma_TN (string, primary key) - Mã tin nhắn
- Ma_BC (string, foreign key) - Mã buổi chụp
- Ma_KH (string, nullable, foreign key) - Mã khách hàng
- Ma_NAG (string, nullable, foreign key) - Mã nhiếp ảnh gia
- Noi_Dung (text) - Nội dung tin nhắn
- Gui_Luc (datetime) - Thời gian gửi
- Trang_Thai (enum: 'Đã gửi', 'Đã đọc') - Trạng thái tin nhắn
- Loai_Tin (enum: 'KH-NAG', 'KH-CSKH') - Loại tin nhắn
```

---

## 🔄 LUỒNG HOẠT ĐỘNG

1. **Gửi tin nhắn:**
   - Frontend: `chatApi.sendMessage()` → POST `/api/chat`
   - Backend: `ChatController@store()` → Tạo record → Broadcast event
   - Realtime: `MessageSent` event → Pusher → Frontend nhận qua Echo

2. **Lấy tin nhắn:**
   - Frontend: `chatApi.getMessagesByBooking()` → GET `/api/chat/{Ma_BC}`
   - Backend: `ChatController@index()` → Trả về danh sách tin nhắn

3. **Realtime:**
   - Frontend subscribe: `Echo.private('chat.booking.{Ma_BC}').listen('message.sent', ...)`
   - Backend broadcast: `broadcast(new MessageSent($user, $message))->toOthers()`

---

## 📝 GHI CHÚ

- Tất cả routes chat đều cần authentication (`auth:sanctum`)
- Broadcast channels là private channels, cần authentication
- Tin nhắn được gắn với buổi chụp (Ma_BC) để quản lý theo booking
- Hỗ trợ đánh dấu đã đọc và lấy tin nhắn chưa đọc
- Có thể mở rộng với chat 3 người (three-way chat) nếu cần

