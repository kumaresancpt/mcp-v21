using Microsoft.AspNetCore.Mvc;
using VmsBackend.Models.Responses;
using VmsBackend.Services;

namespace VmsBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(IEmployeeService employeeService, ILogger<EmployeesController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    /// <summary>
    /// Search for employees by name, employee ID, or department (AC-JIRA-05)
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<EmployeeResponse>>> SearchEmployees(string q)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                return BadRequest(new { detail = "Search query must be at least 2 characters" });

            var employees = await _employeeService.SearchEmployees(q, limit: 20);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching employees");
            return BadRequest(new { detail = "Error searching employees" });
        }
    }
}
