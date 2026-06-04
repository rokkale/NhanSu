namespace HrManager.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string EmployeeCode { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public int? DepartmentId { get; set; }
    public string? Position { get; set; }
    public string Status { get; set; } = "active";
    public DateOnly StartDate { get; set; }
    public string? FaceData { get; set; }
    public string? Phone { get; set; }
    public decimal BaseSalary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
