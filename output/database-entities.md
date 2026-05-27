# Database Entity Definitions

## Overview
This document provides a comprehensive list of all database entities created in the `mcp_visitors` database for the Visitor Management System (SCRUM-18).

**Total Entities:** 11
**Date Created:** 2026-05-27
**ORM:** Entity Framework Core 8
**Database:** PostgreSQL with Npgsql

---

## Entity Index

1. User — User accounts and authentication
2. Session — Active user sessions
3. OtpToken — Multi-factor authentication tokens
4. PasswordHistory — Password change audit trail
5. AuthAuditLog — Immutable authentication event log
6. TokenDenylistEntry — Revoked JWT tokens
7. Visitor — Visitor registration records
8. Approval — Visitor approval tracking
9. VisitorPass — QR code access passes
10. ApprovalNotification — Notification delivery tracking
11. Employee — Employee/host directory

---

## Entity Definitions

### 1. User

**Purpose:** Store user accounts for system access

**C# Class Location:** `backend/Data/User.cs`

**Database Table:** `users`

**Primary Key:** `Id` (UUID)

**Unique Constraints:**
- `Username` (case-insensitive lookup)
- `Email` (if provided)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | User identifier |
| Username | string | varchar(100) | UNIQUE, NOT NULL | Login username |
| Email | string | varchar(255) | UNIQUE, NULLABLE | Contact email |
| PasswordHash | string | text | NOT NULL | Bcrypt hashed password |
| Role | string | varchar(50) | NOT NULL, DEFAULT='Receptionist' | User role (Receptionist, Approver, Admin) |
| FailedAttemptCount | int | integer | NOT NULL | Failed login counter |
| LockoutExpiresAt | DateTime? | timestamp | NULLABLE | Account lockout expiration |
| LastLoginAt | DateTime? | timestamp | NULLABLE | Last successful login |
| CreatedAt | DateTime | timestamp | NOT NULL | Creation timestamp (UTC) |

**Relationships:**
- HasMany: Sessions, OtpTokens, PasswordHistories, AuthAuditLogs

**Indexes:**
- UNIQUE ON Username
- UNIQUE ON Email

**Status:** ✅ Created via InitialCreate migration

---

### 2. Session

**Purpose:** Manage active user sessions and JWT tokens

**C# Class Location:** `backend/Data/Session.cs`

**Database Table:** `sessions`

**Primary Key:** `Id` (UUID)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Session identifier |
| UserId | Guid | uuid | FK, NOT NULL | Associated user |
| TokenHash | string | text | NOT NULL | Hashed JWT token |
| CreatedAt | DateTime | timestamp | NOT NULL | Session start time (UTC) |
| ExpiresAt | DateTime | timestamp | NOT NULL | Session expiration (UTC) |
| LastActivityAt | DateTime | timestamp | NOT NULL | Last activity time (UTC) |
| IsValid | bool | boolean | NOT NULL | Session validity flag |
| IpAddress | string | varchar(45) | NULLABLE | Client IPv4/IPv6 |
| UserAgent | string | varchar(512) | NULLABLE | Browser/device info |

**Relationships:**
- BelongsTo: User (Cascade Delete on user deletion)

**Indexes:**
- INDEX ON UserId
- INDEX ON ExpiresAt (for cleanup)

**Status:** ✅ Created via InitialCreate migration

---

### 3. OtpToken

**Purpose:** One-time passwords for multi-factor authentication

**C# Class Location:** `backend/Data/OtpToken.cs`

**Database Table:** `otp_tokens`

**Primary Key:** `Id` (UUID)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Token identifier |
| UserId | Guid | uuid | FK, NOT NULL | Associated user |
| HashedOtp | string | text | NOT NULL | Hashed OTP value |
| ExpiresAt | DateTime | timestamp | NOT NULL | OTP expiration (UTC) |
| AttemptCount | int | integer | NOT NULL | Failed verification attempts |
| Consumed | bool | boolean | NOT NULL | Whether OTP has been used |
| CreatedAt | DateTime | timestamp | NOT NULL | Creation timestamp (UTC) |

**Relationships:**
- BelongsTo: User (Cascade Delete on user deletion)

**Indexes:**
- INDEX ON UserId
- INDEX ON ExpiresAt (for expired token cleanup)

**Status:** ✅ Created via InitialCreate migration

---

### 4. PasswordHistory

**Purpose:** Audit trail for password changes (prevent reuse)

**C# Class Location:** `backend/Data/PasswordHistory.cs`

**Database Table:** `password_history`

**Primary Key:** `Id` (UUID)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | History record ID |
| UserId | Guid | uuid | FK, NOT NULL | Associated user |
| PasswordHash | string | text | NOT NULL | Previous password hash |
| RecordedAt | DateTime | timestamp | NOT NULL | Change timestamp (UTC) |

