# Implementation Plan — SCRUM-18: Backend All Visitor Page

## Acceptance Criteria Overview
| AC  | Description                                          | Type     |
|-----|------------------------------------------------------|----------|
| AC-FIGMA-01 | All Visitors Page Header & Layout | frontend |
| AC-FIGMA-02 | Add Visitor Button | frontend |
| AC-FIGMA-03 | Visitor List Table with Columns | frontend |
| AC-FIGMA-04 | Visitor Table Data Display | frontend |
| AC-FIGMA-05 | Visitor List Search & Filter | frontend |
| AC-FIGMA-06 | Table Footer & Pagination | frontend |
| AC-JIRA-01 | Mandatory Field Validation | both |
| AC-JIRA-02 | Mobile Number Validation | both |
| AC-JIRA-03 | ID Proof & Duplicate Check | both |
| AC-JIRA-04 | Photo Capture & Upload | frontend |
| AC-JIRA-05 | Host Employee Search | frontend |
| AC-JIRA-06 | Approval Notification Dispatch | backend |
| AC-JIRA-07 | Approval Action by Host | both |
| AC-JIRA-08 | Denial Reason Requirement | both |
| AC-JIRA-09 | Digital Pass Generation | backend |
| AC-JIRA-10 | Approval Timeout & Reminder | backend |
| AC-JIRA-11 | Save as Draft | both |
| AC-JIRA-12 | Data Privacy & Masking | backend |
| AC-DB-01 | Visitor Schema | database |
| AC-TEST-01 through AC-TEST-03 | Unit & Integration Tests | testing |

---

## Phase 1 — Frontend (05-frontend-writer)

### Folders to create:
- ./frontend/src/components/AllVisitors/
- ./frontend/src/pages/VisitorEntry/
- ./frontend/src/__tests__/

### Files to write:
- ./frontend/src/pages/AllVisitors.tsx → covers AC-FIGMA-01, AC-FIGMA-02, AC-FIGMA-03, AC-FIGMA-04, AC-FIGMA-05, AC-FIGMA-06
  - Header with sidebar navigation (Dashboard, All Visitor, Gate Check-In, Gate Check-Out, Reports, Settings)
  - Welcome back greeting with username
  - Search bar for visitor search (case-insensitive search on Name, Company, Host, Purpose)
  - Filter button with status, date range, host, company filters
  - Visitor list table with 9 columns (Name, Company, Host, Purpose, Check-in Time, Check-out Time, Status, Badge, Action)
  - Status badges with colors (Check in=green, Waiting=orange, Checked Out=purple, Expired Pass=red, Pending Approval=orange)
  - Pagination controls (Show 10, 32 records, page numbers)
  - Copyright footer: "Copyright 2026 Changepond. All Rights Reserved."

- ./frontend/src/pages/VisitorEntry.tsx → covers AC-JIRA-01, AC-JIRA-02, AC-JIRA-03, AC-JIRA-04, AC-JIRA-05, AC-JIRA-11
  - Form with mandatory fields: Full Name, Mobile Number, ID Type, ID Number, Purpose of Visit, Host Employee
  - Mandatory field validation (disable submit button until all valid)
  - Mobile number validation: 10-digit or +91xxxxxxxxxx format, inline error messages on blur
  - ID Type dropdown with options: Aadhar, PAN, Passport, Driving License, Voter ID, Employee ID, Other
  - ID Number format validation per type (Aadhar=12-digit, PAN=10-char, etc.)
  - Duplicate check warnings for mobile/ID within 24 hours
  - Photo capture UI: Webcam + file upload modes, 1:1 aspect ratio crop, preview before save
  - Host employee type-ahead search (triggers after 2+ chars)
  - Auto-populate Department field on host selection
  - Save as Draft button
  - Submit button (registers visitor)

- ./frontend/src/components/VisitorTable.tsx → renders table from AllVisitors.tsx
- ./frontend/src/components/PhotoCapture.tsx → webcam + file upload for AC-JIRA-04
- ./frontend/src/components/HostSearch.tsx → type-ahead dropdown for AC-JIRA-05
- ./frontend/src/hooks/useVisitors.ts → fetch visitor list from backend
- ./frontend/src/hooks/useEmployeeSearch.ts → fetch employee list for host search
- ./frontend/src/hooks/usePhotoUpload.ts → upload photo to backend

