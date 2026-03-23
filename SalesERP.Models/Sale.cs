using System.ComponentModel.DataAnnotations;

namespace SalesERP.Models
{
    public class Sale
    {
        [Key]
        public int SaleId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int PartnerId { get; set; }

        [Required]
        public int BuyerId { get; set; }

        [Required]
        public decimal SaleAmount { get; set; }

        [Required]
        public decimal CommissionAmount { get; set; }

        [Required]
        public DateTime SaleDate { get; set; }

        // ✅ RENAMED: Was "PaymentStatus"
        [Required]
        [MaxLength(20)]
        public string CommissionPaymentStatus { get; set; } = "Pending";

        // ✅ RENAMED: Was "BuyerPaymentStatus"
        [Required]
        [MaxLength(20)]
        public string SalePaymentStatus { get; set; } = "Pending";

        [MaxLength(100)]
        public string? LicenseKey { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Product? Product { get; set; }
        public User? Partner { get; set; }
        public User? Buyer { get; set; }
    }
}