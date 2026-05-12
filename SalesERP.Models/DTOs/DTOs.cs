namespace SalesERP.Models.DTOs
{
    // ========================================
    // Authentication DTOs
    // ========================================
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int UserRole { get; set; } // 1=Admin, 2=Partner, 3=Buyer
        public string? CompanyName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AdminCode { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int UserRole { get; set; }
        public string? AdminCode { get; set; }
    }

    // ========================================
    // Product DTOs
    // ========================================
    public class ProductDto
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int CommissionPercentage { get; set; }
        public int AdminID { get; set; }
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

    // ========================================
    // Sale DTOs
    // ========================================
    public class SaleDto
    {
        public int SaleID { get; set; }
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int PartnerID { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public int BuyerID { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string BuyerEmail { get; set; } = string.Empty;
        public string? BuyerCompany { get; set; }
        public decimal SaleAmount { get; set; }
        public decimal CommissionAmount { get; set; }
        public DateTime SaleDate { get; set; }
        public string CommissionPaymentStatus { get; set; } = string.Empty;
        public string SalePaymentStatus { get; set; } = string.Empty;
        public string? LicenseKey { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateSaleDto
    {
        public int ProductID { get; set; }
        public string BuyerEmail { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdateCommissionPaymentStatusDto
    {
        public string CommissionPaymentStatus { get; set; } = string.Empty;
    }

    public class UpdateSalePaymentStatusDto
    {
        public string SalePaymentStatus { get; set; } = string.Empty;
    }

    

    // ========================================
    // Partner DTOs
    // ========================================
    public class AddPartnerDto
    {
        public string PartnerEmail { get; set; } = string.Empty;
    }

    public class BuyerDto
    {
        public int BuyerID { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? PhoneNumber { get; set; }
        public int TotalPurchases { get; set; }
        public decimal TotalAmountSpent { get; set; }
        public DateTime? LastPurchaseDate { get; set; }
    }
}