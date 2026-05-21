# ZenTask 🚀 — Trình Quản Lý Công Việc Glassmorphism Hiện Đại

Chào mừng bạn đến với **ZenTask**! Đây là một ứng dụng quản lý công việc cá nhân (Task Manager) theo phương pháp Kanban kết hợp Danh sách chi tiết. Ứng dụng được thiết kế theo phong cách giao diện **Glassmorphism cao cấp**, hiện đại, trực quan và tối ưu trải nghiệm người dùng với các hoạt ảnh chuyển động mượt mà.

👉 **Đặc biệt**: Tích hợp sẵn hiệu ứng pháo hoa ăn mừng (Confetti Canvas) khi bạn hoàn thành nhiệm vụ và hỗ trợ đầy đủ chế độ Sáng/Tối (Light/Dark Mode)!

---

## ✨ Tính Năng Nổi Bật

1. **Giao Diện Glassmorphism Premium**: 
   - Hiệu ứng kính mờ thời thượng (`backdrop-filter: blur(16px)`).
   - Đường viền phát sáng nhẹ, dải màu gradient tím-hồng sang trọng.
   - Hỗ trợ đầy đủ **Chế độ Sáng / Tối (Light/Dark Mode)** tự động lưu theo tùy chọn của bạn.
2. **Kéo Thả Kanban (Drag & Drop Native)**:
   - Phân loại công việc trực quan qua 4 trạng thái: *Cần làm*, *Đang làm*, *Đang duyệt*, *Đã xong*.
   - Kéo thả thẻ mượt mà để chuyển đổi trạng thái tức thì.
3. **Thống Kê Sinh Động (Analytics)**:
   - Vòng tròn hiệu suất hoàn thành dạng SVG chạy động.
   - Các chỉ số thống kê công việc tự động cập nhật kèm theo các câu nói động viên ý nghĩa.
4. **Quản Lý Việc Phụ (Subtasks)**:
   - Thêm danh sách việc phụ nhỏ hơn cho từng nhiệm vụ lớn.
   - Tự động hiển thị và cập nhật thanh tiến độ việc phụ trên thẻ công việc ngoài trang chủ.
5. **Bộ Lọc & Tìm Kiếm Thông Minh**:
   - Tìm kiếm thời gian thực theo tên hoặc mô tả công việc.
   - Bộ lọc danh mục ở Sidebar (Công việc, Cá nhân, Sức khỏe, Học tập, Mua sắm) có hiển thị số đếm.
   - Lọc theo mức độ ưu tiên (Cao, Trung bình, Thấp) và sắp xếp linh hoạt theo hạn chót hoặc chữ cái.
6. **Sao Lưu & Phục Hồi Dữ Liệu**:
   - Xuất dữ liệu công việc hiện tại ra tệp `.json` để lưu trữ.
   - Nhập tệp sao lưu JSON bất cứ lúc nào mà không làm mất dữ liệu.
7. **Ăn Mừng Thành Tích (Confetti Effect)**:
   - Hiệu ứng pháo hoa rơi cực đẹp mắt bằng thẻ HTML5 `<canvas>` kích hoạt ngay khi bạn chuyển trạng thái công việc sang **Đã xong**!

---

## 🛠️ Công Nghệ Sử Dụng

- **Cấu trúc**: HTML5 (Semantic HTML, SVG, Canvas).
- **Giao diện**: CSS3 thuần (CSS Variables, Flexbox, Grid Layout, Custom Scrollbars, Keyframes Animations).
- **Logic**: Vanilla Javascript (Drag and Drop API, LocalStorage API, Canvas 2D Context).
- **Biểu tượng**: Lucide Icons.
- **Phông chữ**: Google Fonts (Inter & Outfit).

---

## 💻 Cách Chạy Ứng Dụng Cục Bộ

1. Tải toàn bộ mã nguồn về máy tính của bạn.
2. Click đúp chuột vào tệp `index.html` để mở ứng dụng trực tiếp trên bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Safari) mà không cần cài đặt thêm bất kỳ môi trường nào!

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Tạo Link Truy Cập Trực Tuyến (GitHub Pages)

Để đưa ứng dụng này lên mạng Internet và có một liên kết (link) truy cập từ bất kỳ đâu, bạn hãy thực hiện theo các bước cực kỳ đơn giản sau:

### Bước 1: Tạo kho lưu trữ (Repository) trên GitHub
1. Truy cập vào trang web [GitHub](https://github.com/) và đăng nhập tài khoản của bạn.
2. Nhấp vào nút **New** (hoặc dấu cộng `+` ở góc trên cùng bên phải -> chọn *New repository*).
3. Nhập tên kho chứa (ví dụ: `zentask`), để chế độ **Public** (Công khai).
4. Nhấp vào nút **Create repository** ở dưới cùng. (Giữ nguyên trang này để lấy link Git của bạn).

### Bước 2: Liên kết và tải mã nguồn lên GitHub (Chạy lệnh Git)
Mở cửa sổ dòng lệnh (Terminal/Command Prompt) tại thư mục `task-manager` trên máy của bạn và chạy tuần tự các lệnh sau:

```bash
# 1. Thêm toàn bộ tệp vào danh sách chuẩn bị commit
git add .

# 2. Tạo bản lưu trữ commit đầu tiên
git commit -m "Initial commit: ZenTask premium task manager"

# 3. Đổi tên nhánh mặc định thành main
git branch -M main

# 4. Liên kết thư mục local với kho chứa GitHub của bạn
# (LƯU Ý: Thay thế URL bằng liên kết kho chứa của bạn vừa tạo ở Bước 1)
git remote add origin https://github.com/TÊN_TÀI_KHOẢN_CỦA_BẠN/TÊN_KHO_LƯU_TRỮ.git

# 5. Đẩy mã nguồn lên GitHub
git push -u origin main
```

### Bước 3: Kích hoạt GitHub Pages để nhận Link truy cập miễn phí
1. Tại giao diện kho chứa của bạn trên GitHub, nhấp vào tab **Settings** (Cài đặt) ở thanh công cụ phía trên.
2. Tìm đến mục **Pages** ở danh mục bên trái (trong nhóm *Code and automation*).
3. Tại phần **Build and deployment** -> **Branch**:
   - Chọn nhánh là `main`.
   - Chọn thư mục là `/ (root)`.
4. Nhấp nút **Save** (Lưu).
5. Chờ khoảng 1-2 phút, tải lại trang Cài đặt đó. Bạn sẽ thấy một dòng thông báo màu xanh lá cây hiển thị liên kết trực tuyến của bạn, có dạng:
   👉 **`https://TÊN_TÀI_KHOẢN_CỦA_BẠN.github.io/TÊN_KHO_LƯU_TRỮ/`**

Bây giờ bạn đã có một đường link website cá nhân xịn mịn để truy cập và quản lý công việc của mình từ mọi thiết bị di động hoặc máy tính khác nhau! 🎉
