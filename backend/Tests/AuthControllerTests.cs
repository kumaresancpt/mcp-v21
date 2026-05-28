using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using VmsBackend.Controllers;
using VmsBackend.Data;
using VmsBackend.Models;
using VmsBackend.Services;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace VmsBackend.Tests.Controllers;

/// <summary>
/// Unit tests for AuthController.Register endpoint
/// Tests cover AC-B1 through AC-B10 (User Registration)
/// </summary>
public class AuthControllerTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly AuthController _controller;
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly Mock<ILogger<AuthController>> _mockLogger;

    public AuthControllerTests()
    {
        // Setup InMemory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new AppDbContext(options);

        // Setup mocks
        _mockAuthService = new Mock<IAuthService>();
        _mockLogger = new Mock<ILogger<AuthController>>();

        // Create controller
        _controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
    }

    public void Dispose()
    {
        _dbContext?.Dispose();
    }

    // Test Case a: POST /api/auth/register returns 201 Created on valid input (AC-B1, AC-B8)
    [Fact]
    public async Task Register_WithValidInput_Returns201Created()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john@example.com",
            PhoneNumber = "1234567890",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var expectedResponse = new RegisterResponse
        {
            Message = "User registered successfully",
            UserId = Guid.NewGuid().ToString()
        };

        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((true, expectedResponse, string.Empty));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(AuthController.Register), createdResult.ActionName);
        Assert.Equal(expectedResponse, createdResult.Value);
    }

    // Test Case b: POST /api/auth/register returns 400 on invalid email format (AC-B2)
    [Fact]
    public async Task Register_WithInvalidEmailFormat_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "invalid-email",
            PhoneNumber = "1234567890",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var errorDetail = "Email must be in a valid format";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case c: POST /api/auth/register returns 400 on duplicate email (AC-B2)
    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "duplicate@example.com",
            PhoneNumber = "1234567890",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var errorDetail = "Email is already registered";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case d: POST /api/auth/register returns 400 on password mismatch (AC-B3)
    [Fact]
    public async Task Register_WithPasswordMismatch_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john@example.com",
            PhoneNumber = "1234567890",
            Password = "ValidPassword123",
            ConfirmPassword = "DifferentPassword123"
        };

        var errorDetail = "Password and confirm password do not match";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case e: POST /api/auth/register returns 400 on password < 8 chars (AC-B4)
    [Fact]
    public async Task Register_WithPasswordLessThan8Chars_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john@example.com",
            PhoneNumber = "1234567890",
            Password = "Short",
            ConfirmPassword = "Short"
        };

        var errorDetail = "Password must be at least 8 characters";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case f: POST /api/auth/register returns 400 on invalid phone number (AC-B5)
    [Fact]
    public async Task Register_WithInvalidPhoneNumber_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john@example.com",
            PhoneNumber = "123",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var errorDetail = "Phone number must contain at least 10 digits";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case g: POST /api/auth/register returns 400 on missing required field (AC-B10)
    [Fact]
    public async Task Register_WithMissingName_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "",
            Email = "john@example.com",
            PhoneNumber = "1234567890",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var errorDetail = "Name is required";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case h: Verify response does NOT include passwordHash (AC-B8)
    [Fact]
    public async Task Register_Success_ResponseDoesNotIncludePasswordHash()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john@example.com",
            PhoneNumber = "1234567890",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var expectedResponse = new RegisterResponse
        {
            Message = "User registered successfully",
            UserId = Guid.NewGuid().ToString()
            // Note: No PasswordHash property in RegisterResponse
        };

        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((true, expectedResponse, string.Empty));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<RegisterResponse>(createdResult.Value);
        Assert.NotNull(response.Message);
        Assert.NotNull(response.UserId);
        // Verify PasswordHash is not in response by checking it doesn't have the property
        var responseType = response.GetType();
        var passwordHashProperty = responseType.GetProperty("PasswordHash");
        Assert.Null(passwordHashProperty);
    }

    // Test Case i: Error response includes "detail" field (AC-B10)
    [Fact]
    public async Task Register_OnError_ResponseIncludesDetailField()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "Jane Doe",
            Email = "jane@example.com",
            PhoneNumber = "9876543210",
            Password = "ValidPassword123",
            ConfirmPassword = "ValidPassword123"
        };

        var errorDetail = "A validation error occurred";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.NotNull(errorResponse.Detail);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case j: Verify AuthService.RegisterUserAsync is called with correct payload
    [Fact]
    public async Task Register_CallsAuthServiceRegisterUserAsync_WithCorrectPayload()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "Test User",
            Email = "test@example.com",
            PhoneNumber = "5551234567",
            Password = "TestPassword123",
            ConfirmPassword = "TestPassword123"
        };

        var mockResponse = new RegisterResponse
        {
            Message = "Success",
            UserId = Guid.NewGuid().ToString()
        };

        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((true, mockResponse, string.Empty));

        // Act
        await _controller.Register(request);

        // Assert
        _mockAuthService.Verify(
            s => s.RegisterUserAsync(It.Is<RegisterRequest>(r =>
                r.Name == "Test User" &&
                r.Email == "test@example.com" &&
                r.PhoneNumber == "5551234567" &&
                r.Password == "TestPassword123" &&
                r.ConfirmPassword == "TestPassword123"
            )),
            Times.Once);
    }

    // Test Case k: Multiple validation errors — first error is returned (AC-B10)
    [Fact]
    public async Task Register_WithMultipleErrors_ReturnsFirstError()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "",  // Empty name
            Email = "invalid",  // Invalid email
            PhoneNumber = "123",  // Invalid phone
            Password = "short",  // Too short
            ConfirmPassword = "different"  // Mismatch
        };

        // Service would validate and return the first error found
        var errorDetail = "Name is required";
        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((false, new RegisterResponse(), errorDetail));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var errorResponse = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        Assert.Equal(errorDetail, errorResponse.Detail);
    }

    // Test Case l: Successful registration returns userId in response (AC-B8)
    [Fact]
    public async Task Register_Success_ResponseIncludesUserId()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "Alice Johnson",
            Email = "alice@example.com",
            PhoneNumber = "5559876543",
            Password = "SecurePassword123",
            ConfirmPassword = "SecurePassword123"
        };

        var userId = Guid.NewGuid().ToString();
        var expectedResponse = new RegisterResponse
        {
            Message = "User registered successfully",
            UserId = userId
        };

        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((true, expectedResponse, string.Empty));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<RegisterResponse>(createdResult.Value);
        Assert.Equal(userId, response.UserId);
    }

    // Test Case m: Success response includes descriptive message (AC-B8)
    [Fact]
    public async Task Register_Success_ResponseIncludesDescriptiveMessage()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "Bob Smith",
            Email = "bob@example.com",
            PhoneNumber = "5551112222",
            Password = "BobPassword123",
            ConfirmPassword = "BobPassword123"
        };

        var expectedMessage = "User registered successfully. Please check your email for verification link.";
        var expectedResponse = new RegisterResponse
        {
            Message = expectedMessage,
            UserId = Guid.NewGuid().ToString()
        };

        _mockAuthService
            .Setup(s => s.RegisterUserAsync(request))
            .ReturnsAsync((true, expectedResponse, string.Empty));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<RegisterResponse>(createdResult.Value);
        Assert.NotNull(response.Message);
        Assert.Contains("User registered successfully", response.Message);
    }
}
