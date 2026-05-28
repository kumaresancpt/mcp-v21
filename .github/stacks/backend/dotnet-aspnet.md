# Stack Profile: dotnet-aspnet

## Language
C# (.NET 8)

## Framework
ASP.NET Core Web API

## Package manager
NuGet (via dotnet CLI)

## Install command
dotnet restore

## Run command
dotnet run --urls http://localhost:8000

## Build command
dotnet build

## Test command
dotnet test

## Dev server port
8000

## Dev server URL
http://localhost:8000

## API docs URL
http://localhost:8000/swagger

## Project file
backend.csproj (SDK: Microsoft.NET.Sdk.Web, TargetFramework: net8.0)

## Project structure
backend/
  backend.csproj
  Program.cs            ← entry point, DI registration, middleware pipeline
  appsettings.json      ← ALL config sections with placeholder values (committed)
  appsettings.Development.json  ← real local values (NOT committed)
  appsettings.example.json      ← empty template (committed)
  Controllers/          ← one file per resource
  Services/             ← interface + implementation pairs
  Models/               ← DTOs and request/response models
    DTOs/
  Data/                 ← DbContext and entity classes
  Migrations/           ← EF Core migration files

## Controller pattern
- Inherit ControllerBase
- Decorate with [ApiController] and [Route("api/[controller]")]
- Inject service via constructor
- Return IActionResult or ActionResult<T>
- Use PascalCase for class and method names

## Service pattern
- Interface in Services/I<Name>Service.cs
- Implementation in Services/<Name>Service.cs
- Register in Program.cs: builder.Services.AddScoped<INameService, NameService>()

## Model pattern
- C# records or classes in Models/
- Use [Required], [MaxLength], [EmailAddress] data annotations
- JSON serializes PascalCase → camelCase automatically in ASP.NET Core

## Config pattern
- ALL config sections in appsettings.json with placeholder values
- Real values in appsettings.Development.json (NOT committed)
- Read via IConfiguration or strongly-typed options
- NEVER hardcode secrets — always use IConfiguration

## Auth pattern
JWT Bearer authentication
- Package: Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0
- Package: Microsoft.IdentityModel.Tokens 8.0.0 (NEVER below 8.0.0 — CVE)
- Package: System.IdentityModel.Tokens.Jwt 8.0.0
- Config section: JwtSettings { SecretKey, Issuer, ExpiryMinutes }
- Read token from cookie: context.Request.Cookies["accessToken"]

## Password hashing
BCrypt.Net-Next 4.0.3 — salt rounds 12
NEVER store plain-text passwords
NEVER return passwordHash in any API response

## Swagger
ALWAYS enable in ALL environments — NEVER guard with IsDevelopment()
app.UseSwagger();
app.UseSwaggerUI();

## Error response format
return BadRequest(new { detail = "error message" });
ALWAYS use "detail" as the error field name — frontend reads response.detail

## CORS pattern
builder.Services.AddCors(options => { options.AddDefaultPolicy(policy =>
  policy.WithOrigins(corsOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials()); });
app.UseCors();

## Null safety
NEVER pass nullable string to Encoding.GetBytes() or SymmetricSecurityKey
Use: config["Key"] ?? throw new InvalidOperationException("Key not configured")

## Core NuGet packages
- Microsoft.AspNetCore.OpenApi 8.0.0
- Swashbuckle.AspNetCore 6.5.0
- Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0
- Microsoft.IdentityModel.Tokens 8.0.0
- System.IdentityModel.Tokens.Jwt 8.0.0

## Naming conventions
- Classes and methods: PascalCase
- JSON response fields: camelCase (ASP.NET Core default)
- Database columns: snake_case
