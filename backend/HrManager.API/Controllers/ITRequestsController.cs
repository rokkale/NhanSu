using HrManager.API.Data;
using HrManager.API.DTOs;
using HrManager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

        // spare/new_device bắt buộc có NewDeviceId
        if (req.Action is "spare" or "new_device" && string.IsNullOrWhiteSpace(req.NewDeviceId))
            return BadRequest(new { message = "Cần nhập IT RS ID thiết bị mới / dự phòng." });

        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var user     = await db.Users.FirstOrDefaultAsync(u => u.Username == username);

        ticket.ItAction      = req.Action == "reject" ? null : req.Action;
        ticket.NewDeviceId   = req.NewDeviceId?.Trim().ToUpper();
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
