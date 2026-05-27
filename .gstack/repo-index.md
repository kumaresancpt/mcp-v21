# Repository Index — mcp-v21

## Repository Metadata
- **Owner**: kumaresancpt
- **Repository**: mcp-v21
- **URL**: https://github.com/kumaresancpt/mcp-v21
- **Local Path**: d:\Gen-Ai\visiter\mcp-v7.3
- **Current Branch**: main
- **Last Commit**: 787f617 — "Merge pull request #1 from kumaresancpt/feature/PD-33-v1 for testing"
- **Pull Date**: 2026-05-27

---

## Project Structure

```
d:\Gen-Ai\visiter\mcp-v7.3/
├── .git/                                   # Git repository metadata
├── .github/                                # GitHub configuration
│   └── agents/                             # Agent instruction files (CI/CD orchestration)
│       ├── 01-orchestrator.md
│       ├── 02-context-gatherer.md
│       ├── 03-repo-reader.md
│       ├── 04a-ado-reader.md
│       ├── 04b-jira-reader.md
│       ├── 04c-figma-reader.md
│       ├── 05-frontend-writer.md
│       ├── 06-backend-writer.md
│       ├── 07-database-agent.md
│       ├── 08-integration-patcher.md
│       ├── 09-test-writer.md
│       ├── 10-sonar-runner.md
│       ├── 11-impl-reviewer.md
│       ├── 12-bug-fixer.md
│       └── 13-github-agent.md
├── .gstack/                                # Context and metadata files (NEW)
│   ├── context.md                          # Unified context for all agents
│   ├── acs.md                              # Acceptance criteria list
│   ├── figma.md                            # Figma design context
│   ├── repo-index.md                       # This file
│   └── usage-log.jsonl                     # Agent execution logs
├── frontend/                               # React + TypeScript frontend
│   ├── __mocks__/
│   │   └── fileMock.cjs                    # Jest file mock for imports
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── LoginForm.test.tsx          # LoginForm unit tests
│   │   │   └── LoginPage.test.tsx          # LoginPage unit tests
│   │   ├── components/
│   │   │   ├── Footer.tsx                  # Footer component
│   │   │   ├── LoginForm.tsx               # Login form component (main form)
│   │   │   ├── Logo.tsx                    # Logo component (VISITOR branding)
│   │   │   ├── RoleSelector.tsx            # Role selection dropdown
│   │   │   └── SignUpLink.tsx              # Sign-up link component
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx               # Login page (main entry point)
│   │   │   └── RegisterPage.tsx            # Registration page
│   │   ├── App.tsx                         # App root component + routing
│   │   ├── index.css                       # Global styles
│   │   ├── main.tsx                        # React entry point
│   │   └── setupTests.cjs                  # Jest test setup
│   ├── babel.config.cjs                    # Babel configuration
│   ├── jest.config.cjs                     # Jest test runner configuration
│   ├── index.html                          # HTML entry point
│   ├── package.json                        # Frontend dependencies (React 18, Router 6, etc.)
│   ├── tsconfig.json                       # TypeScript configuration
│   ├── tsconfig.node.json                  # TypeScript config for Node tools
│   └── vite.config.ts                      # Vite build configuration
├── backend/                                # ASP.NET Core 8 backend
│   ├── Controllers/
│   │   └── AuthController.cs               # Authentication endpoints (Login, Register, OTP, Reset)
│   ├── Data/
│   │   ├── AppDbContext.cs                 # EF Core DbContext (PostgreSQL)
│   │   ├── AuthAuditLog.cs                 # Audit log entity (tracks auth events)
│   │   ├── OtpToken.cs                     # One-time password entity
│   │   ├── PasswordHistory.cs              # Password history for validation
│   │   ├── Session.cs                      # User session entity
│   │   ├── TokenDenylistEntry.cs           # Blacklisted tokens (logout tracking)
│   │   └── User.cs                         # User entity (core user data)
│   ├── Migrations/
│   │   ├── 20260514141734_InitialCreate.cs # Initial schema migration
│   │   ├── 20260514141734_InitialCreate.Designer.cs  # Migration metadata
│   │   └── AppDbContextModelSnapshot.cs    # Current model snapshot
│   ├── Middleware/
│   │   └── SessionValidationMiddleware.cs  # JWT validation middleware
│   ├── Models/
│   │   ├── ErrorResponse.cs                # Error response DTO (detail field)
│   │   ├── ExtendSessionRequest.cs         # Request to extend session
│   │   ├── ForgotPasswordRequest.cs        # Forgot password request DTO
│   │   ├── LoginRequest.cs                 # Login credentials DTO
│   │   ├── LoginResponse.cs                # Login response with token DTO
│   │   └── ResetPasswordRequest.cs         # Password reset DTO
│   ├── Services/
│   │   ├── AuditLogService.cs              # Audit logging service
│   │   ├── AuthService.cs                  # Authentication business logic
│   │   ├── IAuditLogService.cs             # Audit service interface
│   │   ├── IAuthService.cs                 # Auth service interface
│   │   ├── IOtpService.cs                  # OTP service interface
│   │   └── OtpService.cs                   # OTP generation/validation logic
│   ├── Program.cs                          # ASP.NET Core app startup (dependency injection, middleware)
│   ├── appsettings.json                    # Configuration (placeholder values, committed)
│   ├── appsettings.example.json            # Configuration template for developers
│   └── backend.csproj                      # C# project file with NuGet packages
├── AGENT_LOGGING_AUDIT.md                  # Agent execution audit trail
├── DATABASE_APPROVAL_WORKFLOW.md           # Database approval/deployment workflow documentation
└── README.md (deleted in latest pull)       # Was present, now removed

```

