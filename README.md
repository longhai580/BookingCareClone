# BookingCare Clone

Nền tảng đặt lịch khám bệnh trực tuyến gồm:

- `BookingCareClone/` — backend Node.js + Express + Sequelize (PostgreSQL), cổng 8080
- `fe-booking-care-clone/` — frontend React (CRA), cổng 3000

## Chức năng

**Người bệnh**
- Trang chủ: tìm kiếm nhanh bác sĩ / chuyên khoa / cơ sở y tế / cẩm nang, chuyên khoa, cơ sở y tế, bác sĩ nổi bật, cẩm nang
- Danh sách: chuyên khoa (`/specialties`), cơ sở y tế (`/clinics`), bác sĩ có lọc theo chuyên khoa & tỉnh thành (`/doctors`), cẩm nang (`/handbooks`)
- Chi tiết bác sĩ / chuyên khoa / cơ sở y tế / bài cẩm nang
- Đặt lịch khám: chọn ngày (7 ngày tới) và khung giờ, kiểm tra hợp lệ form, ẩn giờ đã qua, báo hết chỗ, chặn đặt trùng
- Xác nhận lịch qua email (`/verify-booking`), tra cứu lịch hẹn theo email (`/my-bookings`)
- Song ngữ Việt / Anh, giao diện responsive cho điện thoại

**Quản trị (admin)** — `/system/...`
- Bảng điều khiển thống kê
- Quản lý người dùng, thông tin bác sĩ, kế hoạch khám
- Thêm / sửa / xoá chuyên khoa, phòng khám, cẩm nang

**Bác sĩ** — `/doctor/...`
- Tạo kế hoạch khám của chính mình
- Danh sách bệnh nhân theo ngày & trạng thái, gửi kết quả khám, huỷ lịch

## Chạy local

### 1. Database (PostgreSQL)

```bash
docker run -d --name bookingcare-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bookingcare -p 5433:5432 postgres:14.1-alpine
```

### 2. Backend

```bash
cd BookingCareClone
cp src/.env.example src/.env      # sửa thông tin DB nếu không dùng lệnh docker ở trên
npm install
npx sequelize-cli db:migrate
docker exec -i bookingcare-db psql -U postgres -d bookingcare -c 'TRUNCATE "SequelizeMeta"'
docker exec -i bookingcare-db psql -U postgres -d bookingcare < data.postgres.sql
npx sequelize-cli db:seed --seed seeder-demo-data.js
npm start
```

- `data.postgres.sql` là bản chuyển từ `data.sql` (cú pháp MySQL) sang PostgreSQL.
- Seed demo (`src/seeders/seeder-demo-data.js`) tạo lịch khám 14 ngày tới, 6 bài cẩm nang và đặt mật khẩu `123456` cho tài khoản test: admin `hai@gmail.com`, bác sĩ `hai123@gmail.com`.
- Không cấu hình `EMAIL_APP` / `EMAIL_APP_PASSWORD` (Gmail app password) thì hệ thống không gửi mail; ở môi trường `development` API đặt lịch trả về link xác nhận để bấm trực tiếp trên giao diện.

### 3. Frontend

```bash
cd fe-booking-care-clone
cp .env.example .env.local
npm install --legacy-peer-deps
npm start
```

Mở http://localhost:3000
