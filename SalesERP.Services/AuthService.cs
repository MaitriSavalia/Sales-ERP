using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SalesERP.Data;
using SalesERP.Models;
using SalesERP.Models.DTOs;
using SalesERP.Repositories;

namespace SalesERP.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<User> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email.ToLower());
            if (existingUser != null)
            {
                throw new InvalidOperationException("User already exists");
            }

            // For partners, verify AdminCode exists
            if (dto.UserRole == 2 && !string.IsNullOrEmpty(dto.AdminCode))
            {
                var admin = await _userRepository.GetByAdminCodeAsync(dto.AdminCode);
                if (admin == null)
                {
                    throw new InvalidOperationException("Invalid admin code");
                }
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                UserRole = dto.UserRole,
                CompanyName = dto.CompanyName,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                AdminCode = dto.UserRole == 1 ? GenerateAdminCode() : dto.AdminCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            return user;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email.ToLower());
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            var token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                Token = token,
                UserID = user.UserID,
                FullName = user.FullName,
                Email = user.Email,
                UserRole = user.UserRole,
                AdminCode = user.AdminCode
            };
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, GetRoleName(user.UserRole)),
                new Claim("AdminCode", user.AdminCode ?? "")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GetRoleName(int userRole)
        {
            return userRole switch
            {
                1 => "Admin",
                2 => "Partner",
                3 => "Buyer",
                _ => "Unknown"
            };
        }

        private string GenerateAdminCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}