**Relationships:**
- BelongsTo: User (Cascade Delete on user deletion)

**Indexes:**
- INDEX ON UserId

**Status:** ✅ Created via InitialCreate migration

**PasswordPolicy Configuration:**
- MinLength: 8 characters
- RequireUppercase: true
- RequireLowercase: true
- RequireDigit: true
- RequireSpecial: true
- HistoryCount: 5 (prevent reusing last 5 passwords)

---

### 5. AuthAuditLog

**Purpose:** Immutable audit log of authentication events (AC-13)

**C# Class Location:** `backend/Data/AuthAuditLog.cs`

**Database Table:** `auth_audit_log`

**Primary Key:** `Id` (UUID)

**Immutability:** INSERT ONLY (REVOKE UPDATE/DELETE at DB level per AC-13)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Audit log entry ID |
| Timestamp | DateTime | timestamp | NOT NULL | Event timestamp (UTC) |
| EventType | string | varchar(100) | NOT NULL | Event type |
| UserId | Guid? | uuid | FK, NULLABLE | Associated user (null for failed logins) |
| Username | string | varchar(100) | NULLABLE | Username attempted |
| Role | string | varchar(50) | NULLABLE | User's role at event time |
| IpAddress | string | varchar(45) | NULLABLE | Client IP (IPv4/IPv6) |
| UserAgent | string | varchar(512) | NULLABLE | Browser/device info |
| SessionId | string | varchar(100) | NULLABLE | Associated session ID |
| FailureReason | string | varchar(500) | NULLABLE | Reason for failure |
| ContextJson | string | text | NULLABLE | Additional context (JSON) |

**Event Types:**
- LoginSuccess — Successful login
- LoginFailed — Failed login attempt
- LogoutSuccess — User logout
- SessionExpired — Session timeout
- AccountLocked — Account lockout
- PasswordReset — Password change
- OtpGenerated — OTP issued
- OtpVerified — OTP verified
- AccessDenied — Permission denied

**Relationships:**
- BelongsTo: User (Set Null on user deletion, preserving audit trail)

**Indexes:**
- INDEX ON Timestamp (time-range queries)
- INDEX ON UserId (user activity analysis)
- INDEX ON EventType (event filtering)

**Status:** ✅ Created via InitialCreate migration

**Compliance:** AC-13 — Authentication audit log maintained with INSERT-only permissions

---

### 6. TokenDenylistEntry

**Purpose:** Track revoked JWT tokens

**C# Class Location:** `backend/Data/TokenDenylistEntry.cs`

**Database Table:** `token_denylist`

**Primary Key:** `Id` (UUID)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Denylist entry ID |
| TokenHash | string | text | NOT NULL | Hash of revoked token |
| ExpiresAt | DateTime | timestamp | NOT NULL | When token would expire (UTC) |
| AddedAt | DateTime | timestamp | NOT NULL | When added to denylist (UTC) |

**Indexes:**
- INDEX ON ExpiresAt (cleanup of expired entries)

**Usage:**
- Session logout: immediately add token hash
- Token revocation: add token hash with original expiration
- Cleanup task: remove entries where ExpiresAt < now()

**Status:** ✅ Created via InitialCreate migration

---

### 7. Visitor

**Purpose:** Visitor registration records (AC-DB-01)

**C# Class Location:** `backend/Data/Visitor.cs`

**Database Table:** `Visitors`

**Primary Key:** `Id` (UUID)

**Encrypted Fields:**
- `MobileNumber` — AES-256 encrypted
- `IdNumber` — AES-256 encrypted

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Visitor identifier |
| FullName | string | text | NOT NULL | Visitor's full name |
| MobileNumber | string | text | ENCRYPTED, NOT NULL | Contact mobile number |
| CompanyName | string | text | NOT NULL | Visitor's company |
| IdType | string | varchar(50) | NOT NULL | ID type (Passport, Aadhar, DL, etc.) |
| IdNumber | string | text | ENCRYPTED, NOT NULL | Full ID number |
| IdNumberLast4 | string | varchar(4) | NULLABLE | Last 4 digits (searchable) |
| PhotoUrl | string | text | NULLABLE | URL to visitor's photo |
| PurposeOfVisit | string | text | NOT NULL | Reason for visit |
| Status | string | varchar(50) | NOT NULL, DEFAULT='Pending' | Status (Pending, Approved, Denied, CheckedOut) |
| CheckInTime | DateTime? | timestamp | NULLABLE | Gate check-in time (UTC) |
| CheckOutTime | DateTime? | timestamp | NULLABLE | Gate check-out time (UTC) |
| CreatedAt | DateTime | timestamp | NOT NULL | Registration timestamp (UTC) |
| UpdatedAt | DateTime | timestamp | NOT NULL | Last update timestamp (UTC) |
| CreatedBy | Guid | uuid | NOT NULL | Receptionist who registered |

