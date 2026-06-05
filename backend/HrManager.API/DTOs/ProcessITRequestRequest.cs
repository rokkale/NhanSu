using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

// IT xử lý ticket (approve / reject)
public class ProcessITRequestRequest
{
    // "repair" | "spare" | "new_device" | "reject"
    [Required(ErrorMessage = "Hướng xử lý là bắt buộc.")]
    public string Action { get; set; } = null!;

    // Bắt buộc khi Action = spare hoặc new_device
    [MaxLength(50)]
    public string? NewDeviceId { get; set; }

    [MaxLength(500)]
    public string? ItNote { get; set; }
}
