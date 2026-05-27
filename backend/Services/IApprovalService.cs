using VmsBackend.Data;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services;

public interface IApprovalService
{
    Task<List<ApprovalResponse>> GetPendingApprovals(Guid hostEmployeeId);
    Task<Approval> ApproveVisitor(Guid approvalId);
    Task<Approval> DenyVisitor(Guid approvalId, DenyRequest request);
    Task<Approval?> GetApprovalById(Guid id);
}
