namespace HrManager.API.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string FullName { get; set; } = null!;
}
