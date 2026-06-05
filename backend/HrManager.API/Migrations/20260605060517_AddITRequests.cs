using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HrManager.API.Migrations
{
    /// <inheritdoc />
    public partial class AddITRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "it_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ticket_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    employee_id = table.Column<int>(type: "integer", nullable: false),
                    device_old_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    device_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    device_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    manager_approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    manager_approved_by = table.Column<int>(type: "integer", nullable: true),
                    it_action = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    new_device_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    it_note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    it_processed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    it_processed_by = table.Column<int>(type: "integer", nullable: true),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_it_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_it_requests_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_it_requests_employee_id",
                table: "it_requests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_it_requests_ticket_code",
                table: "it_requests",
                column: "ticket_code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "it_requests");
        }
    }
}
