# Database Approval Workflow

## Overview
The approval workflow manages the process of approving or denying visitor registrations.

## Workflow Status Transitions
```
Draft → Pending → Approved → PassGenerated
              ↘    Denied
```

## Database Entities

### Visitor
- VisitorId: UUID
- FullName: string
- MobileNumber: encrypted string
- IdType: enum (Aadhar, PAN, Passport, Visa, License, DL, Other)
- IdNumber: encrypted string
- PhotoUrl: string (signed URL)
- HostEmployeeId: UUID
- PurposeOfVisit: string
- Status: enum (Draft, Pending, Approved, Denied, CheckedIn, CheckedOut)
- CheckInTime: DateTime?
- CheckOutTime: DateTime?
- CreatedAt: DateTime
- UpdatedAt: DateTime
- CreatedBy: UUID

### Approval
- ApprovalId: UUID
- VisitorId: UUID (FK)
- HostEmployeeId: UUID (FK)
- Status: enum (Pending, Approved, Denied)
- ApprovedAt: DateTime?
- DeniedAt: DateTime?
- DenialReason: string?
- DenialNote: string? (max 200 chars)
- CreatedAt: DateTime
- UpdatedAt: DateTime

### VisitorPass
- PassId: UUID
- VisitorId: UUID (FK)
- QrCode: encrypted string
- ValidFrom: DateTime
- ValidTo: DateTime
- UsedAt: DateTime?
- CreatedAt: DateTime

### ApprovalNotification
- NotificationId: UUID
- ApprovalId: UUID (FK)
- Channel: enum (WhatsApp, SMS, Email)
- Status: enum (Pending, Sent, Failed)
- SentAt: DateTime?
- ErrorMessage: string?
- RetryCount: int
- LastRetryAt: DateTime?
- CreatedAt: DateTime

## Indexes
- (MobileNumber, CreatedAt) - for duplicate detection
- (IdType, IdNumberLast4, CreatedAt) - for duplicate detection
- (Status, CreatedAt) - for status queries

## Encryption
- AES-256 encryption for: IdNumber, MobileNumber, QrCode
- Masking format for display: XXXX XXXX <last4>
- Admin-only full view of encrypted fields
