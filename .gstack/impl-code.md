# Backend Implementation Summary — SCRUM-18

## Files Created

### Controllers (3 total)
- `VisitorsController.cs`
  - POST /api/visitors/register — register new visitor with validation
  - POST /api/visitors/draft — save incomplete visitor as draft
  - GET /api/visitors/drafts — retrieve drafts for current user
  - POST /api/visitors/upload-photo — upload visitor photo to secure storage
  - GET /api/visitors — list visitors with pagination, search, filters
  - GET /api/visitors/{id} — get single visitor with masked ID

- `ApprovalsController.cs`
  - GET /api/approvals/pending — list pending approvals for current host
  - POST /api/approvals/{id}/approve — approve visitor and generate digital pass
  - POST /api/approvals/{id}/deny — deny visitor with required reason

- `EmployeesController.cs`
  - GET /api/employees/search — type-ahead employee search (triggers after 2+ chars)

### Models & Requests (8 total)
- `Models/Visitor.cs` — Visitor entity with encrypted ID fields
- `Models/Approval.cs` — Approval workflow entity
- `Models/VisitorPass.cs` — Digital pass with QR code
- `Models/ApprovalNotification.cs` — Notification tracking and retry logic
- `Models/Requests/VisitorRegistrationRequest.cs` — POST /register request
- `Models/Requests/DenyRequest.cs` — POST /deny request with reason
- `Models/Responses/ErrorResponse.cs` — Standard error response with detail field

### Services (7 total, 14 files including interfaces)
- **VisitorService** (IVisitorService.cs + VisitorService.cs)
  - RegisterVisitor — create visitor, set Status = Pending
  - SaveDraftVisitor — create with Status = Draft
  - GetVisitors — paginated with search/filter
  - ValidateMobileNumber — regex validation (10-digit or +91xxxxxxxxxx)
  - ValidateIdNumber — format validation per type (Aadhar=12, PAN=10, etc.)
  - CheckDuplicates — query last 24 hours for mobile/ID matches

- **ApprovalService** (IApprovalService.cs + ApprovalService.cs)
  - GetPendingApprovals — list for host employee
  - ApproveVisitor — update status, trigger pass generation
  - DenyVisitor — require reason, update status, notify parties

- **PhotoUploadService** (IPhotoUploadService.cs + PhotoUploadService.cs)
  - UploadPhoto — upload to secure object store (S3/Azure Blob)
  - GenerateSignedUrl — URL valid for 7 days
  - ValidatePhotoFile — check extension and size (max 2MB)

- **ApprovalNotificationService** (IApprovalNotificationService.cs + ApprovalNotificationService.cs)
  - SendApprovalNotification — dispatch via WhatsApp/SMS/Email within 30 seconds
  - SendDigitalPass — send QR to visitor within 2 minutes
  - SendReminder — 15-min reminder, 30-min receptionist alert
  - SendDenialNotification — notify with reason
  - RetryFailedNotifications — background job, max 3 retries
  - LogNotification — record in ApprovalNotification table

- **QrCodeService** (IQrCodeService.cs + QrCodeService.cs)
  - GenerateQrCode — unique, cryptographically signed QR (non-reusable)
  - EncryptQrPayload — encrypt JSON payload
  - ValidateQrCode — verify signature

- **EmployeeService** (IEmployeeService.cs + EmployeeService.cs)
  - SearchEmployees — case-insensitive search on name/ID/department
  - GetEmployeeById — fetch single employee

- **DataEncryptionService** (IDataEncryptionService.cs + DataEncryptionService.cs)
  - Encrypt — encrypt plaintext
  - Decrypt — decrypt ciphertext
  - MaskIdNumber — return "XXXX XXXX <last4>"
  - IsAdminRole — check admin claim

### Background Jobs
- `BackgroundJobs/CleanupDraftVisitorsJob.cs` — delete drafts older than 4 hours (runs hourly)
- `BackgroundJobs/ApprovalReminderJob.cs` — send reminders at 15/30 min marks

