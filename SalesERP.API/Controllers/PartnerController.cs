using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesERP.Data;
using SalesERP.Models;
using SalesERP.Models.DTOs;
using SalesERP.Repositories;
using System.Security.Claims;

namespace SalesERP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Partner")]
    public class PartnerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IProductRepository _productRepository;
        private readonly ISaleRepository _saleRepository;
        private readonly IUserRepository _userRepository;

        public PartnerController(
            ApplicationDbContext context,
            IProductRepository productRepository,
            ISaleRepository saleRepository,
            IUserRepository userRepository)
        {
            _context = context;
            _productRepository = productRepository;
            _saleRepository = saleRepository;
            _userRepository = userRepository;
        }

        // ========================================
        // Dashboard Statistics
        // ========================================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var partnerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sales = await _context.Sales
                .Where(s => s.PartnerID == partnerId)
                .ToListAsync();

            var totalSales = sales.Count;
            var totalRevenue = sales.Sum(s => s.SaleAmount);
            var totalCommission = sales.Sum(s => s.CommissionAmount);
            var paidCommission = sales
                .Where(s => s.CommissionPaymentStatus == "Completed")
                .Sum(s => s.CommissionAmount);

            return Ok(new
            {
                totalSales,
                totalRevenue,
                totalCommission,
                paidCommission
            });
        }

        // ========================================
        // Available Products
        // ========================================
        [HttpGet("products")]
        public async Task<IActionResult> GetAvailableProducts()
        {
            var partnerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var partner = await _userRepository.GetByIdAsync(partnerId);
            if (partner == null || string.IsNullOrEmpty(partner.AdminIDs))
            {
                return Ok(new List<ProductDto>());
            }

            var adminIds = partner.AdminIDs.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Split(':')[0].Trim())
                .Where(id => int.TryParse(id, out _))
                .Select(int.Parse)
                .ToList();

            var products = await _context.Products
                .Include(p => p.Admin)
                .Where(p => adminIds.Contains(p.AdminID) && p.IsActive)
                .Select(p => new ProductDto
                {
                    ProductID = p.ProductID,
                    ProductName = p.ProductName,
                    Description = p.Description,
                    Price = p.Price,
                    CommissionPercentage = (int)p.CommissionPercentage,
                    AdminID = p.AdminID,
                    AdminName = p.Admin!.FullName,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }

        // ========================================
        // Sales Management
        // ========================================
        [HttpGet("sales")]
        public async Task<IActionResult> GetMySales()
        {
            var partnerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sales = await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Buyer)
                .Where(s => s.PartnerID == partnerId)
                .Select(s => new SaleDto
                {
                    SaleID = s.SaleID,
                    ProductID = s.ProductID,
                    ProductName = s.Product.ProductName,
                    PartnerID = s.PartnerID,
                    PartnerName = "",
                    BuyerID = s.BuyerID,
                    BuyerName = s.Buyer.FullName,
                    BuyerEmail = s.Buyer.Email,
                    BuyerCompany = s.Buyer.CompanyName,
                    SaleAmount = s.SaleAmount,
                    CommissionAmount = s.CommissionAmount,
                    SaleDate = s.SaleDate,
                    CommissionPaymentStatus = s.CommissionPaymentStatus,
                    SalePaymentStatus = s.SalePaymentStatus,
                    LicenseKey = s.LicenseKey,
                    Notes = s.Notes
                })
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();

            return Ok(sales);
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
        {
            var partnerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var product = await _productRepository.GetByIdAsync(dto.ProductID);
            if (product == null || !product.IsActive)
            {
                return NotFound(new { message = "Product not found or inactive" });
            }

            var buyer = await _userRepository.GetByEmailAsync(dto.BuyerEmail);
            if (buyer == null)
            {
                buyer = new User
                {
                    FullName = dto.BuyerEmail.Split('@')[0],
                    Email = dto.BuyerEmail.ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    UserRole = 3, // Buyer
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _userRepository.AddAsync(buyer);
            }

            var existingSale = await _saleRepository.GetByBuyerAndProductAsync(buyer.UserID, dto.ProductID);
            if (existingSale != null)
            {
                return BadRequest(new { message = "This buyer has already purchased this product" });
            }

            var commissionAmount = (product.Price * product.CommissionPercentage) / 100;

            var sale = new Sale
            {
                ProductID = dto.ProductID,
                PartnerID = partnerId,
                BuyerID = buyer.UserID,
                SaleAmount = product.Price,
                CommissionAmount = commissionAmount,
                SaleDate = DateTime.UtcNow,
                CommissionPaymentStatus = "Pending",
                SalePaymentStatus = "Pending",
                LicenseKey = GenerateLicenseKey(),
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            await _saleRepository.AddAsync(sale);

            return Ok(new
            {
                message = "Sale created successfully!",
                saleID = sale.SaleID,
                licenseKey = sale.LicenseKey,
                commissionAmount = sale.CommissionAmount
            });
        }

        // ========================================
        // Buyer Management
        // ========================================
        [HttpGet("buyers")]
        public async Task<IActionResult> GetMyBuyers()
        {
            var partnerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var buyers = await _context.Sales
                .Include(s => s.Buyer)
                .Where(s => s.PartnerID == partnerId)
                .GroupBy(s => s.BuyerID)
                .Select(g => new BuyerDto
                {
                    BuyerID = g.Key,
                    BuyerName = g.First().Buyer.FullName,
                    Email = g.First().Buyer.Email,
                    CompanyName = g.First().Buyer.CompanyName,
                    PhoneNumber = g.First().Buyer.PhoneNumber,
                    TotalPurchases = g.Count(),
                    TotalAmountSpent = g.Sum(s => s.SaleAmount),
                    LastPurchaseDate = g.Max(s => s.SaleDate)
                })
                .OrderByDescending(b => b.TotalAmountSpent)
                .ToListAsync();

            return Ok(buyers);
        }

        // ========================================
        // Helper Methods
        // ========================================
        private string GenerateLicenseKey()
        {
            var random = new Random();
            var part1 = random.Next(1000, 9999);
            var part2 = random.Next(1000, 9999);
            var part3 = random.Next(1000, 9999);
            var part4 = random.Next(1000, 9999);
            return $"CLD-{part1}-{part2}-{part3}";
        }
    }
}