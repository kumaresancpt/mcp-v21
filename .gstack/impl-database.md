# Database Setup Summary — SCRUM-18

## PostgreSQL Configuration
- Host: localhost
- Port: 5432
- Database: mcp_visitors
- Username: postgres
- Password: ••••••••••

## Tables Created

### Visitor Table
- VisitorId (UUID, Primary Key)
- FullName (string, required, indexed)
- MobileNumber (string, required, encrypted via ValueConverter, indexed)
- CompanyName (string, required)
- IdType (string, required)
- IdNumber (string, required, encrypted via ValueConverter, indexed for last-4 chars)
- IdNumberLast4 (string, for masking without decryption)
- PhotoUrl (string, signed URL valid 7 days)
- HostEmployeeId (UUID, Foreign Key to Employee)
- PurposeOfVisit (string, required)
- ExpectedDurationMinutes (int, nullable)
- Status (string, required: Pending, Approved, Denied, Draft, CheckedIn, CheckedOut)
- CheckInTime (DateTime, nullable)
- CheckOutTime (DateTime, nullable)
- CreatedAt (DateTime UTC)
- UpdatedAt (DateTime UTC)
- CreatedBy (UUID, ReceptionistId)
- Notes (string, nullable)
- Indexes: (MobileNumber, CreatedAt), (IdType, IdNumberLast4, CreatedAt), (Status, CreatedAt)

### Approval Table
- ApprovalId (UUID, Primary Key)
- VisitorId (UUID, Foreign Key)
- HostEmployeeId (UUID, Foreign Key to Employee)
- Status (string, required: Pending, Approved, Denied)
- ApprovedAt (DateTime, nullable)
- DeniedAt (DateTime, nullable)
- DenialReason (string, nullable: Unavailable, VisitNotScheduled, SecurityConcern, IncorrectHost, Other)
- DenialNote (string, nullable, max 200 chars)
- CreatedAt (DateTime UTC)
- UpdatedAt (DateTime UTC)

### VisitorPass Table
- PassId (UUID, Primary Key)
- VisitorId (UUID, Foreign Key)
- QrCode (string, encrypted via ValueConverter, unique cryptographic signature)
- ValidFrom (DateTime)
- ValidTo (DateTime)
- UsedAt (DateTime, nullable, set on gate check-in for one-time use validation)
- CreatedAt (DateTime UTC)

### ApprovalNotification Table
- NotificationId (UUID, Primary Key)
- ApprovalId (UUID, Foreign Key)
- Channel (string: WhatsApp, SMS, Email)
- Status (string: Pending, Sent, Failed)
- SentAt (DateTime, nullable)
- ErrorMessage (string, nullable)
- RetryCount (int, default 0, max 3 retries)
- LastRetryAt (DateTime, nullable)
- CreatedAt (DateTime UTC)

## Encryption Configuration
- **Algorithm:** AES-256 via EF Core ValueConverter
- **Encrypted Fields:**
  - Visitor.IdNumber → decrypted only for admin display, masked for others
  - Visitor.MobileNumber → encrypted at rest
  - VisitorPass.QrCode → encrypted payload with cryptographic signature
- **Key Management:** ENCRYPTION_KEY environment variable (32-byte key)

## Migrations Applied
- Migration: `20260527105349_AddVisitorTables`
  - Created Visitor, Approval, VisitorPass, ApprovalNotification entities
  - Created all required indexes for query performance
  - Configured foreign key relationships

## Background Jobs Configured
- **CleanupDraftVisitorsJob** — Runs hourly, deletes Visitor records where Status="Draft" and CreatedAt < 4 hours ago
- **ApprovalReminderJob** — Runs every minute, sends reminders at 15-min and 30-min marks for pending approvals

## Configuration Files
- **appsettings.Development.json** (LOCAL ONLY, NOT COMMITTED)
  - Contains real PostgreSQL credentials
  - Host: localhost, Port: 5432, Database: mcp_visitors
  - Username: postgres
  - Password: [REDACTED]

- **appsettings.json** (COMMITTED with PLACEHOLDERS)
  - ConnectionStrings: "Host={DB_HOST};Port=5432;Database={DB_NAME};Username={DB_USERNAME};Password={DB_PASSWORD}"
  - All config sections with placeholder values

- **appsettings.example.json** (COMMITTED, TEMPLATE)
  - Empty/template values for developers to copy and fill in locally

## Environment Variables at Runtime
The following environment variables are required when starting the application:
- `DB_NAME=mcp_visitors`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=Database@123`
- `ENCRYPTION_KEY=[32-byte key]`
- `ASPNETCORE_ENVIRONMENT=Development`

## Data Security Features
✅ ID numbers encrypted at rest (only decryptable by application)
✅ ID numbers masked in API responses (show only last 4 chars) unless user is Admin
✅ Photo URLs are signed (expire after 7 days)
✅ QR codes are encrypted with cryptographic signature (non-reusable, gate-only)
✅ Mobile numbers encrypted in database

## Backup Recommendation
```
pg_dump -h localhost -U postgres mcp_visitors > backup_mcp_visitors.sql
```

## Next Steps
- Phase 08 (Integration Patcher): Wire frontend to backend APIs
- Phase 09 (Test Writer): Create integration tests with mock database
- Phase 10 (Sonar Runner): Code quality scan
- Phase 11 (Impl Reviewer): Verify all ACs covered
