using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalesERP.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public int UserRole { get; set; } // 1=Admin, 2=Partner, 3=Buyer

        [MaxLength(100)]
        public string? CompanyName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [MaxLength(10)]
        public string? AdminCode { get; set; }

        public string? AdminIDs { get; set; } // VARCHAR(MAX)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<Product>? Products { get; set; }
        public ICollection<Sale>? PartnerSales { get; set; }
        public ICollection<Sale>? BuyerSales { get; set; }
    }
}