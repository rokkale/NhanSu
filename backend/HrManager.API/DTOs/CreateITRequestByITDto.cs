using System.ComponentModel.DataAnnotations;

namespace HrManager.API.DTOs;

// IT tạo ticket thay nhân viên (sau khi đã verify identity)
public class CreateITRequestByITDto
{
    [Required] public int    EmployeeId  { get; set; }

    [Required][MaxLength(50)]  public string DeviceOldId  { get; set; } = null!;
    [Required][MaxLength(50)]  public string DeviceType   { get; set; } = null!;
    [Required][MaxLength(100)] public string DeviceModel  { get; set; } = null!;
    [Required][MaxLength(500)] public string Reason       { get; set; } = null!;
}
