using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

public class CreateEmployeeRequest
{
    // ── Thông tin nhân viên ──────────────────────────
    [Required(ErrorMessage = "Họ tên không được để trống.")]
    [MaxLength(100)]
    public string FullName { get; set; } = null!;

    [MaxLength(20)]
    public string? EmployeeCode { get; set; }   // nếu null → server tự sinh

    public int? DepartmentId { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    [MaxLength(20)]
    public string? Phone { get; set; }

    public decimal BaseSalary { get; set; } = 0;

    public DateOnly StartDate { get; set; } = DateOnly.FromDateTime(DateTime.Today);

    // ── Thông tin tài khoản đăng nhập ────────────────
    [Required(ErrorMessage = "Tên đăng nhập không được để trống.")]
    [MaxLength(100)]
    public string Username { get; set; } = null!;

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự.")]
    public string Password { get; set; } = null!;

    // admin | manager | employee
    [RegularExpression("admin|manager|employee",
        ErrorMessage = "Role phải là admin, manager hoặc employee.")]
    public string Role { get; set; } = "employee";
}
