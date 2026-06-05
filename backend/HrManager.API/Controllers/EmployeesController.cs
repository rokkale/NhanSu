using HrManager.API.Data;
using HrManager.API.DTOs;
using HrManager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HrManager.API.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize]                         // tất cả endpoint đều cần đăng nhập
public class EmployeesController(HrDbContext db) : ControllerBase
{
    // ────────────────────────────────────────────────────────────
    // GET /api/employees/me
    // Nhân viên xem thông tin của chính mình
    // ────────────────────────────────────────────────────────────
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var user = await db.Users
            .Include(u => u.Employee)
                .ThenInclude(e => e!.Department)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user?.Employee is null)
            return NotFound(new { message = "Không tìm thấy thông tin nhân viên." });

        var e = user.Employee;
        return Ok(new
        {
            e.Id,
            e.EmployeeCode,
            e.FullName,
            e.Position,
            e.Phone,
            e.BaseSalary,
            e.Status,
            e.StartDate,
            Department = e.Department?.Name ?? "—",
            user.Role,
            user.LastLogin,
        });
    }

    // ────────────────────────────────────────────────────────────
    // GET /api/employees
    // Admin & Manager xem danh sách tất cả nhân viên
    // ────────────────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int?    departmentId,
        [FromQuery] string? status = "active")
    {
        var query = db.Employees
            .Include(e => e.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(e => e.Status == status);

        if (departmentId.HasValue)
            query = query.Where(e => e.DepartmentId == departmentId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(e =>
                e.FullName.Contains(search) ||
                e.EmployeeCode.Contains(search) ||
                (e.Phone != null && e.Phone.Contains(search)));

        var list = await query
            .OrderBy(e => e.FullName)
            .Select(e => new
            {
                e.Id,
                e.EmployeeCode,
                e.FullName,
                e.DepartmentId,
                e.Position,
                e.Phone,
                e.BaseSalary,
                e.Status,
                e.StartDate,
                Username = e.User != null ? e.User.Username : null,
                Role     = e.User != null ? e.User.Role     : null,
                IsActive = e.User != null ? e.User.IsActive : false,
            })
            .ToListAsync();

        return Ok(list);
    }

    // ────────────────────────────────────────────────────────────
    // GET /api/employees/{id}
    // Chi tiết 1 nhân viên
    // ────────────────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await db.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (e is null)
            return NotFound(new { message = $"Không tìm thấy nhân viên ID = {id}." });

        return Ok(new
        {
            e.Id,
            e.EmployeeCode,
            e.FullName,
            e.DepartmentId,
            e.Position,
            e.Phone,
            e.BaseSalary,
            e.Status,
            e.StartDate,
            e.CreatedAt,
            Username = e.User?.Username,
            Role     = e.User?.Role,
            IsActive = e.User?.IsActive ?? false,
            LastLogin = e.User?.LastLogin,
        });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/employees
    // Tạo nhân viên mới + tài khoản đăng nhập (password đã hash)
    // Chỉ Admin mới được tạo
    // ────────────────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 1. Kiểm tra username chưa tồn tại
        if (await db.Users.AnyAsync(u => u.Username == req.Username))
            return Conflict(new { message = $"Tên đăng nhập '{req.Username}' đã tồn tại." });

        // 2. Tự sinh mã nhân viên nếu không truyền (VD: NV-0043)
        string empCode = req.EmployeeCode?.Trim()
                         ?? await GenerateEmployeeCode();

        // Kiểm tra mã nhân viên chưa trùng
        if (await db.Employees.AnyAsync(e => e.EmployeeCode == empCode))
            return Conflict(new { message = $"Mã nhân viên '{empCode}' đã tồn tại." });

        // 3. Tạo bản ghi Employee
        var employee = new Employee
        {
            EmployeeCode = empCode,
            FullName     = req.FullName.Trim(),
            DepartmentId = req.DepartmentId,
            Position     = req.Position?.Trim(),
            Phone        = req.Phone?.Trim(),
            BaseSalary   = req.BaseSalary,
            StartDate    = req.StartDate,
            Status       = "active",
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync();   // để lấy employee.Id

        // 4. Hash password và tạo User
        var hashedPw = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 10);

        var user = new User
        {
            EmployeeId   = employee.Id,
            Username     = req.Username.Trim(),
            PasswordHash = hashedPw,
            Role         = req.Role,
            IsActive     = true,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, new
        {
            message      = $"Đã tạo nhân viên '{employee.FullName}' thành công.",
            employeeId   = employee.Id,
            employeeCode = employee.EmployeeCode,
            username     = user.Username,
            role         = user.Role,
        });
    }

    // ────────────────────────────────────────────────────────────
    // PUT /api/employees/{id}
    // Cập nhật thông tin nhân viên (và đổi mật khẩu nếu có)
    // ────────────────────────────────────────────────────────────
    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = await db.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null)
            return NotFound(new { message = $"Không tìm thấy nhân viên ID = {id}." });

        // Cập nhật các trường nếu có truyền vào
        if (req.FullName    is not null) employee.FullName     = req.FullName.Trim();
        if (req.DepartmentId.HasValue)   employee.DepartmentId = req.DepartmentId;
        if (req.Position    is not null) employee.Position     = req.Position.Trim();
        if (req.Phone       is not null) employee.Phone        = req.Phone.Trim();
        if (req.BaseSalary.HasValue)     employee.BaseSalary   = req.BaseSalary.Value;
        if (req.Status      is not null) employee.Status       = req.Status;

        employee.UpdatedAt = DateTime.UtcNow;

        // Đổi mật khẩu nếu được yêu cầu
        if (!string.IsNullOrWhiteSpace(req.NewPassword) && employee.User is not null)
        {
            employee.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword, 10);
            employee.User.UpdatedAt    = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        return Ok(new { message = $"Đã cập nhật thông tin '{employee.FullName}' thành công." });
    }

    // ────────────────────────────────────────────────────────────
    // PATCH /api/employees/{id}/toggle-active
    // Khoá / mở khoá tài khoản (không xoá dữ liệu)
    // ────────────────────────────────────────────────────────────
    [HttpPatch("{id:int}/toggle-active")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.EmployeeId == id);

        if (user is null)
            return NotFound(new { message = "Không tìm thấy tài khoản của nhân viên này." });

        user.IsActive  = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var state = user.IsActive ? "mở khoá" : "khoá";
        return Ok(new { message = $"Đã {state} tài khoản thành công.", isActive = user.IsActive });
    }

    // ────────────────────────────────────────────────────────────
    // DELETE /api/employees/{id}
    // Chỉ cho phép khi nhân viên ở trạng thái resigned / chưa có dữ liệu
    // Khuyến nghị: dùng toggle-active thay vì xoá cứng
    // ────────────────────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await db.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null)
            return NotFound(new { message = $"Không tìm thấy nhân viên ID = {id}." });

        // Xoá user trước (FK), rồi xoá employee
        if (employee.User is not null)
            db.Users.Remove(employee.User);

        db.Employees.Remove(employee);
        await db.SaveChangesAsync();

        return Ok(new { message = $"Đã xoá nhân viên '{employee.FullName}' khỏi hệ thống." });
    }

    // ────────────────────────────────────────────────────────────
    // Helper — tự sinh mã nhân viên dạng NV-XXXX
    // ────────────────────────────────────────────────────────────
    private async Task<string> GenerateEmployeeCode()
    {
        var last = await db.Employees
            .Where(e => e.EmployeeCode.StartsWith("NV-"))
            .OrderByDescending(e => e.EmployeeCode)
            .Select(e => e.EmployeeCode)
            .FirstOrDefaultAsync();

        if (last is null) return "NV-0001";

        // Lấy phần số, tăng lên 1
        var parts = last.Split('-');
        if (parts.Length == 2 && int.TryParse(parts[1], out int num))
            return $"NV-{(num + 1):D4}";

        return $"NV-{DateTime.Now:mmss}";   // fallback
    }
}