### Install:
- npm install (from ./frontend)

---

## Phase 2 — Backend (06-backend-writer)

### Folders to create:
- ./backend/Controllers/
- ./backend/Models/
- ./backend/Services/
- ./backend/Data/

### Files to write:

#### Controllers:
- ./backend/Controllers/VisitorsController.cs
  - POST /api/visitors/register → covers AC-JIRA-01, AC-JIRA-02, AC-JIRA-03, AC-JIRA-11
    - Mandatory field validation (Full Name, Mobile, ID Type, ID Number, Purpose, Host)
    - Mobile number format validation (10-digit or +91xxxxxxxxxx)
    - ID number validation per type
    - Duplicate check within 24 hours (return 409 if found)
    - Save to Visitor table with Status = "Pending"
    - Trigger approval notification (AC-JIRA-06)
  - POST /api/visitors/draft → covers AC-JIRA-11
    - Save incomplete form with Status = "Draft"
    - Background job to delete drafts older than 4 hours
  - GET /api/visitors/drafts → retrieve drafts for current user
  - POST /api/visitors/upload-photo → covers AC-JIRA-04
    - Accept JPG, PNG, JPEG (max 2 MB)
    - Store in secure object store (private ACL)
    - Return signed URL valid for 7 days
  - GET /api/visitors → list all visitors with pagination (covers AC-FIGMA-03, AC-FIGMA-04, AC-FIGMA-06)
    - Query parameters: page, limit, search, filter (status, date range, host, company)
    - Return paginated list with status badges

- ./backend/Controllers/ApprovalsController.cs → covers AC-JIRA-07, AC-JIRA-08
  - GET /api/approvals/pending → list pending approvals for current host
  - POST /api/approvals/{approvalId}/approve → approve visitor
    - Update Visitor.Status = "Approved"
    - Update Approval.Status = "Approved"
    - Timestamp and log action
    - Trigger digital pass generation (AC-JIRA-09)
  - POST /api/approvals/{approvalId}/deny → deny visitor
    - Requires reason (Unavailable, Visit not scheduled, Security concern, Incorrect host, Other)
    - Optional note (max 200 chars)
    - Update Visitor.Status = "Denied"
    - Update Approval.Status = "Denied"
    - Return 400 if reason missing
    - Notify receptionist and visitor

- ./backend/Controllers/EmployeesController.cs → covers AC-JIRA-05
  - GET /api/employees/search?q={query} → type-ahead search
    - Return paginated list of employees (Name, EmployeeId, Department)
    - Case-insensitive search
    - Triggered after 2+ chars

#### Models:
- ./backend/Models/Visitor.cs → AC-DB-01
  - VisitorId (UUID PK)
  - FullName, MobileNumber, CompanyName (required, indexed)
  - IdType, IdNumber (encrypted, indexed)
  - PhotoUrl (signed URL)
  - HostEmployeeId (FK)
  - PurposeOfVisit, ExpectedDurationMinutes
  - Status (Pending, Approved, Denied, Draft, CheckedIn, CheckedOut)
  - CheckInTime, CheckOutTime (nullable)
  - CreatedAt, UpdatedAt
  - CreatedBy (ReceptionistId)

- ./backend/Models/Approval.cs
  - ApprovalId (UUID PK)
  - VisitorId (FK)
  - HostEmployeeId (FK)
  - Status (Pending, Approved, Denied)
  - ApprovedAt, DeniedAt (nullable)
  - DenialReason, DenialNote (nullable)
  - CreatedAt, UpdatedAt

- ./backend/Models/VisitorPass.cs → AC-JIRA-09
  - PassId (UUID PK)
  - VisitorId (FK)
  - QrCode (encrypted blob)
  - ValidFrom, ValidTo (time window)
  - UsedAt (nullable, set on gate check-in)
  - CreatedAt

- ./backend/Models/ApprovalNotification.cs → AC-JIRA-06, AC-JIRA-10
  - NotificationId (UUID PK)
  - ApprovalId (FK)
  - Channel (WhatsApp, SMS, Email)
  - Status (Pending, Sent, Failed)
  - SentAt, ErrorMessage (nullable)
  - RetryCount, LastRetryAt
  - CreatedAt

- ./backend/Models/ErrorResponse.cs (if not exists)
  - detail: string

