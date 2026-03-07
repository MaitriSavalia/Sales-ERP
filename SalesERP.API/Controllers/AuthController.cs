using Microsoft.AspNetCore.Mvc;
using SalesERP.API.Services;
using SalesERP.Models.DTOs;

namespace SalesERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (loginDto == null || string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                var result = await _authService.LoginAsync(loginDto);

                if (result == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Login error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (registerDto == null)
                {
                    return BadRequest(new { message = "Invalid request data" });
                }

                if (string.IsNullOrWhiteSpace(registerDto.Email) ||
                    string.IsNullOrWhiteSpace(registerDto.Password) ||
                    string.IsNullOrWhiteSpace(registerDto.FullName))
                {
                    return BadRequest(new { message = "Required fields are missing" });
                }

                var result = await _authService.RegisterAsync(registerDto);

                if (result == null)
                {
                    return BadRequest(new { message = "User with this email already exists" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Registration error: {ex.Message}");
                return StatusCode(500, new { message = $"Registration failed: {ex.Message}" });
            }
        }
    }
}