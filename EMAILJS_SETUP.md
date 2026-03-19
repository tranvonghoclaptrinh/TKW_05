# Hướng dẫn cấu hình EmailJS cho trang Liên hệ

## Bước 1: Đăng ký EmailJS
1. Truy cập: https://www.emailjs.com/
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

## Bước 2: Tạo Email Service
1. Vào Dashboard > Email Services
2. Chọn provider (Gmail, Outlook, Yahoo, etc.)
3. Cấu hình:
   - Service Name: HUIT Contact Form
   - Connect Account: Điền thông tin email gửi

## Bước 3: Tạo Email Template
1. Vào Dashboard > Email Templates
2. Tạo template mới với nội dung:

**Subject:**
```
Liên hệ từ {{from_name}} - Website HUIT
```

**Body:**
```
Xin chào Khoa CNTT HUIT,

Bạn nhận được liên hệ mới từ website:

👤 Tên: {{from_name}}
📧 Email: {{from_email}}

💬 Nội dung:
{{message}}

---
Email này được gửi tự động từ form liên hệ website HUIT.
```

## Bước 4: Lấy API Keys
Trong Dashboard, copy:
- **Service ID**: Từ Email Services
- **Template ID**: Từ Email Templates
- **Public Key**: Từ Account > General

## Bước 5: Cập nhật code
Trong file `lienhe.html`, thay thế:
- `YOUR_PUBLIC_KEY` → Public Key của bạn
- `YOUR_SERVICE_ID` → Service ID
- `YOUR_TEMPLATE_ID` → Template ID

## Bước 6: Test
1. Mở trang lienhe.html
2. Điền form và gửi
3. Kiểm tra email nhận được

## Lưu ý
- EmailJS miễn phí cho 200 email/tháng
- Có thể upgrade nếu cần nhiều hơn
- Bảo mật thông tin API keys

