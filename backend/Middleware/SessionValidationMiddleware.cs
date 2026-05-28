using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Services;

namespace VmsBackend.Middleware;

public class SessionValidationMiddleware
{
    private readonly RequestDelegate _next;

    // Routes that do NOT require session validation
    private static readonly HashSet<string> PublicPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/swagger",
        "/swagger/index.html",
        "/swagger/v1/swagger.json"
    };

    public SessionValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db, IAuditLogService audit)
    {
        var path = context.Request.Path.Value ?? string.Empty;

        // Skip validation for public paths
        if (PublicPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        var sessionToken = context.Request.Cookies["vms_session"] ??
                           context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        if (string.IsNullOrEmpty(sessionToken))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { detail = "Unauthorized" });
            return;
        }

        // Check denylist first (AC-08)
        // BCrypt.Verify cannot be translated to SQL; load non-expired hashes then verify client-side
        var activeDenylistHashes = await db.TokenDenylist
            .Where(d => d.ExpiresAt > DateTime.UtcNow)
            .Select(d => d.TokenHash)
            .ToListAsync();

        var isDenylisted = activeDenylistHashes.Any(hash => BCrypt.Net.BCrypt.Verify(sessionToken, hash));

        if (isDenylisted)
        {
            var ip = context.Connection.RemoteIpAddress?.ToString();
            var ua = context.Request.Headers["User-Agent"].ToString();
            await audit.WriteAsync(AuthEventType.TokenReplayed, null, null, null, ip, ua, failureReason: "Denylisted token replayed");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { detail = "Session invalidated." });
            return;
        }

        // Find and validate session (AC-05)
        var sessions = await db.Sessions
            .Where(s => s.IsValid)
            .ToListAsync();

        var session = sessions.FirstOrDefault(s => BCrypt.Net.BCrypt.Verify(sessionToken, s.TokenHash));

        if (session == null)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { detail = "Unauthorized" });
            return;
        }

        // Check inactivity timeout (AC-05)
        var inactivityTimeout = context.RequestServices
            .GetRequiredService<IConfiguration>()
            .GetValue<int>("Session:InactivityTimeoutMinutes", 30);

        if ((DateTime.UtcNow - session.LastActivityAt).TotalMinutes > inactivityTimeout)
        {
            session.IsValid = false;
            await db.SaveChangesAsync();
            var ip = context.Connection.RemoteIpAddress?.ToString();
            var ua = context.Request.Headers["User-Agent"].ToString();
            await audit.WriteAsync(AuthEventType.SessionExpired, null, session.UserId.ToString(), null, ip, ua, session.Id.ToString(), "Inactivity timeout");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { detail = "Session expired due to inactivity." });
            return;
        }

        // Update last activity
        session.LastActivityAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        context.Items["SessionId"] = session.Id.ToString();
        context.Items["UserId"] = session.UserId.ToString();

        await _next(context);
    }
}
