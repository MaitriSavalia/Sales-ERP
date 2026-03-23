using Microsoft.EntityFrameworkCore;
using SalesERP.Models;

namespace SalesERP.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        // ✅ REMOVED: public DbSet<AdminPartnerMapping> AdminPartnerMappings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Sale relationships
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(e => e.SaleId);

                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Sales_Products");

                entity.HasOne(e => e.Partner)
                    .WithMany()
                    .HasForeignKey(e => e.PartnerId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Sales_Partners");

                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Sales_Buyers");
            });

            // Configure Product relationships
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.ProductId);

                entity.HasOne(e => e.Admin)
                    .WithMany()
                    .HasForeignKey(e => e.AdminId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Products_Admins");
            });

            // ✅ REMOVED: All AdminPartnerMapping configuration

            // Configure User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.AdminCode).IsUnique();
            });

            // Indexes for performance
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.AdminId);

            modelBuilder.Entity<Sale>()
                .HasIndex(s => s.ProductId);

            modelBuilder.Entity<Sale>()
                .HasIndex(s => s.PartnerId);

            modelBuilder.Entity<Sale>()
                .HasIndex(s => s.BuyerId);

            // ✅ REMOVED: AdminPartnerMapping indexes
        }
    }
}