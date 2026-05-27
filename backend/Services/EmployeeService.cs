using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _dbContext;

    public EmployeeService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<EmployeeResponse>> SearchEmployees(string query, int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return new List<EmployeeResponse>();

        var searchLower = query.ToLower();
        var employees = await _dbContext.Employees
            .Where(e => e.Name.ToLower().Contains(searchLower) ||
                       e.EmployeeId.ToLower().Contains(searchLower) ||
                       e.Department.ToLower().Contains(searchLower))
            .Take(limit)
            .Select(e => new EmployeeResponse
            {
                Id = e.Id,
                EmployeeId = e.EmployeeId,
                Name = e.Name,
                Department = e.Department,
                EmailAddress = e.EmailAddress,
                MobileNumber = e.MobileNumber
            })
            .ToListAsync();

        return employees;
    }

    public async Task<Employee?> GetEmployeeById(Guid id)
    {
        return await _dbContext.Employees.FirstOrDefaultAsync(e => e.Id == id);
    }
}
