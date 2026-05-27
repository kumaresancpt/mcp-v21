using Microsoft.AspNetCore.Mvc;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;
using VmsBackend.Services;

namespace VmsBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApprovalsController : ControllerBase
{
    private readonly IApprovalService _approvalService;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ILogger<ApprovalsController> _logger;

    public ApprovalsController(
        IApprovalService approvalService,
        IApprovalNotificationService notificationService,
        ILogger<ApprovalsController> logger)
    {
        _approvalService = approvalService;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Get pending approvals for the current host (AC-JIRA-07)
    /// </summary>
    [HttpGet("pending")]
    public async Task<ActionResult<List<ApprovalResponse>>> GetPendingApprovals()
    {
        try
        {
            var hostEmployeeId = Guid.NewGuid(); // In production, get from JWT claims
            var approvals = await _approvalService.GetPendingApprovals(hostEmployeeId);
            return Ok(approvals);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approvals");
            return BadRequest(new { detail = "Error retrieving pending approvals" });
        }
    }

    /// <summary>
    /// Approve a visitor (AC-JIRA-07, AC-JIRA-09)
    /// </summary>
    [HttpPost("{approvalId}/approve")]
    public async Task<ActionResult<object>> ApproveVisitor(Guid approvalId)
    {
        try
        {
            var approval = await _approvalService.GetApprovalById(approvalId);
            if (approval == null)
                return NotFound(new { detail = "Approval not found" });

            if (approval.Status != "Pending")
                return Conflict(new { detail = "Approval is not pending" });

            var updatedApproval = await _approvalService.ApproveVisitor(approvalId);

            // Get the latest pass (from the approve operation)
            var pass = approval.Visitor.Passes?.LastOrDefault();

            return Ok(new
            {
                approvalId = updatedApproval.Id,
                status = updatedApproval.Status,
                passId = pass?.Id,
                message = "Approved successfully"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving visitor");
            return BadRequest(new { detail = "Error approving visitor" });
        }
    }

    /// <summary>
    /// Deny a visitor (AC-JIRA-08)
    /// </summary>
    [HttpPost("{approvalId}/deny")]
    public async Task<ActionResult<object>> DenyVisitor(Guid approvalId, DenyRequest request)
    {
        try
        {
            // Validate request
            if (string.IsNullOrEmpty(request.Reason))
                return BadRequest(new { detail = "Denial reason is required" });

            var validReasons = new[] { "Unavailable", "VisitNotScheduled", "SecurityConcern", "IncorrectHost", "Other" };
            if (!validReasons.Contains(request.Reason))
                return BadRequest(new { detail = "Invalid denial reason" });

            if (!string.IsNullOrEmpty(request.Note) && request.Note.Length > 200)
                return BadRequest(new { detail = "Denial note cannot exceed 200 characters" });

            var approval = await _approvalService.GetApprovalById(approvalId);
            if (approval == null)
                return NotFound(new { detail = "Approval not found" });

            if (approval.Status != "Pending")
                return Conflict(new { detail = "Approval is not pending" });

            var updatedApproval = await _approvalService.DenyVisitor(approvalId, request);

            return Ok(new
            {
                approvalId = updatedApproval.Id,
                status = updatedApproval.Status,
                message = "Denied successfully"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error denying visitor");
            return BadRequest(new { detail = "Error denying visitor" });
        }
    }
}
