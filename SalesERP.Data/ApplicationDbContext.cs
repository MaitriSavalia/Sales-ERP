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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========================================
            // Users Table Configuration
            // ========================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserID);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.AdminCode);
                
                entity.Property(u => u.UserRole).IsRequired();
                
                entity.Property(u => u.AdminIDs)
                    .HasColumnType("VARCHAR(MAX)");
            });

            // ========================================
            // Products Table Configuration
            // ========================================
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.ProductID);
                
                entity.HasOne(p => p.Admin)
                    .WithMany(u => u.Products)
                    .HasForeignKey(p => p.AdminID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(p => p.Price)
                    .HasColumnType("decimal(18,2)");
            });

            // ========================================
            // Sales Table Configuration
            // ========================================
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(s => s.SaleID);

                entity.HasIndex(s => new { s.BuyerID, s.ProductID })
                    .IsUnique()
                    .HasDatabaseName("UQ_Buyer_Product");

                entity.HasOne(s => s.Product)
                    .WithMany(p => p.Sales)
                    .HasForeignKey(s => s.ProductID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Partner)
                    .WithMany(u => u.PartnerSales)
                    .HasForeignKey(s => s.PartnerID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Buyer)
                    .WithMany(u => u.BuyerSales)
                    .HasForeignKey(s => s.BuyerID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(s => s.SaleAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(s => s.CommissionAmount)
                    .HasColumnType("decimal(18,2)");
            });
        }
    }
}