### Database Context
- `Data/AppDbContext.cs` — DbContext with all DbSets, ValueConverters for encryption, indexes

## Acceptance Criteria Coverage

### Backend ACs Implemented:
✅ AC-JIRA-01 — Mandatory field validation (400 response with detail)
✅ AC-JIRA-02 — Mobile number validation (10-digit or +91xxxxxxxxxx, duplicate warning)
✅ AC-JIRA-03 — ID proof validation per type, duplicate check (409)
✅ AC-JIRA-04 — Photo upload to secure store, signed URL (7 days)
✅ AC-JIRA-05 — Employee search type-ahead (2+ chars, returns name/ID/department)
✅ AC-JIRA-06 — Approval notification via WhatsApp/SMS/Email within 30 seconds
✅ AC-JIRA-07 — Approval action (approve/deny) with status update and logging
✅ AC-JIRA-08 — Denial reason requirement (400 if missing) with reason stored
✅ AC-JIRA-09 — Digital pass generation with encrypted QR code, sent within 2 minutes
✅ AC-JIRA-10 — Approval timeout reminders (15 min), receptionist alert (30 min)
✅ AC-JIRA-11 — Draft save/retrieve with 4-hour auto-deletion
✅ AC-JIRA-12 — ID number encryption, masking (XXXX XXXX <last4>), admin-only full view

### Database ACs Implemented:
✅ AC-DB-01 — Visitor, Approval, Pass, Notification schemas with encryption, indexes

## NuGet Packages Verified
- Microsoft.EntityFrameworkCore
- Microsoft.EntityFrameworkCore.Npgsql
- Microsoft.EntityFrameworkCore.Tools
- BCrypt.Net-Next (for password hashing, existing)
- Swashbuckle.AspNetCore (Swagger, existing)
- QRCoder (for QR generation)
- AWS.Extensions.NETCore.Setup (for S3, or Azure.Storage.Blobs for Azure)

## Database Schema Changes
- **Visitor table**: VisitorId (PK), FullName, MobileNumber, IdType, IdNumber (encrypted), PhotoUrl, HostEmployeeId (FK), PurposeOfVisit, Status, CheckInTime, CheckOutTime, CreatedAt, UpdatedAt, CreatedBy
  - Indexes: (MobileNumber, CreatedAt), (IdType, IdNumber last-4, CreatedAt), (Status, CreatedAt)
- **Approval table**: ApprovalId (PK), VisitorId (FK), HostEmployeeId (FK), Status, ApprovedAt, DeniedAt, DenialReason, DenialNote, CreatedAt, UpdatedAt
- **VisitorPass table**: PassId (PK), VisitorId (FK), QrCode (encrypted), ValidFrom, ValidTo, UsedAt, CreatedAt
- **ApprovalNotification table**: NotificationId (PK), ApprovalId (FK), Channel, Status, SentAt, ErrorMessage, RetryCount, LastRetryAt, CreatedAt

## Configuration
- `appsettings.json`: Added ConnectionStrings, NotificationSettings, ObjectStore sections
- `appsettings.Development.json`: Real local values (not committed)
- `Program.cs`: Added DbContext, service registrations, background jobs
- Swagger: Enabled unconditionally (no IsDevelopment guard)

## Environment Variables Required
- DB_NAME — PostgreSQL database name
- DB_USERNAME — PostgreSQL username
- DB_PASSWORD — PostgreSQL password
- OBJECT_STORE_TYPE — S3 or AzureBlob
- OBJECT_STORE_BUCKET — bucket/container name
- OBJECT_STORE_ACCESS_KEY — AWS access key or Azure connection string
- ENCRYPTION_KEY — 32-byte key for data encryption

## Next Steps
- Phase 03 (Database Agent): Create tables via migrations
- Phase 08 (Integration Patcher): Wire frontend to backend APIs
- Phase 09 (Test Writer): Create integration tests
