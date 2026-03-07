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
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly ISaleRepository _saleRepository;
        private readonly IUserRepository _userRepository;
        private readonly ApplicationDbContext _context;

        public AdminController(
            IProductRepository productRepository,
            ISaleRepository saleRepository,
            IUserRepository userRepository,
            ApplicationDbContext context)
        {
            _productRepository = productRepository;
            _saleRepository = saleRepository;
            _userRepository = userRepository;
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        // ========================================
        // DASHBOARD
        // ========================================

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"📊 Admin Dashboard - AdminId: {adminId}");

                var products = await _productRepository.GetByAdminIdAsync(adminId);
                var productsList = products.ToList();

                var allSales = await _saleRepository.GetAllAsync();
                var adminSales = allSales.Where(s => productsList.Any(p => p.ProductId == s.ProductId)).ToList();

                var activePartnerIds = adminSales.Select(s => s.PartnerId).Distinct().ToList();

                var stats = new AdminStatsDto
                {
                    TotalProducts = productsList.Count,
                    TotalSales = adminSales.Count,
                    TotalRevenue = adminSales.Sum(s => s.SaleAmount),
                    TotalCommissionPaid = adminSales.Where(s => s.PaymentStatus == "Completed").Sum(s => s.CommissionAmount),
                    ActivePartners = activePartnerIds.Count
                };

                Console.WriteLine($"✅ Dashboard: {stats.TotalProducts} products, {stats.TotalSales} sales");

                return Ok(stats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Dashboard error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ========================================
        // PRODUCTS
        // ========================================

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"📦 Getting products for Admin ID: {adminId}");

                var products = await _productRepository.GetByAdminIdAsync(adminId);
                var productsList = products.ToList();

                Console.WriteLine($"✅ Found {productsList.Count} products");

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
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"📦 Creating product for Admin ID: {adminId}");

                var product = new Product
                {
                    ProductName = productDto.ProductName,
                    Description = productDto.Description,
                    Price = productDto.Price,
                    CommissionPercentage = productDto.CommissionPercentage,
                    AdminId = adminId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdProduct = await _productRepository.CreateAsync(product);
                Console.WriteLine($"✅ Product created: ID {createdProduct.ProductId}");

                return Ok(new { message = "Product created successfully", productId = createdProduct.ProductId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Create product error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"📝 Updating product {id} for Admin ID: {adminId}");

                var product = await _productRepository.GetByIdAsync(id);

                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                if (product.AdminId != adminId)
                {
                    return Forbid();
                }

                product.ProductName = productDto.ProductName;
                product.Description = productDto.Description;
                product.Price = productDto.Price;
                product.CommissionPercentage = productDto.CommissionPercentage;
                product.IsActive = productDto.IsActive;
                product.UpdatedAt = DateTime.UtcNow;

                await _productRepository.UpdateAsync(product);
                Console.WriteLine($"✅ Product updated: ID {id}");

                return Ok(new { message = "Product updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Update product error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"🗑️ Deleting product {id} for Admin ID: {adminId}");

                var product = await _productRepository.GetByIdAsync(id);

                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                if (product.AdminId != adminId)
                {
                    return Forbid();
                }

                await _productRepository.DeleteAsync(id);
                Console.WriteLine($"✅ Product deleted: ID {id}");

                return Ok(new { message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Delete product error: {ex.Message}");
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
                var adminId = GetCurrentUserId();
                Console.WriteLine($"💰 Getting sales for Admin ID: {adminId}");

                var products = await _productRepository.GetByAdminIdAsync(adminId);
                var productIds = products.Select(p => p.ProductId).ToList();

                var allSales = await _saleRepository.GetAllAsync();
                var adminSales = allSales.Where(s => productIds.Contains(s.ProductId)).ToList();

                Console.WriteLine($"✅ Found {adminSales.Count} sales");

                var saleDtos = adminSales.Select(s => new SaleDto
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

        [HttpPut("sales/{id}/status")]
        public async Task<IActionResult> UpdateSaleStatus(int id, [FromBody] UpdateSaleStatusDto statusDto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"📝 Updating sale {id} status to {statusDto.PaymentStatus}");

                var sale = await _saleRepository.GetByIdAsync(id);

                if (sale == null)
                {
                    Console.WriteLine($"❌ Sale not found: {id}");
                    return NotFound(new { message = "Sale not found" });
                }

                var product = await _productRepository.GetByIdAsync(sale.ProductId);
                if (product == null || product.AdminId != adminId)
                {
                    Console.WriteLine($"❌ Admin {adminId} not authorized for sale {id}");
                    return Forbid();
                }

                sale.PaymentStatus = statusDto.PaymentStatus;
                await _saleRepository.UpdateAsync(sale);

                Console.WriteLine($"✅ Sale {id} status updated to {statusDto.PaymentStatus}");
                return Ok(new { message = "Sale status updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Update sale status error: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ========================================
        // PARTNER MANAGEMENT
        // ========================================

        [HttpGet("my-partners")]
        public async Task<IActionResult> GetMyPartners()
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"👥 Getting partners for Admin ID: {adminId}");

                var mappings = await _context.AdminPartnerMappings
                    .Include(m => m.Partner)
                    .Where(m => m.AdminId == adminId && m.IsActive)
                    .OrderByDescending(m => m.MappedAt)
                    .ToListAsync();

                Console.WriteLine($"✅ Found {mappings.Count} partners");

                var partnerDtos = mappings.Select(m => new
                {
                    mappingId = m.MappingId,
                    partnerId = m.PartnerId,
                    partnerName = m.Partner?.FullName ?? "Unknown",
                    partnerEmail = m.Partner?.Email ?? "",
                    partnerCompany = m.Partner?.CompanyName,
                    partnerPhone = m.Partner?.PhoneNumber,
                    mappedAt = m.MappedAt,
                    isActive = m.IsActive
                }).ToList();

                return Ok(partnerDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get partners error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("add-partner")]
        public async Task<IActionResult> AddPartner([FromBody] AddPartnerDto dto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"🤝 Admin {adminId} trying to add partner: {dto.PartnerEmail}");

                var partner = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.PartnerEmail && u.UserRole == "Partner");

                if (partner == null)
                {
                    Console.WriteLine($"❌ Partner not found: {dto.PartnerEmail}");
                    return NotFound(new { message = "Partner not found. Make sure they have registered as a Partner." });
                }

                Console.WriteLine($"✅ Found partner: {partner.FullName} (ID: {partner.UserId})");

                var existingMapping = await _context.AdminPartnerMappings
                    .FirstOrDefaultAsync(m => m.AdminId == adminId && m.PartnerId == partner.UserId);

                if (existingMapping != null)
                {
                    if (existingMapping.IsActive)
                    {
                        Console.WriteLine($"⚠️ Already mapped");
                        return BadRequest(new { message = "This partner is already in your network" });
                    }
                    else
                    {
                        existingMapping.IsActive = true;
                        existingMapping.MappedAt = DateTime.UtcNow;
                        _context.AdminPartnerMappings.Update(existingMapping);
                        await _context.SaveChangesAsync();

                        Console.WriteLine($"✅ Reactivated mapping");
                        return Ok(new
                        {
                            message = "Partner re-added to your network",
                            partnerName = partner.FullName,
                            partnerEmail = partner.Email
                        });
                    }
                }

                var newMapping = new AdminPartnerMapping
                {
                    AdminId = adminId,
                    PartnerId = partner.UserId,
                    MappedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.AdminPartnerMappings.Add(newMapping);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ New mapping created: Admin {adminId} → Partner {partner.UserId}");

                return Ok(new
                {
                    message = "Partner added successfully",
                    partnerName = partner.FullName,
                    partnerEmail = partner.Email,
                    partnerCompany = partner.CompanyName
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Add partner error: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return StatusCode(500, new { message = "Failed to add partner", error = ex.Message });
            }
        }

        [HttpDelete("remove-partner/{partnerId}")]
        public async Task<IActionResult> RemovePartner(int partnerId)
        {
            try
            {
                var adminId = GetCurrentUserId();
                Console.WriteLine($"🗑️ Admin {adminId} removing partner {partnerId}");

                var mapping = await _context.AdminPartnerMappings
                    .FirstOrDefaultAsync(m => m.AdminId == adminId && m.PartnerId == partnerId);

                if (mapping == null)
                {
                    return NotFound(new { message = "Partner mapping not found" });
                }

                mapping.IsActive = false;
                _context.AdminPartnerMappings.Update(mapping);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Partner removed (deactivated)");

                return Ok(new { message = "Partner removed from your network" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Remove partner error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("search-partners")]
        public async Task<IActionResult> SearchPartners([FromQuery] string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                var partners = await _context.Users
                    .Where(u => u.UserRole == "Partner" && u.Email.Contains(email))
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

                return Ok(partners);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Search partners error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("sales/{id}/buyer-payment-status")]
public async Task<IActionResult> UpdateBuyerPaymentStatus(int id, [FromBody] UpdateBuyerPaymentStatusDto statusDto)
{
    try
    {
        var adminId = GetCurrentUserId();
        Console.WriteLine($"📝 Updating sale {id} buyer payment status to {statusDto.BuyerPaymentStatus}");

        var sale = await _saleRepository.GetByIdAsync(id);

        if (sale == null)
        {
            Console.WriteLine($"❌ Sale not found: {id}");
            return NotFound(new { message = "Sale not found" });
        }

        var product = await _productRepository.GetByIdAsync(sale.ProductId);
        if (product == null || product.AdminId != adminId)
        {
            Console.WriteLine($"❌ Admin {adminId} not authorized for sale {id}");
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
