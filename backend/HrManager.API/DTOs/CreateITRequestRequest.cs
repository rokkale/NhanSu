using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

// Nhân viên tạo yêu cầu đổi thiết bị
public class CreateITRequestRequest
{
    [Required(ErrorMessage = "IT RS ID thiết bị cũ là bắt buộc.")]
    [MaxLength(50)]
    public string DeviceOldId { get; set; } = null!;

    [Required(ErrorMessage = "Loại thiết bị là bắt buộc.")]
    [MaxLength(50)]
    public string DeviceType { get; set; } = null!;

    [Required(ErrorMessage = "Model thiết bị là bắt buộc.")]
    [MaxLength(100)]
    public string DeviceModel { get; set; } = null!;

    [Required(ErrorMessage = "Lý do yêu cầu là bắt buộc.")]
    [MaxLength(500)]
    public string Reason { get; set; } = null!;
}
