using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services;

public class ApprovalService : IApprovalService
{
    private readonly AppDbContext _dbContext;
    private readonly IQrCodeService _qrCodeService;
    private readonly IApprovalNotificationService _notificationService;

    public ApprovalService(AppDbContext dbContext, IQrCodeService qrCodeService, IApprovalNotificationService notificationService)
    {
        _dbContext = dbContext;
        _qrCodeService = qrCodeService;
        _notificationService = notificationService;
    }

    public async Task<List<ApprovalResponse>> GetPendingApprovals(Guid hostEmployeeId)
    {
        var approvals = await _dbContext.Approvals
            .Where(a => a.Status == "Pending" && a.HostEmployeeId == hostEmployeeId)
            .Include(a => a.Visitor)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return approvals.Select(a => new ApprovalResponse
        {
            ApprovalId = a.Id,
            VisitorId = a.VisitorId,
            VisitorName = a.Visitor.FullName,
            CompanyName = a.Visitor.CompanyName,
            PurposeOfVisit = a.Visitor.PurposeOfVisit,
            HostEmployeeId = a.HostEmployeeId,
            Status = a.Status,
            CreatedAt = a.CreatedAt
        }).ToList();
    }

    public async Task<Approval> ApproveVisitor(Guid approvalId)
    {
        var approval = await _dbContext.Approvals
            .Include(a => a.Visitor)
            .FirstOrDefaultAsync(a => a.Id == approvalId);

        if (approval == null)
            throw new InvalidOperationException("Approval not found");

        if (approval.Status != "Pending")
            throw new InvalidOperationException("Approval is not pending");

        approval.Status = "Approved";
        approval.ApprovedAt = DateTime.UtcNow;
        approval.UpdatedAt = DateTime.UtcNow;

        approval.Visitor.Status = "Approved";
        approval.Visitor.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        // Generate QR code and send digital pass
        var pass = await _qrCodeService.GenerateQrCode(approval.Visitor.Id);
        await _notificationService.SendDigitalPass(approval.Visitor, pass);

        return approval;
    }

    public async Task<Approval> DenyVisitor(Guid approvalId, DenyRequest request)
    {
        var approval = await _dbContext.Approvals
            .Include(a => a.Visitor)
            .FirstOrDefaultAsync(a => a.Id == approvalId);

        if (approval == null)
            throw new InvalidOperationException("Approval not found");

        if (approval.Status != "Pending")
            throw new InvalidOperationException("Approval is not pending");

        approval.Status = "Denied";
        approval.DeniedAt = DateTime.UtcNow;
        approval.DenialReason = request.Reason;
        approval.DenialNote = request.Note;
        approval.UpdatedAt = DateTime.UtcNow;

        approval.Visitor.Status = "Denied";
        approval.Visitor.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        // Send denial notification
        await _notificationService.SendDenialNotification(approval);

        return approval;
    }

    public async Task<Approval?> GetApprovalById(Guid id)
    {
        return await _dbContext.Approvals
            .Include(a => a.Visitor)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
}
