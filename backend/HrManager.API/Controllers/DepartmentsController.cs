using HrManager.API.Data;
using HrManager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HrManager.API.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController(HrDbContext db) : ControllerBase
{
    // GET /api/departments — danh sách tất cả phòng ban
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await db.Departments
            .OrderBy(d => d.Name)
            .Select(d => new { d.Id, d.Name, d.Description })
            .ToListAsync();
        return Ok(list);
    }

    // POST /api/departments — tạo phòng ban mới (chỉ admin)
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateDeptRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Tên phòng ban không được để trống." });

        var dept = new Department { Name = req.Name.Trim(), Description = req.Description?.Trim() };
        db.Departments.Add(dept);
        await db.SaveChangesAsync();
        return Ok(new { message = $"Đã tạo phòng ban '{dept.Name}'.", dept.Id, dept.Name });
    }
}

public record CreateDeptRequest(string Name, string? Description);
