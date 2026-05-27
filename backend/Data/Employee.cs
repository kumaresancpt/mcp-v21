namespace VmsBackend.Data;

public class Employee
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty; // Unique employee identifier
    public string Name { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? EmailAddress { get; set; }
    public string? MobileNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
