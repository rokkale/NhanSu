namespace HrManager.API.Models;

public class User
{
    public int Id { get; set; }
    public int? EmployeeId { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!;        // admin | hr | manager | employee
    public bool IsActive { get; set; } = true;
    public DateTime? LastLogin { get; set; }

    // Mã thiết bị được phép đăng nhập (null = chưa bind máy nào)
    public string? DeviceId { get; set; }
    public DateTime? DeviceBoundAt { get; set; }  // thời điểm bind lần đầu
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Employee? Employee { get; set; }
}