#### Services:
- ./backend/Services/IVisitorService.cs + VisitorService.cs → covers AC-JIRA-01, AC-JIRA-02, AC-JIRA-03, AC-JIRA-11
  - RegisterVisitor() — validate, check duplicates, save to DB
  - SaveDraftVisitor() — save with Status = "Draft"
  - GetVisitors() — paginated list
  - GetVisitorById()
  - ValidateMobileNumber() — regex validation
  - ValidateIdNumber() — format per ID type
  - CheckDuplicates() — query within 24 hours

- ./backend/Services/IApprovalService.cs + ApprovalService.cs → covers AC-JIRA-07, AC-JIRA-08
  - GetPendingApprovals()
  - ApproveVisitor() — update status, trigger pass generation
  - DenyVisitor() — validate reason, update status
  - GetApprovalById()

- ./backend/Services/IPhotoUploadService.cs + PhotoUploadService.cs → covers AC-JIRA-04
  - UploadPhoto() — store in secure object store
  - GenerateSignedUrl() — valid for 7 days

- ./backend/Services/IApprovalNotificationService.cs + ApprovalNotificationService.cs → covers AC-JIRA-06, AC-JIRA-10
  - SendApprovalNotification() — dispatch via WhatsApp, SMS, Email
  - SendReminder() — send at 15 min and 30 min marks
  - RetryFailedNotifications() — retry up to 3 times
  - LogNotification() — record in ApprovalNotification table

- ./backend/Services/IQrCodeService.cs + QrCodeService.cs → covers AC-JIRA-09
  - GenerateQrCode() — create unique, non-reusable QR with encrypted payload
  - ValidateQrCode() — verify at gate

- ./backend/Services/IEmployeeService.cs + EmployeeService.cs → covers AC-JIRA-05
  - SearchEmployees() — type-ahead search by name/ID
  - GetEmployeeById()

- ./backend/Services/IDataEncryptionService.cs + DataEncryptionService.cs → covers AC-JIRA-12
  - EncryptIdNumber()
  - DecryptIdNumber()
  - MaskIdNumber() — display only last 4 chars

### Restore:
- dotnet restore (runs after backend.csproj is written)

---

## Phase 3 — Database Setup (07-database-agent)

### Credentials prompt:
- Agent will pause and ask for database name, PostgreSQL username, and password before proceeding

### Actions:
- Creates Visitor.cs entity (AC-DB-01)
- Creates Approval.cs entity
- Creates VisitorPass.cs entity (AC-JIRA-09)
- Creates ApprovalNotification.cs entity (AC-JIRA-06, AC-JIRA-10)
- Creates AppDbContext.cs with DbSets for all entities
- Installs NuGet packages: Microsoft.EntityFrameworkCore.Npgsql, BCrypt.Net-Next, Swashbuckle.AspNetCore
- Writes connection string placeholder to appsettings.json
- Writes host/db only (no credentials) to appsettings.Development.json
- Runs `dotnet ef migrations add InitialCreate`
- Runs `dotnet ef database update`
- DB credentials injected at runtime via DB_NAME, DB_USERNAME, DB_PASSWORD env variables

---

## Phase 4 — Integration Patch (08-integration-patcher)

### Files to patch:
- ./frontend/src/pages/AllVisitors.tsx
  - Hook: useVisitors()
  - Wires to: GET /api/visitors
  - Request: page, limit, search, filters (status, dateRange, host, company)
  - Response: visitorList[], totalCount, currentPage
  - On success: populate table
  - On error: display toast error message from response.detail

- ./frontend/src/pages/VisitorEntry.tsx
  - Handler: handleRegisterVisitor()
  - Wires to: POST /api/visitors/register
  - Request: fullName, mobileNumber, idType, idNumber, purposeOfVisit, hostEmployeeId, photoUrl, expectedDurationMinutes
  - Response: visitorId, status
  - On success: redirect to /all-visitors with success toast
  - On error: display error toast from response.detail, scroll to first invalid field

  - Handler: handleSaveDraft()
  - Wires to: POST /api/visitors/draft
  - Request: same as register
  - Response: draftId
  - On success: show "Draft saved" toast, allow reopening

  - Handler: handlePhotoUpload()
  - Wires to: POST /api/visitors/upload-photo
  - Request: FormData with file, cropCoordinates
  - Response: photoUrl (signed)
  - On success: preview image
  - On error: show error toast

  - Handler: handleHostSearch()
  - Wires to: GET /api/employees/search?q={query}
  - Response: employees[] with (name, employeeId, department)
  - On selection: populate department field automatically

