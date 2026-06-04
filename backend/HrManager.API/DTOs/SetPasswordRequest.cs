using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

public class SetPasswordRequest
{
    [Required] public string Username { get; set; } = null!;
    [Required] public string NewPassword { get; set; } = null!;
}