**Relationships:**
- HasMany: Approvals (Cascade Delete)
- HasMany: VisitorPasses (Cascade Delete)

**Indexes:**
- INDEX ON FullName (name search)
- COMPOSITE INDEX ON (MobileNumber, CreatedAt) (duplicate check)
- COMPOSITE INDEX ON (IdType, IdNumberLast4, CreatedAt) (ID search)
- COMPOSITE INDEX ON (Status, CreatedAt) (filtering by status)

**Status:** ✅ Created via AddVisitorTables migration

---

### 8. Approval

**Purpose:** Track visitor approval status

**C# Class Location:** `backend/Data/Approval.cs`

**Database Table:** `Approvals`

**Primary Key:** `Id` (UUID)

**Foreign Keys:**
- VisitorId (CASCADE DELETE)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Approval record ID |
| VisitorId | Guid | uuid | FK, NOT NULL | Associated visitor |
| HostEmployeeId | Guid | uuid | NOT NULL | Employee approving |
| Status | string | varchar(50) | NOT NULL, DEFAULT='Pending' | Pending, Approved, Denied |
| ApprovedAt | DateTime? | timestamp | NULLABLE | Approval timestamp (UTC) |
| DeniedAt | DateTime? | timestamp | NULLABLE | Denial timestamp (UTC) |
| DenialReason | string | text | NULLABLE | Reason for denial |
| DenialNote | string | text | NULLABLE | Additional notes |
| CreatedAt | DateTime | timestamp | NOT NULL | Record creation (UTC) |
| UpdatedAt | DateTime | timestamp | NOT NULL | Last update (UTC) |

**Relationships:**
- BelongsTo: Visitor (Cascade Delete on visitor deletion)
- HasMany: ApprovalNotifications (Cascade Delete)

**Indexes:**
- COMPOSITE INDEX ON (Status, CreatedAt) (workflow filtering)
- INDEX ON HostEmployeeId (employee approval list)

**Status:** ✅ Created via AddVisitorTables migration

---

### 9. VisitorPass

**Purpose:** QR code access passes for visitors

**C# Class Location:** `backend/Data/VisitorPass.cs`

**Database Table:** `VisitorPasses`

**Primary Key:** `Id` (UUID)

**Encrypted Fields:**
- `QrCode` — AES-256 encrypted

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Pass identifier |
| VisitorId | Guid | uuid | FK, NOT NULL | Associated visitor |
| QrCode | string | text | ENCRYPTED, NOT NULL | QR code string |
| ValidFrom | DateTime | timestamp | NOT NULL | Validity start (UTC) |
| ValidTo | DateTime | timestamp | NOT NULL | Validity end (UTC) |
| UsedAt | DateTime? | timestamp | NULLABLE | Gate scan timestamp (UTC) |
| CreatedAt | DateTime | timestamp | NOT NULL | Creation timestamp (UTC) |

**Relationships:**
- BelongsTo: Visitor (Cascade Delete on visitor deletion)

**Indexes:**
- COMPOSITE INDEX ON (VisitorId, ValidFrom) (validity check)
- INDEX ON ValidTo (expired pass cleanup)

**Status:** ✅ Created via AddVisitorTables migration

---

### 10. ApprovalNotification

**Purpose:** Track notification delivery (email, SMS, WhatsApp)

**C# Class Location:** `backend/Data/ApprovalNotification.cs`

**Database Table:** `ApprovalNotifications`

**Primary Key:** `Id` (UUID)

**Foreign Keys:**
- ApprovalId (CASCADE DELETE)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Notification ID |
| ApprovalId | Guid | uuid | FK, NOT NULL | Associated approval |
| Channel | string | varchar(50) | NOT NULL | Email/SMS/WhatsApp |
| Status | string | varchar(50) | NOT NULL, DEFAULT='Pending' | Pending/Sent/Failed |
| SentAt | DateTime? | timestamp | NULLABLE | Delivery timestamp (UTC) |
| ErrorMessage | string | text | NULLABLE | Error details if failed |
| RetryCount | int | integer | NOT NULL, DEFAULT=0 | Number of retry attempts |
| LastRetryAt | DateTime? | timestamp | NULLABLE | Last retry timestamp (UTC) |
| CreatedAt | DateTime | timestamp | NOT NULL | Creation timestamp (UTC) |

**Relationships:**
- BelongsTo: Approval (Cascade Delete on approval deletion)

**Indexes:**
- COMPOSITE INDEX ON (Status, CreatedAt) (retry job filtering)
- INDEX ON ApprovalId (approval notification history)

**Notification Channels:**
- Email — SMTP-based email delivery
- SMS — Twilio SMS
- WhatsApp — Twilio WhatsApp API

