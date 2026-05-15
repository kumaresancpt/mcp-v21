namespace VmsBackend.Models;

public class ErrorResponse
{
    public string Detail { get; set; } = string.Empty;
    public int? SecondsRemaining { get; set; }
}
