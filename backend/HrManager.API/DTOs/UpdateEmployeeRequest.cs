using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

public class UpdateEmployeeRequest
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    public int? DepartmentId { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; set; }

    public decimal? BaseSalary { get; set; }

    // active | inactive | resigned
    [RegularExpression("active|inactive|resigned",
        ErrorMessage = "Status phải là active, inactive hoặc resigned.")]
    public string? Status { get; set; }

    // Nếu muốn đổi mật khẩu luôn (tuỳ chọn)
    [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự.")]
    public string? NewPassword { get; set; }
}
