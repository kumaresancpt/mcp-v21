using VmsBackend.Data;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services;

public interface IEmployeeService
{
    Task<List<EmployeeResponse>> SearchEmployees(string query, int limit = 20);
    Task<Employee?> GetEmployeeById(Guid id);
}
