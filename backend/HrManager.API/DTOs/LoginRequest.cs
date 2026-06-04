    using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

public class LoginRequest
{
    [Required] public string Username { get; set; } = null!;
    [Required] public string Password { get; set; } = null!;

    // UUID do trình duyệt/thiết bị tự sinh và lưu localStorage
    [Required] public string DeviceId { get; set; } = null!;
}
