-----------------------------------------------------------------------------------------------------------------
# 📘 HƯỚNG DẪN MỌI NGƯỜI CLONE FRAMEWORK LARAVEL VỀ MÁY VÀ SỬ DỤNG NÓ

![Laravel](https://img.shields.io/badge/Laravel-12-red?logo=laravel)

---

## 📖 Giới thiệu
Hướng dẫn cách **clone framework Laravel 12** từ GitHub về máy tính, cấu hình và chạy dự án trên môi trường local.  
Mục tiêu là giúp mọi người làm quen nhanh với Laravel.

---

## ⚡ Yêu cầu hệ thống  
- **Composer** mới nhất  
- **XAMPP** mới nhất 
- **Môi trường Node.js & NPM** (dùng cho frontend build)  
- **Git**
- **GitHub Desktop**
---

## ⚙️ Cài đặt
Làm lần lượt các bước sau:
- B1: Clone framework từ GitHub về máy bằng Git hoặc GitHub Desktop.
Với ae dùng GitHub Desktop, chọn **file > clone repository > URL** dán đường link github của nhóm trưởng vào đó và nhấn clone.
- B2: Mở VS Code cái framework đã clone về máy. Lúc này đây có thể sẽ thiếu 1 số file mà máy không clone được hết cụ thể thiếu các file liên quan đến cơ sở dữ liệu
(.env và database.sqlite, ...)
- B3: Tạo thủ công file .env và copy nội dung từ file .env.example qua rồi chạy các lệnh dưới đây:
```bash
# Tự động thêm app_key về file .env
php artisan key:generate
```
```bash
# Clear cache và config
php artisan config:clear

php artisan cache:clear

```
- B4: Sau khi tạo xong file .env thì chạy các lệnh dưới đây:
```bash
# Tải lại composer để máy biết framework clone đó là laravel
composer i
# Lúc composer có bị lỗi fail download thì liên hệ nhóm trưởng để được xử lý!
```
```bash
# Rồi bắt đầu tạo file database.sqlite
php artisan migrate --seed
```
```bash
# Sau đó chạy lệnh để đọc frontend trong laravel
npm i
```
```bash
# Chạy lệnh dưới đây để mở server cho laravel truy cập được
npm run dev
```
```bash
# Sau khi xong tất cả câu lệnh trên thì mở terminal mới chạy câu lệnh này là xong
php artisan serve
# Nếu hiện link URL để hiển thị trang web tức là đã thành công!
```
## 🤌 Hướng dẫn đồng bộ database của mysql trong xampp với database trong framework Laravel
Làm theo các bước dưới đây:
- B1: Bật xampp chạy mysql và apache. Xong truy cập đường dẫn "localhost/phpmyadmin" để tạo database rỗng!
- B2: Sau khi tạo thì chọn database đã tạo và import dữ liệu từ file momentia.sql được lưu ở thư mục Database của framework Laravel (Nếu chưa có thì pull lại)
- B3: Sửa file .env trong framework:
```bash
# Tìm đến DB_CONNECTION, bỏ hết dấu thăng và sửa như dưới đây
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=momentia
# VD: database name của tôi là momentia!
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=file
```
Còn lại mọi người nhờ chatGPT để xử lý nhé! Xin cảm ơn.

