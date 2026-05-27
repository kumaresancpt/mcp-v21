using Microsoft.AspNetCore.Mvc;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;
using VmsBackend.Services;

namespace VmsBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitorsController : ControllerBase
{
    private readonly IVisitorService _visitorService;
    private readonly IPhotoUploadService _photoUploadService;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ILogger<VisitorsController> _logger;

    public VisitorsController(
        IVisitorService visitorService,
        IPhotoUploadService photoUploadService,
        IApprovalNotificationService notificationService,
        ILogger<VisitorsController> logger)
    {
        _visitorService = visitorService;
        _photoUploadService = photoUploadService;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new visitor (AC-JIRA-01, AC-JIRA-02, AC-JIRA-03, AC-JIRA-06)
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<object>> Register(VisitorRegistrationRequest request)
    {
        try
        {
            // Validate mandatory fields
            var missingFields = new List<string>();
            if (string.IsNullOrEmpty(request.FullName)) missingFields.Add("fullName");
            if (string.IsNullOrEmpty(request.MobileNumber)) missingFields.Add("mobileNumber");
            if (string.IsNullOrEmpty(request.IdType)) missingFields.Add("idType");
            if (string.IsNullOrEmpty(request.IdNumber)) missingFields.Add("idNumber");
            if (string.IsNullOrEmpty(request.PurposeOfVisit)) missingFields.Add("purposeOfVisit");
            if (request.HostEmployeeId == Guid.Empty) missingFields.Add("hostEmployeeId");

            if (missingFields.Any())
                return BadRequest(new { detail = $"Missing required fields: {string.Join(", ", missingFields)}" });

            // Validate mobile number format
            if (!_visitorService.ValidateMobileNumber(request.MobileNumber))
                return BadRequest(new { detail = "Invalid mobile number format. Expected 10-digit number with optional +91 prefix" });

            // Validate ID number format
            if (!_visitorService.ValidateIdNumber(request.IdType, request.IdNumber))
                return BadRequest(new { detail = $"Invalid {request.IdType} number format" });

            // Check for duplicates
            var duplicates = await _visitorService.CheckDuplicates(request.MobileNumber, request.IdType, request.IdNumber);
            var warning = duplicates.Any() ? "warning: This visitor may have already been registered today. View existing record?" : null;

            // Register visitor
            var receptionistId = Guid.NewGuid(); // In production, get from JWT claims
            var visitor = await _visitorService.RegisterVisitor(request, receptionistId);

            // Send approval notification
            await _notificationService.LogNotification(visitor.Id, "Email", "Pending");

            return CreatedAtAction(nameof(GetVisitorById), new { id = visitor.Id }, new
            {
                visitorId = visitor.Id,
                status = visitor.Status,
                message = "Visitor registered successfully",
                warning = warning
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering visitor");
            return BadRequest(new { detail = "Error registering visitor" });
        }
    }

    /// <summary>
    /// Save visitor registration as draft (AC-JIRA-11)
    /// </summary>
    [HttpPost("draft")]
    public async Task<ActionResult<object>> SaveDraft(VisitorRegistrationRequest request)
    {
        try
        {
            var receptionistId = Guid.NewGuid(); // In production, get from JWT claims
            var visitor = await _visitorService.SaveDraftVisitor(request, receptionistId);

            return CreatedAtAction(nameof(GetVisitorById), new { id = visitor.Id }, new
            {
                visitorId = visitor.Id,
                status = visitor.Status,
                message = "Draft saved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving draft");
            return BadRequest(new { detail = "Error saving draft" });
        }
    }

    /// <summary>
    /// Get all draft registrations (AC-JIRA-11)
    /// </summary>
    [HttpGet("drafts")]
    public async Task<ActionResult<PaginatedList<VisitorResponse>>> GetDrafts(int page = 1, int limit = 10)
    {
        try
        {
            var receptionistId = Guid.NewGuid(); // In production, get from JWT claims
            var drafts = await _visitorService.GetDrafts(receptionistId, page, limit, User);
            return Ok(drafts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving drafts");
            return BadRequest(new { detail = "Error retrieving drafts" });
        }
    }

    /// <summary>
    /// Upload visitor photo (AC-JIRA-04)
    /// </summary>
    [HttpPost("upload-photo")]
    public async Task<ActionResult<object>> UploadPhoto(IFormFile file)
    {
        try
        {
            var photoUrl = await _photoUploadService.UploadPhoto(file);
            return Ok(new { photoUrl });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading photo");
            return BadRequest(new { detail = "Error uploading photo" });
        }
    }

    /// <summary>
    /// Get all visitors with pagination and filters (AC-FIGMA-03, AC-FIGMA-04, AC-FIGMA-06)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedList<VisitorResponse>>> GetVisitors(
        int page = 1, 
        int limit = 10, 
        string? search = null, 
        string? status = null, 
        Guid? host = null, 
        string? company = null,
        DateTime? dateFrom = null,
        DateTime? dateTo = null)
    {
        try
        {
            var result = await _visitorService.GetVisitors(page, limit, search, status, host, company, dateFrom, dateTo, User);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving visitors");
            return BadRequest(new { detail = "Error retrieving visitors" });
        }
    }

    /// <summary>
    /// Get a specific visitor by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<VisitorResponse>> GetVisitorById(Guid id)
    {
        try
        {
            var visitor = await _visitorService.GetVisitorById(id, User);
            if (visitor == null)
                return NotFound(new { detail = "Visitor not found" });

            return Ok(visitor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving visitor");
            return BadRequest(new { detail = "Error retrieving visitor" });
        }
    }

    /// <summary>
    /// Update visitor (only drafts can be updated)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<VisitorResponse>> UpdateVisitor(Guid id, VisitorRegistrationRequest request)
    {
        try
        {
            var visitor = await _visitorService.UpdateVisitor(id, request);
            var response = await _visitorService.GetVisitorById(id, User);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
                return NotFound(new { detail = ex.Message });
            return Conflict(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating visitor");
            return BadRequest(new { detail = "Error updating visitor" });
        }
    }
}
