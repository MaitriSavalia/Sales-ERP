using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SalesERP.Models;
using SalesERP.Models.DTOs;
using SalesERP.Data;
using SalesERP.Data.Repositories;

namespace SalesERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Partner")]
    public class PartnerController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly ISaleRepository _saleRepository;
        private readonly IUserRepository _userRepository;
        // ✅ REMOVED: private readonly IAdminPartnerMappingRepository _mappingRepository;
        private readonly ApplicationDbContext _context;

        public PartnerController(
            IProductRepository productRepository,
            ISaleRepository saleRepository,
            IUserRepository userRepository,
            // ✅ REMOVED: IAdminPartnerMappingRepository mappingRepository,
            ApplicationDbContext context)
        {
            _productRepository = productRepository;
            _saleRepository = saleRepository;
            _userRepository = userRepository;
            // ✅ REMOVED: _mappingRepository = mappingRepository;
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        // ========================================
        // PRODUCTS
        // ========================================

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"📦 Getting products for Partner ID: {partnerId}");

                // ✅ NEW: Get admin IDs from partner's AdminIds column
                var partner = await _userRepository.GetByIdAsync(partnerId);
                var adminIds = partner?.AdminIds?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => int.Parse(id))
                    .ToList() ?? new List<int>();

                Console.WriteLine($"👥 Partner works with {adminIds.Count} admin(s): {string.Join(", ", adminIds)}");

                if (adminIds.Count == 0)
                {
                    Console.WriteLine("⚠️ No admin mappings found for this partner");
                    return Ok(new List<ProductDto>());
                }

                var products = await _context.Products
                    .Include(p => p.Admin)
                    .Where(p => adminIds.Contains(p.AdminId) && p.IsActive)
                    .ToListAsync();

                Console.WriteLine($"✅ Found {products.Count} products");

                var productDtos = products.Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    Description = p.Description,
                    Price = p.Price,
                    CommissionPercentage = p.CommissionPercentage,
                    AdminId = p.AdminId,
                    AdminName = p.Admin?.FullName,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                }).ToList();

                return Ok(productDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get products error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ========================================
        // SALES
        // ========================================

        [HttpGet("sales")]
        public async Task<IActionResult> GetSales()
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"💰 Getting sales for Partner ID: {partnerId}");

                var sales = await _saleRepository.GetByPartnerIdAsync(partnerId);
                var salesList = sales.ToList();

                Console.WriteLine($"✅ Found {salesList.Count} sales");

                var saleDtos = salesList.Select(s => new SaleDto
                {
                    SaleId = s.SaleId,
                    ProductId = s.ProductId,
                    ProductName = s.Product?.ProductName ?? "Unknown",
                    PartnerId = s.PartnerId,
                    PartnerName = s.Partner?.FullName ?? "Unknown",
                    BuyerId = s.BuyerId,
                    BuyerName = s.Buyer?.FullName ?? "Unknown",
                    BuyerEmail = s.Buyer?.Email ?? "",
                    BuyerCompany = s.Buyer?.CompanyName,
                    SaleAmount = s.SaleAmount,
                    CommissionAmount = s.CommissionAmount,
                    SaleDate = s.SaleDate,
                    CommissionPaymentStatus = s.CommissionPaymentStatus, // ✅ RENAMED
                    SalePaymentStatus = s.SalePaymentStatus,             // ✅ RENAMED
                    LicenseKey = s.LicenseKey ?? "",
                    Notes = s.Notes
                }).ToList();

                return Ok(saleDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get sales error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto saleDto)
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"💰 Creating sale for Partner ID: {partnerId}");

                var product = await _productRepository.GetByIdAsync(saleDto.ProductId);
                if (product == null)
                {
                    Console.WriteLine($"❌ Product not found: {saleDto.ProductId}");
                    return NotFound(new { message = "Product not found" });
                }

                if (!product.IsActive)
                {
                    Console.WriteLine($"❌ Product is inactive: {saleDto.ProductId}");
                    return BadRequest(new { message = "Product is inactive" });
                }

                var buyer = await _userRepository.GetByIdAsync(saleDto.BuyerId);
                if (buyer == null || buyer.UserRole != "Buyer")
                {
                    Console.WriteLine($"❌ Buyer not found or invalid role: {saleDto.BuyerId}");
                    return NotFound(new { message = "Buyer not found" });
                }

                var commissionAmount = (product.Price * product.CommissionPercentage) / 100;

                var sale = new Sale
                {
                    ProductId = saleDto.ProductId,
                    PartnerId = partnerId,
                    BuyerId = saleDto.BuyerId,
                    SaleAmount = product.Price,
                    CommissionAmount = commissionAmount,
                    SaleDate = DateTime.UtcNow,
                    CommissionPaymentStatus = "Pending", // ✅ RENAMED
                    SalePaymentStatus = "Pending",       // ✅ RENAMED
                    LicenseKey = GenerateLicenseKey(),
                    Notes = saleDto.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                var createdSale = await _saleRepository.CreateAsync(sale);
                Console.WriteLine($"✅ Sale created: ID {createdSale.SaleId}, License: {sale.LicenseKey}");

                return Ok(new 
                { 
                    message = "Sale created successfully", 
                    saleId = createdSale.SaleId,
                    licenseKey = sale.LicenseKey,
                    commissionAmount = commissionAmount
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Create sale error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("sales/{id}/sale-payment-status")] // ✅ RENAMED ENDPOINT
        public async Task<IActionResult> UpdateSalePaymentStatus(int id, [FromBody] UpdateSalePaymentStatusDto statusDto) // ✅ RENAMED DTO
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"📝 Updating sale {id} payment status to {statusDto.SalePaymentStatus}");

                var sale = await _saleRepository.GetByIdAsync(id);

                if (sale == null)
                {
                    Console.WriteLine($"❌ Sale not found: {id}");
                    return NotFound(new { message = "Sale not found" });
                }

                if (sale.PartnerId != partnerId)
                {
                    Console.WriteLine($"❌ Partner {partnerId} not authorized for sale {id}");
                    return Forbid();
                }

                sale.SalePaymentStatus = statusDto.SalePaymentStatus; // ✅ RENAMED
                await _saleRepository.UpdateAsync(sale);

                Console.WriteLine($"✅ Sale {id} payment status updated to {statusDto.SalePaymentStatus}");
                return Ok(new { message = "Sale payment status updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Update sale payment status error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ========================================
        // BUYERS
        // ========================================

        [HttpGet("buyers")]
        public async Task<IActionResult> GetBuyers()
        {
            try
            {
                Console.WriteLine($"👤 Getting all buyers");

                var buyers = await _context.Users
                    .Where(u => u.UserRole == "Buyer")
                    .OrderBy(u => u.FullName)
                    .Select(u => new
                    {
                        userId = u.UserId,
                        fullName = u.FullName,
                        email = u.Email,
                        companyName = u.CompanyName,
                        phoneNumber = u.PhoneNumber
                    })
                    .ToListAsync();

                Console.WriteLine($"✅ Found {buyers.Count} buyers");
                return Ok(buyers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get buyers error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("search-buyers")]
        public async Task<IActionResult> SearchBuyers([FromQuery] string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                var buyers = await _context.Users
                    .Where(u => u.UserRole == "Buyer" && u.Email.Contains(email))
                    .Take(10)
                    .Select(u => new
                    {
                        userId = u.UserId,
                        fullName = u.FullName,
                        email = u.Email,
                        companyName = u.CompanyName,
                        phoneNumber = u.PhoneNumber
                    })
                    .ToListAsync();

                return Ok(buyers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Search buyers error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ========================================
        // DASHBOARD
        // ========================================

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"📊 Partner Dashboard - PartnerId: {partnerId}");

                var sales = await _saleRepository.GetByPartnerIdAsync(partnerId);
                var salesList = sales.ToList();

                var stats = new
                {
                    totalSales = salesList.Count,
                    totalRevenue = salesList.Sum(s => s.SaleAmount),
                    totalCommission = salesList.Sum(s => s.CommissionAmount),
                    pendingCommission = salesList
                        .Where(s => s.CommissionPaymentStatus == "Pending") // ✅ RENAMED
                        .Sum(s => s.CommissionAmount),
                    completedCommission = salesList
                        .Where(s => s.CommissionPaymentStatus == "Completed") // ✅ RENAMED
                        .Sum(s => s.CommissionAmount)
                };

                Console.WriteLine($"✅ Dashboard: {stats.totalSales} sales, ₹{stats.totalRevenue} revenue");

                return Ok(stats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Dashboard error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ========================================
        // HELPER METHODS
        // ========================================

        private string GenerateLicenseKey()
        {
            var random = new Random();
            var part1 = random.Next(1000, 9999);
            var part2 = random.Next(1000, 9999);
            var part3 = random.Next(1000, 9999);
            var part4 = random.Next(1000, 9999);
            return $"{part1}-{part2}-{part3}-{part4}";
        }
    }
}