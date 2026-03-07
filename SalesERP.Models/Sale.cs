using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        [Column(TypeName = "decimal(18,2)")]
        public decimal SaleAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CommissionAmount { get; set; }

        [Required]
        public DateTime SaleDate { get; set; }

        // Partner commission payment status (Pending/Completed/Cancelled)
        [Required]
        [MaxLength(50)]
        public string PaymentStatus { get; set; } = string.Empty;

        // Buyer payment status (Pending/Paid/Failed)
        [Required]
        [MaxLength(20)]
        public string BuyerPaymentStatus { get; set; } = "Pending";

        [Required]
        [MaxLength(100)]
        public string LicenseKey { get; set; } = string.Empty;

        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("PartnerId")]
        public virtual User? Partner { get; set; }

        [ForeignKey("BuyerId")]
        public virtual User? Buyer { get; set; }
    }
}