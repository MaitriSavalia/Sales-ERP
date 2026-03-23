using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SalesERP.Models;
using SalesERP.Models.DTOs;
using SalesERP.Data.Repositories;

namespace SalesERP.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            try
            {
                Console.WriteLine($"🔐 Login attempt: {loginDto.Email}");

                var user = await _userRepository.GetByEmailAsync(loginDto.Email);
                
                if (user == null)
                {
                    Console.WriteLine($"❌ User not found: {loginDto.Email}");
                    return null;
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    Console.WriteLine($"❌ Invalid password for: {loginDto.Email}");
                    return null;
                }

                var token = GenerateJwtToken(user);
                
                Console.WriteLine($"✅ Login successful: {user.Email} (Role: {user.UserRole})");

                return new AuthResponseDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    UserRole = user.UserRole,
                    Token = token,
                    CompanyName = user.CompanyName
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Login error: {ex.Message}");
                return null;
            }
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                Console.WriteLine($"📝 Registration attempt: {registerDto.Email}");

                var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    Console.WriteLine($"❌ User already exists: {registerDto.Email}");
                    return null;
                }

                var user = new User
                {
                    FullName = registerDto.FullName,
                    Email = registerDto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    UserRole = registerDto.UserRole,
                    PhoneNumber = registerDto.PhoneNumber,
                    CompanyName = registerDto.CompanyName,
                    Address = registerDto.Address,
                    AdminCode = registerDto.UserRole.ToLower() == "admin" ? GenerateAdminCode() : null,
                    CreatedAt = DateTime.UtcNow
                };

                var createdUser = await _userRepository.CreateAsync(user);
                
                var token = GenerateJwtToken(createdUser);
                
                Console.WriteLine($"✅ Registration successful: {createdUser.Email} (Role: {createdUser.UserRole})");

                return new AuthResponseDto
                {
                    UserId = createdUser.UserId,
                    FullName = createdUser.FullName,
                    Email = createdUser.Email,
                    UserRole = createdUser.UserRole,
                    Token = token,
                    CompanyName = createdUser.CompanyName
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Registration error: {ex.Message}");
                throw;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.UserRole),
                    new Claim("FullName", user.FullName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateAdminCode()
        {
            return new Random().Next(100000, 999999).ToString();
        }
    }
}