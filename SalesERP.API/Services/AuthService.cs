using Microsoft.IdentityModel.Tokens;
using SalesERP.Data.Repositories;
using SalesERP.Models;
using SalesERP.Models.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SalesERP.API.Services
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
            Console.WriteLine("========================================");
            Console.WriteLine($"🔐 LOGIN ATTEMPT: {loginDto.Email}");
            Console.WriteLine("========================================");

            try
            {
                // Find user
                var user = await _userRepository.GetByEmailAsync(loginDto.Email);

                if (user == null)
                {
                    Console.WriteLine($"❌ User not found: {loginDto.Email}");
                    return null;
                }

                Console.WriteLine($"✅ User found: {user.FullName} ({user.UserRole})");
                if (user.UserRole == "Admin")
                {
                    Console.WriteLine($"🔑 Admin Code: {user.AdminCode}");
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    Console.WriteLine($"❌ Invalid password");
                    return null;
                }

                Console.WriteLine($"✅ Password verified");

                // Generate token
                var token = GenerateJwtToken(user);

                Console.WriteLine($"✅ LOGIN SUCCESSFUL");
                Console.WriteLine("========================================");

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
                Console.WriteLine($"❌ LOGIN ERROR: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            Console.WriteLine("========================================");
            Console.WriteLine($"📝 REGISTRATION ATTEMPT");
            Console.WriteLine($"Email: {registerDto.Email}");
            Console.WriteLine($"Role: {registerDto.UserRole}");
            Console.WriteLine("========================================");

            try
            {
                // Check if user exists
                var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    Console.WriteLine($"❌ User already exists: {registerDto.Email}");
                    return null;
                }

                // Hash password
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
                Console.WriteLine($"✅ Password hashed");

                // Generate Admin Code for Admin users
                string? adminCode = null;
                if (registerDto.UserRole == "Admin")
                {
                    adminCode = await GenerateUniqueAdminCode();
                    Console.WriteLine($"🔑 Generated Admin Code: {adminCode}");
                }

                var user = new User
                {
                    FullName = registerDto.FullName,
                    Email = registerDto.Email,
                    PasswordHash = passwordHash,
                    UserRole = registerDto.UserRole,
                    PhoneNumber = registerDto.PhoneNumber,
                    CompanyName = registerDto.CompanyName,
                    Address = registerDto.Address,
                    AdminCode = adminCode,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdUser = await _userRepository.CreateAsync(user);
                Console.WriteLine($"✅ User created with ID: {createdUser.UserId}");

                if (createdUser.UserRole == "Admin")
                {
                    Console.WriteLine($"👤 Admin created with code: {createdUser.AdminCode}");
                }

                var token = GenerateJwtToken(createdUser);

                Console.WriteLine($"✅ REGISTRATION SUCCESSFUL");
                Console.WriteLine("========================================");

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
                Console.WriteLine($"❌ REGISTRATION ERROR: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                throw;
            }
        }

        private async Task<string> GenerateUniqueAdminCode()
        {
            const int maxAttempts = 10;
            int attempts = 0;

            while (attempts < maxAttempts)
            {
                var code = GenerateAdminCode();

                // Check if code already exists
                var existingAdmin = await _userRepository.GetByAdminCodeAsync(code);
                if (existingAdmin == null)
                {
                    return code;
                }

                attempts++;
                Console.WriteLine($"⚠️ Code collision detected, regenerating... (Attempt {attempts})");
            }

            // Fallback to timestamp-based code if too many collisions
            var timestamp = DateTime.UtcNow.Ticks.ToString().Substring(10, 6);
            return $"ADM-{timestamp}";
        }

        private string GenerateAdminCode()
        {
            // Generate unique 8-character code like: ADM-A3X9K2
            // Excluding similar-looking characters (0/O, 1/I/L, etc.)
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = new Random();

            var codePart = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            return $"ADM-{codePart}";
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong123456789";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "SalesERP";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "SalesERP";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.UserRole)
            };

            // Add AdminCode to claims if user is Admin
            if (user.UserRole == "Admin" && !string.IsNullOrEmpty(user.AdminCode))
            {
                claims.Add(new Claim("AdminCode", user.AdminCode));
            }

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}