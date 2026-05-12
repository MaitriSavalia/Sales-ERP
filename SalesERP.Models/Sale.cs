using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalesERP.Models
{
    public class Sale
    {
        [Key]
        public int SaleID { get; set; }

        [Required]
        public int ProductID { get; set; }

        [Required]
        public int PartnerID { get; set; }

        [Required]
        public int BuyerID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SaleAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CommissionAmount { get; set; }

        [Required]
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string CommissionPaymentStatus { get; set; } = "Pending";

        [Required]
        [MaxLength(20)]
        public string SalePaymentStatus { get; set; } = "Pending";

        [MaxLength(100)]
        public string? LicenseKey { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("ProductID")]
        public Product? Product { get; set; }

        [ForeignKey("PartnerID")]
        public User? Partner { get; set; }

        [ForeignKey("BuyerID")]
        public User? Buyer { get; set; }
    }
}