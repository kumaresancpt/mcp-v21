using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;
using VmsBackend.Data;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services;

public class VisitorService : IVisitorService
{
    private readonly AppDbContext _dbContext;
    private readonly IDataEncryptionService _encryptionService;

    public VisitorService(AppDbContext dbContext, IDataEncryptionService encryptionService)
    {
        _dbContext = dbContext;
        _encryptionService = encryptionService;
    }

    public bool ValidateMobileNumber(string mobile)
    {
        // Pattern: +91xxxxxxxxxx or xxxxxxxxxx (10 digits)
        var pattern = @"^(\+91)?[6-9]\d{9}$|^\d{10}$";
        return Regex.IsMatch(mobile, pattern);
    }

    public bool ValidateIdNumber(string idType, string idNumber)
    {
        return idType switch
        {
            "Aadhar" => Regex.IsMatch(idNumber, @"^\d{12}$"),
            "PAN" => Regex.IsMatch(idNumber, @"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"),
            "Passport" => Regex.IsMatch(idNumber, @"^[A-Z0-9]{6,9}$"),
            "DrivingLicense" => Regex.IsMatch(idNumber, @"^\d{16}$"),
            "VoterId" => Regex.IsMatch(idNumber, @"^[A-Z0-9]{18}$"),
            "EmployeeId" => !string.IsNullOrEmpty(idNumber) && idNumber.Length > 0,
            "Other" => !string.IsNullOrEmpty(idNumber),
            _ => false
        };
    }

    public async Task<List<Visitor>> CheckDuplicates(string mobileNumber, string idType, string idNumber)
    {
        var cutoffTime = DateTime.UtcNow.AddHours(-24);
        var duplicates = await _dbContext.Visitors
            .Where(v => (v.MobileNumber == mobileNumber || (v.IdType == idType && v.IdNumber == idNumber)) 
                     && v.CreatedAt > cutoffTime)
            .ToListAsync();
        return duplicates;
    }

    public async Task<Visitor> RegisterVisitor(VisitorRegistrationRequest request, Guid receptionistId)
    {
        var visitor = new Visitor
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            MobileNumber = _encryptionService.Encrypt(request.MobileNumber),
            CompanyName = request.CompanyName ?? string.Empty,
            IdType = request.IdType,
            IdNumber = _encryptionService.Encrypt(request.IdNumber),
            IdNumberLast4 = request.IdNumber.Length >= 4 ? request.IdNumber.Substring(request.IdNumber.Length - 4) : request.IdNumber,
            PhotoUrl = request.PhotoUrl,
            HostEmployeeId = request.HostEmployeeId,
            PurposeOfVisit = request.PurposeOfVisit,
            ExpectedDurationMinutes = request.ExpectedDurationMinutes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = receptionistId,
            Notes = request.Notes
        };

        _dbContext.Visitors.Add(visitor);
        
        // Create approval record
        var approval = new Approval
        {
            Id = Guid.NewGuid(),
            VisitorId = visitor.Id,
            HostEmployeeId = request.HostEmployeeId,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _dbContext.Approvals.Add(approval);
        
        await _dbContext.SaveChangesAsync();
        return visitor;
    }

    public async Task<Visitor> SaveDraftVisitor(VisitorRegistrationRequest request, Guid receptionistId)
    {
        var visitor = new Visitor
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            MobileNumber = !string.IsNullOrEmpty(request.MobileNumber) ? _encryptionService.Encrypt(request.MobileNumber) : string.Empty,
            CompanyName = request.CompanyName ?? string.Empty,
            IdType = request.IdType,
            IdNumber = !string.IsNullOrEmpty(request.IdNumber) ? _encryptionService.Encrypt(request.IdNumber) : string.Empty,
            IdNumberLast4 = !string.IsNullOrEmpty(request.IdNumber) && request.IdNumber.Length >= 4 
                ? request.IdNumber.Substring(request.IdNumber.Length - 4) 
                : request.IdNumber,
            PhotoUrl = request.PhotoUrl,
            HostEmployeeId = request.HostEmployeeId,
            PurposeOfVisit = request.PurposeOfVisit,
            ExpectedDurationMinutes = request.ExpectedDurationMinutes,
            Status = "Draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = receptionistId,
            Notes = request.Notes
        };

