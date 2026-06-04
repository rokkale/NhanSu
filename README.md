# HR Manager

## Yêu cầu cài đặt

| Tool | Phiên bản | Tải về |
|------|-----------|--------|
| Node.js | 20 LTS | https://nodejs.org |
| Visual Studio 2022 | 17.x | https://visualstudio.microsoft.com (chọn workload **ASP.NET and web development**) |
| .NET SDK | 8.0 | Cài kèm VS 2022 |

---

## Chạy Backend (Visual Studio 2022)

1. Mở file `backend\HrManager.API\HrManager.API.csproj` bằng VS 2022
2. Sửa `appsettings.json`:
   - `ConnectionStrings.Default` → đổi `your_password_here` thành mật khẩu SQL Server
   - `Jwt.Key` → đổi thành chuỗi bí mật dài ít nhất 32 ký tự
3. Nhấn **F5** hoặc nút Run
4. API chạy tại `https://localhost:7080`
5. Swagger UI: `https://localhost:7080/swagger`

---

## Chạy Frontend

Mở terminal tại thư mục `frontend/`:

```bash
npm install
npm run dev
```

Truy cập: http://localhost:3000

---

## Cấu trúc project

```
Manager_CPMMBD/
├── frontend/                        # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/LoginPage.jsx      # Giao diện đăng nhập
│       ├── api/auth.js              # Gọi API
│       └── App.jsx
│
└── backend/
    └── HrManager.API/               # ASP.NET Core 8 Web API
        ├── Controllers/
        │   └── AuthController.cs    # POST /api/auth/login
        ├── Services/JwtService.cs
        ├── Data/HrDbContext.cs      # Entity Framework Core
        ├── Models/                  # User, Employee
        ├── DTOs/                    # LoginRequest, LoginResponse
        └── Program.cs
```

---

## Tạo tài khoản admin lần đầu

Chạy đoạn SQL sau trong SQL Server Management Studio để tạo user test:

```sql
USE TestNghiepVuCty;

-- Tạo nhân viên admin
INSERT INTO employees (employee_code, full_name, status, start_date)
VALUES ('EMP001', 'Quản trị viên', 'active', '2024-01-01');

-- Tạo tài khoản (password: Admin@123)
-- Hash được tạo bằng BCrypt cost=10
INSERT INTO users (employee_id, username, password_hash, role, is_active)
VALUES (
    SCOPE_IDENTITY(),
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO',
    'admin',
    1
);
```

> Mật khẩu mặc định: `Admin@123`
