namespace HrManager.API.Models;

public class ITRequest
{
    public int Id { get; set; }

    // Mã ticket tự sinh: RS-2026-XXXX
    public string TicketCode { get; set; } = null!;

    // Nhân viên yêu cầu
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    // Thông tin thiết bị cũ
    public string DeviceOldId   { get; set; } = null!;   // IT RS ID cũ
    public string DeviceType    { get; set; } = null!;   // Laptop, Desktop, Màn hình...
    public string DeviceModel   { get; set; } = null!;   // Dell Inspiron 15...
    public string Reason        { get; set; } = null!;   // Lý do yêu cầu đổi

    // Trạng thái: pending_manager | pending_it | processing | pending_purchase | done | rejected
    public string Status { get; set; } = "pending_manager";

    // Manager duyệt
    public DateTime? ManagerApprovedAt { get; set; }
    public int?      ManagerApprovedBy { get; set; }     // UserId

    // IT xử lý
    // itAction: repair | spare | new_device
    public string?   ItAction      { get; set; }
    public string?   NewDeviceId   { get; set; }         // IT RS ID mới / dự phòng
    public string?   ItNote        { get; set; }         // Ghi chú kỹ thuật
    public DateTime? ItProcessedAt { get; set; }
    public int?      ItProcessedBy { get; set; }         // UserId

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt   { get; set; } = DateTime.UtcNow;
}
