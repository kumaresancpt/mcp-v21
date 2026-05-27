# Acceptance Criteria — SCRUM-18

## Frontend ACs (from Figma Design: All Visitors Page)

- **AC-FIGMA-01**: All Visitors Page Header & Layout
  - Source: figma (wjGYCnQg7UU19Hh5HWOmwa, node 40:3991)
  - Type: frontend
  - Visual spec ref: Frame "All visitor" → Title "All Visitors" (24px, Inter Semi Bold, #171717)
  - UI should display: "Welcome back [Username]" greeting in top-right, search bar for visitors, sidebar navigation
  - The page title "All Visitors" is prominent at top (24px, bold)
  - Sidebar should show icons for: Dashboard, All Visitor (highlighted), Gate Check-In, Gate Check-Out, Reports, Settings
  - Layout: Sidebar on left (~274px), main content area on right (~1118px)

- **AC-FIGMA-02**: Add Visitor Button
  - Source: figma
  - Type: frontend
  - Visual spec ref: Frame "All visitor" → Button "Add Visitor"
  - Button color: #5B21B6 (purple), padding 16px x 11px, border-radius 8px
  - Text: "Add Visitor", white text, Inter Semi Bold, 16px
  - Button should be positioned in the header (right side) near the page title
  - On click, should navigate to Visitor Entry form (implementing AC-JIRA-01 through AC-JIRA-12)

- **AC-FIGMA-03**: Visitor List Table with Columns
  - Source: figma
  - Type: frontend
  - Visual spec ref: Frame "All visitor" → Table headers (12px, Inter Semi Bold, #727272)
  - Table columns (in order): Name, Company, Host, Purpose, Check-in Time, Check-out Time, Status, Badge, Action
  - Column widths: Name (124px), Company (120px), Host (115px), Purpose (131px), Check-in Time (135px), Check-out Time (118px), Status (128px), Badge (97px), Action (remaining)
  - Table header background: #F6F6F6, border-bottom: #BABABA
  - Row height: minimum 40px with 10px vertical padding
  - Font: 12px for all cells

- **AC-FIGMA-04**: Visitor Table Data Display
  - Source: figma
  - Type: frontend
  - Visual spec ref: Table data rows showing example visitors (Mathew, Sarah, John, Emily, David, etc.)
  - Each row displays: Visitor name, company, host name, visit purpose, check-in/out times, status badge, and action icons
  - Status badges: "Check in" (green), "Waiting" (orange), "Checked Out" (purple), "Expired Pass" (red), "Pending Approval" (orange)
  - Action icons: Visibility icon (eye), Edit icon (pencil)
  - Pagination: Show 10, 32 records pagination at bottom

- **AC-FIGMA-05**: Visitor List Search & Filter
  - Source: figma
  - Type: frontend
  - Visual spec ref: Search box in header ("Search Visitor, Passes")
  - Search should be case-insensitive, matching against: Name, Company, Host, Purpose
  - Filter button next to search (icon: vuesax/linear/filter)
  - Filter should support: Status (Check in, Waiting, Checked Out, Expired, Pending), Date range, Host, Company

- **AC-FIGMA-06**: Table Footer & Pagination
  - Source: figma
  - Type: frontend
  - Visual spec ref: Footer with "Show 10 of 32 Records" and page numbers (1, 2, 3, 4, next)
  - Footer background: white, border-top: #E2E2E2
  - Copyright text at bottom: "Copyright 2026 Changepond. All Rights Reserved."

---

## Backend ACs (from Jira Issue SCRUM-18)

- **AC-JIRA-01**: Mandatory Field Validation
  - Source: jira (SCRUM-18)
  - Type: both (frontend validation + backend validation)
  - Mandatory fields: Full Name, Mobile Number, ID Type, ID Number, Purpose of Visit, Host Employee
  - Backend: POST /api/visitors/register should reject requests missing any mandatory field with 400 Bad Request + detail field listing missing fields
  - Frontend: Submit button disabled until all fields valid, inline error messages on blur, form scrolls to first invalid field on submit attempt
  - Test hint: Validate 400 response when submitting incomplete form; validate button enabled only when all fields valid

- **AC-JIRA-02**: Mobile Number Validation
  - Source: jira
  - Type: both
  - Valid format: 10-digit number with optional country code prefix (e.g., +91xxxxxxxxxx or xxxxxxxxxx)
  - Field should reject non-numeric except '+'
  - Backend: Regex validation in VisitorService, return 400 if invalid format
  - Duplicate check: If same mobile registered today, show warning "This visitor may have already been registered today. View existing record?"
  - Database query: Check Visitor table for same mobile number registered in last 24 hours
  - Test hint: Assert 400 on invalid format; assert warning message on duplicate within 24h

- **AC-JIRA-03**: ID Proof & Duplicate Check
  - Source: jira
  - Type: both
  - ID Type dropdown options: Aadhar Card, PAN Card, Passport, Driving License, Voter ID, Employee ID, Other
  - Validate ID Number format per type:
    - Aadhar: 12-digit
    - PAN: 10-character alphanumeric
    - Passport: Variable, alphanumeric
    - Driving License: 16-digit
    - Voter ID: 18-character alphanumeric
    - Employee ID: Alphanumeric
  - Duplicate check: Alert if same ID registered in last 24 hours (backend query on Visitor table)
  - Backend: Return 409 Conflict if duplicate found with list of similar records
  - Test hint: Validate format per ID type; assert 409 on duplicate within 24h window

- **AC-JIRA-04**: Photo Capture & Upload
  - Source: jira
  - Type: frontend
  - Two modes:
    1. Webcam: Activate device camera, live preview, Capture button, Retake option
    2. File upload: Accept JPG, PNG, JPEG, max 2 MB
  - Crop image to 1:1 aspect ratio (square portrait)
  - Preview before saving
  - Backend: Upload endpoint POST /api/visitors/upload-photo, store in secure object store (not public URLs), return signed URL valid for 7 days
  - File storage: Use cloud object store (e.g., AWS S3, Azure Blob, GCS) with ACL set to private
  - Test hint: Assert image cropped to 1:1; assert upload endpoint returns signed URL; assert URL expires after 7 days

- **AC-JIRA-05**: Host Employee Search
  - Source: jira
  - Type: frontend
  - Type-ahead dropdown: Triggers after 2+ characters typed
  - Results from HR/employee directory: Show Name, Employee ID, Department
  - On selection: Auto-populate Department field
  - No match found: Show "Not found? Add manually" option
  - Field required: Cannot submit without valid host selection
  - Backend: GET /api/employees/search?q={query} should return paginated list of employees with Name, EmployeeId, Department
  - Test hint: Assert results after 2 chars; assert department auto-populates on selection; assert form invalid without host

- **AC-JIRA-06**: Approval Notification Dispatch
  - Source: jira
  - Type: backend
  - Trigger: On POST /api/visitors/register submission with status "Pending"
  - Dispatch via: WhatsApp, SMS, Email (all configured channels)
  - SLA: Within 30 seconds of registration
  - Notification content: Visitor name, company, purpose, expected duration, Approve and Deny action links
  - Links: Should be secure, token-authenticated, one-click actions (no login required)
  - Retry logic: If notification fails, retry after 60 seconds (max 3 retries)
  - Database: Log notification dispatch in ApprovalNotification table (timestamps, channel, status, error if any)
  - Test hint: Assert notification sent within 30s; assert all channels attempted; assert retry on failure

- **AC-JIRA-07**: Approval Action by Host
  - Source: jira
  - Type: both
  - Two ways to approve/deny:
    1. From notification link: Secure token-authenticated, no login required, updates Visitor.Status and Approval.Status
    2. In app: Host views pending approvals list, selects action (Approve/Deny), time-stamped and logged with host's user account
  - Backend endpoints:
    - GET /api/approvals/pending (for host)
    - POST /api/approvals/{approvalId}/approve
    - POST /api/approvals/{approvalId}/deny (with reason required)
  - Status transitions: Pending → Approved or Pending → Denied
  - Test hint: Assert status updates in Visitor table; assert timestamp recorded; assert host account logged

- **AC-JIRA-08**: Denial Reason Requirement
  - Source: jira
  - Type: both
  - When denying, host must select reason: Unavailable, Visit not scheduled, Security concern, Incorrect host, Other
  - Optional free-text note (max 200 characters)
  - Backend: POST /api/approvals/{id}/deny requires { reason: string, note?: string }
  - Return 400 if reason missing; store in Approval entity
  - Reason communicated to receptionist and visitor
  - Test hint: Assert 400 on deny without reason; assert reason stored and visible to receptionist

- **AC-JIRA-09**: Digital Pass Generation
  - Source: jira
  - Type: backend
  - Trigger: On Approval.Status = "Approved"
  - Digital pass content:
    - QR code (unique per visit, non-reusable)
    - Visitor name, Host name, Date, Valid time window, Purpose
    - Cryptographic signature (cannot be verified by generic QR scanner)
  - Delivery: SMS/WhatsApp/Email to visitor's mobile within 2 minutes of approval
  - Backend: 
    - Generate QR with encrypted payload (QrCodeService)
    - Create VisitorPass entity (QrCode, ValidFrom, ValidTo, UsedAt, VisitorId)
    - Dispatch notification via SMS/WhatsApp/Email services
  - Validity: Valid only for the approved date/time range, one-time use (flag UsedAt on gate check-in)
  - Test hint: Assert QR generated on approval; assert sent to visitor within 2min; assert QR validated at gate

- **AC-JIRA-10**: Approval Timeout & Reminder
  - Source: jira
  - Type: backend
  - First reminder: If no response after 15 minutes, send reminder to host
  - Second alert: If no response after 30 minutes, alert receptionist with options:
    1. Wait longer (extends timeout by 10 min)
    2. Escalate to secondary approver
    3. Cancel visit request
  - Thresholds: Configurable by Admin in settings/appsettings.json
  - Backend: Background job (Timer/Scheduler) checks pending approvals, fires notifications
  - Database: ApprovalNotification table tracks all reminders and escalations
  - Test hint: Assert reminder sent at 15min; assert receptionist alert at 30min; assert escalation option available

- **AC-JIRA-11**: Save as Draft
  - Source: jira
  - Type: both
  - Allow receptionist to save incomplete form as Draft
  - Draft accessible from 'Drafts' section in visitor list
  - Draft data: Pre-populated when reopening form
  - Draft expiry: 4 hours from creation
  - No notification sent for drafts
  - Backend:
    - POST /api/visitors/draft (saves with Status = "Draft")
    - GET /api/visitors/drafts (list drafts for current receptionist)
    - Background job: Delete drafts older than 4 hours
  - Database: Visitor entity with Status = "Draft" and CreatedAt timestamp
  - Test hint: Assert draft saved; assert data pre-populated on reopen; assert auto-deleted after 4h

- **AC-JIRA-12**: Data Privacy & Masking
  - Source: jira
  - Type: backend
  - ID numbers: Stored encrypted in database (use data protection library e.g., DbContextOptions with encryption)
  - UI masking: Display only last 4 chars (e.g., "XXXX XXXX 4521"), except for Admin role
  - Full ID visibility: Only Admin role can see full ID number
  - Photos: Stored in secure object store (private ACL, not public URLs)
  - Data retention: Subject to configured policy (appsettings.json: DataRetentionDays)
  - GDPR compliance: Implement visitor data export and deletion endpoints (future scope)
  - Backend: Encryption in EF Core via ValueConverter (IdNumber property)
  - Test hint: Assert ID masked in API response for non-admin; assert admin can view full ID; assert photos private

---

## Database & Integration ACs

- **AC-DB-01**: Visitor Schema
  - Tables: Visitor, Approval, VisitorPass, ApprovalNotification, AuthAuditLog (already exists)
  - Visitor table columns:
    - VisitorId (UUID primary key)
    - FullName, MobileNumber, CompanyName (all required, indexed)
    - IdType, IdNumber (encrypted, indexed on last-4 for privacy)
    - PhotoUrl (encrypted/signed URL)
    - HostEmployeeId (FK to Employee)
    - PurposeOfVisit, ExpectedDurationMinutes
    - Status (Pending, Approved, Denied, Draft, CheckedIn, CheckedOut)
    - CheckInTime, CheckOutTime (nullable)
    - CreatedAt, UpdatedAt (timestamps)
    - CreatedBy (ReceptionistId)
  - Indexes: (MobileNumber, CreatedAt), (IdType, IdNumber), (Status, CreatedAt)

---

## Testing ACs

- **AC-TEST-01**: All Visitors Page Unit Tests
  - Test: Visitor list displays when data loaded
  - Test: Search filters visitors by name, company, host, purpose
  - Test: Status badges render with correct colors and text
  - Test: Pagination shows correct number of records
  - Test: Add Visitor button navigates to entry form

- **AC-TEST-02**: Visitor Entry Form Unit Tests
  - Test: Mandatory fields validation prevents submit
  - Test: Mobile number validation rejects invalid formats
  - Test: ID number validation per type (Aadhar 12-digit, PAN 10-char, etc.)
  - Test: Photo upload accepts JPG/PNG up to 2MB
  - Test: Host employee search returns results after 2 chars
  - Test: Department auto-populates on host selection

- **AC-TEST-03**: Backend Integration Tests
  - Test: POST /api/visitors/register with valid data creates Visitor (Status=Pending)
  - Test: POST /api/visitors/register rejects missing mandatory fields (400)
  - Test: Approval notifications sent within 30 seconds of registration
  - Test: Host can approve/deny from notification link without login
  - Test: POST /api/approvals/{id}/approve generates digital pass with QR code
  - Test: Digital pass sent to visitor within 2 minutes
  - Test: Visitor record can be saved as draft and reopened with pre-populated data
  - Test: Draft automatically deleted after 4 hours
  - Test: Duplicate mobile/ID checks within 24-hour window

---

## Summary
- **Total ACs**: 20 (6 frontend from Figma, 12 backend from Jira, 2 database/integration)
- **Frontend Focus**: All Visitors page list view, visitor search/filter, visitor entry form
- **Backend Focus**: Visitor registration, approval workflow, notification dispatch, digital pass generation
- **Database Focus**: Visitor, Approval, Pass, Notification schemas with encryption for sensitive data
- **Key Technologies**: React+TS frontend, ASP.NET Core 8 backend, PostgreSQL database, BCrypt encryption, JWT auth, SMS/WhatsApp/Email notifications
