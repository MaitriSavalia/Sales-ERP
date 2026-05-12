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
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IProductRepository _productRepository;
        private readonly ISaleRepository _saleRepository;
        private readonly IUserRepository _userRepository;

        public AdminController(
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

        // AdminIDs format: "adminId:ISO-timestamp" entries, comma-separated
        // e.g. "1:2026-01-24T10:30:00Z,3:2026-03-07T08:15:00Z"
        // Backward compatible: plain "1" entries have no timestamp
        private static string EntryId(string entry) => entry.Split(':')[0].Trim();
        private static DateTime? EntryTimestamp(string entry)
        {
            var idx = entry.IndexOf(':');
            if (idx < 0) return null;
            return DateTime.TryParse(entry[(idx + 1)..], null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt) ? dt : null;
        }
        private static bool HasAdmin(string adminIDs, string adminIdStr) =>
            adminIDs.Split(',', StringSplitOptions.RemoveEmptyEntries).Any(e => EntryId(e) == adminIdStr);

        // ========================================
        // Dashboard Statistics
        // ========================================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var totalProducts = await _context.Products
                .Where(p => p.AdminID == adminId && p.IsActive)
                .CountAsync();

            var sales = await _context.Sales
                .Include(s => s.Product)
                .Where(s => s.Product.AdminID == adminId)
                .ToListAsync();

            var totalRevenue = sales.Sum(s => s.SaleAmount);
            var totalSales = sales.Count;
            var commissionPaid = sales
                .Where(s => s.CommissionPaymentStatus == "Completed")
                .Sum(s => s.CommissionAmount);

            var adminIdStr = adminId.ToString();
            var allUsers = await _context.Users
                .Where(u => u.UserRole == 2 && u.AdminIDs != null)
                .ToListAsync();
            var activePartners = allUsers.Count(u => HasAdmin(u.AdminIDs!, adminIdStr));

            return Ok(new
            {
                totalProducts,
                totalRevenue,
                totalSales,
                commissionPaid,
                activePartners
            });
        }

        // ========================================
        // Partner Management
        // ========================================
        [HttpGet("partners")]
        public async Task<IActionResult> GetMyPartners()
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var adminIdStr = adminId.ToString();

            var allPartners = await _context.Users
                .Where(u => u.UserRole == 2 && u.AdminIDs != null)
                .ToListAsync();

            var partners = allPartners
                .Where(u => HasAdmin(u.AdminIDs!, adminIdStr))
                .Select(u =>
                {
                    var entry = u.AdminIDs!.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .FirstOrDefault(e => EntryId(e) == adminIdStr);
                    DateTime? ts = entry != null ? EntryTimestamp(entry) : null;
                    if (ts == null && u.CreatedAt != DateTime.MinValue && u.CreatedAt.Year > 2000)
                        ts = u.CreatedAt;
                    return new
                    {
                        userID = u.UserID,
                        fullName = u.FullName,
                        email = u.Email,
                        companyName = u.CompanyName,
                        phoneNumber = u.PhoneNumber,
                        addedAt = ts
                    };
                })
                .ToList();

            return Ok(partners);
        }

        [HttpPost("partners")]
        public async Task<IActionResult> AddPartner([FromBody] AddPartnerDto dto)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var adminIdStr = adminId.ToString();

            var partner = await _userRepository.GetByEmailAsync(dto.PartnerEmail);
            if (partner == null || partner.UserRole != 2)
                return NotFound(new { message = "Partner not found. User must register as Partner first." });

            var entries = partner.AdminIDs?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim()).ToList() ?? new List<string>();

            if (entries.Any(e => EntryId(e) == adminIdStr))
                return BadRequest(new { message = "This partner is already in your network." });

            entries.Add($"{adminId}:{DateTime.UtcNow:O}");
            partner.AdminIDs = string.Join(",", entries);

            await _userRepository.UpdateAsync(partner);

            return Ok(new { message = "Partner added to your network successfully!", partnerName = partner.FullName });
        }

        [HttpDelete("partners/{partnerId}")]
        public async Task<IActionResult> RemovePartner(int partnerId)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var adminIdStr = adminId.ToString();

            var partner = await _userRepository.GetByIdAsync(partnerId);
            if (partner == null || partner.UserRole != 2)
                return NotFound(new { message = "Partner not found." });

            var entries = partner.AdminIDs?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim()).ToList() ?? new List<string>();

            var toRemove = entries.FirstOrDefault(e => EntryId(e) == adminIdStr);
            if (toRemove == null)
                return BadRequest(new { message = "This partner is not in your network." });

            entries.Remove(toRemove);
            partner.AdminIDs = entries.Count > 0 ? string.Join(",", entries) : null;

            await _userRepository.UpdateAsync(partner);

            return Ok(new { message = "Partner removed from your network." });
        }

        // ========================================
        // Product Management
        // ========================================
        [HttpGet("products")]
        public async Task<IActionResult> GetMyProducts()
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var products = await _context.Products
                .Where(p => p.AdminID == adminId)
                .Select(p => new ProductDto
                {
                    ProductID = p.ProductID,
                    ProductName = p.ProductName,
                    Description = p.Description,
                    Price = p.Price,
                    CommissionPercentage = (int)p.CommissionPercentage,
                    AdminID = p.AdminID,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var product = new Product
            {
                ProductName = dto.ProductName,
                Description = dto.Description,
                Price = dto.Price,
                CommissionPercentage = dto.CommissionPercentage,
                AdminID = adminId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _productRepository.AddAsync(product);

            return Ok(new { message = "Product created successfully!", productID = product.ProductID });
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto dto)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.AdminID != adminId)
            {
                return NotFound(new { message = "Product not found" });
            }

            product.ProductName = dto.ProductName;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.CommissionPercentage = dto.CommissionPercentage;

            await _productRepository.UpdateAsync(product);

            return Ok(new { message = "Product updated successfully!" });
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.AdminID != adminId)
            {
                return NotFound(new { message = "Product not found" });
            }

            await _productRepository.DeleteAsync(id);

            return Ok(new { message = "Product deleted successfully!" });
        }

        // ========================================
        // Sales Management
        // ========================================
        [HttpGet("sales")]
        public async Task<IActionResult> GetMySales()
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var sales = await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Include(s => s.Buyer)
                .Where(s => s.Product.AdminID == adminId)
                .Select(s => new SaleDto
                {
                    SaleID = s.SaleID,
                    ProductID = s.ProductID,
                    ProductName = s.Product.ProductName,
                    PartnerID = s.PartnerID,
                    PartnerName = s.Partner.FullName,
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

        [HttpPut("sales/{id}/commission-status")]
        public async Task<IActionResult> UpdateCommissionStatus(int id, [FromBody] UpdateCommissionPaymentStatusDto dto)
        {
            var sale = await _saleRepository.GetByIdAsync(id);
            if (sale == null)
            {
                return NotFound(new { message = "Sale not found" });
            }

            sale.CommissionPaymentStatus = dto.CommissionPaymentStatus;
            await _saleRepository.UpdateAsync(sale);

            return Ok(new { message = "Commission status updated successfully!" });
        }

        [HttpPut("sales/{id}/sale-status")]
        public async Task<IActionResult> UpdateSaleStatus(int id, [FromBody] UpdateSalePaymentStatusDto dto)
        {
            var sale = await _saleRepository.GetByIdAsync(id);
            if (sale == null)
            {
                return NotFound(new { message = "Sale not found" });
            }

            sale.SalePaymentStatus = dto.SalePaymentStatus;
            await _saleRepository.UpdateAsync(sale);

            return Ok(new { message = "Sale status updated successfully!" });
        }

        // ========================================
        // Top Partners Analytics
        // ========================================
        [HttpGet("top-partners")]
        public async Task<IActionResult> GetTopPartners()
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var topPartners = await _context.Sales
                .Include(s => s.Product)
                .Include(s => s.Partner)
                .Where(s => s.Product.AdminID == adminId)
                .GroupBy(s => s.PartnerID)
                .Select(g => new
                {
                    partnerID = g.Key,
                    partnerName = g.First().Partner.FullName,
                    companyName = g.First().Partner.CompanyName,
                    totalSales = g.Count(),
                    totalRevenue = g.Sum(s => s.SaleAmount),
                    totalCommission = g.Sum(s => s.CommissionAmount)
                })
                .OrderByDescending(p => p.totalRevenue)
                .Take(10)
                .ToListAsync();

            return Ok(topPartners);
        }
    }
}