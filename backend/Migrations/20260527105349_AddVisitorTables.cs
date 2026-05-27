using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VmsBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitorTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Department = table.Column<string>(type: "text", nullable: false),
                    EmailAddress = table.Column<string>(type: "text", nullable: true),
                    MobileNumber = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visitors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    MobileNumber = table.Column<string>(type: "text", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: false),
                    IdType = table.Column<string>(type: "text", nullable: false),
                    IdNumber = table.Column<string>(type: "text", nullable: false),
                    IdNumberLast4 = table.Column<string>(type: "text", nullable: true),
                    PhotoUrl = table.Column<string>(type: "text", nullable: true),
                    HostEmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    PurposeOfVisit = table.Column<string>(type: "text", nullable: false),
                    ExpectedDurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "Pending"),
                    CheckInTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CheckOutTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visitors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Approvals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VisitorId = table.Column<Guid>(type: "uuid", nullable: false),
                    HostEmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "Pending"),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeniedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DenialReason = table.Column<string>(type: "text", nullable: true),
                    DenialNote = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Approvals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Approvals_Visitors_VisitorId",
                        column: x => x.VisitorId,
                        principalTable: "Visitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VisitorPasses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VisitorId = table.Column<Guid>(type: "uuid", nullable: false),
                    QrCode = table.Column<string>(type: "text", nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitorPasses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VisitorPasses_Visitors_VisitorId",
                        column: x => x.VisitorId,
                        principalTable: "Visitors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApprovalId = table.Column<Guid>(type: "uuid", nullable: false),
                    Channel = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "Pending"),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastRetryAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalNotifications_Approvals_ApprovalId",
                        column: x => x.ApprovalId,
                        principalTable: "Approvals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalNotifications_ApprovalId",
                table: "ApprovalNotifications",
                column: "ApprovalId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalNotifications_Status_CreatedAt",
                table: "ApprovalNotifications",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Approvals_HostEmployeeId",
                table: "Approvals",
                column: "HostEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Approvals_Status_CreatedAt",
                table: "Approvals",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Approvals_VisitorId",
                table: "Approvals",
                column: "VisitorId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Department",
                table: "Employees",
                column: "Department");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeId",
                table: "Employees",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Name",
                table: "Employees",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorPasses_ValidTo",
                table: "VisitorPasses",
                column: "ValidTo");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorPasses_VisitorId_ValidFrom",
                table: "VisitorPasses",
                columns: new[] { "VisitorId", "ValidFrom" });

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_FullName",
                table: "Visitors",
                column: "FullName");

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_IdType_IdNumberLast4_CreatedAt",
                table: "Visitors",
                columns: new[] { "IdType", "IdNumberLast4", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_MobileNumber_CreatedAt",
                table: "Visitors",
                columns: new[] { "MobileNumber", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_Status_CreatedAt",
                table: "Visitors",
                columns: new[] { "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApprovalNotifications");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "VisitorPasses");

            migrationBuilder.DropTable(
                name: "Approvals");

            migrationBuilder.DropTable(
                name: "Visitors");
        }
    }
}
