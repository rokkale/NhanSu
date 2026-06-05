using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

// IT dùng để xác thực danh tính nhân viên trước khi tạo ticket thay
public class VerifyIdentityRequest
{
    [Required] public string Username { get; set; } = null!;
    [Required] public string Password { get; set; } = null!;
}
