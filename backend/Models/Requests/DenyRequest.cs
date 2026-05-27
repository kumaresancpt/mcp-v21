namespace VmsBackend.Models.Requests;

public class DenyRequest
{
    public string Reason { get; set; } = string.Empty; // Unavailable, VisitNotScheduled, SecurityConcern, IncorrectHost, Other
    public string? Note { get; set; } // Optional, max 200 chars
}