---

## Frontend Files

### Build Configuration
- **Package Manager**: npm
- **Build Tool**: Vite 4+
- **Test Runner**: Jest with Babel + jsdom
- **TypeScript**: Enabled (strict mode implied)
- **Vite Config** (`vite.config.ts`): 
  - React plugin configured
  - Likely configured for port 5173 (Vite default)
  - Build output to `dist/`

### Components
1. **Logo.tsx** — VISITOR brand logo with "Powered by CHANGEPOND" (used in sidebar)
2. **LoginForm.tsx** — Main login form with email, password, role selector, submit button, sign-up link
3. **LoginPage.tsx** — Page wrapper for login form, handles routing and state
4. **RoleSelector.tsx** — Dropdown to select user role (Receptionist, Host, Admin, etc.)
5. **SignUpLink.tsx** — Link to registration page
6. **Footer.tsx** — Copyright footer component
7. **RegisterPage.tsx** — New user registration page (basic structure)

### Tests
- **LoginForm.test.tsx** — 143 lines of test cases for form submission, validation, role selection
- **LoginPage.test.tsx** — 89 lines of navigation and page-level tests

### Styling
- **index.css** — Global styles (36 lines, likely defines color variables, fonts, base styles)
- **Tailwind CSS** implied by Figma design (mention of Tailwind classes in design context)

---

## Backend Files

### Core Application
1. **Program.cs** (100 lines) — Application setup
   - Dependency injection registration (Services, DbContext, Auth middleware)
   - Swagger/OpenAPI configuration
   - CORS, authentication, session middleware
   - Swagger enabled in all environments (no IsDevelopment guard)

### Controllers
1. **AuthController.cs** (164 lines)
   - POST /api/auth/login — User authentication
   - POST /api/auth/register — New user registration
   - POST /api/auth/forgot-password — Password reset flow
   - POST /api/auth/reset-password — Confirm password reset
   - POST /api/auth/extend-session — Extend user session
   - Swagger documented, error responses use detail field

### Services (Business Logic)
1. **AuthService.cs** (300 lines) — Main authentication service
   - User login/registration logic
   - Password hashing (BCrypt)
   - JWT token generation
   - Session management
   - OTP coordination with OtpService
   - Audit logging coordination with AuditLogService

2. **OtpService.cs** (132 lines) — One-time password service
   - Generate OTP (6-digit)
   - Validate OTP
   - Resend OTP
   - Token expiration (likely 5-10 min)

3. **AuditLogService.cs** (55 lines) — Audit logging service
   - Log authentication events (Login, Register, PasswordReset, etc.)
   - Track user IPs, timestamps, outcomes

### Data Models
1. **User.cs** — User entity
   - UserId (UUID PK)
   - Email, PasswordHash, FullName, Role
   - CreatedAt, UpdatedAt

2. **OtpToken.cs** — OTP entity
   - OtpTokenId (UUID PK)
   - UserId (FK)
   - Code, ExpiresAt
   - CreatedAt

3. **PasswordHistory.cs** — Password history entity
   - PasswordHistoryId (UUID PK)
   - UserId (FK)
   - PasswordHash, ChangedAt

4. **Session.cs** — User session entity
   - SessionId (UUID PK)
   - UserId (FK)
   - Token, ExpiresAt, CreatedAt

5. **TokenDenylistEntry.cs** — Token blacklist entity
   - EntryId (UUID PK)
   - Token, BlacklistedAt

6. **AuthAuditLog.cs** — Audit log entity
   - AuditLogId (UUID PK)
   - UserId (FK)
   - EventType, IpAddress, Outcome, CreatedAt

### Database
1. **AppDbContext.cs** (81 lines)
   - EF Core DbContext for PostgreSQL
   - DbSets for User, OtpToken, PasswordHistory, Session, TokenDenylistEntry, AuthAuditLog
   - Npgsql provider configured
   - Likely includes connection string from appsettings

