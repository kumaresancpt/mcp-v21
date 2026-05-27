using System.Security.Claims;
using VmsBackend.Data;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services;

public interface IVisitorService
{
    Task<Visitor> RegisterVisitor(VisitorRegistrationRequest request, Guid receptionistId);
    Task<Visitor> SaveDraftVisitor(VisitorRegistrationRequest request, Guid receptionistId);
    Task<PaginatedList<VisitorResponse>> GetVisitors(int page, int limit, string? search, string? status, Guid? hostId, string? company, DateTime? dateFrom, DateTime? dateTo, ClaimsPrincipal user);
    Task<VisitorResponse?> GetVisitorById(Guid id, ClaimsPrincipal user);
    Task<Visitor> UpdateVisitor(Guid id, VisitorRegistrationRequest request);
    Task<PaginatedList<VisitorResponse>> GetDrafts(Guid receptionistId, int page = 1, int limit = 10, ClaimsPrincipal? user = null);
    bool ValidateMobileNumber(string mobile);
    bool ValidateIdNumber(string idType, string idNumber);
    Task<List<Visitor>> CheckDuplicates(string mobileNumber, string idType, string idNumber);
}
