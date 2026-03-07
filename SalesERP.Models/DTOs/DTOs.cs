namespace SalesERP.Models.DTOs
{
    // ========== AUTH DTOs ==========
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? CompanyName { get; set; }
        public string? Address { get; set; }
    }

    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
    }

    // ========== PRODUCT DTOs ==========
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal CommissionPercentage { get; set; }
        public int AdminId { get; set; }
        public string? AdminName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal CommissionPercentage { get; set; }
    }

    public class UpdateProductDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal CommissionPercentage { get; set; }
        public bool IsActive { get; set; }
    }

    // ========== SALE DTOs ==========
    public class SaleDto
    {
        public int SaleId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public int BuyerId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string BuyerEmail { get; set; } = string.Empty;
        public string? BuyerCompany { get; set; }
        public decimal SaleAmount { get; set; }
        public decimal CommissionAmount { get; set; }
        public DateTime SaleDate { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string BuyerPaymentStatus { get; set; } = "Pending";
        public string LicenseKey { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class CreateSaleDto
    {
        public int ProductId { get; set; }
        public int BuyerId { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateSaleStatusDto
    {
        public string PaymentStatus { get; set; } = string.Empty;
    }

    public class UpdateBuyerPaymentStatusDto
    {
        public string BuyerPaymentStatus { get; set; } = string.Empty;
    }

    // ========== ADMIN DASHBOARD DTOs ==========
    public class AdminDashboardDto
    {
        public AdminStatsDto Stats { get; set; } = new();
        public List<ProductDto> Products { get; set; } = new();
        public List<PartnerPerformanceDto> Partners { get; set; } = new();
        public List<SaleDto> RecentSales { get; set; } = new();
    }

    public class AdminStatsDto
    {
        public int TotalProducts { get; set; }
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommissionPaid { get; set; }
        public int ActivePartners { get; set; }
    }

    public class PartnerPerformanceDto
    {
        public int PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public string PartnerEmail { get; set; } = string.Empty;
        public string? PartnerCompany { get; set; }
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCommission { get; set; }
    }

    // ========== ADMIN-PARTNER MAPPING DTOs ==========
    public class AddPartnerDto
    {
        public string PartnerEmail { get; set; } = string.Empty;
    }

    public class AdminPartnerMappingDto
    {
        public int MappingId { get; set; }
        public int AdminId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string? AdminCompany { get; set; }
        public int PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public string PartnerEmail { get; set; } = string.Empty;
        public string? PartnerCompany { get; set; }
        public DateTime MappedAt { get; set; }
        public bool IsActive { get; set; }
    }
}