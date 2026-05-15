# VMS Login-BE — Visitor Management System

Full-stack authentication implementation for PD-33.

## Stack
- **Frontend**: React 18 + TypeScript + Vite 5 (port 5173)
- **Backend**: ASP.NET Core 8 Web API (port 8000)
- **Database**: PostgreSQL + EF Core 8 + BCrypt.Net-Next

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:5173

### Backend
```bash
cd backend
dotnet restore
dotnet run --urls http://localhost:8000
```
→ http://localhost:8000  
→ Swagger: http://localhost:8000/swagger

## Demo Credentials
- Username: `admin`
- Password: `Admin@1234`
- Role: Admin
