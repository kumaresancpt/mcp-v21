namespace VmsBackend.Models.Responses;

public class EmployeeResponse
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? EmailAddress { get; set; }
    public string? MobileNumber { get; set; }
}
