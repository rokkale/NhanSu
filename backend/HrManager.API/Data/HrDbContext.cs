using HrManager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HrManager.API.Data;

public class HrDbContext(DbContextOptions<HrDbContext> options) : DbContext(options)
{
    public DbSet<User>      Users       => Set<User>();
    public DbSet<Employee>  Employees   => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<ITRequest> ITRequests  => Set<ITRequest>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.EmployeeId).HasColumnName("employee_id");
            e.Property(x => x.Username).HasColumnName("username").HasMaxLength(100);
            e.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255);
            e.Property(x => x.Role).HasColumnName("role").HasMaxLength(20);
            e.Property(x => x.IsActive).HasColumnName("is_active");
            e.Property(x => x.LastLogin).HasColumnName("last_login");
            e.Property(x => x.DeviceId).HasColumnName("device_id").HasMaxLength(100);
            e.Property(x => x.DeviceBoundAt).HasColumnName("device_bound_at");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Username).IsUnique();
            e.HasOne(x => x.Employee)
             .WithOne(x => x.User)
             .HasForeignKey<User>(x => x.EmployeeId);
        });

        mb.Entity<Department>(e =>
        {
            e.ToTable("departments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(100);
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        mb.Entity<ITRequest>(e =>
        {
            e.ToTable("it_requests");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TicketCode).HasColumnName("ticket_code").HasMaxLength(30);
            e.Property(x => x.EmployeeId).HasColumnName("employee_id");
            e.Property(x => x.DeviceOldId).HasColumnName("device_old_id").HasMaxLength(50);
            e.Property(x => x.DeviceType).HasColumnName("device_type").HasMaxLength(50);
            e.Property(x => x.DeviceModel).HasColumnName("device_model").HasMaxLength(100);
            e.Property(x => x.Reason).HasColumnName("reason").HasMaxLength(500);
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);
            e.Property(x => x.ManagerApprovedAt).HasColumnName("manager_approved_at");
            e.Property(x => x.ManagerApprovedBy).HasColumnName("manager_approved_by");
            e.Property(x => x.ItAction).HasColumnName("it_action").HasMaxLength(30);
            e.Property(x => x.NewDeviceId).HasColumnName("new_device_id").HasMaxLength(50);
            e.Property(x => x.ItNote).HasColumnName("it_note").HasMaxLength(500);
            e.Property(x => x.ItProcessedAt).HasColumnName("it_processed_at");
            e.Property(x => x.ItProcessedBy).HasColumnName("it_processed_by");
            e.Property(x => x.RequestedAt).HasColumnName("requested_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.TicketCode).IsUnique();
            e.HasOne(x => x.Employee)
             .WithMany()
             .HasForeignKey(x => x.EmployeeId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<Employee>(e =>
        {
            e.ToTable("employees");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.EmployeeCode).HasColumnName("employee_code").HasMaxLength(20);
            e.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(100);
            e.Property(x => x.DepartmentId).HasColumnName("department_id");
            e.Property(x => x.Position).HasColumnName("position");
            e.Property(x => x.Status).HasColumnName("status").HasMaxLength(20);
            e.Property(x => x.StartDate).HasColumnName("start_date");
            e.Property(x => x.FaceData).HasColumnName("face_data");
            e.Property(x => x.Phone).HasColumnName("phone");
            e.Property(x => x.BaseSalary).HasColumnName("base_salary").HasColumnType("decimal(15,2)");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.EmployeeCode).IsUnique();
        });
    }
}
