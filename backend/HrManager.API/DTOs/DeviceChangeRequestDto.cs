using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

// Nhân viên gửi từ màn hình login (chưa có token)
public class DeviceChangeRequestDto
{
    [Required] public string Username    { get; set; } = null!;
    [Required] public string Password    { get; set; } = null!;

    [Required][MaxLength(50)]  public string DeviceType  { get; set; } = null!;
    [Required][MaxLength(100)] public string DeviceModel { get; set; } = null!;

    [MaxLength(500)] public string Reason { get; set; } = "Yêu cầu đổi thiết bị đăng nhập mới.";
}
