HOANGWER GET KEY SYSTEM - 24H

Cài đặt:
1. Cài Node.js.
2. Mở Terminal trong thư mục này.
3. Chạy: npm install
4. Chạy: npm start
5. Mở: http://localhost:3000

LUỒNG:
- GET KEY sao chép https://lootdest.org/s?zWYWojtG
- Mở Lootdest trong tab mới.
- Bản này tạo key sau khi bắt đầu flow và key có hạn 24 giờ.
- Key được chọn ngẫu nhiên từ danh sách trong server.js.

QUAN TRỌNG:
Đây là bản demo. Trang web không thể tự biết người dùng đã hoàn thành offer Lootdest chỉ bằng việc họ quay lại trang.
Muốn khóa chính xác cho đến khi offer hoàn thành, cần cơ chế callback/postback của Lootdest hoặc một API xác minh completion.
Ngoài ra, bộ nhớ key hiện tại nằm trong RAM; restart server sẽ xóa trạng thái key.