- ./frontend/src/components/HostSearch.tsx
  - Type-ahead dropdown
  - Wires to: GET /api/employees/search

### Vite proxy check:
- Verify ./frontend/vite.config.ts has proxy: { '/api': 'http://localhost:8000' }

---

## Phase 5 — Tests (09-test-writer)

### Frontend Tests:
- ./frontend/src/__tests__/AllVisitors.test.tsx → covers AC-TEST-01
  - Test: Visitor list displays when data loaded
  - Test: Search filters visitors by name, company, host, purpose
  - Test: Status badges render with correct colors and text
  - Test: Pagination shows correct number of records
  - Test: Add Visitor button navigates to entry form

- ./frontend/src/__tests__/VisitorEntry.test.tsx → covers AC-TEST-02
  - Test: Mandatory fields validation prevents submit
  - Test: Mobile number validation rejects invalid formats (e.g., 5-digit, non-numeric)
  - Test: ID number validation per type (Aadhar 12-digit, PAN 10-char, etc.)
  - Test: Photo upload accepts JPG/PNG up to 2MB
  - Test: Photo upload rejects files > 2MB or wrong format
  - Test: Host employee search returns results after 2 chars
  - Test: Department auto-populates on host selection
  - Test: Duplicate mobile warning displays
  - Test: Duplicate ID warning displays
  - Test: Save as Draft button saves form state
  - Test: Draft pre-populates on reopen

### Backend Integration Tests:
- ./backend/Tests/VisitorControllerTests.cs → covers AC-TEST-03
  - Test: POST /api/visitors/register with valid data creates Visitor (Status=Pending)
  - Test: POST /api/visitors/register rejects missing mandatory fields (400)
  - Test: Mobile number validation returns 400 on invalid format
  - Test: Duplicate mobile within 24h returns 409 with list of similar records
  - Test: Duplicate ID within 24h returns 409
  - Test: Photo upload returns signed URL (valid for 7 days)
  - Test: Draft saved with Status = "Draft"
  - Test: Draft retrieved and pre-populated

- ./backend/Tests/ApprovalControllerTests.cs
  - Test: POST /api/approvals/{id}/approve updates Visitor.Status to "Approved"
  - Test: POST /api/approvals/{id}/deny requires reason (400 if missing)
  - Test: Approval triggers digital pass generation
  - Test: Digital pass sent to visitor within 2 minutes
  - Test: Denial reason stored in Approval entity
  - Test: Denial reason communicated to receptionist and visitor

- ./backend/Tests/NotificationServiceTests.cs
  - Test: Approval notification sent within 30 seconds
  - Test: Notification sent via all channels (WhatsApp, SMS, Email)
  - Test: Failed notification retries (max 3 retries)
  - Test: Reminder sent at 15 minutes if no response
  - Test: Receptionist alert sent at 30 minutes

---

## Phase 6 — Sonar Scan (10-sonar-runner)
- Scans: ./frontend/src/ and ./backend/
- Reports: code smells, security issues, coverage gaps
- Output: output/sonar-report.txt

---

## Phase 7 — Implementation Review (11-impl-reviewer)
- Verifies every AC is covered by both code and tests
- Checks integration patch correctness
- Output: output/review-report.txt

---

## Phase 8 — Tests Run
- Command: npm test -- --watchAll=false (from ./frontend)
- On failure: 12-bug-fixer agent is invoked automatically

---

## Phase 9 — Start App
- Frontend: npm run dev (from ./frontend) → http://localhost:5173
- Backend: dotnet run --urls http://localhost:8000 (from ./backend) → http://localhost:8000
- Swagger: http://localhost:8000/swagger

---

## Phase 10 — GitHub PR
- Branch: feature/SCRUM-18-v1 (auto-versioned by 13-github-agent)
- Base: main
- Commit: feat(SCRUM-18): Backend All Visitor Page [v1]
- PR title: feat(SCRUM-18): Backend All Visitor Page [v1]
- PR body: contents of output/changelog.md
