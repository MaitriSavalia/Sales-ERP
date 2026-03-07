using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SalesERP.Models
{
    public class AdminPartnerMapping
    {
        [Key]
        public int MappingId { get; set; }

        [Required]
        public int AdminId { get; set; }

        [Required]
        public int PartnerId { get; set; }

        [Required]
        public DateTime MappedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("AdminId")]
        public virtual User? Admin { get; set; }

        [ForeignKey("PartnerId")]
        public virtual User? Partner { get; set; }
    }
}