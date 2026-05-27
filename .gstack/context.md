# Context

## Meta
- work-item-id: SCRUM-18
- jira-issue-key: SCRUM-18
- requirements-source: figma
- backend-source: jira
- figma-file-key: wjGYCnQg7UU19Hh5HWOmwa
- figma-node-id: 40:3991
- owner: kumaresancpt
- repo: mcp-v21
- repo-mode: incremental
- fresh-machine: false
- db-mode: fresh
- existing-db-name: 
- existing-db-username: 
- existing-db-host: 
- existing-db-port: 
- dev-config-missing: false
- pull-verified: true
- pull-file-count: 49
- local-workspace-root: d:\Gen-Ai\visiter\mcp-v7.3
- base-branch: main
- project-root: .
- frontend-stack: react-typescript
- backend-stack: dotnet-aspnet
- database-stack: postgresql-efcore

## Work Item
- ID: SCRUM-18
- Title: Backend All Visiter Page
- Type: Story (US-03 Visitor Entry & Approval)
- Status: In Progress
- Description: As a Receptionist or self-service kiosk user, I want to register a new visitor by capturing their personal details, purpose of visit, and host employee so that the host can approve or deny the visit digitally before the visitor is granted access.
- Frontend Source: Figma (wjGYCnQg7UU19Hh5HWOmwa, node 40:3991) — All Visitors page with visitor list table
- Backend Source: Jira SCRUM-18 — Visitor Entry & Approval system with 12 detailed ACs

## Existing Repo Structure
- repo-mode: incremental
- base-branch: main
- Language/Framework: 
  - Frontend: React 18 + TypeScript + Vite + React Router
  - Backend: ASP.NET Core Web API (.NET 8)
  - Database: PostgreSQL with Entity Framework Core 8 + Npgsql
  
## Code Generation Hints
- **Frontend Stack**: React 18 + TypeScript + Vite + React Router, styled with Tailwind CSS (as per Figma design)
- **Backend Stack**: ASP.NET Core 8 Web API
  - Controllers pattern (AuthController, VisitorController, ApprovalController expected)
  - Data models in `backend/Data/` directory
  - Services pattern (AuthService, OtpService, VmsService expected)
  - DbContext: `AppDbContext` using EF Core 8
  - Database provider: Npgsql for PostgreSQL
  - Password hashing: BCrypt.Net-Next
  - API documentation: Swagger/OpenAPI enabled (Swashbuckle.AspNetCore v6.5.0)
- **Naming Conventions**:
  - C# (backend): PascalCase for classes, methods, public properties
  - TypeScript (frontend): camelCase for variables/functions, PascalCase for components
  - SQL/PostgreSQL: snake_case for table/column names
  - JSON payloads: camelCase for field names
- **API Error Response**: Always use `detail` field for error messages (see ErrorResponse.cs model)
- **Configuration**:
  - `appsettings.json` — committed with placeholder values
  - `appsettings.example.json` — template for developers
  - `appsettings.Development.json` — local development (NOT committed)
- **Swagger**: Always enabled in ALL environments (no IsDevelopment guard)
- **Authentication**: Bearer token via JWT in Authorization header (implemented in SessionValidationMiddleware)
- **Audit Logging**: Implemented via AuditLogService and AuthAuditLog entity
- **OTP/MFA**: OtpService and OtpToken entity for multi-factor authentication

## Design System & Visual Spec
- **Colors**:
  - Primary: #5B21B6 (purple)
  - Text (Primary): #171717 (dark gray)
  - Text (Secondary): #727272 (medium gray)
  - Background: #FAF8F5 (off-white)
  - Borders: #E2E2E2, #BABABA
  - Shadows: rgba(0,0,0,0.12)
- **Typography**:
  - Headers (24px): Inter Semi Bold, black (#171717)
  - Body (16px): Inter Medium/Regular
  - Labels/Secondary (12px): Inter Semi Bold, secondary gray (#727272)
  - Font fallback: Poppins for footer
- **Layout**:
  - Sidebar (left): 274px width with navigation items (Dashboard, All Visitor, Gate Check-In, Gate Check-Out, Reports, Settings)
  - Main content: 1118px width (rest of screen)
  - Card/panel border-radius: 16px
  - Spacing: 8px, 12px, 16px, 20px, 24px consistent padding

## Pipeline Agents
- 05-frontend-writer — reads context.md + acs.md + figma.md + repo-index.md
- 06-backend-writer — reads context.md + acs.md + repo-index.md
- 07-database-agent — reads context.md + acs.md
- 08-integration-patcher — reads context.md + acs.md
- 09-test-writer — reads context.md + acs.md
