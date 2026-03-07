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
        private readonly IAdminPartnerMappingRepository _mappingRepository;
        private readonly ApplicationDbContext _context;

        public PartnerController(
            IProductRepository productRepository, 
            ISaleRepository saleRepository,
            IUserRepository userRepository,
            IAdminPartnerMappingRepository mappingRepository,
            ApplicationDbContext context)
        {
            _productRepository = productRepository;
            _saleRepository = saleRepository;
            _userRepository = userRepository;
            _mappingRepository = mappingRepository;
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

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
                    paidCommission = salesList.Where(s => s.PaymentStatus == "Completed").Sum(s => s.CommissionAmount)
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

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"📦 Getting products for Partner ID: {partnerId}");

                var mappedAdminIds = await _mappingRepository.GetMappedAdminIdsAsync(partnerId);

                Console.WriteLine($"🔗 Partner is mapped to {mappedAdminIds.Count} admins: {string.Join(", ", mappedAdminIds)}");

                if (mappedAdminIds.Count == 0)
                {
                    Console.WriteLine($"⚠️ Partner {partnerId} is not mapped to any admins - returning empty list");
                    return Ok(new List<ProductDto>());
                }

                var products = await _productRepository.GetByAdminIdsAsync(mappedAdminIds);
                var productsList = products.ToList();

                Console.WriteLine($"✅ Found {productsList.Count} products from mapped admins");

                var productDtos = productsList.Select(p => new ProductDto
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
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("buyers")]
        public async Task<IActionResult> GetBuyers()
        {
            try
            {
                var buyers = await _userRepository.GetAllByRoleAsync("Buyer");
                
                var buyerDtos = buyers.Select(b => new
                {
                    userId = b.UserId,
                    fullName = b.FullName,
                    email = b.Email,
                    companyName = b.CompanyName,
                    phoneNumber = b.PhoneNumber
                }).ToList();

                return Ok(buyerDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get buyers error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("buyers/search")]
        public async Task<IActionResult> SearchBuyers([FromQuery] string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                var buyer = await _userRepository.GetByEmailAsync(email);
                
                if (buyer == null || buyer.UserRole != "Buyer")
                {
                    return NotFound(new { message = "Buyer not found" });
                }

                return Ok(new
                {
                    userId = buyer.UserId,
                    fullName = buyer.FullName,
                    email = buyer.Email,
                    companyName = buyer.CompanyName
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Search buyer error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("products/{productId}/can-sell/{buyerId}")]
        public async Task<IActionResult> CanSellToBuyer(int productId, int buyerId)
        {
            try
            {
                var canSell = await _saleRepository.CanBuyerPurchaseAsync(buyerId, productId);
                return Ok(new { canSell });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Can sell check error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSales()
        {
            try
            {
                var partnerId = GetCurrentUserId();
                var sales = await _saleRepository.GetByPartnerIdAsync(partnerId);

                var saleDtos = sales.Select(s => new SaleDto
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
                    PaymentStatus = s.PaymentStatus,
                    LicenseKey = s.LicenseKey,
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
                Console.WriteLine($"💰 Creating sale - Partner: {partnerId}, Product: {saleDto.ProductId}, Buyer: {saleDto.BuyerId}");

                var product = await _productRepository.GetByIdAsync(saleDto.ProductId);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                var isMapped = await _mappingRepository.IsMappedAsync(product.AdminId, partnerId);
                if (!isMapped)
                {
                    Console.WriteLine($"❌ Partner {partnerId} not mapped to admin {product.AdminId}");
                    return Forbid();
                }

                var canPurchase = await _saleRepository.CanBuyerPurchaseAsync(saleDto.BuyerId, saleDto.ProductId);
                if (!canPurchase)
                {
                    return BadRequest(new { message = "This buyer has already purchased this product" });
                }

                var commissionAmount = product.Price * (product.CommissionPercentage / 100);
                var licenseKey = GenerateLicenseKey(product.ProductName);

                var sale = new Sale
                {
                    ProductId = saleDto.ProductId,
                    PartnerId = partnerId,
                    BuyerId = saleDto.BuyerId,
                    SaleAmount = product.Price,
                    CommissionAmount = commissionAmount,
                    SaleDate = DateTime.UtcNow,
                    PaymentStatus = "Pending",
                    LicenseKey = licenseKey,
                    Notes = saleDto.Notes
                };

                var createdSale = await _saleRepository.CreateAsync(sale);
                Console.WriteLine($"✅ Sale created: ID {createdSale.SaleId}, License: {licenseKey}");

                return Ok(new
                {
                    saleId = createdSale.SaleId,
                    licenseKey = createdSale.LicenseKey,
                    commissionAmount = createdSale.CommissionAmount,
                    message = "Sale created successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Create sale error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("my-admins")]
        public async Task<IActionResult> GetMyAdmins()
        {
            try
            {
                var partnerId = GetCurrentUserId();
                Console.WriteLine($"📋 Getting admins for Partner ID: {partnerId}");
                
                var mappings = await _context.AdminPartnerMappings
                    .Include(m => m.Admin)
                    .Include(m => m.Partner)
                    .Where(m => m.PartnerId == partnerId && m.IsActive)
                    .OrderByDescending(m => m.MappedAt)
                    .ToListAsync();

                Console.WriteLine($"✅ Found {mappings.Count} admin mappings");

                var adminDtos = mappings.Select(m => new
                {
                    mappingId = m.MappingId,
                    adminId = m.AdminId,
                    adminName = m.Admin?.FullName ?? "Unknown",
                    adminEmail = m.Admin?.Email ?? "",
                    adminCompany = m.Admin?.CompanyName,
                    mappedAt = m.MappedAt,
                    isActive = m.IsActive
                }).ToList();

                return Ok(adminDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get my admins error: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private string GenerateLicenseKey(string productName)
        {
            var prefix = productName.Length >= 3 
                ? productName.Substring(0, 3).ToUpper() 
                : "PRD";
            
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            
            return $"{prefix}-{timestamp.Substring(4, 8)}-{random}";
        }



        [HttpPut("sales/{id}/buyer-payment-status")]
public async Task<IActionResult> UpdateBuyerPaymentStatus(int id, [FromBody] UpdateBuyerPaymentStatusDto statusDto)
{
    try
    {
        var partnerId = GetCurrentUserId();
        Console.WriteLine($"📝 Partner {partnerId} updating sale {id} buyer payment status to {statusDto.BuyerPaymentStatus}");

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

        sale.BuyerPaymentStatus = statusDto.BuyerPaymentStatus;
        await _saleRepository.UpdateAsync(sale);

        Console.WriteLine($"✅ Sale {id} buyer payment status updated to {statusDto.BuyerPaymentStatus}");
        return Ok(new { message = "Buyer payment status updated successfully" });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Update buyer payment status error: {ex.Message}");
        Console.WriteLine($"Stack: {ex.StackTrace}");
        return StatusCode(500, new { message = ex.Message });
    }
}
    }
}