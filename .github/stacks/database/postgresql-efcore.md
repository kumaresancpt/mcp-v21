# Stack Profile: postgresql-efcore

## Database
PostgreSQL

## ORM
Entity Framework Core 8

## Provider package
Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0

## Migration tool
dotnet-ef CLI

## Install migration tool
dotnet tool install --global dotnet-ef

## Core packages
- Microsoft.EntityFrameworkCore 8.0.0
- Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0
- Microsoft.EntityFrameworkCore.Tools 8.0.0
- BCrypt.Net-Next 4.0.3

## DbContext registration (Program.cs)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

## Auto-migrate on startup
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

## Connection string format
Host=localhost;Port=5432;Database=<db-name>;Username=<username>;Password=<password>

## Connection string location
appsettings.json → ConnectionStrings.DefaultConnection (placeholder)
appsettings.Development.json → real value (NOT committed)
Credentials injected via DB_NAME, DB_USERNAME, DB_PASSWORD env variables at runtime

## Entity pattern
- Guid Id primary key with Guid.NewGuid() default
- [Required] and [MaxLength] on string fields
- Nullable fields use ? suffix
- CreatedAt and UpdatedAt as DateTime = DateTime.UtcNow
- PasswordHash (never Password) for auth entities

## AppDbContext pattern
public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<EntityName> EntityNames => Set<EntityName>();
    protected override void OnModelCreating(ModelBuilder modelBuilder) { ... }
}

## Migration commands (greenfield)
Windows:
$env:DB_NAME='<name>'; $env:DB_USERNAME='<user>'; $env:DB_PASSWORD='<pass>'; dotnet ef migrations add InitialCreate
$env:DB_NAME='<name>'; $env:DB_USERNAME='<user>'; $env:DB_PASSWORD='<pass>'; dotnet ef database update

Linux/macOS:
DB_NAME='<name>' DB_USERNAME='<user>' DB_PASSWORD='<pass>' dotnet ef migrations add InitialCreate
DB_NAME='<name>' DB_USERNAME='<user>' DB_PASSWORD='<pass>' dotnet ef database update

## Migration commands (incremental — new feature)
Windows:
$env:DB_NAME='<name>'; $env:DB_USERNAME='<user>'; $env:DB_PASSWORD='<pass>'; dotnet ef migrations add Add<FeatureName>
$env:DB_NAME='<name>'; $env:DB_USERNAME='<user>'; $env:DB_PASSWORD='<pass>'; dotnet ef database update

## Migration commands (incremental — fresh machine, replay existing)
Windows:
$env:DB_NAME='<name>'; $env:DB_USERNAME='<user>'; $env:DB_PASSWORD='<pass>'; dotnet ef database update

## Safety rules
- NEVER drop or modify existing tables in incremental mode
- NEVER store credentials in any file
- NEVER return passwordHash in API responses
- NEVER run migrations without user approval of schema plan
