using HrManager.API.Data;
using HrManager.API.DTOs;
using HrManager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BCrypt.Net;

namespace HrManager.API.Controllers;

[ApiController]
[Route("api/it-requests")]
[Authorize]
public class ITRequestsController(HrDbContext db) : ControllerBase
{
    // ────────────────────────────────────────────────────────────
    // GET /api/it-requests
    // Admin/Manager: xem tất cả  |  Employee: chỉ xem của mình
    // ────────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var role     = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";

        var query = db.ITRequests
            .Include(r => r.Employee)
                .ThenInclude(e => e.Department)
            .AsQueryable();

        // Employee chỉ xem ticket của chính mình
        if (role == "employee")
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user?.EmployeeId is null) return Ok(new List<object>());
            query = query.Where(r => r.EmployeeId == user.EmployeeId);
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r =>
                r.TicketCode.Contains(search) ||
                r.Employee.FullName.Contains(search) ||
                r.DeviceOldId.Contains(search));

        var list = await query
            .OrderByDescending(r => r.RequestedAt)
            .Select(r => new
            {
                r.Id,
                r.TicketCode,
                r.EmployeeId,
                EmployeeName = r.Employee.FullName,
                EmployeeCode = r.Employee.EmployeeCode,
                Department   = r.Employee.Department != null ? r.Employee.Department.Name : null,
                r.DeviceOldId,
                r.DeviceType,
                r.DeviceModel,
                r.Reason,
                r.Status,
                r.ManagerApprovedAt,
                r.ItAction,
                r.NewDeviceId,
                r.ItNote,
                r.ItProcessedAt,
                r.RequestedAt,
                r.UpdatedAt,
            })
            .ToListAsync();

        return Ok(list);
    }

    // ────────────────────────────────────────────────────────────
    // GET /api/it-requests/{id}
    // ────────────────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await db.ITRequests
            .Include(r => r.Employee)
                .ThenInclude(e => e.Department)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (r is null) return NotFound(new { message = "Không tìm thấy ticket." });

        return Ok(new
        {
            r.Id, r.TicketCode,
            r.EmployeeId,
            EmployeeName = r.Employee.FullName,
            EmployeeCode = r.Employee.EmployeeCode,
            Department   = r.Employee.Department?.Name,
            r.DeviceOldId, r.DeviceType, r.DeviceModel, r.Reason,
            r.Status,
            r.ManagerApprovedAt, r.ManagerApprovedBy,
            r.ItAction, r.NewDeviceId, r.ItNote,
            r.ItProcessedAt, r.ItProcessedBy,
            r.RequestedAt, r.UpdatedAt,
        });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/it-requests
    // Nhân viên tạo yêu cầu đổi thiết bị
    // ────────────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateITRequestRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user?.EmployeeId is null)
            return BadRequest(new { message = "Không tìm thấy thông tin nhân viên." });

        var ticketCode = await GenerateTicketCode();

        var ticket = new ITRequest
        {
            TicketCode  = ticketCode,
            EmployeeId  = user.EmployeeId.Value,
            DeviceOldId = req.DeviceOldId.Trim().ToUpper(),
            DeviceType  = req.DeviceType.Trim(),
            DeviceModel = req.DeviceModel.Trim(),
            Reason      = req.Reason.Trim(),
            Status      = "pending_manager",
        };

        db.ITRequests.Add(ticket);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, new
        {
            message    = $"Đã tạo yêu cầu {ticketCode} thành công. Đang chờ Manager duyệt.",
            ticketCode,
            id = ticket.Id,
        });
    }

    // ────────────────────────────────────────────────────────────
    // PATCH /api/it-requests/{id}/approve
    // Manager duyệt → chuyển sang pending_it
    // ────────────────────────────────────────────────────────────
    [HttpPatch("{id:int}/approve")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> ManagerApprove(int id)
    {
        var ticket = await db.ITRequests.FindAsync(id);
        if (ticket is null) return NotFound(new { message = "Không tìm thấy ticket." });

        if (ticket.Status != "pending_manager")
            return BadRequest(new { message = $"Ticket đang ở trạng thái '{ticket.Status}', không thể duyệt." });

        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var user     = await db.Users.FirstOrDefaultAsync(u => u.Username == username);

        ticket.Status             = "pending_it";
        ticket.ManagerApprovedAt  = DateTime.UtcNow;
        ticket.ManagerApprovedBy  = user?.Id;
        ticket.UpdatedAt          = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { message = $"Đã duyệt ticket {ticket.TicketCode}. Đã chuyển sang IT xử lý." });
    }

    // ────────────────────────────────────────────────────────────
    // PATCH /api/it-requests/{id}/process
    // IT xử lý ticket: repair | spare | new_device | reject
    // ────────────────────────────────────────────────────────────
    [HttpPatch("{id:int}/process")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> ITProcess(int id, [FromBody] ProcessITRequestRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var ticket = await db.ITRequests.FindAsync(id);
        if (ticket is null) return NotFound(new { message = "Không tìm thấy ticket." });

        if (ticket.Status is not ("pending_it" or "processing"))
            return BadRequest(new { message = $"Ticket đang ở trạng thái '{ticket.Status}', IT không thể xử lý." });

        var validActions = new[] { "repair", "spare", "new_device", "reject" };
        if (!validActions.Contains(req.Action))
            return BadRequest(new { message = "Action không hợp lệ. Dùng: repair | spare | new_device | reject" });

        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var user     = await db.Users.FirstOrDefaultAsync(u => u.Username == username);

        // spare/new_device → reset DeviceId của nhân viên về null
        // (lần đăng nhập tiếp theo từ máy mới sẽ tự bind)
        if (req.Action is "spare" or "new_device")
        {
            var empUser = await db.Users.FirstOrDefaultAsync(u => u.EmployeeId == ticket.EmployeeId);
            if (empUser is not null)
            {
                empUser.DeviceId      = null;
                empUser.DeviceBoundAt = null;
                empUser.UpdatedAt     = DateTime.UtcNow;
            }
        }

        ticket.ItAction      = req.Action == "reject" ? null : req.Action;
        ticket.NewDeviceId   = null;   // không còn lưu ID thủ công
        ticket.ItNote        = req.ItNote?.Trim();
        ticket.ItProcessedAt = DateTime.UtcNow;
        ticket.ItProcessedBy = user?.Id;
        ticket.UpdatedAt     = DateTime.UtcNow;

        ticket.Status = req.Action switch
        {
            "reject"     => "rejected",
            "new_device" => "pending_purchase",   // chuyển sang Mua sắm
            _            => "done",               // repair / spare → xong
        };

        await db.SaveChangesAsync();

        var msg = req.Action switch
        {
            "reject"     => $"Đã từ chối ticket {ticket.TicketCode}.",
            "new_device" => $"Đã xử lý {ticket.TicketCode}. Chuyển sang Phòng Mua sắm.",
            "repair"     => $"Đã ghi nhận sửa chữa cho ticket {ticket.TicketCode}.",
            "spare"      => $"Đã cấp thiết bị dự phòng {ticket.NewDeviceId} cho {ticket.TicketCode}.",
            _            => $"Đã cập nhật ticket {ticket.TicketCode}.",
        };

        return Ok(new { message = msg, status = ticket.Status });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/it-requests/request-device-change
    // Nhân viên gửi từ màn hình Login khi bị block DEVICE_MISMATCH
    // Không cần JWT — xác thực bằng username+password
    // ────────────────────────────────────────────────────────────
    [HttpPost("request-device-change")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestDeviceChange([FromBody] DeviceChangeRequestDto req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Xác thực username + password
        var user = await db.Users
            .Include(u => u.Employee)
                .ThenInclude(e => e!.Department)
            .FirstOrDefaultAsync(u => u.Username == req.Username && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không đúng." });

        if (user.EmployeeId is null)
            return BadRequest(new { message = "Tài khoản này chưa liên kết nhân viên." });

        // Kiểm tra đã có ticket đang chờ xử lý chưa
        var existing = await db.ITRequests.FirstOrDefaultAsync(r =>
            r.EmployeeId == user.EmployeeId &&
            r.Status != "done" && r.Status != "rejected");

        if (existing is not null)
            return Conflict(new
            {
                message    = $"Bạn đã có ticket {existing.TicketCode} đang chờ xử lý.",
                ticketCode = existing.TicketCode,
                status     = existing.Status,
            });

        var ticketCode = await GenerateTicketCode();
        var ticket = new ITRequest
        {
            TicketCode  = ticketCode,
            EmployeeId  = user.EmployeeId.Value,
            DeviceOldId = "UNKNOWN",               // chưa biết ID cũ khi bị block
            DeviceType  = req.DeviceType.Trim(),
            DeviceModel = req.DeviceModel.Trim(),
            Reason      = req.Reason.Trim(),
            Status      = "pending_it",            // bỏ qua bước manager vì khẩn cấp
            ManagerApprovedAt = DateTime.UtcNow,   // tự động duyệt
        };

        db.ITRequests.Add(ticket);
        await db.SaveChangesAsync();

        return Ok(new
        {
            message    = $"Đã gửi yêu cầu {ticketCode} đến bộ phận IT. Vui lòng chờ IT liên hệ hỗ trợ.",
            ticketCode,
            employeeName = user.Employee?.FullName,
        });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/it-requests/verify-identity
    // IT dùng để xác thực danh tính nhân viên (không trả JWT)
    // ────────────────────────────────────────────────────────────
    [HttpPost("verify-identity")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> VerifyIdentity([FromBody] VerifyIdentityRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await db.Users
            .Include(u => u.Employee)
                .ThenInclude(e => e!.Department)
            .FirstOrDefaultAsync(u => u.Username == req.Username);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không khớp." });

        if (!user.IsActive)
            return BadRequest(new { message = "Tài khoản này đang bị khoá." });

        return Ok(new
        {
            verified     = true,
            employeeId   = user.EmployeeId,
            employeeName = user.Employee?.FullName,
            employeeCode = user.Employee?.EmployeeCode,
            department   = user.Employee?.Department?.Name,
            deviceId     = user.DeviceId,
            isBound      = user.DeviceId is not null,
        });
    }

    // ────────────────────────────────────────────────────────────
    // POST /api/it-requests/by-it
    // IT tạo ticket thay nhân viên (sau khi đã verify-identity)
    // Ticket bỏ qua bước Manager, tự chuyển thẳng sang pending_it
    // ────────────────────────────────────────────────────────────
    [HttpPost("by-it")]
    [Authorize(Roles = "admin,manager")]
    public async Task<IActionResult> CreateByIT([FromBody] CreateITRequestByITDto req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var employee = await db.Employees
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == req.EmployeeId);

        if (employee is null)
            return NotFound(new { message = "Không tìm thấy nhân viên." });

        // Kiểm tra ticket đang mở
        var existing = await db.ITRequests.FirstOrDefaultAsync(r =>
            r.EmployeeId == req.EmployeeId &&
            r.Status != "done" && r.Status != "rejected");

        if (existing is not null)
            return Conflict(new
            {
                message    = $"Nhân viên đã có ticket {existing.TicketCode} đang chờ xử lý.",
                ticketCode = existing.TicketCode,
            });

        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var itUser   = await db.Users.FirstOrDefaultAsync(u => u.Username == username);

        var ticketCode = await GenerateTicketCode();
        var ticket = new ITRequest
        {
            TicketCode        = ticketCode,
            EmployeeId        = req.EmployeeId,
            DeviceOldId       = req.DeviceOldId.Trim().ToUpper(),
            DeviceType        = req.DeviceType.Trim(),
            DeviceModel       = req.DeviceModel.Trim(),
            Reason            = req.Reason.Trim(),
            Status            = "processing",      // IT tự tạo → xử lý ngay
            ManagerApprovedAt = DateTime.UtcNow,
            ManagerApprovedBy = itUser?.Id,
            ItProcessedBy     = itUser?.Id,
        };

        db.ITRequests.Add(ticket);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, new
        {
            message      = $"Đã tạo ticket {ticketCode} cho nhân viên {employee.FullName}.",
            ticketCode,
            id           = ticket.Id,
            employeeName = employee.FullName,
        });
    }

    // ────────────────────────────────────────────────────────────
    // Helper — tự sinh mã ticket RS-{YEAR}-XXXX
    // ────────────────────────────────────────────────────────────
    private async Task<string> GenerateTicketCode()
    {
        var year   = DateTime.UtcNow.Year;
        var prefix = $"RS-{year}-";

        var last = await db.ITRequests
            .Where(r => r.TicketCode.StartsWith(prefix))
            .OrderByDescending(r => r.TicketCode)
            .Select(r => r.TicketCode)
            .FirstOrDefaultAsync();

        if (last is null) return $"{prefix}0001";

        var parts = last.Split('-');
        if (parts.Length == 3 && int.TryParse(parts[2], out int num))
            return $"{prefix}{(num + 1):D4}";

        return $"{prefix}{DateTime.UtcNow:mmss}";
    }
}