2. **Migrations/**
   - 20260514141734_InitialCreate — Initial schema migration
     - Creates all tables: User, OtpToken, PasswordHistory, Session, TokenDenylistEntry, AuthAuditLog
     - Sets up indexes, foreign keys, constraints
     - ~350+ lines of migration code

### Configuration Files
1. **backend.csproj** — C# project file
   - TargetFramework: net8.0
   - Packages: EF Core 8, Npgsql, BCrypt.Net-Next, Swashbuckle (Swagger)
   - NullableEnable, ImplicitUsings

2. **appsettings.json** (55 lines) — Production-like config
   - ConnectionString (placeholder, e.g., "Server=localhost;Database=vms;...")
   - JwtSettings (Secret, ExpiresInMinutes, RefreshExpiresInDays)
   - EmailSettings (Provider, ApiKey, FromAddress)
   - SmsSettings (Twilio or similar)
   - WhatsAppSettings
   - AuditLogSettings
   - Logging (default to Information level)
   - AllowedHosts

3. **appsettings.example.json** — Template for developers
   - Same structure as appsettings.json with placeholder values

### Middleware
1. **SessionValidationMiddleware.cs** (107 lines)
   - Validates JWT tokens from Authorization header
   - Checks token blacklist (TokenDenylistEntry)
   - Adds user context to HttpContext.Items
   - Handles 401 Unauthorized responses

---

## Key Technologies & Versions

### Frontend
- React 18.2.0
- React Router DOM 6.22.0
- TypeScript (latest with strict checks implied)
- Vite 4+
- Jest (testing)
- Babel 7.24
- @testing-library/react 15.0.2

### Backend
- .NET 8.0 (latest LTS)
- Entity Framework Core 8.0.0
- Npgsql 8.0.0 (PostgreSQL driver)
- BCrypt.Net-Next 4.0.3
- Swashbuckle.AspNetCore 6.5.0 (Swagger)
- Microsoft.AspNetCore.OpenApi 8.0.0

### Database
- PostgreSQL (via Npgsql)
- EF Core 8.0 for ORM

### Conventions
- C# Naming: PascalCase
- TypeScript Naming: camelCase (variables), PascalCase (components)
- API Response: Always include `detail` field for errors
- Auth: Bearer token in Authorization header
- Configuration: appsettings.json (default), appsettings.Development.json (local, not committed)
- Swagger: Enabled in all environments

---

## Build & Run Commands

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev         # Start dev server (port 5173)
npm run build       # Build for production
npm run test        # Run Jest tests
npm run preview     # Preview production build
```

### Backend
```bash
cd backend
dotnet build                    # Build project
dotnet run                      # Run dev server
dotnet publish -c Release       # Build for production
dotnet ef database update       # Apply migrations to PostgreSQL
```

### Database
```bash
# Requires PostgreSQL server running
# Connection string in appsettings.json or appsettings.Development.json
dotnet ef database update       # Apply pending migrations
dotnet ef database drop         # Drop all tables (dev only)
dotnet ef migrations add {Name} # Create new migration
```

---

## Deployment Notes

### Frontend
- Built artifact: `frontend/dist/`
- Deploy to: Static hosting (AWS S3, Netlify, Vercel, CDN)
- Environment variables: .env files (API_URL, etc.)
- Build command: `npm run build`

### Backend
- Built artifact: `backend/bin/Release/net8.0/`
- Deploy to: Docker, IIS, Azure App Service, Heroku, etc.
- Environment: appsettings.{Environment}.json (not committed)
- Build command: `dotnet publish -c Release`
- Database: Migrations applied during startup (if configured)

### Environment Setup Checklist
- [ ] PostgreSQL server running and accessible
- [ ] Connection string configured in appsettings.Development.json
- [ ] JWT secret configured (strong, random, 32+ chars)
- [ ] Email provider credentials configured
- [ ] SMS/WhatsApp provider credentials configured
- [ ] CORS origins configured (frontend URL)
- [ ] Frontend API_URL configured (.env file)
- [ ] Frontend and backend on same domain or CORS enabled

---

## File Count Summary
- **Total Files**: 49 (as of last git pull on 2026-05-27)
- **Backend Files**: 28 (Controllers, Models, Services, Data, Migrations, Config)
- **Frontend Files**: 19 (Components, Tests, Config, TypeScript, Styles)
- **Project Config Files**: 2 (backend.csproj, frontend package.json)

---

## Next Steps for Development (as per .gstack/acs.md)

1. **Frontend (05-frontend-writer)**:
   - Implement "All Visitors" page (AC-FIGMA-01 through AC-FIGMA-06)
   - Implement Visitor Entry form (AC-JIRA-01 through AC-JIRA-05)
   - Build Visitor List component with search/filter
   - Style using Tailwind CSS + design tokens from figma.md

2. **Backend (06-backend-writer)**:
   - Create VisitorController for CRUD operations
   - Implement Visitor & Approval services (AC-JIRA-06 through AC-JIRA-10)
   - Integrate notification dispatch (SMS/WhatsApp/Email)
   - Implement digital pass generation with QR codes

3. **Database (07-database-agent)**:
   - Create Visitor, Approval, VisitorPass, ApprovalNotification tables
   - Add migrations for new schema
   - Implement encryption for sensitive fields (ID numbers)

4. **Testing (09-test-writer)**:
   - Write unit tests for frontend components
   - Write integration tests for backend API endpoints
   - Test approval workflow and notification dispatch

5. **Integration (08-integration-patcher)**:
   - Wire frontend forms to backend API
   - Configure SMS/WhatsApp/Email services
   - Test end-to-end visitor registration and approval flow