        _dbContext.Visitors.Add(visitor);
        await _dbContext.SaveChangesAsync();
        return visitor;
    }

    public async Task<PaginatedList<VisitorResponse>> GetVisitors(int page, int limit, string? search, string? status, 
        Guid? hostId, string? company, DateTime? dateFrom, DateTime? dateTo, ClaimsPrincipal user)
    {
        var query = _dbContext.Visitors.AsQueryable();

        // Filter by status if provided
        if (!string.IsNullOrEmpty(status))
            query = query.Where(v => v.Status == status);

        // Filter by host if provided
        if (hostId.HasValue)
            query = query.Where(v => v.HostEmployeeId == hostId.Value);

        // Filter by company if provided
        if (!string.IsNullOrEmpty(company))
            query = query.Where(v => v.CompanyName.Contains(company));

        // Filter by date range if provided
        if (dateFrom.HasValue)
            query = query.Where(v => v.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(v => v.CreatedAt <= dateTo.Value);

        // Search
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(v => v.FullName.ToLower().Contains(searchLower) || 
                                    v.CompanyName.ToLower().Contains(searchLower) || 
                                    v.PurposeOfVisit.ToLower().Contains(searchLower));
        }

        // Sort by CreatedAt descending
        query = query.OrderByDescending(v => v.CreatedAt);

        // Pagination
        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        var isAdmin = _encryptionService.IsAdminRole(user);
        var responses = items.Select(v => new VisitorResponse
        {
            VisitorId = v.Id,
            FullName = v.FullName,
            MobileNumber = v.MobileNumber, // Already encrypted in DB
            CompanyName = v.CompanyName,
            IdType = v.IdType,
            IdNumberMasked = isAdmin ? _encryptionService.Decrypt(v.IdNumber) : _encryptionService.MaskIdNumber(v.IdNumber),
            PhotoUrl = v.PhotoUrl,
            HostEmployeeId = v.HostEmployeeId,
            PurposeOfVisit = v.PurposeOfVisit,
            ExpectedDurationMinutes = v.ExpectedDurationMinutes,
            Status = v.Status,
            CheckInTime = v.CheckInTime,
            CheckOutTime = v.CheckOutTime,
            CreatedAt = v.CreatedAt,
            UpdatedAt = v.UpdatedAt,
            Notes = v.Notes
        }).ToList();

        return new PaginatedList<VisitorResponse>
        {
            Items = responses,
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = limit
        };
    }

    public async Task<VisitorResponse?> GetVisitorById(Guid id, ClaimsPrincipal user)
    {
        var visitor = await _dbContext.Visitors.FirstOrDefaultAsync(v => v.Id == id);
        if (visitor == null)
            return null;

        var isAdmin = _encryptionService.IsAdminRole(user);
        return new VisitorResponse
        {
            VisitorId = visitor.Id,
            FullName = visitor.FullName,
            MobileNumber = visitor.MobileNumber,
            CompanyName = visitor.CompanyName,
            IdType = visitor.IdType,
            IdNumberMasked = isAdmin ? _encryptionService.Decrypt(visitor.IdNumber) : _encryptionService.MaskIdNumber(visitor.IdNumber),
            PhotoUrl = visitor.PhotoUrl,
            HostEmployeeId = visitor.HostEmployeeId,
            PurposeOfVisit = visitor.PurposeOfVisit,
            ExpectedDurationMinutes = visitor.ExpectedDurationMinutes,
            Status = visitor.Status,
            CheckInTime = visitor.CheckInTime,
            CheckOutTime = visitor.CheckOutTime,
            CreatedAt = visitor.CreatedAt,
            UpdatedAt = visitor.UpdatedAt,
            Notes = visitor.Notes
        };
    }

    public async Task<Visitor> UpdateVisitor(Guid id, VisitorRegistrationRequest request)
    {
        var visitor = await _dbContext.Visitors.FirstOrDefaultAsync(v => v.Id == id);
        if (visitor == null)
            throw new InvalidOperationException("Visitor not found");

        if (visitor.Status != "Draft")
            throw new InvalidOperationException("Only drafts can be updated before approval");

        visitor.FullName = request.FullName;
        visitor.MobileNumber = _encryptionService.Encrypt(request.MobileNumber);
        visitor.CompanyName = request.CompanyName ?? string.Empty;
        visitor.IdType = request.IdType;
        visitor.IdNumber = _encryptionService.Encrypt(request.IdNumber);
        visitor.IdNumberLast4 = request.IdNumber.Length >= 4 ? request.IdNumber.Substring(request.IdNumber.Length - 4) : request.IdNumber;
        visitor.PhotoUrl = request.PhotoUrl;
        visitor.HostEmployeeId = request.HostEmployeeId;
        visitor.PurposeOfVisit = request.PurposeOfVisit;
        visitor.ExpectedDurationMinutes = request.ExpectedDurationMinutes;
        visitor.Notes = request.Notes;
        visitor.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        return visitor;
    }

    public async Task<PaginatedList<VisitorResponse>> GetDrafts(Guid receptionistId, int page = 1, int limit = 10, ClaimsPrincipal? user = null)
    {
        var query = _dbContext.Visitors
            .Where(v => v.Status == "Draft" && v.CreatedBy == receptionistId)
            .OrderByDescending(v => v.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        var isAdmin = user != null && _encryptionService.IsAdminRole(user);
        var responses = items.Select(v => new VisitorResponse
        {
            VisitorId = v.Id,
            FullName = v.FullName,
            MobileNumber = v.MobileNumber,
            CompanyName = v.CompanyName,
            IdType = v.IdType,
            IdNumberMasked = isAdmin ? _encryptionService.Decrypt(v.IdNumber) : _encryptionService.MaskIdNumber(v.IdNumber),
            PhotoUrl = v.PhotoUrl,
            HostEmployeeId = v.HostEmployeeId,
            PurposeOfVisit = v.PurposeOfVisit,
            ExpectedDurationMinutes = v.ExpectedDurationMinutes,
            Status = v.Status,
            CheckInTime = v.CheckInTime,
            CheckOutTime = v.CheckOutTime,
            CreatedAt = v.CreatedAt,
            UpdatedAt = v.UpdatedAt,
            Notes = v.Notes
        }).ToList();

        return new PaginatedList<VisitorResponse>
        {
            Items = responses,
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = limit
        };
    }
}
