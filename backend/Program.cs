using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using VmsBackend.Data;
using VmsBackend.Middleware;
using VmsBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// Build connection string — replace env var placeholders
var connStr = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
connStr = connStr
    .Replace("${DB_NAME}", Environment.GetEnvironmentVariable("DB_NAME") ?? "")
    .Replace("${DB_USERNAME}", Environment.GetEnvironmentVariable("DB_USERNAME") ?? "")
    .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "");

// EF Core — PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

// DI registrations
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<RegistrationValidator>();
builder.Services.AddScoped<IEmailService, EmailService>();

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("VmsCorsPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("LoginPolicy", limiterOptions =>
    {
        limiterOptions.Window = TimeSpan.FromSeconds(
            builder.Configuration.GetValue<int>("RateLimiting:LoginWindowSeconds", 60));
        limiterOptions.PermitLimit = builder.Configuration.GetValue<int>("RateLimiting:LoginMaxRequests", 10);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Controllers + Swagger — Swagger enabled in ALL environments (no IsDevelopment guard)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "VMS Auth API", Version = "v1", Description = "Visitor Management System Authentication API" });
});

var app = builder.Build();

// Auto-migrate on startup + seed default admin
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed a default Admin user if the table is empty
    if (!db.Users.Any())
    {
        db.Users.Add(new VmsBackend.Data.User
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            Email = "admin@vms.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
        });
        db.SaveChanges();
    }
}

// Swagger — always enabled in ALL environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VMS Auth API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("VmsCorsPolicy");
app.UseRateLimiter();
app.UseMiddleware<SessionValidationMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
