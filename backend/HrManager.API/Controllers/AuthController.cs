using HrManager.API.Data;
using HrManager.API.DTOs;
using HrManager.API.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HrManager.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(HrDbContext db, JwtService jwt, IWebHostEnvironment env) : ControllerBase
{
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ────────────────────────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        // 1. Tìm user + kiểm tra mật khẩu
        var user = await db.Users
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Username == req.Username && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không đúng." });

        // 2. Kiểm tra Device Binding
        // Admin & Manager không bị giới hạn thiết bị — họ cần login từ nhiều nơi
        bool needDeviceCheck = user.Role == "employee";

        if (needDeviceCheck)
        {
            if (user.DeviceId is null)
            {
                // Lần đầu đăng nhập → bind máy này
                user.DeviceId      = req.DeviceId;
                user.DeviceBoundAt = DateTime.UtcNow;
            }
            else if (user.DeviceId != req.DeviceId)
            {
                if (env.IsDevelopment())
                {
                    // ── CHẾ ĐỘ DEV: tự động rebind, không block ──
                    // Hữu ích khi clear cache, đổi trình duyệt khi test
                    user.DeviceId      = req.DeviceId;
                    user.DeviceBoundAt = DateTime.UtcNow;
                }
                else
                {
                    // ── PRODUCTION: block cứng, yêu cầu IT hỗ trợ ──
                    return StatusCode(403, new
                    {
                        code    = "DEVICE_MISMATCH",
                        message = "Tài khoản này đã được đăng ký trên một thiết bị khác. " +
                                  "Vui lòng liên hệ bộ phận IT để được hỗ trợ.",
                    });
                }
            }
        }

        // 3. Cập nhật last login
        user.LastLogin = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // 4. Tạo JWT
        var fullName = user.Employee?.FullName ?? user.Username;
        var token    = jwt.Generate(user.Username, user.Role, fullName);

        return Ok(new LoginResponse
        {
            Token    = token,
            Role     = user.Role,
            FullName = fullName,
        });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/auth/reset-device/{username}
    // IT/Admin dùng để gỡ binding — cho phép user đăng nhập lại từ máy mới
    // ────────────────────────────────────────────────────────────
    [HttpPost("reset-device/{username}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ResetDevice(string username)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user is null)
            return NotFound(new { message = $"Không tìm thấy tài khoản '{username}'." });

        var oldDevice = user.DeviceId ?? "(chưa bind)";

        user.DeviceId      = null;    // xoá binding
        user.DeviceBoundAt = null;
        user.UpdatedAt     = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new
        {
            message   = $"Đã gỡ liên kết thiết bị cho '{username}'. " +
                         "Lần đăng nhập tiếp theo sẽ tự động bind thiết bị mới.",
            oldDevice = oldDevice,
        });
    }

    // ────────────────────────────────────────────────────────────
    // GET /api/auth/device-info/{username}
    // Xem thông tin thiết bị đang bind của 1 tài khoản
    // ────────────────────────────────────────────────────────────
    [HttpGet("device-info/{username}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeviceInfo(string username)
    {
        var user = await db.Users
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user is null)
            return NotFound(new { message = $"Không tìm thấy tài khoản '{username}'." });

        return Ok(new
        {
            username       = user.Username,
            fullName       = user.Employee?.FullName,
            deviceId       = user.DeviceId ?? null,
            deviceBoundAt  = user.DeviceBoundAt,
            isBound        = user.DeviceId is not null,
            lastLogin      = user.LastLogin,
        });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/auth/seed-admin
    // Chỉ chạy được khi DB chưa có user nào
    // ────────────────────────────────────────────────────────────
    [HttpPost("seed-admin")]
    public async Task<IActionResult> SeedAdmin([FromBody] LoginRequest req)
    {
        if (await db.Users.AnyAsync())
            return Conflict(new { message = "Hệ thống đã có tài khoản. Endpoint này bị khoá." });

        var emp = new HrManager.API.Models.Employee
        {
            EmployeeCode = "NV-0001",
            FullName     = "Quản Trị Viên",
            Status       = "active",
            StartDate    = DateOnly.FromDateTime(DateTime.Today),
            BaseSalary   = 0,
        };
        db.Employees.Add(emp);
        await db.SaveChangesAsync();

        var user = new HrManager.API.Models.User
        {
            EmployeeId   = emp.Id,
            Username     = req.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, 10),
            Role         = "admin",
            IsActive     = true,
            // Admin không bị giới hạn thiết bị
            DeviceId     = null,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new { message = $"Đã tạo tài khoản admin '{req.Username}' thành công." });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/auth/set-password
    // ────────────────────────────────────────────────────────────
    [HttpPost("set-password")]
    public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
        if (user is null)
            return NotFound(new { message = $"Không tìm thấy tài khoản '{req.Username}'." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword, 10);
        user.UpdatedAt    = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = $"Đã cập nhật mật khẩu cho '{req.Username}' thành công." });
    }
}