**Retry Logic:**
- MaxRetries: 3 attempts
- RetryDelay: 5 minutes between attempts
- Failure after max retries logged with error message

**Status:** ✅ Created via AddVisitorTables migration

---

### 11. Employee

**Purpose:** Employee/host directory for approval assignments

**C# Class Location:** `backend/Data/Employee.cs`

**Database Table:** `Employees`

**Primary Key:** `Id` (UUID)

**Unique Constraints:**
- EmployeeId (business identifier)

**Properties:**

| Property | Type | Database Type | Constraints | Purpose |
|----------|------|---------------|-------------|---------|
| Id | Guid | uuid | PK, NOT NULL | Employee record ID |
| EmployeeId | string | text | UNIQUE, NOT NULL | Employee ID number |
| Name | string | text | NOT NULL | Full name |
| Department | string | text | NOT NULL | Department/team |
| EmailAddress | string | text | NULLABLE | Work email |
| MobileNumber | string | text | NULLABLE | Work mobile |
| CreatedAt | DateTime | timestamp | NOT NULL | Record creation (UTC) |
| UpdatedAt | DateTime | timestamp | NOT NULL | Last update (UTC) |

**Indexes:**
- UNIQUE INDEX ON EmployeeId
- INDEX ON Name (employee search)
- INDEX ON Department (filter by department)

**Status:** ✅ Created via AddVisitorTables migration

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Entities | 11 |
| Authentication Entities | 6 |
| Visitor Management Entities | 5 |
| Total Tables | 11 |
| Total Columns | 97 |
| Total Indexes | 19 |
| Total Foreign Keys | 7 |
| Encrypted Fields | 3 |
| Cascade Delete Relationships | 5 |
| Set Null Relationships | 1 |

---

## Entity Relationship Diagram

```
Users (1) ──────┬─ (Many) Sessions
                ├─ (Many) OtpTokens
                ├─ (Many) PasswordHistories
                └─ (Many) AuthAuditLogs

Visitors (1) ───┬─ (Many) Approvals
                └─ (Many) VisitorPasses

Approvals (1) ──── (Many) ApprovalNotifications

Employees (1) ──── (Many) [HostEmployeeId in Approvals]
```

---

## Data Validation Rules

### Visitor
- FullName: 3-100 characters
- MobileNumber: 10 digits (with optional +91 prefix)
- IdNumber: 5-50 characters (based on IdType)
- PurposeOfVisit: 5-500 characters
- Status: Must be one of (Pending, Approved, Denied, CheckedOut)

### Approval
- Status: Must be one of (Pending, Approved, Denied)
- HostEmployeeId: Must reference valid Employee
- ApprovedAt and DeniedAt are mutually exclusive

### VisitorPass
- ValidFrom < ValidTo
- QrCode: Unique per VisitorId

### User
- Username: 3-100 characters, alphanumeric + underscore
- Email: Valid email format
- Role: Must be one of (Receptionist, Approver, Admin)

---

## Access Patterns & Query Optimization

### Frequent Queries (Indexed)
1. Find visitors by name → INDEX ON FullName
2. Find pending approvals → INDEX ON (Status, CreatedAt)
3. Search valid passes → INDEX ON (VisitorId, ValidFrom)
4. Notification retry job → INDEX ON (Status, CreatedAt)
5. Session validation → INDEX ON UserId, ExpiresAt
6. Duplicate visitor check → INDEX ON (MobileNumber, CreatedAt)

### Batch Operations (Efficient)
- Cleanup expired sessions → SELECT … WHERE expires_at < now()
- Cleanup expired OTPs → SELECT … WHERE expires_at < now()
- Notification retry → SELECT … WHERE status = 'Failed' AND retry_count < 3
- Expired passes cleanup → SELECT … WHERE valid_to < now()

---

## Security Considerations

1. **Password Storage:** Bcrypt hashing (10+ rounds)
2. **Encryption at Rest:** AES-256 for sensitive PII (IdNumber, MobileNumber, QrCode)
3. **Audit Trail:** AuthAuditLog immutable table for regulatory compliance
4. **Session Management:** Token validation, expiration, denylist
5. **Account Lockout:** After 5 failed attempts, 15-minute lockout
6. **Password History:** Prevent reusing last 5 passwords
7. **Role-Based Access:** User.Role determines authorization

---

## Created Date

All entities created and migrated on: **2026-05-27**

Migrations applied:
- 20260514141734_InitialCreate (Authentication tables)
- 20260527105349_AddVisitorTables (Visitor management tables)

---

## Related Documentation

- See `database-schema-approved.md` for full schema details
- See `database-migrations-applied.md` for migration execution logs
- See `impl-database.md` for setup summary and configuration
